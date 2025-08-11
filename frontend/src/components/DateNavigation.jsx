import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DateNavigation.css';
export const DateNavigation = ({ currentDate, onDateChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    onDateChange(newDate);
  };
  const handleCalendarChange = (date) => {
    onDateChange(date);
    setShowCalendar(false);
  };
  const formattedDate = format(currentDate, "EEEE, do MMMM yyyy");
  return (
    <div className="date-navigation-container">
      <div className="date-navigation">
        <button 
          className="nav-button nav-button-left"
          onClick={() => navigateDate(-1)}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="date-display">
          Today - {formattedDate}
        </div>
        <button 
          className="nav-button"
          onClick={() => navigateDate(1)}
        >
          <ChevronRight size={24} />
        </button>
        <button 
          className="nav-button nav-button-right"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon size={24} />
        </button>
      </div>
      {showCalendar && (
        <div className="calendar-container">
          <Calendar 
            value={currentDate}
            onChange={handleCalendarChange}
            className="calendar"
          />
        </div>
      )}
    </div>
  );
};