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
import Spinner from "../../../components/spinner/spinner";


const cancelOrderDataFields = {
    cancelReason: "",
    cancelNote: ""
};

const InvoiceDetails = () => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Invoice Details are loading...");

    const [fetchedInvoiceData, setFetchedInvoiceData] = useState({});
    const [fetchedOrderData, setFetchedOrderData] = useState({});
    const [open, setOpen] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    // all references state
    const [sortedCancelReasonRefs, setSortedCancelReasonRefs] = useState([]);
    const [cancelReasonReferenceOptions, setCancelReasonReferenceOptions] = useState(null);

    const router = useRouter();
    const invoiceNumber = router.query.id;

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

    const fetchInvoiceData = async () => {
        try {
            if (user.role !== "") {
                if (user.role === "SUPER_ADMIN") {
                    if (invoiceNumber) {
                        const { data: invoiceData, error } = await supabase
                            .from("invoice")
                            .select("*")

                            // Filters
                            .eq("invoice_number", invoiceNumber);

                        if (invoiceData) {
                            setFetchedInvoiceData(invoiceData[0]);
                            setIsPaid(invoiceData[0].is_paid);
                            setTotalAmount(invoiceData[0].total_amount);

                            invoiceData[0].invoice_created_at = dateFormat(invoiceData[0].invoice_created_at);

                            if (invoiceData[0].invoice_updated_at) {
                                invoiceData[0].invoice_updated_at = dateFormat(invoiceData[0].invoice_updated_at);
                            }

                            const { data: orderData, error } = await supabase
                                .from("orders")
                                .select("*")

                                // Filters
                                .eq("order_id", invoiceData[0].order_id);
                            
                            if (orderData) {
                                setFetchedOrderData(orderData[0]);
                            }

                            setIsLoading(false);
                            setLoadingText("");
                        } else {
                            setIsLoading(false);
                            setLoadingText("");
                        }
                    }
                } else {
                    Router.push("/404");
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
        fetchInvoiceData();
    }, [invoiceNumber]);

    const SaveInvoiceChanges = async () => {
        if (totalAmount && isPaid) {
            try {
                const { data, error } = await supabase
                .from("invoice")
                .update({
                    total_amount: totalAmount,
                    is_paid: isPaid,
                    invoice_updated_at : new Date()
                })
                .eq("invoice_number", invoiceNumber);

                if (error) {
                    // open toast
                    toast.error(
                        "Error while saving Invoice changes, Please try again later or contact tech support",
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
                    toast.success("Invoice Changes saved successfully", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });

                    fetchInvoiceData();
                }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while saving Invoice changes, Please try again later or contact tech support",
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
            toast.error("Please fill all the required fields.", {
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
                                        <h3><b>Invoice Details</b></h3>
                                    </div>

                                    <Spinner isLoading={isLoading} loadingText={loadingText} />

                                    <div className="widget-content">
                                        {/* Start Main fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="md">
                                                        <InputGroup.Text id="inputGroupPrepend">Invoice Number</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedInvoiceData.invoice_number}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
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

                                        {/* Start Order dates fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup>
                                                        <InputGroup.Text id="inputGroupPrepend">Invoice Created On</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedInvoiceData.invoice_created_at}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup>
                                                        <InputGroup.Text id="inputGroupPrepend">Invoice Updated On</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={ fetchedInvoiceData.invoice_updated_at ? fetchedInvoiceData.invoice_updated_at : fetchedInvoiceData.invoice_created_at }
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
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <Form.Label>Total Amount <span className="optional">(ex. 12 or 12.00 or 12.01 or 12.12)</span></Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text id="inputGroupPrepend"><i className="las la-rupee-sign"></i></InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            // placeholder="900"
                                                            aria-describedby="inputGroupPrepend"
                                                            // required
                                                            value={totalAmount}
                                                            onChange={(e) => {
                                                                setTotalAmount(e.target.value);
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                        <Form.Label id="inputGroupPrepend">Status</Form.Label>
                                                        <Form.Select
                                                            className="chosen-single form-select"
                                                            onChange={(e) => { setIsPaid(e.target.value); }}
                                                            value={isPaid}
                                                            // required
                                                        >
                                                            <option value="true">PAID</option>
                                                            <option value="false">UNPAID</option>
                                                        </Form.Select>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Order Locations and Status fields */}

                                    </div>
                                    {/* Page Navigation Buttons */}
                                    <Row>
                                        <Form.Group as={Col} md="auto" className="chosen-single form-input chosen-container mb-3 mx-3">
                                            <Button
                                                variant="secondary"
                                                onClick={() => { window.history.back(); }}
                                                className="btn btn-back btn-sm text-nowrap m-1"
                                            >
                                                Back
                                            </Button>
                                        </Form.Group>
                                        <Form.Group as={Col} md="auto" className="chosen-single form-input chosen-container mb-3">
                                            <Button
                                                type="submit"
                                                variant="success"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    // handleSubmit(e);
                                                    // if(validated) {
                                                        SaveInvoiceChanges();
                                                    // }
                                                }}
                                                className="btn btn-add-lr btn-sm text-nowrap m-1"
                                            >
                                                Save Changes
                                            </Button>
                                        </Form.Group>
                                    </Row>

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
    );
};

export default InvoiceDetails;
