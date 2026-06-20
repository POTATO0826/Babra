"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { LeadsBoard } from "@/components/leads/leads-board";
import type { Lead } from "@/lib/leads";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";

export default function LeadsPage() {
  const convexLeads = useQuery(api.crm.listLeads, {});
  const leads = useMemo(
    () => (convexLeads ?? []).map(mapLead),
    [convexLeads],
  );

  return <LeadsBoard leads={leads} isLoading={convexLeads === undefined} />;
}

function mapLead(lead: Doc<"leads">): Lead {
  return {
    id: lead._id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    location: lead.location,
    occupation: lead.occupation,
    age: lead.age,
    status: lead.status,
    serviceInterest: lead.serviceInterest,
    source: lead.source,
    addedDate: lead.addedDate,
    lastContact: lead.lastContact,
    estimatedPortfolio: lead.estimatedPortfolio,
    situationTeaser: lead.situationTeaser,
    situation: lead.situation,
    whyApproached: lead.whyApproached,
    notes: lead.notes,
    timeline: lead.timeline,
  };
}
