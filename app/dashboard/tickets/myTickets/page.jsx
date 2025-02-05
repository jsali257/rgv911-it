import Link from "next/link";
import styles from "@/app/ui/dashboard/tickets/tickets.module.css";
import Search from "@/app/ui/dashboard/search/search";
import { fetchMyTickets } from "@/app/lib/data";
import { deleteTicket, escalateTicket } from "@/app/lib/actions";
import DeleteButton from "@/app/ui/dashboard/deleteTicketButton/deleteTicketButton";
import EscalateButton from "@/app/ui/dashboard/escalateButton/escalateButton";
import { auth } from "@/app/auth";

const TicketsPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const { myTickets } = await fetchMyTickets(q);
  
  // Fetch session info to get the user's department
  const session = await auth();

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a ticket..." />
        <Link href="/dashboard/tickets/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Email</td>
            <td>Phone</td>
            <td>Department</td>
            <td>Issue</td>
            <td>Created At</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody>
          {myTickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.name}</td>
              <td>{ticket.email}</td>
              <td>{ticket.phone}</td>
              <td>{ticket.department}</td>
              <td>{ticket.issue}</td>
              <td>{ticket.createdAt?.toString().slice(4, 16)}</td>

              <td
                className={
                  ticket.status === "Open"
                    ? styles.statusOpen
                    : ticket.status === "Closed"
                    ? styles.statusClosed
                    : ticket.status === "On Hold"
                    ? styles.statusOnHold
                    : ticket.status === "Solved"
                    ? styles.statusSolved
                    : ""
                }
              >
                {ticket.status}
              </td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/tickets/${ticket.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form action={deleteTicket}>
                    <input type="hidden" name="id" value={ticket.id} />
                    <DeleteButton
                      ticketId={ticket.id}
                      deleteTicket={deleteTicket}
                      className={`${styles.button} ${styles.delete}`}
                    />
                  </form>

                  {/* Conditionally render the EscalateButton based on the user's department */}
                  {session.user.department === "LRGVDC" && (
                    <form action={escalateTicket}>
                      <input type="hidden" name="id" value={ticket._id} />
                      <EscalateButton
                        ticketId={ticket._id}
                        escalateTicket={escalateTicket}
                        className={`${styles.button} ${styles.escalate}`}
                      />
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsPage;