import React, { useState, useEffect } from "react";
import '../styles/Forms.css';

const BookLectureEventForm = () => {
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState("Lecture");
  const [formData, setFormData] = useState({
    moduleCode: "",
    eventName: "",
    targetBatch: "",
    department: "",
    date: "",
    startTime: "",
    endTime: "",
    hallName: ""
  });
  const [hallOptions, setHallOptions] = useState([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/halls");
        const data = await res.json();
        const hallNames = data.map(h => h.name);
        setHallOptions(hallNames);
      } catch (err) {
        console.error("❌ Failed to fetch halls:", err);
        setMessage("Error fetching hall data");
        setMessageType("error");
      }
    };
    fetchHalls();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const roundTimeTo30Min = (timeStr) => {
    if (!timeStr) return timeStr;
    let [hour, minute] = timeStr.split(":").map(Number);
    minute = minute >= 30 ? 30 : 0;
    const hh = hour.toString().padStart(2, "0");
    const mm = minute.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const isValid30MinTime = (timeStr) => {
    if (!timeStr) return false;
    const [_, m] = timeStr.split(":").map(Number);
    return m === 0 || m === 30;
  };

  const checkAvailability = async (e) => {
    e.preventDefault();
    if (!isValid30MinTime(formData.startTime) || !isValid30MinTime(formData.endTime)) {
      setMessage("Please use 30-minute intervals only (e.g., 08:00, 08:30)");
      setMessageType("error");
      return;
    }

    const [sh, sm] = formData.startTime.split(":").map(Number);
    const [eh, em] = formData.endTime.split(":").map(Number);
    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;

    if (endMinutes <= startMinutes) {
      endMinutes += 12 * 60;
      const newHour = Math.floor(endMinutes / 60) % 24;
      const newMin = endMinutes % 60;
      const fixedEnd = `${String(newHour).padStart(2, "0")}:${String(newMin).padStart(2, "0")}`;
      setFormData(prev => ({ ...prev, endTime: fixedEnd }));
      setMessage(`⚠️ End time was earlier than or same as start. Adjusted to ${fixedEnd}`);
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          hallName: formData.hallName
        })
      });
      const data = await res.json();
      if (data.available) {
        setMessage("✅ Hall is available!");
        setMessageType("success");
        setStep(2);
      } else {
        setMessage("❌ Hall is not available at that time.");
        setMessageType("error");
        console.table(data.clashes);
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      setMessage("Failed to check availability");
      setMessageType("error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingType, ...formData })
      });
      if (res.ok) {
        setMessage("✅ Booking successful");
        setMessageType("success");
        setFormData({
          moduleCode: "",
          eventName: "",
          targetBatch: "",
          department: "",
          date: "",
          startTime: "",
          endTime: "",
          hallName: ""
        });
        setStep(1);
      } else {
        const errorData = await res.json();
        setMessage("Booking failed: " + (errorData.message || "Unknown error"));
        setMessageType("error");
      }
    } catch (err) {
      console.error("❌ Booking failed:", err);
      setMessage("Failed to book event/lecture");
      setMessageType("error");
    }
  };

  return (
    <div className="fm-form-card">
      <div className="fm-form-header">
        <h2 className="fm-form-title">Book Lecture / Event</h2>
        <div className="fm-form-icon">📅</div>
      </div>

      {message && (
        <div className={`fm-message ${messageType === "success" ? "fm-message-success" : "fm-message-error"}`}>
          {message}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={checkAvailability} className="fm-multi-step-form">
          <div className="fm-step-indicator">
            <div className="fm-step active">1</div>
            <div className="fm-step-line"></div>
            <div className="fm-step">2</div>
          </div>

          {/* Select Hall moved to top */}
          <div className="fm-form-group">
            <select name="hallName" value={formData.hallName} onChange={handleChange} className="fm-form-select" required>
              <option value="">Select Hall</option>
              {hallOptions.map(hall => (
                <option key={hall} value={hall}>{hall}</option>
              ))}
            </select>
            <div className="fm-select-arrow">▼</div>
          </div>

          <div className="fm-form-group">
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="fm-form-input" placeholder=" " required />
            <label className="fm-form-label">Select Date</label>
            <div className="fm-form-line"></div>
          </div>
          <div className="fm-form-group">
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              onBlur={(e) => setFormData(prev => ({ ...prev, startTime: roundTimeTo30Min(e.target.value) }))}
              className="fm-form-input"
              placeholder=" "
              step="1800"
              required
            />
            <label className="fm-form-label">Start Time</label>
            <div className="fm-form-line"></div>
          </div>
          <div className="fm-form-group">
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              onBlur={(e) => setFormData(prev => ({ ...prev, endTime: roundTimeTo30Min(e.target.value) }))}
              className="fm-form-input"
              placeholder=" "
              step="1800"
              required
            />
            <label className="fm-form-label">End Time</label>
            <div className="fm-form-line"></div>
          </div>
          <div className="fm-form-button-container">
            <button type="submit" className="fm-form-button">
              <span>Check Availability</span>
              <div className="fm-button-effect"></div>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="fm-multi-step-form">
          <div className="fm-step-indicator">
            <div className="fm-step completed">✓</div>
            <div className="fm-step-line completed"></div>
            <div className="fm-step active">2</div>
          </div>
          <div className="fm-booking-summary">
            <div className="fm-summary-item">
              <span className="fm-summary-label">Date:</span>
              <span className="fm-summary-value">{formData.date}</span>
            </div>
            <div className="fm-summary-item">
              <span className="fm-summary-label">Time:</span>
              <span className="fm-summary-value">{formData.startTime} – {formData.endTime}</span>
            </div>
            <div className="fm-summary-item">
              <span className="fm-summary-label">Hall:</span>
              <span className="fm-summary-value">{formData.hallName}</span>
            </div>
          </div>
          <div className="fm-form-group">
            <select
              name="bookingType"
              value={bookingType}
              onChange={(e) => {
                setBookingType(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  moduleCode: "",
                  eventName: "",
                  targetBatch: "",
                  department: ""
                }));
              }}
              className="fm-form-select"
              required
            >
              <option value="Lecture">Lecture</option>
              <option value="Event">Event</option>
            </select>
            <div className="fm-select-arrow">▼</div>
          </div>

          {bookingType === "Lecture" ? (
            <div className="fm-form-group">
              <input
                type="text"
                name="moduleCode"
                value={formData.moduleCode}
                onChange={handleChange}
                className="fm-form-input"
                placeholder=" "
                required
              />
              <label className="fm-form-label">Module Code</label>
              <div className="fm-form-line"></div>
            </div>
          ) : (
            <>
              <div className="fm-form-group">
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  className="fm-form-input"
                  placeholder=" "
                  required
                />
                <label className="fm-form-label">Event Name</label>
                <div className="fm-form-line"></div>
              </div>
              <div className="fm-form-group">
                <select
                  name="targetBatch"
                  value={formData.targetBatch}
                  onChange={handleChange}
                  className="fm-form-select"
                  required
                >
                  <option value="">Target Batch</option>
                  <option value="22">22</option>
                  <option value="23">23</option>
                  <option value="24">24</option>
                  <option value="25">25</option>
                  <option value="All">All</option>
                </select>
                <div className="fm-select-arrow">▼</div>
              </div>
              <div className="fm-form-group">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="fm-form-select"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer">Computer</option>
                  <option value="EIE">EIE</option>
                  <option value="CEE">CEE</option>
                  <option value="MENA">MENA</option>
                  <option value="MME">MME</option>
                  <option value="Common">Common</option>
                </select>
                <div className="fm-select-arrow">▼</div>
              </div>
            </>
          )}
          <div className="fm-form-button-container fm-button-group">
            <button type="button" className="fm-back-button" onClick={() => setStep(1)}>← Back</button>
            <button type="submit" className="fm-form-button">
              <span>Confirm Booking</span>
              <div className="fm-button-effect"></div>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookLectureEventForm;
