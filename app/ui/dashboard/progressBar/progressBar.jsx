"use client";

import styles from "./progressBar.module.css";

const ProgressBar = ({ status }) => {
  const getProgressPercentage = (status) => {
    switch (status) {
      case "Open":
        return 25;
      case "In Progress":
        return 50;
      case "On Hold":
        return 75;
      case "Closed":
        return 100;
      default:
        return 0;
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case "Open":
        return { main: "#08bb58", light: "#e6f7ed" };
      case "In Progress":
        return { main: "#3068b2", light: "#e6f0f9" };
      case "On Hold":
        return { main: "#f3aa4b", light: "#fdf5e8" };
      case "Closed":
        return { main: "#fc4d4d", light: "#fee7e7" };
      default:
        return { main: "#ddd", light: "#f5f5f5" };
    }
  };

  const percentage = getProgressPercentage(status);
  const colors = getProgressColor(status);

  return (
    <div className={styles.progressWrapper}>
      <div 
        className={styles.progressContainer}
        style={{ backgroundColor: colors.light }}
      >
        <div 
          className={styles.progressBar} 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: colors.main
          }}
        />
      </div>
      <span className={styles.progressText} style={{ color: colors.main }}>
        {percentage}% Complete
      </span>
    </div>
  );
};

export default ProgressBar;
