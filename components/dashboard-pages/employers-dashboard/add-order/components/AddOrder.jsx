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
import CalendarComp from "../../../../../components/date/CalendarComp";
import format from "date-fns/format";


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

const addOrderFields = {
    orderCity: "",
    clientName: "",
    pickupLocation: "",
    dropLocation: "",
    nameOfPickupPoint: "",
    nameOfDroppingPoint: "",
    marketingContact: "",
    dispatchContact: "",
    material: "",
    size: "",
    quantity: "",
    weight: null,
    priority: "",
    specialOfferedFreight: null,
    notes: "",
    freightNotes: ""
};
const AddOrder = () => {
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
    const [orderFormData, setOrderFormData] = useState(
        JSON.parse(JSON.stringify(addOrderFields))
    );
    const {
        orderCity,
        clientName,
        pickupLocation,
        dropLocation,
        nameOfPickupPoint,
        nameOfDroppingPoint,
        marketingContact,
        dispatchContact,
        material,
        size,
        quantity,
        weight,
        priority,
        specialOfferedFreight,
        notes,
        freightNotes
    } = useMemo(() => orderFormData, [orderFormData]);

    const searchInput = useRef(null);

    const [singleSelections, setSingleSelections] = useState([]);
    const [cityRefs, setCityRefs] = useState([]);
    const [dropCitySelection, setDropCitySelection] = useState([]);
    const [pickupCitySelection, setPickupCitySelection] = useState([]);
    const [validated, setValidated] = useState(false);
    const [checkAllRefs, setCheckAllRefs] = useState(false);
    const [formValidatedSuccessfully, setFormValidatedSuccessfully] = useState(false);
    const [lRStatusReferenceOptions, setLRStatusReferenceOptions] = useState(null);
    const [orderCityReferenceOptions, setOrderCityReferenceOptions] = useState(null);
    const [cityReferenceOptions, setCityReferenceOptions] = useState(null);
    const [sizeReferenceOptions, setSizeReferenceOptions] = useState(null);
    const [materialTypeReferenceOptions, setMaterialTypeReferenceOptions] = useState(null);
    const [priorityReferenceOptions, setPriorityReferenceOptions] = useState(null);

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

    async function getReferences() {
        // call reference to get lrStatus options
        const { data: orderCityRefData, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "orderCity");

        if (orderCityRefData) {
            setOrderCityReferenceOptions(orderCityRefData);
        }

        // call reference to get city options
        const { data: cityRefData, error: err } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "city");

        if (cityRefData) {
            setCityReferenceOptions(cityRefData);
            const cityNames = [];
            for (let i = 0; i < cityRefData.length; i++) {
                cityNames.push(cityRefData[i].ref_dspl);
            }
            cityNames.sort();
            setCityRefs(cityNames);
        }

        // call reference to get lrStatus options
        const { data: materialTypeRefData, error: materialErr } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "materialType");

        if (materialTypeRefData) {
            setMaterialTypeReferenceOptions(materialTypeRefData);
        }

        // call reference to get lrStatus options
        const { data: sizeRefData, error: sizeErr } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "size");

        if (sizeRefData) {
            setSizeReferenceOptions(sizeRefData);
        }

        // call reference to get lrStatus options
        const { data: priorityRefData, error: priorityErr } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "priority");

        if (priorityRefData) {
            setPriorityReferenceOptions(priorityRefData);
        }

    };

    async function checkAllRefsData() {
        if (
            cityRefs &&
            orderCityReferenceOptions &&
            cityReferenceOptions &&
            materialTypeReferenceOptions &&
            sizeReferenceOptions &&
            priorityReferenceOptions
        ) {
            setCheckAllRefs(true);
        }
    };

    useEffect(() => {
        getReferences();
    }, []);

    useEffect(() => {
        // validate refs data
        checkAllRefsData();
    }, [cityRefs,
        orderCityReferenceOptions,
        cityReferenceOptions,
        materialTypeReferenceOptions,
        sizeReferenceOptions,
        priorityReferenceOptions]
    );

    // useEffect(() => {
    //     jobData.facility = facilitySingleSelections[0];
    // }, [facilitySingleSelections]);

    // useEffect(() => {
    //     jobData.completeAddress = singleSelections[0];
    // }, [singleSelections]);

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

    function checkRequiredFields(pickupDate) {
        if(pickupDate && material && size && priority) {
            return true;
        } else {
            setValidated(true);
            return false;
        }
    };

    const addNewOrder = async (
        {
            orderCity,
            clientName,
            pickupLocation,
            dropLocation,
            nameOfPickupPoint,
            nameOfDroppingPoint,
            marketingContact,
            dispatchContact,
            material,
            size,
            quantity,
            weight,
            priority,
            specialOfferedFreight,
            notes,
            freightNotes
        },
        setOrderFormData,
        user
    ) => {

        // get pickup date from local storage
        const pickupDate = localStorage.getItem("calendar");

        if (checkRequiredFields(pickupDate)) {
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

                const { data, error } = await supabase.from("orders").insert([
                    {
                        lr_number: lrNumber,
                        order_number: orderNumber,
                        pickup_date: pickupDate,
                        order_city: orderCity,
                        client_name: clientName,
                        pickup_location: pickupCitySelection[0],
                        drop_location: dropCitySelection[0],
                        pickup_point_name: nameOfPickupPoint,
                        dropping_point_name: nameOfDroppingPoint,
                        marketing_contact: marketingContact,
                        dispatch_contact: dispatchContact,
                        material: material,
                        size: size,
                        quantity: quantity,
                        weight: weight,
                        priority: priority,
                        special_offered_freight: specialOfferedFreight,
                        notes: notes,
                        freight_notes: freightNotes,
                        status: "Under pickup process"
                    },
                ]);
                if (error) {
                    // open toast
                    toast.error(
                        "Error while placing order details, Please try again later or contact tech support",
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
                    toast.success("Order placed successfully", {
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

                    setOrderFormData(JSON.parse(JSON.stringify(addOrderFields)));
                    setValidated(false);
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

            if (!material) {
                setOrderFormData(() => ({
                    material: ""
                }));
            };
            if (!size) {
                setOrderFormData(() => ({
                    size: ""
                }));
            };
            if (!priority) {
                setOrderFormData(() => ({
                    priority: ""
                }));
            };
        }
    };

    return (
        <>
            { checkAllRefs ? <Form validated={validated}>
                {/* General Details Block starts */}
                <div>
                    <div className="divider divider-general">
                        <span><b>General</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>Order City</Form.Label>
                                <Form.Select
                                    className="chosen-single form-select"
                                    size="md"
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            orderCity: e.target.value,
                                        }));
                                    }}
                                    value={orderCity}
                                >
                                    <option value=""></option>
                                    {orderCityReferenceOptions.map(
                                        (option) => (
                                            <option key={option.ref_cd} value={option.ref_dspl}>
                                                {option.ref_dspl}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignor's GST Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                <Form.Label>Client Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="order-client-name"
                                    // placeholder="Username"
                                    aria-describedby="inputGroupPrepend"
                                    // required
                                    value={clientName}
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            clientName: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* General Details Block ends */}

                {/* Pickup Details Block starts */}
                <div>
                    <div className="divider divider-general">
                        <span><b>Pickup</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Pickup Date</Form.Label><br />
                                <CalendarComp />
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Pickup Location</Form.Label>
                                <Typeahead
                                    id="pickupLocation"
                                    onChange={setPickupCitySelection}
                                    className="form-group"
                                    options={cityRefs}
                                    selected={pickupCitySelection}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>Name of Pickup Point</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="order-pickup-point"
                                    // placeholder="GST number"
                                    // defaultValue="Otto"
                                    value={nameOfPickupPoint}
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            nameOfPickupPoint: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                <Form.Label>Marketing Contact</Form.Label>
                                <Form.Control
                                    type="text"
                                    // placeholder="Username"
                                    aria-describedby="inputGroupPrepend"
                                    name="order-marketing-contact"
                                    // required
                                    value={marketingContact}
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            marketingContact: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom03">
                                <Form.Label>Dispatch Contact</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="order-dispatch-contact"
                                    value={dispatchContact}
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            dispatchContact: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Pickup Details Block ends */}

                {/* Drop Details Block starts */}
                <div>
                    <div className="divider divider-other">
                        <span><b>Drop</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Drop Location</Form.Label>
                                <Typeahead
                                    id="dropLocation"
                                    onChange={setDropCitySelection}
                                    className="form-group"
                                    options={cityRefs}
                                    selected={dropCitySelection}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>Name of Dropping Party</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="order-dropping-party"
                                    // placeholder="To"
                                    // defaultValue="Otto"
                                    value={nameOfDroppingPoint}
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            nameOfDroppingPoint: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Drop Details Block ends */}

                {/* Material Details starts */}
                <div>
                    <div className="divider divider-material">
                        <span><b>Material Details</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Material</Form.Label>
                                <Form.Select
                                    required
                                    className="chosen-single form-select"
                                    size="md"
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            material: e.target.value,
                                        }));
                                    }}
                                    value={material}
                                >
                                    <option value=""></option>
                                    {materialTypeReferenceOptions.map(
                                        (option) => (
                                            <option key={option.ref_cd} value={option.ref_dspl}>
                                                {option.ref_dspl}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please select order material type.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Size</Form.Label>
                                <Form.Select
                                    required
                                    className="chosen-single form-select"
                                    size="md"
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            size: e.target.value,
                                        }));
                                    }}
                                    value={size}
                                >
                                    <option value=""></option>
                                    {sizeReferenceOptions.map(
                                        (option) => (
                                            <option key={option.ref_cd} value={option.ref_dspl}>
                                                {option.ref_dspl}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please select order size.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Priority</Form.Label>
                                <Form.Select
                                    required
                                    className="chosen-single form-select"
                                    size="md"
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            priority: e.target.value,
                                        }));
                                    }}
                                    value={priority}
                                >
                                    <option value=""></option>
                                    {priorityReferenceOptions.map(
                                        (option) => (
                                            <option key={option.ref_cd} value={option.ref_dspl}>
                                                {option.ref_dspl}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please select order priority.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="validationCustom01">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="order-quantity"
                                    // placeholder="Material Details"
                                    // defaultValue="Mark"
                                    value={quantity}
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            quantity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Weight(Kg)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="order-weight"
                                    // placeholder="Weight"
                                    // defaultValue="Otto"
                                    value={weight}
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            weight: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Special Offered Freight</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="order-special-offered-freight"
                                    // placeholder="Weight"
                                    // defaultValue="Otto"
                                    value={specialOfferedFreight}
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            specialOfferedFreight: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Material Details ends */}

                {/* Additional Details starts */}
                <div>
                    <div className="divider divider-additional">
                        <span><b>Additional Details</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="validationCustom01">
                                <Form.Label>Notes</Form.Label><br />
                                <textarea
                                    value={notes}
                                    id="notes"
                                    cols="20"
                                    rows="2"
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            notes: e.target.value,
                                        }));
                                    }}
                                    style={{
                                        resize: "both",
                                        overflowY: "auto",
                                        border: "1px solid #dee2e6",
                                        padding: "10px",
                                        maxWidth: "300px"
                                    }}
                                ></textarea>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="validationCustom01">
                                <Form.Label>Freight Note</Form.Label><br />
                                <textarea
                                    value={freightNotes}
                                    id="freightNotes"
                                    cols="20"
                                    rows="2"
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            freightNotes: e.target.value,
                                        }));
                                    }}
                                    style={{
                                        resize: "both",
                                        overflowY: "auto",
                                        border: "1px solid #dee2e6",
                                        padding: "10px",
                                        maxWidth: "300px"
                                    }}
                                ></textarea>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
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
                            onClick={() => {Router.push("/employers-dashboard/orders"); }}
                            className="btn btn-back btn-sm text-nowrap m-1"
                        >
                            Back to Order
                        </Button>
                    </Form.Group>
                    <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                        <Button
                            type="submit"
                            variant="success"
                            onClick={(e) => {
                                e.preventDefault();
                                addNewOrder(orderFormData, setOrderFormData, user);
                            }}
                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                        >
                            Place Order
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
            : "" }
        </>
    );
};

export default AddOrder;
