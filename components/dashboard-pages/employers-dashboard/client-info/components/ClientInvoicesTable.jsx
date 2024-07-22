/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import { InputGroup } from "react-bootstrap";
import Spinner from "../../../../spinner/spinner";
import { convertToFullDateFormat } from "../../../../../utils/convertToFullDateFormat";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

const ClientInvoicesTable = ({ fetchedInvoiceData }) => {
    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);

    const determineBadgeColor = (status) => {
        if (status) {
            return { color: "green", tag: "PAID" };
        } else {
            return { color: "red", tag: "UNPAID" };
        }
    };


    return (
        <>
            <div className="widget-content client-table">
                <div className="table-outer">
                    <Row>
                        <Col>
                            <b>Total Invoices</b><span className="optional"> (Showing recent 5 Invoices{ fetchedInvoiceData.length > 5 ? " out of" + fetchedInvoiceData.length : ""})</span>
                        </Col>
                        <Col style={{ display: "relative", textAlign: "right" }}>
                            <Form.Group className="chosen-single form-input chosen-container mb-3">
                                { fetchedInvoiceData && fetchedInvoiceData.length > 0 ?
                                    <Link
                                        href={`/employers-dashboard/clients/total-billings/${fetchedInvoiceData[0].client_number}`}
                                        style={{ textDecoration: "underline" }}
                                    >
                                        View All Invoices
                                    </Link>
                                : "" }
                            </Form.Group>
                        </Col>
                    </Row>
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>Created On</th>
                                <th>Invoice Date</th>
                                <th>Order Date</th>
                                <th>Invoice No</th>
                                <th>Order No</th>
                                <th>Order City</th>
                                <th>Route</th>
                                <th>Weight(Kg)</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        { Object.keys(fetchedInvoiceData).length === 0? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr style={{ border: "1px solid #333" }}>
                                    <td colSpan={4} style={{ border: "none" }}>
                                        <span><b>No Invoices Created yet!</b></span>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedInvoiceData).slice(0, 5).map(
                                    (invoice) => (
                                        <tr key={invoice.invoice_id}>
                                            <td>
                                                <ui className="option-list" style={{ border: "none" }}>
                                                    <li>
                                                        <button>
                                                            <a onClick={() => router.push(`/employers-dashboard/view-invoice/${invoice.invoice_id}`)}>
                                                                <span className="la la-print" title="Print Invoice"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ui>
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.invoice_created_at}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {convertToFullDateFormat(invoice.invoice_date, false)}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {convertToFullDateFormat(invoice.pickup_date, false)}
                                                </span>
                                            </td>
                                            <td>
                                                { user.role === "SUPER_ADMIN" ?
                                                    <Link
                                                        href={`/employers-dashboard/invoice-details/${invoice.invoice_number}`} 
                                                        style={{ textDecoration: "underline" }}
                                                    >
                                                        {invoice.invoice_number}
                                                    </Link>
                                                : <span> {invoice.invoice_number} </span>
                                                }
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.order_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.order_city ? invoice.order_city : "-"}
                                                </span>
                                            </td>
                                            <td>
                                                {invoice.pickup_location} - {invoice.drop_location}
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.weight}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.total_amount}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={"badge"}
                                                    style={{
                                                        backgroundColor:
                                                            determineBadgeColor(
                                                                invoice.is_paid
                                                            ).color,
                                                        fontSize: "11px"
                                                    }}
                                                >
                                                    {
                                                        determineBadgeColor(
                                                            invoice.is_paid
                                                        ).tag
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        )}
                    </Table>
                </div>
            </div>
        </>
    );
};

export default ClientInvoicesTable;
