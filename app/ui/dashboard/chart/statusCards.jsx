"use client";

import styles from "./statusCards.module.css";

const getStatusColor = (status) => {
  const colors = {
    Open: "#22c55e",         // Green
    "In Progress": "#3b82f6", // Blue
    "On Hold": "#f59e0b",    // Orange
    Closed: "#ef4444",       // Red
    default: "#94a3b8",
  };
  return colors[status] || colors.default;
};

const StatusCards = ({ data }) => {
  // Get unique statuses using reduce
  const statuses = data.reduce((acc, item) => {
    if (!acc.includes(item._id.status)) {
      acc.push(item._id.status);
    }
    return acc;
  }, []);

  // Calculate total tickets by status
  const statusTotals = statuses.map(status => {
    const total = data.reduce((sum, item) => 
      item._id.status === status ? sum + item.count : sum, 0
    );
    return {
      name: status,
      value: total
    };
  }).sort((a, b) => b.value - a.value); // Sort by value descending

  // Calculate total tickets
  const totalTickets = statusTotals.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        {statusTotals.map((item) => (
          <div key={item.name} className={styles.statItem}>
            <div className={styles.statHeader}>
              <div 
                className={styles.statusDot} 
                style={{ backgroundColor: getStatusColor(item.name) }}
              />
              <span>{item.name}</span>
            </div>
            <div className={styles.statValue}>
              {item.value}
              <span className={styles.statPercent}>
                ({((item.value / totalTickets) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusCards;
