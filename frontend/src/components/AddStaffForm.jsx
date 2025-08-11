import React, { useState, useEffect } from "react";
import '../styles/Forms.css';


const AddStaffForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    regNumber: "",
    email: "",
    contactNumber: "",
    department: "IS",
    staffType: "Academic",
    teachingModules: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

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
    if (name === "teachingModules") {
      const raw = value.toUpperCase().replace(/,/g, "");
      let result = "";
      for (let i = 0; i < raw.length; i++) {
        if (i > 0 && i % 6 === 0) result += ",";
        result += raw[i];
      }
      setFormData(prev => ({ ...prev, [name]: result }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Staff added successfully!");
        setMessageType("success");
        setFormData({
          name: "",
          regNumber: "",
          email: "",
          contactNumber: "",
          department: "IS",
          staffType: "Academic",
          teachingModules: "",
          password: ""
        });
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to add staff"));
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error adding staff:", err);
      setMessage("❌ Something went wrong!");
      setMessageType("error");
    }
  };

  return (
    <div className="fm-form-card">
      <div className="fm-form-header">
        <h2 className="fm-form-title">Add New Member</h2>
        <div className="fm-form-icon">👨‍🏫</div>
      </div>

      {message && (
        <div className={`fm-message ${messageType === "success" ? "fm-message-success" : "fm-message-error"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="fm-form-group">
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Name</label>
          <div className="fm-form-line"></div>
        </div>
        <div className="fm-form-group">
          <input type="text" name="regNumber" value={formData.regNumber} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Reg. Number</label>
          <div className="fm-form-line"></div>
        </div>
        <div className="fm-form-group">
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Email</label>
          <div className="fm-form-line"></div>
        </div>
        <div className="fm-form-group">
          <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Contact Number</label>
          <div className="fm-form-line"></div>
        </div>
        <div className="fm-form-group">
          <select name="department" value={formData.department} onChange={handleChange} className="fm-form-select" required>
            <option value="CIS">CIS</option>
            <option value="Data Science">Data Science</option>
            <option value="Software Engineering">Software Engineerin</option>
          </select>
          <div className="fm-select-arrow">▼</div>
        </div>
        <div className="fm-form-group">
          <select name="staffType" value={formData.staffType} onChange={handleChange} className="fm-form-select" required>
            <option value="Academic">Academic</option>
            <option value="Non-Academic">Non-Academic</option>
          </select>
          <div className="fm-select-arrow">▼</div>
        </div>
        {formData.staffType === "Academic" && (
          <div className="fm-form-group">
            <input type="text" name="teachingModules" value={formData.teachingModules} onChange={handleChange} className="fm-form-input" placeholder=" " />
            <label className="fm-form-label">Teaching Modules (e.g., EE2344,IS2455)</label>
            <div className="fm-form-line"></div>
          </div>
        )}
        <div className="fm-form-group">
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Set Password</label>
          <div className="fm-form-line"></div>
        </div>
        <div className="fm-form-button-container">
          <button type="submit" className="fm-form-button">
            <span>Add Staff</span>
            <div className="fm-button-effect"></div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaffForm;
