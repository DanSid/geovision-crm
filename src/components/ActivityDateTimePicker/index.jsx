/**
 * ActivityDateTimePicker
 *
 * Calendar on the left + scrollable time list on the right.
 * Footer lets the user type any custom time (e.g. "4:37 PM" or "16:37")
 * and press Enter / click Set to apply it instantly.
 */
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');

const toDate = (dateStr, timeStr) => {
    if (!dateStr) return null;
    try {
        const base = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
        return isNaN(base.getTime()) ? null : base;
    } catch { return null; }
};

const fromDate = (d) => {
    if (!d) return { date: '', time: '' };
    return {
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
};

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

/**
 * Parse a free-form time string typed by the user.
 * Accepts: "4:37 PM", "4:37pm", "16:37", "4pm", "9", "9:05"
 * Returns { hours: 0-23, minutes: 0-59 } or null if unparseable.
 */
const parseTypedTime = (raw) => {
    if (!raw) return null;
    const s = raw.trim().toLowerCase().replace(/\s+/g, '');

    // Patterns: 4:37pm, 4:37 pm, 16:37, 4pm, 9:05am, 9:5pm
    const match = s.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/);
    if (!match) return null;

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2] || '0', 10);
    const meridiem = match[3] || '';

    if (isNaN(h) || isNaN(m) || m > 59) return null;

    if (meridiem === 'am') {
        if (h === 12) h = 0;
    } else if (meridiem === 'pm') {
        if (h !== 12) h += 12;
    } else {
        // No meridiem — treat 1-12 as 12-hour if ≤ 12, else 24-hour
        if (h > 23) return null;
    }

    if (h > 23) return null;
    return { hours: h, minutes: m };
};

/* ══════════════════════════════════════════════════════════════════════════ */
const ActivityDateTimePicker = ({ date, time, onChange, disabled = false }) => {
    const selected = toDate(date, time);

    // Text typed in the custom time input
    const [typedTime, setTypedTime]   = useState('');
    const [timeError, setTimeError]   = useState(false);

    const handleChange = (newDate) => {
        if (!newDate) { onChange({ date: '', time: '' }); return; }
        setTypedTime(''); // clear custom input when user picks from list/calendar
        setTimeError(false);
        onChange(fromDate(newDate));
    };

    /* ── Apply typed custom time ── */
    const applyTypedTime = () => {
        const parsed = parseTypedTime(typedTime);
        if (!parsed) { setTimeError(true); return; }
        setTimeError(false);

        // Build a Date with the currently selected (or today's) date + typed time
        const base = selected ? new Date(selected) : new Date();
        base.setHours(parsed.hours, parsed.minutes, 0, 0);
        setTypedTime('');
        onChange(fromDate(base));
    };

    const handleTypedKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); applyTypedTime(); }
        if (e.key === 'Escape') { setTypedTime(''); setTimeError(false); }
    };

    const handleNow = (e) => {
        e.stopPropagation();
        setTypedTime('');
        setTimeError(false);
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
                {/* ── Footer: custom time input + Now button ── */}
                <div
                    style={{
                        borderTop: '1px solid var(--bs-border-color)',
                        padding: '8px 10px',
                        background: 'var(--bs-body-bg)',
                    }}
                >
                    {/* Custom time input row */}
                    <div className="d-flex align-items-center gap-1 mb-1">
                        <input
                            type="text"
                            className={`form-control form-control-sm gv-dtp-time-input ${timeError ? 'border-danger' : ''}`}
                            placeholder='e.g. 4:37 PM or 16:37'
                            value={typedTime}
                            onChange={e => { setTypedTime(e.target.value); setTimeError(false); }}
                            onKeyDown={handleTypedKeyDown}
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 12, flex: 1 }}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-primary px-2"
                            onClick={(e) => { e.stopPropagation(); applyTypedTime(); }}
                            style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                            title="Apply typed time"
                        >
                            Set
                        </button>
                    </div>

                    {/* Error hint */}
                    {timeError && (
                        <div className="text-danger" style={{ fontSize: 11, marginBottom: 4 }}>
                            Invalid time — try "4:37 PM" or "16:37"
                        </div>
                    )}

                    {/* Now button + current selection display */}
                    <div className="d-flex justify-content-between align-items-center">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2"
                            onClick={handleNow}
                            style={{ fontSize: 11 }}
                        >
                            Now
                        </button>
                        <span className="text-muted" style={{ fontSize: 11 }}>
                            {selected
                                ? selected.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                                : 'No time selected'}
                        </span>
                    </div>
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
                .gv-dtp-btn:hover { border-color: var(--bs-primary); }

                .gv-dtp-time-input:focus { box-shadow: none !important; }

                .gv-dtp-calendar {
                    font-family: inherit;
                    border: 1px solid var(--bs-border-color) !important;
                    border-radius: 8px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,.15) !important;
                    background: var(--bs-body-bg) !important;
                }
                .gv-dtp-calendar .react-datepicker__time-container {
                    border-left: 1px solid var(--bs-border-color);
                    width: 105px;
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
                .gv-dtp-calendar .react-datepicker__day:hover { border-radius: 50% !important; }
                .gv-dtp-calendar .react-datepicker__current-month,
                .gv-dtp-calendar .react-datepicker__day-name,
                .gv-dtp-calendar .react-datepicker__day { color: var(--bs-body-color); }
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
