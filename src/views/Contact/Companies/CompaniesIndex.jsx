import React, { useState } from 'react';
import { connect } from 'react-redux';
import ContactAppSidebar from '../ContactAppSidebar';
import ContactAppHeader from '../ContactAppHeader';
import CompanySidebar from './CompanySidebar';
import CompanyDetailPanel from './CompanyDetailPanel';

const CompaniesIndex = ({ companies }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedId, setSelectedId] = useState(companies.length > 0 ? companies[0].id : null);

    // Auto-select first company if none selected
    const effectiveId = selectedId || (companies.length > 0 ? companies[0].id : null);

    return (
        <div className="hk-pg-body py-0">
            <div className={`contactapp-wrap ${showSidebar ? 'contactapp-sidebar-toggle' : ''}`}>
                <ContactAppSidebar />
                <div className="contactapp-content">
                    <div className="contactapp-detail-wrap">
                        <ContactAppHeader
                            toggleSidebar={() => setShowSidebar(s => !s)}
                            show={showSidebar}
                        />
                        {/* Two-column split view */}
                        <div className="d-flex h-100" style={{ overflowY: 'hidden' }}>
                            <CompanySidebar
                                selectedId={effectiveId}
                                onSelect={setSelectedId}
                            />
                            <div className="d-flex flex-column flex-1" style={{ overflowY: 'auto', minWidth: 0 }}>
                                <CompanyDetailPanel companyId={effectiveId} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({ companies }) => ({ companies });
export default connect(mapStateToProps)(CompaniesIndex);
