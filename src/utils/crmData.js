export const STORAGE_KEYS = {
  companies: 'gv_crm_companies',
  groups: 'gv_crm_groups',
  activities: 'gv_crm_activities',
  notes: 'gv_crm_notes',
  documents: 'gv_crm_documents',
  secondaryContacts: 'gv_crm_secondary_contacts',
  history: 'gv_crm_history',
};

export const entityTypes = {
  contact: 'Contacts',
  company: 'Companies',
  group: 'Groups',
};

export const opportunityStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
export const activityTypes = ['Call', 'Meeting', 'Task', 'Email', 'Follow-up'];
export const priorityOptions = ['Low', 'Medium', 'High'];

export const loadStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const saveStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // ignore storage errors
  }
};

export const createId = () => Date.now() + Math.floor(Math.random() * 1000);

export const getContactName = (contact = {}) => {
  const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  return name || contact.name || 'Unnamed contact';
};

export const getEntityName = ({ entityType, entity, contacts = [], companies = [], groups = [] }) => {
  if (entity) {
    if (entityType === 'contact') return getContactName(entity);
    return entity.name || entity.groupName || 'Unnamed record';
  }

  if (entityType === 'contact') {
    const contact = contacts.find((item) => item.id === entity?.id);
    return getContactName(contact);
  }
  if (entityType === 'company') {
    const company = companies.find((item) => item.id === entity?.id);
    return company?.name || 'Unnamed company';
  }
  const group = groups.find((item) => item.id === entity?.id);
  return group?.name || 'Unnamed group';
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const ensureCrmSeedData = (contacts = [], saveContacts = null) => {
  const companies = loadStorage(STORAGE_KEYS.companies);
  const groups = loadStorage(STORAGE_KEYS.groups);
  const activities = loadStorage(STORAGE_KEYS.activities);
  const notes = loadStorage(STORAGE_KEYS.notes);
  const documents = loadStorage(STORAGE_KEYS.documents);
  const secondaryContacts = loadStorage(STORAGE_KEYS.secondaryContacts);
  const history = loadStorage(STORAGE_KEYS.history);

  if (contacts.length || companies.length || groups.length) return;

  const seedCompany = {
    id: 1001,
    name: 'Ingenium',
    phone: '+44 20 7946 0812',
    website: 'https://ingenium.example',
    status: 'Active',
    industry: 'Technology',
    city: 'London',
    country: 'United Kingdom',
    description: 'Strategic account with multiple active contacts and opportunities.',
    companyProfile: 'Ingenium is a retained account focused on digital transformation projects and recurring advisory work.',
    createdAt: new Date().toISOString(),
  };

  const seedGroup = {
    id: 2001,
    name: 'Prospects',
    description: 'Contact records where ID/Status indicates prospect or active lead.',
    createdAt: new Date().toISOString(),
  };

  const seedContacts = [
    {
      id: 3001,
      firstName: 'Philip',
      lastName: 'Baafi',
      salutation: 'Philip',
      email: 'philip.baafi@ingenium.example',
      phone: '+44 20 7946 0991',
      mobile: '+44 7700 900100',
      title: 'Commercial Director',
      department: 'Sales',
      status: 'Prospect',
      companyId: seedCompany.id,
      groupIds: [seedGroup.id],
      address1: '221B Baker Street',
      city: 'London',
      country: 'United Kingdom',
      website: 'https://ingenium.example',
      lastResults: 'Warm intro completed',
      createdAt: new Date().toLocaleDateString(),
    },
    {
      id: 3002,
      firstName: 'Dan',
      lastName: 'Sidsaya',
      email: 'dsidsaya@ingenium.example',
      phone: '+44 20 7946 0713',
      title: 'Account Lead',
      department: 'Operations',
      status: 'Active',
      companyId: seedCompany.id,
      groupIds: [],
      city: 'London',
      country: 'United Kingdom',
      createdAt: new Date().toLocaleDateString(),
    },
  ];

  const now = new Date().toISOString();
  const seedActivities = [
    {
      id: 4001,
      entityType: 'contact',
      entityId: 3001,
      activityType: 'Call',
      title: 'Introductory discovery call',
      start: now,
      end: now,
      priority: 'Medium',
      location: 'Teams',
      description: 'Initial qualification and timeline review.',
      createdAt: now,
    },
  ];

  const seedNotes = [
    {
      id: 5001,
      entityType: 'contact',
      entityId: 3001,
      title: 'Needs summary',
      body: 'Interested in a phased CRM rollout with activity tracking and opportunity visibility.',
      createdAt: now,
    },
  ];

  const seedDocuments = [
    {
      id: 6001,
      entityType: 'contact',
      entityId: 3001,
      name: 'ingenium-discovery-brief.pdf',
      size: 82432,
      type: 'application/pdf',
      uploadedAt: now,
    },
  ];

  const seedSecondaryContacts = [
    {
      id: 7001,
      contactId: 3001,
      name: 'Ama Boateng',
      title: 'Executive Assistant',
      phone: '+44 20 7946 0820',
      mobile: '+44 7700 900222',
      email: 'ama.boateng@ingenium.example',
      website: 'https://ingenium.example',
      status: 'Active',
      createdAt: now,
    },
  ];

  const seedHistory = [
    {
      id: 8001,
      entityType: 'contact',
      entityId: 3001,
      action: 'Record created',
      detail: 'Contact seeded with linked company, group, activity, note, and document.',
      createdAt: now,
    },
    {
      id: 8002,
      entityType: 'company',
      entityId: 1001,
      action: 'Account created',
      detail: 'Company seeded for linked contact and opportunity management.',
      createdAt: now,
    },
    {
      id: 8003,
      entityType: 'group',
      entityId: 2001,
      action: 'Group created',
      detail: 'Prospects group seeded for contact segmentation.',
      createdAt: now,
    },
  ];

  if (typeof saveContacts === 'function') {
    saveContacts(seedContacts);
  }
  saveStorage(STORAGE_KEYS.companies, [seedCompany]);
  saveStorage(STORAGE_KEYS.groups, [seedGroup]);
  saveStorage(STORAGE_KEYS.activities, seedActivities);
  saveStorage(STORAGE_KEYS.notes, seedNotes);
  saveStorage(STORAGE_KEYS.documents, seedDocuments);
  saveStorage(STORAGE_KEYS.secondaryContacts, seedSecondaryContacts);
  saveStorage(STORAGE_KEYS.history, seedHistory);
};

export const buildHistoryEntry = (entityType, entityId, action, detail) => ({
  id: createId(),
  entityType,
  entityId,
  action,
  detail,
  createdAt: new Date().toISOString(),
});
