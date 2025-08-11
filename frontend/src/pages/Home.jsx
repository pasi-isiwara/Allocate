import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("allocate-home-active");
    return () => {
      document.body.classList.remove("allocate-home-active");
    };
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/special-notes/all");
        if (response.ok) {
          const data = await response.json();
          setNotices(data);
        } else {
          console.error("Failed to fetch notices");
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="allocate-home-container">
      <div className="allocate-home-background">
        <div className="allocate-gradient-overlay"></div>
      </div>
      <div className="allocate-content-wrapper">
        <div className="allocate-main-content">
          <h1 className="allocate-title allocate-animate-element">Welcome to Allocate</h1>
          <div className="allocate-subtitle allocate-animate-element">
            Hall allocation & Event Management System of
          </div>
          <div className="allocate-subtitle allocate-animate-element">
             The Faculty of Engineering,University of Ruhuna
          </div>
          <div className="allocate-description allocate-animate-element">
            <p>
              This is the home page of the Allocate system, where you can manage
              hall allocations and events efficiently.
            </p>
          </div>
          <div className="allocate-button-group allocate-animate-element">
            <button
              className="allocate-primary-button"
              onClick={() => navigate("/time-table")}
            >
              <span className="allocate-button-text">See Time table</span>
            </button>
            <button
              className="allocate-secondary-button"
              onClick={() => navigate("/login")}
            >
              <span className="allocate-button-text">Log in</span>
            </button>
          </div>
        </div>

        {/* Special Notices Panel */}
        <div className="allocate-notices-panel allocate-animate-element">
          <div className="allocate-notices-content">
            <h3>Special Notices</h3>
            <div className="allocate-notice-items">
              {loading ? (
                <p>Loading notices...</p>
              ) : notices.length > 0 ? (
                notices.map((note) => (
                  <p key={note.id}>📝 {note.content}</p>
                ))
              ) : (
                <>
                  <p>No current notices at this time.</p>
                  <p>Check back later for updates.</p>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
