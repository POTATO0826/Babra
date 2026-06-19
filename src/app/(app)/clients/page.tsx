import { ClientDirectory } from "@/components/clients/client-directory";
import { clients } from "@/lib/clients";

export default function ClientsPage() {
  return <ClientDirectory clients={clients} />;
}
