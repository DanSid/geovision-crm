import React from 'react';
import { Badge, Table } from 'react-bootstrap';
import { connect } from 'react-redux';

const actionBg = {
    created: 'success',
    updated: 'info',
    opportunity_added: 'primary',
    activity_added: 'warning',
    note_added: 'secondary',
    document_added: 'dark',
};

const actionLabel = {
    created: 'Created',
    updated: 'Updated',
    opportunity_added: 'Opportunity Added',
    activity_added: 'Activity Added',
    note_added: 'Note Added',
    document_added: 'Document Added',
};

const HistoryTab = ({ entityType, entityId, history }) => {
    const entries = history
        .filter(h => h.entityType === entityType && String(h.entityId) === String(entityId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const fmt = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (entries.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <p className="mb-0">No history recorded yet. Actions will appear here automatically.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <Table hover size="sm" className="mb-0">
                <thead className="table-light">
                    <tr>
                        <th>Date / Time</th>
                        <th>Action</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map(h => (
                        <tr key={h.id}>
                            <td className="fs-7 text-nowrap">{fmt(h.createdAt)}</td>
                            <td>
                                <Badge bg={actionBg[h.action] || 'secondary'} className="fw-normal">
                                    {actionLabel[h.action] || h.action}
                                </Badge>
                            </td>
                            <td className="fs-7">{h.description}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

const mapStateToProps = ({ history }) => ({ history });
export default connect(mapStateToProps)(HistoryTab);
