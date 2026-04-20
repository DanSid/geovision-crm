import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { clearAuthError, registerUser } from '../../../redux/action/Auth';
import logo from '../../../assets/img/geovision-logo.svg';

const Signup = ({ registerUser, clearAuthError, error, isAuthenticated }) => {
  const history = useHistory();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) history.replace('/dashboard');
  }, [isAuthenticated, history]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    clearAuthError();
    setLocalError('');
    if (!form.name.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setLocalError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    registerUser(form);
  };

  return (
    <Container fluid className="min-vh-100">
      <Row className="min-vh-100 align-items-stretch">
        <Col lg={6} className="d-none d-lg-flex bg-primary-dark-3 text-white p-5 align-items-center">
          <div className="mx-auto" style={{ maxWidth: 480 }}>
            <img src={logo} alt="Geovision" style={{ maxWidth: 180 }} className="mb-4" />
            <h1 className="display-6 fw-bold mb-3">Create your CRM account</h1>
            <p className="lead opacity-75 mb-4">Register a user profile so each team member can manage their own tasks while still appearing in the shared task dashboard and calendar.</p>
            <div className="rounded-4 p-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="fw-semibold mb-2">What you get</div>
              <div className="opacity-75">Personal My Tasks view</div>
              <div className="opacity-75">Shared All Tasks visibility</div>
              <div className="opacity-75">Task calendar sync across the CRM</div>
            </div>
          </div>
        </Col>
        <Col lg={6} className="d-flex align-items-center justify-content-center p-4 p-lg-5">
          <Card className="border-0 shadow-sm w-100" style={{ maxWidth: 560 }}>
            <Card.Body className="p-4 p-lg-5">
              <div className="text-center mb-4">
                <img src={logo} alt="Geovision" style={{ maxWidth: 140 }} className="mb-3 d-lg-none" />
                <h2 className="mb-2">Create account</h2>
                <p className="text-muted mb-0">Restore the original signup flow and add a working CRM user.</p>
              </div>
              {(error || localError) && <Alert variant="danger">{localError || error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control value={form.name} onChange={(e) => update('name', e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control value={form.username} onChange={(e) => update('username', e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm password</Form.Label>
                  <Form.Control type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
                </Form.Group>
                <Button type="submit" className="w-100">Create account</Button>
              </Form>
              <div className="text-center text-muted mt-3">
                Already have an account? <Link to="/auth/login">Sign in</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const mapState = ({ auth }) => ({ error: auth.error, isAuthenticated: auth.isAuthenticated });
export default connect(mapState, { registerUser, clearAuthError })(Signup);
