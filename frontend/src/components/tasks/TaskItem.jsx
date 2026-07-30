import { useState } from "react";
import {
  FaStar,
  FaRegStar,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import { updateTask, deleteTask } from "../../services/api";
import { formatDueDate, isOverdue } from "../../utils/dateUtils";

function TaskItem({ task, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const saveTask = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitle(task.title);
      setEditing(false);
      return;
    }

    await updateTask(task.id, {
      ...task,
      title: trimmedTitle,
    });

    setEditing(false);
    onRefresh();
  };

  const toggleComplete = async () => {
    await updateTask(task.id, {
      ...task,
      completed: !task.completed,
    });

    onRefresh();
  };

  const toggleImportant = async () => {
    await updateTask(task.id, {
      ...task,
      important: !task.important,
    });

    onRefresh();
  };

  const removeTask = async () => {
    await deleteTask(task.id);
    onRefresh();
  };

  const getPriorityClass = () => {
    switch (task.priority) {
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      default:
        return "priority-medium";
    }
  };

  return (
    <div className="task-item">
      <div className="task-left">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={toggleComplete}
          />
          <span className="checkmark"></span>
        </label>

        <div className="task-content">
          {editing ? (
            <input
              className="task-edit-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTask}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTask();
              }}
              autoFocus
            />
          ) : (
            <>
              <span
                className={`task-title ${
                  task.completed ? "task-completed" : ""
                }`}
                onDoubleClick={() => setEditing(true)}
              >
                {task.title}
              </span>

              <div className="task-meta">
                <div className={`priority-badge ${getPriorityClass()}`}>
                  🎯 {task.priority || "Medium"}
                </div>

                <div className="category-badge">
                  📂 {task.category || "Personal"}
                </div>

                {task.dueDate && (
                  <div
                    className={`task-due-date ${
                      isOverdue(task.dueDate) ? "overdue" : ""
                    }`}
                  >
                    <FaCalendarAlt />
                    <span>{formatDueDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={toggleImportant}>
          {task.important ? <FaStar /> : <FaRegStar />}
        </button>

        <button className="icon-btn delete-btn" onClick={removeTask}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default TaskItem;