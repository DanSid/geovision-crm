import React, { useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { updateCurrentUser } from '../../../redux/action/Auth';

const Body = ({ currentUser, updateCurrentUser }) => {
    const photoRef = useRef(null);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        designation: currentUser?.designation || '',
        bio: currentUser?.bio || '',
        city: currentUser?.city || '',
        country: currentUser?.country || '',
        phone: currentUser?.phone || '',
        photo: currentUser?.photo || null,
    });

    const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => set('photo', ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSave = (e) => {
        e.preventDefault();
        updateCurrentUser(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (!currentUser) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="ri-user-line fs-1 d-block mb-2" />
                <p>Please sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <Row className="mt-4">
            <Col lg={8} className="mx-auto">
                <Card className="card-border">
                    <Card.Header>
                        <h6 className="mb-0">My Profile</h6>
                    </Card.Header>
                    <Card.Body>
                        {saved && <Alert variant="success" className="py-2">Profile updated successfully.</Alert>}
                        <Form onSubmit={handleSave}>
                            {/* Photo section */}
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div
                                    className="border border-dashed rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
                                    style={{ width: 88, height: 88, cursor: 'pointer', flexShrink: 0 }}
                                    onClick={() => photoRef.current?.click()}
                                    title="Click to change photo"
                                >
                                    {form.photo ? (
                                        <img src={form.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="text-center">
                                            <i className="ri-camera-line fs-3 text-muted d-block" />
                                            <span className="text-muted" style={{ fontSize: 10 }}>Upload</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Button size="sm" variant="outline-primary" onClick={() => photoRef.current?.click()}>
                                        <i className="ri-upload-2-line me-1" /> Change Photo
                                    </Button>
                                    {form.photo && (
                                        <Button size="sm" variant="outline-danger" className="ms-2" onClick={() => set('photo', null)}>
                                            Remove
                                        </Button>
                                    )}
                                    <p className="text-muted mb-0 mt-1" style={{ fontSize: 12 }}>JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                                <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                            </div>

                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control
                                            placeholder="Your full name"
                                            value={form.name}
                                            onChange={(e) => set('name', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="your@email.com"
                                            value={form.email}
                                            onChange={(e) => set('email', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Designation / Title</Form.Label>
                                        <Form.Control
                                            placeholder="e.g. Business Manager"
                                            value={form.designation}
                                            onChange={(e) => set('designation', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control
                                            placeholder="+1 234 567 8900"
                                            value={form.phone}
                                            onChange={(e) => set('phone', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>City</Form.Label>
                                        <Form.Control
                                            placeholder="City"
                                            value={form.city}
                                            onChange={(e) => set('city', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Country</Form.Label>
                                        <Form.Control
                                            placeholder="Country"
                                            value={form.country}
                                            onChange={(e) => set('country', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Bio</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Tell us a bit about yourself..."
                                            value={form.bio}
                                            onChange={(e) => set('bio', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="mt-4 pt-3 border-top">
                                <Button type="submit" variant="primary">
                                    <i className="ri-save-line me-1" /> Save Changes
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Account info (read-only) */}
                <Card className="card-border mt-4">
                    <Card.Header>
                        <h6 className="mb-0">Account Information</h6>
                    </Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-2 px-3">
                            <span className="text-muted fs-7">Username</span>
                            <span className="fw-medium">{currentUser.username || currentUser.email}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-2 px-3">
                            <span className="text-muted fs-7">Role</span>
                            <span className={`badge badge-soft-${currentUser.role === 'admin' ? 'primary' : 'secondary'}`}>
                                {currentUser.role}
                            </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-2 px-3">
                            <span className="text-muted fs-7">Account ID</span>
                            <span className="text-muted fs-7">{currentUser.id}</span>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

const mapStateToProps = ({ auth }) => ({ currentUser: auth.currentUser });
export default connect(mapStateToProps, { updateCurrentUser })(Body);
