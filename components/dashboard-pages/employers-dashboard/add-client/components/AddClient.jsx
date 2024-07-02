/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../../../../config/supabaseClient";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import { Typeahead } from "react-bootstrap-typeahead";
import { envConfig } from "../../../../../config/env";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import Router from "next/router";

const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false,
});

const apiKey = envConfig.JOB_PORTAL_GMAP_API_KEY;
const mapApiJs = "https://maps.googleapis.com/maps/api/js";

// load google map api js
function loadAsyncScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("Script");
        Object.assign(script, {
            type: "text/javascript",
            async: true,
            src,
        });
        script.addEventListener("load", () => resolve(script));
        document.head.appendChild(script);
    });
}

const addJobFields = {
    jobTitle: "",
    jobDesc: "",
    jobType: "Full Time",
    salary: "",
    salaryRate: "Per Hour",
    education: "",
    exp: "0 - 1 year",
    address: "",
    completeAddress: "",
    facility: "",
};

const addClientFields = {
    // client
    clientType: "",
    clientName: "",
    clientEmail: "",
    clientPhone: null,
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
    clientContactPhone: null,
    clientContactEmail: ""
};
const AddClient = () => {
    const user = useSelector((state) => state.candidate.user);
    const [salaryType, setSalaryType] = useState("fixed");
    const [lowerLimit, setLowerLimit] = useState("");
    const [upperLimit, setUpperLimit] = useState("");

    const handleSalaryTypeChange = (e) => {
        setSalaryType(e.target.value);
    };

    const [jobData, setJobData] = useState(
        JSON.parse(JSON.stringify(addJobFields))
    );
    // const {
    //     jobTitle,
    //     jobDesc,
    //     jobType,
    //     salary,
    //     salaryRate,
    //     education,
    //     exp,
    //     address,
    //     completeAddress,
    //     facility,
    // } = useMemo(() => jobData, [jobData]);
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

    const searchInput = useRef(null);

    const [singleSelections, setSingleSelections] = useState([]);
    const [facilityNames, setFacilityNames] = useState([]);
    const [facilitySingleSelections, setFacilitySingleSelections] = useState(
        []
    );
    const [validated, setValidated] = useState(false);

    const [checkAllRefs, setCheckAllRefs] = useState(false);
    const [clientTypeReferenceOptions, setClientTypeReferenceOptions] = useState([]);
    const [clientContactTypeReferenceOptions, setClientContactTypeReferenceOptions] = useState([]);
    const [clientCitySelection, setClientCitySelection] = useState([]);
    const [clientCityRequired, setClientCityRequired] = useState(false);
    const [cityRefs, setCityRefs] = useState([]);

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

    const addNewClient = async (
        {
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
        },
        setClientFormData,
        user
    ) => {
        if (checkRequiredFields(clientFormData)) {
            try {
                // Generate client number
                const today = new Date();
                let date = today.getDate();
                if (date < 10) {
                    date = "0" + date;
                }
                let month = today.getMonth() + 1;
                if (month < 10) {
                    month = "0" + month;
                }
                var year = today.getFullYear();

                const { data: sysKeyClientData, error: sysKeyClientError } = await supabase
                    .from("sys_key")
                    .select("sys_seq_nbr")
                    .eq("key_name", "client_number");

                let clientSeqNbr = sysKeyClientData[0].sys_seq_nbr + 1;
                if (clientSeqNbr < 10) {
                    clientSeqNbr = "00" + clientSeqNbr;
                } else if(clientSeqNbr < 100) {
                    clientSeqNbr = "0" + clientSeqNbr;
                }
                const clientNumber = "C" + "" + date + "" + month + "" + year.toString().substring(2) + "" + clientSeqNbr;

                // saving client data
                const { data: clientData, error: clientError } = await supabase.from("client").insert([
                    {
                        // client
                        client_number: clientNumber,
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

                        client_created_by: user.id
                    },
                ]);
                if (clientError) {
                    // open toast
                    toast.error(
                        "Error while saving Client, Please try again later or contact tech support",
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
                        toast.success("New Client saved successfully", {
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
                            keyname: "client_number",
                        });

                        setClientFormData(JSON.parse(JSON.stringify(addClientFields)));
                        setValidated(false);
                        setClientCitySelection([]);
                        setClientCityRequired(false);
                    }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while saving CLIENT details, Please try again later or contact tech support",
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

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        }
        setValidated(true);
    };

    return (
        <> 
            {checkAllRefs ? <Form noValidate validated={validated}>
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
                                        </span>
                                        Client Type
                                    </Form.Label>
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
                                        </span>
                                        Client Name
                                    </Form.Label>
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
                                        </span>
                                        Client GSTIN
                                    </Form.Label>
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
                                        </span>
                                        Client Phone Number
                                    </Form.Label>
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
                                        </span>
                                        Address 1
                                    </Form.Label>
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
                                        </span>
                                        City
                                    </Form.Label>
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
                                        </span>
                                        State
                                    </Form.Label>
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
                                        </span>
                                        Area
                                    </Form.Label>
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
                                        </span>
                                        PIN
                                    </Form.Label>
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
                        <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                            <Button
                                variant="secondary"
                                onClick={() => {Router.push("/employers-dashboard/clients"); }}
                                className="btn btn-back btn-sm text-nowrap m-1"
                            >
                                Back to Clients
                            </Button>
                        </Form.Group>
                        <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mx-3 mb-3">
                            <Button
                                type="submit"
                                variant="success"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSubmit(e);
                                    addNewClient(clientFormData, setClientFormData, user);
                                }}
                                className="btn btn-add-lr btn-sm text-nowrap m-1"
                            >
                                Add New Client
                            </Button>
                        </Form.Group>
                    </Row>
                    {/* Form Submit Buttons Block Ends */}
                </Form>
            : "" }
        </>
    );
};

export default AddClient;
