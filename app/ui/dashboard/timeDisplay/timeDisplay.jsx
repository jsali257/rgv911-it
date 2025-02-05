import React from "react";
import ClosedTimeDisplay from "./ClosedTimeDisplay/closedTimeDisplay";
import CurrentTimeDisplay from "./currentTimeDisplay/currentTimeDisplay";
import styles from "./timeDisplay.module.css";

const TimeDisplay = ({ status, totalTime, currentTrackedTimeFormatted }) => {
  return (
    <div className={styles.timeDisplay}>
      {status === "Closed" ? (
        <ClosedTimeDisplay totalTime={totalTime} />
      ) : (
        <CurrentTimeDisplay currentTrackedTimeFormatted={currentTrackedTimeFormatted} />
      )}
    </div>
  );
};

export default TimeDisplay;
