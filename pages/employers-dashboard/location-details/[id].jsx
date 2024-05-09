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

const addLocationContactFields = {
    // contact details
    contactType: "",
    contactName: "",
    contactPhone: "",
    contactEmail: ""
};

const LocationDetails = () => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [fetchedLocationsData, setFetchedLocationsData] = useState({});
    const [fetchedContactData, setFetchedContactData] = useState([]);
    const [ewayBillVerified, setEwayBillVerified] = useState(false);
    const [open, setOpen] = useState(false);

    const router = useRouter();
    const id = router.query.id;

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

    const [locationContactFormData, setLocationContactFormData] = useState(
        JSON.parse(JSON.stringify(addLocationContactFields))
    );
    const {
        // contact details
        contactType,
        contactName,
        contactPhone,
        contactEmail

    } = useMemo(() => locationContactFormData, [locationContactFormData]);

    const [clientContactTypeReferenceOptions, setClientContactTypeReferenceOptions] = useState([]);

    async function getReferences() {
        // call reference to get clientContactType options
        const { data: clientContactTypeRefData, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "clientContactType");

        if (clientContactTypeRefData) {
            const clientContactTypes = [];
            for (let i = 0; i < clientContactTypeRefData.length; i++) {
                clientContactTypes.push(clientContactTypeRefData[i].ref_dspl);
            }
            clientContactTypes.sort();
            setClientContactTypeReferenceOptions(clientContactTypes);
        }
    };

    useEffect(() => {
        getReferences();
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

    const handleChange=(e)=>{
        setEwayBillVerified(!ewayBillVerified);
    };

    const fetchLocationData = async () => {
        try {
            if (id) {
                const { data: locationData, error } = await supabase
                    .from("location")
                    .select("*")

                    // Filters
                    .eq("location_number", id);

                if (locationData) {
                    locationData.forEach(
                        (i) => (i.location_created_at = dateTimeFormat(i.location_created_at))
                    );
                    
                    locationData.forEach(
                        (i) => (i.location_updated_at = dateTimeFormat(i.location_updated_at))
                    );

                    setFetchedLocationsData(locationData[0]);

                    const { data: contactData, error: e } = await supabase
                        .from("location_contact")
                        .select("*")

                        // Filters
                        .eq("location_number", id)
                        .order("location_contact_created_at", { ascending: false });

                        if (contactData) {
                            contactData.forEach(
                                (i) => (i.location_contact_created_at = dateFormat(i.location_contact_created_at))
                            );

                            contactData.forEach(
                                (i) => (i.location_contact_updated_at = dateFormat(i.location_contact_updated_at))
                            );
                            setFetchedContactData(contactData);
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

    const fetchLocationContactData = async () => {

        const { data: contactData, error: e } = await supabase
                .from("location_contact")
                .select("*")

                // Filters
                .eq("location_number", id)
                .order("location_contact_created_at", { ascending: false });

        if (contactData) {
            contactData.forEach(
                (i) => (i.location_contact_created_at = dateFormat(i.location_contact_created_at))
            );

            contactData.forEach(
                (i) => (i.location_contact_updated_at = dateFormat(i.location_contact_updated_at))
            );
            setFetchedContactData(contactData);
        }
    };

    useEffect(() => {
        fetchLocationData();
    }, [id]);

    const addNewLocationContact = async (
        {
            // contact details
            contactType,
            contactName,
            contactPhone,
            contactEmail
        },
        setLocationFormData,
        user
    ) => 
    {
        if(contactType && contactName && contactPhone) {
            // saving location contact data
            const { data: locationContactData, error: locationContactError } = await supabase.from("location_contact").insert([
                {
                    // location contact details
                    location_number: id,
                    contact_type: contactType,
                    contact_name: contactName,
                    contact_phone: contactPhone,
                    contact_email: contactEmail
                },
            ]);
            if (locationContactError) {
                // open toast
                toast.error(
                    "Error while saving Location Contact data, Please try again later or contact tech support",
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
                setTimeout(() => {
                    fetchLocationContactData();
                }, 3000);
    
                // open toast
                toast.success("New " + contactType + " contact saved successfully", {
                    position: "bottom-right",
                    autoClose: 8000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });

                setLocationContactFormData(JSON.parse(JSON.stringify(addLocationContactFields)));
            }
        } else {
            toast.error("Please fill all required fields!!!", {
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

    const deleteSelectedContact = async (locationContactId) => {
        if(confirm("WARNING!!! Are you sure you want to DELETE this contact? You cannot recover this once you delete!!!")){
            const { error } = await supabase
                .from("location_contact")
                .delete()
                .eq("location_contact_id", locationContactId);
            if (!error) {
                fetchLocationContactData();
            }
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
                                        <h3><b>Location Details</b></h3>
                                    </div>

                                    <div className="widget-content">
                                        {/* Start Main fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="md">
                                                        <InputGroup.Text id="inputGroupPrepend">Name Of Pickup Point</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedLocationsData.name_of_pickup_point}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="md">
                                                        <InputGroup.Text id="inputGroupPrepend">Location Type</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedLocationsData.location_type}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="md">
                                                        <InputGroup.Text id="inputGroupPrepend">Pickup City</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedLocationsData.pickup_city}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <Row className="pt-4">
                                                <Form.Group as={Col} md="12" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Address</InputGroup.Text>
                                                        <textarea
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={
                                                                fetchedLocationsData.address1 + ", " +
                                                                fetchedLocationsData.address2 + ", " +
                                                                fetchedLocationsData.area + ", " +
                                                                fetchedLocationsData.city + ", " +
                                                                fetchedLocationsData.state + ", " +
                                                                fetchedLocationsData.pin}
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
                                        </div>
                                        {/* End Main fields */}

                                        {/* Start dates fields */}
                                        <div className="pb-4">
                                            <Row>
                                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm" className="pb-3">
                                                        <InputGroup.Text id="inputGroupPrepend">Location Created On</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedLocationsData.location_created_at}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Location Updated On</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={ fetchedLocationsData.location_updated_at }
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End dates fields */}

                                        {/* Contact Lists Section */}
                                        <div>
                                            <Row className="mx-2">
                                                <b className="pb-3">
                                                    Contact Lists
                                                    <a
                                                        className="la la-refresh"
                                                        onClick={() => { fetchLocationContactData(); }}
                                                        style={{ marginLeft: "10px" }}>
                                                    </a>
                                                </b>

                                                {/* Contact Block starts */}
                                                <div>
                                                    <div style={{ padding: "0 2rem" }}>
                                                        <div style={{ border: "1px solid #dee2e6", padding: "1rem", backgroundColor: "#dee2e6" }}>
                                                            <Row className="mb-3">
                                                                <Form.Group as={Col} md="3" controlId="validationCustom02">
                                                                    <Form.Label>Contact Type</Form.Label>
                                                                    <Form.Select
                                                                        size="sm"
                                                                        className="chosen-single form-select"
                                                                        onChange={(e) => {
                                                                            setLocationContactFormData((previousState) => ({
                                                                                ...previousState,
                                                                                contactType: e.target.value,
                                                                            }));
                                                                        }}
                                                                        value={contactType}
                                                                        required
                                                                    >
                                                                        <option value=""></option>
                                                                        {clientContactTypeReferenceOptions.map(
                                                                            (option) => (
                                                                                <option value={option}>
                                                                                    {option}
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </Form.Select>
                                                                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                    <Form.Control.Feedback type="invalid">
                                                                        Please enter Client Contact Type.
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Row>
                                                            <Row>
                                                                <Form.Group as={Col} md="4" controlId="validationCustom02">
                                                                    <Form.Label>Contact Name</Form.Label>
                                                                    <Form.Control
                                                                        size="sm"
                                                                        required
                                                                        type="text"
                                                                        // placeholder="To"
                                                                        // defaultValue="Otto"
                                                                        value={contactName}
                                                                        onChange={(e) => {
                                                                            setLocationContactFormData((previousState) => ({
                                                                                ...previousState,
                                                                                contactName: e.target.value,
                                                                            }));
                                                                        }}
                                                                    />
                                                                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                    <Form.Control.Feedback type="invalid">
                                                                        Please enter Client Contact.
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                                    <Form.Label>Contact Phone Number</Form.Label>
                                                                    <InputGroup size="sm">
                                                                        <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            // placeholder="Username"
                                                                            aria-describedby="inputGroupPrepend"
                                                                            required
                                                                            value={contactPhone}
                                                                            onChange={(e) => {
                                                                                setLocationContactFormData((previousState) => ({
                                                                                    ...previousState,
                                                                                    contactPhone: e.target.value,
                                                                                }));
                                                                            }}
                                                                        />
                                                                    </InputGroup>
                                                                </Form.Group>
                                                                <Form.Group as={Col} md="4" controlId="validationCustom04">
                                                                    <Form.Label>Client Email Address</Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        size="sm"
                                                                        placeholder=""
                                                                        value={contactEmail}
                                                                        onChange={(e) => {
                                                                            setLocationContactFormData((previousState) => ({
                                                                                ...previousState,
                                                                                contactEmail: e.target.value,
                                                                            }));
                                                                        }}
                                                                    />
                                                                </Form.Group>
                                                            </Row>
                                                            <Row>
                                                                <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mt-3">
                                                                    <Button
                                                                        type="submit"
                                                                        variant="success"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            addNewLocationContact(locationContactFormData, setLocationContactFormData, user);
                                                                        }}
                                                                        className="btn btn-sm text-nowrap m-1"
                                                                    >
                                                                        Add New Contact
                                                                    </Button>
                                                                </Form.Group>
                                                            </Row>
                                                        </div>
                                                        <div className="horizontal-divider pb-2"></div>
                                                    </div>
                                                </div>
                                                {/* Contact Block ends */}

                                                <div className="widget-content">
                                                    <div className="table-outer">
                                                    <Table className="default-table manage-job-table">
                                                        <thead>
                                                            <tr>
                                                                <th style={{ fontSize: "14px" }}>Delete</th>
                                                                <th style={{ fontSize: "14px" }}>Created On</th>
                                                                <th style={{ fontSize: "14px" }}>Type</th>
                                                                <th style={{ fontSize: "14px" }}>Name</th>
                                                                <th style={{ fontSize: "14px" }}>Phone</th>
                                                                <th style={{ fontSize: "14px" }}>Email</th>
                                                            </tr>
                                                        </thead>
                                                        {fetchedContactData.length === 0 ? (
                                                            <tbody
                                                                style={{
                                                                    fontSize: "14px",
                                                                    fontWeight: "500",
                                                                }}
                                                            >
                                                                <tr>
                                                                    <td colSpan={3}>
                                                                        <b> No contact yet!</b>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        ) : (
                                                            <tbody style={{ fontSize: "14px" }}>
                                                                {Array.from(fetchedContactData).map(
                                                                    (contact) => (
                                                                        <tr key={contact.contact_name}>
                                                                            <td>
                                                                                <ui className="option-list" style={{ border: "none" }}>
                                                                                    <li>
                                                                                        <button>
                                                                                            <a onClick={() => { deleteSelectedContact(contact.location_contact_id); }}>
                                                                                                <span className="la la-trash" title="Delete Contact"></span>
                                                                                            </a>
                                                                                        </button>
                                                                                    </li>
                                                                                </ui>
                                                                            </td>
                                                                            <td>
                                                                                {contact.location_contact_created_at}
                                                                            </td>
                                                                            <td>
                                                                                {contact.contact_type}
                                                                            </td>
                                                                            <td>
                                                                                {contact.contact_name}
                                                                            </td>
                                                                            <td>
                                                                                {contact.contact_phone}
                                                                            </td>
                                                                            <td>
                                                                                {contact.contact_email}
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
                                        {/* End of Contact Lists Section */}

                                    </div>
                                    {/* Page Navigation Buttons */}
                                    <Row>
                                        <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container m-4">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {Router.push("/employers-dashboard/locations"); }}
                                                className="btn btn-back btn-sm text-nowrap m-1"
                                            >
                                                Back to Locations
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

export default LocationDetails;
