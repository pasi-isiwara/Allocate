import express from "express";
import cors from "cors";
import mysql from "mysql2/promise"; // ✅ async pool
import hallsRoute from "./routes/halls.js";
import studentsRoute from "./routes/students.js";
import staffRoute from "./routes/staff.js";
import bookingsRoute from "./routes/bookings.js";
import timetableRoute from "./routes/timetable.js";
import authRoute from "./routes/auth.js";
import notesRoutes from "./routes/notes.js"; 






const app = express();
// ✅ MySQL connection pool
const pool = mysql.createPool({
  host: "b8u44htp15rsrlofpmed-mysql.services.clever-cloud.com",
  user: "uozuyogr9orhausb",
  password: "JzWogBWVVNIJ0R8ah1k7",
  database: "b8u44htp15rsrlofpmed",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());
app.use(express.json());

// ✅ Attach pool to req
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// ✅ Routes
app.use("/api", hallsRoute);
app.use("/api", studentsRoute);
app.use("/api", staffRoute);
app.use("/api", bookingsRoute);
app.use("/api", timetableRoute);
app.use("/api", authRoute);
app.use("/api", notesRoutes);




app.get("/", (req, res) => {
  res.send("Hello from server!");
});

// Function to test DB connection
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping(); // ping to check connection alive
    connection.release();
    console.log("✅ Successfully connected to the database.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1); // Exit process if DB connection fails
  }
}

// Start server only after DB connection check
testDbConnection().then(() => {
  app.listen(5000, () => {
    console.log("🚀 Server running at http://localhost:5000");
  });
});
