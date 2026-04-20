import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Other'];
const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Construction', 'Consulting', 'Real Estate', 'Other'];
const STATUSES = ['Active', 'Inactive', 'Prospect', 'Customer'];

/**
 * Reusable Company form fields.
 * Props: form (object), set(key, value) fn, errors (object)
 */
const CompanyForm = ({ form, set, errors = {} }) => (
    <div>
        <h6 className="mb-3 text-uppercase fs-7 text-muted fw-semibold">Business Card</h6>
        <Row className="g-3 mb-4">
            <Col md={6}>
                <Form.Label className="fs-7">Company Name <span className="text-danger">*</span></Form.Label>
                <Form.Control size="sm" value={form.name || ''} onChange={e => set('name', e.target.value)}
                    isInvalid={!!errors.name} placeholder="Company name" />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Col>
            <Col md={6}>
                <Form.Label className="fs-7">Industry</Form.Label>
                <Form.Select size="sm" value={form.industry || ''} onChange={e => set('industry', e.target.value)}>
                    <option value="">— Select —</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </Form.Select>
            </Col>
            <Col md={4}>
                <Form.Label className="fs-7">Phone</Form.Label>
                <Form.Control size="sm" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
            </Col>
            <Col md={4}>
                <Form.Label className="fs-7">Fax</Form.Label>
                <Form.Control size="sm" value={form.fax || ''} onChange={e => set('fax', e.target.value)} />
            </Col>
            <Col md={4}>
                <Form.Label className="fs-7">Toll-Free</Form.Label>
                <Form.Control size="sm" value={form.tollFree || ''} onChange={e => set('tollFree', e.target.value)} />
            </Col>
            <Col md={6}>
                <Form.Label className="fs-7">Web Site</Form.Label>
                <Form.Control size="sm" value={form.website || ''} onChange={e => set('website', e.target.value)}
                    placeholder="https://" />
            </Col>
            <Col md={3}>
                <Form.Label className="fs-7">Ticker</Form.Label>
                <Form.Control size="sm" value={form.ticker || ''} onChange={e => set('ticker', e.target.value)} />
            </Col>
            <Col md={3}>
                <Form.Label className="fs-7">Status</Form.Label>
                <Form.Select size="sm" value={form.status || ''} onChange={e => set('status', e.target.value)}>
                    <option value="">— Select —</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                </Form.Select>
            </Col>
            <Col md={12}>
                <Form.Label className="fs-7">Description</Form.Label>
                <Form.Control as="textarea" rows={2} size="sm" value={form.description || ''}
                    onChange={e => set('description', e.target.value)} />
            </Col>
        </Row>

        <h6 className="mb-3 text-uppercase fs-7 text-muted fw-semibold">Address</h6>
        <Row className="g-3 mb-4">
            <Col md={6}>
                <Form.Label className="fs-7">Address 1</Form.Label>
                <Form.Control size="sm" value={form.address1 || ''} onChange={e => set('address1', e.target.value)} />
            </Col>
            <Col md={6}>
                <Form.Label className="fs-7">Address 2</Form.Label>
                <Form.Control size="sm" value={form.address2 || ''} onChange={e => set('address2', e.target.value)} />
            </Col>
            <Col md={4}>
                <Form.Label className="fs-7">City</Form.Label>
                <Form.Control size="sm" value={form.city || ''} onChange={e => set('city', e.target.value)} />
            </Col>
            <Col md={4}>
                <Form.Label className="fs-7">County</Form.Label>
                <Form.Control size="sm" value={form.county || ''} onChange={e => set('county', e.target.value)} />
            </Col>
            <Col md={4}>
                <Form.Label className="fs-7">Post / ZIP</Form.Label>
                <Form.Control size="sm" value={form.post || ''} onChange={e => set('post', e.target.value)} />
            </Col>
            <Col md={6}>
                <Form.Label className="fs-7">Country</Form.Label>
                <Form.Select size="sm" value={form.country || ''} onChange={e => set('country', e.target.value)}>
                    <option value="">— Select —</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </Form.Select>
            </Col>
            <Col md={6}>
                <Form.Label className="fs-7">Referred By</Form.Label>
                <Form.Control size="sm" value={form.referredBy || ''} onChange={e => set('referredBy', e.target.value)} />
            </Col>
        </Row>
    </div>
);

export default CompanyForm;
