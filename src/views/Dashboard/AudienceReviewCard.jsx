import React, { useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Form, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import HkBadge from '../../components/@hk-badge/@hk-badge';
import AudienceReviewChart from './ChartData/AudienceReviewChart';

const SOURCES = ['Direct', 'Organic Search', 'Referral'];
const SOURCE_COLORS = { Direct: '#007D88', 'Organic Search': '#25cba1', Referral: '#6366f1' };
const FILTERS = ['All', ...SOURCES];

const pctChange = (current, prev) => {
    if (!prev && !current) return null;
    if (!prev) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
};

const AudienceReviewCard = ({ contacts = [] }) => {
    const currentYear = new Date().getFullYear();

    const availableYears = useMemo(() => {
        const years = new Set();
        years.add(currentYear);
        contacts.forEach((c) => {
            if (c.createdAt) {
                const y = new Date(c.createdAt).getFullYear();
                if (!isNaN(y)) years.add(y);
            }
        });
        return [...years].sort((a, b) => b - a);
    }, [contacts, currentYear]);

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    }, []);

    const yearContacts = useMemo(
        () => contacts.filter((c) => c.createdAt && new Date(c.createdAt).getFullYear() === selectedYear),
        [contacts, selectedYear]
    );

    const prevYearContacts = useMemo(
        () => contacts.filter((c) => c.createdAt && new Date(c.createdAt).getFullYear() === selectedYear - 1),
        [contacts, selectedYear]
    );

    const allSeries = useMemo(
        () =>
            SOURCES.map((source) => ({
                name: source,
                data: Array.from({ length: 12 }, (_, m) =>
                    yearContacts.filter((c) => c.contactSource === source && new Date(c.createdAt).getMonth() === m).length
                ),
            })),
        [yearContacts]
    );

    const filteredSeries = useMemo(
        () => (activeFilter === 'All' ? allSeries : allSeries.filter((s) => s.name === activeFilter)),
        [allSeries, activeFilter]
    );

    const totals = useMemo(
        () =>
            SOURCES.reduce((acc, src) => {
                acc[src] = yearContacts.filter((c) => c.contactSource === src).length;
                return acc;
            }, {}),
        [yearContacts]
    );

    const prevTotals = useMemo(
        () =>
            SOURCES.reduce((acc, src) => {
                acc[src] = prevYearContacts.filter((c) => c.contactSource === src).length;
                return acc;
            }, {}),
        [prevYearContacts]
    );

    const totalAll = yearContacts.length;
    const prevTotalAll = prevYearContacts.length;
    const totalChange = pctChange(totalAll, prevTotalAll);

    const statItems = [
        {
            label: 'Total Contacts',
            value: totalAll,
            change: totalChange,
            color: 'primary',
        },
        ...SOURCES.map((src) => ({
            label: src,
            value: totals[src],
            change: pctChange(totals[src], prevTotals[src]),
            color: src === 'Direct' ? 'teal' : src === 'Organic Search' ? 'success' : 'violet',
            dot: SOURCE_COLORS[src],
        })),
    ];

    return (
        <Card className="card-border mb-0 h-100">
            <Card.Header className="card-header-action">
                <h6>Audience Overview</h6>
                <div className="card-action-wrap d-flex align-items-center gap-2 flex-wrap">
                    {/* Year selector */}
                    <Form.Select
                        size="sm"
                        style={{ width: 90 }}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        aria-label="Select year"
                    >
                        {availableYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </Form.Select>

                    {/* Source filter — desktop */}
                    <ButtonGroup className="d-lg-flex d-none" aria-label="Source filter">
                        {FILTERS.map((f) => (
                            <Button
                                key={f}
                                variant="outline-light"
                                className={activeFilter === f ? 'active' : ''}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f}
                            </Button>
                        ))}
                    </ButtonGroup>

                    {/* Source filter — mobile */}
                    <Form.Select
                        className="d-lg-none d-flex"
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        aria-label="Source filter"
                    >
                        {FILTERS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </Form.Select>
                </div>
            </Card.Header>

            <Card.Body>
                <AudienceReviewChart series={filteredSeries} />

                <div className="separator-full mt-5" />

                <div className="flex-grow-1 ms-lg-3">
                    <Row>
                        {statItems.map((item) => {
                            const up = item.change !== null && item.change >= 0;
                            return (
                                <Col key={item.label} xxl={3} sm={6} className="mb-3">
                                    <div className="d-flex align-items-center gap-1 mb-1">
                                        {item.dot && (
                                            <span
                                                style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, display: 'inline-block', flexShrink: 0 }}
                                            />
                                        )}
                                        <span className="fw-medium fs-7">{item.label}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="d-block fs-4 fw-medium text-dark mb-0">{item.value}</span>
                                        {item.change !== null && (
                                            <HkBadge bg={up ? 'success' : 'danger'} size="sm" soft className="ms-1">
                                                <i className={`bi bi-arrow-${up ? 'up' : 'down'}`} /> {Math.abs(item.change)}%
                                            </HkBadge>
                                        )}
                                    </div>
                                    {selectedYear > Math.min(...availableYears) && (
                                        <small className="text-muted" style={{ fontSize: 11 }}>vs {selectedYear - 1}</small>
                                    )}
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            </Card.Body>
        </Card>
    );
};

const mapStateToProps = ({ contacts }) => ({ contacts });
export default connect(mapStateToProps)(AudienceReviewCard);
