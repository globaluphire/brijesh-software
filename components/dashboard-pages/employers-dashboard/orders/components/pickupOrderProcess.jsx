/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import candidatesData from "../../../../../data/candidates";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../../config/supabaseClient";
import { toast } from "react-toastify";
import { Typeahead } from "react-bootstrap-typeahead";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useSelector } from "react-redux";
import Pagination from "../../../../common/Pagination";
import Table from "react-bootstrap/Table";
import DateRangePickerComp from "../../../../date/DateRangePickerComp";

const addSearchFilters = {
    consignorName: "",
    consigneeName: "",
    fromCity: "",
    toCity: "",
    driverName: "",
    status: ""
};

const PickupOrderProcess = () => {
    const router = useRouter();

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedOpenOrderdata, setFetchedOpenOrderdata] = useState({});
    const [fetchedOpenOrderdataCSV, setFetchedOpenOrderdataCSV] = useState({});
    const [fetchedOrderCommentData, setFetchedOrderCommentData] = useState([]);

    const [applicationStatus, setApplicationStatus] = useState("");
    const [
        applicationStatusReferenceOptions,
        setApplicationStatusReferenceOptions,
    ] = useState(null);
    const [
        orderStatusReferenceOptions,
        setOrderStatusReferenceOptions,
    ] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [applicationId, setApplicationId] = useState("");
    const [orderDetails, setOrderDetails] = useState("");

    // For Pagination
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [hidePagination, setHidePagination] = useState(false);
    // const [pageSize, setPageSize] = useState(10);

    // for search filters
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const {
        consignorName,
        consigneeName,
        fromCity,
        toCity,
        driverName,
        status } = useMemo(
        () => searchFilters,
        [searchFilters]
    );

    // global states
    const facility = useSelector((state) => state.employer.facility.payload);

    const dateFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                }) +
                ", " +
                date.getFullYear()
            );
        }
    };

    const dateTimeFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })
            );
        }
    };

    // clear all filters
    const clearAll = () => {
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        findOrder(JSON.parse(JSON.stringify(addSearchFilters)));
    };

    async function findOrder(searchFilters) {
        let query = supabase
            .from("orders")
            .select("*")
            .eq("status", "Pickup");

        if (searchFilters.status) {
            query.ilike("status", "%" + searchFilters.status + "%");
        }

        // setTotalRecords((await query).data.length);

        let { data, error } = await query.order("order_created_at", {
            ascending: false,
            nullsFirst: false,
        });
        // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        if (data) {
            data.forEach(
                (order) => (order.order_created_at = dateFormat(order.order_created_at))
            );
            data.forEach(
                (order) => (order.order_updated_at = dateFormat(order.order_updated_at))
            );
            data.forEach(
                (order) => (order.status_last_updated_at = dateTimeFormat(order.status_last_updated_at))
            );

            setFetchedOpenOrderdata(data);

            // creating new array object for CSV export
            const orderDataCSV = data.map(({ order_id, order_created_by,...rest }) => ({ ...rest }));
            setFetchedOpenOrderdataCSV(orderDataCSV);
        }
    }

    async function fetchOpenOrder({
        consignorName,
        consigneeName,
        fromCity,
        toCity,
        driverName,
        status
    }) {
        try {
            // call reference to get lrStatus options
            const { data, error: e } = await supabase
                .from("reference")
                .select("*")
                .eq("ref_nm", "orderStatus");

            if (data) {
                setOrderStatusReferenceOptions(data);
            }

            let query = supabase
                .from("orders")
                .select("*")
                .eq("status", "Pickup");

            let { data: orderData, error } = await query.order(
                "order_created_at",
                { ascending: false, nullsFirst: false }
            );
            // .range(
            //     (currentPage - 1) * pageSize,
            //     currentPage * pageSize - 1
            // );

            // if (facility) {
            //     allApplicantsView = allApplicantsView.filter(
            //         (i) => i.facility_name === facility
            //     );
            // }

            if (orderData) {
                orderData.forEach(
                    (i) => (i.order_created_at = dateFormat(i.order_created_at))
                );
                orderData.forEach(
                    (i) => (i.order_updated_at = dateFormat(i.order_updated_at))
                );
                orderData.forEach(
                    (i) => (i.status_last_updated_at = dateTimeFormat(i.status_last_updated_at))
                );
            }

            setFetchedOpenOrderdata(orderData);
        } catch (e) {
            toast.error(
                "System is unavailable.  Please try again later or contact tech support!",
                {
                    position: "bottom-right",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                }
            );
            console.warn(e);
        }
    }
    // const handlePageChange = (newPage) => {
    //     setCurrentPage(newPage);
    // };

    // function perPageHandler(event) {
    //     setCurrentPage(1);
    //     const selectedValue = JSON.parse(event.target.value);
    //     const end = selectedValue.end;

    //     setPageSize(end);
    // }

    useEffect(() => {
        fetchOpenOrder(searchFilters);
        // if (facility) {
        //     localStorage.setItem("facility", facility);
        // } else {
        //     localStorage.setItem("facility", "");
        // }
    }, [
        // facility,
        // pageSize,
        // currentPage
    ]);

    const determineBadgeColor = (status) => {
        switch (status) {
            case "Ready for pickup":
                return { color: "#157347", tag: "Ready for pickup" };
            case "Tempo under the process":
                return { color: "#C44027", tag: "Tempo under the process" };
            case "In process of departure":
                return { color: "#91C47C", tag: "In process of departure" };
            case "At destination city warehouse":
                return { color: "#A2C3C8", tag: "At destination city warehouse" };
            case "Ready for final delivery":
                return { color: "#CEE0E2", tag: "Ready for final delivery" };
            case "Cancel":
                return { color: "#dc3545", tag: "Cancel Order" };
            default:
                return { color: "#E7B8B0", tag: "Under pickup process" };
        }
    };

    const CSVSmartLinx = async (applicant) => {
        fetch("/api/csv", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(applicant),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                toast.success("Sent to SmartLinx!");
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                toast.error(
                    "Error while sending CSV to SmartLinx.  Please try again later or contact tech support!"
                );
                // Handle errors here, such as displaying an error message to the user
            });
    };

    const setOrderCommentModalData = async (orderId) => {
        const { data: orderCommentData, error: e } = await supabase
            .from("order_comments_view")
            .select("*")

            // Filters
            .eq("order_id", orderId)
            .order("order_comment_created_at", { ascending: false });

            if (orderCommentData) {
                orderCommentData.forEach(
                    (orderComment) => (orderComment.order_comment_created_at = dateTimeFormat(orderComment.order_comment_created_at))
                );
                setFetchedOrderCommentData(orderCommentData);
            }
    };

    return (
        <>
            {/* Search Filters */}
            <div>
                { orderStatusReferenceOptions != null ? (
                    <Form>
                        <Form.Label
                            className="optional"
                            style={{
                                marginLeft: "32px",
                                letterSpacing: "2px",
                                fontSize: "12px",
                            }}
                        >
                            SEARCH BY
                        </Form.Label>
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                            <Row className="mb-1 mx-3">
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Status</Form.Label>
                                    <Form.Select
                                        className="chosen-single form-select"
                                        size="sm"
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                status: e.target.value,
                                            }));
                                        }}
                                        value={status}
                                    >
                                        <option value=""></option>
                                        {orderStatusReferenceOptions.map(
                                            (option) => (
                                                <option value={option.ref_dspl}>
                                                    {option.ref_dspl}
                                                </option>
                                            )
                                        )}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="validationCustom01">
                                    <Form.Label style={{ marginBottom: "2px" }}>From Date</Form.Label><br />
                                    <DateRangePickerComp />
                                </Form.Group>
                            </Row>
                            <Row className="mx-3">
                                <Col>
                                    <Form.Group className="chosen-single form-input chosen-container mb-3">
                                        <Button
                                            variant="primary"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                findOrder(searchFilters);
                                            }}
                                            className="btn btn-submit btn-sm text-nowrap m-1"
                                        >
                                            Filter
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={clearAll}
                                            className="btn btn-secondary btn-sm text-nowrap mx-2"
                                            style={{
                                                minHeight: "40px",
                                                padding: "0 20px"
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </Form.Group>
                                </Col>
                                <Col style={{ display: "relative", textAlign: "right" }}>
                                    <Form.Group className="chosen-single form-input chosen-container mb-3">
                                        <Button
                                            variant="success"
                                            onClick={() => Router.push("/employers-dashboard/add-order")}
                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                        >
                                            Add Order
                                        </Button>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                ) : ( "" 
                )}
                {/* End filter top bar */}

                <div
                    className="optional"
                    style={{
                        textAlign: "right",
                        marginRight: "50px",
                        marginBottom: "10px",
                    }}
                >
                    Showing ({fetchedOpenOrderdata.length}) Order(s)
                    {/* Out of ({totalRecords}) <br /> Page: {currentPage} */}
                </div>

            </div>

            {/* Table widget content */}
            <div className="widget-content">
                <div className="table-outer">
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Created On</th>
                                <th>Updated On</th>
                                <th>Pickup Date</th>
                                <th>ERP Order No</th>
                                <th>Route</th>
                                <th>Status</th>
                                <th>Comment</th>
                                <th>Client Name</th>
                                <th>Pickup Point</th>
                                <th>Drop Point</th>
                                <th>Company</th>
                                <th>Total Weight</th>
                                <th>Order Details</th>
                                <th>Order Notes</th>
                                <th>LR No</th>
                                <th>Local Transport</th>
                                <th>Truck Details</th>
                                <th>Eway Bill No</th>
                                <th>Bills</th>
                            </tr>
                        </thead>
                        {fetchedOpenOrderdata.length === 0 ? (
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
                                {Array.from(fetchedOpenOrderdata).map(
                                    (order) => (
                                        <tr key={order.id}>
                                            <td>
                                                {order.order_created_at}
                                            </td>
                                            <td>
                                                {order.order_updated_at ? order.order_updated_at : order.order_created_at}
                                            </td>
                                            <td>
                                                {order.pickup_date}
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
                                                        margin: "auto",
                                                        fontSize: "11px"
                                                    }}
                                                >
                                                    {determineBadgeColor(order.status).tag}
                                                </div> <br />
                                                <span className="optional" style={{ fontSize: "11px" }}>
                                                    {order.status_last_updated_at ? order.status_last_updated_at : order.order_created_at}
                                                </span>
                                            </td>
                                            <td>
                                                <ul className="option-list">
                                                    <li>
                                                        <button data-text="Add, View, Edit, Delete Notes">
                                                            <a
                                                                href="#"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#showPickupOrderCommentsModal"
                                                                onClick={() => {
                                                                    setOrderCommentModalData(
                                                                        order.order_id
                                                                    );
                                                                }}
                                                            >
                                                                <span className="la la-comment-dots"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </td>
                                            <td>
                                                { order.client_name ? order.client_name : "-" }
                                            </td>
                                            <td>
                                                {order.pickup_point_name ? order.pickup_point_name : "-" }
                                            </td>
                                            <td>
                                                {order.dropping_point_name ? order.dropping_point_name : "-" }
                                            </td>
                                            <td>
                                                {/* Company Name - NA */}
                                            </td>
                                            <td>
                                                {order.weight? order.weight + "Kg" : "-" }
                                            </td>
                                            <td>
                                                {order.quantity ? order.quantity : "-" }
                                            </td>
                                            <td>
                                                {order.notes ? order.notes : "-" }
                                            </td>
                                            <td>
                                                {order.lr_number}
                                            </td>
                                            <td>
                                                {/* Local Transport - NA */}
                                            </td>
                                            <td>
                                                {/* Truck Details - NA */}
                                            </td>
                                            <td>
                                                {order.eway_number ? order.eway_number : "-" }<br />
                                                {order.eway_verified ?  
                                                    <span 
                                                        className="badge"
                                                        style={{ backgroundColor: "green", marginLeft: "5px" }}
                                                    >
                                                        Verified
                                                    </span> : ""}
                                            </td>
                                            <td>
                                                {/* Bills - NA */}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        )}
                    </Table>

                    {/* Add Notes Modal Popup */}
                    <div
                        className="modal fade"
                        id="showPickupOrderCommentsModal"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="apply-modal-content modal-content">
                                <div className="text-center">
                                    <h3 className="title">Order Comments History</h3>
                                    <button
                                        type="button"
                                        id="showPickupOrderCommentsModalCloseButton"
                                        className="closed-modal"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                {/* End modal-header */}
                                <div className="widget-content">
                                    <div className="table-outer">
                                        <Table className="default-table manage-job-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ fontSize: "14px" }}>Created On</th>
                                                    <th style={{ fontSize: "14px" }}>Created By</th>
                                                    <th style={{ fontSize: "14px" }}>Comment</th>
                                                </tr>
                                            </thead>
                                            {/* might need to add separate table link with order_number as one order can have 
                                                multiple comments */}
                                            {fetchedOrderCommentData.length === 0 ? (
                                                <tbody
                                                    style={{
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    <tr>
                                                        <td colSpan={3}>
                                                            <b> No comment history yet!</b>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            ) : (
                                                <tbody style={{ fontSize: "14px" }}>
                                                    {Array.from(fetchedOrderCommentData).map(
                                                        (orderComment) => (
                                                            <tr key={orderComment.order_comment_id}>
                                                                <td>
                                                                    {orderComment.order_comment_created_at}
                                                                </td>
                                                                <td>
                                                                    {orderComment.name}
                                                                </td>
                                                                <td>
                                                                    {orderComment.order_comment}
                                                                </td>
                                                            </tr>
                                                        )
                                                        )}
                                                </tbody>
                                            )}
                                        </Table>
                                    </div>
                                </div>
                                {/* End PrivateMessageBox */}
                            </div>
                            {/* End .send-private-message-wrapper */}
                        </div>
                    </div>
                </div>
            </div>
            {/* End table widget content */}
        </>
    );
};

export default PickupOrderProcess;
