import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../../redux/action/Theme';
import ProfileIntro from './ProfileIntro';
import Header from './Header';
import Body from './Body';

const Profile = ({ toggleCollapsedNav }) => {
    useEffect(() => {
        toggleCollapsedNav(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="hk-pg-body">
            <Container>
                <div className="profile-wrap">
                    <div className="profile-img-wrap" style={{ background: 'linear-gradient(135deg, #1a3a4a 0%, #0d6efd 100%)', minHeight: 180, borderRadius: 12 }} />
                    <ProfileIntro />
                    <Header />
                    <Body />
                </div>
            </Container>
        </div>
    );
};

const mapStateToProps = ({ theme }) => ({ navCollapsed: theme.navCollapsed });
export default connect(mapStateToProps, { toggleCollapsedNav })(Profile);
