import styles from "../ui/dashboard/dashboard.module.css";
import Rightbar from "../ui/dashboard/rightbar/rightbar";
import Transactions from "../ui/dashboard/transactions/transactions";
import CardTickets from "../ui/dashboard/cardTickets/cardTickets";
import UserTicketsChart from "../ui/dashboard/chart/userTicketsChart";
import StatusTicketsChart from "../ui/dashboard/chart/statusTicketsChart";
import DepartmentTicketsChart from "../ui/dashboard/chart/departmentTicketsChart";
import MonthlyTicketsChart from "../ui/dashboard/chart/monthlyTicketsChart";
import AssignmentsChart from "../ui/dashboard/chart/assignmentsChart";
import ProjectsChart from "../ui/dashboard/chart/projectsChart";
import StatusCards from "../ui/dashboard/chart/statusCards";
import Card from "../ui/dashboard/card/card";
import {
  fetchTicketsByMonth,
  fetchAssignmentsByMonth,
  fetchProjectsByMonth,
  fetchMyTickets,
  fetchTicketDepartmentByMonth,
  fetchTicketsByUserMonthly,
  fetchTicketsByStatusMonthly,
} from "@/app/lib/data";
import { auth } from "@/app/auth";

const Dashboard = async () => {
  const session = await auth();
  const user = session?.user;
  const q = "";
  const ticketLimit = 7;
  const monthlyData = await fetchTicketsByMonth();
  const monthlyAssignments = await fetchAssignmentsByMonth();
  const monthlyProjects = await fetchProjectsByMonth();
  const monthlyTicketDepartmentData = await fetchTicketDepartmentByMonth();
  const { myTickets } = await fetchMyTickets(q, ticketLimit);
  const userTicketsData = await fetchTicketsByUserMonthly();
  const statusTicketsData = await fetchTicketsByStatusMonthly();

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        {/* Overview Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <div className={styles.cards}>
            <Card />
            <CardTickets />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.transactionsContainer}>
            <Transactions tickets={myTickets} user={user} />
          </div>
        </div>

        {/* Ticket Analytics Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Ticket Analytics</h2>
          <StatusCards data={statusTicketsData} />
          <div className={styles.analyticsCharts}>
            <div className={styles.chart}>
              <UserTicketsChart data={userTicketsData} />
            </div>
            <div className={styles.chart}>
              <StatusTicketsChart data={statusTicketsData} />
            </div>
            <div className={styles.chart}>
              <DepartmentTicketsChart data={monthlyTicketDepartmentData} />
            </div>
          </div>
        </div>

        {/* Monthly Distribution Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Monthly Distribution</h2>
          <div className={styles.analyticsCharts}>
            <div className={styles.chart}>
              <MonthlyTicketsChart data={monthlyData} />
            </div>
            <div className={styles.chart}>
              <AssignmentsChart data={monthlyAssignments} />
            </div>
            <div className={styles.chart}>
              <ProjectsChart data={monthlyProjects} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.side}>
        <Rightbar />
      </div>
    </div>
  );
};

export default Dashboard;
