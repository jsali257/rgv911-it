"use client";


import AddTicketModal from "./AddTicketModal";

const AddTicketModalWrapper = ({ isOpen, onClose, user }) => {
  return (
    <AddTicketModal 
      isOpen={isOpen}
      onClose={onClose}
      user={user}
    />
  );
};

export default AddTicketModalWrapper;
