import React, { useState } from 'react';
import { connect } from 'react-redux';
import ContactAppSidebar from '../ContactAppSidebar';
import ContactAppHeader from '../ContactAppHeader';
import GroupSidebar from './GroupSidebar';
import GroupDetailPanel from './GroupDetailPanel';

const GroupsIndex = ({ groups }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedId, setSelectedId] = useState(groups.length > 0 ? groups[0].id : null);

    const effectiveId = selectedId || (groups.length > 0 ? groups[0].id : null);

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
                        <div className="d-flex h-100" style={{ overflowY: 'hidden' }}>
                            <GroupSidebar
                                selectedId={effectiveId}
                                onSelect={setSelectedId}
                            />
                            <div className="d-flex flex-column flex-1" style={{ overflowY: 'auto', minWidth: 0 }}>
                                <GroupDetailPanel groupId={effectiveId} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({ groups }) => ({ groups });
export default connect(mapStateToProps)(GroupsIndex);
