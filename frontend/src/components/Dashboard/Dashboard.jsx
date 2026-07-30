import "./Dashboard.css";

function Dashboard({ tasks }) {
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const importantTasks = tasks.filter(
    (task) => task.important
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueToday = tasks.filter((task) => {
    if (!task.dueDate) return false;

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due.getTime() === today.getTime();
  }).length;

  const overdue = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false;

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  }).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>

        <div className="dashboard-card">
          <h3>Completed</h3>
          <p>{completedTasks}</p>
        </div>

        <div className="dashboard-card">
          <h3>Pending</h3>
          <p>{pendingTasks}</p>
        </div>

        <div className="dashboard-card">
          <h3>Important</h3>
          <p>{importantTasks}</p>
        </div>

        <div className="dashboard-card">
          <h3>Due Today</h3>
          <p>{dueToday}</p>
        </div>

        <div className="dashboard-card">
          <h3>Overdue</h3>
          <p>{overdue}</p>
        </div>
      </div>

      <div className="progress-section">
        <h3>Overall Progress</h3>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p>{progress}% Completed</p>
      </div>
    </div>
  );
}

export default Dashboard;