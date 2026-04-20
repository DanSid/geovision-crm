import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { Printer, Save } from 'react-feather';
import SimpleBar from 'simplebar-react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import EditInfo from './EditInfo';
import { Link } from 'react-router-dom';
import AddNewClient from './AddNewClient';
import { nanoid } from 'nanoid';
import HkInlineEdit from '../../../components/@hk-editable-component/HkInlineEdit';
import HkDropZone from '../../../components/@hk-drop-zone/HkDropZone';
import { addInvoice, updateInvoice } from '../../../redux/action/Crm';

const DEFAULT_ITEM = {
    id: 0,
    title: 'Redesigning of agencyclick.com',
    quantity: 1,
    price: 150,
    discount: 2,
    discountType: 'per',
    totalPrice: 147,
    description: 'This is my project description. if the line do not fill like the sentence is too big the area will start getting bigger',
};

const DEFAULT_TC = [
    { id: 0, conditon: 'Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.' },
    { id: 1, conditon: 'Please quote invoice number when remitting funds.' },
];

const Body = ({ invoices, addInvoice, updateInvoice, selectedTemplate, editId }) => {
    const history = useHistory();

    // Find existing invoice for editing
    const existing = editId ? (invoices || []).find(inv => String(inv.id) === String(editId)) : null;

    const [editInfo, setEditInfo] = useState(false);
    const [addNewClient, setAddNewClient] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState(existing?.invoiceNo || '0001');
    const [invoiceDate, setInvoiceDate] = useState(existing?.date || new Date().toISOString().slice(0, 10));
    const [dueDate, setDueDate] = useState(existing?.dueDate || '');
    const [customerNo, setCustomerNo] = useState(existing?.customerNo || '32321');
    const [billedToName, setBilledToName] = useState(existing?.billedToName || 'Supernova consultant');
    const [billedToEmail, setBilledToEmail] = useState(existing?.billedToEmail || 'thompson_peter@super.co');
    const [notes, setNotes] = useState(existing?.notes || '');
    const [invoiceStatus, setInvoiceStatus] = useState(existing?.status || 'draft');

    const [subTotal, setSubTotal] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [extraDiscount, setExtraDiscount] = useState(existing?.extraDiscount || { discValue: 0, discType: 'per' });
    const [grossTotal, setGrossTotal] = useState(0);
    const [itemList, setItemList] = useState(existing?.items || [DEFAULT_ITEM]);
    const [termAndConditions, setTermAndConditions] = useState(existing?.termsAndConditions || DEFAULT_TC);
    const [saved, setSaved] = useState(false);

    // Add new item
    const addItem = (e) => {
        e.preventDefault();
        setItemList([...itemList, { id: nanoid(), title: '', quantity: 0, price: 0, discount: 0, discountType: 'per', totalPrice: 0, description: '' }]);
    };

    // Update item on input change
    const updateItemList = (index) => (e) => {
        const newArr = [...itemList];
        newArr[index] = { ...newArr[index], [e.target.name]: e.target.value };
        if (newArr[index].discountType === 'per') {
            const disc = newArr[index].price - (newArr[index].price * newArr[index].discount / 100);
            newArr[index].totalPrice = newArr[index].quantity * disc;
        } else {
            newArr[index].totalPrice = newArr[index].quantity * (newArr[index].price - newArr[index].discount);
        }
        setItemList(newArr);
    };

    // Delete item
    const deleteItem = (itemId) => {
        const idx = itemList.findIndex(i => i.id === itemId);
        const newList = [...itemList];
        newList.splice(idx, 1);
        setItemList(newList);
    };

    // Recalculate totals
    useEffect(() => {
        const countSubtotal = itemList.reduce((ttl, d) => ttl + Number(d.totalPrice), 0);
        setSubTotal(countSubtotal);
        const disc = itemList.reduce((ttl, d) => ttl + Number(d.discount), 0);
        setTotalDiscount(disc);
        if (extraDiscount.discType === 'per') {
            setGrossTotal(countSubtotal - (countSubtotal * extraDiscount.discValue / 100));
        } else {
            setGrossTotal(countSubtotal - Number(extraDiscount.discValue));
        }
    }, [itemList, extraDiscount]);

    // T&C handlers
    const updateTC = (index) => (e) => {
        const updated = [...termAndConditions];
        updated[index] = { ...updated[index], conditon: e.target.value };
        setTermAndConditions(updated);
    };
    const addNewCondition = (e) => {
        e.preventDefault();
        setTermAndConditions([...termAndConditions, { id: nanoid(), conditon: '' }]);
    };
    const deleteCondition = (itemId) => {
        const idx = termAndConditions.findIndex(i => i.id === itemId);
        const newConds = [...termAndConditions];
        newConds.splice(idx, 1);
        setTermAndConditions(newConds);
    };

    // Save invoice to Redux
    const handleSave = (status = invoiceStatus) => {
        const payload = {
            ...(existing || {}),
            invoiceNo,
            template: selectedTemplate || 'standard',
            status,
            date: invoiceDate,
            dueDate,
            customerNo,
            billedToName,
            billedToEmail,
            notes,
            items: itemList,
            subTotal,
            totalDiscount,
            extraDiscount,
            grossTotal,
            termsAndConditions: termAndConditions,
        };
        if (existing) {
            updateInvoice(payload);
        } else {
            addInvoice(payload);
        }
        setSaved(true);
        setTimeout(() => {
            history.push('/apps/accounts/invoice-list');
        }, 800);
    };

    // Print the invoice
    const handlePrint = () => window.print();

    return (
        <>
            <div className="invoice-body">
                <SimpleBar className="nicescroll-bar">
                    <Container>
                        <div className="create-invoice-wrap mt-xxl-5 p-md-5 p-3">
                            {/* Top: Logo + Invoice title */}
                            <Row>
                                <Col lg={3} md={5} className="order-md-0 order-1">
                                    <HkDropZone>Upload Logo</HkDropZone>
                                </Col>
                                <Col lg={4} md={4} className="offset-lg-5 offset-md-3 mb-md-0 mb-4">
                                    <span className="d-flex align-items-center justify-content-md-end mb-0 inline-editable-wrap">
                                        <HkInlineEdit as="h2" id="editable1" value="Invoice" left />
                                    </span>
                                </Col>
                            </Row>

                            {/* Business info + Invoice meta */}
                            <Row className="mt-5">
                                <Col xxl={3}>
                                    <a className="d-inline-block mb-3" data-bs-toggle="collapse" href="#address_collpase" role="button" aria-expanded="false">
                                        - Your business information
                                    </a>
                                    <div className="collapse show" id="address_collpase">
                                        <div className="address-wrap">
                                            <h6>Hencework</h6>
                                            <p>4747, Pearl Street</p>
                                            <p>Rainy Day Drive, </p>
                                            <p>Washington DC 42156</p>
                                            <p>jampack_01@hencework.com</p>
                                        </div>
                                        <Link to="#" className="d-inline-flex align-items-center mt-2" onClick={() => setEditInfo(!editInfo)}>
                                            <i className="ri-pencil-line me-1" /> Edit Info
                                        </Link>
                                    </div>
                                </Col>
                                <Col xxl={4} className="offset-xxl-5 mt-xxl-0 mt-6">
                                    <Form>
                                        <Row className="gx-3">
                                            <Col lg={6} as={Form.Group} className="mb-3">
                                                <Form.Control defaultValue="Invoice No*" type="text" readOnly />
                                            </Col>
                                            <Col lg={6} as={Form.Group} className="mb-3">
                                                <Form.Control value={invoiceNo} type="text" onChange={e => setInvoiceNo(e.target.value)} />
                                            </Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col lg={6} as={Form.Group} className="mb-3">
                                                <Form.Control defaultValue="Invoice Date*" type="text" readOnly />
                                            </Col>
                                            <Col lg={6} as={Form.Group} className="mb-3">
                                                <Form.Control type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                                            </Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col lg={6} as={Form.Group} className="mb-3">
                                                <Form.Control defaultValue="Due Date*" type="text" readOnly />
                                            </Col>
                                            <Col lg={6} as={Form.Group} className="mb-3">
                                                <Form.Select value={dueDate} onChange={e => setDueDate(e.target.value)}>
                                                    <option value="">Due on Receipt</option>
                                                    <option value="net15">Net 15 Days</option>
                                                    <option value="net30">Net 30 Days</option>
                                                    <option value="net60">Net 60 Days</option>
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col lg={6} as={Form.Group} className="mb-3">
                                                <Form.Control defaultValue="Customer No" type="text" readOnly />
                                            </Col>
                                            <Col lg={6} as={Form.Group} className="mb-3">
                                                <Form.Control value={customerNo} type="text" onChange={e => setCustomerNo(e.target.value)} />
                                            </Col>
                                        </Row>
                                    </Form>
                                </Col>
                            </Row>

                            <div className="separator separator-light" />

                            {/* Billed To + Ship To */}
                            <Row>
                                <Col xxl={3} className="mb-xxl-0 mb-4">
                                    <h6>Billed To</h6>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                value={billedToName}
                                                onChange={e => setBilledToName(e.target.value)}
                                                placeholder="Client or company name"
                                            />
                                        </Form.Group>
                                        <Link to="#" className="d-inline-flex align-items-center" onClick={() => setAddNewClient(!addNewClient)}>
                                            <i className="ri-add-box-line me-1" /> Add new client
                                        </Link>
                                    </Form>
                                    <div className="Billto-wrap mt-4">
                                        <h6>{billedToName}</h6>
                                        <p>{billedToEmail}</p>
                                    </div>
                                </Col>
                                <Col xxl={4} className="offset-xxl-5">
                                    <h6>Ship To</h6>
                                    <div className="repeater">
                                        <div className="collapse" id="shipto_collpase">
                                            <Row className="gx-3">
                                                <div className="col-sm-12 form-group">
                                                    <Form.Control placeholder="Client business name" type="text" />
                                                </div>
                                                <div className="col-sm-12 form-group">
                                                    <Form.Control placeholder="Address" type="text" />
                                                </div>
                                                <Col lg={6} as={Form.Group} className="mb-3">
                                                    <Form.Control placeholder="City" type="text" />
                                                </Col>
                                                <Col lg={6} as={Form.Group} className="mb-3">
                                                    <Form.Control placeholder="Postal Code" type="text" />
                                                </Col>
                                                <div className="col-sm-12 form-group">
                                                    <Form.Control placeholder="State" type="text" />
                                                </div>
                                                <div className="col-sm-12 form-group">
                                                    <Form.Control placeholder="Country" type="text" />
                                                </div>
                                            </Row>
                                        </div>
                                        <a data-bs-toggle="collapse" href="#shipto_collpase" className="d-inline-flex align-items-center">
                                            <i className="ri-add-box-line me-1" /> Add shipping address
                                        </a>
                                    </div>
                                </Col>
                            </Row>

                            {/* Filters row */}
                            <Row className="mt-5">
                                <Col sm>
                                    <form className="form-inline p-3 bg-grey-light-5 rounded">
                                        <div className="row gx-3 align-items-center">
                                            <div className="col-xl-auto mb-xl-0 mb-2">
                                                <label className="form-label mb-xl-0">Filters</label>
                                            </div>
                                            <div className="col-xl-auto mb-xl-0 mb-2">
                                                <select className="form-select">
                                                    <option value={0}>Number format</option>
                                                    <option value={1}>One</option>
                                                    <option value={2}>Two</option>
                                                </select>
                                            </div>
                                            <div className="col-xl-auto mb-xl-0 mb-2">
                                                <select className="form-select">
                                                    <option value={0}>Add/Remove columns</option>
                                                    <option value={1}>One</option>
                                                    <option value={2}>Two</option>
                                                </select>
                                            </div>
                                            <div className="col-xl-auto">
                                                <select className="form-select">
                                                    <option value={0}>US Dollar ($ USD)</option>
                                                    <option value={1}>Ghana Cedi (₵ GHS)</option>
                                                    <option value={2}>Euro (€ EUR)</option>
                                                    <option value={3}>British Pound (£ GBP)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </form>
                                </Col>
                            </Row>

                            {/* ====== ITEMS TABLE SECTION ====== */}
                            <div className="table-wrap mt-5">
                                {/* Table section header with Print + Save buttons */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0 text-dark">Invoice Items</h6>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="d-flex align-items-center gap-1"
                                            onClick={handlePrint}
                                        >
                                            <Printer size={14} />
                                            Print Invoice
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            className="d-flex align-items-center gap-1"
                                            onClick={() => handleSave('draft')}
                                            disabled={saved}
                                        >
                                            <Save size={14} />
                                            {saved ? 'Saved!' : 'Save Draft'}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="d-flex align-items-center gap-1"
                                            onClick={() => handleSave('sent')}
                                            disabled={saved}
                                        >
                                            {saved ? 'Saved!' : 'Save & Send'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="invoice-table-wrap">
                                    {itemList.map((items, index) => (
                                        <Table bordered className="invoice-table" key={index}>
                                            <thead className="thead-primary">
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Quantity</th>
                                                    <th>Price</th>
                                                    <th colSpan={2}>Discount</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="table-row-gap"><td /></tr>
                                                <tr>
                                                    <td className="w-70 rounded-top-start border-end-0 border-bottom-0">
                                                        <Form.Control type="text" name="title" value={items.title} onChange={updateItemList(index)} />
                                                    </td>
                                                    <td className="border-end-0 border-bottom-0">
                                                        <Form.Control type="text" name="quantity" className="qty" value={items.quantity} onChange={updateItemList(index)} />
                                                    </td>
                                                    <td className="w-15 border-end-0 border-bottom-0">
                                                        <Form.Control type="text" name="price" className="price" value={items.price} onChange={updateItemList(index)} />
                                                    </td>
                                                    <td className="border-end-0 border-bottom-0">
                                                        <Form.Control type="text" name="discount" className="discount w-60p" value={items.discount} onChange={updateItemList(index)} />
                                                    </td>
                                                    <td className="border-end-0 border-bottom-0">
                                                        <Form.Select name="discountType" value={items.discountType} onChange={updateItemList(index)} className="disc-type w-70p">
                                                            <option value="per">%</option>
                                                            <option value="cur">$</option>
                                                        </Form.Select>
                                                    </td>
                                                    <td className="w-20 rounded-end bg-primary-light-5 close-over position-relative" rowSpan={2}>
                                                        <Form.Control type="text" className="bg-transparent border-0 p-0 total" value={Number(items.totalPrice).toFixed(2)} readOnly />
                                                        <Button bsPrefix="btn-close" className="close-row" onClick={() => deleteItem(items.id)}>
                                                            <span aria-hidden="true">×</span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={5} className="rounded-bottom-start border-end-0">
                                                        <Form.Control type="text" name="description" value={items.description} onChange={updateItemList(index)} placeholder="Item description (optional)" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    ))}
                                    <Link className="d-inline-flex align-items-center add-new-row" to="#" onClick={addItem}>
                                        <i className="ri-add-box-line me-1" /> Add new item
                                    </Link>
                                </div>
                            </div>
                            {/* ====== END ITEMS TABLE SECTION ====== */}

                            {/* Subtotals */}
                            <Row className="justify-content-end">
                                <Col xxl={6} className="mt-5">
                                    <div className="table-wrap">
                                        <Table responsive bordered className="subtotal-table">
                                            <tbody>
                                                <tr>
                                                    <td colSpan={3} className="rounded-top-start border-end-0 border-bottom-0">Subtotal</td>
                                                    <td className="rounded-top-end border-bottom-0 w-30 bg-primary-light-5">
                                                        <Form.Control type="text" className="bg-transparent border-0 p-0 gross-total" value={subTotal.toFixed(2)} readOnly />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={3} className="border-end-0 border-bottom-0">Item Discount</td>
                                                    <td className="border-bottom-0 bg-primary-light-5">
                                                        <Form.Control type="text" className="bg-transparent border-0 p-0 gross-discount" value={totalDiscount} readOnly />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border-end-0 border-bottom-0">Extra Discount</td>
                                                    <td className="border-end-0 border-bottom-0 w-25">
                                                        <Form.Control type="text" className="extdiscount" name="discValue" value={extraDiscount.discValue} onChange={e => setExtraDiscount({ ...extraDiscount, discValue: e.target.value })} />
                                                    </td>
                                                    <td className="border-end-0 border-bottom-0 w-25">
                                                        <Form.Select className="form-select extra-disc-type" name="discType" value={extraDiscount.discType} onChange={e => setExtraDiscount({ ...extraDiscount, discType: e.target.value })}>
                                                            <option value="per">%</option>
                                                            <option value="cur">$</option>
                                                        </Form.Select>
                                                    </td>
                                                    <td className="border-bottom-0 bg-primary-light-5">
                                                        <Form.Control type="text" className="bg-transparent border-0 p-0 extdiscount-read" value={extraDiscount.discValue} readOnly />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={3} className="rounded-bottom-start border-end-0 bg-primary-light-5">
                                                        <span className="text-dark fw-semibold">Total</span>
                                                    </td>
                                                    <td className="rounded-bottom-end bg-primary-light-5">
                                                        <Form.Control type="text" className="bg-transparent border-0 p-0 totalPrice fw-semibold" value={grossTotal.toFixed(2)} readOnly />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                            </Row>

                            {/* Note + Signature */}
                            <Row className="mt-4">
                                <Col xxl={5} className="order-2 order-xxl-0">
                                    <Form.Group>
                                        <div className="form-label-group">
                                            <Form.Label>Note to client</Form.Label>
                                            <small className="text-muted">1400</small>
                                        </div>
                                        <Form.Control as="textarea" rows={4} placeholder="Write a note to the client" value={notes} onChange={e => setNotes(e.target.value)} />
                                    </Form.Group>
                                </Col>
                                <Col xxl={4} className="offset-xxl-3 text-xxl-end mb-xxl-0 mb-3">
                                    <div className="btn btn-light btn-link text-primary btn-file bg-transparent p-0 border-0">
                                        <span className="d-inline-flex align-items-center">
                                            <i className="ri-add-box-line me-1" /> Add signature (Optional)
                                            <input type="file" className="upload" />
                                        </span>
                                    </div>
                                    <div>
                                        <a className="d-inline-flex align-items-center mt-2" data-bs-toggle="collapse" href="#label_collpase">
                                            <i className="ri-add-box-line me-1" /> Add Name &amp; Label
                                        </a>
                                    </div>
                                    <div className="collapse show mt-5" id="label_collpase">
                                        <Form.Group className="form-group close-over">
                                            <Form.Control type="text" defaultValue="Katherine Zeta Jones" />
                                            <Button bsPrefix="btn-close" className="close-input"><span aria-hidden="true">×</span></Button>
                                        </Form.Group>
                                        <Form.Group className="form-group close-over">
                                            <Form.Control type="text" defaultValue="Co-founder Hencework" />
                                            <Button bsPrefix="btn-close" className="close-input"><span aria-hidden="true">×</span></Button>
                                        </Form.Group>
                                    </div>
                                </Col>
                            </Row>

                            <div className="separator separator-light" />

                            {/* Terms & Conditions */}
                            <h6 className="mb-4">Terms &amp; Condition</h6>
                            <div className="repeater">
                                <ol className="ps-3" data-repeater-list="category-group">
                                    {termAndConditions.map((data, index) => (
                                        <li className="form-group close-over" key={index}>
                                            <Form.Control type="text" name="conditon" value={data.conditon} onChange={updateTC(index)} />
                                            <Button bsPrefix="btn-close" className="close-input" onClick={() => deleteCondition(data.id)}>
                                                <span aria-hidden="true">×</span>
                                            </Button>
                                        </li>
                                    ))}
                                </ol>
                                <Link to="#" className="d-inline-flex align-items-center" onClick={addNewCondition}>
                                    <i className="ri-add-box-line me-1" /> Add New Term Row
                                </Link>
                            </div>

                            <div className="separator separator-light" />

                            {/* Attach files */}
                            <div className="btn btn-light btn-file mb-4">
                                Attach files
                                <Form.Control type="file" className="upload" />
                            </div>

                            {/* Personal memo */}
                            <div className="my-2">
                                <a className="d-inline-flex align-items-center" data-bs-toggle="collapse" href="#memo_collpase">
                                    <i className="ri-add-box-line me-1" /> Add a personal memo
                                </a>
                            </div>
                            <div className="collapse show" id="memo_collpase">
                                <Row>
                                    <Col xxl={5}>
                                        <Form.Group className="mb-3">
                                            <div className="form-label-group">
                                                <Form.Label>Personal Memo</Form.Label>
                                                <small className="text-muted">1400</small>
                                            </div>
                                            <Form.Control as="textarea" rows={4} placeholder="Write an internal note" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* Bottom save + print actions */}
                            <div className="d-flex gap-2 mt-4 mb-2 pb-4">
                                <Button
                                    variant="outline-secondary"
                                    className="d-flex align-items-center gap-1"
                                    onClick={handlePrint}
                                >
                                    <Printer size={15} /> Print Invoice
                                </Button>
                                <Button
                                    variant="outline-success"
                                    className="d-flex align-items-center gap-1"
                                    onClick={() => handleSave('draft')}
                                    disabled={saved}
                                >
                                    <Save size={15} /> {saved ? 'Saved!' : 'Save as Draft'}
                                </Button>
                                <Button
                                    variant="primary"
                                    className="d-flex align-items-center gap-1"
                                    onClick={() => handleSave('sent')}
                                    disabled={saved}
                                >
                                    {saved ? 'Saved!' : 'Save & Send Invoice'}
                                </Button>
                            </div>
                        </div>
                    </Container>
                </SimpleBar>
            </div>

            <EditInfo show={editInfo} hide={() => setEditInfo(!editInfo)} />
            <AddNewClient show={addNewClient} hide={() => setAddNewClient(!addNewClient)} />
        </>
    );
};

const mapStateToProps = ({ invoices }) => ({ invoices });
export default connect(mapStateToProps, { addInvoice, updateInvoice })(Body);
