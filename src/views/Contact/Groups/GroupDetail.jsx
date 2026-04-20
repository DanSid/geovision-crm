import React, { useState } from 'react';
import { connect } from 'react-redux';
import ContactAppSidebar from '../ContactAppSidebar';
import ContactAppHeader from '../ContactAppHeader';
import GroupSidebar from './GroupSidebar';
import GroupDetailPanel from './GroupDetailPanel';

// Full-page standalone version accessed via /apps/contacts/group/:id
const GroupDetail = ({ match, groups }) => {
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
                            <GroupSidebar
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                            />
                            <div className="d-flex flex-column flex-1" style={{ overflowY: 'auto', minWidth: 0 }}>
                                <GroupDetailPanel groupId={selectedId} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({ groups }) => ({ groups });
export default connect(mapStateToProps)(GroupDetail);
