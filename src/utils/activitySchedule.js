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

export const isActivityDueNow = (activity, windowMinutes = 90, now = new Date()) => {
    if (!activity || activity.completed) return false;
    const dt = getActivityDateTime(activity);
    if (!dt || !String(activity.time || '').trim() && !String(activity.date || '').includes('T')) {
        return false;
    }
    const diffMs = now.getTime() - dt.getTime();
    return diffMs >= 0 && diffMs <= windowMinutes * 60 * 1000;
};

export const isActivityTodayOrOverdue = (activity, now = new Date()) => {
    const dt = getActivityDateTime(activity);
    if (!dt) return false;
    const activityDay = toLocalDateKey(dt);
    const today = toLocalDateKey(now);
    return !!activityDay && !!today && activityDay <= today;
};
