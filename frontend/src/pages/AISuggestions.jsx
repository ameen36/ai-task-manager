import { useEffect, useMemo, useState } from "react";
import {
  FaRobot,
  FaExclamationTriangle,
  FaCalendarDay,
  FaFlag,
  FaCheckCircle,
  FaLightbulb,
} from "react-icons/fa";

import { getTasks } from "../services/api";
import { isOverdue } from "../utils/dateUtils";

function AISuggestions() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
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
        "Failed to load AI suggestions:",
        error
      );

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const suggestions = useMemo(() => {
    const result = [];

    const pendingTasks = tasks.filter(
      (task) => !task.completed
    );

    const completedTasks = tasks.filter(
      (task) => task.completed
    );

    const overdueTasks = pendingTasks.filter(
      (task) =>
        task.dueDate &&
        isOverdue(task.dueDate)
    );

    const importantTasks = pendingTasks.filter(
      (task) => task.important
    );

    const highPriorityTasks =
      pendingTasks.filter(
        (task) => task.priority === "High"
      );

    const today = new Date();

    const todayTasks = pendingTasks.filter(
      (task) => {
        if (!task.dueDate) return false;

        const date = new Date(task.dueDate);

        return (
          date.getFullYear() ===
            today.getFullYear() &&
          date.getMonth() ===
            today.getMonth() &&
          date.getDate() ===
            today.getDate()
        );
      }
    );

    // OVERDUE

    if (overdueTasks.length > 0) {
      result.push({
        id: "overdue",
        icon: <FaExclamationTriangle />,
        title: "Clear your overdue tasks",
        message: `You have ${overdueTasks.length} overdue ${
          overdueTasks.length === 1
            ? "task"
            : "tasks"
        }. Consider completing the oldest one first.`,
        type: "warning",
      });
    }

    // TODAY

    if (todayTasks.length > 0) {
      result.push({
        id: "today",
        icon: <FaCalendarDay />,
        title: "Focus on today's tasks",
        message: `You have ${todayTasks.length} ${
          todayTasks.length === 1
            ? "task"
            : "tasks"
        } due today.`,
        type: "today",
      });
    }

    // HIGH PRIORITY

    if (highPriorityTasks.length > 0) {
      result.push({
        id: "priority",
        icon: <FaFlag />,
        title: "Prioritize important work",
        message: `There are ${highPriorityTasks.length} high-priority pending ${
          highPriorityTasks.length === 1
            ? "task"
            : "tasks"
        }. Consider handling these first.`,
        type: "priority",
      });
    }

    // IMPORTANT

    if (importantTasks.length > 0) {
      result.push({
        id: "important",
        icon: <FaLightbulb />,
        title: "Review your Important list",
        message: `You have ${importantTasks.length} important pending ${
          importantTasks.length === 1
            ? "task"
            : "tasks"
        }.`,
        type: "important",
      });
    }

    // COMPLETION

    if (
      completedTasks.length > 0 &&
      tasks.length > 0
    ) {
      const completionRate = Math.round(
        (completedTasks.length /
          tasks.length) *
          100
      );

      if (completionRate >= 75) {
        result.push({
          id: "great-progress",
          icon: <FaCheckCircle />,
          title: "Great progress!",
          message: `You've completed ${completionRate}% of your tasks. Keep it up!`,
          type: "success",
        });
      } else if (completionRate < 30) {
        result.push({
          id: "progress",
          icon: <FaLightbulb />,
          title: "Work through your task list",
          message: `Your current completion rate is ${completionRate}%. Try completing one small task to build momentum.`,
          type: "tip",
        });
      }
    }

    // NO TASKS

    if (tasks.length === 0) {
      result.push({
        id: "empty",
        icon: <FaRobot />,
        title: "You're ready to get started",
        message:
          "Create your first task and I'll give you productivity suggestions based on your task list.",
        type: "tip",
      });
    }

    return result;
  }, [tasks]);

  return (
    <div className="page ai-suggestions-page">
      <div className="page-header">
        <div>
          <h1>AI Suggestions</h1>

          <p>
            Smart productivity suggestions based
            on your tasks.
          </p>
        </div>

        <div className="ai-heading-icon">
          <FaRobot />
        </div>
      </div>

      {loading ? (
        <p className="task-list-status">
          Analyzing your tasks...
        </p>
      ) : (
        <div className="ai-suggestions-list">
          {suggestions.map(
            (suggestion) => (
              <div
                key={suggestion.id}
                className={`ai-suggestion-card ai-suggestion-${suggestion.type}`}
              >
                <div className="ai-suggestion-icon">
                  {suggestion.icon}
                </div>

                <div className="ai-suggestion-content">
                  <h3>
                    {suggestion.title}
                  </h3>

                  <p>
                    {suggestion.message}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default AISuggestions;