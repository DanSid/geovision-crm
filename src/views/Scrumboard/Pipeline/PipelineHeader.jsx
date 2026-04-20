import React from 'react';
import { Button, ButtonGroup, Form, Badge } from 'react-bootstrap';
import { Calendar, ChevronDown, ChevronUp, List, Trello } from 'react-feather';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import { toggleTopNav } from '../../../redux/action/Theme';

const PipelineHeader = ({
    topNavCollapsed, toggleTopNav, addNewDeal,
    opportunities, tasks, cards, cardOrder,
}) => {
    // Live pipeline value = sum of all open opportunity values
    const openOpps = (opportunities || []).filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage));
    const pipelineValue = openOpps.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
    const totalValue = (opportunities || []).reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
    const wonCount = (opportunities || []).filter(o => o.stage === 'Closed Won').length;

    return (
        <header className="taskboard-header">
            <div className="d-flex align-items-center flex-1">
                <a className="taskboardapp-title link-dark" href="#pipeline">
                    <h1>Sales Pipeline</h1>
                </a>
                <Button
                    variant="primary"
                    className="ms-3 d-xxl-inline-block d-none flex-shrink-0"
                    onClick={addNewDeal}
                >
                    Add Stage
                </Button>
                <Link
                    to="/apps/opportunities"
                    className="btn btn-sm btn-outline-primary ms-2 d-xxl-inline-block d-none flex-shrink-0"
                >
                    + Add Opportunity
                </Link>
                <ButtonGroup className="d-xxl-inline-flex d-none mx-3">
                    <Button variant="outline-light" className="btn-icon">
                        <span className="icon"><span className="feather-icon"><Trello /></span></span>
                    </Button>
                    <Button variant="outline-light" className="btn-icon">
                        <span className="icon"><span className="feather-icon"><List /></span></span>
                    </Button>
                    <Button variant="outline-light" className="btn-icon">
                        <span className="icon"><span className="feather-icon"><Calendar /></span></span>
                    </Button>
                </ButtonGroup>
            </div>

            <div className="d-md-flex flex-shrink-0 mx-3 d-none gap-3 align-items-center">
                <div className="d-flex align-items-center">
                    <span className="d-md-inline d-none text-muted">Open Pipeline:</span>
                    <span className="text-dark fs-5 fw-medium ps-2">${pipelineValue.toLocaleString()}</span>
                </div>
                <div className="v-separator" />
                <div className="d-flex align-items-center">
                    <span className="d-md-inline d-none text-muted">Total Value:</span>
                    <span className="text-dark fs-5 fw-medium ps-2">${totalValue.toLocaleString()}</span>
                </div>
                <div className="v-separator" />
                <div className="d-flex align-items-center">
                    <span className="text-muted">Won:</span>
                    <Badge bg="success" className="ms-2 fw-normal">{wonCount}</Badge>
                </div>
            </div>

            <div className="taskboard-options-wrap flex-1 justify-content-end">
                <Form className="leave-search d-lg-inline-block d-none" role="search">
                    <Form.Control type="text" placeholder="Search pipeline..." />
                </Form>
                <Button
                    as="a"
                    variant="flush-dark"
                    className="btn-icon btn-rounded flush-soft-hover hk-navbar-togglable d-sm-inline-block d-none"
                    onClick={() => toggleTopNav(!topNavCollapsed)}
                >
                    <HkTooltip placement={topNavCollapsed ? 'bottom' : 'top'} title="Collapse">
                        <span className="icon">
                            <span className="feather-icon">
                                {topNavCollapsed ? <ChevronDown /> : <ChevronUp />}
                            </span>
                        </span>
                    </HkTooltip>
                </Button>
            </div>
        </header>
    );
};

const mapStateToProps = ({ theme, opportunities }) => ({
    topNavCollapsed: theme.topNavCollapsed,
    opportunities,
});

export default connect(mapStateToProps, { toggleTopNav })(PipelineHeader);
