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
import Spinner from "../../../../spinner/spinner";

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

const addLocationContactFields = {
    // contact details
    contactName: "",
    contactPhone: "",
    contactEmail: ""
};

const AddLocationContactPopup = ({ setIsLocationContactSaved, isLocationContactSaved, isLocationContactType, locationNumber }) => {
    const user = useSelector((state) => state.candidate.user);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

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
        setIsLoading(true);
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

    const addNewLocationContact = async (
        {
            // contact details
            contactName,
            contactPhone,
            contactEmail
        },
        setLocationContactFormData,
        user
    ) => 
    {
        setIsLoading(true);
        setLoadingText("Saving location contact details...");
        if(locationNumber && isLocationContactType && contactName && contactPhone) {
            // saving location contact data
            const { data: locationContactData, error: locationContactError } = await supabase.from("location_contact").insert([
                {
                    // location contact details
                    location_number: locationNumber,
                    contact_type: isLocationContactType,
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
                // open toast
                toast.success("New " + isLocationContactType + " contact saved successfully", {
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
                setIsLocationContactSaved(true);
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
                <Spinner isLoading={isLoading} loadingText={loadingText} />
                <div>
                    <div>
                        <Row>
                            {/* Contact Block starts */}
                            <div>
                                <div>
                                    <div style={{ padding: "0.5rem" }}>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} lg="12" controlId="validationCustom02">
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
                                                    </span>Contact Type</Form.Label>
                                                <Form.Control
                                                    size="sm"
                                                    disabled
                                                    className="chosen-single form-select"
                                                    value={isLocationContactType}
                                                    required
                                                />
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Form.Group as={Col} lg="12" controlId="validationCustom02">
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
                                                    </span>Contact Name</Form.Label>
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
                                            <Form.Group as={Col} lg="12" controlId="validationCustomPhonenumber">
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
                                                    </span>Contact Phone Number</Form.Label>
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
                                            <Form.Group as={Col} lg="12" controlId="validationCustom04">
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
                                            <Form.Group as={Col} lg="12" className="chosen-single form-input chosen-container mt-3">
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
                                </div>
                            </div>
                            {/* Contact Block ends */}
                        </Row>
                    </div>
                </div>
            </Form>
        </>
    );
};

export default AddLocationContactPopup;
