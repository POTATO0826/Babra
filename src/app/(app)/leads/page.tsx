import { LeadsBoard } from "@/components/leads/leads-board";
import { leads } from "@/lib/leads";

export default function LeadsPage() {
  return <LeadsBoard leads={leads} />;
}
