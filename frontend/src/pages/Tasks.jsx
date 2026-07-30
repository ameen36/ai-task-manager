import { useEffect, useState } from "react";
import { getTasks } from "../services/api";
import AddTask from "../components/tasks/AddTask";
import TaskList from "../components/tasks/TaskList";
import SearchBar from "../components/tasks/SearchBar";
import { sortTasks } from "../utils/taskSorter";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const data = await getTasks();

      setTasks(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTasks = sortTasks(filteredTasks);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <p>All your tasks in one place.</p>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <AddTask onRefresh={fetchTasks} />

      {loading ? (
        <p className="task-list-status">Loading...</p>
      ) : error ? (
        <p className="task-list-status">{error}</p>
      ) : (
        <TaskList
          tasks={sortedTasks}
          onRefresh={fetchTasks}
        />
      )}
    </div>
  );
}

export default Tasks;