const STATUS_ORDER = ['all', 'important', 'archived', 'pending', 'deleted'];

export const CONTACT_STATUS_LABELS = {
    all: 'All Contacts',
    important: 'Important',
    archived: 'Archived',
    pending: 'Pending',
    deleted: 'Deleted',
};

export const getContactName = (contact = {}) =>
    `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
    contact.name ||
    contact.fullName ||
    contact.email ||
    'Unnamed contact';

export const getContactStatus = (contact = {}) => {
    const explicit = `${contact.status || contact.state || ''}`.toLowerCase();
    if (STATUS_ORDER.includes(explicit) && explicit !== 'all') return explicit;
    if (contact.deleted || contact.isDeleted) return 'deleted';
    if (contact.pending || contact.isPending) return 'pending';
    if (contact.archived || contact.isArchived) return 'archived';
    if (contact.favorite || contact.starred || contact.stared || contact.important) return 'important';
    return 'all';
};

export const getContactLabels = (contact = {}) => {
    const raw = contact.labels ?? contact.label ?? contact.tags ?? '';
    if (Array.isArray(raw)) {
        return raw.map(item => `${item}`.trim()).filter(Boolean);
    }
    return `${raw}`
        .split(/[,|]/g)
        .map(item => item.trim())
        .filter(Boolean);
};

export const getContactInitials = (contact = {}) => {
    const first = `${contact.firstName || contact.name || ''}`.trim().charAt(0);
    const last = `${contact.lastName || ''}`.trim().charAt(0);
    const fallback = `${contact.email || ''}`.trim().charAt(0);
    return `${first}${last}`.trim() || first || fallback || '?';
};

export const formatContactSubtitle = (contact = {}) => {
    const chunks = [contact.department, contact.company, contact.role].filter(Boolean);
    return chunks.join(' • ');
};

export const filterContacts = (contacts = [], searchTerm = '', activeFilter = 'all', activeLabel = 'all') => {
    const search = `${searchTerm}`.toLowerCase().trim();
    const labelFilter = `${activeLabel}`.toLowerCase().trim();
    return contacts.filter(contact => {
        const status = getContactStatus(contact);
        const matchesStatus = activeFilter === 'all' || status === activeFilter;
        const labels = getContactLabels(contact);
        const matchesLabel = labelFilter === 'all' || !labelFilter || labels.some(label => label.toLowerCase() === labelFilter);
        if (!matchesStatus || !matchesLabel) return false;
        if (!search) return true;

        const haystack = [
            getContactName(contact),
            contact.email,
            contact.phone,
            contact.department,
            contact.company,
            contact.role,
            ...labels,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return haystack.includes(search);
    });
};

export const countContactsByStatus = (contacts = []) => {
    const counts = {
        all: contacts.length,
        important: 0,
        archived: 0,
        pending: 0,
        deleted: 0,
    };

    contacts.forEach(contact => {
        const status = getContactStatus(contact);
        if (status === 'important') counts.important += 1;
        if (status === 'archived') counts.archived += 1;
        if (status === 'pending') counts.pending += 1;
        if (status === 'deleted') counts.deleted += 1;
    });

    return counts;
};

export const buildLabelSummary = (contacts = []) => {
    const summary = new Map();

    contacts.forEach(contact => {
        getContactLabels(contact).forEach(label => {
            const key = label.toLowerCase();
            const entry = summary.get(key) || { label, count: 0 };
            entry.count += 1;
            summary.set(key, entry);
        });
    });

    return Array.from(summary.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

const csvEscape = (value) => {
    const stringValue = value === null || value === undefined ? '' : `${value}`;
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

export const contactsToCsv = (contacts = []) => {
    const columns = [
        'id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'department',
        'company',
        'labels',
        'status',
        'createdAt',
        'favorite',
        'archived',
        'pending',
        'deleted',
    ];

    const rows = [columns.join(',')];
    contacts.forEach(contact => {
        rows.push(columns.map(column => {
            if (column === 'labels') return csvEscape(getContactLabels(contact).join(' | '));
            if (column === 'status') return csvEscape(getContactStatus(contact));
            return csvEscape(contact[column]);
        }).join(','));
    });

    return rows.join('\n');
};

const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];
        if (char === '"' && quoted && next === '"') {
            current += '"';
            i += 1;
            continue;
        }
        if (char === '"') {
            quoted = !quoted;
            continue;
        }
        if (char === ',' && !quoted) {
            values.push(current);
            current = '';
            continue;
        }
        current += char;
    }

    values.push(current);
    return values;
};

export const parseContactsInput = async (file) => {
    const text = await file.text();
    const trimmed = text.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
    }

    const [headerLine, ...lines] = trimmed.split(/\r?\n/);
    const headers = parseCsvLine(headerLine).map(header => header.trim());

    return lines
        .filter(Boolean)
        .map(line => {
            const values = parseCsvLine(line);
            return headers.reduce((row, header, index) => {
                row[header] = (values[index] ?? '').trim();
                return row;
            }, {});
        });
};

export const normalizeImportedContact = (row = {}) => {
    const firstName = row.firstName || (row.name ? row.name.split(' ')[0] : '') || '';
    const lastName = row.lastName || (row.name ? row.name.split(' ').slice(1).join(' ') : '') || '';
    const labels = getContactLabels(row);
    const status = `${row.status || ''}`.toLowerCase();

    return {
        id: row.id ? Number(row.id) : Date.now(),
        firstName,
        lastName,
        email: row.email || '',
        phone: row.phone || '',
        department: row.department || '',
        company: row.company || '',
        labels: labels.join(', '),
        status: STATUS_ORDER.includes(status) ? status : getContactStatus(row),
        favorite: row.favorite === true || `${row.favorite}` === 'true',
        archived: row.archived === true || `${row.archived}` === 'true',
        pending: row.pending === true || `${row.pending}` === 'true',
        deleted: row.deleted === true || `${row.deleted}` === 'true',
        createdAt: row.createdAt || new Date().toISOString(),
    };
};

export const downloadTextFile = (filename, contents, mimeType = 'text/plain;charset=utf-8') => {
    const blob = new Blob([contents], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
};
