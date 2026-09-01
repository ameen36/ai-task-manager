import { useEffect, useState } from "react";
import {
  FaPlus,
  FaCalendarAlt,
  FaSyncAlt,
  FaMicrophone,
  FaStop,
} from "react-icons/fa";
import { createTask } from "../../services/api";

function AddTask({ onRefresh }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Personal");

  const [repeat, setRepeat] = useState("None");
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatDays, setRepeatDays] = useState([]);
  const [repeatEndDate, setRepeatEndDate] = useState("");

  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // =========================================================
  // VOICE RECOGNITION
  // =========================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported by this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText =
        event.results[0][0].transcript;

      setTitle((currentTitle) => {
        if (!currentTitle.trim()) {
          return spokenText;
        }

        return `${currentTitle.trim()} ${spokenText}`;
      });
    };

    recognition.onerror = (event) => {
      console.error(
        "Voice recognition error:",
        event.error
      );

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  // =========================================================
  // RECURRING TASKS
  // =========================================================

  const toggleRepeatDay = (day) => {
    setRepeatDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter(
          (item) => item !== day
        );
      }

      return [...currentDays, day];
    });
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetForm = () => {
    setTitle("");
    setDueDate("");
    setPriority("Medium");
    setCategory("Personal");
    setRepeat("None");
    setRepeatInterval(1);
    setRepeatDays([]);
    setRepeatEndDate("");
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    try {
      const recurrence =
        repeat === "None"
          ? null
          : {
              enabled: true,
              frequency: repeat,
              interval:
                Number(repeatInterval) || 1,
              daysOfWeek:
                repeat === "Weekly"
                  ? repeatDays
                  : [],
              endDate: repeatEndDate
                ? new Date(
                    `${repeatEndDate}T23:59:59`
                  ).toISOString()
                : null,
            };

      await createTask({
        title: trimmedTitle,
        completed: false,
        important: false,
        dueDate: dueDate
          ? new Date(
              `${dueDate}T00:00:00`
            ).toISOString()
          : null,
        priority,
        category,
        recurrence,
      });

      resetForm();

      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error(
        "Failed to create task:",
        err
      );
    }
  };

  return (
    <form
      className="add-task"
      onSubmit={handleSubmit}
    >
      <div className="add-task-fields">

        {/* TASK TITLE */}

        <div className="task-input-row">
          <FaPlus className="add-icon" />

          <input
            className="add-task-input"
            type="text"
            placeholder="Add a task..."
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          {/* VOICE BUTTON */}

          {voiceSupported && (
            <button
              type="button"
              className={`voice-task-btn ${
                listening
                  ? "voice-task-listening"
                  : ""
              }`}
              onClick={startVoiceInput}
              title={
                listening
                  ? "Listening..."
                  : "Add task by voice"
              }
              aria-label={
                listening
                  ? "Listening"
                  : "Add task by voice"
              }
            >
              {listening ? (
                <FaStop />
              ) : (
                <FaMicrophone />
              )}
            </button>
          )}
        </div>

        {/* DUE DATE */}

        <div className="date-input-row">
          <FaCalendarAlt className="calendar-icon" />

          <input
            type="date"
            className="date-input"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
          />
        </div>

        {/* PRIORITY */}

        <div className="priority-input-row">
          <select
            className="priority-select"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option value="High">
              🔴 High
            </option>

            <option value="Medium">
              🟡 Medium
            </option>

            <option value="Low">
              🟢 Low
            </option>
          </select>
        </div>

        {/* CATEGORY */}

        <div className="category-input-row">
          <select
            className="category-select"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="Personal">
              🏠 Personal
            </option>

            <option value="Work">
              💼 Work
            </option>

            <option value="Study">
              📚 Study
            </option>

            <option value="Health">
              💪 Health
            </option>

            <option value="Shopping">
              🛒 Shopping
            </option>

            <option value="Others">
              📂 Others
            </option>
          </select>
        </div>

        {/* REPEAT */}

        <div className="repeat-input-row">
          <FaSyncAlt className="repeat-icon" />

          <select
            className="repeat-select"
            value={repeat}
            onChange={(e) => {
              setRepeat(e.target.value);

              if (
                e.target.value !== "Weekly"
              ) {
                setRepeatDays([]);
              }
            }}
          >
            <option value="None">
              No repeat
            </option>

            <option value="Daily">
              🔁 Daily
            </option>

            <option value="Weekly">
              🔁 Weekly
            </option>

            <option value="Monthly">
              🔁 Monthly
            </option>

            <option value="Yearly">
              🔁 Yearly
            </option>
          </select>
        </div>
      </div>

      {/* RECURRING OPTIONS */}

      {repeat !== "None" && (
        <div className="recurrence-options">

          <div className="recurrence-row">
            <label htmlFor="repeatInterval">
              Repeat every
            </label>

            <input
              id="repeatInterval"
              type="number"
              min="1"
              max="365"
              value={repeatInterval}
              onChange={(e) =>
                setRepeatInterval(
                  e.target.value
                )
              }
            />

            <span>
              {repeat === "Daily" &&
                "day(s)"}

              {repeat === "Weekly" &&
                "week(s)"}

              {repeat === "Monthly" &&
                "month(s)"}

              {repeat === "Yearly" &&
                "year(s)"}
            </span>
          </div>

          {/* WEEKLY DAYS */}

          {repeat === "Weekly" && (
            <div className="recurrence-days">
              <span className="recurrence-label">
                Repeat on
              </span>

              <div className="weekday-list">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`weekday-button ${
                      repeatDays.includes(day)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleRepeatDay(day)
                    }
                    title={day}
                  >
                    {day.substring(0, 2)}
                  </button>
                ))}
              </div>

              {repeatDays.length === 0 && (
                <small>
                  No days selected. The task
                  will repeat on the same
                  weekday.
                </small>
              )}
            </div>
          )}

          {/* END DATE */}

          <div className="recurrence-end">
            <label htmlFor="repeatEndDate">
              End date
            </label>

            <input
              id="repeatEndDate"
              type="date"
              value={repeatEndDate}
              min={dueDate || undefined}
              onChange={(e) =>
                setRepeatEndDate(
                  e.target.value
                )
              }
            />

            <small>
              Leave empty to repeat
              indefinitely.
            </small>
          </div>
        </div>
      )}

      {/* ADD */}

      <button type="submit">
        Add
      </button>
    </form>
  );
}

export default AddTask;