import React, { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { FileText, Plus } from 'react-feather';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import HkDataTable from '../../../components/@hk-data-table';
import { deleteInvoice } from '../../../redux/action/Crm';
import { buildColumns } from './TableData';

const STATUS_BG = {
    draft: 'light',
    sent: 'info',
    paid: 'primary',
    unpaid: 'danger',
    archived: 'warning',
};

const fmtDate = (iso) => {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return iso; }
};

const toRow = (inv, onDelete) => ({
    id: inv.id,
    invoice: inv.invoiceNo || `INV-${String(inv.id).slice(-5)}`,
    date: fmtDate(inv.date || inv.createdAt),
    reciplent: [{ title: inv.billedToName || 'Unknown', id: inv.billedToEmail || '' }],
    status: [{ title: inv.status || 'draft', bg: STATUS_BG[inv.status] || 'light', color: (inv.status === 'draft' || !inv.status) ? 'dark' : undefined }],
    activity: inv.status === 'paid' ? 'Done' : inv.status === 'sent' ? 'Sent' : '-',
    amount: `$ ${Number(inv.grossTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD`,
    actions: [{ actionLink: `/apps/accounts/create-invoice?id=${inv.id}`, invoiceId: inv.id, onDelete }],
});

const InvoiceList = ({ invoices, deleteInvoice }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const history = useHistory();

    const handleDelete = (id) => {
        if (window.confirm('Delete this invoice?')) deleteInvoice(id);
    };

    const rows = (invoices || []).map(inv => toRow(inv, handleDelete));
    const columns = buildColumns(history);

    return (
        <>
            <Row className="mb-3">
                <Col xs={7} mb={3}>
                    <div className="invoice-toolbar-left d-flex align-items-center gap-2">
                        <Form.Select size="sm" className="d-flex align-items-center w-130p">
                            <option value={1}>Export to CSV</option>
                            <option value={2}>Export to PDF</option>
                            <option value={3}>Send Message</option>
                            <option value={4}>Delegate Access</option>
                        </Form.Select>
                    </div>
                </Col>
                <Col xs={5} mb={3}>
                    <div className="invoice-toolbar-right">
                        <div className="dataTables_filter">
                            <label>
                                <Form.Control
                                    size="sm"
                                    type="search"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="dataTables_paginate paging_simple_numbers">
                            <ul className="pagination custom-pagination pagination-simple m-0">
                                <li className="paginate_button page-item previous disabled">
                                    <Link to="#" className="page-link">
                                        <i className="ri-arrow-left-s-line" />
                                    </Link>
                                </li>
                                <li className="paginate_button page-item next disabled">
                                    <Link to="#" className="page-link">
                                        <i className="ri-arrow-right-s-line" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Col>
            </Row>

            {rows.length === 0 ? (
                <div className="text-center py-7 text-muted">
                    <FileText size={48} className="mb-3 opacity-25" />
                    <h5 className="mb-2">No invoices yet</h5>
                    <p className="mb-4 fs-7">Create your first invoice to get started</p>
                    <Button as={Link} to="/apps/accounts/create-invoice" variant="primary" size="sm">
                        <Plus size={14} className="me-1" /> Create Invoice
                    </Button>
                </div>
            ) : (
                <HkDataTable
                    column={columns}
                    rowData={rows}
                    rowSelection={true}
                    rowsPerPage={10}
                    searchQuery={searchTerm}
                    classes="nowrap w-100 mb-5"
                    responsive
                />
            )}
        </>
    );
};

const mapStateToProps = ({ invoices }) => ({ invoices });
export default connect(mapStateToProps, { deleteInvoice })(InvoiceList);
