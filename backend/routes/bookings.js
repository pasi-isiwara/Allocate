import express from "express"
const router = express.Router()

// ✅ Step 1: Check Availability
router.post("/check-availability", async (req, res) => {
  const db = req.db
  const { date, hallName, startTime, endTime } = req.body

  try {
    const [[hall]] = await db.query(
      "SELECT hall_id FROM Halls WHERE name = ?",
      [hallName]
    )

    if (!hall) {
      return res.status(404).json({ message: "Hall not found" })
    }

    const hallId = hall.hall_id

    const [clashes] = await db.query(
      `
      SELECT t.*, 
             m.module_code AS module_code, 
             e.name AS event_name 
      FROM Timetable t
      LEFT JOIN Modules m ON t.module_id = m.module_id
      LEFT JOIN Events e ON t.event_id = e.event_id
      WHERE t.hall_id = ? AND t.date = ?
        AND (
          (t.start_time < ? AND t.end_time > ?) OR
          (t.start_time < ? AND t.end_time > ?) OR
          (t.start_time >= ? AND t.end_time <= ?)
        )
      `,
      [
        hallId,
        date,
        endTime, startTime,
        endTime, endTime,
        startTime, endTime
      ]
    )

    if (clashes.length > 0) {
      const formattedClashes = clashes.map(entry => ({
        date: entry.date,
        start_time: entry.start_time,
        end_time: entry.end_time,
        type: entry.module_id ? "Lecture" : "Event",
        name: entry.module_id ? entry.module_code : entry.event_name
      }))

      return res.json({ available: false, clashes: formattedClashes })
    }

    res.json({ available: true })
  } catch (err) {
    console.error("❌ Availability check error:", err)
    res.status(500).json({ message: "Availability check failed" })
  }
})

// ✅ Step 2: Create Booking
router.post("/bookings", async (req, res) => {
  const db = req.db
  const {
    bookingType,
    moduleCode,
    eventName,
    targetBatch,
    department,
    date,
    startTime,
    endTime,
    hallName
  } = req.body

  try {
    let moduleId = null
    let eventId = null
    const userId = 1 // 🔐 Later: pull from session
    const [[hall]] = await db.query("SELECT hall_id FROM Halls WHERE name = ?", [hallName])

    if (!hall) return res.status(400).json({ message: "Invalid hall name" })
    const hallId = hall.hall_id

    if (bookingType === "Lecture") {
      const [[mod]] = await db.query("SELECT module_id FROM Modules WHERE module_code = ?", [moduleCode])
      if (!mod) return res.status(400).json({ message: "Invalid module code" })
      moduleId = mod.module_id

      await db.query(
        `INSERT INTO Timetable (hall_id, date, start_time, end_time, module_id)
         VALUES (?, ?, ?, ?, ?)`,
        [hallId, date, startTime, endTime, moduleId]
      )
    } else if (bookingType === "Event") {
      const [eventResult] = await db.query(
        `INSERT INTO Events (name, society, target_group, lecturer_incharge_id)
         VALUES (?, ?, ?, ?)`,
        [eventName, null, `${targetBatch} ${department}`, userId]
      )
      eventId = eventResult.insertId

      await db.query(
        `INSERT INTO Timetable (hall_id, date, start_time, end_time, event_id)
         VALUES (?, ?, ?, ?, ?)`,
        [hallId, date, startTime, endTime, eventId]
      )
    }

    await db.query(
      `INSERT INTO Bookings (hall_id, user_id, booking_type, start_time, end_time, module_id, event_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [hallId, userId, bookingType, `${date} ${startTime}`, `${date} ${endTime}`, moduleId, eventId]
    )

    res.status(200).json({ message: "✅ Booking successful" })
  } catch (err) {
    console.error("❌ Booking creation error:", err)
    res.status(500).json({ message: "Booking failed" })
  }
})

export default router
