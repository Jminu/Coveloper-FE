import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Link } from 'react-router-dom';
import './Calendar.css'; // 커스텀 스타일 파일

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-container">
      <Calendar
        onChange={setDate}
        value={date}
        locale="en-US"
        tileClassName={({ date, view }) => {
          // 오늘 날짜에 동그라미 표시
          if (date.toDateString() === new Date().toDateString()) {
            return 'today-circle';
          }
        }}
      />
      {/* 더보기 링크를 캘린더 하단에 넣음 */}
      <div className="more-link">
        <Link to="/CalendarPage">더보기</Link>
      </div>
    </div>
  );
};

export default CalendarComponent;
