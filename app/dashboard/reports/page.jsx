import styles from "@/app/ui/dashboard/reports/reports.module.css";
import ReportForm from "@/app/ui/dashboard/reports/reports";
import Chart from "@/app/ui/dashboard/chart/chart";
import {
  fetchTicketsByMonth,
  fetchAssignmentsByMonth,
  fetchProjectsByMonth,
  fetchTicketDepartmentByMonth,
} from "@/app/lib/data";

const ReportPage = async () => {
  const monthlyData = await fetchTicketsByMonth();
  const monthlyAssignments = await fetchAssignmentsByMonth();
  const monthlyProjects = await fetchProjectsByMonth();
  const monthlyTicketDepartmentData = await fetchTicketDepartmentByMonth();

  return (
    <div className={styles.container}>
      <ReportForm />
      <Chart
        data={monthlyData}
        assignmentsData={monthlyAssignments}
        projectsData={monthlyProjects}
        monthlyTicketDepartmentData={monthlyTicketDepartmentData}
      />
    </div>
  );
};

export default ReportPage;
