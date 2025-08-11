import React, { useState, useEffect } from "react";
import BookLectureEventForm from "../components/BookLectureEventForm"; // ✅ Corrected import
import {
  Calendar,
  Clock,
  Users,
  Thermometer,
  Monitor,
  User,
} from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Hall.css";

const Hall = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState("");
  const [showBookedSlots, setShowBookedSlots] = useState(false);
  const [hallData, setHallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false); // 🔧 updated state name

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/halls/${id}`)
      .then((res) => {
        setHallData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hall data:", err);
        setLoading(false);
      });
  }, [id]);

  const fetchBookedSlots = async (date) => {
    if (!date) return;
    try {
      setError("");
      setBookedSlots([]);
      setShowBookedSlots(false);

      const res = await axios.get(`http://localhost:5000/api/info/hall/${id}`, {
        params: { date },
      });

      console.log("✅ [Bookings Fetched]:", res.data);
      setBookedSlots(res.data);
    } catch (err) {
      console.error("❌ [Error fetching bookings]:", err);
      setError("Failed to load bookings.");
    } finally {
      setShowBookedSlots(true);
    }
  };

  const handleDateChange = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);
    fetchBookedSlots(selected);
  };

  const formatTime = (timeString) => {
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className="hall-container">Loading...</div>;
  if (!hallData) return <div className="hall-container">Hall not found.</div>;

  return (
    <div className="hall-container">
      <div className="hall-content-card">
        <div className="hall-header">
          <h1 className="hall-title">{hallData.name}</h1>
          <p className="hall-subtitle">Booking Information & Availability</p>
        </div>

        {/* Hall Info */}
        <div className="hall-section">
          <h2 className="hall-section-title">Hall Information</h2>
          <div className="hall-info-box hall-blue">
            <div className="hall-info-item">
              <Monitor className="hall-icon hall-blue" size={20} />
              <span className="hall-label">Hall Name:</span>
              <span>{hallData.name}</span>
            </div>
            <div className="hall-info-item">
              <Users className="hall-icon hall-blue" size={20} />
              <span className="hall-label">Number of Seats:</span>
              <span>{hallData.no_of_seats}</span>
            </div>
            <div className="hall-info-item">
              <Thermometer className="hall-icon hall-blue" size={20} />
              <span className="hall-label">A/C Availability:</span>
              <span>{hallData.ac_available ? "AC available" : "No AC"}</span>
            </div>
          </div>
        </div>

        {/* Booking Availability */}
        <div className="hall-section">
          <h2 className="hall-section-title">Check for Booking Availability</h2>
          <div className="hall-booking-section">
            <div className="hall-date-selector">
              <div className="hall-date-label">
                <Calendar className="hall-icon hall-blue" size={20} />
                <span className="hall-label">Select Date:</span>
              </div>
              <input
                type="date"
                className="hall-date-input"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <h3>Already booked Slots</h3>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {showBookedSlots && (
              <>
                {bookedSlots.length === 0 ? (
                  <p>No bookings found for this hall on this date.</p>
                ) : (
                  <div className="booking-list">
                    {bookedSlots.map((booking, index) => (
                      <div key={index} className="booking-card">
                        <Clock size={16} style={{ marginRight: "8px" }} />
                        <span>
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                        <strong style={{ marginLeft: "10px" }}>
                          {booking.module_code || booking.event_name || "-"}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Technical Info */}
        <div className="hall-section">
          <h2 className="hall-section-title">Technical Information</h2>
          <div className="hall-info-box hall-orange">
            <div className="hall-info-item">
              <User className="hall-icon hall-orange" size={20} />
              <span className="hall-label">Technical Officer:</span>
              <span>{hallData.assigned_tech_officer || "Not assigned"}</span>
            </div>
            <div className="hall-info-item">
              <Monitor className="hall-icon hall-orange" size={20} />
              <span className="hall-label">Number of Multimedia Projectors:</span>
              <span>{hallData.no_of_projectors}</span>
            </div>
          </div>
        </div>

        {/* Footer: Booking Form Toggle */}
        <div className="hall-footer">
          <button
            className="hall-timetable-button"
            onClick={() => setShowBookingForm(!showBookingForm)}
          >
            {showBookingForm ? "Hide Booking Form" : "Book This Hall"}
          </button>

          {showBookingForm && (
            <div className="hall-form-container" style={{ marginTop: "20px" }}>
              <BookLectureEventForm hallId={id} date={selectedDate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hall;
