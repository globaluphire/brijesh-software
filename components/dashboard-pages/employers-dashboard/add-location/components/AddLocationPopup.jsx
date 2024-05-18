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
import { Grid } from "react-loader-spinner";

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

const addLocationFields = {
    // pickup or drop
    locationType: "Pickup",

    // pick up details
    nameOfPickupPoint: "",
    pickupPointCity: "",
    address1: "",
    address2: "",
    area: "",
    city: "",
    pin: "",
    state: "",

    // pick up contact details
    contactType: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",

    // Drop details
    nameOfDropPoint: "",
    dropPointCity: "",
    dropAddress1: "",
    dropAddress2: "",
    dropArea: "",
    dropCity: "",
    dropPin: "",
    dropState: "",

    // contact details
    dropContactType: "",
    dropContactName: "",
    dropContactPhone: "",
    dropContactEmail: ""
};

const AddLocationPopup = ({ setIsLocationSaved, isLocationSaved }) => {
    const user = useSelector((state) => state.candidate.user);
    const [isLoading, setIsLoading] = useState(false);
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
    const [locationFormData, setLocationFormData] = useState(
        JSON.parse(JSON.stringify(addLocationFields))
    );
    const {
        // pickup or drop
        locationType,

        // pick up details
        nameOfPickupPoint,
        pickupPointCity,
        address1,
        address2,
        area,
        city,
        pin,
        state,

        // contact details
        contactType,
        contactName,
        contactPhone,
        contactEmail,

        // Drop details
        nameOfDropPoint,
        dropPointCity,
        dropAddress1,
        dropAddress2,
        dropArea,
        dropCity,
        dropPin,
        dropState,

        // contact details
        dropContactType,
        dropContactName,
        dropContactPhone,
        dropContactEmail

    } = useMemo(() => locationFormData, [locationFormData]);

    const searchInput = useRef(null);

    const [singleSelections, setSingleSelections] = useState([]);
    const [facilityNames, setFacilityNames] = useState([]);
    const [facilitySingleSelections, setFacilitySingleSelections] = useState(
        []
    );
    const [validated, setValidated] = useState(false);

    const [pickupCitySelection, setPickupCitySelection] = useState([]);
    const [pickupCityRequired, setPickupCityRequired] = useState(false);

    const [dropCitySelection, setDropCitySelection] = useState([]);
    const [dropCityRequired, setDropCityRequired] = useState(false);

    const [clientTypeReferenceOptions, setClientTypeReferenceOptions] = useState([]);
    const [clientContactTypeReferenceOptions, setClientContactTypeReferenceOptions] = useState([]);
    const [cityRefs, setCityRefs] = useState([]);

    async function getReferences() {
        setIsLoading(true);
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
        setIsLoading(false);
    };

    useEffect(() => {
        getReferences();
    }, []);

    function checkRequiredFields(locationFormData) {
        if (
            // pickup or drop
            locationFormData.locationType === "Pickup" &&
    
            // pick up details
            locationFormData.nameOfPickupPoint &&
            pickupCitySelection[0] &&
            locationFormData.address1 &&
            locationFormData.area &&
            locationFormData.city &&
            locationFormData.pin &&
            locationFormData.state &&
    
            // contact details
            locationFormData.contactType &&
            locationFormData.contactName &&
            locationFormData.contactPhone
        ) {
            return true;
        } else if (
            // drop
            locationFormData.locationType === "Drop" &&
    
            // pick up details
            locationFormData.nameOfDropPoint &&
            dropCitySelection[0] &&
            locationFormData.dropAddress1 &&
            locationFormData.dropArea &&
            locationFormData.dropCity &&
            locationFormData.dropPin &&
            locationFormData.dropState &&
    
            // contact details
            locationFormData.dropContactType &&
            locationFormData.dropContactName &&
            locationFormData.dropContactPhone
        ) {
            return true;
        } else {
            setPickupCityRequired(false);
            setDropCityRequired(false);
            return false;
        }
    };

    const addNewLocation = async (
        {
            // pickup or drop
            locationType,
    
            // pick up details
            nameOfPickupPoint,
            address1,
            address2,
            area,
            city,
            pin,
            state,
    
            // contact details
            contactType,
            contactName,
            contactPhone,
            contactEmail
        },
        setLocationFormData,
        user
    ) => {
        setIsLoading(true);
        if (checkRequiredFields(locationFormData)) {
            try {
                // Generate location number
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

                const { data: sysKeyLocationData, error: sysKeyLocationError } = await supabase
                    .from("sys_key")
                    .select("sys_seq_nbr")
                    .eq("key_name", "location_number");

                let locationSeqNbr = sysKeyLocationData[0].sys_seq_nbr + 1;
                if (locationSeqNbr < 10) {
                    locationSeqNbr = "00" + locationSeqNbr;
                } else if(locationSeqNbr < 100) {
                    locationSeqNbr = "0" + locationSeqNbr;
                }
                const locationNumber = "LOC" + "" + date + "" + month + "" + year.toString().substring(2) + "" + locationSeqNbr;

                // saving data
                const { data: locationData, error: locationError } = await supabase.from("location").insert([
                    {
                        // client
                        location_number: locationNumber,
                        location_type: locationType,
                        name_of_pickup_point: locationFormData.locationType === "Pickup" ? nameOfPickupPoint : nameOfDropPoint,
                        location_city: locationFormData.locationType === "Pickup" ? pickupCitySelection[0] : dropCitySelection[0],
                        address1: locationFormData.locationType === "Pickup" ? address1 : dropAddress1,
                        address2: locationFormData.locationType === "Pickup" ? address2 : dropAddress2,
                        area: locationFormData.locationType === "Pickup" ? area : dropArea,
                        city: locationFormData.locationType === "Pickup" ? city : dropCity,
                        pin: locationFormData.locationType === "Pickup" ? pin : dropPin,
                        state: locationFormData.locationType === "Pickup" ? state : dropState
                    },
                ]);
                if (locationError) {
                    // open toast
                    toast.error(
                        "Error while saving Location data, Please try again later or contact tech support",
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
                } else {
                    // saving location contact data
                    const { data: locationContactData, error: locationContactError } = await supabase.from("location_contact").insert([
                        {
                            // location contact details
                            location_number: locationNumber,
                            contact_type: locationFormData.locationType === "Pickup" ? contactType : dropContactType,
                            contact_name: locationFormData.locationType === "Pickup" ? contactName : dropContactName,
                            contact_phone: locationFormData.locationType === "Pickup" ? contactPhone : dropContactPhone,
                            contact_email: locationFormData.locationType === "Pickup" ? contactEmail : dropContactEmail
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
                    } else {
                        // open toast
                        toast.success("New " + locationType + " location saved successfully", {
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
                            keyname: "location_number",
                        });

                        setLocationFormData(JSON.parse(JSON.stringify(addLocationFields)));
                        setValidated(false);
                        setPickupCitySelection([]);
                        setDropCitySelection([]);
                        setPickupCityRequired(false);
                        setDropCityRequired(false);

                        // once all data saved set the callback state for refresh parent data
                        setIsLocationSaved(true);
                        setIsLoading(false);
                    }
                }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while saving Location details, Please try again later or contact tech support",
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
            setIsLoading(false);
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
            <Form validated={validated}>
                    <div>
                        <div>
                            <Row>
                                <div>
                                    <Form.Check
                                        inline
                                        name="location-type"
                                        type="radio"
                                        value="Pickup"
                                        onChange={(e) => {
                                            setLocationFormData((previousState) => ({
                                                ...previousState,
                                                locationType: e.target.value
                                            }));
                                        }}
                                        label="Pickup Location"
                                        checked={locationType === "Pickup"}
                                    />
                                    <Form.Check
                                        inline
                                        name="location-type"
                                        type="radio"
                                        value="Drop"
                                        onChange={(e) => {
                                            setLocationFormData((previousState) => ({
                                                ...previousState,
                                                locationType: e.target.value
                                            }));
                                        }}
                                        label="Drop Location"
                                        checked={locationType === "Drop"}
                                    />
                                </div>
                            </Row>

                            { locationType && locationType === "Pickup" ?
                                <>
                                    {/* Address Block starts */}
                                    <div>
                                        <div className="horizontal-divider pb-1"></div>
                                        <div style={{ padding: "0 2rem" }}>
                                            <Row className="mb-3">
                                                <Form.Group as={Col} md="6" lg="12" controlId="validationCustom02">
                                                    <Form.Label>Name of Pickup Point</Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        size="sm"
                                                        // placeholder="To"
                                                        // defaultValue="Otto"
                                                        value={nameOfPickupPoint}
                                                        onChange={(e) => {
                                                            setLocationFormData((previousState) => ({
                                                                ...previousState,
                                                                nameOfPickupPoint: e.target.value,
                                                            }));
                                                        }}
                                                    />
                                                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter Client Contact.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group as={Col} md="3" lg="12" controlId="validationCustom02">
                                                    <Form.Label>Pickup City</Form.Label>
                                                    <Typeahead
                                                        id="pickupCity"
                                                        size="sm"
                                                        onChange={setPickupCitySelection}
                                                        className="form-group"
                                                        options={cityRefs}
                                                        selected={pickupPointCity}
                                                        required="true"
                                                    />
                                                    { !pickupCityRequired && pickupCitySelection[0] ? <span style={{ color: "green" }}>Looks good!</span> :
                                                        <span  style={{ fontSize: "0.875em", color: "#dc3545" }}>
                                                            Please enter Pickup city.
                                                        </span>
                                                    }
                                                </Form.Group>
                                            </Row>
                                            <div className="horizontal-divider pb-1"></div>
                                            <Row>
                                                <Form.Group as={Col} md="6" lg="12" controlId="validationCustom03">
                                                    <Form.Label>Address 1</Form.Label>
                                                    <Form.Control    
                                                        type="text"
                                                        size="sm"
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
                                                <Form.Group as={Col} md="6" lg="12" controlId="validationCustom03">
                                                    <Form.Label>Address 2</Form.Label>
                                                    <Form.Control    
                                                        type="text"
                                                        size="sm"
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
                                                <Form.Group as={Col} md="2" lg="12" controlId="validationCustom03">
                                                    <Form.Label>City</Form.Label>
                                                    <Form.Control    
                                                        type="text"
                                                        size="sm"
                                                        required
                                                        value={city}
                                                        onChange={(e) => {
                                                            setLocationFormData((previousState) => ({
                                                                ...previousState,
                                                                city: e.target.value,
                                                            }));
                                                        }}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please provide a valid city.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group as={Col} md="2" lg="12" controlId="validationCustom04">
                                                    <Form.Label>State</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        size="sm"
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
                                                <Form.Group as={Col} md="2" lg="12" controlId="validationCustom04">
                                                    <Form.Label>Area</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        size="sm"
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
                                                <Form.Group as={Col} md="2" lg="12" controlId="validationCustom04">
                                                    <Form.Label>PIN</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        size="sm"
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
                                            <div className="horizontal-divider pb-1"></div>
                                        </div>
                                    </div>
                                    {/* Address Block ends */}

                                    {/* Contact Block starts */}
                                    <div>
                                        <div style={{ padding: "0 2rem" }}>
                                            <Row className="mb-3">
                                                <Form.Group as={Col} md="3" lg="12" controlId="validationCustom02">
                                                    <Form.Label>Contact Type</Form.Label>
                                                    <Form.Select
                                                        className="chosen-single form-select"
                                                        size="sm"
                                                        onChange={(e) => {
                                                            setLocationFormData((previousState) => ({
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
                                                <Form.Group as={Col} md="4" lg="12" controlId="validationCustom02">
                                                    <Form.Label>Contact Name</Form.Label>
                                                    <Form.Control
                                                        required
                                                        size="sm"
                                                        type="text"
                                                        // placeholder="To"
                                                        // defaultValue="Otto"
                                                        value={contactName}
                                                        onChange={(e) => {
                                                            setLocationFormData((previousState) => ({
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
                                                <Form.Group as={Col} md="4" lg="12" controlId="validationCustomPhonenumber">
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
                                                                setLocationFormData((previousState) => ({
                                                                    ...previousState,
                                                                    contactPhone: e.target.value,
                                                                }));
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="4" lg="12" controlId="validationCustom04">
                                                    <Form.Label>Client Email Address</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        size="sm"
                                                        placeholder=""
                                                        value={contactEmail}
                                                        onChange={(e) => {
                                                            setLocationFormData((previousState) => ({
                                                                ...previousState,
                                                                contactEmail: e.target.value,
                                                            }));
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Row>
                                        </div>
                                    </div>
                                    {/* Contact Block ends */}

                                    {/* Form Submit Buttons Block Starts */}
                                    <Row className="mt-3">
                                        <Form.Group as={Col} md="1" lg="12" className="chosen-single form-input chosen-container mx-3 mb-3 px-4">
                                            <Button
                                                type="submit"
                                                variant="success"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleSubmit(e);
                                                    addNewLocation(locationFormData, setLocationFormData, user);
                                                }}
                                                className="btn btn-add-lr btn-sm text-nowrap m-1"
                                            >
                                                Add New Location
                                            </Button>
                                        </Form.Group>
                                    </Row>
                                    {/* Form Submit Buttons Block Ends */}
                                </>
                            :   <>
                                {/* Address Block starts */}
                                <div>
                                    <div className="horizontal-divider pb-1"></div>
                                    <div style={{ padding: "0 2rem" }}>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="6" lg="12" controlId="validationCustom02">
                                                <Form.Label>Name of Drop Point</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    
                                                    // placeholder="To"
                                                    // defaultValue="Otto"
                                                    value={nameOfDropPoint}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            nameOfDropPoint: e.target.value,
                                                        }));
                                                    }}
                                                />
                                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                <Form.Control.Feedback type="invalid">
                                                    Please enter Drop Point.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group as={Col} md="3" lg="12" controlId="validationCustom02">
                                                <Form.Label>Drop City</Form.Label>
                                                <Typeahead
                                                    id="dropCity"
                                                    
                                                    onChange={setDropCitySelection}
                                                    className="form-group"
                                                    options={cityRefs}
                                                    selected={dropPointCity}
                                                    required="true"
                                                />
                                                { !dropCityRequired && dropCitySelection[0] ? <span style={{ color: "green" }}>Looks good!</span> :
                                                    <span  style={{ fontSize: "0.875em", color: "#dc3545" }}>
                                                        Please enter Drop city.
                                                    </span>
                                                }
                                            </Form.Group>
                                        </Row>
                                        <div className="horizontal-divider pb-1"></div>
                                        <Row>
                                            <Form.Group as={Col} md="6" lg="12" controlId="validationCustom03">
                                                <Form.Label>Address 1</Form.Label>
                                                <Form.Control    
                                                    type="text"
                                                    
                                                    // placeholder=""
                                                    required
                                                    value={dropAddress1}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropAddress1: e.target.value,
                                                        }));
                                                    }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Please provide a valid Client Address 1.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group as={Col} md="6" lg="12" controlId="validationCustom03">
                                                <Form.Label>Address 2</Form.Label>
                                                <Form.Control    
                                                    type="text"
                                                    
                                                    // placeholder=""
                                                    // required
                                                    value={dropAddress2}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropAddress2: e.target.value,
                                                        }));
                                                    }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Please provide a valid Client Address 2.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="2" lg="12" controlId="validationCustom03">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control    
                                                    type="text"
                                                    
                                                    required
                                                    value={dropCity}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropCity: e.target.value,
                                                        }));
                                                    }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Please provide a valid city.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group as={Col} md="2" lg="12" controlId="validationCustom04">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    
                                                    required
                                                    value={dropState}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropState: e.target.value,
                                                        }));
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group as={Col} md="2" lg="12" controlId="validationCustom04">
                                                <Form.Label>Area</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    
                                                    required
                                                    value={dropArea}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropArea: e.target.value,
                                                        }));
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group as={Col} md="2" lg="12" controlId="validationCustom04">
                                                <Form.Label>PIN</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    
                                                    required
                                                    value={dropPin}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropPin: e.target.value,
                                                        }));
                                                    }}
                                                />
                                            </Form.Group>
                                        </Row>
                                        <div className="horizontal-divider pb-1"></div>
                                    </div>
                                </div>
                                {/* Address Block ends */}

                                {/* Contact Block starts */}
                                <div>
                                    <div style={{ padding: "0 2rem" }}>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="3" lg="12" controlId="validationCustom02">
                                                <Form.Label>Contact Type</Form.Label>
                                                <Form.Select
                                                    className="chosen-single form-select"
                                                    
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropContactType: e.target.value,
                                                        }));
                                                    }}
                                                    value={dropContactType}
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
                                            <Form.Group as={Col} md="4" lg="12" controlId="validationCustom02">
                                                <Form.Label>Contact Name</Form.Label>
                                                <Form.Control
                                                    required
                                                    
                                                    type="text"
                                                    // placeholder="To"
                                                    // defaultValue="Otto"
                                                    value={dropContactName}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropContactName: e.target.value,
                                                        }));
                                                    }}
                                                />
                                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                <Form.Control.Feedback type="invalid">
                                                    Please enter Client Contact.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group as={Col} md="4" lg="12" controlId="validationCustomPhonenumber">
                                                <Form.Label>Contact Phone Number</Form.Label>
                                                <InputGroup >
                                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        // placeholder="Username"
                                                        aria-describedby="inputGroupPrepend"
                                                        required
                                                        value={dropContactPhone}
                                                        onChange={(e) => {
                                                            setLocationFormData((previousState) => ({
                                                                ...previousState,
                                                                dropContactPhone: e.target.value,
                                                            }));
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                            <Form.Group as={Col} md="4" lg="12" controlId="validationCustom04">
                                                <Form.Label>Client Email Address</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    
                                                    placeholder=""
                                                    value={dropContactEmail}
                                                    onChange={(e) => {
                                                        setLocationFormData((previousState) => ({
                                                            ...previousState,
                                                            dropContactEmail: e.target.value,
                                                        }));
                                                    }}
                                                />
                                            </Form.Group>
                                        </Row>
                                    </div>
                                </div>
                                {/* Contact Block ends */}

                                {/* Form Submit Buttons Block Starts */}
                                <Row className="mt-5">
                                    <Form.Group as={Col} md="1" lg="12" className="chosen-single form-input chosen-container mb-3">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {Router.push("/employers-dashboard/locations"); }}
                                            className="btn btn-back btn-sm text-nowrap m-1"
                                        >
                                            Back to Locations
                                        </Button>
                                    </Form.Group>
                                    <Form.Group as={Col} md="1" lg="12" className="chosen-single form-input chosen-container mx-3 mb-3 px-4">
                                        <Button
                                            type="submit"
                                            variant="success"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleSubmit(e);
                                                addNewLocation(locationFormData, setLocationFormData, user);
                                            }}
                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                        >
                                            Add New Location
                                        </Button>
                                    </Form.Group>
                                </Row>
                                {/* Form Submit Buttons Block Ends */}
                            </> }
                        </div>
                    </div>
            </Form>
            { isLoading ?
                <div style={{
                    height: "129%",
                    width: "83%",
                    position: "absolute",
                    background: "rgba(0, 0, 0, 0.3)",
                    zIndex: 1000,
                    paddingTop: "100%",
                    paddingLeft: "30%",
                }}>
                    <Grid
                        visible={true}
                        height="80"
                        width="80"
                        color="#333333"
                        ariaLabel="grid-loading"
                        radius="12.5"
                        wrapperStyle={{}}
                        wrapperClass="grid-wrapper"
                    />
                </div> : ""
            }
        </>
    );
};

export default AddLocationPopup;
