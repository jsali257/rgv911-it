"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTicket } from "@/app/lib/actions";
import Toast from "@/app/ui/dashboard/toast/toast";
import styles from "@/app/ui/dashboard/tickets/singleTicket/singleTicket.module.css";

const TicketFormWrapper = ({ children }) => {
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await updateTicket(formData);
      setShowToast(true);
      router.refresh();
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        {children}
      </form>

      {showToast && (
        <Toast
          message="Ticket updated successfully!"
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default TicketFormWrapper;
