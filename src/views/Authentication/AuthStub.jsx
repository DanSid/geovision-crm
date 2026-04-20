import React from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AuthStub = ({ title, subtitle, ctaLabel, secondaryLabel, secondaryTo }) => (
  <Container className="py-5">
    <Row className="justify-content-center">
      <Col md={6} lg={4}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2 className="mb-2">{title}</h2>
              <p className="text-muted mb-0">{subtitle}</p>
            </div>
            <Form>
              <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" placeholder="name@example.com" /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" placeholder="••••••••" /></Form.Group>
              <Button className="w-100" variant="primary">{ctaLabel}</Button>
            </Form>
            <div className="text-center text-muted mt-3">
              {secondaryLabel} <Link to={secondaryTo}>Continue</Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default AuthStub;
