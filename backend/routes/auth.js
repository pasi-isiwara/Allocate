import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();

router.post('/login', async (req, res) => {
  const { reg_no, password } = req.body;
  const pool = req.db; // ensure this is set up properly

  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE reg_no = ?', [reg_no]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      userType: user.user_type,
      userId: user.user_id,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
