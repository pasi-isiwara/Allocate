import React from 'react';
import './TimeTableContent.css';

// Generate a consistent color for each label
const getColorForLabel = (label) => {
  const colors = [
    '#A3E4D7', '#AED6F1', '#F9E79F', '#F5B7B1', '#D2B4DE',
    '#FADBD8', '#D5F5E3', '#FDEBD0', '#F9E79F', '#A9CCE3'
  ];
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const TimeTableContent = ({ timeSlots, halls, moduleData }) => {
  const getModuleForSlot = (hall, timeSlot) => {
    const key = `${hall}-${timeSlot}`;
    const value = moduleData[key] || "";
    return value;
  };

  return (
    <div className="timetable-content-container">
      <table className="timetable">
        <thead>
          <tr>
            <th className="time-header">Time</th>
            {halls.map((hall) => (
              <th key={hall} className="hall-header">{hall}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.time}>
              <td className="time-cell">{slot.formattedTime}</td>
              {halls.map((hall) => {
                const label = getModuleForSlot(hall, slot.time);
                const bgColor = label ? getColorForLabel(label) : "transparent";

                return (
                  <td
                    key={`${hall}-${slot.time}`}
                    className="module-cell"
                    style={{
                      backgroundColor: bgColor,
                      fontWeight: label ? "bold" : "normal",
                      textAlign: "center"
                    }}
                  >
                    {label || "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
