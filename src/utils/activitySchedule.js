const pad = (value) => String(value).padStart(2, '0');

export const toLocalDateKey = (value) => {
    const dt = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dt.getTime())) return '';
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

const parseTimeParts = (rawTime) => {
    if (!rawTime) return null;
    const cleaned = String(rawTime).trim().toLowerCase().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
    if (!match) return null;

    let hours = Number(match[1]);
    const minutes = Number(match[2] || '0');
    const meridiem = match[3] || '';

    if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
        return null;
    }

    if (meridiem === 'am') {
        if (hours === 12) hours = 0;
    } else if (meridiem === 'pm') {
        if (hours < 12) hours += 12;
    }

    if (hours < 0 || hours > 23) return null;
    return { hours, minutes };
};

export const getActivityDateTime = (activity = {}) => {
    const rawDate = String(activity.date || '').trim();
    const rawTime = String(activity.time || '').trim();
    if (!rawDate) return null;

    if (rawDate.includes('T')) {
        const dt = new Date(rawDate);
        if (!Number.isNaN(dt.getTime())) return dt;

        const normalizedIsoLike = rawDate.replace(' ', 'T');
        const retry = new Date(normalizedIsoLike);
        if (!Number.isNaN(retry.getTime())) return retry;
    }

    const timeParts = parseTimeParts(rawTime);
    if (timeParts) {
        const dt = new Date(
            rawDate.includes('T') ? rawDate : `${rawDate}T${pad(timeParts.hours)}:${pad(timeParts.minutes)}:00`
        );
        if (!Number.isNaN(dt.getTime())) return dt;
    }

    const dateOnly = new Date(rawDate);
    if (!Number.isNaN(dateOnly.getTime())) return dateOnly;

    return null;
};

/* ── Parse "30 Minutes", "1 Hour", "2 Hours", "All Day" → minutes ─────────── */
export const parseDurationMinutes = (durationStr) => {
    if (!durationStr) return 0;
    const s = String(durationStr).toLowerCase().trim();
    if (s.includes('all day')) return 8 * 60; // treat "All Day" as 8 hours
    const match = s.match(/^(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)/);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    return (match[2].startsWith('hour') || match[2].startsWith('hr')) ? val * 60 : val;
};

/* ── Compute activity status based on scheduled time + duration ──────────────
   Returns:
     'upcoming'       – starts in the future
     'in_progress'    – started, duration not yet elapsed
     'completed_auto' – duration has fully elapsed (auto-complete by time)
     'overdue'        – past start time, no duration, not yet manually completed
     'completed'      – manually marked complete
═══════════════════════════════════════════════════════════════════════════ */
export const getActivityStatus = (activity, now = new Date()) => {
    if (!activity) return 'upcoming';
    if (activity.completed) return 'completed';

    const start = getActivityDateTime(activity);
    if (!start) return 'upcoming';

    const nowMs     = now.getTime();
    const startMs   = start.getTime();

    if (nowMs < startMs) return 'upcoming';                    // hasn't started

    const durationMins = parseDurationMinutes(activity.duration);
    if (durationMins > 0) {
        const endMs = startMs + durationMins * 60 * 1000;
        if (nowMs < endMs)  return 'in_progress';              // currently running
        return 'completed_auto';                               // duration over
    }

    // No duration set — treat as point-in-time; overdue after 90 minutes
    const diffMs = nowMs - startMs;
    if (diffMs <= 90 * 60 * 1000) return 'in_progress';       // just started
    return 'overdue';
};

/* ── isActivityDueNow — should the alert MODAL fire? ────────────────────────
   Only fires in the first 5 minutes after start time, AND only when the
   duration hasn't fully elapsed yet (i.e. not completed_auto).
   SESSION_ALERTED in Navbar prevents it from showing twice per session.
═══════════════════════════════════════════════════════════════════════════ */
export const isActivityDueNow = (activity, windowMinutes = 5, now = new Date()) => {
    if (!activity || activity.completed) return false;
    const dt = getActivityDateTime(activity);
    if (!dt) return false;
    // Must have a time component (not a date-only activity)
    if (!String(activity.time || '').trim() && !String(activity.date || '').includes('T')) return false;

    const diffMs       = now.getTime() - dt.getTime();
    const durationMins = parseDurationMinutes(activity.duration);

    // Don't fire if the full duration has already elapsed
    if (durationMins > 0 && diffMs > durationMins * 60 * 1000) return false;

    // Fire within the first windowMinutes after start
    return diffMs >= 0 && diffMs <= windowMinutes * 60 * 1000;
};

export const isActivityTodayOrOverdue = (activity, now = new Date()) => {
    const dt = getActivityDateTime(activity);
    if (!dt) return false;
    const activityDay = toLocalDateKey(dt);
    const today = toLocalDateKey(now);
    return !!activityDay && !!today && activityDay <= today;
};

/**
 * isActivityWithinNotifWindow — bell visibility guard.
 * Returns true only if the activity's start time is within the last
 * `maxOverdueHours` hours.  Once the window expires the entry silently
 * drops out of the notification bell so stale "Overdue" items don't pile up.
 */
export const isActivityWithinNotifWindow = (activity, maxOverdueHours = 24, now = new Date()) => {
    const dt = getActivityDateTime(activity);
    if (!dt) return false;
    const diffMs = now.getTime() - dt.getTime();
    if (diffMs < 0) return false;                               // still in the future
    return diffMs <= maxOverdueHours * 60 * 60 * 1000;         // within window
};
