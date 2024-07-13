/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable-loop */
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
import CalendarComp from "../../../../date/CalendarComp";
import { InputGroup } from "react-bootstrap";
import { format } from "date-fns";

const addSearchFilters = {
    consignorName: "",
    consigneeName: "",
    fromCity: "",
    toCity: "",
    driverName: "",
    status: ""
};

const invoiceErrorFields = {
    orderIdError: false,
    clientNumberError: false,
    pickupCityError: false,
    dropCityError: false,
    materialError: false,
    quantityError: false,
    orderNumberError: false,
    weightError: false,
    vehicalNumberError: false,
    lrNumberError: false
};

const CompletedOrderProcess = () => {
    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);

    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("");

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedOpenOrderdata, setFetchedOpenOrderdata] = useState({});
    const [fetchedOrderCommentData, setFetchedOrderCommentData] = useState([]);
    const [fetchedLRsData, setFetchedLRsData] = useState([]);
    const [fetchedInvoiceData, setFetchedInvoiceData] = useState({});
    const [fetchedInvoiceUserData, setFetchedInvoiceUserData] = useState({});
    const [fetchedSelectedOpenOrderdata, setFetchedSelectedOpenOrderdata] = useState({});

    const [invoiceDate, setInvoiceDate] = useState(new Date());
    const [totalAmount, setTotalAmount] = useState(0);

    const [invoiceErrors, setInvoiceErrors] = useState(
        JSON.parse(JSON.stringify(invoiceErrorFields))
    );
    const {
        orderIdError,
        clientNumberError,
        pickupCityError,
        dropCityError,
        materialError,
        quantityError,
        orderNumberError,
        weightError,
        vehicalNumberError,
        lrNumberError
    
    } = useMemo(
        () => invoiceErrors,
        [invoiceErrors]
    );
    const [applicationStatus, setApplicationStatus] = useState("");
    const [
        applicationStatusReferenceOptions,
        setApplicationStatusReferenceOptions,
    ] = useState(null);
    const [
        lRStatusReferenceOptions,
        setLRStatusReferenceOptions,
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
        // fetchedLR(JSON.parse(JSON.stringify(addSearchFilters)));
    };

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
                setLRStatusReferenceOptions(data);
            }

            let query = supabase
                .from("orders")
                .select("*")
                .eq("status", "Completed");

            if (user.drop_branch) {
                query.eq("order_city", user.drop_branch);
            }

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

    const setInvoiceModalData = async (order) => {
        setIsLoading(true);
        // reset all states
        setTotalAmount(0);
        setInvoiceDate(new Date());
        setInvoiceErrors(JSON.parse(JSON.stringify(invoiceErrorFields)));
        setFetchedSelectedOpenOrderdata(order);

        // fetch if invoice already created
        const { data: invoiceData, error: e } = await supabase
            .from("invoice")
            .select("*")

            // Filters
            .eq("order_id", order.order_id);

        if (invoiceData) {
            setFetchedInvoiceData(invoiceData);

            const { data: invoiceUserData, error: e } = await supabase
            .from("users")
            .select("*")

            // Filters
            .eq("user_id", user.id);

            if (invoiceUserData) {
                setFetchedInvoiceUserData(invoiceUserData);
            }
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }

    };
    function checkLRsStatus(lrData) {
        for(var i=0; i<lrData.length; i++){
            if(lrData[i].status === "Performa") {
                return false;
            }
        }
        return true;
    };
    function checkLRDetails(lrData) {
        for(var i=0; i<lrData.length; i++){
            if(lrData[i].vehical_number && lrData[i].lr_number){
                return true;
            } else {
                if(!lrData[i].vehical_number) {
                    setInvoiceErrors((previousState) => ({
                        ...previousState,
                        vehicalNumberError: true
                    }));
                }
                if(!lrData[i].lr_number) {
                    setInvoiceErrors((previousState) => ({
                        ...previousState,
                        lrNumberError: true
                    }));
                }
                return false;
            }
        }
    };
    function checkRequiredFieldsForGenerateInvoice(selectedOpenOrderdata, lrData) {
        if(!selectedOpenOrderdata.order_id) {
            setInvoiceErrors((previousState) => ({
                ...previousState,
                orderIdError: true
            }));
        }
        if(!selectedOpenOrderdata.client_number) {
            setInvoiceErrors((previousState) => ({
                ...previousState,
                clientNumberError: true
            }));
        }
        if(!selectedOpenOrderdata.pickup_location) {
            setInvoiceErrors((previousState) => ({
                ...previousState,
                pickupCityError: true
            }));
        }
        if(!selectedOpenOrderdata.drop_location) {
            setInvoiceErrors((previousState) => ({
                ...previousState,
                dropCityError: true
            }));
        }
        if(!selectedOpenOrderdata.material) {
            setInvoiceErrors((previousState) => ({
                ...previousState,
                materialError: true
            }));
        }
        if(!selectedOpenOrderdata.quantity) {
            setInvoiceErrors((previousState) => ({
                ...previousState,
                quantityError: true
            }));
        }
        if(!selectedOpenOrderdata.order_number) {
            setInvoiceErrors((previousState) => ({
                ...previousState,
                orderNumberError: true
            }));
        }
        if(!selectedOpenOrderdata.weight) {
            setInvoiceErrors((previousState) => ({
                ...previousState,
                weightError: true
            }));
        }

        if (
            // order data
            selectedOpenOrderdata.order_id &&
            selectedOpenOrderdata.client_number &&
            selectedOpenOrderdata.pickup_location &&
            selectedOpenOrderdata.drop_location &&
            selectedOpenOrderdata.material &&
            selectedOpenOrderdata.quantity &&
            selectedOpenOrderdata.order_number &&
            selectedOpenOrderdata.weight &&

            // lr data
            checkLRDetails(lrData)
        ) {
            return true;
        } else {
            return false;
        }
    };
    async function generateInvoice(selectedOpenOrderdata) {
        const { data: lrData, error: e } = await supabase
            .from("lr")
            .select("*")

            // Filters
            .eq("order_id", selectedOpenOrderdata.order_id);

            if (checkLRsStatus(lrData)) {
                if (totalAmount && invoiceDate) {
                    if (checkRequiredFieldsForGenerateInvoice(selectedOpenOrderdata, lrData)) {
                        try {
                            // Generate Invoice Number
                            const { data: sysKeyInvoiceData, error: sysKeyInvoiceError } = await supabase
                                .from("sys_key")
                                .select("sys_seq_nbr")
                                .eq("key_name", "invoice_number");

                            let invoiceSeqNbr = sysKeyInvoiceData[0].sys_seq_nbr + 1;
                            if (invoiceSeqNbr < 10) {
                                invoiceSeqNbr = "0000" + invoiceSeqNbr;
                            } else if(invoiceSeqNbr < 100) {
                                invoiceSeqNbr = "000" + invoiceSeqNbr;
                            } else if(invoiceSeqNbr < 1000) {
                                invoiceSeqNbr = "00" + invoiceSeqNbr;
                            } else if(invoiceSeqNbr < 10000) {
                                invoiceSeqNbr = "0" + invoiceSeqNbr;
                            }
                            const invoiceNumber = "RF" + invoiceSeqNbr;

                            const { data, error } = await supabase.from("invoice").insert([
                                {
                                    invoice_number: invoiceNumber,
                                    total_amount: totalAmount,
                                    invoice_date: format(invoiceDate, "yyyy-MM-dd"),
                                    order_id: selectedOpenOrderdata.order_id,
                                    invoice_created_by: user.id
                                },
                            ]);
                            if (error) {
                                // open toast
                                toast.error(
                                    "Error while saving Invoice details, Please try again later or contact tech support",
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
                            } else {
                                // open toast
                                toast.success("New Invoice saved successfully", {
                                    position: "bottom-right",
                                    autoClose: 8000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: "colored",
                                });
                                
                                // increment lr_number key
                                await supabase.rpc("increment_sys_key", {
                                    x: 1,
                                    keyname: "invoice_number",
                                });

                                document.getElementById("showCompletedOrderInvoiceModalCloseButton").click();

                            }
                        } catch (err) {
                            // open toast
                            toast.error(
                                "Error while saving Invoice details, Please try again later or contact tech support",
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
                            // console.warn(err);
                        }
                    } else {
                        // open toast
                        toast.error("Please fill all the listed required fields.", {
                            position: "top-center",
                            autoClose: false,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        });
                    }
                } else {
                    // open toast
                    toast.error("Please fill Total Amount and Invoice Date in mentioned format", {
                        position: "top-center",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                    setIsLoading(false);
                    setLoadingText("");
                }
                setIsLoading(false);
                setLoadingText("");
            } else {
                // open toast
                toast.error(
                    "Please check all LRs under this Order should be in FINAL status",
                    {
                        position: "top-center",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    }
                );
                setIsLoading(false);
                setLoadingText("");
            }
    };

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

    const setLRsModalData = async (orderId) => {
        setIsLoading(true);

        const { data: lrData, error: e } = await supabase
            .from("lr")
            .select("*")

            // Filters
            .eq("order_id", orderId)
            .order("lr_created_date", { ascending: false });

            if (lrData) {
                lrData.forEach(
                    (i) => (i.lr_created_date = dateTimeFormat(i.lr_created_date))
                );
                setFetchedLRsData(lrData);
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
    };

    return (
        <>
            {/* Search Filters */}
            <div>
                { lRStatusReferenceOptions != null ? (
                    <Form>
                        {/* <Form.Label
                            className="optional"
                            style={{
                                marginLeft: "24px",
                                letterSpacing: "2px",
                                fontSize: "12px",
                            }}
                        >
                            SEARCH BY
                        </Form.Label> */}
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                            {/* <Row className="mb-1 mx-3">
                                <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                    <Form.Label style={{ marginBottom: "2px" }}>Order Created From Date</Form.Label><br />
                                    <CalendarComp />
                                </Form.Group>
                                <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                    <Form.Label style={{ marginBottom: "2px" }}>Order Created To Date</Form.Label><br />
                                    <CalendarComp />
                                </Form.Group>
                            </Row> */}
                            <Row className="mx-3">
                                {/* <Col>
                                    <Form.Group className="chosen-single form-input chosen-container mb-3">
                                        <Button
                                            variant="primary"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // findLR(searchFilters);
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
                                </Col> */}
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
                                <th>Action</th>
                                <th>Created On</th>
                                <th>Updated On</th>
                                <th>Pickup Date</th>
                                <th>ERP Order No</th>
                                <th>LR No</th>
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
                                                <div className="option-box">
                                                    <ul className="option-list">
                                                        <li>
                                                            <button data-text="Generate Invoice">
                                                                <a
                                                                    href="#"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#showCompletedOrderInvoiceModal"
                                                                    onClick={() => {
                                                                        setInvoiceModalData(
                                                                            order
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="la la-file-invoice"></span>
                                                                </a>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
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
                                                <ul className="option-list">
                                                    <li>
                                                        <button data-text="View LRs">
                                                            <a
                                                                href="#"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#showCompletedOrderLRsModal"
                                                                onClick={() => {
                                                                    setLRsModalData(
                                                                        order.order_id
                                                                    );
                                                                }}
                                                            >
                                                                <span className="la la-receipt"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ul>
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
                                                                data-bs-target="#showCompletedOrderCommentsModal"
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

                    {/* Start Order Comment Modal Popup */}
                    <div
                        className="modal fade"
                        id="showCompletedOrderCommentsModal"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="apply-modal-content modal-content">
                                <div className="text-center">
                                    <h3 className="title">Order Comments History</h3>
                                    <button
                                        type="button"
                                        id="showCompletedOrderCommentsModalCloseButton"
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
                    {/* End Order Comment Modal Popup */}

                    {/* Start Invoice Modal Popup */}
                    <div
                        className="modal fade"
                        id="showCompletedOrderInvoiceModal"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="apply-modal-content modal-content" style={{ overflow: "scroll" }}>
                                <div className="text-center">
                                    <h3 className="title" style={{ marginBottom: "-5px" }}>Invoice</h3>
                                    <span className="optional" style={{ letterSpacing: "1px" }}>#{fetchedSelectedOpenOrderdata.order_number}</span> 
                                    <button
                                        type="button"
                                        id="showCompletedOrderInvoiceModalCloseButton"
                                        className="closed-modal"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                {/* End modal-header */}
                                { Object.keys(fetchedSelectedOpenOrderdata).length !== 0 ?
                                    <div className="widget-content">
                                        { Object.keys(fetchedInvoiceData).length === 0 ?
                                            <div>
                                                <Row className="mb-1">
                                                    <Form.Group as={Col} md="12" controlId="validationCustomPhonenumber">
                                                        <Form.Label size="sm">Total Amount <span className="optional">(ex. 12 or 12.00 or 12.01 or 12.12)</span></Form.Label>
                                                        <InputGroup size="sm">
                                                            <InputGroup.Text id="inputGroupPrepend"><i className="las la-rupee-sign"></i></InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                // placeholder="900"
                                                                aria-describedby="inputGroupPrepend"
                                                                required
                                                                value={totalAmount}
                                                                onChange={(e) => { setTotalAmount(e.target.value); }}
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Row>

                                                <Row className="mb-3">
                                                    <Form.Group as={Col} md="12" controlId="validationCustom01">
                                                        <Form.Label>Invoice Date</Form.Label><br />
                                                        <CalendarComp setDate={setInvoiceDate} date1={invoiceDate}/>
                                                    </Form.Group>
                                                </Row>

                                                <Row>
                                                    <Form.Group as={Col} md="12" className="chosen-single form-input chosen-container mb-3">
                                                        <Button
                                                            type="submit"
                                                            variant="success"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                generateInvoice(fetchedSelectedOpenOrderdata);
                                                            }}
                                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                                        >
                                                            Generate Invoice
                                                        </Button>
                                                    </Form.Group>
                                                </Row>

                                                <Row>
                                                    { orderIdError || clientNumberError || pickupCityError || dropCityError || materialError ||
                                                      quantityError || orderNumberError || weightError || vehicalNumberError || lrNumberError ?
                                                        <div className="pb-3 optional"
                                                            style={{ color: "red",
                                                                lineHeight: "normal",
                                                                fontSize: "12px",
                                                            }}>
                                                            Please fill below listed fields before generating Invoice<br />
                                                            {orderIdError ? <><span>* Order ID</span><br /></> : "" }
                                                            {clientNumberError ? <><span>* Client Details(Order Details)</span><br /></> : "" }
                                                            {pickupCityError ? <><span>* Pickup City(Order Details)</span><br /></> : "" }
                                                            {dropCityError ? <><span>* Drop City(Order Details)</span><br /></> : "" }
                                                            {materialError ? <><span>* Material(Order Details)</span><br /></> : "" }
                                                            {quantityError ? <><span>* Quantity(Order Details)</span><br /></> : "" }
                                                            {orderNumberError ? <><span>* Order Number</span><br /></> : "" }
                                                            {weightError ? <><span>* Weight(Order Details)</span><br /></> : "" }
                                                            {vehicalNumberError ? <><span>* Vehical Number(LR Details)</span><br /></> : "" }
                                                            {lrNumberError ? <><span>* LR Number</span></> : "" }
                                                        </div>
                                                    : "" }
                                                </Row>
                                            </div>
                                        : "" }
                                        <div className="table-outer">
                                            <Table className="default-table manage-job-table" style={{ minWidth: "300px" }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ fontSize: "14px" }}>Action</th>
                                                        <th style={{ fontSize: "14px" }}>Invoice No</th>
                                                        <th style={{ fontSize: "14px" }}>Created By</th>
                                                    </tr>
                                                </thead>
                                                {/* might need to add separate table link with order_number as one order can have 
                                                    multiple comments */}
                                                { Object.keys(fetchedInvoiceData).length !== 0 && Object.keys(fetchedInvoiceUserData).length !== 0 ? (
                                                    <tbody style={{ fontSize: "14px" }}>
                                                        <tr>
                                                            <td>
                                                                <ul className="option-list">
                                                                    <li>
                                                                        <button
                                                                            data-text="Generate Invoice"
                                                                            onClick={() => {
                                                                                document.getElementById("showCompletedOrderInvoiceModalCloseButton").click();
                                                                                router.push(`/employers-dashboard/view-invoice/${fetchedInvoiceData[0].invoice_id}`);
                                                                            }}
                                                                        >
                                                                            <span className="la la-print"></span>
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </td>
                                                            <td>
                                                                { user.role === "SUPER_ADMIN" ?
                                                                    <Link
                                                                        href={`/employers-dashboard/invoice-details/${fetchedInvoiceData[0].invoice_number}`} 
                                                                        style={{ textDecoration: "underline" }}
                                                                        onClick={() => { 
                                                                            document.getElementById("showCompletedOrderInvoiceModalCloseButton").click();
                                                                        }}
                                                                    >
                                                                        {fetchedInvoiceData[0].invoice_number}
                                                                    </Link>
                                                                : <span> {fetchedInvoiceData[0].invoice_number} </span>
                                                                }
                                                            </td>
                                                            <td>
                                                                {fetchedInvoiceUserData[0].name}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                ) : (
                                                    <tbody style={{ fontSize: "14px", fontWeight: "500" }}>
                                                        <tr>
                                                            <td colSpan={3}>
                                                                <b> No Invoice created yet!</b>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )}
                                            </Table>
                                        </div>
                                    </div>
                                : "" }
                                {/* End PrivateMessageBox */}
                            </div>
                            {/* End .send-private-message-wrapper */}
                        </div>
                    </div>
                    {/* End Invoice Modal Popup */}

                    {/* Start LRs Modal Popup */}
                    <div
                        className="modal fade"
                        id="showCompletedOrderLRsModal"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="apply-modal-content modal-content">
                                <div className="text-center">
                                    <h3 className="title">LRs History</h3>
                                    <button
                                        type="button"
                                        id="showCompletedOrderLRsModalCloseButton"
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
                                                    <th style={{ fontSize: "14px" }}>Actions</th>
                                                    <th style={{ fontSize: "14px" }}>LR No</th>
                                                    <th style={{ fontSize: "14px" }}>LR Status</th>
                                                    <th style={{ fontSize: "14px" }}>Created On</th>
                                                    <th style={{ fontSize: "14px" }}>Created By</th>
                                                </tr>
                                            </thead>
                                            {/* might need to add separate table link with order_number as one order can have 
                                                multiple comments */}
                                            {fetchedLRsData.length === 0 ? (
                                                <tbody
                                                    style={{
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    <tr>
                                                        <td colSpan={3}>
                                                            <b> No LR created yet!</b>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            ) : (
                                                <tbody style={{ fontSize: "14px" }}>
                                                    {Array.from(fetchedLRsData).map(
                                                        (lr) => (
                                                            <tr key={lr.lr_id}>
                                                                <td>
                                                                    <ui className="option-list" style={{ border: "none" }}>
                                                                        <li>
                                                                            <button>
                                                                                <a onClick={() => {
                                                                                    router.push(`/employers-dashboard/view-lr/${lr.lr_id}`);
                                                                                    document.getElementById("showCompletedOrderLRsModalCloseButton").click();
                                                                                    }
                                                                                }>
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
                                                                        onClick={() => { 
                                                                            document.getElementById("showCompletedOrderLRsModalCloseButton").click();
                                                                        }}
                                                                    >
                                                                        {lr.lr_number}
                                                                    </Link>
                                                                </td>
                                                                <td>
                                                                    {lr.status}
                                                                </td>
                                                                <td>
                                                                    {lr.lr_created_date}
                                                                </td>
                                                                <td>
                                                                    {lr.auto_generated ? "SYSTEM" : "USER" }
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
                    {/* End LRs Modal Popup */}

                </div>
            </div>
            {/* End table widget content */}
        </>
    );
};

export default CompletedOrderProcess;
