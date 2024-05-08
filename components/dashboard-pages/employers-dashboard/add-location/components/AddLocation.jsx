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

const addLocationFields = {
    // pickup or drop
    locationType: "Pickup",

    // pick up details
    nameOfPickupPoint: "",
    pickupCity: "",
    address1: "",
    address2: "",
    area: "",
    city: "",
    pin: "",
    state: "",

    // contact details
    contactType: "",
    contactName: "",
    contactPhone: "",
    contactEmail: ""
};

const AddLocation = () => {
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
    const [locationFormData, setLocationFormData] = useState(
        JSON.parse(JSON.stringify(addLocationFields))
    );
    const {
        // pickup or drop
        locationType,

        // pick up details
        nameOfPickupPoint,
        pickupCity,
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

    const [clientTypeReferenceOptions, setClientTypeReferenceOptions] = useState([]);
    const [clientContactTypeReferenceOptions, setClientContactTypeReferenceOptions] = useState([]);
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

    function checkRequiredFields(locationFormData) {
        if (
            // pickup or drop
            locationFormData.locationType &&
    
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
        } else {
            setPickupCityRequired(false);
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
                        name_of_pickup_point: nameOfPickupPoint,
                        pickup_city: pickupCitySelection[0],
                        address1: address1,
                        address2: address2,
                        area: area,
                        city: city,
                        pin: pin,
                        state: state
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
                } else {
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
                        setPickupCityRequired(false);
                    }
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
            <Form validated={validated}>
                    <div>
                        <div style={{ padding: "0 2rem" }}>
                            <Row>
                                <div className="mb-3">
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
                                        <div className="horizontal-divider pb-2"></div>
                                        <div style={{ padding: "0 2rem" }}>
                                            <Row className="mb-3">
                                                <Form.Group as={Col} md="6" controlId="validationCustom02">
                                                    <Form.Label>Name of Pickup Point</Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
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
                                                <Form.Group as={Col} md="3" controlId="validationCustom02">
                                                    <Form.Label>Pickup City</Form.Label>
                                                    <Typeahead
                                                        id="pickupCity"
                                                        onChange={setPickupCitySelection}
                                                        className="form-group"
                                                        options={cityRefs}
                                                        selected={pickupCity}
                                                        required="true"
                                                    />
                                                    { !pickupCityRequired && pickupCitySelection[0] ? <span style={{ color: "green" }}>Looks good!</span> :
                                                        <span  style={{ fontSize: "0.875em", color: "#dc3545" }}>
                                                            Please enter Client Contact Type.
                                                        </span>
                                                    }
                                                </Form.Group>
                                            </Row>
                                            <div className="horizontal-divider pb-4"></div>
                                            <Row>
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
                                                    <Form.Control    
                                                        type="text"
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
                                        </div>
                                    </div>
                                    {/* Address Block ends */}

                                    {/* Contact Block starts */}
                                    <div>
                                        <div style={{ padding: "0 2rem" }}>
                                            <Row className="mb-3">
                                                <Form.Group as={Col} md="3" controlId="validationCustom02">
                                                    <Form.Label>Contact Type</Form.Label>
                                                    <Form.Select
                                                        className="chosen-single form-select"
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
                                                <Form.Group as={Col} md="4" controlId="validationCustom02">
                                                    <Form.Label>Contact Name</Form.Label>
                                                    <Form.Control
                                                        required
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
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <Form.Label>Contact Phone Number</Form.Label>
                                                    <InputGroup>
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
                                                <Form.Group as={Col} md="4" controlId="validationCustom04">
                                                    <Form.Label>Client Email Address</Form.Label>
                                                    <Form.Control
                                                        type="text"
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
                                            <div className="horizontal-divider pb-2"></div>
                                        </div>
                                    </div>
                                    {/* Contact Block ends */}

                                    {/* Form Submit Buttons Block Starts */}
                                    <Row className="mt-5">
                                        <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {Router.push("/employers-dashboard/locations"); }}
                                                className="btn btn-back btn-sm text-nowrap m-1"
                                            >
                                                Back to Locations
                                            </Button>
                                        </Form.Group>
                                        <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mx-3 mb-3 px-4">
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
                            : "" }
                        </div>
                    </div>
            </Form>
        </>
    );
};

export default AddLocation;
