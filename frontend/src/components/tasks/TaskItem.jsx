import { useEffect, useState } from "react";
import {
  FaStar,
  FaRegStar,
  FaTrash,
  FaCalendarAlt,
  FaCheck,
  FaSyncAlt,
  FaStickyNote,
  FaPaperclip,
  FaDownload,
  FaTimes,
} from "react-icons/fa";

import {
  updateTask,
  deleteTask,
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  getAttachmentUrl,
} from "../../services/api";

import {
  formatDueDate,
  isOverdue,
} from "../../utils/dateUtils";

function TaskItem({ task, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title || "");
  const [saving, setSaving] = useState(false);

  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] =
    useState(false);

  const refreshTasks = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  // =========================================================
  // TASK TITLE
  // =========================================================

  const saveTask = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitle(task.title || "");
      setEditing(false);
      return;
    }

    if (trimmedTitle === task.title) {
      setEditing(false);
      return;
    }

    if (saving) return;

    try {
      setSaving(true);

      await updateTask(task.id, {
        ...task,
        title: trimmedTitle,
      });

      setEditing(false);
      await refreshTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
      setTitle(task.title || "");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setTitle(task.title || "");
    setEditing(false);
  };

  // =========================================================
  // COMPLETE
  // =========================================================

  const toggleComplete = async () => {
    if (saving) return;

    try {
      setSaving(true);

      await updateTask(task.id, {
        ...task,
        completed: !task.completed,
      });

      await refreshTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // IMPORTANT
  // =========================================================

  const toggleImportant = async () => {
    if (saving) return;

    try {
      setSaving(true);

      await updateTask(task.id, {
        ...task,
        important: !task.important,
      });

      await refreshTasks();
    } catch (error) {
      console.error("Failed to update important status:", error);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const removeTask = async () => {
    if (saving) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await deleteTask(task.id);

      await refreshTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // NOTES
  // =========================================================

  const saveNotes = async () => {
    if (savingNotes) return;

    try {
      setSavingNotes(true);

      await updateTask(task.id, {
        ...task,
        notes: notes.trim(),
      });

      setShowNotes(false);

      await refreshTasks();
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setSavingNotes(false);
    }
  };

  const cancelNotes = () => {
    setNotes(task.notes || "");
    setShowNotes(false);
  };

  // =========================================================
  // ATTACHMENTS
  // =========================================================

  const loadAttachments = async () => {
    try {
      setLoadingAttachments(true);

      const data = await getAttachments(task.id);

      if (Array.isArray(data)) {
        setAttachments(data);
      } else {
        setAttachments([]);
      }
    } catch (error) {
      console.error(
        "Failed to load attachments:",
        error
      );

      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const toggleAttachments = async () => {
    const newState = !showAttachments;

    setShowAttachments(newState);

    if (newState) {
      await loadAttachments();
    }
  };

  const handleAttachmentChange = async (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      window.alert(
        "File size must be 10 MB or less."
      );
      return;
    }

    try {
      setUploadingAttachment(true);

      const data = await uploadAttachment(
        task.id,
        file
      );

      if (data?.attachment) {
        setAttachments((current) => [
          ...current,
          data.attachment,
        ]);
      } else {
        await loadAttachments();
      }

      setShowAttachments(true);
    } catch (error) {
      console.error(
        "Failed to upload attachment:",
        error
      );

      window.alert(
        "Failed to upload attachment."
      );
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachment = async (attachment) => {
    const confirmed = window.confirm(
      `Delete "${attachment.originalName}"?`
    );

    if (!confirmed) return;

    try {
      await deleteAttachment(
        task.id,
        attachment.id
      );

      setAttachments((current) =>
        current.filter(
          (item) => item.id !== attachment.id
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete attachment:",
        error
      );

      window.alert(
        "Failed to delete attachment."
      );
    }
  };

  const openAttachment = (attachment) => {
    const token = localStorage.getItem("token");

    const url = getAttachmentUrl(
      task.id,
      attachment.id
    );

    /*
     * The attachment endpoint requires authentication.
     * Opening it directly would not send the Bearer token.
     *
     * Fetch the file with the token first, then open
     * the resulting Blob URL.
     */
    fetch(url, {
      headers: {
        Authorization: token
          ? `Bearer ${token}`
          : "",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to download attachment"
          );
        }

        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = blobUrl;
        link.download =
          attachment.originalName || "attachment";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error(
          "Failed to open attachment:",
          error
        );

        window.alert(
          "Failed to open attachment."
        );
      });
  };

  // =========================================================
  // PRIORITY
  // =========================================================

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

  // =========================================================
  // KEYBOARD
  // =========================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTask();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  // =========================================================
  // VALUES
  // =========================================================

  const overdue =
    task.dueDate &&
    !task.completed &&
    isOverdue(task.dueDate);

  const isRecurring =
    task.recurrence &&
    task.recurrence.enabled;

  const recurrenceText = isRecurring
    ? `${task.recurrence.frequency || "Recurring"}${
        task.recurrence.interval > 1
          ? ` every ${task.recurrence.interval}`
          : ""
      }`
    : "";

  const hasNotes =
    typeof task.notes === "string" &&
    task.notes.trim().length > 0;

  const hasAttachments =
    attachments.length > 0;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className={`task-item ${
        task.completed
          ? "task-item-completed"
          : ""
      } ${
        task.important
          ? "task-item-important"
          : ""
      } ${
        isRecurring
          ? "task-item-recurring"
          : ""
      }`}
    >
      {/* LEFT SIDE */}

      <div className="task-left">
        {/* CHECKBOX */}

        <label
          className={`checkbox-container ${
            task.completed ? "checked" : ""
          }`}
          title={
            task.completed
              ? "Mark as pending"
              : "Mark as completed"
          }
        >
          <input
            type="checkbox"
            checked={Boolean(task.completed)}
            onChange={toggleComplete}
            disabled={saving}
          />

          <span className="checkmark">
            {task.completed && <FaCheck />}
          </span>
        </label>

        {/* TASK CONTENT */}

        <div className="task-content">
          {editing ? (
            <div className="task-edit-wrapper">
              <input
                className="task-edit-input"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                onBlur={saveTask}
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={saving}
              />

              <small>
                Enter to save · Esc to cancel
              </small>
            </div>
          ) : (
            <>
              {/* TITLE */}

              <span
                className={`task-title ${
                  task.completed
                    ? "task-completed"
                    : ""
                }`}
                onDoubleClick={() => {
                  if (!saving) {
                    setTitle(
                      task.title || ""
                    );

                    setEditing(true);
                  }
                }}
                title="Double-click to edit"
              >
                {task.title}
              </span>

              {/* TASK DETAILS */}

              <div className="task-meta">
                {/* PRIORITY */}

                <span
                  className={`priority-badge ${getPriorityClass()}`}
                >
                  {task.priority === "High" &&
                    "🔴"}

                  {task.priority === "Medium" &&
                    "🟡"}

                  {task.priority === "Low" &&
                    "🟢"}{" "}

                  {task.priority ||
                    "Medium"}
                </span>

                {/* CATEGORY */}

                <span className="category-badge">
                  📂{" "}
                  {task.category ||
                    "Personal"}
                </span>

                {/* RECURRING */}

                {isRecurring && (
                  <span
                    className="recurring-badge"
                    title={`Repeats ${recurrenceText}`}
                  >
                    <FaSyncAlt />

                    <span>
                      {recurrenceText}
                    </span>
                  </span>
                )}

                {/* DUE DATE */}

                {task.dueDate && (
                  <span
                    className={`task-due-date ${
                      overdue
                        ? "overdue"
                        : ""
                    } ${
                      task.completed
                        ? "task-due-completed"
                        : ""
                    }`}
                  >
                    <FaCalendarAlt />

                    <span>
                      {formatDueDate(
                        task.dueDate
                      )}
                    </span>
                  </span>
                )}

                {/* NOTE INDICATOR */}

                {hasNotes && (
                  <span
                    className="notes-indicator"
                    title="This task has notes"
                  >
                    <FaStickyNote />
                  </span>
                )}

                {/* ATTACHMENT INDICATOR */}

                {hasAttachments && (
                  <span
                    className="attachments-indicator"
                    title={`${attachments.length} attachment${
                      attachments.length !== 1
                        ? "s"
                        : ""
                    }`}
                  >
                    <FaPaperclip />

                    <span>
                      {attachments.length}
                    </span>
                  </span>
                )}
              </div>

              {/* NOTES */}

              {showNotes && (
                <div className="task-notes">
                  <textarea
                    className="task-notes-input"
                    value={notes}
                    onChange={(e) =>
                      setNotes(
                        e.target.value
                      )
                    }
                    placeholder="Add notes about this task..."
                    rows={4}
                    autoFocus
                    disabled={savingNotes}
                  />

                  <div className="task-notes-actions">
                    <button
                      type="button"
                      className="notes-save-btn"
                      onClick={saveNotes}
                      disabled={savingNotes}
                    >
                      {savingNotes
                        ? "Saving..."
                        : "Save Note"}
                    </button>

                    <button
                      type="button"
                      className="notes-cancel-btn"
                      onClick={cancelNotes}
                      disabled={savingNotes}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* NOTE PREVIEW */}

              {!showNotes && hasNotes && (
                <div
                  className="task-notes-preview"
                  onClick={() => {
                    setNotes(
                      task.notes || ""
                    );

                    setShowNotes(true);
                  }}
                  title="Click to edit note"
                >
                  <FaStickyNote />

                  <span>
                    {task.notes}
                  </span>
                </div>
              )}

              {/* ATTACHMENTS */}

              {showAttachments && (
                <div className="task-attachments">
                  <div className="attachments-header">
                    <strong>
                      Attachments
                    </strong>

                    <label
                      className="attach-file-btn"
                    >
                      <FaPaperclip />

                      {uploadingAttachment
                        ? "Uploading..."
                        : "Attach file"}

                      <input
                        type="file"
                        onChange={
                          handleAttachmentChange
                        }
                        disabled={
                          uploadingAttachment
                        }
                        hidden
                      />
                    </label>
                  </div>

                  {loadingAttachments ? (
                    <div className="attachments-status">
                      Loading attachments...
                    </div>
                  ) : attachments.length ===
                    0 ? (
                    <div className="attachments-empty">
                      No attachments yet.
                    </div>
                  ) : (
                    <div className="attachment-list">
                      {attachments.map(
                        (attachment) => (
                          <div
                            className="attachment-item"
                            key={attachment.id}
                          >
                            <div className="attachment-info">
                              <FaPaperclip />

                              <button
                                type="button"
                                className="attachment-name"
                                onClick={() =>
                                  openAttachment(
                                    attachment
                                  )
                                }
                                title="Download attachment"
                              >
                                {
                                  attachment.originalName
                                }
                              </button>
                            </div>

                            <button
                              type="button"
                              className="attachment-delete-btn"
                              onClick={() =>
                                removeAttachment(
                                  attachment
                                )
                              }
                              title="Delete attachment"
                              aria-label="Delete attachment"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <small className="attachment-limit">
                    Maximum file size: 10 MB
                  </small>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE ACTIONS */}

      <div className="task-actions">
        {/* ATTACHMENTS */}

        <button
          type="button"
          className={`icon-btn attachment-btn ${
            showAttachments ||
            hasAttachments
              ? "attachment-active"
              : ""
          }`}
          onClick={toggleAttachments}
          disabled={saving}
          title="Attachments"
          aria-label="Attachments"
        >
          <FaPaperclip />
        </button>

        {/* NOTES */}

        <button
          type="button"
          className={`icon-btn notes-btn ${
            showNotes || hasNotes
              ? "notes-active"
              : ""
          }`}
          onClick={() => {
            setNotes(task.notes || "");

            setShowNotes(
              (current) => !current
            );
          }}
          disabled={
            saving || savingNotes
          }
          title={
            hasNotes
              ? "Edit note"
              : "Add note"
          }
          aria-label={
            hasNotes
              ? "Edit note"
              : "Add note"
          }
        >
          <FaStickyNote />
        </button>

        {/* IMPORTANT */}

        <button
          type="button"
          className={`icon-btn important-btn ${
            task.important
              ? "important-active"
              : ""
          }`}
          onClick={toggleImportant}
          disabled={saving}
          title={
            task.important
              ? "Remove from Important"
              : "Mark as Important"
          }
          aria-label={
            task.important
              ? "Remove from Important"
              : "Mark as Important"
          }
        >
          {task.important ? (
            <FaStar />
          ) : (
            <FaRegStar />
          )}
        </button>

        {/* DELETE */}

        <button
          type="button"
          className="icon-btn delete-btn"
          onClick={removeTask}
          disabled={saving}
          title="Delete task"
          aria-label="Delete task"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default TaskItem;