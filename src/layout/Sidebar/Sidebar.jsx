/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { NavLink, useRouteMatch } from 'react-router-dom';
import SidebarHeader from './SidebarHeader';
import { SidebarMenu } from './SidebarMenu';
import classNames from 'classnames';
import { useWindowWidth } from '@react-hook/window-size';
import { getEffectivePermissions, GROUP_TO_KEY } from '../../utils/permissions';

const Sidebar = ({ navCollapsed, toggleCollapsedNav, currentUser, permissions }) => {

    const [activeMenu, setActiveMenu] = useState();
    const [activeSubMenu, setActiveSubMenu] = useState();

    const windowWidth = useWindowWidth();

    // ── Compute effective permissions for the signed-in user ──────────────────
    // Admin always sees everything; per-user overrides apply first, then global.
    const effectivePerms = getEffectivePermissions(currentUser, permissions);

    // Filter top-level sidebar groups by section key
    const visibleMenu = SidebarMenu.filter(routes => {
        const sectionKey = GROUP_TO_KEY[routes.group];
        if (!sectionKey) return true; // unknown group → always show
        return effectivePerms[sectionKey] !== false;
    });

    const handleClick = (menuName) => {
        setActiveMenu(menuName);
        if (windowWidth <= 1199) {
            toggleCollapsedNav(false);
        }
    }

    const backDropToggle = () => {
        toggleCollapsedNav(!navCollapsed);
    }

    return (
        <>
            <div className="hk-menu">
                {/* Brand */}
                <SidebarHeader />
                {/* Main Menu */}
                <SimpleBar className="nicescroll-bar">
                    <div className="menu-content-wrap">
                        {visibleMenu.map((routes, index) => (
                            <React.Fragment key={index}>
                                <div className="menu-group">
                                    {routes.group && <div className="nav-header">
                                        <span>{routes.group}</span>
                                    </div>}
                                    {routes.contents.map((menus, idx) => (
                                        <Nav bsPrefix="navbar-nav" className="flex-column" key={idx}>
                                            <Nav.Item className={classNames({ "active": useRouteMatch(menus.path) })}>
                                                {
                                                    menus.childrens
                                                        ?
                                                        <>
                                                            <Nav.Link data-bs-toggle="collapse" data-bs-target={`#${menus.id}`} aria-expanded={activeMenu === menus.name ? "true" : "false"} onClick={() => setActiveMenu(menus.name)}>
                                                                <span className={classNames("nav-icon-wrap", { "position-relative": menus.iconBadge })}>
                                                                    {menus.iconBadge && menus.iconBadge}
                                                                    <span className="svg-icon">
                                                                        {menus.icon}
                                                                    </span>
                                                                </span>
                                                                <span className={classNames("nav-link-text", { "position-relative": menus.badgeIndicator })}>
                                                                    {menus.name}
                                                                    {menus.badgeIndicator && menus.badgeIndicator}
                                                                </span>
                                                                {menus.badge && menus.badge}
                                                            </Nav.Link>

                                                            <ul id={menus.id} className={classNames("nav flex-column nav-children", { "collapse": activeMenu !== menus.name })}>
                                                                <li className="nav-item">
                                                                    <ul className="nav flex-column">
                                                                        {menus.childrens.map((subMenu, indx) => (
                                                                            subMenu.childrens
                                                                                ?
                                                                                <li className="nav-item" key={indx}>
                                                                                    <Nav.Link as={NavLink} to={subMenu.path || '#'} className="nav-link" data-bs-toggle="collapse" data-bs-target={`#${subMenu.id}`} aria-expanded={activeSubMenu === subMenu.name ? "true" : "false"} onClick={() => setActiveSubMenu(subMenu.name)}>
                                                                                        <span className="nav-link-text">
                                                                                            {subMenu.name}
                                                                                        </span>
                                                                                    </Nav.Link>

                                                                                    {subMenu.childrens.map((childrenPath, i) => (
                                                                                        <ul id={subMenu.id} className={classNames("nav flex-column nav-children", { "collapse": activeSubMenu !== subMenu.name })} key={i}>
                                                                                            <li className="nav-item">
                                                                                                <ul className="nav flex-column">
                                                                                                    <li className="nav-item">
                                                                                                        <Nav.Link as={NavLink} to={childrenPath.path} onClick={handleClick}>
                                                                                                            <span className="nav-link-text">
                                                                                                                {childrenPath.name}
                                                                                                            </span>
                                                                                                        </Nav.Link>
                                                                                                    </li>
                                                                                                </ul>
                                                                                            </li>
                                                                                        </ul>
                                                                                    ))}
                                                                                </li>
                                                                                :
                                                                                <li className="nav-item" key={indx}>
                                                                                    <Nav.Link as={NavLink} to={subMenu.path} onClick={handleClick}>
                                                                                        <span className="nav-link-text">
                                                                                            {subMenu.name}
                                                                                        </span>
                                                                                    </Nav.Link>
                                                                                </li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            </ul>
                                                        </>
                                                        :
                                                        <Nav.Link as={NavLink} exact={true} activeClassName="active" to={menus.path} onClick={() => handleClick(menus.name)}>
                                                            <span className="nav-icon-wrap">
                                                                <span className="svg-icon">
                                                                    {menus.icon}
                                                                </span>
                                                            </span>
                                                            <span className="nav-link-text">{menus.name}</span>
                                                            {menus.badge && menus.badge}
                                                        </Nav.Link>
                                                }
                                            </Nav.Item>
                                        </Nav>
                                    ))}
                                </div>
                                <div className="menu-gap" />
                            </React.Fragment>
                        ))}
                    </div>
                </SimpleBar>
                {/* /Main Menu */}
            </div>
            <div onClick={backDropToggle} className="hk-menu-backdrop" />
        </>
    )
}

const mapStateToProps = ({ theme, auth, permissions }) => {
    const { navCollapsed } = theme;
    return { navCollapsed, currentUser: auth.currentUser, permissions }
};

export default connect(mapStateToProps, { toggleCollapsedNav })(Sidebar);
