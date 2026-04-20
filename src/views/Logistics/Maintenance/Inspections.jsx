import React from 'react';
import { connect } from 'react-redux';
import { Clipboard } from 'react-feather';
import { addMaintenance, updateMaintenance, deleteMaintenance } from '../../../redux/action/Crm';
import MaintenanceRecordsPage from './MaintenanceRecordsPage';

const Inspections = (props) => (
    <MaintenanceRecordsPage
        {...props}
        title="Inspections"
        subtitle="Schedule and track equipment inspections"
        actionLabel="Schedule Inspection"
        searchPlaceholder="Search inspections..."
        emptyMessage="No inspections scheduled"
        modalTitleCreate="Schedule Inspection"
        modalTitleEdit="Edit Inspection"
        titlePlaceholder="Inspection title"
        emptyIcon={Clipboard}
        recordType="inspection"
    />
);

const mapStateToProps = ({ maintenance, equipment }) => ({
    maintenance,
    equipment,
});

export default connect(mapStateToProps, { addMaintenance, updateMaintenance, deleteMaintenance })(Inspections);
