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
import { Typeahead } from "react-bootstrap-typeahead";
import Spinner from "../../../components/spinner/spinner";


const addLocationFields = {
    locationType: "",
    nameOfPoint: "",
    address1: "",
    address2: "",
    area: "",
    pin: "",
    state: ""
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

    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Location details are loading...");

    const router = useRouter();
    const locationNumber = router.query.id;

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

    const [locationFormData, setLocationFormData] = useState(
        JSON.parse(JSON.stringify(addLocationFields))
    );
    const {
        locationType,
        nameOfPoint,
        address1,
        address2,
        area,
        pin,
        state
    } = useMemo(() => locationFormData, [locationFormData]);

    const [clientContactTypeReferenceOptions, setClientContactTypeReferenceOptions] = useState([]);

    const [validated, setValidated] = useState(false);

    const [citySelection, setCitySelection] = useState([]);
    const [locationCitySelection, setLocationCitySelection] = useState([]);

    const [cityRefs, setCityRefs] = useState([]);

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

        // call reference to get city options
        const { data: cityRefData, error: err } = await supabase
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

    const fetchLocationData = async () => {
        try {
            if (locationNumber) {
                const { data: locationData, error } = await supabase
                    .from("location")
                    .select("*")

                    // Filters
                    .eq("location_number", locationNumber);

                if (locationData) {
                    locationData.forEach(
                        (i) => (i.location_created_at = dateTimeFormat(i.location_created_at))
                    );
                    
                    locationData.forEach(
                        (i) => (i.location_updated_at = dateTimeFormat(i.location_updated_at))
                    );

                    setFetchedLocationsData(locationData[0]);

                    setLocationFormData((previousState) => ({
                        ...previousState,
                        locationType: locationData[0].location_type,
                        nameOfPoint: locationData[0].name_of_pickup_point,
                        address1: locationData[0].address1,
                        address2: locationData[0].address2,
                        area: locationData[0].area,
                        pin: locationData[0].pin,
                        state: locationData[0].state
                    }));
    
                    // set city
                    const preCitySelected = [];
                    preCitySelected.push(locationData[0].city);
                    setCitySelection(preCitySelected);
    
                    // set location_city
                    const preLocationCitySelected = [];
                    preLocationCitySelected.push(locationData[0].location_city);
                    setLocationCitySelection(preLocationCitySelected);
    
                        const { data: contactData, error: e } = await supabase
                            .from("location_contact")
                            .select("*")

                            // Filters
                            .eq("location_number", locationNumber)
                            .order("location_contact_created_at", { ascending: false });

                            if (contactData) {
                                contactData.forEach(
                                    (i) => (i.location_contact_created_at = dateFormat(i.location_contact_created_at))
                                );

                                contactData.forEach(
                                    (i) => (i.location_contact_updated_at = dateFormat(i.location_contact_updated_at))
                                );
                                setFetchedContactData(contactData);

                                setIsLoading(false);
                                setLoadingText("");
                            } else {
                                setIsLoading(false);
                                setLoadingText("");
                            }
                    setIsLoading(false);
                    setLoadingText("");
                } else {
                    setIsLoading(false);
                    setLoadingText("");
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
            // console.warn(e);
            
            setIsLoading(false);
            setLoadingText("");
        }
    };

    const fetchLocationContactData = async () => {
        setIsLoading(true);

        const { data: contactData, error: e } = await supabase
                .from("location_contact")
                .select("*")

                // Filters
                .eq("location_number", locationNumber)
                .order("location_contact_created_at", { ascending: false });

        if (contactData) {
            contactData.forEach(
                (i) => (i.location_contact_created_at = dateFormat(i.location_contact_created_at))
            );

            contactData.forEach(
                (i) => (i.location_contact_updated_at = dateFormat(i.location_contact_updated_at))
            );
            setFetchedContactData(contactData);

            setIsLoading(false);
            setLoadingText("");
        } else {
            setIsLoading(false);
            setLoadingText("");
        }
    };

    useEffect(() => {
        fetchLocationData();
    }, [locationNumber]);

    function checkRequiredFields(locationFormData) {
        if (
            locationFormData.locationType &&
            locationFormData.nameOfPoint &&
            locationCitySelection[0] &&
            locationFormData.address1 &&
            locationFormData.area &&
            citySelection[0] &&
            locationFormData.pin &&
            locationFormData.state
        ) {
            return true;
        } else {
            return false;
        }
    };

    const saveLocationDetails = async (locationFormData) => {
        setIsLoading(true);

        // Pickup and Drop Point, Consignor Client, Consignee Client are required fields
        if (checkRequiredFields(locationFormData)) {
            try {
            
                const { data, error } = await supabase
                    .from("location")
                    .update({
                        name_of_pickup_point: nameOfPoint,
                        location_city: locationCitySelection[0],
                        address1: address1,
                        address2: address2,
                        area: area,
                        city: citySelection[0],
                        pin: pin,
                        state: state,

                        location_updated_at: new Date(),
                        location_updated_by: user.id
                    })
                    .eq("location_number", locationNumber)
                    .select(); // this will return the updated record in object

                if (!error) {
                    fetchLocationData();
                    setIsLoading(false);
                    setLoadingText("");
                    // open toast
                    toast.success("Location Details updated successfully", {
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
                    setIsLoading(false);
                    setLoadingText("");
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
                setIsLoading(false);
                setLoadingText("");
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
            setIsLoading(false);
            setLoadingText("");
        }
    };

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
        setIsLoading(true);
        if(contactType && contactName && contactPhone) {
            // saving location contact data
            const { data: locationContactData, error: locationContactError } = await supabase.from("location_contact").insert([
                {
                    // location contact details
                    location_number: locationNumber,
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
                setIsLoading(false);
                setLoadingText("");
            } else {
                fetchLocationContactData();
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
                setIsLoading(false);
                setLoadingText("");
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
            setIsLoading(false);
            setLoadingText("");
        }
    };

    const deleteSelectedContact = async (locationContactId) => {
        setIsLoading(true);
        if(confirm("WARNING!!! Are you sure you want to DELETE this contact? You cannot recover this once you delete!!!")){
            const { error } = await supabase
                .from("location_contact")
                .delete()
                .eq("location_contact_id", locationContactId);
            if (!error) {
                fetchLocationContactData();
                setIsLoading(false);
                setLoadingText("");
            } else {
                setIsLoading(false);
                setLoadingText("");
            }
        } else {
            setIsLoading(false);
            setLoadingText("");
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
                                        <h3><b>Location Details</b></h3>
                                    </div>

                                    <div className="widget-content">
                                        <Spinner isLoading={isLoading} loadingText={loadingText} />

                                        {/* Start Main fields */}
                                        <div className="pb-4">

                                            <Form validated={validated}>
                                                    <div>
                                                        <div style={{ padding: "0 2rem" }}>
                                                            {/* Address Block starts */}
                                                            <div>
                                                                <div className="horizontal-divider pb-1"></div>
                                                                <div>
                                                                    <Row className="mb-3">
                                                                        <Form.Group as={Col} md="6" controlId="validationCustom02">
                                                                            { locationType === "Pickup" ? 
                                                                                <Form.Label>Name of Pickup Point</Form.Label>
                                                                            :   <Form.Label>Name of Drop Point</Form.Label> }
                                                                            <Form.Control
                                                                                required
                                                                                type="text"
                                                                                // placeholder="To"
                                                                                // defaultValue="Otto"
                                                                                value={nameOfPoint}
                                                                                onChange={(e) => {
                                                                                    setLocationFormData((previousState) => ({
                                                                                        ...previousState,
                                                                                        nameOfPoint: e.target.value,
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                            <Form.Control.Feedback type="invalid">
                                                                                Please enter name of location.
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                        <Form.Group as={Col} md="3" controlId="validationCustom02">
                                                                            { locationType === "Pickup" ? 
                                                                                <Form.Label>Pickup City</Form.Label>
                                                                            :   <Form.Label>Drop City</Form.Label> }
                                                                            <Typeahead
                                                                                id="city"
                                                                                onChange={setCitySelection}
                                                                                className="form-group"
                                                                                options={cityRefs}
                                                                                selected={citySelection}
                                                                                required="true"
                                                                            />
                                                                            { citySelection && citySelection[0] ? <span style={{ color: "green" }}>Looks good!</span> :
                                                                                <span  style={{ fontSize: "0.875em", color: "#dc3545" }}>
                                                                                    Please enter Location City.
                                                                                </span>
                                                                            }
                                                                        </Form.Group>
                                                                    </Row>
                                                                    <div className="horizontal-divider pb-2"></div>
                                                                    <Row className="pb-2">
                                                                        <Form.Group as={Col} md="6" controlId="validationCustom03">
                                                                            <Form.Label>Address 1</Form.Label>
                                                                            <Form.Control    
                                                                                type="text"
                                                                                // placeholder=""
                                                                                required
                                                                                value={address1}
                                                                                onChange={(e) => {
                                                                                    setLocationFormData((previousState) => ({
                                                                                        ...previousState,
                                                                                        address1: e.target.value,
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
                                                                                value={address2}
                                                                                onChange={(e) => {
                                                                                    setLocationFormData((previousState) => ({
                                                                                        ...previousState,
                                                                                        address2: e.target.value,
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                Please provide a valid Client Address 2.
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Row>
                                                                    <Row className="mb-3">
                                                                        <Form.Group as={Col} md="2" controlId="validationCustom03">
                                                                            <Form.Label>City</Form.Label>
                                                                            <Typeahead
                                                                                id="city"
                                                                                onChange={setLocationCitySelection}
                                                                                className="form-group"
                                                                                options={cityRefs}
                                                                                selected={locationCitySelection}
                                                                                required="true"
                                                                            />
                                                                            { locationCitySelection && locationCitySelection[0] ? <span style={{ color: "green" }}>Looks good!</span> :
                                                                                <span  style={{ fontSize: "0.875em", color: "#dc3545" }}>
                                                                                    Please enter city.
                                                                                </span>
                                                                            }
                                                                        </Form.Group>
                                                                        <Form.Group as={Col} md="2" controlId="validationCustom04">
                                                                            <Form.Label>State</Form.Label>
                                                                            <Form.Control
                                                                                type="text"
                                                                                required
                                                                                value={state}
                                                                                onChange={(e) => {
                                                                                    setLocationFormData((previousState) => ({
                                                                                        ...previousState,
                                                                                        state: e.target.value,
                                                                                    }));
                                                                                }}
                                                                            />
                                                                        </Form.Group>
                                                                        <Form.Group as={Col} md="2" controlId="validationCustom04">
                                                                            <Form.Label>Area</Form.Label>
                                                                            <Form.Control
                                                                                type="text"
                                                                                required
                                                                                value={area}
                                                                                onChange={(e) => {
                                                                                    setLocationFormData((previousState) => ({
                                                                                        ...previousState,
                                                                                        area: e.target.value,
                                                                                    }));
                                                                                }}
                                                                            />
                                                                        </Form.Group>
                                                                        <Form.Group as={Col} md="2" controlId="validationCustom04">
                                                                            <Form.Label>PIN</Form.Label>
                                                                            <Form.Control
                                                                                type="number"
                                                                                required
                                                                                value={pin}
                                                                                onChange={(e) => {
                                                                                    setLocationFormData((previousState) => ({
                                                                                        ...previousState,
                                                                                        pin: e.target.value,
                                                                                    }));
                                                                                }}
                                                                            />
                                                                        </Form.Group>
                                                                    </Row>
                                                                    <div className="horizontal-divider pb-2"></div>
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
                                                            </div>
                                                            {/* Address Block ends */}

                                                            {/* Form Submit Buttons Block Starts */}
                                                            <Row className="mt-5">
                                                                <Form.Group as={Col} className="chosen-single form-input chosen-container mb-3">
                                                                    <Button
                                                                        type="submit"
                                                                        variant="success"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleSubmit(e);
                                                                            saveLocationDetails(locationFormData);
                                                                        }}
                                                                        className="btn btn-add-lr btn-sm text-nowrap m-1"
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                </Form.Group>
                                                            </Row>
                                                            {/* Form Submit Buttons Block Ends */}
                                                        </div>
                                                    </div>
                                            </Form>
                                        </div>
                                        {/* End Main fields */}

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
                                        <Form.Group as={Col} className="chosen-single form-input chosen-container px-5 mx-4 mb-4">
                                            <Button
                                                variant="secondary"
                                                onClick={() => { window.history.back(); }}
                                                className="btn btn-back btn-sm text-nowrap m-1"
                                            >
                                                Back
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
