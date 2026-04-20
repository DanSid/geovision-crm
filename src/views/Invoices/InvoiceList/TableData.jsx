import React from 'react';
import { Archive, Edit, Printer, Trash2 } from 'react-feather';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import HkBadge from '../../../components/@hk-badge/@hk-badge';

// Custom Recipient Container
const recipientFormatter = (cell) =>
    cell.map((data, indx) => (
        <React.Fragment key={indx}>
            <div className="text-dark">{data.title}</div>
            <div className="fs-7">{data.id}</div>
        </React.Fragment>
    ));

// Custom Status/Tag Container
const tagFormatter = (cell) =>
    cell.map((data, indx) => (
        <React.Fragment key={indx}>
            <HkBadge bg={data.bg} text={data.color} className="my-1 me-2">{data.title}</HkBadge>
            {data.text && <div className="fs-8 mt-1">{data.text}</div>}
        </React.Fragment>
    ));

// Action formatter — accepts history via closure from buildColumns
const makeActionFormatter = (history) => (cell) =>
    cell.map((data, indx) => (
        <div className="d-flex align-items-center" key={indx}>
            <Dropdown as={ButtonGroup} className="btn-group selectable-split-dropdown">
                <Button
                    variant="outline-light"
                    type="button"
                    className="btn-dyn-text w-100p"
                    onClick={() => history.push(data.actionLink)}
                >
                    Edit
                </Button>
                <Dropdown.Toggle variant="outline-light" split className="me-3">
                    <span className="sr-only">Toggle Dropdown</span>
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={() => history.push(data.actionLink)}>Edit Invoice</Dropdown.Item>
                    <Dropdown.Item onClick={() => history.push(`/apps/accounts/invoice-preview?id=${data.invoiceId}`)}>Preview</Dropdown.Item>
                    <Dropdown.Divider as="div" />
                    <Dropdown.Item
                        className="text-danger"
                        onClick={() => data.onDelete && data.onDelete(data.invoiceId)}
                    >
                        Delete
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <div className="d-flex">
                <Button
                    variant="flush-dark"
                    className="btn-icon btn-rounded flush-soft-hover"
                    title="Archive"
                >
                    <span className="btn-icon-wrap">
                        <span className="feather-icon"><Archive /></span>
                    </span>
                </Button>
                <Button
                    variant="flush-dark"
                    className="btn-icon btn-rounded flush-soft-hover"
                    title="Edit"
                    onClick={() => history.push(data.actionLink)}
                >
                    <span className="btn-icon-wrap">
                        <span className="feather-icon"><Edit /></span>
                    </span>
                </Button>
                <Button
                    variant="flush-dark"
                    className="btn-icon btn-rounded flush-soft-hover"
                    title="Print Invoice"
                    onClick={() => history.push(`/apps/accounts/invoice-preview?id=${data.invoiceId}`)}
                >
                    <span className="btn-icon-wrap">
                        <span className="feather-icon"><Printer /></span>
                    </span>
                </Button>
                <Button
                    variant="flush-dark"
                    className="btn-icon btn-rounded flush-soft-hover"
                    title="Delete"
                    onClick={() => data.onDelete && data.onDelete(data.invoiceId)}
                >
                    <span className="btn-icon-wrap">
                        <span className="feather-icon"><Trash2 /></span>
                    </span>
                </Button>
            </div>
        </div>
    ));

// Build columns with history injected for navigation
export const buildColumns = (history) => [
    {
        accessor: 'id',
        title: 'ID',
        hidden: true,
    },
    {
        accessor: 'invoice',
        title: 'Invoice #',
        sort: false,
        cellFormatter: (cell) => <Link to="#" className="table-link-text link-high-em">{cell}</Link>,
    },
    {
        accessor: 'date',
        title: 'Date',
        sort: true,
    },
    {
        accessor: 'reciplent',
        title: 'Recipient',
        sort: true,
        cellFormatter: recipientFormatter,
        sortValue: (cell) => cell.map(d => d.title),
    },
    {
        accessor: 'status',
        title: 'Status',
        sort: true,
        cellFormatter: tagFormatter,
    },
    {
        accessor: 'activity',
        title: 'Activity',
        sort: true,
    },
    {
        accessor: 'amount',
        title: 'Amount',
        sort: true,
    },
    {
        accessor: 'actions',
        title: 'Actions',
        cellFormatter: makeActionFormatter(history),
    },
];

// Legacy static export (no longer used for data — kept for backward compat)
export const columns = buildColumns({ push: () => {} });
export const data = [];
