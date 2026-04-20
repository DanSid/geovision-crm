import React, { useState } from 'react';
import { connect } from 'react-redux';
import ContactAppSidebar from '../ContactAppSidebar';
import ContactAppHeader from '../ContactAppHeader';
import CompanySidebar from './CompanySidebar';
import CompanyDetailPanel from './CompanyDetailPanel';

// Full-page standalone version accessed via /apps/contacts/company/:id
const CompanyDetail = ({ match, companies }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedId, setSelectedId] = useState(match.params.id);

    return (
        <div className="hk-pg-body py-0">
            <div className={`contactapp-wrap ${showSidebar ? 'sidebar-toggle' : ''}`}>
                <ContactAppSidebar />
                <div className="contactapp-content">
                    <div className="contactapp-detail-wrap">
                        <ContactAppHeader
                            toggleSidebar={() => setShowSidebar(s => !s)}
                            show={showSidebar}
                        />
                        <div className="d-flex h-100" style={{ overflowY: 'hidden' }}>
                            <CompanySidebar
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                            />
                            <div className="d-flex flex-column flex-1" style={{ overflowY: 'auto', minWidth: 0 }}>
                                <CompanyDetailPanel companyId={selectedId} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({ companies }) => ({ companies });
export default connect(mapStateToProps)(CompanyDetail);
