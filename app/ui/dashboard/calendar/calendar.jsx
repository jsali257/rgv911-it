"use client";

import React, { useState, useEffect } from "react";
import styles from "./calendar.module.css";
import Modal from "../../modal/modal";
import moment from "moment-timezone";

const normalizeDate = (date) =>
  moment.utc(date).tz("America/Chicago", true).startOf("day").toDate();

const filterProjectsByMonth = (projects, month, year) => {
  const startOfMonth = new Date(Date.UTC(year, month, 1));
  const endOfMonth = new Date(Date.UTC(year, month + 1, 0));

  return projects.filter((project) => {
    const projectStartDate = normalizeDate(project.startDate);
    const projectEndDate = normalizeDate(project.endDate);
    return (
      (projectStartDate >= startOfMonth && projectStartDate <= endOfMonth) ||
      (projectEndDate >= startOfMonth && projectEndDate <= endOfMonth) ||
      (projectStartDate < startOfMonth && projectEndDate > endOfMonth)
    );
  });
};

const Calendar = ({ projects }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setFilteredProjects(
      filterProjectsByMonth(projects, currentMonth, currentYear)
    );
  }, [projects, currentMonth, currentYear]);

  const generateUniqueColor = (projectName) => {
    let hash = 0;
    for (let i = 0; i < projectName.length; i++) {
      hash = (hash << 5) - hash + projectName.charCodeAt(i);
      hash |= 0;
    }
    return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
  };

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const renderTimeline = () => {
    const totalDaysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

    const allDays = [
      ...Array.from({ length: firstDayOfMonth }, () => null),
      ...Array.from({ length: totalDaysInMonth }, (_, i) => i + 1),
    ];

    return allDays.map((day, index) => {
      if (!day) return <div key={index} className={styles.emptyDay}></div>;

      const dayStart = new Date(Date.UTC(currentYear, currentMonth, day));
      const dayEnd = new Date(
        Date.UTC(currentYear, currentMonth, day, 23, 59, 59)
      );

      const projectsOnThisDay = filteredProjects.filter((project) => {
        const projectStartDate = normalizeDate(project.startDate);
        const projectEndDate = normalizeDate(project.endDate);
        return projectStartDate <= dayEnd && projectEndDate >= dayStart;
      });

      return (
        <div key={index} className={styles.timelineDay}>
          <div className={styles.timelineDayHeader}>
            <span className={styles.dayNumber}>{day}</span>
            <span className={styles.dayName}>
              {new Date(
                Date.UTC(currentYear, currentMonth, day)
              ).toLocaleString("default", {
                weekday: "short",
              })}
            </span>
          </div>
          <div className={styles.timelineEvents}>
            {projectsOnThisDay.map((project, idx) => (
              <div
                key={idx}
                className={styles.timelineEvent}
                style={{ backgroundColor: generateUniqueColor(project.name) }}
                onClick={() => handleProjectClick(project)}
              >
                <span className={styles.eventTitle}>{project.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  const changeMonth = (increment) => {
    setCurrentMonth((prev) => {
      const newMonth = prev + increment;
      if (newMonth < 0) {
        setCurrentYear((year) => year - 1);
        return 11;
      }
      if (newMonth > 11) {
        setCurrentYear((year) => year + 1);
        return 0;
      }
      return newMonth;
    });
  };

  return (
    <div className={styles.calendarTimeline}>
      <div className={styles.calendarHeader}>
        <button
          className={styles.navigationButton}
          onClick={() => changeMonth(-1)}
        >
          Prev
        </button>
        <h2>
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long",
          })}{" "}
          {currentYear}
        </h2>
        <button
          className={styles.navigationButton}
          onClick={() => changeMonth(1)}
        >
          Next
        </button>
      </div>
      <div className={styles.timeline}>{renderTimeline()}</div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default Calendar;
