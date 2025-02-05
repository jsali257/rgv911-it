"use client";

import { useEffect, useRef } from 'react';
import styles from './notificationDropdown.module.css';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { MdClose, MdDeleteSweep } from 'react-icons/md';
import Link from 'next/link';

const NotificationDropdown = ({ notifications, onClose, onMarkAsRead, onDelete, onClearAll }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  const formatTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <div className={styles.header}>
        <span className={styles.title}>Notifications</span>
        {notifications.length > 0 && (
          <button className={styles.clearAll} onClick={onClearAll}>
            <MdDeleteSweep size={16} />
            Clear all
          </button>
        )}
      </div>
      
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <Link 
            href={`/dashboard/tickets/${notification._id}`}  
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            className={styles.notificationLink}
          >
            <div className={`${styles.notification} ${!notification.read ? styles.unread : ''}`}>
              {!notification.read && <div className={styles.dot} />}
              <div className={styles.content}>
                <div className={styles.notificationTitle}>{notification.title}</div>
                <div className={styles.message}>{notification.message}</div>
                <div className={styles.time}>
                  {formatTimeAgo(notification.createdAt)}
                </div>
              </div>
              <button 
                className={styles.deleteButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(notification._id);
                }}
              >
                <MdClose size={18} />
              </button>
            </div>
          </Link>
        ))
      ) : (
        <div className={styles.empty}>No notifications</div>
      )}
    </div>
  );
};

export default NotificationDropdown;
