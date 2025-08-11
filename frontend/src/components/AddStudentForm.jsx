import React, { useState, useEffect } from "react";
import '../styles/Forms.css';

const AddStudentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    reg_no: "",
    email: "",
    contact_no: "",
    department: "",
    batch: "",
    purpose: "",
    society_name: "",
    lecturer_in_charge: "",
    password: ""
  });

  const [regSuffix, setRegSuffix] = useState(""); // last 4 digits
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
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Year = 1998 + batch
  const year = formData.batch ? 1998 + Number(formData.batch) : "";
  const regPrefix = year ? `EG/${year}/` : "";
  const fullRegNo = `${regPrefix}${regSuffix}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reg_no = `${regPrefix}${regSuffix}`;

    try {
      const response = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          reg_no,
          user_type: "Student"
        })
      });

      if (response.ok) {
        setMessage("✅ Student added successfully");
        setMessageType("success");
        setFormData({
          name: "",
          reg_no: "",
          email: "",
          contact_no: "",
          department: "",
          batch: "",
          purpose: "",
          society_name: "",
          lecturer_in_charge: "",
          password: ""
        });
        setRegSuffix("");
      } else {
        const data = await response.json();
        setMessage("❌ Failed to add student: " + (data.error || "Unknown error"));
        setMessageType("error");
      }
    } catch (err) {
      console.error("❌ Failed to add student:", err);
      setMessage("❌ Failed to add student");
      setMessageType("error");
    }
  };

  return (
    <div className="fm-form-card">
      <div className="fm-form-header">
        <h2 className="fm-form-title">Add New Student</h2>
        <div className="fm-form-icon">👨‍🎓</div>
      </div>

      {message && (
        <div className={`fm-message ${messageType === "success" ? "fm-message-success" : "fm-message-error"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="fm-form-group">
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Name</label>
          <div className="fm-form-line"></div>
        </div>

        {/* Department */}
        <div className="fm-form-group">
          <select name="department" value={formData.department} onChange={handleChange} className="fm-form-select" required>
            <option value="">Select Department</option>
            <option value="Common"> Common</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Marine Engineering">Marine Engineering</option>
          </select>
          <div className="fm-select-arrow">▼</div>
        </div>

        {/* Batch */}
        <div className="fm-form-group">
          <select name="batch" value={formData.batch} onChange={handleChange} className="fm-form-select" required>
            <option value="">Select Batch</option>
            <option value="22">22</option>
            <option value="23">23</option>
            <option value="24">24</option>
            <option value="25">25</option>
            <option value="26">26</option>
          </select>
          <div className="fm-select-arrow">▼</div>
        </div>

        {/* Registration Number */}
        <div className="fm-form-group">
          <input
            type="text"
            value={fullRegNo}
            onChange={(e) => {
              const fullValue = e.target.value.toUpperCase();
              const prefix = regPrefix;

              if (!formData.batch) return;

              if (fullValue.startsWith(prefix)) {
                const suffix = fullValue.slice(prefix.length).replace(/\D/g, "").slice(0, 4); // Now 4 digits
                setRegSuffix(suffix);
              } else {
                setRegSuffix("");
              }
            }}
            className="fm-form-input"
            placeholder=" "
            required
            disabled={!formData.batch}
          />
          <label className="fm-form-label">Registration Number</label>
          <div className="fm-form-line"></div>
        </div>

        {/* Email */}
        <div className="fm-form-group">
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Email</label>
          <div className="fm-form-line"></div>
        </div>

        {/* Contact */}
        <div className="fm-form-group">
          <input type="text" name="contact_no" value={formData.contact_no} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Contact Number</label>
          <div className="fm-form-line"></div>
        </div>

        {/* Lecturer in Charge */}
        <div className="fm-form-group">
          <input type="text" name="lecturer_in_charge" value={formData.lecturer_in_charge} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Lecturer in Charge</label>
          <div className="fm-form-line"></div>
        </div>

        {/* Purpose */}
        <div className="fm-form-group">
          <select name="purpose" value={formData.purpose} onChange={handleChange} className="fm-form-select">
            <option value="">Select Purpose</option>
            <option value="None">None</option>
            <option value="Chair">Chair</option>
            <option value="Rep">Rep</option>
          </select>
          <div className="fm-select-arrow">▼</div>
        </div>

        {/* Society Name */}
        {formData.purpose === "Chair" && (
          <div className="fm-form-group">
            <input type="text" name="society_name" value={formData.society_name} onChange={handleChange} className="fm-form-input" placeholder=" " required />
            <label className="fm-form-label">Society Name</label>
            <div className="fm-form-line"></div>
          </div>
        )}

        {/* Password */}
        <div className="fm-form-group">
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="fm-form-input" placeholder=" " required />
          <label className="fm-form-label">Temporary Password</label>
          <div className="fm-form-line"></div>
        </div>

        {/* Submit */}
        <div className="fm-form-button-container">
          <button type="submit" className="fm-form-button">
            <span>Confirm</span>
            <div className="fm-button-effect"></div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;
