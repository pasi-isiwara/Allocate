import express from "express";
const router = express.Router();

// ✅ Add New Hall
router.post("/halls", (req, res) => {
  const db = req.db;

  const {
    name,
    main_building,
    no_of_seats,
    ac_available,
    no_of_projectors,
    assigned_tech_officer
  } = req.body;

  const sql = `
    INSERT INTO Halls (name, main_building, no_of_seats, ac_available, no_of_projectors, assigned_tech_officer)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, main_building, no_of_seats, ac_available, no_of_projectors, assigned_tech_officer],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting into DB:", err);
        return res.status(500).json({ message: "Database insertion failed" });
      }
      res.status(200).json({ message: "Hall added successfully" });
    }
  );
});

// ✅ Search Halls by Name
router.get("/halls/search", async (req, res) => {
  const db = req.db;
  const query = `%${req.query.query || ""}%`;

  try {
    const [rows] = await db.query("SELECT * FROM Halls WHERE name LIKE ?", [query]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

// ✅ Update Hall
router.put("/halls/:id", async (req, res) => {
  const db = req.db;
  const id = req.params.id;

  const {
    name,
    main_building,
    no_of_seats,
    ac_available,
    no_of_projectors,
    assigned_tech_officer
  } = req.body;

  const sql = `
    UPDATE Halls SET
      name = ?, main_building = ?, no_of_seats = ?, ac_available = ?,
      no_of_projectors = ?, assigned_tech_officer = ?
    WHERE hall_id = ?
  `;

  try {
    const [result] = await db.query(sql, [
      name,
      main_building,
      no_of_seats,
      ac_available,
      no_of_projectors,
      assigned_tech_officer,
      id
    ]);
    res.json({ message: "Hall updated successfully" });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

// ✅ 🔥 New: Get All Halls (For Frontend Listing)
router.get("/halls", async (req, res) => {
  const db = req.db;

  try {
    const [rows] = await db.query("SELECT * FROM Halls ORDER BY hall_id ASC");
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch halls" });
  }
});
// ✅ Get a Specific Hall by ID
router.get("/halls/:id", async (req, res) => {
  const db = req.db;
  const id = req.params.id;

  try {
    const [rows] = await db.query("SELECT * FROM Halls WHERE hall_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Hall not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch hall" });
  }
});

// ✅ Delete a Hall by ID
router.delete("/halls/:id", async (req, res) => {
  const db = req.db;
  const id = req.params.id;

  try {
    const [result] = await db.query("DELETE FROM Halls WHERE hall_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Hall not found" });
    }

    res.status(200).json({ message: "Hall deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Failed to delete hall" });
  }
});





export default router;
