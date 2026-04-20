import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Eye, Printer } from 'react-feather';
import { useHistory } from 'react-router-dom';
import SimpleBar from 'simplebar-react';

// Template images
import template1 from '../../../assets/img/templates/template1.png';
import template2 from '../../../assets/img/templates/template2.png';
import template3 from '../../../assets/img/templates/template3.png';
import template4 from '../../../assets/img/templates/template4.png';
import template5 from '../../../assets/img/templates/template5.png';
import template6 from '../../../assets/img/templates/template6.png';
import template7 from '../../../assets/img/templates/template7.png';
import template8 from '../../../assets/img/templates/template8.png';

const PREMIUM_TEMPLATES = [
    { id: 'standard',   label: 'Standard',   img: template1 },
    { id: 'simplicity', label: 'Simplicity', img: template2 },
    { id: 'essential',  label: 'Essential',  img: template3 },
    { id: 'classic',    label: 'Classic',    img: template4 },
];

const BUSINESS_TEMPLATES = [
    { id: 'pro-forma',  label: 'Pro Forma',  img: template5 },
    { id: 'trade',      label: 'Trade',      img: template6 },
    { id: 'interim',    label: 'Interim',    img: template7 },
    { id: 'primary',    label: 'Primary',    img: template8 },
    { id: 'matt-opel',  label: 'Matt Opel',  img: template1 },
    { id: 'freelancer', label: 'Freelancer', img: template2 },
    { id: 'designer',   label: 'Designer',   img: template3 },
    { id: 'service-a',  label: 'Service A',  img: template4 },
    { id: 'service-b',  label: 'Service B',  img: template5 },
    { id: 'service-c',  label: 'Service C',  img: template6 },
    { id: 'service-d',  label: 'Service D',  img: template7 },
    { id: 'service-e',  label: 'Service E',  img: template8 },
];

// Single template card with hover overlay
const TemplateCard = ({ template }) => {
    const history = useHistory();
    const [hovered, setHovered] = useState(false);

    const handleUse = () => history.push(`/apps/accounts/create-invoice?template=${template.id}`);
    const handlePrint = () => history.push(`/apps/accounts/invoice-preview?template=${template.id}`);

    return (
        <div
            className="col-xl-2 col-sm-4 col-xs-12 mb-5 text-center"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="position-relative" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
                <Card
                    className={`card-border mb-0 ${hovered ? 'border-primary shadow' : ''}`}
                    style={{ transition: 'all 0.2s ease' }}
                    onClick={handleUse}
                >
                    <Card.Img
                        src={template.img}
                        alt={template.label}
                        style={{ display: 'block', width: '100%' }}
                    />
                </Card>

                {/* Hover overlay */}
                {hovered && (
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-2"
                        style={{
                            background: 'rgba(0, 0, 0, 0.55)',
                            borderRadius: '0.5rem',
                            zIndex: 5,
                        }}
                    >
                        <Button
                            size="sm"
                            variant="primary"
                            className="d-flex align-items-center gap-1 px-3"
                            onClick={(e) => { e.stopPropagation(); handleUse(); }}
                        >
                            <Eye size={13} />
                            Use Template
                        </Button>
                        <Button
                            size="sm"
                            variant="light"
                            className="d-flex align-items-center gap-1 px-3"
                            onClick={(e) => { e.stopPropagation(); handlePrint(); }}
                        >
                            <Printer size={13} />
                            Print Preview
                        </Button>
                    </div>
                )}
            </div>
            <h6 className="mb-0 mt-2">{template.label}</h6>
        </div>
    );
};

const TemplateGroup = ({ templates }) => (
    <Row className="text-center">
        {templates.map(t => <TemplateCard key={t.id} template={t} />)}
    </Row>
);

const Body = () => {
    const [search, setSearch] = useState('');

    const filterFn = (t) => !search || t.label.toLowerCase().includes(search.toLowerCase());

    return (
        <div className="invoice-body">
            <SimpleBar className="nicescroll-bar">
                <Container>
                    <div className="my-md-7 my-3">
                        <h3 className="mb-4">Pick your starting point</h3>
                        <Form>
                            <Row>
                                <Col md={4} className="mb-md-0 mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search Template"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </Col>
                                <Col md={4} className="mb-md-0 mb-3">
                                    <Form.Select>
                                        <option value={1}>Popular</option>
                                        <option value={2}>Classic</option>
                                        <option value={3}>Trending</option>
                                        <option value={4}>Simple</option>
                                    </Form.Select>
                                </Col>
                                <div className="col-md-4">
                                    <Form.Select>
                                        <option value={1}>All Categories</option>
                                        <option value={2}>Business</option>
                                        <option value={3}>Studio</option>
                                        <option value={4}>Personal</option>
                                    </Form.Select>
                                </div>
                            </Row>
                        </Form>

                        <h5 className="mt-7 mb-3">Premium Templates</h5>
                        <TemplateGroup templates={PREMIUM_TEMPLATES.filter(filterFn)} />

                        <h5 className="mt-5 mb-3">Business</h5>
                        <TemplateGroup templates={BUSINESS_TEMPLATES.filter(filterFn)} />
                    </div>
                </Container>
            </SimpleBar>
        </div>
    );
};

export default Body;
