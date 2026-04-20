import classNames from 'classnames';
import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { ChevronDown, ChevronUp, Sliders } from 'react-feather';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import { toggleTopNav } from '../../../redux/action/Theme';

const ALL_TEMPLATES = [
    { id: 'standard',   label: 'Standard' },
    { id: 'simplicity', label: 'Simplicity' },
    { id: 'essential',  label: 'Essential' },
    { id: 'classic',    label: 'Classic' },
    { id: 'pro-forma',  label: 'Pro Forma' },
    { id: 'trade',      label: 'Trade' },
    { id: 'interim',    label: 'Interim' },
    { id: 'primary',    label: 'Primary' },
    { id: 'matt-opel',  label: 'Matt Opel' },
    { id: 'freelancer', label: 'Freelancer' },
    { id: 'designer',   label: 'Designer' },
    { id: 'service-a',  label: 'Service A' },
];

const Header = ({ topNavCollapsed, toggleTopNav, toggleSidebar, show, handleSettings, selectedTemplate, templateLabel }) => {
    const history = useHistory();

    const activeLabel = templateLabel ||
        ALL_TEMPLATES.find(t => t.id === selectedTemplate)?.label ||
        'Standard';

    const switchTemplate = (templateId) => {
        history.push(`/apps/accounts/create-invoice?template=${templateId}`);
    };

    return (
        <header className="invoice-header">
            <div className="d-flex align-items-center">
                {/* Template selector dropdown */}
                <Dropdown>
                    <Dropdown.Toggle as={Link} to="#" className="invoiceapp-title link-dark">
                        <h1>{activeLabel} Template</h1>
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="start">
                        {ALL_TEMPLATES.map(t => (
                            <Dropdown.Item
                                key={t.id}
                                active={t.id === selectedTemplate}
                                onClick={() => switchTemplate(t.id)}
                            >
                                {t.label} Template
                            </Dropdown.Item>
                        ))}
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/apps/accounts/invoice-templates">
                            Browse All Templates…
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            <div className="invoice-options-wrap">
                {/* Settings toggle */}
                <Button
                    as="a"
                    variant="flush-dark"
                    className="btn-icon btn-rounded flush-soft-hover invoiceapp-setting-toggle active me-2"
                    onClick={handleSettings}
                >
                    <span className="icon">
                        <span className="feather-icon"><Sliders /></span>
                    </span>
                </Button>

                {/* Preview */}
                <Button
                    as={Link}
                    to="/apps/accounts/invoice-preview"
                    variant="outline-secondary"
                    className="flex-shrink-0 d-md-inline-block d-none me-2"
                >
                    Preview
                </Button>

                {/* Collapse navbar */}
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

            <div className={classNames('hk-sidebar-togglable', { active: !show })} onClick={toggleSidebar} />
        </header>
    );
};

const mapStateToProps = ({ theme }) => ({ topNavCollapsed: theme.topNavCollapsed });
export default connect(mapStateToProps, { toggleTopNav })(Header);
