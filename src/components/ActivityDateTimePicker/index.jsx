/**
 * ActivityDateTimePicker
 *
 * A popup date + time picker that shows a calendar on the left and a
 * scrollable time column on the right — matching the style in the design
 * spec. Built on react-datepicker (already installed).
 *
 * Props:
 *   date     {string}   YYYY-MM-DD   current date value
 *   time     {string}   HH:MM        current time value
 *   onChange {function} ({ date, time }) => void
 *   disabled {boolean}
 */
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/* ── Merge YYYY-MM-DD + HH:MM → JS Date ──────────────────────────────────── */
const toDate = (dateStr, timeStr) => {
    if (!dateStr) return null;
    try {
        const base = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
        return isNaN(base.getTime()) ? null : base;
    } catch { return null; }
};

/* ── JS Date → { date: 'YYYY-MM-DD', time: 'HH:MM' } ───────────────────── */
const fromDate = (d) => {
    if (!d) return { date: '', time: '' };
    const pad = (n) => String(n).padStart(2, '0');
    return {
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
};

/* ── Format for display in the trigger button ──────────────────────────────── */
const formatDisplay = (dateStr, timeStr) => {
    if (!dateStr) return 'Select date & time';
    try {
        const d = toDate(dateStr, timeStr);
        if (!d) return dateStr;
        const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timePart = timeStr
            ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            : '';
        return timePart ? `${datePart}, ${timePart}` : datePart;
    } catch { return dateStr; }
};

const ActivityDateTimePicker = ({ date, time, onChange, disabled = false }) => {
    const selected = toDate(date, time);

    const handleChange = (newDate) => {
        if (!newDate) {
            onChange({ date: '', time: '' });
            return;
        }
        onChange(fromDate(newDate));
    };

    const handleNow = (e) => {
        e.stopPropagation();
        onChange(fromDate(new Date()));
    };

    return (
        <div className="gv-dtp-wrapper">
            <DatePicker
                selected={selected}
                onChange={handleChange}
                showTimeSelect
                timeIntervals={15}
                timeFormat="h:mm aa"
                dateFormat="MMM d, yyyy h:mm aa"
                disabled={disabled}
                placeholderText="Select date & time"
                className="form-control form-control-sm gv-dtp-input"
                calendarClassName="gv-dtp-calendar"
                popperPlacement="bottom-start"
                popperModifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
                showPopperArrow={false}
                customInput={
                    <button
                        type="button"
                        className="form-control form-control-sm text-start gv-dtp-btn d-flex align-items-center gap-2"
                        disabled={disabled}
                    >
                        <i className="ri-calendar-event-line text-muted" style={{ fontSize: 14, flexShrink: 0 }} />
                        <span className={date ? '' : 'text-muted'} style={{ fontSize: 13 }}>
                            {formatDisplay(date, time)}
                        </span>
                    </button>
                }
            >
                {/* "NOW" shortcut rendered inside the popper */}
                <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ borderTop: '1px solid var(--bs-border-color)', marginTop: 4 }}
                >
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleNow}
                        style={{ fontSize: 11 }}
                    >
                        Now
                    </button>
                    <span className="text-muted fs-7" style={{ fontSize: 11 }}>
                        {selected
                            ? selected.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                            : 'No time set'}
                    </span>
                </div>
            </DatePicker>

            <style>{`
                .gv-dtp-btn {
                    background: var(--bs-body-bg);
                    border: 1px solid var(--bs-border-color);
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                    min-height: 31px;
                }
                .gv-dtp-btn:hover {
                    border-color: var(--bs-primary);
                }
                .gv-dtp-calendar {
                    font-family: inherit;
                    border: 1px solid var(--bs-border-color) !important;
                    border-radius: 8px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,.15) !important;
                    background: var(--bs-body-bg) !important;
                }
                .gv-dtp-calendar .react-datepicker__time-container {
                    border-left: 1px solid var(--bs-border-color);
                    width: 100px;
                }
                .gv-dtp-calendar .react-datepicker__time-list-item {
                    font-size: 12px !important;
                    padding: 5px 8px !important;
                }
                .gv-dtp-calendar .react-datepicker__time-list-item--selected {
                    background-color: var(--bs-primary) !important;
                }
                .gv-dtp-calendar .react-datepicker__header {
                    background: var(--bs-tertiary-bg, #f8f9fa) !important;
                    border-bottom: 1px solid var(--bs-border-color) !important;
                }
                .gv-dtp-calendar .react-datepicker__day--selected,
                .gv-dtp-calendar .react-datepicker__day--keyboard-selected {
                    background-color: var(--bs-primary) !important;
                    border-radius: 50% !important;
                }
                .gv-dtp-calendar .react-datepicker__day:hover {
                    border-radius: 50% !important;
                }
                .gv-dtp-calendar .react-datepicker__current-month,
                .gv-dtp-calendar .react-datepicker__day-name,
                .gv-dtp-calendar .react-datepicker__day {
                    color: var(--bs-body-color);
                }
                .gv-dtp-calendar .react-datepicker__time-container .react-datepicker__time {
                    background: var(--bs-body-bg) !important;
                }
                .gv-dtp-calendar .react-datepicker__header--time {
                    background: var(--bs-tertiary-bg, #f8f9fa) !important;
                    font-size: 12px;
                    padding: 8px;
                    border-bottom: 1px solid var(--bs-border-color) !important;
                }
            `}</style>
        </div>
    );
};

export default ActivityDateTimePicker;
