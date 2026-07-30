import React from "react";
import TaskItem from "./TaskItem";

function TaskList({ tasks, onRefresh }) {
  if (!tasks || tasks.length === 0) {
    return <p className="task-list-status">No tasks found.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

export default TaskList;