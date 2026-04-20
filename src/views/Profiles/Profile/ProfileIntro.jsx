import React from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import HkBadge from '../../../components/@hk-badge/@hk-badge';

const ProfileIntro = ({ currentUser }) => {
    const name = currentUser?.name || 'User';
    const role = currentUser?.role || 'user';
    const photo = currentUser?.photo || null;
    const designation = currentUser?.designation || '';
    const city = currentUser?.city || '';
    const country = currentUser?.country || '';
    const location = [city, country].filter(Boolean).join(', ');
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="profile-intro">
            <Card className="card-flush mw-400p bg-transparent">
                <Card.Body>
                    <div className="avatar avatar-xxl avatar-rounded position-relative mb-2">
                        {photo ? (
                            <img src={photo} alt={name} className="avatar-img border border-4 border-white" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div
                                className="avatar-img border border-4 border-white d-flex align-items-center justify-content-center text-white fw-bold bg-primary"
                                style={{ fontSize: 36, borderRadius: '50%', width: '100%', height: '100%' }}
                            >
                                {initial}
                            </div>
                        )}
                        <HkBadge bg="success" indicator className="badge-indicator-xl position-bottom-end-overflow-1 me-1" />
                    </div>
                    <h4 className="mb-1">
                        {name}
                        <span className={`badge badge-sm badge-soft-${role === 'admin' ? 'primary' : 'secondary'} ms-2 align-middle`} style={{ fontSize: 11 }}>
                            {role}
                        </span>
                    </h4>
                    {designation && <p className="text-muted mb-1">{designation}</p>}
                    {location && (
                        <p className="mb-0 fs-7">
                            <i className="bi bi-geo-alt me-1 text-muted" />
                            <span className="text-muted">{location}</span>
                        </p>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

const mapStateToProps = ({ auth }) => ({ currentUser: auth.currentUser });
export default connect(mapStateToProps)(ProfileIntro);
