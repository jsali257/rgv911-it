"use client";

import React, { useState, useEffect } from 'react';
import styles from './timeDisplay.module.css';

const TimeDisplay = ({ ticket }) => {
  const [elapsedTime, setElapsedTime] = useState(ticket.totalTime || 0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId;

    // Reset state based on ticket status
    if (ticket.status === "In Progress" && ticket.lastStartTime) {
      // Calculate current elapsed time
      const startTime = new Date(ticket.lastStartTime).getTime();
      const currentTime = new Date().getTime();
      const additionalTime = Math.floor((currentTime - startTime) / 1000);
      
      // Set initial time to total accumulated time plus time since last start
      setElapsedTime((ticket.totalTime || 0) + additionalTime);
      setIsRunning(true);

      // Start the timer
      intervalId = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      // For non-running states, just show the total accumulated time
      setElapsedTime(ticket.totalTime || 0);
      setIsRunning(false);
    }

    // Cleanup interval on unmount or status change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ticket.status, ticket.lastStartTime, ticket.totalTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const pad = (num) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  return (
    <div className={styles.timeDisplay}>
      <div className={styles.timeContainer}>
        <div className={styles.timeValue}>{formatTime(elapsedTime)}</div>
        <div className={styles.timeLabel}>
          {isRunning ? "Time Running" : "Total Time"}
        </div>
      </div>
      {isRunning && (
        <div className={styles.runningIndicator}>
          <span className={styles.dot}></span>
          Timer Running
        </div>
      )}
    </div>
  );
};

export default TimeDisplay;
