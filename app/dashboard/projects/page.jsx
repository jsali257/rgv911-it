import styles from "@/app/ui/dashboard/projects/projects.module.css";
import SchedulerComponent from "@/app/ui/dashboard/SchedulerComponent/schedulerComponent";
import { fetchProjectsCalendar, fetchUsers } from "@/app/lib/data";
import Link from "next/link";

export const metadata = {
  title: "RGV911 Admin Dashboard - Projects",
};

const ProjectsPage = async () => {
  const fetchProjectsCalendarData = await fetchProjectsCalendar();
  const { users } = await fetchUsers();

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.info}>
          <h1>Projects</h1>
        </div>
        <Link href="/dashboard/projects/add" className={styles.addButton}>
          New Project
        </Link>
      </div>
      <div className={styles.content}>
        <SchedulerComponent 
          fetchProjectsCalendar={fetchProjectsCalendarData} 
          users={users}
        />
      </div>
    </div>
  );
};

export default ProjectsPage;