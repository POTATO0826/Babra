import type { ServiceInterest } from "./leads";

export type MeetingMode = "Video" | "Phone" | "In-person";

export type MeetingStatus = "Confirmed" | "Tentative" | "Completed" | "Canceled";

export type Meeting = {
  id: string;
  title: string;
  /** Person the meeting is with (matches a lead/client name). */
  attendee: string;
  attendeeRole: string;
  start: string; // ISO datetime
  durationMinutes: number;
  mode: MeetingMode;
  /** Address, dial-in, or video link depending on mode. */
  location: string;
  status: MeetingStatus;
  topic: ServiceInterest;
  /** One-line purpose of the meeting. */
  purpose: string;
  /** Prep / agenda bullet points. */
  agenda: string[];
};

/**
 * Build an ISO datetime relative to the start of today, so the agenda always
 * has meetings around "now" regardless of when the demo is opened.
 */
function at(dayOffset: number, hour: number, minute: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const meetings: Meeting[] = [
  // Today
  {
    id: "mt-001",
    title: "Intro call",
    attendee: "Priya Nair",
    attendeeRole: "Pediatric Surgeon",
    start: at(0, 9, 0),
    durationMinutes: 30,
    mode: "Video",
    location: "Google Meet",
    status: "Confirmed",
    topic: "Investment Management",
    purpose: "First conversation to understand goals and idle-cash situation.",
    agenda: [
      "Understand income, cash position, and time horizon",
      "Explain managed-portfolio approach and fees",
      "Outline onboarding steps if she's a fit",
    ],
  },
  {
    id: "mt-002",
    title: "Portfolio review",
    attendee: "Marcus Chen",
    attendeeRole: "Software Engineering Manager",
    start: at(0, 14, 30),
    durationMinutes: 60,
    mode: "In-person",
    location: "Downtown Office · Conference Room B",
    status: "Confirmed",
    topic: "Retirement Planning",
    purpose: "Review early-retirement roadmap and concentrated stock exposure.",
    agenda: [
      "Walk through retirement questionnaire results",
      "Discuss diversifying out of employer RSUs tax-efficiently",
      "Model a retire-by-55 scenario",
    ],
  },
  // Tomorrow
  {
    id: "mt-003",
    title: "Estate planning session",
    attendee: "Robert & Linda Alvarez",
    attendeeRole: "Small Business Owners",
    start: at(1, 11, 0),
    durationMinutes: 90,
    mode: "Phone",
    location: "(602) 555-0119",
    status: "Confirmed",
    topic: "Estate Planning",
    purpose: "Structure proceeds from the business sale and review estate goals.",
    agenda: [
      "Review proposal feedback",
      "Discuss trust structures for the grandchildren",
      "Coordinate timing with the Q3 business-sale close",
    ],
  },
  {
    id: "mt-004",
    title: "529 plan walkthrough",
    attendee: "Jasmine Okoye",
    attendeeRole: "Marketing Director",
    start: at(1, 16, 0),
    durationMinutes: 45,
    mode: "Video",
    location: "Zoom",
    status: "Tentative",
    topic: "College Savings",
    purpose: "Walk through 529 options and a holistic plan for a new parent.",
    agenda: [
      "Compare 529 plans and contribution strategies",
      "Balance education savings against retirement",
      "Review fee transparency",
    ],
  },
  // Later this week
  {
    id: "mt-005",
    title: "Tax strategy discussion",
    attendee: "Tom Bradley",
    attendeeRole: "Airline Pilot",
    start: at(3, 10, 0),
    durationMinutes: 45,
    mode: "Video",
    location: "Google Meet",
    status: "Confirmed",
    topic: "Tax Strategy",
    purpose: "Review multi-state tax exposure and coordinate pension planning.",
    agenda: [
      "Review last two years of returns",
      "Identify tax-loss harvesting opportunities",
      "Discuss multi-state filing considerations",
    ],
  },
  {
    id: "mt-006",
    title: "Income plan review",
    attendee: "Eleanor Whitfield",
    attendeeRole: "Retired Professor",
    start: at(4, 13, 0),
    durationMinutes: 60,
    mode: "In-person",
    location: "Client's home · Boston, MA",
    status: "Confirmed",
    topic: "Retirement Planning",
    purpose: "Review the retirement income proposal with Eleanor and her daughter.",
    agenda: [
      "Walk through proposed income plan",
      "Explain required minimum distributions",
      "Answer the family's questions",
    ],
  },
  // Past
  {
    id: "mt-007",
    title: "Discovery meeting",
    attendee: "Robert & Linda Alvarez",
    attendeeRole: "Small Business Owners",
    start: at(-2, 15, 0),
    durationMinutes: 60,
    mode: "In-person",
    location: "Downtown Office · Conference Room A",
    status: "Completed",
    topic: "Estate Planning",
    purpose: "Initial discovery of estate goals and business-sale timeline.",
    agenda: [
      "Gather family and asset details",
      "Clarify legacy goals",
      "Set expectations for the proposal",
    ],
  },
  {
    id: "mt-008",
    title: "Intro call",
    attendee: "David Kim",
    attendeeRole: "Product Designer",
    start: at(-4, 11, 30),
    durationMinutes: 30,
    mode: "Video",
    location: "Google Meet",
    status: "Completed",
    topic: "Investment Management",
    purpose: "Introduce investing basics beyond his 401(k).",
    agenda: [
      "Understand saving habits and goals",
      "Explain diversified portfolio basics",
      "Share educational resources",
    ],
  },
  {
    id: "mt-009",
    title: "Follow-up call",
    attendee: "Tom Bradley",
    attendeeRole: "Airline Pilot",
    start: at(-5, 9, 30),
    durationMinutes: 30,
    mode: "Phone",
    location: "(720) 555-0103",
    status: "Canceled",
    topic: "Tax Strategy",
    purpose: "Follow up on shared tax documents (rescheduled by client).",
    agenda: ["Confirm receipt of returns", "Schedule deeper tax review"],
  },
];
