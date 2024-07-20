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
import { useRouter } from "next/router";

const ClientLRsTable = ({ fetchedLRData }) => {
    const router = useRouter();

    const determineBadgeColor = (status) => {
        switch (status) {
            case "Ready for pickup":
                return { color: "#87CEEB", textColor: "#333", tag: "Ready for pickup" };
            case "Tempo under the process":
                return { color: "#FFA500", textColor: "#333", tag: "Tempo under the process" };
            case "In process of departure":
                return { color: "#8f83c3", textColor: "#fff", tag: "In process of departure" };
            case "At destination city warehouse":
                return { color: "#FFE284", textColor: "#333", tag: "At destination city warehouse" };
            case "Ready for final delivery":
                return { color: "green", tag: "Ready for final delivery" };
            case "Cancel":
                return { color: "#dc3545", tag: "Cancel Order" };
            case "Completed":
                return { color: "gray", tag: "Completed" };
            default:
                return { color: "#B55385", textColor: "#fff", tag: "Under pickup process" };
        }
    };

    return (
        <>
            <div className="widget-content client-table">
                <div className="table-outer">
                    <Row>
                        <Col>
                            <b>Total LRs</b><span className="optional"> (Showing recent 5 LRs)</span>
                        </Col>
                        {/* <Col style={{ display: "relative", textAlign: "right" }}>
                            <Form.Group className="chosen-single form-input chosen-container mb-3">
                                { fetchedLRData && fetchedLRData.length > 0 ?
                                    <Link
                                        href={`/employers-dashboard/clients/total-orders/${fetchedLRData[0].client_number}`}
                                        style={{ textDecoration: "underline" }}
                                    >
                                        View All Orders
                                    </Link>
                                : "" }
                            </Form.Group>
                        </Col> */}
                    </Row>
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>LR No</th>
                                <th>LR Date</th>
                                <th>Order No</th>
                                <th>Consignor</th>
                                <th>Consignee</th>
                                <th>Pickup Point</th>
                                <th>Drop Point</th>
                                <th>Order Details</th>
                                <th>Driver Details</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        {fetchedLRData.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr style={{ border: "1px solid #333" }}>
                                    <td colSpan={4} style={{ border: "none" }}>
                                        <span><b>No LRs found!</b></span>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedLRData).map(
                                    (lr) => (
                                        <tr key={lr.id}>
                                            <td>
                                                <ui className="option-list" style={{ border: "none" }}>
                                                    <li>
                                                        <button>
                                                            <a onClick={() => router.push(`/employers-dashboard/view-lr/${lr.lr_id}`)}>
                                                                <span className="la la-print" title="Print LR"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ui>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/employers-dashboard/lr-details/${lr.lr_number}`} 
                                                    style={{ textDecoration: "underline" }}
                                                >
                                                    {lr.lr_number}
                                                </Link>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.lr_created_date}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/employers-dashboard/order-details/${lr.order_id}`} 
                                                    style={{ textDecoration: "underline" }}
                                                >
                                                    {lr.order_number}
                                                </Link>
                                            </td>
                                            <td>
                                                <span>{lr.consignor_name}</span><br />
                                                <span className="optional">{lr.consignor_phone ? "+91 " + lr.consignor_phone : ""}</span><br />
                                                <span className="optional">{lr.consignor_email}</span>
                                            </td>
                                            <td>
                                                <span>{lr.consignee_name}</span><br />
                                                <span className="optional">{lr.consignee_phone ? "+91 " + lr.consignee_phone : ""}</span><br />
                                                <span className="optional">{lr.consignee_email}</span>
                                            </td>
                                            <td>
                                                { lr.pickup_point_name ? lr.pickup_point_name: "-" }
                                            </td>
                                            <td>
                                                { lr.drop_point_name ? lr.drop_point_name: "-" }
                                            </td>
                                            <td>
                                                <span>{lr.material ? lr.material : "-" }</span> <br />
                                                <span>{lr.weight? lr.weight + "Kg" : "-" }</span> <br />
                                                <span>{lr.quantity ? lr.quantity : "-" }</span>
                                            </td>
                                            <td>
                                                <span>{lr.driver_details ? lr.driver_details : "-"}</span><br />
                                                <span>{lr.vehical_number ? lr.vehical_number : "-"}</span>
                                            </td>
                                            <td>
                                                {
                                                    lr.status === "Final" ? (
                                                        <span style={{ color: "green" }}>
                                                            {lr.status}
                                                        </span>
                                                    ) : lr.status === "Performa" ? (
                                                            <span style={{ color: "darkorange" }}>
                                                                {lr.status}
                                                            </span>
                                                    ) : <span>-</span>
                                                }
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

export default ClientLRsTable;
