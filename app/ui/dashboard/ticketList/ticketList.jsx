"use client";

import React, { useState, useEffect } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop } from 'react-dnd';
import { BsGrid, BsListUl } from "react-icons/bs";
import Select from "react-select";
import styles from "./ticketList.module.css";
import Search from "@/app/ui/dashboard/search/search";
import { deleteTicket } from "@/app/lib/actions";
import DeleteButton from "../deleteTicketButton/deleteTicketButton";
import EscalateButton from "../escalateButton/escalateButton";
import { escalateTicket, updateTicketStatus } from "@/app/lib/actions";
import TicketCard from "./ticketCard";
import AddTicketModalWrapper from "../tickets/addTicket/AddTicketModalWrapper";
import { ItemTypes } from './ItemTypes';

const STORAGE_KEY = "ticketViewPreferences";

const defaultPreferences = {
  viewMode: "card",
  showAllTickets: false,
  statusFilter: null,
  departmentFilter: null,
};

const TicketList = ({ tickets, allTickets, user }) => {
  // Initialize with default preferences to avoid hydration mismatch
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isClient, setIsClient] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isLRGVDCUser = user?.department === "LRGVDC";

  // Only run on client-side after initial render
  useEffect(() => {
    setIsClient(true);

    try {
      const savedPreferences = localStorage.getItem(STORAGE_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

  // Save preferences whenever they change, but only on client-side
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    }
  }, [preferences, isClient]);

  // Update preferences
  const updatePreferences = (updates) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const statusOptions = [
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "On Hold", label: "On Hold" },
    { value: "Closed", label: "Closed" },
  ];

  const departmentOptions = [
    { value: "Admin", label: "Admin" },
    { value: "Finance", label: "Finance" },
    { value: "HR", label: "HR" },
    { value: "AAA", label: "AAA" },
    { value: "VM", label: "VM" },
    { value: "HLS", label: "HLS" },
    { value: "RPA", label: "RPA" },
    { value: "CED", label: "CED" },
    { value: "MPO", label: "MPO" },
  ];

  // Group tickets by status for card view
  const groupTicketsByStatus = (tickets) => {
    const groups = {
      Open: [],
      "In Progress": [],
      "On Hold": [],
      Closed: [],
    };

    tickets.forEach((ticket) => {
      if (groups[ticket.status]) {
        groups[ticket.status].push(ticket);
      }
    });

    return groups;
  };

  // Choose which tickets to display based on the toggle
  const ticketsToFilter = preferences.showAllTickets ? allTickets : tickets;

  const [searchTerm, setSearchTerm] = useState("");

  const filteredTickets = ticketsToFilter.filter((ticket) => {
    const matchesStatus =
      !preferences.statusFilter ||
      ticket.status === preferences.statusFilter.value;
    const matchesDepartment =
      !preferences.departmentFilter ||
      ticket.department === preferences.departmentFilter.value;
    const matchesSearch =
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.issue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesDepartment && matchesSearch;
  });

  const ticketsByStatus = groupTicketsByStatus(filteredTickets);

  const getStatusClassName = (status) => {
    switch (status) {
      case "Open":
        return styles.statusOpen;
      case "In Progress":
        return styles.statusInProgress;
      case "On Hold":
        return styles.statusOnHold;
      case "Closed":
        return styles.statusClosed;
      default:
        return "";
    }
  };

  const StatusColumn = ({ status, tickets, isLRGVDCUser, user }) => {
    const [{ isOver }, drop] = useDrop({
      accept: ItemTypes.TICKET,
      drop: async (item) => {
        try {
          await updateTicketStatus(item.id, status);
        } catch (error) {
          console.error('Error updating ticket status:', error);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div
        ref={drop}
        className={`${styles.statusColumn} ${isOver ? styles.dragOver : ''}`}
      >
        <h3 className={styles.statusHeader}>{status}</h3>
        <div className={styles.ticketList}>
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              isLRGVDCUser={isLRGVDCUser}
              user={user}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderCardView = () => {
    const ticketGroups = groupTicketsByStatus(filteredTickets);

    return (
      <div className={styles.cardViewContainer}>
        {Object.entries(ticketGroups).map(([status, statusTickets]) => (
          <StatusColumn
            key={status}
            status={status}
            tickets={statusTickets}
            isLRGVDCUser={isLRGVDCUser}
            user={user}
          />
        ))}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.filterContainer}>
            <div className={styles.toggle}>
              <button
                className={`${styles.toggleButton} ${
                  !preferences.showAllTickets ? styles.active : ""
                }`}
                onClick={() => updatePreferences({ showAllTickets: false })}
              >
                My Tickets
              </button>
              <button
                className={`${styles.toggleButton} ${
                  preferences.showAllTickets ? styles.active : ""
                }`}
                onClick={() => updatePreferences({ showAllTickets: true })}
              >
                All Tickets
              </button>
            </div>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewButton} ${
                  preferences.viewMode === "table" ? styles.active : ""
                }`}
                onClick={() => updatePreferences({ viewMode: "table" })}
                title="Table View"
              >
                <BsListUl />
              </button>
              <button
                className={`${styles.viewButton} ${
                  preferences.viewMode === "card" ? styles.active : ""
                }`}
                onClick={() => updatePreferences({ viewMode: "card" })}
                title="Card View"
              >
                <BsGrid />
              </button>
            </div>
            <Select
              className={styles.select}
              isClearable
              placeholder="Filter by Status"
              options={statusOptions}
              value={preferences.statusFilter}
              onChange={(value) => updatePreferences({ statusFilter: value })}
            />
            <Select
              className={styles.select}
              isClearable
              placeholder="Filter by Department"
              options={departmentOptions}
              value={preferences.departmentFilter}
              onChange={(value) => updatePreferences({ departmentFilter: value })}
            />
          </div>
          <Search placeholder="Search tickets..." setSearch={setSearchTerm} />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={styles.addButton}
          >
            New Ticket
          </button>
        </div>

        {/* Add Ticket Modal */}
        {isAddModalOpen && (
          <AddTicketModalWrapper
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            user={user}
          />
        )}

        {preferences.viewMode === "table" ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {/* <th>Phone</th> */}
                  <th>Department</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() =>
                      (window.location.href = `/dashboard/tickets/${ticket.id}`)
                    }
                    className={styles.row}
                  >
                    <td data-label="Name">{ticket.name}</td>
                    <td data-label="Email">{ticket.email}</td>
                    {/* <td data-label="Phone">{ticket.phone}</td> */}
                    <td data-label="Department">{ticket.department}</td>
                    <td data-label="Issue">{ticket.issue}</td>
                    <td data-label="Status">
                      <span className={getStatusClassName(ticket.status)}>
                        {ticket.status}
                      </span>
                    </td>
                    <td data-label="Created At">
                      {ticket.createdAt?.toString().slice(4, 16)}
                    </td>
                    <td data-label="Actions">
                      <div
                        className={styles.buttons}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <form action={deleteTicket}>
                          <input type="hidden" name="id" value={ticket.id} />
                          <DeleteButton />
                        </form>
                        {isLRGVDCUser && (
                          <form action={escalateTicket} method="POST">
                            <input type="hidden" name="id" value={ticket._id} />
                            <EscalateButton
                              disabled={
                                ticket.assignedDepartment !== user.department
                              }
                              className={
                                ticket.assignedDepartment !== user.department
                                  ? styles.disabled
                                  : ""
                              }
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
        ) : (
          renderCardView()
        )}
      </div>
    </DndProvider>
  );
};

export default TicketList;
