import { MdSupervisedUserCircle } from "react-icons/md";
import styles from "./cardTickets.module.css";
import { fetchTickets } from "@/app/lib/data";
const CardTickets = async () => {
  const { total, previousTotal } = await fetchTickets();

  // Calculate percentage change
  const percentageChange =
    previousTotal > 0
      ? (((total - previousTotal) / previousTotal) * 100).toFixed(2)
      : 0;
  return (
    <div className={styles.container}>
      <MdSupervisedUserCircle size={24} />
      <div className={styles.texts}>
        <span className={styles.title}>Total Tickets</span>
        <span className={styles.number}>{total}</span>
        <span className={styles.detail}>
          <span
            className={
              percentageChange >= 0 ? styles.positive : styles.negative
            }
          >
            {percentageChange}%
          </span>{" "}
          {percentageChange >= 0 ? "more" : "less"} than previous week
        </span>
      </div>
    </div>
  );
};

export default CardTickets;
