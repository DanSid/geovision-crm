import React from 'react';
import { connect } from 'react-redux';
import { sidebarDataHover, toggleCollapsedNav } from '../../redux/action/Theme';
import { Link } from 'react-router-dom';
//Images
import logo from '../../assets/img/brand-sm.svg';
import jampackImg from '../../assets/img/geovision-logo.svg';
import { ArrowBarToLeft } from 'tabler-icons-react';
import { Button } from 'react-bootstrap';

const NavHeader = ({ navCollapsed, toggleCollapsedNav, sidebarDataHover, dataHover }) => {

    const toggleSidebar = () => {
        toggleCollapsedNav(!navCollapsed);
        setTimeout(() => {
            sidebarDataHover(!dataHover)
        }, 250);
        document.getElementById('tggl-btn').blur();
    }
    return (
        <div className="menu-header d-xl-none">
            <span>
                <Link className="navbar-brand" to="/">
                    <img className="brand-img img-fluid" src={logo} alt="brand" />
                    <img className="brand-img img-fluid" src={jampackImg} alt="brand" />
                </Link>
                <Button id="tggl-btn" variant="flush-dark" onClick={toggleSidebar} className="btn-icon btn-rounded flush-soft-hover navbar-toggle">
                    <span className="icon">
                        <span className="svg-icon fs-5">
                            <ArrowBarToLeft />
                        </span>
                    </span>
                </Button>
            </span>
        </div>
    )
}

const mapStateToProps = ({ theme }) => {
    const { navCollapsed, dataHover } = theme;
    return { navCollapsed, dataHover }
};

export default connect(mapStateToProps, { toggleCollapsedNav, sidebarDataHover })(NavHeader);
