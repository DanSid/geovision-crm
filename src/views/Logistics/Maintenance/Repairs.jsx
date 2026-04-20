import React from 'react';
import { connect } from 'react-redux';
import { Tool } from 'react-feather';
import { addMaintenance, updateMaintenance, deleteMaintenance } from '../../../redux/action/Crm';
import MaintenanceRecordsPage from './MaintenanceRecordsPage';

const Repairs = (props) => (
    <MaintenanceRecordsPage
        {...props}
        title="Repairs"
        subtitle="Log and track equipment repairs"
        actionLabel="Log Repair"
        searchPlaceholder="Search repairs..."
        emptyMessage="No repairs logged yet"
        modalTitleCreate="Log Repair"
        modalTitleEdit="Edit Repair"
        titlePlaceholder="Repair title"
        emptyIcon={Tool}
        recordType="repair"
    />
);

const mapStateToProps = ({ maintenance, equipment }) => ({
    maintenance,
    equipment,
});

export default connect(mapStateToProps, { addMaintenance, updateMaintenance, deleteMaintenance })(Repairs);
