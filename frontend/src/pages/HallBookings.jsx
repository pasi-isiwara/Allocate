import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export const HallBookings = () => {
  const { hallId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [hallName, setHallName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchHallInfo = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/halls/${hallId}`);
        setHallName(res.data.name);
      } catch (err) {
        console.error("Failed to fetch hall info:", err);
        setError("Failed to fetch hall info.");
      }
    };

    fetchHallInfo();
  }, [hallId]);

  const fetchBookings = async () => {
    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      setBookings([]);

      const res = await axios.get(`http://localhost:5000/api/info/hall/${hallId}`, {
        params: { date: selectedDate }
      });

      console.log("✅ [Bookings Fetched]:", res.data);
      setBookings(res.data);
    } catch (err) {
      console.error("❌ [Error fetching bookings]:", err);
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Bookings for Hall: {hallName || hallId}</h2>

      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="date">Select Date: </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button onClick={fetchBookings} style={{ marginLeft: 10 }}>Search</button>
      </div>

      {loading && <p>Loading bookings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {bookings.length === 0 && !loading && !error ? (
        <p>No bookings found for this hall on this date.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Module Code</th>
              <th>Event Name</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={i}>
                <td>{b.start_time?.slice(0, 5)}</td>
                <td>{b.end_time?.slice(0, 5)}</td>
                <td>{b.module_code || '-'}</td>
                <td>{b.event_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
