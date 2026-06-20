import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";

const now = () => new Date().toISOString();

// How many clients / leads we research per refresh. Keeps run time and KIMI
// usage bounded; raise once the feature is proven.
const MAX_CLIENTS = 8;
const MAX_LEADS = 8;

const newsTargetType = v.union(v.literal("Client"), v.literal("Lead"));

// ---------------------------------------------------------------------------
// Public queries (used by the News Radar page)
// ---------------------------------------------------------------------------

export const latestRun = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("newsRuns").order("desc").first();
  },
});

export const listSuggestions = query({
  args: { targetType: v.optional(newsTargetType) },
  handler: async (ctx, args) => {
    if (args.targetType) {
      return await ctx.db
        .query("topicSuggestions")
        .withIndex("by_target_type", (q) =>
          q.eq("targetType", args.targetType!),
        )
        .order("desc")
        .take(300);
    }
    return await ctx.db.query("topicSuggestions").order("desc").take(300);
  },
});

export const listArticles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("newsArticles").order("desc").take(60);
  },
});

// Topic chips derived from what's actually in today's scraped news, so every
// suggested chip is guaranteed to return results.
export const suggestedTopics = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("newsArticles").order("desc").take(40);
    const counts = new Map<string, number>();
    for (const row of rows) {
      const category = row.category?.trim();
      if (!category || !row.englishTitle) continue;
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label]) => label);
  },
});

// ---------------------------------------------------------------------------
// Public trigger
// ---------------------------------------------------------------------------

export const refreshNews = mutation({
  args: {},
  handler: async (ctx): Promise<{ runId: string; alreadyRunning: boolean }> => {
    const running = await ctx.db
      .query("newsRuns")
      .withIndex("by_status", (q) => q.eq("status", "Running"))
      .first();
    if (running) {
      return { runId: running._id, alreadyRunning: true };
    }

    const runId = await ctx.db.insert("newsRuns", {
      status: "Running",
      startedAt: now(),
    });

    await ctx.scheduler.runAfter(0, internal.newsActions.runNewsResearch, {
      runId,
    });

    return { runId, alreadyRunning: false };
  },
});

// ---------------------------------------------------------------------------
// Internal: research inputs (clients + leads to match news against)
// ---------------------------------------------------------------------------

export const getResearchInputs = internalQuery({
  args: {},
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").order("desc").take(MAX_CLIENTS);
    const leads = await ctx.db.query("leads").order("desc").take(MAX_LEADS);

    return {
      clients: clients.map((c) => ({
        id: c._id,
        slug: c.slug,
        name: c.name,
        occupation: c.occupation,
        location: c.location,
        serviceTopics: c.serviceTopics,
        goals: c.goals.map((g) => g.name),
        riskTolerance: c.riskTolerance,
        situation: c.situation,
      })),
      leads: leads.map((l) => ({
        id: l._id,
        name: l.name,
        occupation: l.occupation,
        location: l.location,
        serviceInterest: l.serviceInterest,
        situation: l.situation,
        whyApproached: l.whyApproached,
      })),
    };
  },
});

// ---------------------------------------------------------------------------
// Internal: topic-search inputs
// ---------------------------------------------------------------------------

export const getArticlePool = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("newsArticles").order("desc").take(40);
    return rows.map((a) => ({
      id: a._id,
      url: a.url,
      title: a.title,
      englishTitle: a.englishTitle,
      category: a.category,
      bodyText: a.bodyText,
      scrapedAt: a.scrapedAt ?? a.createdAt,
    }));
  },
});

export const getPersonProfile = internalQuery({
  args: {
    clientId: v.optional(v.id("clients")),
    leadId: v.optional(v.id("leads")),
  },
  handler: async (ctx, args) => {
    if (args.clientId) {
      const c = await ctx.db.get(args.clientId);
      if (!c) return null;
      return {
        kind: "Client" as const,
        name: c.name,
        occupation: c.occupation,
        profileText: [
          `Name: ${c.name}`,
          `Occupation: ${c.occupation}`,
          `Location: ${c.location}`,
          `Service topics: ${c.serviceTopics.join(", ") || "n/a"}`,
          `Goals: ${c.goals.map((g) => g.name).join(", ") || "n/a"}`,
          `Risk tolerance: ${c.riskTolerance}`,
          `Situation: ${c.situation}`,
        ].join("\n"),
      };
    }
    if (args.leadId) {
      const l = await ctx.db.get(args.leadId);
      if (!l) return null;
      return {
        kind: "Lead" as const,
        name: l.name,
        occupation: l.occupation,
        profileText: [
          `Name: ${l.name}`,
          `Occupation: ${l.occupation}`,
          `Location: ${l.location}`,
          `Service interest: ${l.serviceInterest}`,
          `Situation: ${l.situation}`,
          `Why approached: ${l.whyApproached}`,
        ].join("\n"),
      };
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Internal: article persistence (upsert by url, cache enrichment + body)
// ---------------------------------------------------------------------------

export const saveArticles = internalMutation({
  args: {
    articles: v.array(
      v.object({
        url: v.string(),
        title: v.string(),
        source: v.string(),
        scrapedAt: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const saved: Array<{
      id: string;
      url: string;
      title: string;
      englishTitle?: string;
      category?: string;
      summary?: string;
      bodyText?: string;
    }> = [];

    for (const article of args.articles) {
      const existing = await ctx.db
        .query("newsArticles")
        .withIndex("by_url", (q) => q.eq("url", article.url))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: article.title,
          source: article.source,
          scrapedAt: article.scrapedAt ?? existing.scrapedAt,
          updatedAt: now(),
        });
        saved.push({
          id: existing._id,
          url: existing.url,
          title: article.title,
          englishTitle: existing.englishTitle,
          category: existing.category,
          summary: existing.summary,
          bodyText: existing.bodyText,
        });
        continue;
      }

      const id = await ctx.db.insert("newsArticles", {
        url: article.url,
        title: article.title,
        source: article.source,
        scrapedAt: article.scrapedAt,
        createdAt: now(),
        updatedAt: now(),
      });
      saved.push({ id, url: article.url, title: article.title });
    }

    return saved;
  },
});

export const updateArticleTranslations = internalMutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("newsArticles"),
        englishTitle: v.string(),
        category: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.patch(item.id, {
        englishTitle: item.englishTitle,
        category: item.category,
        updatedAt: now(),
      });
    }
    return null;
  },
});

export const cacheArticleBody = internalMutation({
  args: {
    id: v.id("newsArticles"),
    bodyText: v.string(),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      bodyText: args.bodyText,
      summary: args.summary,
      fetchedAt: now(),
      updatedAt: now(),
    });
    return null;
  },
});

// ---------------------------------------------------------------------------
// Internal: suggestions (clear previous run, insert fresh)
// ---------------------------------------------------------------------------

export const clearSuggestions = internalMutation({
  args: {},
  handler: async (ctx) => {
    let deleted = 0;
    // Delete in bounded batches to stay within transaction limits.
    while (deleted < 1000) {
      const batch = await ctx.db.query("topicSuggestions").take(100);
      if (batch.length === 0) break;
      for (const row of batch) {
        await ctx.db.delete(row._id);
        deleted += 1;
      }
    }
    return deleted;
  },
});

export const insertSuggestions = internalMutation({
  args: {
    runId: v.id("newsRuns"),
    suggestions: v.array(
      v.object({
        targetType: newsTargetType,
        clientId: v.optional(v.id("clients")),
        leadId: v.optional(v.id("leads")),
        targetName: v.string(),
        targetSlug: v.optional(v.string()),
        targetOccupation: v.optional(v.string()),
        articleUrl: v.string(),
        headline: v.string(),
        source: v.string(),
        summary: v.string(),
        whyRelevant: v.string(),
        talkingPoints: v.array(v.string()),
        relevanceScore: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const s of args.suggestions) {
      await ctx.db.insert("topicSuggestions", {
        runId: args.runId,
        createdAt: now(),
        ...s,
      });
    }
    return args.suggestions.length;
  },
});

// ---------------------------------------------------------------------------
// Internal: run lifecycle
// ---------------------------------------------------------------------------

export const completeRun = internalMutation({
  args: {
    runId: v.id("newsRuns"),
    articlesFetched: v.number(),
    suggestionsCreated: v.number(),
    peopleConsidered: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: "Completed",
      completedAt: now(),
      articlesFetched: args.articlesFetched,
      suggestionsCreated: args.suggestionsCreated,
      peopleConsidered: args.peopleConsidered,
    });
    return null;
  },
});

export const failRun = internalMutation({
  args: { runId: v.id("newsRuns"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: "Failed",
      completedAt: now(),
      error: args.error,
    });
    return null;
  },
});
