"use server";

import {
  fetchTicketsByMonth,
  fetchAssignmentsByMonth,
  fetchProjectsByMonth,
  fetchTicketDepartmentByMonth,
} from "@/app/lib/data";
import Chart from "./chart";
import styles from "./chart.module.css";

const ChartClient = async () => {
  const monthlyData = await fetchTicketsByMonth();
  const monthlyAssignments = await fetchAssignmentsByMonth();
  const monthlyProjects = await fetchProjectsByMonth();
  const monthlyTicketDepartmentData = await fetchTicketDepartmentByMonth();
  return (
    <div className={styles.container}>
      <Chart
        data={monthlyData}
        assignmentsData={monthlyAssignments}
        projectsData={monthlyProjects}
        monthlyTicketDepartmentData={monthlyTicketDepartmentData}
      />
    </div>
  );
};

export default ChartClient;
