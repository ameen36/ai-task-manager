import { isOverdue, isToday, isTomorrow } from "./dateUtils";

function getDueDatePriority(task) {
  if (task.completed) return 100;

  if (!task.dueDate) return 50;

  if (isOverdue(task.dueDate)) return 1;

  if (isToday(task.dueDate)) return 2;

  if (isTomorrow(task.dueDate)) return 3;

  return 4;
}

function getTaskPriority(task) {
  switch (task.priority) {
    case "High":
      return 1;
    case "Medium":
      return 2;
    case "Low":
      return 3;
    default:
      return 2;
  }
}

export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    // 1. Due date priority
    const dueDateDiff =
      getDueDatePriority(a) - getDueDatePriority(b);

    if (dueDateDiff !== 0) {
      return dueDateDiff;
    }

    // 2. Task priority
    const taskPriorityDiff =
      getTaskPriority(a) - getTaskPriority(b);

    if (taskPriorityDiff !== 0) {
      return taskPriorityDiff;
    }

    // 3. Earlier due date first
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    // 4. Alphabetical
    return a.title.localeCompare(b.title);
  });
}