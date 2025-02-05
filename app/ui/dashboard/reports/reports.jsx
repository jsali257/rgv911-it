"use client";

import { useState, useEffect } from "react";
import styles from "@/app/ui/dashboard/reports/reports.module.css";

const REPORT_TYPES = [
  { id: 'tickets', label: 'Tickets Report', description: 'Generate a report of all tickets and their status' },
  { id: 'projects', label: 'Projects Report', description: 'Generate a report of all projects and their progress' },
  { id: 'departments', label: 'Department Report', description: 'Generate a report of tickets by department' },
  { id: 'assignments', label: 'Assignments Report', description: 'Generate a report of ticket assignments' }
];

const ReportForm = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportType, setReportType] = useState("tickets");
  const [error, setError] = useState("");

  useEffect(() => {
    // Get today's date in Central Time (Chicago)
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Chicago",
    });
    setFromDate(today);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fromDate || !toDate) {
      setError("Please select both dates");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/reports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          body: JSON.stringify({ fromDate, toDate, reportType }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(errorMessage);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}_report.xlsx`;
      link.click();

      setError("");
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Generate Report</h1>
      <h1 className={styles.subHeading}>
        Select report type and date range to generate report.
      </h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="reportType" className={styles.label}>
            Report Type
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className={`${styles.input} ${styles.select}`}
          >
            {REPORT_TYPES.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          <p className={styles.description}>
            {REPORT_TYPES.find(type => type.id === reportType)?.description}
          </p>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="fromDate" className={styles.label}>
            From Date
          </label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={`${styles.input} ${styles.dateInput}`}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="toDate" className={styles.label}>
            To Date
          </label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={`${styles.input} ${styles.dateInput}`}
          />
        </div>
        <button type="submit" className={styles.button}>
          Generate Report
        </button>
      </form>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default ReportForm;
