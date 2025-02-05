"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./schedulerComponent.module.css";
import Modal from "@/app/ui/modal/modal";
import moment from "moment-timezone";

const SchedulerComponent = ({ fetchProjectsCalendar, users }) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [calendarApi, setCalendarApi] = useState(null);

  useEffect(() => {
    if (fetchProjectsCalendar) {
      setEvents(fetchProjectsCalendar);
    }
  }, [fetchProjectsCalendar]);

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;

    // Get time from the event's start/end dates
    const getTimeString = (date) => {
      if (!date) return "";
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    };

    setSelectedProject({
      _id: event.id,
      name: event.title,
      description: extendedProps.description,
      status: extendedProps.status,
      startDate: event.start,
      endDate: event.end,
      startTime: extendedProps.startTime || getTimeString(event.start),
      endTime: extendedProps.endTime || getTimeString(event.end),
      teamMembers: extendedProps.teamMembers || [],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleProjectUpdate = (updatedProject) => {
    if (!calendarApi) return;

    // Format the dates for the calendar
    const start = moment.tz(updatedProject.startDate, "America/Chicago");
    const end = moment.tz(updatedProject.endDate, "America/Chicago");

    // Update the event in the calendar
    const event = calendarApi.getEventById(updatedProject.id);
    if (event) {
      event.setProp('title', updatedProject.name);
      event.setStart(start.toDate());
      event.setEnd(end.toDate());
      event.setExtendedProp('description', updatedProject.description);
      event.setExtendedProp('status', updatedProject.status);
      event.setExtendedProp('startTime', updatedProject.startTime);
      event.setExtendedProp('endTime', updatedProject.endTime);
      event.setExtendedProp('teamMembers', updatedProject.teamMembers);

      // Update event color based on status
      const statusColors = {
        "Not Started": "#ff9800",
        "In Progress": "#2196f3",
        Completed: "#4caf50",
        "On Hold": "#f44336",
        Cancelled: "#9e9e9e",
      };
      const backgroundColor = statusColors[updatedProject.status] || "#607d8b";
      event.setProp('backgroundColor', backgroundColor);
      event.setProp('borderColor', backgroundColor);
    }
  };

  return (
    <div className={styles.container}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        editable={true}
        selectable={true}
        height="900px"
        eventClick={handleEventClick}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={true}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        windowResize={(view) => {
          // Switch to list view on mobile devices
          if (window.innerWidth < 768) {
            calendarApi?.changeView('listWeek');
          }
        }}
        ref={(ref) => {
          if (ref) {
            setCalendarApi(ref.getApi());
          }
        }}
        eventContent={(arg) => {
          const teamMembers = arg.event.extendedProps.teamMembers;
          const status = arg.event.extendedProps.status;
          const isTimeGridView = arg.view.type.includes("timeGrid");

          return (
            <div
              style={{
                backgroundColor: arg.event.backgroundColor,
                padding: "10px",
                borderRadius: "5px",
                color: "#fff",
                fontSize: isTimeGridView ? "0.8em" : "1em",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ fontWeight: "bold" }}>{arg.event.title}</div>

              {/* Show time in timeGrid views */}
              {isTimeGridView && (
                <div style={{ fontSize: "0.9em" }}>
                  {new Date(arg.event.start).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {arg.event.end &&
                    ` - ${new Date(arg.event.end).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}`}
                </div>
              )}

              {/* Show status badge */}
              <div
                style={{
                  fontSize: "0.8em",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: "2px 6px",
                  borderRadius: "12px",
                  display: "inline-block",
                  alignSelf: "flex-start",
                }}
              >
                {status}
              </div>

              {/* Show team members in non-timeGrid views */}
              {teamMembers && teamMembers.length > 0 && !isTimeGridView && (
                <div className={styles.teamMembersContainer}>
                  <ul className={styles.teamMembersList}>
                    {teamMembers.map((member, index) => (
                      <li key={index} className={styles.teamMemberItem}>
                        {member.username}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        }}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={selectedProject}
        users={users}
        onUpdate={handleProjectUpdate}
      />
    </div>
  );
};

export default SchedulerComponent;