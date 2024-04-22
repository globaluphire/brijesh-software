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
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";

const OrderDetails = (orderDetails) => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [fetchedOrderData, setFetchedOrderData] = useState({});
    const [ewayBillNumber, setEwayBillNumber] = useState("");
    const [ewayBillVerified, setEwayBillVerified] = useState(false);
    const router = useRouter();
    const id = router.query.id;
    const isEmployer = ["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role);

    useEffect(() => {
        if (!isEmployer) {
            Router.push("/");
        }
    }, []);

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

    const fetchOrderData = async () => {
        try {
            if (id) {
                const { data: orderData, error } = await supabase
                    .from("orders")
                    .select("*")

                    // Filters
                    .eq("id", id);

                if (orderData) {
                    setFetchedOrderData(orderData[0]);
                    orderData[0].created_at = dateFormat(orderData[0].created_at);

                    if (orderData[0].updated_at) {
                        orderData[0].updated_at = dateFormat(orderData[0].updated_at);
                    }

                    setEwayBillNumber(fetchedOrderData.eway_number);
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

    useEffect(() => {
        fetchOrderData();
    }, [id]);

    const setNoteData = async (applicationId) => {
        // reset NoteText
        setNoteText("");
        setApplicationId("");

        const { data, error } = await supabase
            .from("applicants_view")
            .select("*")
            .eq("application_id", applicationId);

        if (data) {
            setNoteText(data[0].notes);
            setApplicationId(data[0].application_id);
        }
    };

    return isEmployer ? (
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
                                        <h4>Order Details</h4>
                                    </div>

                                    <div className="widget-content">
                                        {/* Start Main fields */}
                                        <Row className="pb-3">
                                            <Form.Group as={Col} md="auto" controlId="validationCustomPhonenumber">
                                                <InputGroup size="sm">
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
                                        </Row>
                                        {/* End Main fields */}

                                        {/* Start Required fields */}
                                        <Row className="pb-1">
                                            <Form.Group as={Col} md="12" controlId="validationCustomPhonenumber">
                                                <InputGroup size="sm">
                                                    <InputGroup.Text id="inputGroupPrepend">Quantity</InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        disabled
                                                        value={fetchedOrderData.quantity}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>

                                        <Row className="pb-3">
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
                                        {/* End Required fields */}

                                        {/* Start Eway Bill fields */}
                                        <Row className="pb-3">
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
                                                            data-bs-target="#addNoteModal"
                                                        >
                                                            <span className="la la-plus mx-2 mt-2"></span>
                                                        </a>
                                                    </button>
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        {/* End Eway Bill fields */}

                                        {/* Start Order dates fields */}
                                        <Row>
                                            <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                <InputGroup size="sm">
                                                    <InputGroup.Text id="inputGroupPrepend">Created On</InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        disabled
                                                        value={fetchedOrderData.created_at}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                            <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                <InputGroup size="sm">
                                                    <InputGroup.Text id="inputGroupPrepend">Updated On</InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        disabled
                                                        value={ fetchedOrderData.updated_at ? fetchedOrderData.updated_at : fetchedOrderData.created_at }
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Row>
                                        {/* End Order dates fields */}

                                    </div>
                                </div>
                            </div>

                            {/* Add Notes Modal Popup */}
                            <div
                                className="modal fade"
                                id="addNoteModal"
                                tabIndex="-1"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div className="apply-modal-content modal-content">
                                        <div className="text-center pb-5">
                                            <h3 className="title">Enter Eway Bill Details For Order #{fetchedOrderData.order_number}</h3>
                                            <button
                                                type="button"
                                                id="notesCloseButton"
                                                className="closed-modal"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        {/* End modal-header */}
                                        <Row className="pb-3">
                                            <Form.Group as={Col} controlId="validationCustomPhonenumber">
                                                { fetchedOrderData.eway_number ?
                                                    <InputGroup size="md">
                                                        <InputGroup.Text id="inputGroupPrepend">Eway Bill Number</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            value={fetchedOrderData.eway_number}
                                                            required
                                                            onChange={(e) => {
                                                                setEwayBillNumber(e.target.value);
                                                            }}
                                                        />
                                                    </InputGroup>
                                                    :
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
                                                }
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
                                                    // addNotes();
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
    ) : (
        // End page-wrapper
        ""
    );
};

export default OrderDetails;
