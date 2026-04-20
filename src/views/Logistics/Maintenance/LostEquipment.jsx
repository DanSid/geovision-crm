import React from 'react';
import { connect } from 'react-redux';
import { AlertTriangle } from 'react-feather';
import { addMaintenance, updateMaintenance, deleteMaintenance } from '../../../redux/action/Crm';
import MaintenanceRecordsPage from './MaintenanceRecordsPage';

const LostEquipment = (props) => (
    <MaintenanceRecordsPage
        {...props}
        title="Lost Equipment"
        subtitle="Track missing gear, reported losses, and replacement costs"
        actionLabel="Report Loss"
        searchPlaceholder="Search lost equipment..."
        emptyMessage="No lost equipment reports yet"
        modalTitleCreate="Report Lost Equipment"
        modalTitleEdit="Edit Lost Equipment Report"
        titleLabel="Report Title"
        titlePlaceholder="Lost equipment report title"
        assignedToLabel="Reported By"
        assignedToPlaceholder="Who reported the loss?"
        dateLabel="Reported On"
        emptyIcon={AlertTriangle}
        recordType="lostEquipment"
    />
);

const mapStateToProps = ({ maintenance, equipment }) => ({
    maintenance,
    equipment,
});

export default connect(mapStateToProps, { addMaintenance, updateMaintenance, deleteMaintenance })(LostEquipment);
