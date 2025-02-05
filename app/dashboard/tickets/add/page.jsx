import { auth } from "@/app/auth";
import AddTicketForm from "@/app/ui/dashboard/tickets/addTicket/addTicketForm";
import styles from "@/app/ui/dashboard/tickets/addTicket/addTicket.module.css";

const AddTicketPage = async () => {
  const session = await auth();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>Create New Support Ticket</h1>
        <p className={styles.subtitle}>Submit a new support request</p>
      </div>
      
      <div className={styles.formContainer}>
        <AddTicketForm session={session} />
      </div>
    </div>
  );
};

export default AddTicketPage;
