import React from 'react';
import { connect } from 'react-redux';
import { Clipboard } from 'react-feather';
import { addMaintenance, updateMaintenance, deleteMaintenance } from '../../../redux/action/Crm';
import MaintenanceRecordsPage from './MaintenanceRecordsPage';

const InventoryCounts = (props) => (
    <MaintenanceRecordsPage
        {...props}
        title="Inventory Counts"
        subtitle="Record stock checks, count sessions, and reconciliation notes"
        actionLabel="Add Inventory Count"
        searchPlaceholder="Search inventory counts..."
        emptyMessage="No inventory counts recorded yet"
        modalTitleCreate="Add Inventory Count"
        modalTitleEdit="Edit Inventory Count"
        titleLabel="Count Title"
        titlePlaceholder="Inventory count title"
        assignedToLabel="Counted By"
        assignedToPlaceholder="Who completed the count?"
        dateLabel="Count Date"
        emptyIcon={Clipboard}
        recordType="inventoryCount"
    />
);

const mapStateToProps = ({ maintenance, equipment }) => ({
    maintenance,
    equipment,
});

export default connect(mapStateToProps, { addMaintenance, updateMaintenance, deleteMaintenance })(InventoryCounts);
