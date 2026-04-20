import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { Plus } from 'react-feather';
import { connect } from 'react-redux';
import { addCompany } from '../../../redux/action/Crm';
import CompanyForm from './CompanyForm';

const emptyForm = {
    name: '', phone: '', fax: '', tollFree: '', website: '', ticker: '',
    description: '', industry: '', referredBy: '', status: 'Active',
    address1: '', address2: '', city: '', county: '', post: '', country: '',
};

const CompanySidebar = ({ companies, contacts, selectedId, onSelect, addCompany }) => {
    const [show, setShow] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Company name is required';
        return e;
    };

    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        addCompany({ ...form });
        setForm(emptyForm);
        setErrors({});
        setShow(false);
    };

    return (
        <div className="d-flex flex-column h-100 border-end" style={{ width: 230, minWidth: 200 }}>
            <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                <div>
                    <div className="fw-semibold fs-7">All Companies</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{companies.length} companies</div>
                </div>
                <Button variant="primary" size="sm" className="btn-icon" onClick={() => setShow(true)}>
                    <Plus size={15} />
                </Button>
            </div>

            <SimpleBar style={{ flex: 1, overflowY: 'auto' }}>
                {companies.length === 0 ? (
                    <div className="text-center text-muted py-4 fs-7">No companies yet.</div>
                ) : (
                    <ul className="list-unstyled mb-0">
                        {companies.map(co => {
                            const contactCount = contacts.filter(c => String(c.companyId) === String(co.id)).length;
                            return (
                                <li
                                    key={co.id}
                                    className={`px-3 py-2 border-bottom cursor-pointer ${String(selectedId) === String(co.id) ? 'bg-primary-light-5 fw-semibold text-primary' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onSelect(co.id)}
                                >
                                    <div className="fs-7">{co.name}</div>
                                    {contactCount > 0 && (
                                        <div className="text-muted" style={{ fontSize: 11 }}>{contactCount} contact{contactCount !== 1 ? 's' : ''}</div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </SimpleBar>

            <Modal show={show} onHide={() => { setShow(false); setForm(emptyForm); setErrors({}); }} size="lg" scrollable>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">New Company</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CompanyForm form={form} set={set} errors={errors} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => { setShow(false); setForm(emptyForm); setErrors({}); }}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>Save Company</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ companies, contacts }) => ({ companies, contacts });
export default connect(mapStateToProps, { addCompany })(CompanySidebar);
