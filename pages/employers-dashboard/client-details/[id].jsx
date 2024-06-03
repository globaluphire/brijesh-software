/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
/* eslint no-unneeded-ternary: "error" */
/* eslint-disable no-redeclare */
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
import { Typeahead } from "react-bootstrap-typeahead";
import AddLocationContactPopup from "../../../components/dashboard-pages/employers-dashboard/add-location/components/AddLocationContactPopup";
import AddLocationPopup from "../../../components/dashboard-pages/employers-dashboard/add-location/components/AddLocationPopup";
import { Grid } from "react-loader-spinner";
import Spinner from "../../../components/spinner/spinner";
import AddClientPopup from "../../../components/dashboard-pages/employers-dashboard/add-client/components/AddClientPopup";


const cancelOrderDataFields = {
    cancelReason: "",
    cancelNote: ""
};

const addClientFields = {
    // client
    clientType: "",
    clientName: "",
    clientEmail: "",
    clientPhone: 0,
    clientGST: "",
    clientPAN: "",

    // client address
    clientAddress1: "",
    clientAddress2: "",
    clientCity: "",
    clientState: "",
    clientArea: "",
    clientPIN: "",

    // client contact
    clientContactType: "",
    clientContactName: "",
    clientContactPhone: 0,
    clientContactEmail: ""
};

const ClientDetails = (orderDetails) => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Client details are loading...");

    // LR Details states
    const [fetchedClientData, setFetchedClientData] = useState({});

    // consignor states
    const [fetchedConsignorClientsData, setFetchedConsignorClientsData] = useState({});
    const [consignorClientNames, setConsignorClientNames] = useState([]);
    const [selectedConsignorClient, setSelectedConsignorClient] = useState([]);
    const [selectedConsignorClientData, setSelectedConsignorClientData] = useState("");

    const [clientFormData, setClientFormData] = useState(
        JSON.parse(JSON.stringify(addClientFields))
    );
    const {
        // client
        clientType,
        clientName,
        clientEmail,
        clientPhone,
        clientGST,
        clientPAN,
    
        // client address
        clientAddress1,
        clientAddress2,
        clientCity,
        clientState,
        clientArea,
        clientPIN,
    
        // client contact
        clientContactType,
        clientContactName,
        clientContactPhone,
        clientContactEmail
    } = useMemo(() => clientFormData, [clientFormData]);

    const [validated, setValidated] = useState(false);

    const [checkAllRefs, setCheckAllRefs] = useState(false);
    const [clientTypeReferenceOptions, setClientTypeReferenceOptions] = useState([]);
    const [clientContactTypeReferenceOptions, setClientContactTypeReferenceOptions] = useState([]);
    const [clientCitySelection, setClientCitySelection] = useState([]);
    const [clientCityRequired, setClientCityRequired] = useState(false);
    const [cityRefs, setCityRefs] = useState([]);

    const router = useRouter();
    const clientNumber = router.query.id;

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

    async function getReferences() {
        // call reference to get clientType options
        const { data: clientTypeRefData, error: err } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "clientType");

        if (clientTypeRefData) {
            const clientTypes = [];
            for (let i = 0; i < clientTypeRefData.length; i++) {
                clientTypes.push(clientTypeRefData[i].ref_dspl);
            }
            clientTypes.sort();
            setClientTypeReferenceOptions(clientTypes);
        }

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

        // call reference to get city options
        const { data: cityRefData, error } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "city");

        if (cityRefData) {
            const cityNames = [];
            for (let i = 0; i < cityRefData.length; i++) {
                cityNames.push(cityRefData[i].ref_dspl);
            }
            cityNames.sort();
            setCityRefs(cityNames);
        }

    };

    async function checkAllRefsData() {
        if (clientTypeReferenceOptions && clientContactTypeReferenceOptions) {
            setCheckAllRefs(true);
        }
    };

    useEffect(() => {
        getReferences();
    }, []);

    useEffect(() => {
        // validate refs data
        checkAllRefsData();
    }, [clientTypeReferenceOptions &&
        clientContactTypeReferenceOptions]
    );


    async function fetchedClients() {
        // fetch client data
        if (clientNumber) {
            try {

                // setTotalRecords((await query).data.length);

                let { data: clientData, error } = await supabase
                        .from("client")
                        .select("*")
                        .eq("client_number", clientNumber);
                // .range(
                //     (currentPage - 1) * pageSize,
                //     currentPage * pageSize - 1
                // );

                // if (facility) {
                //     allApplicantsView = allApplicantsView.filter(
                //         (i) => i.facility_name === facility
                //     );
                // }

                if (clientData) {
                    clientData.forEach(
                        (i) => (i.client_created_at = dateTimeFormat(i.client_created_at))
                    );
                    clientData.forEach(
                        (i) => (i.client_last_updated_at = dateTimeFormat(i.client_last_updated_at))
                    );
                }

                setFetchedClientData(clientData);

                setClientFormData((previousState) => ({
                    ...previousState,
                    // client
                    clientType: clientData[0].client_type,
                    clientName: clientData[0].client_name,
                    clientEmail: clientData[0].client_email,
                    clientPhone: clientData[0].client_phone,
                    clientGST: clientData[0].client_gst,
                    clientPAN: clientData[0].client_pan,
                
                    // client address
                    clientAddress1: clientData[0].address1,
                    clientAddress2: clientData[0].address2,
                    clientCity: clientData[0].city,
                    clientState: clientData[0].state,
                    clientArea: clientData[0].area,
                    clientPIN: clientData[0].pin,
                
                    // client contact
                    clientContactName: clientData[0].contact_name,
                    clientContactPhone: clientData[0].contact_phone,
                    clientContactEmail: clientData[0].contact_email
                }));

                // set client_city
                let preCitySelected = [];
                preCitySelected.push(clientData[0].city);
                setClientCitySelection(preCitySelected);

                setIsLoading(false);
                setLoadingText("");
            } catch (e) {
                toast.error(
                    "System is unavailable.  Unable to fetch Client Data.  Please try again later or contact tech support!",
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
                // console.warn(e);
            }
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
        fetchedClients();
        // if (facility) {
        //     localStorage.setItem("facility", facility);
        // } else {
        //     localStorage.setItem("facility", "");
        // }
    }, [clientNumber
        // facility,
        // pageSize,
        // currentPage
    ]);

    function checkRequiredFields(clientFormData) {
        if (
            // client
            clientFormData.clientType &&
            clientFormData.clientName &&
            clientFormData.clientGST &&
        
            // client address
            clientFormData.clientAddress1 &&
            clientCitySelection[0] &&
            clientFormData.clientState &&
            clientFormData.clientArea &&
            clientFormData.clientPIN
        ) {
            return true;
        } else {
            setClientCityRequired(false);
            return false;
        }
    };


    const saveClientDetails = async (clientFormData) => {
        // Pickup and Drop Point, Consignor Client, Consignee Client are required fields
        if (checkRequiredFields(clientFormData)) {
            try {
            
                const { data, error } = await supabase
                    .from("client")
                    .update({
                        // client
                        client_type: clientType,
                        client_name: clientName,
                        client_email: clientEmail,
                        client_phone: clientPhone,
                        client_gst: clientGST,
                        client_pan: clientPAN,

                        // client address
                        address1: clientAddress1,
                        address2: clientAddress2,
                        city: clientCitySelection[0],
                        state: clientState,
                        area: clientArea,
                        pin: clientPIN,

                        // client contact
                        contact_name: clientContactName,
                        contact_phone: clientContactPhone,
                        contact_email: clientContactEmail,

                        client_last_updated_at: new Date(),
                        client_updated_by: user.id
                    })
                    .eq("client_number", clientNumber)
                    .select(); // this will return the updated record in object

                if (!error) {
                    // open toast
                    toast.success("Client Details updated successfully", {
                        position: "bottom-right",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                } else {
                    // open toast
                    toast.error(
                        "Error while saving Client Details, Please try again later or contact tech support",
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
                }

            } catch (err) {
                // open toast
                toast.error(
                    "Error while saving your changes, Please try again later or contact tech support",
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
            toast.error("Please fill all required fields", {
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

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        setValidated(true);
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
                                        <h3><b>Client Details</b></h3>
                                    </div>

                                    <div className="widget-content">
                                        <Spinner isLoading={isLoading} loadingText={loadingText} />

                                        {checkAllRefs ?
                                            <Form noValidate validated={validated}>
                                                {/* Client Block starts */}
                                                <div>
                                                    <div className="divider">
                                                        <span><b>Details</b></span>
                                                    </div>
                                                    <div style={{ padding: "0 2rem" }}>
                                                        <Row className="mb-3">
                                                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>Client Type</Form.Label>
                                                                <Form.Select
                                                                    className="chosen-single form-select"
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientType: e.target.value,
                                                                        }));
                                                                    }}
                                                                    value={clientType}
                                                                    required
                                                                >
                                                                    <option value=""></option>
                                                                    {clientTypeReferenceOptions.map(
                                                                        (option) => (
                                                                            <option value={option}>
                                                                                {option}
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </Form.Select>
                                                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please enter Client Type.
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>Client Name</Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    // placeholder="Consignor"
                                                                    // defaultValue="Mark"
                                                                    value={clientName}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientName: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please enter Client Name.
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>Client GSTIN</Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    // placeholder="GST number"
                                                                    // defaultValue="Otto"
                                                                    value={clientGST}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientGST: e.target.value.toUpperCase(),
                                                                        }));
                                                                    }}
                                                                />
                                                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please enter Client's GST Number.
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                                                <Form.Label>Client PAN Number</Form.Label>
                                                                <Form.Control
                                                                    // required
                                                                    type="text"
                                                                    // placeholder="GST number"
                                                                    // defaultValue="Otto"
                                                                    value={clientPAN}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientPAN: e.target.value.toUpperCase(),
                                                                        }));
                                                                    }}
                                                                />
                                                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please enter Client's PAN Number.
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>Client Phone Number</Form.Label>
                                                                <InputGroup>
                                                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                                                    <Form.Control
                                                                        type="number"
                                                                        // placeholder="Username"
                                                                        aria-describedby="inputGroupPrepend"
                                                                        required
                                                                        value={clientPhone}
                                                                        onChange={(e) => {
                                                                            setClientFormData((previousState) => ({
                                                                                ...previousState,
                                                                                clientPhone: e.target.value,
                                                                            }));
                                                                        }}
                                                                    />
                                                                </InputGroup>
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="4" controlId="validationCustom04">
                                                                <Form.Label>Client Email Address</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={clientEmail}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientEmail: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                        </Row>
                                                    </div>
                                                </div>
                                                {/* Client Block ends */}

                                                {/* Client Address Block starts */}
                                                <div>
                                                    <div className="divider">
                                                        <span><b>Client Address</b></span>
                                                    </div>
                                                    <div style={{ padding: "0 2rem" }}>
                                                        <Row className="mb-3">
                                                            <Form.Group as={Col} md="6" controlId="validationCustom03">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>Address 1</Form.Label>
                                                                <Form.Control    
                                                                    type="text"
                                                                    // placeholder=""
                                                                    required
                                                                    value={clientAddress1}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientAddress1: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please provide a valid Client Address 1.
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="6" controlId="validationCustom03">
                                                                <Form.Label>Address 2</Form.Label>
                                                                <Form.Control    
                                                                    type="text"
                                                                    // placeholder=""
                                                                    // required
                                                                    value={clientAddress2}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientAddress2: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please provide a valid Client Address 2.
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>City</Form.Label>
                                                                <Typeahead
                                                                    id="clientCity"
                                                                    onChange={setClientCitySelection}
                                                                    className="form-group"
                                                                    options={cityRefs}
                                                                    selected={clientCitySelection}
                                                                    required="true"
                                                                />
                                                                { !clientCityRequired && clientCitySelection[0] ? <span style={{ color: "green" }}>Looks good!</span> :
                                                                    <span  style={{ fontSize: "0.875em", color: "#dc3545" }}>
                                                                        Please enter Client City.
                                                                    </span>
                                                                }
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="2" controlId="validationCustom04">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>State</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    required
                                                                    value={clientState}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientState: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="2" controlId="validationCustom04">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>Area</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    required
                                                                    value={clientArea}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientArea: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="2" controlId="validationCustom04">
                                                                <Form.Label>
                                                                    <span
                                                                        className="optional"
                                                                        style={{
                                                                            letterSpacing: "5px",
                                                                            fontSize: "24px",
                                                                            color: "red"
                                                                        }}
                                                                    >
                                                                        *
                                                                    </span>PIN</Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    required
                                                                    value={clientPIN}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientPIN: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                        </Row>
                                                    </div>
                                                </div>
                                                {/* Client Address Block ends */}

                                                {/* Client Contact Block starts */}
                                                <div>
                                                    <div className="divider divider-other">
                                                        <span><b>Client Contact</b></span>
                                                    </div>
                                                    <div style={{ padding: "0 2rem" }}>
                                                        <Row className="mb-3">
                                                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                                                <Form.Label>Contact Name</Form.Label>
                                                                <Form.Control
                                                                    // required
                                                                    type="text"
                                                                    // placeholder="To"
                                                                    // defaultValue="Otto"
                                                                    value={clientContactName}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientContactName: e.target.value,
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
                                                                <InputGroup>
                                                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                                                    <Form.Control
                                                                        type="number"
                                                                        // placeholder="Username"
                                                                        aria-describedby="inputGroupPrepend"
                                                                        // required
                                                                        value={clientContactPhone}
                                                                        onChange={(e) => {
                                                                            setClientFormData((previousState) => ({
                                                                                ...previousState,
                                                                                clientContactPhone: e.target.value,
                                                                            }));
                                                                        }}
                                                                    />
                                                                </InputGroup>
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="4" controlId="validationCustom04">
                                                                <Form.Label>Client Email Address</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={clientContactEmail}
                                                                    onChange={(e) => {
                                                                        setClientFormData((previousState) => ({
                                                                            ...previousState,
                                                                            clientContactEmail: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                        </Row>
                                                    </div>
                                                </div>
                                                {/* Client Contact Block ends */}

                                                {/* Form Submit Buttons Block Starts */}
                                                <Row className="mt-5">
                                                    <Form.Group as={Col} md="auto" className="chosen-single form-input chosen-container mb-3">
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => { window.history.back(); }}
                                                            className="btn btn-back btn-sm text-nowrap m-1"
                                                        >
                                                            Back
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            variant="success"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleSubmit(e);
                                                                saveClientDetails(clientFormData);
                                                            }}
                                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                                        >
                                                            Save
                                                        </Button>
                                                    </Form.Group>
                                                </Row>
                                                {/* Form Submit Buttons Block Ends */}
                                            </Form>
                                        : "" }
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End .row */}
                    </div>
                </div>
                {/* End dashboard-outer */}
            </section>
            {/* <!-- End Dashboard --> */}

            <CopyrightFooter />
            {/* <!-- End Copyright --> */}
        </div>
    );
};

export default ClientDetails;
