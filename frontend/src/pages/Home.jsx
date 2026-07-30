import { useEffect, useState } from "react";
import { getTasks } from "../services/api";
import AddTask from "../components/tasks/AddTask";
import TaskList from "../components/tasks/TaskList";
import SearchBar from "../components/tasks/SearchBar";
import Dashboard from "../components/dashboard/Dashboard";
import { sortTasks } from "../utils/taskSorter";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const data = await getTasks();

      console.log("Tasks API Response:", data);

      if (data.error) {
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
      console.error("Fetch Tasks Error:", err);
      setTasks([]);
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
        <h1>My Day</h1>

        <p>
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <Dashboard tasks={tasks} />

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

export default Home;