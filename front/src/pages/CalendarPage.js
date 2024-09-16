import React, { useState } from 'react';
import { addMonths, format, subMonths, endOfMonth, endOfWeek, startOfMonth, startOfWeek, addDays, isSameDay, isSameMonth } from "date-fns";
import './CalendarPage.css';

const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isScheduleVisible, setIsScheduleVisible] = useState(0);
    const [schedules, setSchedules] = useState({}); // 일정 데이터를 날짜별로 저장하는 객체
    const [schedule, setSchedule] = useState('');

    const today = new Date(); // 오늘 날짜

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    const handleScheduleVisible = (e) => {
        const clickedDate = e.currentTarget.getAttribute('value');
        setSelectedDate(clickedDate); // 선택된 날짜 업데이트
        setIsScheduleVisible(clickedDate); // 모달 창에 표시할 날짜 업데이트
    };

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, 'yyyy-MM-dd'); // 날짜 형식을 'yyyy-MM-dd'로 통일
            const isToday = isSameDay(day, today); // 오늘 날짜와 비교

            days.push(
                <div
                    className={`day-${
                        !isSameMonth(day, monthStart)
                        ? 'disabled'
                        : isSameDay(day, new Date(selectedDate))
                        ? 'selected'
                        : 'valid'
                    } day_${i} ${isToday ? 'today' : ''}`} // 오늘 날짜에 'today' 클래스 추가
                    key={day}
                    value={formattedDate}
                    onClick={handleScheduleVisible}
                >
                    <span className={format(currentMonth, 'M') !== format(day, 'M') ? 'text-not-valid' : 'text-valid'}>
                        {format(day, 'd')}
                    </span>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className='row' key={day}>
                {days}
            </div>
        );
        days = [];
    }

    const handleSchedule = (e) => setSchedule(e.target.value);

    const onCreateNewSchedule = () => {
        if (!schedule) return;

        // 해당 날짜의 기존 일정을 불러오고 없으면 빈 배열로 초기화
        const currentSchedules = schedules[isScheduleVisible] || [];

        // 해당 날짜에 새로운 일정 추가
        const updatedSchedules = {
            ...schedules,
            [isScheduleVisible]: [...currentSchedules, schedule],
        };

        setSchedules(updatedSchedules); // 상태 업데이트
        setSchedule(''); // 입력 필드 초기화
    };

    const closeModal = () => {
        setIsScheduleVisible(0); // 모달 닫기
        setSelectedDate(null); // 선택한 날짜 초기화
    };

    return (
        <div className="calendar">
            <div className='Header'>
                <div className='left-col'>
                    <div className='current-month'>
                        {format(currentMonth, 'M')}월
                    </div>
                    <div className='current-year'>
                        {format(currentMonth, 'yyyy')}
                    </div>
                </div>
                <div className='right-col'>
                    <button className='month-button' onClick={prevMonth}>{'<<'}</button> {/* << 로 표시 */}
                    <button className='month-button' onClick={nextMonth}>{'>>'}</button> {/* >> 로 표시 */}
                </div>
            </div>

            <div className='Days'>
                <ul className='days-list'>
                    {daysOfWeek.map((day, idx) => (
                        <li key={idx} className={`days days_${idx}`}>
                            {day}
                        </li>
                    ))}
                </ul>
            </div>

            <div className='CalendarBody'>
                {rows}
                {isScheduleVisible !== 0 ? (
                    <div className='CalendarSchedule'>
                        <h1>Schedule {isScheduleVisible}</h1>
                        <button className='modal-close-button' onClick={closeModal}>{'<<'}</button>
                        <div className='new-schedule-wrapper'>
                            <input type='text' className='new-schedule-input' value={schedule} onChange={handleSchedule} />
                            <button className='new-schedule-button' onClick={onCreateNewSchedule}>일정 추가하기</button>
                        </div>
                        <ul className='schedule-item-wrapper'>
                            {(schedules[isScheduleVisible] || []).map((scheduleItem, idx) => (
                                <li className='schedule-item' key={idx}>{scheduleItem}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default CalendarPage;
