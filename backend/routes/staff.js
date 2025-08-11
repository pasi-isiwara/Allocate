import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// Add new staff member
router.post("/staff", async (req, res) => {
  const pool = req.db;
  const {
    name,
    regNumber,
    department,
    email,
    contactNumber,
    staffType,
    teachingModules,
    password
  } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO staff (
        name, reg_number, department, email, contact_number, staff_type, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, regNumber, department, email, contactNumber, staffType, password_hash];

    const conn = await pool.getConnection();
    const [result] = await conn.query(sql, values);

    // If Academic, handle module insertion
    if (staffType === "Academic" && teachingModules) {
      const modules = teachingModules.split(",").map(m => m.trim());

      for (const moduleCode of modules) {
        const [modRows] = await conn.query("SELECT module_id FROM Modules WHERE module_code = ?", [moduleCode]);
        let moduleId;
        if (modRows.length > 0) {
          moduleId = modRows[0].module_id;
        } else {
          const [newMod] = await conn.query("INSERT INTO Modules (module_code, name) VALUES (?, ?)", [moduleCode, moduleCode]);
          moduleId = newMod.insertId;
        }

        await conn.query("INSERT INTO staff_modules (staff_id, module_id) VALUES (?, ?)", [result.insertId, moduleId]);
      }
    }

    conn.release();
    console.log("✅ New staff added:", { staff_id: result.insertId, name, regNumber, staffType });
    res.status(201).json({ message: "Staff added", staffId: result.insertId });

  } catch (err) {
    console.error("❌ Error inserting staff:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Search staff by name or reg number
router.get("/staff/search", async (req, res) => {
  const pool = req.db;
  const query = `%${req.query.query || ""}%`;
  try {
    const [rows] = await pool.query(
      `SELECT staff_id, name, reg_number, email, contact_number, department, staff_type
       FROM staff
       WHERE name LIKE ? OR reg_number LIKE ?`,
      [query, query]
    );
    console.log(`🔍 Search query: "${req.query.query}", results found: ${rows.length}`);
    res.json(rows);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Update staff info by staff_id
router.put("/staff/:id", async (req, res) => {
  const pool = req.db;
  const staff_id = req.params.id;
  const {
    name, regNumber, department, email, contactNumber, staffType,
    teachingModules, password
  } = req.body;

  try {
    const conn = await pool.getConnection();
    const updates = [
      name, regNumber, department, email, contactNumber, staffType
    ];

    let sql = `
      UPDATE staff SET
        name = ?, reg_number = ?, department = ?, email = ?,
        contact_number = ?, staff_type = ?
    `;

    if (password && password.trim()) {
      const hash = await bcrypt.hash(password, 10);
      sql += `, password_hash = ?`;
      updates.push(hash);
    }

    sql += ` WHERE staff_id = ?`;
    updates.push(staff_id);

    const [updateResult] = await conn.query(sql, updates);
    console.log(`🛠️ Updated staff ID ${staff_id}, affected rows: ${updateResult.affectedRows}`);

    if (staffType === "Academic" && teachingModules) {
      const modules = teachingModules.split(",").map(m => m.trim());

      await conn.query("DELETE FROM staff_modules WHERE staff_id = ?", [staff_id]);
      console.log(`🧹 Cleared previous modules for staff ID ${staff_id}`);

      for (const code of modules) {
        const [modRows] = await conn.query("SELECT module_id FROM Modules WHERE module_code = ?", [code]);
        let moduleId;
        if (modRows.length) {
          moduleId = modRows[0].module_id;
        } else {
          const [newMod] = await conn.query("INSERT INTO Modules (module_code, name) VALUES (?, ?)", [code, code]);
          moduleId = newMod.insertId;
        }
        await conn.query("INSERT INTO staff_modules (staff_id, module_id) VALUES (?, ?)", [staff_id, moduleId]);
        console.log(`➕ Linked module ${code} (ID: ${moduleId}) to staff ID ${staff_id}`);
      }
    }

    conn.release();
    res.json({ message: "Staff updated successfully" });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ✅ NEW: Get all staff (or filter by type)
router.get("/staff", async (req, res) => {
  const pool = req.db;
  const staffType = req.query.type; // "Academic" or "Non-Academic"

  try {
    let sql = `
      SELECT staff_id, name, reg_number, department, email, contact_number, staff_type
      FROM staff
    `;
    const params = [];

    if (staffType) {
      sql += " WHERE staff_type = ?";
      params.push(staffType);
    }

    sql += " ORDER BY name ASC";

    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error fetching staff:", err);
    res.status(500).json({ error: "Failed to retrieve staff data" });
  }
});

router.delete('/staff/:id', async (req, res) => {
  const db = req.db;
  const id = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM staff WHERE staff_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ message: 'Failed to delete staff member' });
  }
});


export default router;
