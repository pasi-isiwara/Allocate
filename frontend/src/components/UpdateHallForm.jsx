import React, { useState, useEffect } from "react";

const UpdateHallForm = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState(null);
  const [selectedHallId, setSelectedHallId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const handleSearch = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/halls/search?query=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setMessage("❌ Search failed");
      setMessageType("error");
    }
  };

  const handleSelect = (hall) => {
    setSelectedHallId(hall.hall_id);
    setFormData({
      hallName: hall.name,
      mainBuilding: hall.main_building,
      seats: hall.no_of_seats,
      acAvailability: hall.ac_available ? "Yes" : "No",
      projectorAvailability: hall.no_of_projectors,
      nonAcademicMember: hall.assigned_tech_officer || ""
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/halls/${selectedHallId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.hallName,
          main_building: formData.mainBuilding,
          no_of_seats: Number(formData.seats),
          ac_available: formData.acAvailability === "Yes",
          no_of_projectors: Number(formData.projectorAvailability),
          assigned_tech_officer: formData.nonAcademicMember
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Hall updated successfully!");
        setMessageType("success");
        setFormData(null);
        setSelectedHallId(null);
      } else {
        setMessage("❌ Error: " + (data.message || "Failed to update hall"));
        setMessageType("error");
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("❌ Something went wrong!");
      setMessageType("error");
    }
  };

  return (
    <div className="fm-form-card">
      <div className="fm-form-header">
        <h2 className="fm-form-title">Update Hall</h2>
        <div className="fm-form-icon">🏢</div>
      </div>

      {message && (
        <div className={`fm-message ${messageType === "success" ? "fm-message-success" : "fm-message-error"}`}>
          {message}
        </div>
      )}

      <div className="fm-form-group fm-search-group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="fm-form-input"
          placeholder="Search by Hall Name"
        />
        <button type="button" className="fm-form-button fm-search-button" onClick={handleSearch}>
          <span>Search</span>
          <div className="fm-button-effect"></div>
        </button>
      </div>

      {searchResults.length > 0 && (
        <ul className="fm-search-dropdown">
          {searchResults.map((hall) => (
            <li key={hall.hall_id} onClick={() => handleSelect(hall)} className="fm-search-result">
            <span className="hall-name">{hall.name}</span>
            <span className="hall-building">({hall.main_building})</span>
            <span className="hall-update-hint">click to edit</span>
          </li>
            
          ))}
        </ul>
      )}

      {formData && (
        <form onSubmit={handleUpdate}>
          <div className="fm-form-group">
            <input
              type="text"
              name="hallName"
              value={formData.hallName}
              onChange={handleChange}
              className="fm-form-input"
              placeholder=" "
              required
            />
            <label className="fm-form-label">Hall Name</label>
            <div className="fm-form-line"></div>
          </div>

          <div className="fm-form-group">
            <select
              name="mainBuilding"
              value={formData.mainBuilding}
              onChange={handleChange}
              className="fm-form-select"
              required
            >
            <option value="">Select Main Building</option>
              <option value="Admin Building">Admin Building</option>
              <option value="NLH Building">NLH Building</option>
              <option value="Old Lecture Halls Building">Old Lecture Halls Building</option>
              <option value="DEIE Building">DEIE Building</option>
              <option value="DMME Building">DMME Building</option>
              <option value="CEE Building">CEE Building</option>
              <option value="Workshop Building">Workshop Building</option>
          </select>
            <div className="fm-select-arrow">▼</div>
          </div>

          <div className="fm-form-group">
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              className="fm-form-input"
              placeholder=" "
              required
            />
            <label className="fm-form-label">Number of Seats</label>
            <div className="fm-form-line"></div>
          </div>

          <div className="fm-form-group">
            <select
              name="acAvailability"
              value={formData.acAvailability}
              onChange={handleChange}
              className="fm-form-select"
              required
            >
              <option value="">AC Availability</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <div className="fm-select-arrow">▼</div>
          </div>

          <div className="fm-form-group">
            <input
              type="number"
              name="projectorAvailability"
              value={formData.projectorAvailability}
              onChange={handleChange}
              className="fm-form-input"
              placeholder=" "
              required
            />
            <label className="fm-form-label">Number of Projectors</label>
            <div className="fm-form-line"></div>
          </div>

          <div className="fm-form-group">
            <input
              type="text"
              name="nonAcademicMember"
              value={formData.nonAcademicMember}
              onChange={handleChange}
              className="fm-form-input"
              placeholder=" "
            />
            <label className="fm-form-label">Assigned Non-Academic Member</label>
            <div className="fm-form-line"></div>
          </div>

          <div className="fm-form-button-container">
            <button type="submit" className="fm-form-button">
              <span>Update Hall</span>
              <div className="fm-button-effect"></div>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateHallForm;
