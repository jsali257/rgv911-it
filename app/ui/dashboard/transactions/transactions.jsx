"use client";

import React, { useState, useEffect } from "react";
import { MdAdd } from "react-icons/md";
import { BsGrid3X3GapFill, BsListUl } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import Select from "react-select";
import styles from "./transactions.module.css";
import TransactionCard from "./transactionCard";
import { deleteTicket, escalateTicket } from "@/app/lib/actions";
import DeleteButton from "../deleteTicketButton/deleteTicketButton";
import EscalateButton from "../escalateButton/escalateButton";
import AddTicketModal from "../tickets/addTicket/AddTicketModal";

const STORAGE_KEY = "transactionViewPreferences";

const defaultPreferences = {
  viewMode: "table",
  statusFilter: null,
  departmentFilter: null,
};

const Transactions = ({ tickets, user }) => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isLRGVDCUser = user?.department === "LRGVDC";

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

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    }
  }, [preferences, isClient]);

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

  const filteredTickets = tickets
    .filter((ticket) => {
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
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.filterContainer}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                preferences.viewMode === "table" ? styles.active : ""
              }`}
              onClick={() => updatePreferences({ viewMode: "table" })}
              title="Table View"
            >
              <BsListUl size={20} />
            </button>
            <button
              className={`${styles.viewButton} ${
                preferences.viewMode === "card" ? styles.active : ""
              }`}
              onClick={() => updatePreferences({ viewMode: "card" })}
              title="Card View"
            >
              <BsGrid3X3GapFill size={20} />
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
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className={styles.addButton}
          onClick={() => setIsAddModalOpen(true)}
        >
          <MdAdd /> Add New
        </button>
      </div>

      {/* Add Ticket Modal */}
      <AddTicketModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        user={user}
      />

      {preferences.viewMode === "table" ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Issue</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <TransactionCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  user={user} 
                  view="table" 
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filteredTickets.map((ticket) => (
            <TransactionCard 
              key={ticket.id} 
              ticket={ticket} 
              user={user} 
              view="card" 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;
