import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/students", async (req, res) => {
  const pool = req.db;
  const {
    reg_no, name, email, contact_no, department,
    batch, purpose, society_name, lecturer_in_charge,
    password, user_type
  } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO Users (
        reg_no, name, email, contact_no, department,
        user_type, batch, purpose, society_name,
        lecturer_in_charge, password_hash
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      reg_no, name, email, contact_no, department,
      user_type, batch, purpose || "None", society_name,
      lecturer_in_charge, password_hash
    ];

    const conn = await pool.getConnection();
    const [result] = await conn.query(sql, values);
    conn.release();

    res.status(201).json({ message: "Student added", studentId: result.insertId });

  } catch (err) {
    console.error("❌ Error inserting student:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// In routes/students.js
router.get("/students/search", async (req, res) => {
  const pool = req.db;
  const query = req.query.query;

  try {
    console.log("🔍 Searching students for query:", query);

    const sql = `
      SELECT user_id, reg_no, name 
      FROM Users 
      WHERE user_type = 'Student' AND 
            (name LIKE ? OR reg_no LIKE ?)
      LIMIT 10
    `;
    const values = [`%${query}%`, `%${query}%`];

    const conn = await pool.getConnection();
    const [rows] = await conn.query(sql, values);
    conn.release();

    console.log("✅ Search returned", rows.length, "results");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error during student search:", err);
    res.status(500).json({ error: "Search failed" });
  }
});


// In routes/students.js
router.put("/students/:id", async (req, res) => {
  const pool = req.db;
  const studentId = req.params.id;
  const {
    name, reg_no, email, contact_no, department,
    batch, purpose, society_name, lecturer_in_charge, password
  } = req.body;

  try {
    console.log(`✏️ Updating student with ID ${studentId}`);

    let updateSql = `
      UPDATE Users SET
        name = ?, reg_no = ?, email = ?, contact_no = ?,
        department = ?, batch = ?, purpose = ?, society_name = ?, 
        lecturer_in_charge = ?
    `;
    const values = [
      name, reg_no, email, contact_no,
      department, batch, purpose || "None", society_name || "",
      lecturer_in_charge
    ];

    // If password is provided, hash and include it
    if (password && password.trim() !== "") {
      const password_hash = await bcrypt.hash(password, 10);
      updateSql += `, password_hash = ?`;
      values.push(password_hash);
      console.log("🔐 Password will be updated.");
    }

    updateSql += ` WHERE user_id = ? AND user_type = 'Student'`;
    values.push(studentId);

    const conn = await pool.getConnection();
    const [result] = await conn.query(updateSql, values);
    conn.release();

    if (result.affectedRows === 0) {
      console.warn("⚠️ No student found with that ID or no change made.");
      return res.status(404).json({ error: "Student not found" });
    }

    console.log("✅ Student updated successfully");
    res.json({ message: "Student updated successfully" });

  } catch (err) {
    console.error("❌ Error updating student:", err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

router.get("/students/:id", async (req, res) => {
  const pool = req.db;
  const studentId = req.params.id;

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT * FROM Users WHERE user_id = ? AND user_type = 'Student'`,
      [studentId]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching student:", err);
    res.status(500).json({ error: "Failed to retrieve student" });
  }
});

// GET /students?type=student  (or just GET /students to fetch all students)
// If you want, restrict only to 'student' type for safety here.
router.get("/students", async (req, res) => {
  const pool = req.db;
  const userType = req.query.type || 'Student'; // default to Student if not specified

  if (userType.toLowerCase() !== 'student') {
    return res.status(400).json({ error: "This endpoint only supports type=Student" });
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT user_id, reg_no, name, email, contact_no, department, batch 
       FROM Users 
       WHERE user_type = ?`,
      [userType]
    );
    conn.release();

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// DELETE /students/:id  - Delete a student by user_id
router.delete("/students/:id", async (req, res) => {
  const pool = req.db;
  const studentId = req.params.id;

  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      "DELETE FROM Users WHERE user_id = ? AND user_type = 'Student'",
      [studentId]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found or already deleted" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting student:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

export default router;
