import { v } from "convex/values";
import { query } from "./_generated/server";

const leadStatus = v.union(
  v.literal("New"),
  v.literal("Contacted"),
  v.literal("Qualified"),
  v.literal("Proposal"),
);

const clientStatus = v.union(
  v.literal("Active"),
  v.literal("Onboarding"),
  v.literal("Review due"),
);

export const listLeads = query({
  args: {
    status: v.optional(leadStatus),
  },
  handler: async (ctx, args) => {
    const status = args.status;
    if (status) {
      return await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(100);
    }

    return await ctx.db.query("leads").order("desc").take(100);
  },
});

export const listClients = query({
  args: {
    status: v.optional(clientStatus),
  },
  handler: async (ctx, args) => {
    const status = args.status;
    if (status) {
      return await ctx.db
        .query("clients")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(100);
    }

    return await ctx.db.query("clients").order("desc").take(100);
  },
});

export const getClientBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const listMeetings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("meetings").withIndex("by_start").take(100);
  },
});
