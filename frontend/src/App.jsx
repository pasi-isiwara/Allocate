import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Home from "./pages/Home";
import AdminDashboard from './pages/AdminDashboard'; // Uncomment if you want to use AdminDashboard
import StaffList from "./pages/StaffList";
import HallList from './pages/HallList'; // Uncomment if you want to use HallList
import Hall from './pages/Hall'; // Uncomment if you want to use Hall
import { TimeTable } from "./components/TimeTable";
import { HallBookings } from "./pages/HallBookings";
import UserDashboard from "./pages/UserDashboard";
import StudentList from "./pages/StudentList";
import HallListUser from "./pages/HallListUser";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/staff-list" element={<StaffList />} />
        <Route path="/student-list" element={<StudentList />} />
        <Route path="/hall-list" element={<HallList />} />
        <Route path="/uhall-list" element={<HallListUser />} />
        <Route path="/hall/:id" element={<Hall />} />
        <Route path="/time-table" element={<TimeTable />} />
        <Route path="/hall-time-table/:hallId" element={<HallBookings />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />




        
        
        
        {/* Add more routes as needed */}
    
      </Routes>
    </BrowserRouter>
  );
}

export default App;
