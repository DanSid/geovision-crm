import React from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import HkDropZone from '../../components/@hk-drop-zone/HkDropZone';
import HkTags from '../../components/@hk-tags/@hk-tags';

const CreateNewContact = ({ show, close }) => {

    const Tags = [];

    return (
        <Modal show={show} onHide={close} centered size="lg" className="add-new-contact" >
            <Modal.Body>
                <Button bsPrefix="btn-close" onClick={close}>
                    <span aria-hidden="true">×</span>
                </Button>
                <h5 className="mb-5">Create New Conatct</h5>
                <Form>
                    <Row className="gx-3">
                        <Col sm={2} as={Form.Group} className="mb-3" >
                            <HkDropZone className="dropify-square">
                                Upload Photo
                            </HkDropZone>
                            {/* </div> */}
                        </Col>
                        <Col sm={10} as={Form.Group}>
                            <Form.Control as="textarea" className="mnh-100p" rows={4} placeholder="Brief Narrative about the Client" />
                        </Col>
                    </Row>
                    <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>Basic Info</span>
                    </div>
                    <Row className="gx-3">
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </Col>
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Middle Name</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </Col>
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="gx-3">
                        <div className="col-sm-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Email ID</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </div>
                        <div className="col-sm-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </div>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>City</Form.Label>
                                <Form.Control type="text" placeholder="Enter city" />
                            </Form.Group>
                        </Col>
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>State</Form.Label>
                                <Form.Control type="text" placeholder="Enter state" />
                            </Form.Group>
                        </Col>
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Country</Form.Label>
                                <Form.Control type="text" placeholder="Enter country" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="title title-xs title-wth-divider text-primary text-uppercase my-4"><span>Company Info</span></div>
                    <Row className="gx-3">
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Company Name</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Designation</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Website</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Work Phone</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="title title-xs title-wth-divider text-primary text-uppercase my-4"><span>Additional Info</span></div>
                    <Row className="gx-3">
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Contact Source</Form.Label>
                                <Form.Select>
                                    <option value="">— Select source —</option>
                                    <option value="Direct">Direct</option>
                                    <option value="Organic Search">Organic Search</option>
                                    <option value="Referral">Referral</option>
                                </Form.Select>
                                <Form.Text className="text-muted">How did this contact find you?</Form.Text>
                            </Form.Group>
                        </Col>
                        <div className="col-sm-12">
                            <Form.Group className="mb-3">
                                <Form.Label>Tags</Form.Label>
                                <HkTags
                                    options={Tags}
                                />
                                <small className="form-text text-muted">
                                    You can add upto 4 tags per contact
                                </small>
                            </Form.Group>
                        </div>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder="Facebook" />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder="Twitter" />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder="LinkedIn" />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder="Gmail" />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="align-items-center">
                <Button variant="secondary" onClick={close}>Discard</Button>
                <Button variant="primary" onClick={close}>Create Contact</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default CreateNewContact;
