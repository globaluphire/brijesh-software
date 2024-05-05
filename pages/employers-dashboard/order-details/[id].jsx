/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
// import Map from "../../../../Map";
import Select from "react-select";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPopup from "../../../components/common/form/login/LoginPopup";
import DashboardHeader from "../../../components/header/DashboardHeader";
import MobileMenu from "../../../components/header/MobileMenu";
import DashboardEmployerSidebar from "../../../components/header/DashboardEmployerSidebar";
import BreadCrumb from "../../../components/dashboard-pages/BreadCrumb";
import MenuToggler from "../../../components/dashboard-pages/MenuToggler";
import CopyrightFooter from "../../../components/dashboard-pages/CopyrightFooter";
import Router, { useRouter } from "next/router";
import DefaulHeader2 from "../../../components/header/DefaulHeader2";
import EditJobView from "../../../components/dashboard-pages/employers-dashboard/edit-job/components/EditJobView";
import { supabase } from "../../../config/supabaseClient";
import { Button, Col, Collapse, Container, Form, InputGroup, Row, Table } from "react-bootstrap";


const cancelOrderDataFields = {
    cancelReason: "",
    cancelNote: ""
};

const OrderDetails = (orderDetails) => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [fetchedOrderData, setFetchedOrderData] = useState({});
    const [fetchedOrderCommentData, setFetchedOrderCommentData] = useState([]);
    const [ewayBillVerified, setEwayBillVerified] = useState(false);
    const [open, setOpen] = useState(false);

    // temp action fields data
    const [ewayBillNumber, setEwayBillNumber] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [localTransport, setLocalTransport] = useState("");
    const [truckDetails, setTruckDetails] = useState("");
    const [orderComment, setOrderComment] = useState("");
    const [cancelOrderData, setCancelOrderData] = useState(JSON.parse(JSON.stringify(cancelOrderDataFields)));
    const { cancelReason, cancelNote } = useMemo(() => cancelOrderData, [cancelOrderData]);

    // all references state
    const [sortedCancelReasonRefs, setSortedCancelReasonRefs] = useState([]);
    const [cancelReasonReferenceOptions, setCancelReasonReferenceOptions] = useState(null);

    const router = useRouter();
    const id = router.query.id;

    const dateFormat = (val) => {
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
    };

    const handleChange=(e)=>{
        setEwayBillVerified(!ewayBillVerified);
    };

    async function getReferences() {
        // call reference to get cancelReason options
        const { data: cancelReasonRefData, error: err } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "cancelReason");

        if (cancelReasonRefData) {
            setCancelReasonReferenceOptions(cancelReasonRefData);
            const cancelReasons = [];
            for (let i = 0; i < cancelReasonRefData.length; i++) {
                cancelReasons.push(cancelReasonRefData[i].ref_dspl);
            }
            cancelReasons.sort();
            setSortedCancelReasonRefs(cancelReasons);
        }
    };

    useEffect(() => {
        getReferences();
    }, []);

    const fetchOrderData = async () => {
        try {
            if (id) {
                const { data: orderData, error } = await supabase
                    .from("orders")
                    .select("*")

                    // Filters
                    .eq("order_id", id);

                if (orderData) {
                    setFetchedOrderData(orderData[0]);
                    orderData[0].order_created_at = dateFormat(orderData[0].order_created_at);

                    if (orderData[0].order_updated_at) {
                        orderData[0].order_updated_at = dateFormat(orderData[0].order_updated_at);
                    }

                    setEwayBillNumber(fetchedOrderData.eway_number);

                    const { data: orderCommentData, error: e } = await supabase
                        .from("order_comments_view")
                        .select("*")

                        // Filters
                        .eq("order_id", id)
                        .order("order_comment_created_at", { ascending: false });

                        if (orderCommentData) {
                            orderCommentData.forEach(
                                (orderComment) => (orderComment.order_comment_created_at = dateFormat(orderComment.order_comment_created_at))
                            );
                            setFetchedOrderCommentData(orderCommentData);
                        }
                }
            }
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
    };

    const fetchOrderCommentData = async () => {
        const { data: orderCommentData, error: e } = await supabase
            .from("order_comments_view")
            .select("*")

            // Filters
            .eq("order_id", id)
            .order("order_comment_created_at", { ascending: false });

            if (orderCommentData) {
                orderCommentData.forEach(
                    (orderComment) => (orderComment.order_comment_created_at = dateFormat(orderComment.order_comment_created_at))
                );
                setFetchedOrderCommentData(orderCommentData);
            }
    };

    useEffect(() => {
        fetchOrderData();
    }, [id]);

    const cancelOrder = async (cancelOrderData) => {
        if (cancelOrderData.cancelReason && cancelOrderData.cancelNote && fetchedOrderData.status !== "Completed") {
            await supabase
                .from("orders")
                .update({
                    status: "Cancel",
                    cancel_reason: cancelOrderData.cancelReason,
                    cancel_note: cancelOrderData.cancelNote,
                    order_updated_at: new Date(),
                    cancel_date: new Date()
                })
                .eq("order_id", id);

            
            setTimeout(() => {
                document.getElementById("cancelOrderCloseButton").click();
                fetchOrderData();
            }, 3000);

            toast.success("Order cancelled successfully!", {
                position: "bottom-right",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });

        } else {
            toast.error("Please fill all fields to cancel this order!!!", {
                position: "bottom-right",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });

        }
    };

    const addOrderComment = async (orderComment) => {
        if(fetchedOrderData.status !== "Cancel") {
            if(fetchedOrderData.status !== "Completed") {
                if(orderComment) {
                    await supabase
                        .from("order_comments")
                        .insert([
                            {
                                order_comment: orderComment,
                                order_number: fetchedOrderData.order_number,
                                user_id: user.id,
                                order_id: fetchedOrderData.order_id
                            }
                        ]);
                    
                    setTimeout(() => {
                        document.getElementById("orderCommentCloseButton").click();
                        fetchOrderCommentData();
                    }, 3000);

                    toast.success("Order Comment Successfully Added!", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });


                } else {
                    toast.error("Please fill all fields!!!", {
                        position: "bottom-right",
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
                    toast.info("This order is already Completed! No further status updates needed.", {
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
            toast.info("This order is already Cancelled! You cannot change the status.", {
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
    };

    const updateOrderStatus = async (newStatus) => {
        if(fetchedOrderData.status !== "Cancel") {
            if (fetchedOrderData.status !== "Completed") {
                if(newStatus !== "N/A") {
                    await supabase
                        .from("orders")
                        .update({
                            status: newStatus,
                            status_last_updated_at: new Date()
                        })
                        .eq("order_id", id);
                    
                    setTimeout(() => {
                        fetchOrderData();
                    }, 3000);

                    toast.success("Order status marked as " + newStatus, {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                } else {
                    toast.info("This order is already Completed! No further status updates needed.", {
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
                toast.info("This order is already Completed! No further status updates needed.", {
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
            toast.info("This order is already Cancelled! You cannot change the status.", {
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
    };

    const updateEwayBillNumber = async (newEwayNumber, isVerified) => {
        if(fetchedOrderData.status !== "Cancel") {
            if(fetchedOrderData.status !== "Completed") {
                if(newEwayNumber) {
                    await supabase
                        .from("orders")
                        .update({
                            eway_number: newEwayNumber,
                            eway_verified: isVerified,
                            order_updated_at: new Date()
                        })
                        .eq("order_id", id);
                    
                    setTimeout(() => {
                        document.getElementById("ewayNumberModalCloseButton").click();
                        fetchOrderData();
                    }, 3000);

                    toast.success("Eway Bill Number saved successfully.", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                } else {
                    toast.error("Please fill Eway Bill Number!!!", {
                        position: "bottom-right",
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
                toast.info("This order is already Completed! You cannot change the status.", {
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
            toast.info("This order is already Cancelled! You cannot change the status.", {
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
    };

    const updateCompanyName = async (newCompanyName) => {
        if(fetchedOrderData.status !== "Cancel") {
            if (fetchedOrderData.status !== "Completed") {
                if(newCompanyName) {
                    await supabase
                        .from("orders")
                        .update({
                            company_name: newCompanyName,
                            order_updated_at: new Date()
                        })
                        .eq("order_id", id);

                    setTimeout(() => {
                        document.getElementById("companyNameModalCloseButton").click();
                        fetchOrderData();
                    }, 3000);

                    toast.success("Company Name saved successfully.", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                } else {
                    toast.error("Please fill Company Name!!!", {
                        position: "bottom-right",
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
                toast.info("This order is already Completed! No further status updates needed.", {
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
            toast.info("This order is already Cancelled! You cannot change the status.", {
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
    };

    const updateLocalTransport = async (newLocalTransport) => {
        if(fetchedOrderData.status !== "Cancel") {
            if (fetchedOrderData.status !== "Completed") {
                if(newLocalTransport) {
                    await supabase
                        .from("orders")
                        .update({
                            local_transport: newLocalTransport,
                            order_updated_at: new Date()
                        })
                        .eq("order_id", id);

                    setTimeout(() => {
                        document.getElementById("localTransportModalCloseButton").click();
                        fetchOrderData();
                    }, 3000);

                    toast.success("Local Transport saved successfully.", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                } else {
                    toast.error("Please fill Local Transport!!!", {
                        position: "bottom-right",
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
                toast.info("This order is already Completed! No further status updates needed.", {
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
            toast.info("This order is already Cancelled! You cannot change the status.", {
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
    };

    const updateTruckDetails = async (newTruckDetails) => {
        if(fetchedOrderData.status !== "Cancel") {
            if (fetchedOrderData.status !== "Completed") {
                if(newTruckDetails) {
                    await supabase
                        .from("orders")
                        .update({
                            truck_details: newTruckDetails,
                            order_updated_at: new Date()
                        })
                        .eq("order_id", id);

                    setTimeout(() => {
                        document.getElementById("truckDetailsModalCloseButton").click();
                        fetchOrderData();
                    }, 3000);

                    toast.success("Truck Details saved successfully.", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                } else {
                    toast.error("Please fill Truck Details!!!", {
                        position: "bottom-right",
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
                toast.info("This order is already Completed! No further status updates needed.", {
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
            toast.info("This order is already Cancelled! You cannot change the status.", {
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
    };

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
                return { color: "#dc3545", tag: "Cancelled" };
            case "Completed":
                return { color: "gray", tag: "Completed" };
            default:
                return { color: "#E7B8B0", tag: "Under pickup process" };
        }
    };

    const determineNextStatus = (status) => {
        switch (status) {
            case "Under pickup process":
                return { color: "orange", tag: "Ready for pickup" };
            case "Ready for pickup":
                return { color: "#C44027", tag: "Tempo under the process" };
            case "Tempo under the process":
                return { color: "#91C47C", tag: "In process of departure" };
            case "In process of departure":
                return { color: "#A2C3C8", tag: "At destination city warehouse" };
            case "At destination city warehouse":
                return { color: "#CEE0E2", tag: "Ready for final delivery" };
            case "Ready for final delivery":
                return { color: "#CEE0E2", tag: "Completed" };
            default:
                return { color: "#E9ECEF", tag: "N/A" };
        }
    };

    return (
        <div className="page-wrapper dashboard">
            <span className="header-span"></span>
            {/* <!-- Header Span for hight --> */}

            <LoginPopup />
            {/* End Login Popup Modal */}

            {showLoginButton ? <DefaulHeader2 /> : <DashboardHeader />}
            {/* <!--End Main Header --> */}

            <MobileMenu />
            {/* End MobileMenu */}

            <DashboardEmployerSidebar />
            {/* <!-- End User Sidebar Menu --> */}

            {/* <!-- Dashboard --> */}
            <section className="user-dashboard">
                <div>
                    {/* <BreadCrumb title="Order Details!" /> */}
                    {/* breadCrumb */}

                    <MenuToggler />
                    {/* Collapsible sidebar button */}

                    <div className="row">
                        <div className="col-lg-12">
                            {/* <!-- Ls widget --> */}
                            <div className="ls-widget">
                                <div className="tabs-box">
                                    <div className="widget-title">
                                        <h3><b>Order Details</b></h3>
                                    </div>

                                    <div className="widget-content">
                                        {fetchedOrderData.status === "Cancel" ?
                                            <span 
                                                className="badge"
                                                style={{
                                                    backgroundColor: "#dc3545",
                                                    margin: "auto",
                                                }}>This order is cancelled</span>
                                        : ""}

                                        {/* action buttons */}
                                        <div className="pb-4">
                                            <div>
                                                { fetchedOrderData.status !== "Completed" && sortedCancelReasonRefs ? <>
                                                    <button
                                                        className="btn btn-sm"
                                                        style = {{ margin: "10px", backgroundColor: "#dc3545", border: "1px solid #dc3545" }}
                                                    >
                                                        <a
                                                            href="#"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#cancelOrderModal"
                                                            style={{ color: "#fff" }}
                                                        >
                                                            Cancel Order
                                                        </a>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        // onClick={() => splitOrder()}
                                                        style = {{ color: "#fff", margin: "10px", backgroundColor: "#167347", border: "1px solid #167347" }}
                                                    >
                                                        Split Order
                                                    </button>
                                                    </> : "" }

                                                <button
                                                    className="btn btn-sm"
                                                    style = {{ margin: "10px", backgroundColor: "#FFCA2B", border: "1px solid #FFCA2B" }}
                                                >
                                                    Add Breakage
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style = {{ margin: "10px", backgroundColor: "#FFCA2B", border: "1px solid #FFCA2B" }}
                                                >
                                                    <a
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#orderCommentModal"
                                                        style={{ color: "#333" }}
                                                    >
                                                        Add Order Comment
                                                    </a>
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style = {{ margin: "10px", backgroundColor: "#10CAF0", border: "1px solid #10CAF0" }}
                                                >
                                                    Breakage History
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style = {{ margin: "10px", backgroundColor: "#0B5ED7", border: "1px solid #0B5ED7" }}
                                                >
                                                    <a
                                                        href="#"
                                                        style={{ color: "#fff" }}
                                                        onClick={() => {
                                                            updateOrderStatus(determineNextStatus(
                                                                fetchedOrderData.status
                                                            ).tag);
                                                        }}
                                                    >
                                                        {determineNextStatus(
                                                                fetchedOrderData.status
                                                            ).tag}
                                                    </a>
                                                </button>
                                                {/* add buttons functions to update order details */}
                                            </div>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>

                                        {/* Start Main fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="md">
                                                        <InputGroup.Text id="inputGroupPrepend">Order Number</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.order_number}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                {/* add buttons functions to update order details */}
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Main fields */}

                                        {/* Start Required fields */}
                                        <div className="pb-4">
                                            <Row className="pb-3">
                                                <Form.Group as={Col} md="12" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Quantity</InputGroup.Text>
                                                        <textarea
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.quantity}
                                                            cols="85"
                                                            rows="2"
                                                            style={{
                                                                resize: "both",
                                                                overflowY: "scroll",
                                                                border: "1px solid #dee2e6",
                                                                padding: "10px",
                                                                fontSize: "14px",
                                                                color: "#212529",
                                                                backgroundColor: "#e9ecef",
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <Row>
                                                <Form.Group as={Col} md="auto" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Material</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.material}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="auto" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Weight</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.weight + " Kg"}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="auto" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Size</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.size}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Required fields */}

                                        {/* Start Eway Bill fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">
                                                            Eway Bill Number
                                                            { fetchedOrderData.eway_verified ?
                                                                <span 
                                                                    className="badge"
                                                                    style={{ backgroundColor: "green", marginLeft: "5px" }}
                                                                >
                                                                    Verified
                                                                </span>
                                                            : ""
                                                            }
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.eway_number}
                                                        />
                                                        <button data-text="Add, View, Edit, Delete Notes">
                                                            <a
                                                                href="#"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#ewayNumberModal"
                                                                onClick={() => { setEwayBillNumber(fetchedOrderData.eway_number); }}
                                                            >
                                                                <span className="la la-plus mx-2 mt-2"></span>
                                                            </a>
                                                        </button>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Eway Bill fields */}

                                        {/* Start Order dates fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm" className="pb-3">
                                                        <InputGroup.Text id="inputGroupPrepend">Created On</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.order_created_at}
                                                        />
                                                    </InputGroup>
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Updated On</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={ fetchedOrderData.order_updated_at ? fetchedOrderData.order_updated_at : fetchedOrderData.order_created_at }
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="auto" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Order Notes</InputGroup.Text>
                                                        <textarea
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.notes}
                                                            cols="65"
                                                            rows="2"
                                                            style={{
                                                                resize: "both",
                                                                overflowY: "scroll",
                                                                border: "1px solid #dee2e6",
                                                                padding: "10px",
                                                                fontSize: "14px",
                                                                color: "#212529",
                                                                backgroundColor: "#e9ecef",
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Order dates fields */}
                                        
                                        {/* Start Order Locations and Status fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="2" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Order Location</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.order_city}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Status</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={
                                                                determineBadgeColor(
                                                                    fetchedOrderData.status
                                                                ).tag
                                                            }
                                                            style={{
                                                                backgroundColor:
                                                                    determineBadgeColor(
                                                                        fetchedOrderData.status
                                                                    ).color,
                                                                margin: "auto",
                                                                color: "#fff"
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Pickup Location</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.pickup_location}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Drop Location</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.drop_location}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Order Locations and Status fields */}

                                        {/* Start Company Name fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">
                                                            Company Name
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.company_name}
                                                        />
                                                        <button data-text="Add, View, Edit, Delete Notes">
                                                            <a
                                                                href="#"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#companyNameModal"
                                                                onClick={() => { setCompanyName(fetchedOrderData.company_name); }}
                                                            >
                                                                <span className="la la-plus mx-2 mt-2"></span>
                                                            </a>
                                                        </button>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Company Name fields */}

                                        {/* Start Local Transport fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="12" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">
                                                            Local Transport
                                                        </InputGroup.Text>
                                                        <textarea
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.local_transport}
                                                            cols="85"
                                                            rows="2"
                                                            style={{
                                                                resize: "both",
                                                                overflowY: "scroll",
                                                                border: "1px solid #dee2e6",
                                                                padding: "10px",
                                                                fontSize: "14px",
                                                                color: "#212529",
                                                                backgroundColor: "#e9ecef",
                                                            }}
                                                        />
                                                        <button data-text="Add, View, Edit, Delete Notes">
                                                            <a
                                                                href="#"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#localTransportModal"
                                                                onClick={() => { setLocalTransport(fetchedOrderData.local_transport); }}
                                                            >
                                                                <span className="la la-plus mx-2 mt-2"></span>
                                                            </a>
                                                        </button>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Local Transport fields */}

                                        {/* Start Truck Details fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="12" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">
                                                            Truck Details
                                                        </InputGroup.Text>
                                                        <textarea
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.truck_details}
                                                            cols="85"
                                                            rows="2"
                                                            style={{
                                                                resize: "both",
                                                                overflowY: "scroll",
                                                                border: "1px solid #dee2e6",
                                                                padding: "10px",
                                                                fontSize: "14px",
                                                                color: "#212529",
                                                                backgroundColor: "#e9ecef",
                                                            }}
                                                        />
                                                        <button data-text="Add, View, Edit, Delete Notes">
                                                            <a
                                                                href="#"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#truckDetailsModal"
                                                                onClick={() => { setTruckDetails(fetchedOrderData.truck_details); }}
                                                            >
                                                                <span className="la la-plus mx-2 mt-2"></span>
                                                            </a>
                                                        </button>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Truck Details fields */}

                                        {/* Order Comment Section */}
                                        <div>
                                            <Row className="mx-2">
                                                <b className="pb-3">
                                                    Order Comments History
                                                    <a
                                                        className="la la-refresh"
                                                        onClick={() => { fetchOrderCommentData(); }}
                                                        style={{ marginLeft: "10px" }}>
                                                    </a>
                                                </b>

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
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End of Order Comment Section */}

                                    </div>
                                    {/* Page Navigation Buttons */}
                                    <Row>
                                        <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container m-4">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {Router.push("/employers-dashboard/orders"); }}
                                                className="btn btn-back btn-sm text-nowrap m-1"
                                            >
                                                Back to Orders
                                            </Button>
                                        </Form.Group>
                                    </Row>
                                </div>
                            </div>

                            {/* All Popup Modals */}
                            {/* Eway Bill Number Modal */}
                            <div
                                className="modal fade"
                                id="ewayNumberModal"
                                tabIndex="-1"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div className="apply-modal-content modal-content">
                                        <div className="text-center pb-5">
                                            <h3 className="title">Enter Eway Bill Details For Order #{fetchedOrderData.order_number}</h3>
                                            <button
                                                type="button"
                                                id="ewayNumberModalCloseButton"
                                                className="closed-modal"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        {/* End modal-header */}
                                        <Row className="pb-3">
                                            <Form.Group as={Col} controlId="validationCustomPhonenumber">
                                                <InputGroup size="md">
                                                    <InputGroup.Text id="inputGroupPrepend">Eway Bill Number</InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        value={ewayBillNumber}
                                                        required
                                                        onChange={(e) => {
                                                            setEwayBillNumber(e.target.value);
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        <Row className="pb-5">
                                            <Form.Group as={Col} controlId="validationCustomPhonenumber">
                                                <InputGroup size="md">
                                                    <InputGroup.Text id="inputGroupPrepend">Eway Bill Verified</InputGroup.Text>
                                                    <Form.Check
                                                        type="switch"
                                                        id="ewayBillVerified-switch"
                                                        className="mx-2 mt-2"
                                                        defaultChecked={ewayBillVerified}
                                                        onChange={handleChange}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Button
                                                variant="primary"
                                                size="md"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    updateEwayBillNumber(ewayBillNumber, ewayBillVerified);
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </Row>
                                        
                                        {/* End PrivateMessageBox */}
                                    </div>
                                    {/* End .send-private-message-wrapper */}
                                </div>
                            </div>
                            {/* End of Eway Bill Number Modal */}

                            {/* Cancel Order Modal */}
                            <div
                                className="modal fade"
                                id="cancelOrderModal"
                                tabIndex="-1"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div className="apply-modal-content modal-content">
                                        <div className="text-center pb-2">
                                            <h3 className="title">Are you sure you want to cancel this order?</h3>
                                            <button
                                                type="button"
                                                id="cancelOrderCloseButton"
                                                className="closed-modal"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        <Form.Label
                                            className="optional"
                                            style={{
                                                letterSpacing: "2px",
                                                fontSize: "12px",
                                                color: "red"
                                            }}
                                        >
                                            *All fields are required
                                        </Form.Label>
                                        {/* End modal-header */}
                                        <Row className="pb-3">
                                            <Form.Group as={Col} controlId="validationCustomPhonenumber">
                                                <InputGroup size="md" className="pb-2">
                                                    <InputGroup.Text id="inputGroupPrepend">Cancel Reason</InputGroup.Text>
                                                    <Form.Select
                                                        className="chosen-single form-select"
                                                        size="sm"
                                                        onChange={(e) => {
                                                            setCancelOrderData((previousState) => ({
                                                                ...previousState,
                                                                cancelReason: e.target.value,
                                                            }));
                                                        }}
                                                        value={cancelReason}
                                                    >
                                                        <option value=""></option>
                                                        {sortedCancelReasonRefs.map(
                                                            (option) => (
                                                                <option value={option}>
                                                                    {option}
                                                                </option>
                                                            )
                                                        )}
                                                    </Form.Select>
                                                </InputGroup>
                                                <InputGroup size="md">
                                                    <InputGroup.Text id="inputGroupPrepend">Cancel Note</InputGroup.Text>
                                                    <textarea
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        required
                                                        onChange={(e) => {
                                                            setCancelOrderData((previousState) => ({
                                                                ...previousState,
                                                                cancelNote: e.target.value,
                                                            }));
                                                        }}
                                                        cols="auto"
                                                        rows="2"
                                                        style={{
                                                            resize: "both",
                                                            overflowY: "scroll",
                                                            border: "1px solid #dee2e6",
                                                            padding: "10px",
                                                            fontSize: "14px",
                                                            color: "#212529",
                                                            maxHeight: "300px"
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Button
                                                variant="danger"
                                                size="md"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    cancelOrder(cancelOrderData);
                                                }}
                                            >
                                                Yes
                                            </Button>
                                        </Row>
                                        
                                        {/* End PrivateMessageBox */}
                                    </div>
                                    {/* End .send-private-message-wrapper */}
                                </div>
                            </div>
                            {/* End of Cancel Order Modal */}

                            {/* Order Company Name Modal */}
                            <div
                                className="modal fade"
                                id="companyNameModal"
                                tabIndex="-1"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div className="apply-modal-content modal-content">
                                        <div className="text-center pb-5">
                                            <h3 className="title">Enter Company Name</h3>
                                            <button
                                                type="button"
                                                id="companyNameModalCloseButton"
                                                className="closed-modal"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        {/* End modal-header */}
                                        <Row className="pb-3">
                                            <Form.Group as={Col} controlId="validationCustomPhonenumber">
                                                <InputGroup size="md">
                                                    <InputGroup.Text id="inputGroupPrepend">Company Name</InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        value={companyName}
                                                        required
                                                        onChange={(e) => {
                                                            setCompanyName(e.target.value);
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Button
                                                variant="primary"
                                                size="md"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    updateCompanyName(companyName);
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </Row>
                                        
                                        {/* End PrivateMessageBox */}
                                    </div>
                                    {/* End .send-private-message-wrapper */}
                                </div>
                            </div>
                            {/* End of Order Company Name Modal */}

                            {/* Order Local Transport Modal */}
                            <div
                                className="modal fade"
                                id="localTransportModal"
                                tabIndex="-1"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div className="apply-modal-content modal-content">
                                        <div className="text-center pb-5">
                                            <h3 className="title">Enter Local Transport Details</h3>
                                            <button
                                                type="button"
                                                id="localTransportModalCloseButton"
                                                className="closed-modal"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        {/* End modal-header */}
                                        <Row className="pb-3">
                                            <Form.Group as={Col} controlId="validationCustomPhonenumber">
                                                <InputGroup size="md">
                                                    <InputGroup.Text id="inputGroupPrepend">Local Transport</InputGroup.Text>
                                                    <textarea
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        value={localTransport}
                                                        required
                                                        onChange={(e) => {
                                                            setLocalTransport(e.target.value);
                                                        }}
                                                        cols="auto"
                                                        rows="2"
                                                        style={{
                                                            resize: "both",
                                                            overflowY: "scroll",
                                                            border: "1px solid #dee2e6",
                                                            padding: "10px",
                                                            fontSize: "14px",
                                                            color: "#212529",
                                                            maxHeight: "300px"
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Button
                                                variant="primary"
                                                size="md"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    updateLocalTransport(localTransport);
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </Row>
                                        
                                        {/* End PrivateMessageBox */}
                                    </div>
                                    {/* End .send-private-message-wrapper */}
                                </div>
                            </div>
                            {/* End of Order Local Transport Modal */}

                            {/* Order Truck Details Modal */}
                            <div
                                className="modal fade"
                                id="truckDetailsModal"
                                tabIndex="-1"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div className="apply-modal-content modal-content">
                                        <div className="text-center pb-5">
                                            <h3 className="title">Enter Truck Details</h3>
                                            <button
                                                type="button"
                                                id="truckDetailsModalCloseButton"
                                                className="closed-modal"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        {/* End modal-header */}
                                        <Row className="pb-3">
                                            <Form.Group as={Col} controlId="validationCustomPhonenumber">
                                                <InputGroup size="md">
                                                    <InputGroup.Text id="inputGroupPrepend">Truck Details</InputGroup.Text>
                                                    <textarea
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        value={truckDetails}
                                                        required
                                                        onChange={(e) => {
                                                            setTruckDetails(e.target.value);
                                                        }}
                                                        cols="auto"
                                                        rows="2"
                                                        style={{
                                                            resize: "both",
                                                            overflowY: "scroll",
                                                            border: "1px solid #dee2e6",
                                                            padding: "10px",
                                                            fontSize: "14px",
                                                            color: "#212529",
                                                            maxHeight: "300px"
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Button
                                                variant="primary"
                                                size="md"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    updateTruckDetails(truckDetails);
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </Row>
                                        
                                        {/* End PrivateMessageBox */}
                                    </div>
                                    {/* End .send-private-message-wrapper */}
                                </div>
                            </div>
                            {/* End of Order Truck Details Modal */}

                            {/* Order Comment Modal */}
                            <div
                                className="modal fade"
                                id="orderCommentModal"
                                tabIndex="-1"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div className="apply-modal-content modal-content">
                                        <div className="text-center pb-2">
                                            <h3 className="title">Add Order Comment</h3>
                                            <button
                                                type="button"
                                                id="orderCommentCloseButton"
                                                className="closed-modal"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        <Form.Label
                                            className="optional"
                                            style={{
                                                letterSpacing: "2px",
                                                fontSize: "12px",
                                                color: "red"
                                            }}
                                        >
                                            *All fields are required
                                        </Form.Label>
                                        {/* End modal-header */}
                                        <Row className="pb-3">
                                            <Form.Group as={Col} controlId="validationCustomPhonenumber">
                                                <InputGroup size="md">
                                                    <InputGroup.Text id="inputGroupPrepend">Enter Note</InputGroup.Text>
                                                    <textarea
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        required
                                                        onChange={(e) => {
                                                            setOrderComment(e.target.value);
                                                        }}
                                                        cols="auto"
                                                        rows="2"
                                                        style={{
                                                            resize: "both",
                                                            overflowY: "scroll",
                                                            border: "1px solid #dee2e6",
                                                            padding: "10px",
                                                            fontSize: "14px",
                                                            color: "#212529",
                                                            maxHeight: "300px"
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Button
                                                variant="danger"
                                                size="md"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addOrderComment(orderComment);
                                                }}
                                            >
                                                Add Comment
                                            </Button>
                                        </Row>
                                        
                                        {/* End PrivateMessageBox */}
                                    </div>
                                    {/* End .send-private-message-wrapper */}
                                </div>
                            </div>
                            {/* End of Order Comment Modal */}

                        </div>
                    </div>
                    {/* End .row */}
                </div>
                {/* End dashboard-outer */}
            </section>
            {/* <!-- End Dashboard --> */}

            <CopyrightFooter />
            {/* <!-- End Copyright --> */}
        </div>
    );
};

export default OrderDetails;
