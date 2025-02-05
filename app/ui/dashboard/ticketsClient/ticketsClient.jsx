"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/app/ui/dashboard/tickets/tickets.module.css";
import Search from "@/app/ui/dashboard/search/search";
import DeleteButton from "@/app/ui/dashboard/deleteTicketButton/deleteTicketButton";

const TicketsClient = ({ initialTickets, query }) => {
  const [tickets, setTickets] = useState(initialTickets);

  // Fetch tickets from the API
  const fetchTickets = async (query) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const { tickets } = await response.json();
      return tickets;
    } catch (err) {
      console.error("Error fetching tickets:", err);
      return [];
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshedTickets = await fetchTickets(query);
      setTickets(refreshedTickets);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [query]);

  return (
    <div>
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
          {tickets.map((ticket) => (
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
                  <Link href={`/dashboard/tickets/${ticket._id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form action="/api/deleteTicket" method="POST">
                    <input type="hidden" name="id" value={ticket.id} />
                    <DeleteButton
                      className={`${styles.button} ${styles.delete}`}
                    />
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsClient;
