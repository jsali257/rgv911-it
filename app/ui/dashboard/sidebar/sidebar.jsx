import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
import Link from "next/link";
import {
  MdDashboard,
  MdSupervisedUserCircle,
  MdArticle,
  MdAnalytics,
  MdPeople,
  MdOutlineSettings,
  MdHelpCenter,
  MdLogout,
  MdInventory,
  MdOutlineWeb,
  MdBackup,
} from "react-icons/md";
import { auth, signOut } from "@/app/auth";

const menuItems = [
  {
    title: "Main",
    list: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: <MdDashboard />,
      },
      {
        title: "Users",
        path: "/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Tickets",
        path: "/dashboard/tickets",
        icon: <MdArticle />,
      },
      // {
      //   title: "My Tickets",
      //   path: "/dashboard/tickets/myTickets",
      //   icon: <MdOutlineWeb />,
      // },
      {
        title: "Projects",
        path: "/dashboard/projects",
        icon: <MdOutlineWeb />,
      },
      {
        title: "Pub Ed Events",
        path: "/dashboard/pubEdEvents",
        icon: <MdOutlineWeb />,
      },
      {
        title: "File Manager",
        path: "/dashboard/uploads",
        icon: <MdBackup />,
      },
      {
        title: "Inventory Management",
        path: "/dashboard/inventory",
        icon: <MdInventory />,
      },
    ],
  },
  {
    title: "Analytics",
    list: [
      {
        title: "Reports",
        path: "/dashboard/reports",
        icon: <MdAnalytics />,
      },
      {
        title: "Teams",
        path: "/dashboard/teams",
        icon: <MdPeople />,
      },
    ],
  },
  {
    title: "User",
    list: [
      {
        title: "Settings",
        path: "/dashboard/settings",
        icon: <MdOutlineSettings />,
      },
      {
        title: "Help",
        path: "/dashboard/help",
        icon: <MdHelpCenter />,
      },
    ],
  },
];

const Sidebar = async () => {
  const session = await auth();
  console.log(session.user);
  return (
    <div className={styles.container}>
      {/* Add the logo */}
      <div className={styles.logoContainer}>
        <Image
          src="https://gis.rgv911.org/911-2-img.png"
          alt="RGV911 Logo"
          width={50}
          height={50}
          className={styles.logo}
        />
      </div>
      <div className={styles.user}>
        <Link href={`/dashboard/users/${session.user.id}`}>
          <Image
            className={styles.userImage}
            src={session.user.img || "/noavatar.png"}
            alt=""
            width="50"
            height="50"
          />
        </Link>
        <div className={styles.userDetail}>
          <span className={styles.username}>{session.user.username}</span>
          <span className={styles.userTitle}>
            {session.user.isAdmin ? "Admin" : "Agent"} -{" "}
            {session.user.department}
          </span>
        </div>
      </div>
      <ul className={styles.list}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>{cat.title}</span>
            {cat.list.map((item) => (
              <MenuLink item={item} key={item.title} />
            ))}
          </li>
        ))}
      </ul>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className={styles.logout}>
          <MdLogout />
          Logout
        </button>
      </form>
    </div>
  );
};

export default Sidebar;
