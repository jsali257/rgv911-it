import styles from "@/app/ui/dashboard/pubEdEvents/pubEdEvents.module.css";
import AddEventForm from "@/app/ui/dashboard/pubEdEvents/addEventForm";

const AddEventPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.info}>
          <h1>Add New Public Education Event</h1>
        </div>
      </div>
      
      <div className={styles.content}>
        <div>
          <AddEventForm />
        </div>
      </div>
    </div>
  );
};

export default AddEventPage;
