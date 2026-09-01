import { useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
} from "react-icons/fa";

import { getTasks } from "../services/api";
import TaskItem from "../components/tasks/TaskItem";

function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD TASKS
  // =========================================================

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const data = await getTasks();

      if (data?.error) {
        setTasks([]);
        setError(data.error);
        return;
      }

      if (!Array.isArray(data)) {
        setTasks([]);
        setError("Unexpected response from server.");
        return;
      }

      setTasks(data);
      setError("");
    } catch (err) {
      console.error("Calendar task error:", err);
      setTasks([]);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getDateKey = (date) => {
    const localDate = new Date(date);

    return `${localDate.getFullYear()}-${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-${String(
      localDate.getDate()
    ).padStart(2, "0")}`;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  // =========================================================
  // GROUP TASKS BY DATE
  // =========================================================

  const tasksByDate = useMemo(() => {
    const grouped = {};

    tasks.forEach((task) => {
      if (!task.dueDate) return;

      const date = new Date(task.dueDate);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = getDateKey(date);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(task);
    });

    return grouped;
  }, [tasks]);

  // =========================================================
  // CALENDAR NAVIGATION
  // =========================================================

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDate(today);
  };

  // =========================================================
  // DAY SELECTION
  // =========================================================

  const selectDay = (day) => {
    setSelectedDate(
      new Date(year, month, day)
    );
  };

  const isToday = (day) => {
    const today = new Date();

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const isSelected = (day) => {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  // =========================================================
  // CALENDAR DAYS
  // =========================================================

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  // =========================================================
  // SELECTED DAY TASKS
  // =========================================================

  const selectedDateKey =
    getDateKey(selectedDate);

  const selectedTasks =
    tasksByDate[selectedDateKey] || [];

  const selectedDateText =
    selectedDate.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="calendar-page">
      {/* PAGE HEADING */}

      <div className="calendar-heading">
        <div>
          <h1>Calendar</h1>

          <p>
            View your tasks by their due dates.
          </p>
        </div>

        <div className="calendar-heading-icon">
          <FaCalendarAlt />
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <p className="task-list-status">
          Loading calendar...
        </p>
      )}

      {/* ERROR */}

      {!loading && error && (
        <p className="task-list-status">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {/* CALENDAR */}

          <div className="calendar-container">
            {/* CALENDAR TOP */}

            <div className="calendar-top">
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={previousMonth}
                aria-label="Previous month"
                title="Previous month"
              >
                <FaChevronLeft />
              </button>

              <h2>{monthName}</h2>

              <button
                type="button"
                className="calendar-nav-btn"
                onClick={nextMonth}
                aria-label="Next month"
                title="Next month"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* TODAY BUTTON */}

            <div className="calendar-actions">
              <button
                type="button"
                className="calendar-today-btn"
                onClick={goToToday}
              >
                Today
              </button>
            </div>

            {/* WEEKDAYS */}

            <div className="calendar-weekdays">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="calendar-weekday"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* DAYS */}

            <div className="calendar-grid">
              {calendarDays.map(
                (day, index) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="calendar-day empty"
                      />
                    );
                  }

                  const date = new Date(
                    year,
                    month,
                    day
                  );

                  const dateKey =
                    getDateKey(date);

                  const dayTasks =
                    tasksByDate[
                      dateKey
                    ] || [];

                  return (
                    <button
                      type="button"
                      key={day}
                      className={`calendar-day ${
                        isToday(day)
                          ? "calendar-day-today"
                          : ""
                      } ${
                        isSelected(day)
                          ? "calendar-day-selected"
                          : ""
                      } ${
                        dayTasks.length > 0
                          ? "calendar-day-has-tasks"
                          : ""
                      }`}
                      onClick={() =>
                        selectDay(day)
                      }
                    >
                      <span className="calendar-day-number">
                        {day}
                      </span>

                      {dayTasks.length >
                        0 && (
                        <span className="calendar-task-count">
                          {dayTasks.length}{" "}
                          {dayTasks.length ===
                          1
                            ? "task"
                            : "tasks"}
                        </span>
                      )}

                      {dayTasks.length >
                        0 && (
                        <span className="calendar-task-dots">
                          {dayTasks
                            .slice(0, 3)
                            .map(
                              (
                                task
                              ) => (
                                <span
                                  key={
                                    task.id
                                  }
                                  className={
                                    task.completed
                                      ? "completed"
                                      : ""
                                  }
                                />
                              )
                            )}
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* SELECTED DATE */}

          <div className="calendar-selected-section">
            <div className="calendar-selected-heading">
              <div>
                <h3>
                  {selectedDateText}
                </h3>

                <p>
                  {selectedTasks.length ===
                  0
                    ? "No tasks scheduled."
                    : `${selectedTasks.length} ${
                        selectedTasks.length ===
                        1
                          ? "task"
                          : "tasks"
                      } scheduled`}
                </p>
              </div>
            </div>

            {selectedTasks.length >
            0 ? (
              <div className="calendar-task-list">
                {selectedTasks.map(
                  (task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onRefresh={fetchTasks}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="calendar-empty">
                <FaCalendarAlt />

                <p>
                  No tasks for this date.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Calendar;