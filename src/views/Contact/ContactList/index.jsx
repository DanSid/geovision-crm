import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContactAppSidebar from '../ContactAppSidebar';
import ContactAppHeader from '../ContactAppHeader';
import ContactAppBody from './ContactAppBody';
import classNames from 'classnames';
import { addContact } from '../../../redux/action/Crm';
import { buildLabelSummary, contactsToCsv, downloadTextFile, filterContacts, normalizeImportedContact, parseContactsInput } from '../../../utils/contactWorkspace';

const ContactList = () => {
    const dispatch = useDispatch();
    const contacts = useSelector(state => state.contacts);
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeLabel, setActiveLabel] = useState('all');
    const [createToken, setCreateToken] = useState(0);
    const fileInputRef = useRef(null);

    const labels = useMemo(() => buildLabelSummary(contacts), [contacts]);
    const filteredForExport = useMemo(() => filterContacts(contacts, '', activeFilter, activeLabel), [contacts, activeFilter, activeLabel]);

    const handleCreateContact = () => setCreateToken(Date.now());
    const handleImportContacts = () => fileInputRef.current?.click();
    const handleExportContacts = () => downloadTextFile(`contacts-${new Date().toISOString().slice(0, 10)}.csv`, contactsToCsv(filteredForExport), 'text/csv;charset=utf-8');
    const handlePrintContacts = () => window.print();

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const importedRows = await parseContactsInput(file);
            importedRows.map(normalizeImportedContact).forEach(contact => {
                dispatch(addContact(contact));
            });
        } catch (error) {
            console.error('Failed to import contacts', error);
        } finally {
            event.target.value = '';
        }
    };

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames('contactapp-wrap', { 'contactapp-sidebar-toggle': showSidebar })}>
                <ContactAppSidebar
                    contacts={contacts}
                    labels={labels}
                    activeFilter={activeFilter}
                    activeLabel={activeLabel}
                    onFilterChange={setActiveFilter}
                    onLabelChange={setActiveLabel}
                    onCreateContact={handleCreateContact}
                    onImportContacts={handleImportContacts}
                    onExportContacts={handleExportContacts}
                    onPrintContacts={handlePrintContacts}
                />
                <div className="contactapp-content">
                    <div className="contactapp-detail-wrap">
                        <ContactAppHeader
                            toggleSidebar={() => setShowSidebar(!showSidebar)}
                            show={showSidebar}
                            onCreateContact={handleCreateContact}
                            onImportContacts={handleImportContacts}
                            onExportContacts={handleExportContacts}
                            onPrintContacts={handlePrintContacts}
                        />
                        <ContactAppBody activeFilter={activeFilter} activeLabel={activeLabel} createContactSignal={createToken} />
                    </div>
                </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".json,.csv,text/csv,application/json" hidden onChange={handleFileChange} />
        </div>
    );
};

export default ContactList;
