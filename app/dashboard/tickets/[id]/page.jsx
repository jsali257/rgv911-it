import { fetchTicket, fetchReply, fetchUsers } from "@/app/lib/data";
import styles from "@/app/ui/dashboard/tickets/singleTicket/singleTicket.module.css";
import TimeDisplay from "@/app/ui/dashboard/tickets/timeDisplay/timeDisplay";
import AddReply from "@/app/ui/dashboard/comments/comments";
import { auth } from "@/app/auth";
import UpdateTicketForm from "@/app/ui/dashboard/tickets/updateTicketForm";
import AttachmentsList from "@/app/ui/dashboard/tickets/attachments/attachments";
import DeleteReply from "@/app/ui/dashboard/comments/deleteReply";
import ImageViewer from "@/app/ui/dashboard/imageViewer/imageViewer";
import TicketTabs from "@/app/ui/dashboard/tickets/ticketTabs/ticketTabs";

const SingleTicketPage = async ({ params }) => {
  const { id } = params;
  const ticket = await fetchTicket(id);
  const replies = await fetchReply(id);
  const usersData = await fetchUsers("");
  const session = await auth();

  // Check if the user is from LRGVDC
  const isLRGVDC = session?.user?.department === "LRGVDC";

  // Sort replies in descending order by creation date
  const sortedReplies = [...replies].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        {/* <TimeDisplay ticket={ticket} />
        <h3>Ticket Created By: {ticket.user?.username || "No Created User found!"}</h3> */}
        <br />
        
        <TicketTabs 
          ticket={ticket}
          users={usersData.users}
          isLRGVDC={isLRGVDC}
          session={session}
          replies={sortedReplies}
        />
      </div>
    </div>
  );
};

export default SingleTicketPage;