import React, { useMemo, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Form, ProgressBar, Row, Table } from 'react-bootstrap';
import { Plus, Upload } from 'react-feather';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import HkBadge from '../../components/@hk-badge/@hk-badge';

const FILTERS = {
  all: () => true,
  active: (item) => item.status === 'Active',
  prospects: (item) => item.status === 'Prospect',
};

const CustomerTable = ({ customers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return customers
      .filter(FILTERS[activeFilter] || FILTERS.all)
      .filter((item) =>
        [item.name, item.email, item.company, item.status].filter(Boolean).some((value) => String(value).toLowerCase().includes(q))
      );
  }, [customers, searchTerm, activeFilter]);

  return (
    <Card className="card-border mb-0 h-100">
      <Card.Header className="card-header-action">
        <h6>New Customers <HkBadge bg="light" size="sm" text="dark" className="ms-1">{customers.length}</HkBadge></h6>
        <div className="card-action-wrap">
          <Button as={Link} to={{ pathname: '/apps/customers', state: { openAdd: false } }} variant="outline-light" size="sm">
            <Upload size={14} className="me-1" /> Import
          </Button>
          <Button as={Link} to={{ pathname: '/apps/customers', state: { openAdd: true } }} variant="primary" size="sm" className="ms-3">
            <Plus size={14} className="me-1" /> Add New
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col sm={9}>
            <ButtonGroup size="sm" className="d-xxl-flex d-none align-items-center">
              <Button variant={activeFilter === 'all' ? 'primary' : 'outline-light'} onClick={() => setActiveFilter('all')}>View All</Button>
              <Button variant={activeFilter === 'active' ? 'primary' : 'outline-light'} onClick={() => setActiveFilter('active')}>Active</Button>
              <Button variant={activeFilter === 'prospects' ? 'primary' : 'outline-light'} onClick={() => setActiveFilter('prospects')}>Prospects</Button>
            </ButtonGroup>
          </Col>
          <Col sm={3} className="text-right d-flex justify-content-end">
            <Form.Control size="sm" type="search" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </Col>
        </Row>
        {filtered.length === 0 ? (
          <div className="text-center text-muted py-5">
            No customers yet. Add customers from the customer workspace and they will appear here automatically.
          </div>
        ) : (
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Usage</th>
                <th>Last Update</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 6).map((item, index) => {
                const usage = item.status === 'VIP' ? 90 : item.status === 'Active' ? 75 : item.status === 'Prospect' ? 50 : 35;
                return (
                  <tr key={item.id || index}>
                    <td>
                      <div className="fw-medium">{item.name}</div>
                      <div className="text-muted fs-7">{item.email || item.company || '-'}</div>
                    </td>
                    <td style={{ minWidth: 220 }}>
                      <div className="d-flex align-items-center gap-2">
                        <ProgressBar now={usage} style={{ width: 160, height: 6 }} />
                        <span className="fs-7">{usage}%</span>
                      </div>
                    </td>
                    <td>{item.createdAt || '-'}</td>
                    <td><HkBadge soft bg={item.status === 'VIP' ? 'warning' : item.status === 'Active' ? 'success' : 'info'}>{item.status || 'New'}</HkBadge></td>
                    <td className="text-end">
                      <Link
                        to={{ pathname: '/apps/customers', state: { selectedCustomerId: item.id } }}
                        className="btn btn-sm btn-outline-light"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

const mapState = ({ customers }) => ({ customers });
export default connect(mapState)(CustomerTable);
