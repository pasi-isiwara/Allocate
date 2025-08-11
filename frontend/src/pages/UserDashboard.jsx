import React, { useState, useEffect } from 'react'
import { CalendarIcon, ChevronRightIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import BookLectureEventForm from '../components/BookLectureEventForm'

import '../styles/AdminDashboard.css' // reuse admin styles for consistency

export default function UserDashboard() {
  const navigate = useNavigate()
  const [showNotes, setShowNotes] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [specialNotes, setSpecialNotes] = useState([])

  // Fetch notes from backend and filter for students and all
  const fetchNotes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/special-notes')
      const data = await res.json()
      const filteredNotes = data.filter(
        note => note.target === 'students' || note.target === 'all'
      )
      setSpecialNotes(filteredNotes)
    } catch (err) {
      console.error("Error fetching special notes:", err)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-pane">
          {/* Header Section */}
          <header className="admin-header">
            <h1 className="title-class">Welcome User</h1>
            <div className="admin-nav-buttons">
              <button
                className="admin-nav-button"
                onClick={() => navigate('/time-table')}
              >
                View Time Schedule
              </button>
              <button
                className="admin-nav-button"
                onClick={() => navigate('/uhall-list')}
              >
                View Hall List
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="admin-main">
            <div className="admin-main-content">
              {/* Left Section */}
              <div className="admin-special-notes-section">
                <button
                  className="admin-special-notes-button"
                  onClick={() => setShowNotes(prev => !prev)}
                >
                  <span>Special Notes</span>
                  <ChevronRightIcon
                    className={`admin-chevron-icon ${showNotes ? 'rotate' : ''}`}
                  />
                </button>

                {showNotes && (
                  <div className="admin-notice-board">
                    {specialNotes.length === 0 ? (
                      <p className="admin-no-notices">No special notes for you</p>
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

                {/* Book Lecture/Event Button */}
                <button
                  className={`admin-book-button ${showBookingForm ? 'active' : ''}`}
                  onClick={() => setShowBookingForm(prev => !prev)}
                >
                  <CalendarIcon className="card-icon" />
                  <span>Book Lecture/Event</span>
                </button>
              </div>

              {/* Right Section */}
              <div className="admin-action-section">
                {showBookingForm && (
                  <div className="admin-form-wrapper">
                    <BookLectureEventForm />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
