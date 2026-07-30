export function isToday(dateString) {
  if (!dateString) return false;

  const today = new Date();
  const date = new Date(dateString);

  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

export function isTomorrow(dateString) {
  if (!dateString) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const date = new Date(dateString);

  return (
    tomorrow.getFullYear() === date.getFullYear() &&
    tomorrow.getMonth() === date.getMonth() &&
    tomorrow.getDate() === date.getDate()
  );
}

export function isOverdue(dateString) {
  if (!dateString) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  return date < today;
}

export function formatDueDate(dateString) {
  if (!dateString) return "";

  if (isToday(dateString)) {
    return "Today";
  }

  if (isTomorrow(dateString)) {
    return "Tomorrow";
  }

  if (isOverdue(dateString)) {
    const formatted = new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `Overdue • ${formatted}`;
  }

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}