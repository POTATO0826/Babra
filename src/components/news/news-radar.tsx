"use client";

import { useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Check, Search } from "@/components/icons";
import { buttonClass } from "@/components/ui";

const ACCENT = "#B5832E";

// Fallback chips if the pool hasn't been categorized yet. Normally we show the
// real categories present in today's scraped news (see `suggestedTopics`).
const FALLBACK_TOPICS = [
  "Retirement & EPF",
  "Property market",
  "Taxes & savings",
  "Protecting your family",
];

const fieldClass =
  "meeting-glass-field w-full rounded-[12px] border border-white/65 bg-white/25 text-sm font-medium text-[#1F1B15] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_8px_20px_-18px_rgba(38,34,25,0.5)] backdrop-blur-xl transition focus:border-[#B5832E]/55 focus:bg-white/40 focus:ring-4 focus:ring-[#B5832E]/10 placeholder:font-normal placeholder:text-[#756C5C]";

type TopicResult = {
  articleUrl: string;
  headline: string;
  source: string;
  summary: string;
  whyRelevant: string;
  talkingPoints: string[];
  relevanceScore: number;
};

type TopicResponse = {
  scrapedFresh: boolean;
  poolSize: number;
  tailoredTo: string | null;
  results: TopicResult[];
};

type PersonOption = {
  value: string;
  label: string;
  group: "Clients" | "Leads";
};

export function NewsRadar() {
  const searchTopic = useAction(api.newsActions.searchTopic);
  const clients = useQuery(api.crm.listClients, {});
  const leads = useQuery(api.crm.listLeads, {});
  const suggestedTopics = useQuery(api.news.suggestedTopics, {});

  const hasLiveTopics = (suggestedTopics?.length ?? 0) >= 3;
  const topicChips = hasLiveTopics ? suggestedTopics! : FALLBACK_TOPICS;

  const [query, setQuery] = useState("");
  const [person, setPerson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<TopicResponse | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  const people: PersonOption[] = useMemo(() => {
    const c = (clients ?? []).map((x) => ({
      value: `client:${x._id}`,
      label: `${x.name} · ${x.occupation}`,
      group: "Clients" as const,
    }));
    const l = (leads ?? []).map((x) => ({
      value: `lead:${x._id}`,
      label: `${x.name} · ${x.occupation}`,
      group: "Leads" as const,
    }));
    return [...c, ...l];
  }, [clients, leads]);

  const runSearch = async (raw: string) => {
    const q = raw.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setLastQuery(q);

    const args: {
      query: string;
      clientId?: Id<"clients">;
      leadId?: Id<"leads">;
    } = { query: q };
    if (person.startsWith("client:")) {
      args.clientId = person.slice("client:".length) as Id<"clients">;
    } else if (person.startsWith("lead:")) {
      args.leadId = person.slice("lead:".length) as Id<"leads">;
    }

    try {
      const result = (await searchTopic(args)) as TopicResponse;
      setResponse(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-[940px] px-14 pb-24 pt-12">
      <header className="relative mb-7 overflow-hidden pb-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-[90px] h-[200px] w-[300px] opacity-60 blur-[34px]"
          style={{
            background:
              "radial-gradient(55% 70% at 70% 30%, rgba(181,131,46,0.26), transparent 70%), radial-gradient(45% 55% at 35% 60%, rgba(52,84,140,0.14), transparent 72%)",
          }}
        />
        <div className="relative">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">
            Sales intelligence
          </div>
          <h1 className="m-0 font-serif text-[40px] font-medium leading-none tracking-[-0.01em] text-[#231F17]">
            News Radar
          </h1>
          <p className="mt-3 max-w-[620px] text-[14.5px] leading-relaxed text-muted">
            Type a topic you want to bring up with a customer. The AI scans
            today&rsquo;s Sin Chew news and turns the best matches into
            ready-to-use conversation starters.
          </p>
        </div>
      </header>

      {/* Liquid-glass search console */}
      <div className="glass-card rounded-[20px] border p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 z-[2] h-[17px] w-[17px] -translate-y-1/2 text-[#8A7C57]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(query);
              }}
              placeholder="e.g. retirement planning, property prices, taxes…"
              className={`${fieldClass} py-[11px] pl-10 pr-3.5`}
            />
          </div>

          <select
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            className={`${fieldClass} px-3 py-[11px] sm:w-[230px]`}
          >
            <option value="">Tailor to… (optional)</option>
            <optgroup label="Clients">
              {people
                .filter((p) => p.group === "Clients")
                .map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Leads">
              {people
                .filter((p) => p.group === "Leads")
                .map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
            </optgroup>
          </select>

          <button
            type="button"
            onClick={() => runSearch(query)}
            disabled={loading || query.trim().length === 0}
            className={buttonClass("gold", "md")}
          >
            {loading ? (
              <>
                <Spinner /> Searching…
              </>
            ) : (
              "Find topics"
            )}
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-[11.5px] text-[#7A7059]">
            {hasLiveTopics ? "In today's news:" : "Try:"}
          </span>
          {topicChips.map((topic) => (
            <button
              key={topic}
              type="button"
              disabled={loading}
              onClick={() => {
                setQuery(topic);
                runSearch(topic);
              }}
              className="glass-row rounded-full border border-white/55 bg-white/20 px-3 py-1 text-[12px] text-[#5C5446] backdrop-blur-md transition-colors hover:text-ink disabled:opacity-50"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="mt-8">
        {loading ? (
          <GlassState
            title={`Researching “${lastQuery}”`}
            body="Scanning today's Sin Chew headlines and reading the full articles before writing talking points. This can take up to ~2 minutes."
            spinner
          />
        ) : error ? (
          <GlassState title="Search failed" body={error} />
        ) : !response ? (
          <GlassState
            title="What do you want to talk about?"
            body={
              hasLiveTopics
                ? "Tap one of today's topics above, or type your own. The AI finds related news and writes conversation starters for your clients and leads."
                : "Enter a topic above (or tap a suggestion). The AI finds related news and writes conversation starters you can use with clients and leads."
            }
          />
        ) : response.results.length === 0 ? (
          <GlassState
            title={`No current news matches “${lastQuery}”`}
            body="That topic isn't in today's Sin Chew headlines. Tip: tap one of the “In today's news” chips above — those always have fresh matches."
          />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-2 text-[13px] text-quiet">
              <span>
                {response.results.length} conversation{" "}
                {response.results.length === 1 ? "starter" : "starters"} for{" "}
                <span className="font-semibold text-muted">
                  &ldquo;{lastQuery}&rdquo;
                </span>
              </span>
              {response.tailoredTo && (
                <span
                  className="inline-flex items-center rounded-full border border-white/55 bg-white/25 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md"
                  style={{ color: ACCENT }}
                >
                  Tailored to {response.tailoredTo}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-5">
              {response.results.map((r, i) => (
                <ResultPanel
                  key={r.articleUrl + r.headline}
                  result={r}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ResultPanel({
  result,
  index,
}: {
  result: TopicResult;
  index: number;
}) {
  return (
    <article
      className="glass-card glass-interactive animate-fade-up rounded-[22px] border p-6 sm:p-7"
      style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-dim">
            <span>{result.source}</span>
            <span className="text-[#C9BFA6]">·</span>
            <span style={{ color: ACCENT }}>
              {result.relevanceScore}% match
            </span>
          </div>
          <a
            href={result.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif text-[23px] font-medium leading-tight text-[#211D16] underline-offset-4 hover:underline"
          >
            {result.headline}
          </a>
        </div>
        <MatchRing score={result.relevanceScore} />
      </div>

      <p className="mt-3.5 max-w-[68ch] text-[14px] leading-relaxed text-muted">
        {result.summary}
      </p>

      <div
        className="mt-4 rounded-[12px] border-l-2 py-1.5 pl-3.5 pr-2"
        style={{ borderColor: ACCENT }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dim">
          How it connects&nbsp;&nbsp;
        </span>
        <span className="text-[13.5px] leading-relaxed text-ink-soft">
          {result.whyRelevant}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-dim">
          Talking points · tap to copy
        </div>
        <div className="flex flex-col gap-1.5">
          {result.talkingPoints.map((point, i) => (
            <TalkingPoint key={i} text={point} />
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/45 pt-3">
        <span className="text-[11px] text-quiet">Source: {result.source}</span>
        <a
          href={result.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11.5px] font-semibold"
          style={{ color: ACCENT }}
        >
          Read full article →
        </a>
      </div>
    </article>
  );
}

function TalkingPoint({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard not available; ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      title="Click to copy"
      className="glass-row group flex items-start gap-2.5 rounded-[12px] border border-white/45 bg-white/15 px-3.5 py-2.5 text-left backdrop-blur-md"
    >
      <span
        className="mt-[2px] flex-none font-serif text-[20px] leading-none"
        style={{ color: ACCENT }}
        aria-hidden
      >
        &ldquo;
      </span>
      <span className="flex-1 text-[13.5px] leading-relaxed text-ink-soft">
        {text}
      </span>
      <span className="mt-0.5 flex-none text-[10.5px] font-semibold text-ghost opacity-0 transition-opacity group-hover:opacity-100">
        {copied ? (
          <span
            className="inline-flex items-center gap-1"
            style={{ color: ACCENT }}
          >
            <Check className="h-3 w-3" /> Copied
          </span>
        ) : (
          "Copy"
        )}
      </span>
    </button>
  );
}

function MatchRing({ score }: { score: number }) {
  const angle = Math.max(0, Math.min(100, score)) * 3.6;
  return (
    <div
      className="relative flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${ACCENT} ${angle}deg, rgba(120,108,86,0.18) ${angle}deg)`,
      }}
      title="Topic match score"
      aria-hidden
    >
      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f7f3ea] text-[13px] font-semibold tabular-nums text-[#3a342a]">
        {score}
      </div>
    </div>
  );
}

function GlassState({
  title,
  body,
  spinner = false,
}: {
  title: string;
  body: string;
  spinner?: boolean;
}) {
  return (
    <div className="glass-card flex flex-col items-center rounded-[22px] border px-6 py-16 text-center">
      {spinner && (
        <span
          className="mb-4 inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#B5832E] border-t-transparent"
          aria-hidden
        />
      )}
      <div className="mb-2 font-serif text-[22px] text-ink-soft">{title}</div>
      <div className="mx-auto max-w-[460px] text-sm leading-relaxed text-muted">
        {body}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-[14px] w-[14px] animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}
