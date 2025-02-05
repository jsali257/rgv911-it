import styles from "@/app/ui/dashboard/tickets/tickets.module.css";
import { fetchMyTickets, fetchTickets } from "@/app/lib/data";
import TicketList from "@/app/ui/dashboard/ticketList/ticketList";
import { auth } from "@/app/auth";
import AutoRefresh from "@/app/ui/dashboard/tickets/autoRefresh";

const TicketsPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const ticketLimit = 1000;
  const { myTickets } = await fetchMyTickets(q, ticketLimit);
  const { tickets: allTickets } = await fetchTickets(q);
  const session = await auth();
  const user = session?.user;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>Tickets</h1>
        <p className={styles.subtitle}>Manage and track all support tickets</p>
      </div>
      <div className={styles.contentContainer}>
        <AutoRefresh />
        <TicketList tickets={myTickets} allTickets={allTickets} user={user} />
      </div>
    </div>
  );
};

export default TicketsPage;