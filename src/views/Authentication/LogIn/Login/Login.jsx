import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { clearAuthError, loginUser } from '../../../../redux/action/Auth';
import logo from '../../../../assets/img/geovision-logo.svg';

const Login = ({ loginUser, clearAuthError, error, isAuthenticated }) => {
  const history = useHistory();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) history.replace(from);
  }, [isAuthenticated, history, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidated(true);
    if (!email.trim() || !password.trim()) return;
    clearAuthError();
    loginUser(email.trim(), password);
  };

  return (
    <Container fluid className="min-vh-100">
      <Row className="min-vh-100 align-items-stretch">
        <Col lg={6} className="d-none d-lg-flex bg-primary-dark-3 text-white p-5 align-items-center">
          <div className="mx-auto" style={{ maxWidth: 480 }}>
            <img src={logo} alt="Geovision" style={{ maxWidth: 180 }} className="mb-4" />
            <h1 className="display-6 fw-bold mb-3">Welcome back to your CRM workspace</h1>
            <p className="lead opacity-75 mb-4">Sign in with your existing account to manage customers, opportunities, tasks, and calendar updates in one place.</p>
            <div className="rounded-4 p-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="fw-semibold mb-2">Geovision CRM</div>
              <div className="opacity-75">Manage customers, opportunities, tasks and more — all in one place.</div>
            </div>
          </div>
        </Col>
        <Col lg={6} className="d-flex align-items-center justify-content-center p-4 p-lg-5">
          <Card className="border-0 shadow-sm w-100" style={{ maxWidth: 520 }}>
            <Card.Body className="p-4 p-lg-5">
              <div className="text-center mb-4">
                <img src={logo} alt="Geovision" style={{ maxWidth: 140 }} className="mb-3 d-lg-none" />
                <h2 className="mb-2">Sign in</h2>
                <p className="text-muted mb-0">Use your email or username to continue.</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email or username</Form.Label>
                  <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email or username" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
                </Form.Group>
                <Button type="submit" className="w-100" variant="primary">Sign in</Button>
              </Form>
              <div className="text-center text-muted mt-3">
                Need an account? <Link to="/auth/signup">Create one</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const mapState = ({ auth }) => ({ error: auth.error, isAuthenticated: auth.isAuthenticated });
export default connect(mapState, { loginUser, clearAuthError })(Login);
