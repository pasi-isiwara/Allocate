import express from "express";
const router = express.Router();

// 📅 Fetch timetable for a specific date
router.get("/info", async (req, res) => {
  const pool = req.db;
  const selectedDate = req.query.date;

  if (!selectedDate) {
    return res.status(400).send("Missing date parameter");
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        t.hall_id,
        h.name AS hall_name,
        DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
        TIME_FORMAT(t.start_time, '%H:%i:%s') AS start_time,
        TIME_FORMAT(t.end_time, '%H:%i:%s') AS end_time,
        m.module_code,
        e.name AS event_name
      FROM Timetable t
      LEFT JOIN Halls h ON t.hall_id = h.hall_id
      LEFT JOIN Modules m ON t.module_id = m.module_id
      LEFT JOIN Events e ON t.event_id = e.event_id
      WHERE t.date = ?
    `, [selectedDate]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching timetable:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 🗂️ Fetch all timetable entries
router.get("/info/all", async (req, res) => {
  const pool = req.db;

  try {
    const [rows] = await pool.query(`
      SELECT 
        t.hall_id,
        h.name AS hall_name,
        DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
        TIME_FORMAT(t.start_time, '%H:%i:%s') AS start_time,
        TIME_FORMAT(t.end_time, '%H:%i:%s') AS end_time,
        m.module_code,
        e.name AS event_name
      FROM Timetable t
      LEFT JOIN Halls h ON t.hall_id = h.hall_id
      LEFT JOIN Modules m ON t.module_id = m.module_id
      LEFT JOIN Events e ON t.event_id = e.event_id
    `);

    console.log("📤 All timetable records sent:", rows.length);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching all timetable data:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/info/hall/:hallId", async (req, res) => {
  const pool = req.db;
  const hallId = req.params.hallId;
  const selectedDate = req.query.date;

  if (!selectedDate) {
    return res.status(400).send("Missing date parameter");
  }

  try {
    // Fetch all bookings (Timetable + Bookings) for the hall (without date filter)
    const [rows] = await pool.query(`
      SELECT 
        t.hall_id,
        h.name AS hall_name,
        DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
        TIME_FORMAT(t.start_time, '%H:%i:%s') AS start_time,
        TIME_FORMAT(t.end_time, '%H:%i:%s') AS end_time,
        m.module_code,
        e.name AS event_name
      FROM Timetable t
      LEFT JOIN Halls h ON t.hall_id = h.hall_id
      LEFT JOIN Modules m ON t.module_id = m.module_id
      LEFT JOIN Events e ON t.event_id = e.event_id
      WHERE t.hall_id = ?

      UNION

      SELECT 
        b.hall_id,
        h.name AS hall_name,
        DATE_FORMAT(b.start_time, '%Y-%m-%d') AS date,
        TIME_FORMAT(b.start_time, '%H:%i:%s') AS start_time,
        TIME_FORMAT(b.end_time, '%H:%i:%s') AS end_time,
        m.module_code,
        e.name AS event_name
      FROM Bookings b
      LEFT JOIN Halls h ON b.hall_id = h.hall_id
      LEFT JOIN Modules m ON b.module_id = m.module_id
      LEFT JOIN Events e ON b.event_id = e.event_id
      WHERE b.hall_id = ? AND b.status = 'Booked'

      ORDER BY start_time
    `, [hallId, hallId]);

    // Filter in JS by selectedDate
    const filteredRows = rows.filter(row => row.date === selectedDate);

    res.json(filteredRows);
  } catch (error) {
    console.error("❌ Error fetching hall bookings:", error);
    res.status(500).send("Internal Server Error");
  }
});



export default router;
