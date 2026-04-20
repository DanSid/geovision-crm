/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { Link, NavLink, useRouteMatch } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import { horizontalMenu } from '../../utils/HorizontalNavInit';
import NavHeader from './NavHeader';
import { useHistory } from 'react-router-dom';
import { NavMenu } from './NavMenu';
import classNames from 'classnames';
import 'bootstrap/js/dist/collapse';

const CompactMenu = () => {

    const [activeMenu, setActiveMenu] = useState();
    let history = useHistory();

    useEffect(() => {
        setTimeout(() => {
            horizontalMenu();
        }, 300);
        window.dispatchEvent(new Event('resize'));
        const handleWindowResize = () => {
            setTimeout(() => {
                horizontalMenu();
            }, 250);
        };
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    })

    useEffect(() => {
        document.addEventListener("click", function (e) {
            const target = e.target.closest(".more-nav-item");
            const extra = e.target.closest(".extra-link");
            if (target && !extra) {
                e.preventDefault();
                const newTarget = e.target.closest(".nav-link");
                history.push(newTarget.getAttribute("href"));
            }
        });
    }, [history])

    const handleClick = (menuName) => {
        setActiveMenu(menuName);
    }


    return (
        <div className="hk-menu">
            {/* Brand */}
            <NavHeader />
            {/* Main Menu */}
            <SimpleBar className="nicescroll-bar">
                <div className="menu-content-wrap">
                    <Container fluid className="menu-group">
                        <Nav as="ul" className="navbar-nav flex-column">
                            {
                                NavMenu.map((routes, index) => (
                                    <React.Fragment key={index} >
                                        {
                                            routes.contents.map((menus, ind) => (
                                                <Nav.Item as='li' key={ind} className={classNames({ "active": useRouteMatch(menus.path) })} >
                                                    {
                                                        menus.childrens
                                                            ?
                                                            <>
                                                                <Nav.Link data-bs-toggle="collapse" data-bs-target={`#${menus.id}`}>
                                                                    <span className={classNames("nav-link-text", { "position-relative": menus.badgeIndicator })} >
                                                                        {menus.name}
                                                                        {menus.badgeIndicator && menus.badgeIndicator}
                                                                    </span>
                                                                    {menus.badge && menus.badge}
                                                                </Nav.Link>

                                                                <Nav as="ul" id={menus.id} className={classNames("nav flex-column nav-children", { "collapse": activeMenu !== menus.name })}>
                                                                    <Nav.Item as="li">
                                                                        <ul className="nav flex-column">
                                                                            {menus.childrens.map((subMenu, indx) => (
                                                                                subMenu.childrens
                                                                                    ?
                                                                                    <Nav.Item as="li" key={indx} >
                                                                                        <Nav.Link as={Link} to="#" className="nav-link" data-bs-toggle="collapse" data-bs-target={`#${subMenu.id}`}>
                                                                                            <span className="nav-link-text">
                                                                                                {subMenu.name}
                                                                                            </span>
                                                                                        </Nav.Link>

                                                                                        <Nav as="ul" id={subMenu.id} className="flex-column collapse  nav-children">
                                                                                            <Nav.Item as="li">
                                                                                                <ul className="nav flex-column">
                                                                                                    {subMenu.childrens.map((childrenPath, i) => (
                                                                                                        <li className="nav-item" key={i}>
                                                                                                            <Nav.Link as={NavLink} to={childrenPath.path} onClick={handleClick}>
                                                                                                                <span className="nav-link-text">
                                                                                                                    {childrenPath.name}
                                                                                                                </span>
                                                                                                            </Nav.Link>
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </Nav.Item>
                                                                                        </Nav>

                                                                                    </Nav.Item>
                                                                                    :
                                                                                    <Nav.Item key={indx}>
                                                                                        <Nav.Link as={NavLink} to={subMenu.path} onClick={handleClick}>
                                                                                            <span className="nav-link-text">
                                                                                                {subMenu.name}
                                                                                            </span>
                                                                                        </Nav.Link>
                                                                                    </Nav.Item>
                                                                            ))}
                                                                        </ul>
                                                                    </Nav.Item>
                                                                </Nav>
                                                            </>
                                                            :
                                                            <>
                                                                {
                                                                    (routes.group === "Documentation")
                                                                        ?
                                                                        <Nav.Link href={menus.path} className="extra-link">
                                                                            <span className="nav-link-text">{menus.name}</span>
                                                                            {menus.badge && menus.badge}
                                                                        </Nav.Link>
                                                                        :
                                                                        <Nav.Link as={NavLink} exact={true} activeClassName="active" to={menus.path} onClick={() => handleClick(menus.name)} >

                                                                            <span className="nav-link-text">{menus.name}</span>
                                                                            {menus.badge && menus.badge}
                                                                        </Nav.Link>
                                                                }
                                                            </>
                                                    }
                                                </Nav.Item>
                                            ))
                                        }
                                    </React.Fragment>
                                ))
                            }
                        </Nav>
                    </Container>
                </div>
            </SimpleBar>
        </div>
    )
}

export default CompactMenu
