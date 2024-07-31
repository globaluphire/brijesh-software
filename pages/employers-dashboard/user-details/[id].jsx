/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
/* eslint no-unneeded-ternary: "error" */
/* eslint-disable no-redeclare */
// import Map from "../../../../Map";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPopup from "../../../components/common/form/login/LoginPopup";
import DashboardHeader from "../../../components/header/DashboardHeader";
import MobileMenu from "../../../components/header/MobileMenu";
import DashboardEmployerSidebar from "../../../components/header/DashboardEmployerSidebar";
import MenuToggler from "../../../components/dashboard-pages/MenuToggler";
import CopyrightFooter from "../../../components/dashboard-pages/CopyrightFooter";
import Router, { useRouter } from "next/router";
import DefaulHeader2 from "../../../components/header/DefaulHeader2";
import { supabase } from "../../../config/supabaseClient";
import { Button, Col, Collapse, Container, Form, InputGroup, Row, Table } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import Spinner from "../../../components/spinner/spinner";


const cancelOrderDataFields = {
    cancelReason: "",
    cancelNote: ""
};

const addUserFields = {
    name: "",
    email: "",
    role: "",
    dropBranch: "",
    pickupBranch: "",
};

const UserDetails = () => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);

    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("User details are loading...");

    // LR Details states
    const [fetchedUserData, setFetchedUserData] = useState({});

    const [userFormData, setUserFormData] = useState(
        JSON.parse(JSON.stringify(addUserFields))
    );
    const {
        // client
        name,
        email,
        role,
        dropBranch,
        pickupBranch,
    } = useMemo(() => userFormData, [userFormData]);

    const [validated, setValidated] = useState(false);

    const [checkAllRefs, setCheckAllRefs] = useState(false);
    const [clientTypeReferenceOptions, setClientTypeReferenceOptions] = useState([]);
    const [clientContactTypeReferenceOptions, setClientContactTypeReferenceOptions] = useState([]);
    const [dropCitySelection, setDropCitySelection] = useState([]);
    const [pickupCitySelection, setPickupCitySelection] = useState([]);
    const [clientCityRequired, setClientCityRequired] = useState(false);
    const [cityRefs, setCityRefs] = useState([]);

    const router = useRouter();
    const userKeyID = router.query.id;

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


    async function fetchUser() {
        // fetch user data
        if (userKeyID) {
            try {

                let { data: userData, error } = await supabase
                        .from("users")
                        .select("*")
                        .eq("user_key_id", userKeyID);

                if (userData) {
                    userData.forEach(
                        (i) => (i.created_at = dateTimeFormat(i.created_at))
                    );
                    userData.forEach(
                        (i) => (i.change_dttm = dateTimeFormat(i.change_dttm))
                    );
                    setFetchedUserData(userData);

                    setUserFormData((previousState) => ({
                        ...previousState,
                        name: userData[0].name,
                        email: userData[0].email,
                        role: userData[0].role,
                        dropBranch: userData[0].drop_branch,
                        pickupBranch: userData[0].pickup_branch
                    }));
    
                    // set drop branch
                    let preDropCitySelected = [];
                    preDropCitySelected.push(userData[0].drop_branch ? userData[0].drop_branch : "");
                    setDropCitySelection(preDropCitySelected);
    
                    // set pickup branch
                    let prePickupCitySelected = [];
                    prePickupCitySelected.push(userData[0].pickup_branch ? userData[0].pickup_branch : "");
                    setPickupCitySelection(prePickupCitySelected);
    
                    setIsLoading(false);
                    setLoadingText("");
                } else {
                    setIsLoading(false);
                    setLoadingText("");
                }

            } catch (e) {
                toast.error(
                    "System is unavailable.  Unable to fetch User Data.  Please try again later or contact tech support!",
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

                setIsLoading(false);
                setLoadingText("");
            }
        }
    }

    useEffect(() => {
        fetchUser();
        // if (facility) {
        //     localStorage.setItem("facility", facility);
        // } else {
        //     localStorage.setItem("facility", "");
        // }
    }, [userKeyID]);

    function checkRequiredFields(userFormData) {
        if (
            userFormData.name &&
            userFormData.email &&
            userFormData.role
        ) {
            return true;
        } else {
            return false;
        }
    };


    const saveUserDetails = async (userFormData) => {
        if (checkRequiredFields(userFormData)) {
            try {

                const { data, error } = await supabase
                    .from("users")
                    .update({
                        name: name,
                        email: email,
                        role: role,
                        drop_branch: dropCitySelection.length > 0 && dropCitySelection[0] !== "" ? dropCitySelection[0] : null,
                        pickup_branch: pickupCitySelection.length > 0 && pickupCitySelection[0] !== ""  ? pickupCitySelection[0] : null,
                        change_dttm: new Date(),
                        user_updated_by: user.id
                    })
                    .eq("user_key_id", userKeyID)
                    .select(); // this will return the updated record in object

                if (!error) {
                    // open toast
                    toast.success("User Details updated successfully", {
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
                        "Error while saving User Details, Please try again later or contact tech support",
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
                console.warn(err);
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
                                                                    </span>User Name</Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    value={name}
                                                                    onChange={(e) => {
                                                                        setUserFormData((previousState) => ({
                                                                            ...previousState,
                                                                            name: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please enter User Name.
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
                                                                    </span>User's Registered Email ID</Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    // placeholder="Consignor"
                                                                    // defaultValue="Mark"
                                                                    value={email}
                                                                    disabled
                                                                    onChange={(e) => {
                                                                        setUserFormData((previousState) => ({
                                                                            ...previousState,
                                                                            email: e.target.value,
                                                                        }));
                                                                    }}
                                                                />
                                                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please enter User's Registered Email ID.
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="4" controlId="validationCustom04">
                                                                <Form.Label>User Role</Form.Label>
                                                                <Form.Select
                                                                    className="chosen-single form-select"
                                                                    onChange={(e) => {
                                                                        setUserFormData((previousState) => ({
                                                                            ...previousState,
                                                                            role: e.target.value,
                                                                        }));
                                                                    }}
                                                                    value={role}
                                                                    required
                                                                >
                                                                    <option value="ADMIN">Admin</option>
                                                                    <option value="SUPER_ADMIN">Super Admin</option>
                                                                    <option value="NO ACCESS">NO ACCESS</option>
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </Row>
                                                    </div>
                                                </div>
                                                {/* Client Block ends */}

                                                {/* Client Address Block starts */}
                                                <div>
                                                    <div className="divider">
                                                        <span><b>User's City Accesses</b></span>
                                                    </div>
                                                    <div style={{ padding: "0 2rem" }}>
                                                        <Row className="mb-3">
                                                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                                                <Form.Label>Drop Branch</Form.Label>
                                                                <Typeahead
                                                                    id="userDropBranch"
                                                                    onChange={setDropCitySelection}
                                                                    className="form-group"
                                                                    options={cityRefs}
                                                                    selected={dropCitySelection}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                                                <Form.Label>Pickup Branch</Form.Label>
                                                                <Typeahead
                                                                    id="userPickupBranch"
                                                                    onChange={setPickupCitySelection}
                                                                    className="form-group"
                                                                    options={cityRefs}
                                                                    selected={pickupCitySelection}
                                                                />
                                                            </Form.Group>
                                                        </Row>
                                                    </div>
                                                </div>
                                                {/* Client Address Block ends */}

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
                                                                saveUserDetails(userFormData);
                                                            }}
                                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                                        >
                                                            Save Changes
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

export default UserDetails;
