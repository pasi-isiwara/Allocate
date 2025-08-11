import React, { useState, useEffect } from "react";
import '../styles/forms.css';

const AddNoteForm = ({ mode = "add", existingNote = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    noteContent: existingNote ? existingNote.content : "",
    forWhom: existingNote ? existingNote.for_whom : "" // updated to match backend field
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (formData.noteContent.trim() === "") {
      setMessage("Note content cannot be empty.");
      setMessageType("error");
      return false;
    }
    if (formData.forWhom === "") {
      setMessage("Please select who this note is for.");
      setMessageType("error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const url =
        mode === "add"
          ? "http://localhost:5000/api/special-notes"
          : `http://localhost:5000/api/special-notes/${existingNote.id}`;

      const method = mode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formData.noteContent.trim(),
          for_whom: formData.forWhom, // use backend expected field
        }),
      });

      if (response.ok) {
        setMessage(
          mode === "add" ? "Note added successfully!" : "Note updated successfully!"
        );
        setMessageType("success");

        if (mode === "add") {
          setFormData({ noteContent: "", forWhom: "" });
        }

        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message || "Failed to save note."}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setMessage("Something went wrong!");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="fm-form-card">
      <div className="fm-form-header">
        <h2 className="fm-form-title">
          {mode === "add" ? "Add Special Note" : "Update Special Note"}
        </h2>
        <div className="fm-form-icon">📝</div>
      </div>
      <form onSubmit={handleSubmit}>
        {message && (
          <div
            className={`fm-message ${
              messageType === "success"
                ? "fm-message-success"
                : "fm-message-error"
            }`}
          >
            {message}
          </div>
        )}

        <div className="fm-form-group">
          <textarea
            name="noteContent"
            value={formData.noteContent}
            onChange={handleChange}
            className="fm-form-textarea"
            placeholder=" "
            rows={4}
            required
          />
          <label className="fm-form-label-note">Add Note</label>
          <div className="fm-form-line"></div>
        </div>

        <div className="fm-form-group">
          <select
            name="forWhom"
            value={formData.forWhom}
            onChange={handleChange}
            className="fm-form-select"
            required
          >
            <option value="">Select Recipient</option>
            <option value="students">Students</option>
            <option value="academic_staff">Academic Staff</option>
            <option value="non_academic_staff">Non-Academic Staff</option>
            <option value="all">All</option>
          </select>
          <div className="fm-select-arrow">▼</div>
        </div>

        <div className="fm-form-button-container">
          <button
            type="submit"
            className="fm-form-button"
            disabled={isSubmitting}
          >
            <span>{mode === "add" ? "Add Note" : "Update Note"}</span>
            <div className="fm-button-effect"></div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNoteForm;
