import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.module.css'; // 커스텀 스타일 파일

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-container">
      <Calendar
        onChange={setDate}
        value={date}
        tileClassName={({ date, view }) => {
          // 오늘 날짜에 동그라미 표시
          if (date.toDateString() === new Date().toDateString()) {
            return 'today-circle';
          }
        }}
      />
    </div>
  );
};

export default CalendarComponent;
