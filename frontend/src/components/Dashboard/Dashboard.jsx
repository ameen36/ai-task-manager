import "./Dashboard.css";

function Dashboard({ tasks = [] }) {
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

    if (Number.isNaN(due.getTime())) return false;

    due.setHours(0, 0, 0, 0);

    return due.getTime() === today.getTime();
  }).length;

  const overdue = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false;

    const due = new Date(task.dueDate);

    if (Number.isNaN(due.getTime())) return false;

    due.setHours(0, 0, 0, 0);

    return due < today;
  }).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  return (
    <section className="dashboard">
      <div className="dashboard-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Keep track of your productivity at a glance.</p>
        </div>

        <div className="dashboard-progress-circle">
          <span>{progress}%</span>
          <small>Done</small>
        </div>
      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card total-card">
          <div className="dashboard-card-icon">✓</div>

          <div className="dashboard-card-content">
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
          </div>
        </div>

        <div className="dashboard-card completed-card">
          <div className="dashboard-card-icon">✓</div>

          <div className="dashboard-card-content">
            <span>Completed</span>
            <strong>{completedTasks}</strong>
          </div>
        </div>

        <div className="dashboard-card pending-card">
          <div className="dashboard-card-icon">○</div>

          <div className="dashboard-card-content">
            <span>Pending</span>
            <strong>{pendingTasks}</strong>
          </div>
        </div>

        <div className="dashboard-card important-card">
          <div className="dashboard-card-icon">★</div>

          <div className="dashboard-card-content">
            <span>Important</span>
            <strong>{importantTasks}</strong>
          </div>
        </div>

        <div className="dashboard-card today-card">
          <div className="dashboard-card-icon">◷</div>

          <div className="dashboard-card-content">
            <span>Due Today</span>
            <strong>{dueToday}</strong>
          </div>
        </div>

        <div className="dashboard-card overdue-card">
          <div className="dashboard-card-icon">!</div>

          <div className="dashboard-card-content">
            <span>Overdue</span>
            <strong>{overdue}</strong>
          </div>
        </div>

      </div>

      <div className="progress-section">
        <div className="progress-header">
          <div>
            <h3>Overall Progress</h3>
            <p>
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>

          <strong>{progress}%</strong>
        </div>

        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export default Dashboard;