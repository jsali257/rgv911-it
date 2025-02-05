"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import { MdNotifications, MdOutlineChat, MdSearch, MdMenu, MdClose } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import NotificationDropdown from "./NotificationDropdown";
import Link from "next/link";
import Image from "next/image";
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

const Navbar = () => {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedPreference = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(storedPreference);
    applyTheme(storedPreference);

    const fetchNotifications = async () => {
      try {
        const lastCheck =
          localStorage.getItem("lastNotificationCheck") ||
          new Date(Date.now() - 30 * 60 * 1000).toISOString();

        const response = await fetch("/api/notifications", {
          headers: {
            "last-check": lastCheck,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data.notifications);

        // Update last check time
        localStorage.setItem("lastNotificationCheck", new Date().toISOString());
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const applyTheme = (darkMode) => {
    const root = document.documentElement;
    // Main background and text colors
    root.style.setProperty("--bg", darkMode ? "#1a1c23" : "#e8e8e8");
    root.style.setProperty("--bgSoft", darkMode ? "#252836" : "#ffffff");
    root.style.setProperty("--text", darkMode ? "#e4e6eb" : "#2d3748");
    root.style.setProperty("--textSoft", darkMode ? "#9ca3af" : "#4a5568");
    root.style.setProperty("--textLight", darkMode ? "#e4e6eb" : "#2d3748");

    // Component specific colors
    root.style.setProperty("--bgReplies", darkMode ? "#2d303e" : "#f1f5f9");
    root.style.setProperty("--border", darkMode ? "#374151" : "#e2e8f0");

    // Accent colors
    root.style.setProperty("--primary", darkMode ? "#60a5fa" : "#3b82f6");
    root.style.setProperty("--primaryHover", darkMode ? "#3b82f6" : "#2563eb");
    root.style.setProperty("--secondary", darkMode ? "#9ca3af" : "#64748b");

    // Status colors
    root.style.setProperty("--success", darkMode ? "#34d399" : "#10b981");
    root.style.setProperty("--warning", darkMode ? "#fbbf24" : "#f59e0b");
    root.style.setProperty("--error", darkMode ? "#ef4444" : "#dc2626");

    // Card and container colors
    root.style.setProperty("--cardBg", darkMode ? "#252836" : "#ffffff");
    root.style.setProperty("--cardBorder", darkMode ? "#374151" : "#e2e8f0");
    root.style.setProperty(
      "--cardShadow",
      darkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"
    );
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    applyTheme(newMode);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error("Failed to mark notification as read");

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error("Failed to delete notification");

      setNotifications(notifications.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      const lastCheck = localStorage.getItem("lastNotificationCheck");
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          all: true,
          lastCheck,
        }),
      });

      if (!response.ok) throw new Error("Failed to clear notifications");
      
      // Update local state to mark all as read
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setShowNotifications(false);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.menuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <Image
            src="https://gis.rgv911.org/911-2-img.png"
            alt="RGV911 Logo"
            width={40}
            height={40}
            className={styles.mobileLogo}
          />
          <button 
            className={styles.closeButton}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.mobileMenuContent}>
          {menuItems.map((cat) => (
            <div key={cat.title} className={styles.mobileMenuCategory}>
              <span className={styles.mobileMenuTitle}>{cat.title}</span>
              {cat.list.map((item) => (
                <Link
                  href={item.path}
                  key={item.title}
                  className={`${styles.mobileMenuItem} ${
                    pathname === item.path ? styles.active : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.title}>RGV911</div>
      <div className={styles.menu}>
        <div className={styles.search}>
          <MdSearch />
          <input type="text" placeholder="Search..." className={styles.input} />
        </div>
        <div className={styles.icons}>
          <button className={styles.iconButton}>
            <MdOutlineChat size={20} />
          </button>
          <button className={styles.iconButton} onClick={toggleDarkMode}>
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} size="lg" />
          </button>
          <button className={styles.iconButton} onClick={toggleNotifications}>
            <MdNotifications size={20} />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className={styles.notificationBadge}>
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className={styles.dropdownWrapper}>
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
                onClearAll={handleClearAll}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
