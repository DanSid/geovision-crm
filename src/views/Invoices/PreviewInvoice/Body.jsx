import React from 'react';
import SimpleBar from 'simplebar-react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Printer } from 'react-feather';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../../utils/theme-provider/theme-provider';

import jampackImg from '../../../assets/img/geovision-logo.svg';
import jampackImgDark from '../../../assets/img/geovision-logo-dark.svg';

const fmt = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return iso; }
};

const fmtCurrency = (val) =>
    `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

// ---- Static fallback shown when no ?id= is given (template preview) ----
const StaticPreview = ({ theme }) => (
    <div className="template-invoice-wrap mt-xxl-5 p-md-5 p-3">
        <Row>
            <Col lg={3} md={5} className="order-md-0 order-1">
                {theme === 'light'
                    ? <img src={jampackImg} alt="brand" />
                    : <img src={jampackImgDark} alt="brand" />}
            </Col>
            <Col lg={4} md={4} className="offset-lg-5 offset-md-3 mb-md-0 mb-2">
                <h2 className="d-flex justify-content-md-end mb-0">Invoice</h2>
            </Col>
        </Row>
        <Row className="mt-4">
            <Col md={4} className="order-md-0 order-1">
                <div className="address-wrap">
                    <h6>Hencework</h6>
                    <p>4747, Pearl Street</p>
                    <p>Rainy day Drive</p>
                    <p>Washington DC 42341</p>
                    <p>jampack_01@hencework.com</p>
                </div>
            </Col>
            <Col md={5} className="offset-md-3 mb-4 mb-md-0">
                <div className="d-flex justify-content-md-end">
                    <div className="text-md-end me-3">
                        <div className="mb-1">Invoice No*</div>
                        <div className="mb-1">Invoice Date*</div>
                        <div className="mb-1">Due Date*</div>
                        <div>Customer No</div>
                    </div>
                    <div className="text-dark">
                        <div className="mb-1">0001</div>
                        <div className="mb-1">24/08/2020</div>
                        <div className="mb-1">Due on receipt</div>
                        <div>321456</div>
                    </div>
                </div>
            </Col>
        </Row>
        <div className="separator separator-light" />
        <Row>
            <Col md={3}>
                <h6 className="text-uppercase fs-7 mb-2">Billed To</h6>
                <div className="Billto-wrap">
                    <h6>Supernova consultant</h6>
                    <p>4747, Pearl Street, Washington DC 42341</p>
                    <p>jampack_01@hencework.com</p>
                </div>
            </Col>
        </Row>
        <div className="table-wrap mt-6">
            <Table bordered responsive>
                <thead className="thead-primary">
                    <tr>
                        <th>Item</th>
                        <th className="text-end">Quantity</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Discount</th>
                        <th className="text-end">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="w-70"><h6>Redesigning of agencyclick.com</h6><p>Sample project description.</p></td>
                        <td className="text-end text-dark">8</td>
                        <td className="w-15 text-end text-dark">60.00</td>
                        <td className="text-end text-dark">5%</td>
                        <td className="w-20 text-end text-dark">$456.00</td>
                    </tr>
                    <tr>
                        <td colSpan={2} rowSpan={3} className="border-0" />
                        <td colSpan={2}>Subtotal</td>
                        <td className="text-end text-dark">$456.00</td>
                    </tr>
                    <tr>
                        <td colSpan={2}>Discount</td>
                        <td className="text-end text-dark">$24.00</td>
                    </tr>
                    <tr>
                        <td colSpan={2} className="text-dark fw-semibold border">Total</td>
                        <td className="text-end text-dark fw-semibold border">$432.00</td>
                    </tr>
                </tbody>
            </Table>
        </div>
        <Row className="mt-3">
            <Col lg={5}>
                <h6>Terms &amp; Conditions</h6>
                <ol className="ps-3">
                    <li>Please pay within 15 days from the date of invoice.</li>
                    <li>Please quote invoice number when remitting funds.</li>
                </ol>
            </Col>
            <Col lg={7} className="text-lg-end mt-lg-0 mt-3">
                <h5 className="mt-lg-7">Katherine Zeta Jones</h5>
                <p>Co-founder, Hencework</p>
            </Col>
        </Row>
    </div>
);

// ---- Real invoice preview built from Redux data ----
const InvoicePreview = ({ invoice, theme }) => {
    const dueLabel = !invoice.dueDate || invoice.dueDate === ''
        ? 'Due on Receipt'
        : invoice.dueDate === 'net15' ? 'Net 15 Days'
        : invoice.dueDate === 'net30' ? 'Net 30 Days'
        : invoice.dueDate === 'net60' ? 'Net 60 Days'
        : invoice.dueDate;

    const extraDiscAmount = invoice.extraDiscount?.discType === 'per'
        ? (invoice.subTotal || 0) * (invoice.extraDiscount?.discValue || 0) / 100
        : Number(invoice.extraDiscount?.discValue || 0);

    return (
        <div className="template-invoice-wrap mt-xxl-5 p-md-5 p-3">
            {/* Header row */}
            <Row>
                <Col lg={3} md={5} className="order-md-0 order-1">
                    {theme === 'light'
                        ? <img src={jampackImg} alt="brand" />
                        : <img src={jampackImgDark} alt="brand" />}
                </Col>
                <Col lg={4} md={4} className="offset-lg-5 offset-md-3 mb-md-0 mb-2">
                    <h2 className="d-flex justify-content-md-end mb-0">Invoice</h2>
                </Col>
            </Row>

            {/* Addresses + meta */}
            <Row className="mt-4">
                <Col md={4} className="order-md-0 order-1">
                    <div className="address-wrap">
                        <h6>Hencework</h6>
                        <p>4747, Pearl Street</p>
                        <p>Washington DC 42156</p>
                        <p>jampack_01@hencework.com</p>
                    </div>
                </Col>
                <Col md={5} className="offset-md-3 mb-4 mb-md-0">
                    <div className="d-flex justify-content-md-end">
                        <div className="text-md-end me-3">
                            <div className="mb-1 text-muted">Invoice No</div>
                            <div className="mb-1 text-muted">Invoice Date</div>
                            <div className="mb-1 text-muted">Due Date</div>
                            <div className="text-muted">Customer No</div>
                        </div>
                        <div className="text-dark">
                            <div className="mb-1 fw-semibold">{invoice.invoiceNo || '—'}</div>
                            <div className="mb-1">{fmt(invoice.date)}</div>
                            <div className="mb-1">{dueLabel}</div>
                            <div>{invoice.customerNo || '—'}</div>
                        </div>
                    </div>
                </Col>
            </Row>

            <div className="separator separator-light" />

            {/* Billed To */}
            <Row>
                <Col md={3}>
                    <h6 className="text-uppercase fs-7 mb-2">Billed To</h6>
                    <div className="Billto-wrap">
                        <h6>{invoice.billedToName || '—'}</h6>
                        {invoice.billedToEmail && <p>{invoice.billedToEmail}</p>}
                    </div>
                </Col>
            </Row>

            {/* Items table */}
            <div className="table-wrap mt-6">
                <Table bordered responsive>
                    <thead className="thead-primary">
                        <tr>
                            <th>Item</th>
                            <th className="text-end">Qty</th>
                            <th className="text-end">Price</th>
                            <th className="text-end">Discount</th>
                            <th className="text-end">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(invoice.items || []).map((item, i) => (
                            <tr key={i}>
                                <td className="w-70">
                                    <h6 className="mb-0">{item.title || '—'}</h6>
                                    {item.description && <p className="mb-0 text-muted fs-7">{item.description}</p>}
                                </td>
                                <td className="text-end text-dark">{item.quantity}</td>
                                <td className="w-15 text-end text-dark">{fmtCurrency(item.price)}</td>
                                <td className="text-end text-dark">
                                    {item.discountType === 'per'
                                        ? `${item.discount}%`
                                        : fmtCurrency(item.discount)}
                                </td>
                                <td className="w-20 text-end text-dark fw-semibold">{fmtCurrency(item.totalPrice)}</td>
                            </tr>
                        ))}

                        {/* Totals rows */}
                        <tr>
                            <td colSpan={2} rowSpan={4} className="border-0" />
                            <td colSpan={2}>Subtotal</td>
                            <td className="text-end text-dark">{fmtCurrency(invoice.subTotal)}</td>
                        </tr>
                        <tr>
                            <td colSpan={2}>Item Discount</td>
                            <td className="text-end text-dark">{invoice.totalDiscount ?? 0}</td>
                        </tr>
                        <tr>
                            <td colSpan={2}>Extra Discount</td>
                            <td className="text-end text-dark">{fmtCurrency(extraDiscAmount)}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="text-dark fw-semibold border">Total</td>
                            <td className="text-end text-dark fw-semibold border">{fmtCurrency(invoice.grossTotal)}</td>
                        </tr>
                    </tbody>
                </Table>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <Row className="mt-3">
                    <Col lg={5}>
                        <h6>Note to client</h6>
                        <p>{invoice.notes}</p>
                    </Col>
                </Row>
            )}

            {/* Terms & Conditions */}
            {(invoice.termsAndConditions || []).length > 0 && (
                <>
                    <div className="separator separator-light mt-5" />
                    <Row>
                        <Col md={12}>
                            <h6>Terms &amp; Conditions</h6>
                            <ol className="ps-3">
                                {invoice.termsAndConditions.map((tc, i) => (
                                    <li key={i}>{tc.conditon}</li>
                                ))}
                            </ol>
                        </Col>
                    </Row>
                </>
            )}

            {/* Print button — hidden when actually printing */}
            <div className="d-flex justify-content-end mt-5 no-print">
                <Button
                    variant="primary"
                    className="d-flex align-items-center gap-2"
                    onClick={() => window.print()}
                >
                    <Printer size={15} /> Print Invoice
                </Button>
            </div>
        </div>
    );
};

// ---- Main Body component ----
const Body = ({ invoices }) => {
    const { theme } = useTheme();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const invoiceId = query.get('id');

    const invoice = invoiceId
        ? (invoices || []).find(inv => String(inv.id) === String(invoiceId))
        : null;

    return (
        <div className="invoice-body">
            <SimpleBar className="nicescroll-bar">
                <Container>
                    {invoice
                        ? <InvoicePreview invoice={invoice} theme={theme} />
                        : <StaticPreview theme={theme} />
                    }
                </Container>
            </SimpleBar>
        </div>
    );
};

const mapStateToProps = ({ invoices }) => ({ invoices });
export default connect(mapStateToProps)(Body);
