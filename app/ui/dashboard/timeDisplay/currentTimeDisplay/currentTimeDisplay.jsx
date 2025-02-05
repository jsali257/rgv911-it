"use client"

import React, { useState, useEffect } from "react";
import { MdAccessTime } from "react-icons/md"; // Import the icon
import styles from "./currentTimeDisplay.module.css";

const CurrentTimeDisplay = ({ currentTrackedTimeFormatted }) => {
  // Parse the initial time string into total seconds
  const parseTime = (timeString) => {
    if (!timeString) return 0; // Default to 0 seconds if no string is provided

    const timeParts = timeString.match(/(\d+)h|(\d+)m|(\d+)s/g) || [];
    let totalSeconds = 0;

    timeParts.forEach((part) => {
      if (part.endsWith("h")) {
        totalSeconds += parseInt(part, 10) * 3600;
      } else if (part.endsWith("m")) {
        totalSeconds += parseInt(part, 10) * 60;
      } else if (part.endsWith("s")) {
        totalSeconds += parseInt(part, 10);
      }
    });

    return totalSeconds;
  };

  // Format total seconds into hh:mm:ss
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  // Initial state as total seconds
  const [currentTime, setCurrentTime] = useState(parseTime(currentTrackedTimeFormatted));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prevTime) => prevTime + 30); // Increment total seconds by 30
    }, 30000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className={styles.currentTimeDisplay}>
      <MdAccessTime className={styles.icon} /> {/* Time icon */}
      <span>{formatTime(currentTime)}</span>
    </div>
  );
};

export default CurrentTimeDisplay;
