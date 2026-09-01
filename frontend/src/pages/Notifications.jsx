import { useEffect, useState } from "react";
import {
  FaBell,
  FaExclamationTriangle,
  FaCalendarDay,
  FaClock,
  FaSyncAlt,
} from "react-icons/fa";

import { getTasks } from "../services/api";
import { isOverdue } from "../utils/dateUtils";

function Notifications() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getTasks();

      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const tomorrow = new Date(startOfToday);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcomingLimit = new Date(startOfToday);
  upcomingLimit.setDate(
    upcomingLimit.getDate() + 7
  );

  const overdueTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.dueDate &&
      isOverdue(task.dueDate)
  );

  const todayTasks = tasks.filter((task) => {
    if (task.completed || !task.dueDate) {
      return false;
    }

    const date = new Date(task.dueDate);

    return (
      date >= startOfToday &&
      date <= endOfToday
    );
  });

  const upcomingTasks = tasks.filter((task) => {
    if (task.completed || !task.dueDate) {
      return false;
    }

    const date = new Date(task.dueDate);

    return (
      date >= tomorrow &&
      date <= upcomingLimit
    );
  });

  const recurringTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.recurrence?.enabled
  );

  const notifications = [
    ...overdueTasks.map((task) => ({
      id: `overdue-${task.id}`,
      type: "overdue",
      icon: <FaExclamationTriangle />,
      title: "Overdue task",
      message: task.title,
      priority: "high",
    })),

    ...todayTasks.map((task) => ({
      id: `today-${task.id}`,
      type: "today",
      icon: <FaCalendarDay />,
      title: "Task due today",
      message: task.title,
      priority: "medium",
    })),

    ...upcomingTasks.map((task) => ({
      id: `upcoming-${task.id}`,
      type: "upcoming",
      icon: <FaClock />,
      title: "Upcoming task",
      message: task.title,
      priority: "low",
    })),

    ...recurringTasks.map((task) => ({
      id: `recurring-${task.id}`,
      type: "recurring",
      icon: <FaSyncAlt />,
      title: "Recurring task",
      message: task.title,
      priority: "low",
    })),
  ];

  return (
    <div className="page notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>

          <p>
            Stay up to date with your tasks and reminders.
          </p>
        </div>

        <div className="notifications-heading-icon">
          <FaBell />
        </div>
      </div>

      {loading ? (
        <p className="task-list-status">
          Loading notifications...
        </p>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <FaBell />

          <h3>You're all caught up!</h3>

          <p>
            There are no task notifications right now.
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card notification-${notification.priority}`}
            >
              <div className="notification-icon">
                {notification.icon}
              </div>

              <div className="notification-content">
                <h3>{notification.title}</h3>

                <p>{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;