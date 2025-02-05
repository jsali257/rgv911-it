"use client";

import React from "react";
import Modal from "../../modal/Modal";
import AddTicketForm from "./addTicketForm";
import styles from "./addTicket.module.css";

const AddTicketModal = ({ isOpen, onClose, user }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContainer}>
        <div className={styles.pageHeader}>
          <h1>Create Support Ticket</h1>
          <p className={styles.subtitle}>
            Fill out the form below to submit a new support request
          </p>
        </div>

        <div className={styles.formContainer}>
          <AddTicketForm user={user} onSuccess={onClose} onCancel={onClose} />
        </div>
      </div>
    </Modal>
  );
};

export default AddTicketModal;
