import { useState } from "react";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";
import { createTask } from "../../services/api";

function AddTask({ onRefresh }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Personal");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    try {
      await createTask({
        title: trimmedTitle,
        completed: false,
        important: false,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        category,
      });

      setTitle("");
      setDueDate("");
      setPriority("Medium");
      setCategory("Personal");

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <div className="add-task-fields">
        <div className="task-input-row">
          <FaPlus className="add-icon" />

          <input
            className="add-task-input"
            type="text"
            placeholder="Add a task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="date-input-row">
          <FaCalendarAlt className="calendar-icon" />

          <input
            type="date"
            className="date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="priority-input-row">
          <select
            className="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
        </div>

        <div className="category-input-row">
          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Personal">🏠 Personal</option>
            <option value="Work">💼 Work</option>
            <option value="Study">📚 Study</option>
            <option value="Health">💪 Health</option>
            <option value="Shopping">🛒 Shopping</option>
            <option value="Others">📂 Others</option>
          </select>
        </div>
      </div>

      <button type="submit">Add</button>
    </form>
  );
}

export default AddTask;