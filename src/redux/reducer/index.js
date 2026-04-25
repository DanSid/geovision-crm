import { combineReducers } from 'redux';
import ChatReducer from './Chat';
import ChatPopupReducer from './ChatPopup';
import EmailReducer from './Email';
import Theme from './Theme';
import ToDoReducer from './ToDo';
import AuthReducer from './Auth';
import {
    contactsReducer,
    opportunitiesReducer,
    customersReducer,
    tasksReducer,
    permissionsReducer,
    userPermissionsReducer,
    boardsReducer,
    pipelineReducer,
    companiesReducer,
    groupsReducer,
    activitiesReducer,
    notesReducer,
    historyReducer,
    documentsReducer,
    secondaryContactsReducer,
    invoicesReducer,
    equipmentReducer,
    stockLocationsReducer,
    crewMembersReducer,
    vehiclesReducer,
    maintenanceReducer,
    requestsReducer,
} from './Crm';

const reducers = combineReducers({
    theme: Theme,
    chatReducer: ChatReducer,
    emailReducer: EmailReducer,
    chatPopupReducer: ChatPopupReducer,
    toDoReducer: ToDoReducer,
    auth: AuthReducer,
    contacts: contactsReducer,
    opportunities: opportunitiesReducer,
    customers: customersReducer,
    tasks: tasksReducer,
    permissions: permissionsReducer,
    userPermissions: userPermissionsReducer,
    boards: boardsReducer,
    pipeline: pipelineReducer,
    companies: companiesReducer,
    groups: groupsReducer,
    activities: activitiesReducer,
    notes: notesReducer,
    history: historyReducer,
    documents: documentsReducer,
    secondaryContacts: secondaryContactsReducer,
    invoices: invoicesReducer,
    equipment: equipmentReducer,
    stockLocations: stockLocationsReducer,
    crewMembers: crewMembersReducer,
    vehicles: vehiclesReducer,
    maintenance: maintenanceReducer,
    requests: requestsReducer,
});

export default reducers;
