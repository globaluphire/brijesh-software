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

const addLRFields = {
    // Consignor Block Fields
    consignorName: "",
    consignorGST: "",
    consignorPhone: "",
    consignorAddress: "",
    consignorEmail: "",

    // Consignor Block Fields
    consigneeName: "",
    consigneeGST: "",
    consigneePhone: "",
    consigneeAddress: "",
    consigneeEmail: "",

    // Other Block Fields
    fromCity: "",
    toCity: "",
    vehicalNumber: "",
    driverName: "",
    driverPhone: "",

    // Material Details Block Fields
    materialDetails: "",
    weight: ""
};
const AddLR = () => {
    // const [jobTitle, setJobTitle] = useState("");
    // const [jobDesc, setJobDesc] = useState("");
    // const [email, setEmail] = useState("");
    // const [username, setUsername] = useState("");
    // const [specialism, setSpecialism] = useState([]);
    // const [jobType, setJobType] = useState("");
    // const [salary, setSalary] = useState("");
    // const [salaryRate, setSalaryRate] = useState("");
    // const [education, setEducation] = useState("");
    // const [exp, setExp] = useState("");
    // const [gender, setGender] = useState("");
    // const [industy, setIndustry] = useState("");
    // const [qualification, setQualification] = useState("");
    // const [deadline, setDeadline] = useState("");
    // const [country, setCountry] = useState("");
    // const [city, setCity] = useState("");
    // const [address, setAddress] = useState("");
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
    const [lrFormData, setLrFormData] = useState(
        JSON.parse(JSON.stringify(addLRFields))
    );
    const {
        // Consignor Block Fields
        consignorName,
        consignorGST,
        consignorPhone,
        consignorAddress,
        consignorEmail,

        // Consignor Block Fields
        consigneeName,
        consigneeGST,
        consigneePhone,
        consigneeAddress,
        consigneeEmail,

        // Other Block Fields
        fromCity,
        toCity,
        vehicalNumber,
        driverName,
        driverPhone,

        // Material Details Block Fields
        materialDetails,
        weight
    } = useMemo(() => lrFormData, [lrFormData]);

    const searchInput = useRef(null);

    const [singleSelections, setSingleSelections] = useState([]);
    const [facilityNames, setFacilityNames] = useState([]);
    const [facilitySingleSelections, setFacilitySingleSelections] = useState(
        []
    );
    const [validated, setValidated] = useState(false);


    const addresses = [
        "601 Evergreen Rd., Woodburn, OR 97071",
        "160 NE Conifer Blvd., Corvallis, OR 97330",
        "1735 Adkins St., Eugene, OR 97401",
        "1201 McLean Blvd., Eugene, OR 97405",
        "1166 E 28th Ave., Eugene, OR 97403",
        "740 NW Hill Pl., Roseburg, OR 97471",
        "525 W Umpqua St., Roseburg, OR 97471",
        "2075 NW Highland Avenue, Grants Pass, OR 97526",
        "2201 NW Highland Avenue, Grants Pass, OR 97526",
        "2901 E Barnett Rd., Medford, OR 97504",
        "4062 Arleta Ave NE, Keizer,	OR 97303",
        "2350 Oakmont Way, Suite 204, Eugene, OR 97401",
        "1677 Pensacola Street, Honolulu, HI 96822",
        "10503 Timberwood Cir, Suite 200, Louisville, KY 40223",
        "252 LA Hwy 402, Napoleonville, LA 70390",
        "5976 Highway 65N, Lake Providence, LA 71254",
        "1400 Lindberg Street, Slidell, LA 70458",
        "4021 Cadillac Street, New Orleans, LA 70122",
    ];

    async function getFacilityNames() {
        // call reference to get applicantStatus options
        const { data: refData, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "facilityName");

        if (refData) {
            // setFacilityNames(refData)
            const facilities = [];
            for (let i = 0; i < refData.length; i++) {
                facilities.push(refData[i].ref_dspl);
            }
            facilities.sort();
            setFacilityNames(facilities);
        }
    }

    useEffect(() => {
        getFacilityNames();
    }, []);

    useEffect(() => {
        jobData.facility = facilitySingleSelections[0];
    }, [facilitySingleSelections]);

    useEffect(() => {
        jobData.completeAddress = singleSelections[0];
    }, [singleSelections]);

    // init google map script
    const initMapScript = () => {
        // if script already loaded
        if (window.google) {
            return Promise.resolve();
        }
        const src = `${mapApiJs}?key=${apiKey}&libraries=places&v=weekly`;
        return loadAsyncScript(src);
    };

    // do something on address change
    const onChangeAddress = (autocomplete) => {
        const location = autocomplete.getPlace();
        setJobData((previousState) => ({
            ...previousState,
            address: searchInput.current.value,
        }));
    };

    // init autocomplete
    const initAutocomplete = () => {
        if (!searchInput.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(
            searchInput.current,
            {
                types: ["(cities)"],
            }
        );
        autocomplete.setFields(["address_component", "geometry"]);
        autocomplete.addListener("place_changed", () =>
            onChangeAddress(autocomplete)
        );
    };

    // load map script after mounted
    useEffect(() => {
        initMapScript().then(() => initAutocomplete());
    }, []);
    /*
  const specialisms = [
    { value: "Banking", label: "Banking" },
    { value: "Digital & Creative", label: "Digital & Creative" },
    { value: "Retail", label: "Retail" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Managemnet", label: "Managemnet" },
    { value: "Accounting & Finance", label: "Accounting & Finance" },
    { value: "Digital", label: "Digital" },
    { value: "Creative Art", label: "Creative Art" },
    { value: "Engineer", label: "Engineer" },
  ];
 */
    function checkRequiredFields(lrFormData) {
        if (
            // Consignor Block Fields
            consignorName &&
            consignorGST &&
            consignorAddress &&

            // Consignor Block Fields
            consigneeName &&
            consigneeGST &&
            consigneeAddress &&

            // Other Block Fields
            fromCity &&
            toCity &&
            vehicalNumber &&
            driverName &&
            driverPhone &&

            // Material Details Block Fields
            materialDetails &&
            weight
        ) {
            return true;
        } else {
            return false;
        }
    };

    const addNewLR = async (
        {
            // Consignor Block Fields
            consignorName,
            consignorGST,
            consignorPhone,
            consignorAddress,
            consignorEmail,

            // Consignor Block Fields
            consigneeName,
            consigneeGST,
            consigneePhone,
            consigneeAddress,
            consigneeEmail,

            // Other Block Fields
            fromCity,
            toCity,
            vehicalNumber,
            driverName,
            driverPhone,

            // Material Details Block Fields
            materialDetails,
            weight
        },
        setLrFormData,
        user
    ) => {
        if (checkRequiredFields(lrFormData)) {
            try {
                // Generate LR Number
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

                const { data: sysKeyLRData, error: sysKeyLRError } = await supabase
                    .from("sys_key")
                    .select("sys_seq_nbr")
                    .eq("key_name", "lr_number");

                let lrSeqNbr = sysKeyLRData[0].sys_seq_nbr + 1;
                if (lrSeqNbr < 10) {
                    lrSeqNbr = "00" + lrSeqNbr;
                } else if(lrSeqNbr < 100) {
                    lrSeqNbr = "0" + lrSeqNbr;
                }
                const lrNumber = "RLR" + "" + date + "" + month + "" + year.toString().substring(2) + "" + lrSeqNbr;

                // New Order Number
                const { data: sysKeyOrderData, error: sysKeyError } = await supabase
                    .from("sys_key")
                    .select("sys_seq_nbr")
                    .eq("key_name", "order_number");

                let orderSeqNbr = sysKeyOrderData[0].sys_seq_nbr + 1;
                if (orderSeqNbr < 10) {
                    orderSeqNbr = "00" + orderSeqNbr;
                } else if(orderSeqNbr < 100) {
                    orderSeqNbr = "0" + orderSeqNbr;
                }
                const orderNumber = "ORD" + "" + date + "" + month + "" + year.toString().substring(2) + "" + orderSeqNbr;

                console.log(orderNumber, " ", lrNumber);
                const { data, error } = await supabase.from("lr").insert([
                    {
                        lr_number: lrNumber, // add logic to create automatic Unique number, ex. RLR(YY)(MM)(DD)(incremented 3 number digit)
                        order_number: orderNumber, // add logic to create automatic Unique number, ex. (3 digit City Code)(YY)(MM)(DD)(incremented 3 number digit)

                        // Consignor Fields
                        consignor: consignorName,
                        pickup_address: consignorAddress,
                        consignor_gst: consignorGST,
                        consignor_email: consignorEmail,
                        consignor_phone: consignorPhone,

                        // Consignee Fields
                        consignee: consigneeName,
                        drop_address: consigneeAddress,
                        consignee_gst: consigneeGST,
                        consignee_email: consigneeEmail,
                        consignee_phone: consigneePhone,

                        // Other Block Fields
                        from_city: fromCity,
                        to_city: toCity,
                        vehical_number: vehicalNumber,
                        driver_name: driverName,
                        driver_phone: driverPhone,

                        // Material Details Block Fields
                        material_details: materialDetails,
                        weight: weight,

                        // Default fields
                        status: "Final"
                    },
                ]);
                if (error) {
                    // open toast
                    toast.error(
                        "Error while saving LR details, Please try again later or contact tech support",
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
                    toast.success("New LR saved successfully", {
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
                        keyname: "lr_number",
                    });
                    // increment order_number key
                    await supabase.rpc("increment_sys_key", {
                        x: 1,
                        keyname: "order_number",
                    });

                    setLrFormData(JSON.parse(JSON.stringify(addLRFields)));
                }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while saving LR details, Please try again later or contact tech support",
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
            <Form noValidate validated={validated}>
                {/* Consigner Block starts */}
                <div>
                    <div className="divider">
                        <span><b>Consignor</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="Consignor"
                                    // defaultValue="Mark"
                                    value={consignorName}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            consignorName: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignor name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>GST Number</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="GST number"
                                    // defaultValue="Otto"
                                    value={consignorGST}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            consignorGST: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignor's GST Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                <Form.Label>Phone Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        // placeholder="Username"
                                        aria-describedby="inputGroupPrepend"
                                        // required
                                        value={consignorPhone}
                                        onChange={(e) => {
                                            setLrFormData((previousState) => ({
                                                ...previousState,
                                                consignorPhone: e.target.value,
                                            }));
                                        }}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="9" controlId="validationCustom03">
                                <Form.Label>Address</Form.Label>
                                <Form.Control 
                                    type="text"
                                    placeholder="Pickup Address"
                                    required
                                    value={consignorAddress}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            consignorAddress: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid Consignor's Address.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom04">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    value={consignorEmail}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            consignorEmail: e.target.value,
                                        }));
                                    }}
                                />
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Consigner Block ends */}

                {/* Consignee Block starts */}
                <div>
                    <div className="divider">
                        <span><b>Consignee</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="Consignee"
                                    // defaultValue="Mark"
                                    value={consigneeName}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            consigneeName: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignee's name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>GST Number</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="GST number"
                                    // defaultValue="Otto"
                                    value={consigneeGST}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            consigneeGST: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignee's GST Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                <Form.Label>Phone Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        // placeholder="Username"
                                        aria-describedby="inputGroupPrepend"
                                        // required
                                        value={consigneePhone}
                                        onChange={(e) => {
                                            setLrFormData((previousState) => ({
                                                ...previousState,
                                                consigneePhone: e.target.value,
                                            }));
                                        }}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="9" controlId="validationCustom03">
                                <Form.Label>Address</Form.Label>
                                <Form.Control    
                                    type="text"
                                    placeholder="Pickup Address"
                                    required
                                    value={consigneeAddress}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            consigneeAddress: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid Consignee's Address.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom04">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    value={consigneeEmail}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            consigneeEmail: e.target.value,
                                        }));
                                    }}
                                />
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Consignee Block ends */}

                {/* Other Block starts */}
                <div>
                    <div className="divider divider-other">
                        <span><b>Other</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="3" controlId="validationCustom01">
                                <Form.Label>From</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="Consignee"
                                    // defaultValue="Mark"
                                    value={fromCity}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            fromCity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment From location.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>To</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="To"
                                    // defaultValue="Otto"
                                    value={toCity}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            toCity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment To location.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Vehical Number</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="GJ011234"
                                    // defaultValue="Otto"
                                    value={vehicalNumber}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            vehicalNumber: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Vehical Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Driver Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="Driver Name"
                                    // defaultValue="Otto"
                                    value={driverName}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            driverName: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment's Driver Name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomDriverPhonenumber">
                                <Form.Label>Driver Phone Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        // placeholder="Driver Phone Number"
                                        aria-describedby="inputGroupPrepend"
                                        required
                                        value={driverPhone}
                                        onChange={(e) => {
                                            setLrFormData((previousState) => ({
                                                ...previousState,
                                                driverPhone: e.target.value,
                                            }));
                                        }}
                                    />
                                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter Consignment's Driver Phone Number.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Other Block ends */}


                {/* Material Details starts */}
                <div>
                    <div className="divider divider-material">
                        <span><b>Material Details</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="validationCustom01">
                                <Form.Label>Material Details</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    // placeholder="Material Details"
                                    // defaultValue="Mark"
                                    value={materialDetails}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            materialDetails: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment Material Details.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Weight(Kg)</Form.Label>
                                <Form.Control
                                    required
                                    type="number"
                                    // placeholder="Weight"
                                    // defaultValue="Otto"
                                    value={weight}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            weight: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment Weight in Kg.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Material Details ends */}

                {/* Form Submit Buttons Block Starts */}
                <Row className="mt-5">
                    <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                        <Button
                            variant="secondary"
                            onClick={() => {Router.push("/employers-dashboard/lr"); }}
                            className="btn btn-back btn-sm text-nowrap m-1"
                        >
                            Back to LR
                        </Button>
                    </Form.Group>
                    <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                        <Button
                            type="submit"
                            variant="success"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit(e);
                                if(validated) {
                                    addNewLR(lrFormData, setLrFormData, user);
                                }
                            }}
                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                        >
                            Add New LR
                        </Button>
                    </Form.Group>
                    {/* <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                        <Button
                            type="submit"
                            variant="success"
                            onClick={() => Router.push("/employers-dashboard/")}
                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                        >
                            Add New LR & Export to PDF
                        </Button>
                    </Form.Group> */}
                </Row>
                {/* Form Submit Buttons Block Ends */}

            </Form>
        </>
    );
};

export default AddLR;
