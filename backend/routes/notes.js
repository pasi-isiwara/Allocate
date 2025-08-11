import express from "express";
const router = express.Router();

// ✅ Add New Special Note
router.post("/special-notes", async (req, res) => {
  const db = req.db;
  const { content, for_whom } = req.body;

  if (!content || !for_whom) {
    return res.status(400).json({ message: "Missing content or for_whom." });
  }

  try {
    await db.query(
      "INSERT INTO SpecialNotes (content, for_whom) VALUES (?, ?)",
      [content, for_whom]
    );
    res.status(201).json({ message: "Note added successfully" });
  } catch (err) {
    console.error("❌ Insert error:", err);
    res.status(500).json({ message: "Failed to add note" });
  }
});

// ✅ Update a Special Note
router.put("/special-notes/:id", async (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { content, for_whom } = req.body;

  if (!content || !for_whom) {
    return res.status(400).json({ message: "Missing content or for_whom." });
  }

  try {
    const [result] = await db.query(
      "UPDATE SpecialNotes SET content = ?, for_whom = ? WHERE id = ?",
      [content, for_whom, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note updated successfully" });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Failed to update note" });
  }
});

// ✅ Get All Notes
router.get("/special-notes", async (req, res) => {
  const db = req.db;

  try {
    const [rows] = await db.query(
      "SELECT * FROM SpecialNotes ORDER BY created_at DESC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Fetch all notes error:", err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// ✅ Get Notes for 'all' (for Homepage)
router.get("/special-notes/all", async (req, res) => {
  const db = req.db;

  try {
    const [rows] = await db.query(
      "SELECT * FROM SpecialNotes WHERE for_whom = 'all' ORDER BY created_at DESC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Fetch public notes error:", err);
    res.status(500).json({ message: "Failed to fetch public notes" });
  }
});

// ✅ Get a Specific Note by ID
router.get("/special-notes/:id", async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM SpecialNotes WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("❌ Fetch note by ID error:", err);
    res.status(500).json({ message: "Failed to fetch note" });
  }
});

// ✅ Delete a Note by ID
router.delete("/special-notes/:id", async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM SpecialNotes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Failed to delete note" });
  }
});

export default router;
