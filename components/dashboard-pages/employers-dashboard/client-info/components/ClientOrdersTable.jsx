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
import Router, { useRouter } from "next/router";

const ClientOrdersTable = ({ fetchedOrdersData }) => {

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
                            <b>Total Orders</b><span className="optional"> (Showing recent 5 Orders)</span>
                        </Col>
                        <Col style={{ display: "relative", textAlign: "right" }}>
                            <Form.Group className="chosen-single form-input chosen-container mb-3">
                                { fetchedOrdersData && fetchedOrdersData.length > 0 ?
                                    <Link
                                        href={`/employers-dashboard/clients/total-orders/${fetchedOrdersData[0].client_number}`}
                                        style={{ textDecoration: "underline" }}
                                    >
                                        View All Orders
                                    </Link>
                                : "" }
                            </Form.Group>
                        </Col>
                    </Row>
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th><span>Created</span> <br /> <span>/Updated On</span></th>
                                <th>Pickup Date</th>
                                <th>ERP Order No</th>
                                <th>Order City</th>
                                <th>Route</th>
                                <th>Status</th>
                                <th>Order Details</th>
                                <th>Qunatity</th>
                            </tr>
                        </thead>
                        {fetchedOrdersData.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr style={{ border: "1px solid #333" }}>
                                    <td colSpan={4} style={{ border: "none" }}>
                                        <span><b>No Orders found!</b></span>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedOrdersData).map(
                                    (order) => (
                                        <tr key={order.id}>
                                            <td>
                                                <span>{order.order_created_at}</span> <br />
                                                <span className="optional">{order.order_updated_at ? order.order_updated_at : order.order_created_at}</span>
                                            </td>
                                            <td>
                                                {convertToFullDateFormat(order.pickup_date, false)}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/employers-dashboard/order-details/${order.order_id}`} 
                                                    style={{ textDecoration: "underline" }}
                                                >
                                                    {order.order_number}
                                                </Link>
                                            </td>
                                            <td>
                                                <span>{order.order_city}</span>
                                            </td>
                                            <td>
                                                <span>{order.pickup_location}-{order.drop_location}</span>
                                            </td>
                                            <td>
                                                <div
                                                    className="badge"
                                                    style={{
                                                        backgroundColor:
                                                            determineBadgeColor(
                                                                order.status
                                                            ).color,
                                                        color:
                                                            determineBadgeColor(
                                                                order.status
                                                            ).textColor,
                                                        margin: "auto",
                                                        fontSize: "12px",
                                                        lineHeight: "15px"
                                                    }}
                                                >
                                                    {determineBadgeColor(order.status).tag} <br />
                                                    {order.status_last_updated_at ? order.status_last_updated_at : order.order_created_at}
                                                </div>
                                                {/* <span className="optional" style={{ fontSize: "11px" }}>
                                                </span> */}
                                            </td>
                                            <td>
                                                <span>{order.material ? order.material : "-" }</span> <br />
                                                <span>{order.size ? order.size : "-" }</span> <br />
                                                <span>{order.priority ? order.priority : "-" }</span> <br />
                                                <span>{order.weight? order.weight + "Kg" : "-" }</span> <br />
                                            </td>
                                            <td>
                                                <span>{order.quantity ? order.quantity : "-" }</span> <br />
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

export default ClientOrdersTable;
