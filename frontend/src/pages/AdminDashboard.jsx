import React, { useState, useEffect } from 'react';
import {
  PlusCircleIcon,
  EditIcon,
  ClipboardEditIcon,
  CalendarIcon,
  ChevronRightIcon,
  Users2Icon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


import AddHallForm from '../components/AddHallForm';
import AddStaffForm from '../components/AddStaffForm';
import AddStudentForm from '../components/AddStudentForm';
import UpdateStaffForm from '../components/UpdateStaffForm';
import UpdateStudentForm from '../components/UpdateStudentForm';
import UpdateHallForm from '../components/UpdateHallForm';
import BookLectureEventForm from '../components/BookLectureEventForm';
import AddNoteForm from '../components/AddNoteForm';
import StudentList from './StudentList';


import '../styles/AdminDashboard.css';
import '../styles/forms.css'

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('add');
  const [selectedForm, setSelectedForm] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
 
  const [specialNotes, setSpecialNotes] = useState([]);

  // ✅ Fetch special notes from backend
  const fetchNotes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/special-notes');
      const data = await res.json();
      setSpecialNotes(data);
    } catch (err) {
      console.error("❌ Error fetching special notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleModeToggle = (selectedMode) => {
    setMode(selectedMode);
    setSelectedForm(null);
    setShowAddNoteForm(false);
  };

  const handleFormClick = (formName) => {
    setSelectedForm(prev => (prev === formName ? null : formName));
    setShowAddNoteForm(false);
  };

  const renderFormComponent = () => {
    if (showAddNoteForm) {
      return <AddNoteForm onSuccess={fetchNotes} />;
    }
    switch (selectedForm) {
      case 'hall':
        return mode === 'update' ? <UpdateHallForm /> : <AddHallForm mode={mode} />;
      case 'staff':
        return mode === 'update' ? <UpdateStaffForm /> : <AddStaffForm mode={mode} />;
      case 'student':
        return mode === 'update' ? <UpdateStudentForm /> : <AddStudentForm mode={mode} />;
      case 'book':
        return <BookLectureEventForm />;
      default:
        return (
          <div className="admin-content-placeholder">
            <div className="admin-placeholder-content">
              <Users2Icon className="admin-placeholder-icon" />
              <p className="admin-placeholder-text">Dashboard content will appear here</p>
              <p className="admin-placeholder-subtext">Select an action from the buttons above</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-pane">
          <header className="admin-header">
            <h1 className="title-class">Welcome Admin</h1>
            <div className="admin-nav-buttons">
              <button className="admin-nav-button" onClick={() => navigate('/time-table')}>View Time Schedule</button>
              <button className="admin-nav-button" onClick={() => navigate('/hall-list')}>View Hall List</button>
              <button className="admin-nav-button" onClick={() => navigate('/staff-list')}>View Staff List</button>
              <button className="admin-nav-button" onClick={() => navigate('/student-list')}>View Students List</button>
            </div>
          </header>

          <main className="admin-main">
            <div className="admin-main-content">
              {/* Left */}
              <div className="admin-special-notes-section">
                <button
                  className="admin-special-notes-button"
                  onClick={() => setShowNotes(prev => !prev)}
                >
                  <span>Special Notes</span>
                  <ChevronRightIcon className={`admin-chevron-icon ${showNotes ? 'rotate' : ''}`} />
                </button>

                {showNotes && (
                  <div className="admin-notice-board">
                    {specialNotes.length === 0 ? (
                      <p className="admin-no-notices">No current special notes</p>
                    ) : (
                      specialNotes.map((note, index) => (
                        <div className="admin-notice-item" key={note.id || index}>
                          <span className="admin-red-dot" />
                          <span className="admin-notice-text">{note.content}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <button
                  className={`admin-book-button ${selectedForm === 'book' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedForm(prev => (prev === 'book' ? null : 'book'));
                    setMode('add');
                    setShowAddNoteForm(false);
                  }}
                >
                  <CalendarIcon className="card-icon" />
                  <span>Book Lecture/Event</span>
                </button>

                <button
                  className={`admin-note-button ${showAddNoteForm ? 'active' : ''}`}
                  onClick={() => {
                    setShowAddNoteForm(prev => !prev);
                    setSelectedForm(null);
                    setMode('add');
                  }}
                >
                  <EditIcon className="card-icon" />
                  <span>Add Special Note</span>
                </button>
              </div>

              {/* Right */}
              <div className="admin-action-section">
                <div className="admin-action-buttons">
                  <button
                    className={`admin-toggle-button ${mode === 'add' ? 'selected' : 'unselected'}`}
                    onClick={() => handleModeToggle('add')}
                  >
                    <PlusCircleIcon className="admin-button-icon" />
                    <span>Add New</span>
                  </button>
                  <button
                    className={`admin-toggle-button ${mode === 'update' ? 'selected' : 'unselected'}`}
                    onClick={() => handleModeToggle('update')}
                  >
                    <ClipboardEditIcon className="admin-button-icon" />
                    <span>Update</span>
                  </button>
                </div>

                <div className="admin-edit-buttons">
                  <button
                    className={`admin-edit-button ${selectedForm === 'staff' ? 'active' : ''}`}
                    onClick={() => handleFormClick('staff')}
                  >
                    {mode === 'add' ? <PlusCircleIcon className="admin-button-icon" /> : <EditIcon className="admin-button-icon" />}
                    <span>Staff</span>
                  </button>
                  <button
                    className={`admin-edit-button ${selectedForm === 'student' ? 'active' : ''}`}
                    onClick={() => handleFormClick('student')}
                  >
                    {mode === 'add' ? <PlusCircleIcon className="admin-button-icon" /> : <EditIcon className="admin-button-icon" />}
                    <span>Student</span>
                  </button>
                  <button
                    className={`admin-edit-button ${selectedForm === 'hall' ? 'active' : ''}`}
                    onClick={() => handleFormClick('hall')}
                  >
                    {mode === 'add' ? <PlusCircleIcon className="admin-button-icon" /> : <EditIcon className="admin-button-icon" />}
                    <span>Hall</span>
                  </button>
                </div>
              </div>
            </div>

            {(selectedForm || showAddNoteForm) && (
              <div className="admin-form-wrapper">
                {renderFormComponent()}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
