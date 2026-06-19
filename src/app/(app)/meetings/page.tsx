import { MeetingsAgenda } from "@/components/meetings/meetings-agenda";
import { meetings } from "@/lib/meetings";

export default function MeetingsPage() {
  return <MeetingsAgenda meetings={meetings} />;
}
