import React, { useState, useEffect } from 'react';
import { addMonths, format, subMonths, endOfMonth, endOfWeek, startOfMonth, startOfWeek, addDays, isSameDay, isSameMonth } from "date-fns";
import axios from 'axios';
import './CalendarPage.css';

const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isScheduleVisible, setIsScheduleVisible] = useState(0);
    const [schedules, setSchedules] = useState({});
    const [schedule, setSchedule] = useState('');

    const today = new Date();

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

    // 백엔드에서 메모 데이터를 가져오는 함수
    const fetchMemos = async (year, month) => {
        try {
            const response = await axios.get('http://localhost:8080/api/calendar/memos', {
                params: { year, month }
            });
            const fetchedSchedules = {};
            response.data.forEach(item => {
                fetchedSchedules[item.date] = [item.memo]; // 메모 데이터를 스케줄로 매핑
            });
            setSchedules(fetchedSchedules);
        } catch (error) {
            console.error('메모를 가져오는 중 오류 발생:', error);
        }
    };

    // 페이지 로드 시 현재 월의 메모 데이터를 가져오기
    useEffect(() => {
        const year = format(currentMonth, 'yyyy');
        const month = format(currentMonth, 'M');
        fetchMemos(year, month);
    }, [currentMonth]);

    const handleScheduleVisible = (e) => {
        const clickedDate = e.currentTarget.getAttribute('value');
        setSelectedDate(clickedDate);
        setIsScheduleVisible(clickedDate);
    };

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, 'yyyy-MM-dd');
            const isToday = isSameDay(day, today);

            days.push(
                <div
                    className={`day-${
                        !isSameMonth(day, monthStart)
                        ? 'disabled'
                        : isSameDay(day, new Date(selectedDate))
                        ? 'selected'
                        : 'valid'
                    } day_${i} ${isToday ? 'today' : ''}`}
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

    // 메모를 백엔드에 저장하는 함수
    const onCreateNewSchedule = async () => {
        if (!schedule) return;

        try {
            await axios.post('http://localhost:8080/api/calendar/memo', {
                date: isScheduleVisible,
                memo: schedule,
            });

            // 새로 추가된 메모를 로컬 상태에 업데이트
            const currentSchedules = schedules[isScheduleVisible] || [];
            const updatedSchedules = {
                ...schedules,
                [isScheduleVisible]: [...currentSchedules, schedule],
            };

            setSchedules(updatedSchedules);
            setSchedule(''); // 입력 필드 초기화
        } catch (error) {
            console.error('메모 저장 중 오류 발생:', error);
        }
    };

    const closeModal = () => {
        setIsScheduleVisible(0);
        setSelectedDate(null);
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
                    <button className='month-button' onClick={prevMonth}>{'<<'}</button>
                    <button className='month-button' onClick={nextMonth}>{'>>'}</button>
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
