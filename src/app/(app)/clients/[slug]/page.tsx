import Link from "next/link";
import { notFound } from "next/navigation";
import { clients, getClient, CLIENT_STATUS_STYLES } from "@/lib/clients";
import { meetings } from "@/lib/meetings";
import {
  MODE_STYLES,
  avatarGradient,
  formatCurrency,
  formatDate,
  formatDayLabel,
  formatTime,
  initials,
} from "@/lib/format";
import { AllocationBar } from "@/components/clients/allocation-bar";
import { ModeIcon } from "@/components/meetings/mode-icon";

export function generateStaticParams() {
  return clients.map((c) => ({ slug: c.slug }));
}

export default async function ClientProfilePage(
  props: PageProps<"/clients/[slug]">
) {
  const { slug } = await props.params;
  const client = getClient(slug);
  if (!client) notFound();

  const clientMeetings = meetings
    .filter((m) => m.attendee === client.name)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to clients
      </Link>

      {/* Header */}
      <header className="mt-4 flex flex-wrap items-start justify-between gap-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl font-semibold text-white ${avatarGradient(
              client.name
            )}`}
          >
            {initials(client.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {client.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  CLIENT_STATUS_STYLES[client.status]
                }`}
              >
                {client.status}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {client.occupation} · {client.age} · {client.location}
            </p>
          </div>
        </div>

        <dl className="flex gap-8">
          <Stat label="AUM" value={formatCurrency(client.aum)} />
          <Stat label="Net worth" value={formatCurrency(client.netWorth)} />
          <Stat label="Client since" value={formatDate(client.clientSince)} />
        </dl>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Situation">
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {client.description}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {client.situation}
            </p>
          </Card>

          <Card title="Why they approached us">
            <p className="rounded-lg border-l-2 border-indigo-400 bg-indigo-50/60 p-3 text-sm leading-relaxed text-zinc-700 dark:bg-indigo-500/10 dark:text-zinc-300">
              {client.whyApproached}
            </p>
          </Card>

          <Card title="Goals">
            <ul className="space-y-4">
              {client.goals.map((goal) => (
                <li key={goal.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {goal.name}
                    </p>
                    {goal.progress !== undefined && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {goal.progress}%
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {goal.detail}
                  </p>
                  {goal.progress !== undefined && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Portfolio">
            <AllocationBar allocation={client.allocation} />
            <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              {client.accounts.map((account) => (
                <div
                  key={`${account.type}-${account.institution}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {account.type}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {" "}
                      · {account.institution}
                    </span>
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Relationship">
            <dl className="space-y-3 text-sm">
              <Row label="Advisor" value={client.advisor} />
              <Row label="Review cadence" value={client.cadence} />
              <Row label="Next review" value={formatDate(client.nextReview)} />
              <Row label="Risk tolerance" value={client.riskTolerance} />
              <Row label="Time horizon" value={client.timeHorizon} />
            </dl>
          </Card>

          <Card title="Household">
            <dl className="space-y-3 text-sm">
              <Row label="Spouse / partner" value={client.spouse ?? "—"} />
              {client.dependents.length > 0 ? (
                client.dependents.map((d) => (
                  <Row key={d.name} label={d.relation} value={d.name} />
                ))
              ) : (
                <Row label="Dependents" value="None" />
              )}
            </dl>
          </Card>

          <Card title="Contact">
            <ul className="space-y-1.5 text-sm">
              <li>
                <a
                  href={`mailto:${client.email}`}
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {client.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${client.phone.replace(/[^\d+]/g, "")}`}
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {client.phone}
                </a>
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {client.serviceTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </Card>

          <Card title="Meetings">
            {clientMeetings.length > 0 ? (
              <ul className="space-y-3">
                {clientMeetings.slice(0, 4).map((m) => (
                  <li key={m.id} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${
                        MODE_STYLES[m.mode]
                      }`}
                    >
                      <ModeIcon mode={m.mode} className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {m.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDayLabel(m.start)} · {formatTime(m.start)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No meetings on record.
              </p>
            )}
            <Link
              href="/meetings"
              className="mt-3 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all meetings →
            </Link>
          </Card>

          <Card title="Notes">
            <ul className="space-y-2">
              {client.notes.map((note, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                  {note}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </dd>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}
