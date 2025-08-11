import React, { useState, useEffect } from "react";

const UpdateStaffForm = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

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
      const res = await fetch(`http://localhost:5000/api/staff/search?query=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setMessage("❌ Search failed.");
      setMessageType("error");
    }
  };

  const handleSelect = (staff) => {
    setSelectedStaffId(staff.staff_id);
    setFormData({
      name: staff.name,
      regNumber: staff.reg_number,
      email: staff.email,
      contactNumber: staff.contact_number,
      department: staff.department,
      staffType: staff.staff_type,
      teachingModules: staff.teaching_modules || "",
      password: ""
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "teachingModules") {
      const raw = value.toUpperCase().replace(/,/g, "");
      let result = "";
      for (let i = 0; i < raw.length; i++) {
        if (i > 0 && i % 6 === 0) result += ",";
        result += raw[i];
      }
      setFormData((prev) => ({ ...prev, [name]: result }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/staff/${selectedStaffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Staff updated successfully!");
        setMessageType("success");
        setFormData(null);
        setSelectedStaffId(null);
      } else {
        setMessage("❌ " + (data.error || "Failed to update"));
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
        <h2 className="fm-form-title">Update Staff Member</h2>
        <div className="fm-form-icon">👨‍🏫</div>
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
          placeholder="Search by Name or Reg No"
        />
        <button type="button" className="fm-form-button fm-search-button" onClick={handleSearch}>
          <span>Search</span>
          <div className="fm-button-effect"></div>
        </button>
      </div>

      {searchResults.length > 0 && (
        <ul className="fm-search-dropdown">
          {searchResults.map((staff) => (
            <li key={staff.staff_id} onClick={() => handleSelect(staff)} className="fm-search-result">
              <span>{staff.name} ({staff.reg_number})</span>
             <span className="hall-update-hint">click to edit</span>

            </li>
          ))}
        </ul>
      )}

      {formData && (
        <form onSubmit={handleUpdate}>
          {[
            ["name", "Name"],
            ["regNumber", "Reg. Number"],
            ["email", "Email"],
            ["contactNumber", "Contact Number"]
          ].map(([name, label]) => (
            <div className="fm-form-group" key={name}>
              <input
                type={name === "email" ? "email" : "text"}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="fm-form-input"
                placeholder=" "
                required
              />
              <label className="fm-form-label">{label}</label>
              <div className="fm-form-line"></div>
            </div>
          ))}

          <div className="fm-form-group">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="fm-form-select"
              required
            >
               <option value="CIS">CIS</option>
            <option value="Data Science">Data Science</option>
            <option value="Software Engineering">Software Engineerin</option>
          </select>
            <div className="fm-select-arrow">▼</div>
          </div>

          <div className="fm-form-group">
            <select
              name="staffType"
              value={formData.staffType}
              onChange={handleChange}
              className="fm-form-select"
              required
            >
              <option value="Academic">Academic</option>
              <option value="Non-Academic">Non-Academic</option>
            </select>
            <div className="fm-select-arrow">▼</div>
          </div>

          {formData.staffType === "Academic" && (
            <div className="fm-form-group">
              <input
                type="text"
                name="teachingModules"
                value={formData.teachingModules}
                onChange={handleChange}
                className="fm-form-input"
                placeholder=" "
              />
              <label className="fm-form-label">Teaching Modules (e.g., EE2344,IS2455)</label>
              <div className="fm-form-line"></div>
            </div>
          )}

          <div className="fm-form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="fm-form-input"
              placeholder=" "
            />
            <label className="fm-form-label">Reset Password (optional)</label>
            <div className="fm-form-line"></div>
          </div>

          <div className="fm-form-button-container">
            <button type="submit" className="fm-form-button">
              <span>Update Staff</span>
              <div className="fm-button-effect"></div>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateStaffForm;
