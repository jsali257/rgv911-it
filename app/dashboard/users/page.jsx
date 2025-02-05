import { fetchUsers } from "@/app/lib/data";
import styles from "@/app/ui/dashboard/users/users.module.css";
import Link from "next/link";
import { MdAdd } from "react-icons/md";
import UsersTable from "@/app/ui/dashboard/users/usersTable";
import Search from "@/app/ui/dashboard/search/search";

const UsersPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const { users } = await fetchUsers(q, page);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a user..." />
        <Link href="/dashboard/users/add">
          <button className={styles.addButton}>
            <MdAdd size={20} />
            Add New
          </button>
        </Link>
      </div>
      <UsersTable users={users} />
    </div>
  );
};

export default UsersPage;
