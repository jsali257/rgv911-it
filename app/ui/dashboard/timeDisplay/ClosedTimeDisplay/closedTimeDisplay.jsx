"use client"
import React from "react";
import styles from "./closedTimeDisplay.module.css";
import {

  } from "react-icons/md";

const ClosedTimeDisplay = ({ totalTime }) => {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <span className={styles.closedTimeDisplay}>
      Total Working Time: {formatTime(totalTime)}
    </span>
  );
};

export default ClosedTimeDisplay;
