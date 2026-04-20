import React from 'react';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';
import { ChevronDown, ChevronLeft, ChevronUp, Printer } from 'react-feather';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import { toggleTopNav } from '../../../redux/action/Theme';

const Header = ({ topNavCollapsed, toggleTopNav, toggleSidebar, show }) => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const templateParam = query.get('template');

    // Build back-link: go back to create-invoice, preserving template param if any
    const backLink = templateParam
        ? `/apps/accounts/create-invoice?template=${templateParam}`
        : '/apps/accounts/create-invoice';

    const handlePrint = () => window.print();

    return (
        <header className="invoice-header">
            <div className="d-flex align-items-center">
                <Button as={Link} to={backLink} variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                    <span className="icon">
                        <span className="feather-icon"><ChevronLeft /></span>
                    </span>
                </Button>
                <div className="v-separator d-sm-inline-block d-none" />
                <Link to="#" className="invoiceapp-title link-dark ms-1 ms-sm-0">
                    <h1>Invoice Preview{templateParam ? ` — ${templateParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}` : ''}</h1>
                </Link>
            </div>

            <div className="invoice-options-wrap">
                {/* Print button */}
                <Button
                    variant="soft-secondary"
                    className="flex-shrink-0 d-md-inline-flex align-items-center gap-1 d-none me-2"
                    onClick={handlePrint}
                >
                    <Printer size={14} /> Print
                </Button>

                {/* Start with Template */}
                <Button
                    variant="soft-primary"
                    as={Link}
                    to={backLink}
                    className="flex-shrink-0 d-md-inline-block d-none"
                >
                    {templateParam ? 'Use This Template' : 'Start with Template'}
                </Button>

                <div className="v-separator d-md-inline-block d-none" />

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
