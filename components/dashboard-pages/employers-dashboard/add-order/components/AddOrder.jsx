/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../../../../config/supabaseClient";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import { Typeahead } from "react-bootstrap-typeahead";
import { envConfig } from "../../../../../config/env";
import { Button, Col, Collapse, Form, InputGroup, Row } from "react-bootstrap";
import Router from "next/router";
import CalendarComp from "../../../../../components/date/CalendarComp";
import format from "date-fns/format";
import AddLocationPopup from "../../add-location/components/AddLocationPopup";
import AddLocationContactPopup from "../../add-location/components/AddLocationContactPopup";
import { Grid } from "react-loader-spinner";


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
    weight: 0,
    priority: "",
    specialOfferedFreight: 0,
    notes: "",
    freightNotes: ""
};

const AddOrder = () => {
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector((state) => state.candidate.user);
    const [pickupDate, setPickupDate] = useState(new Date());
    const [isLocationSaved, setIsLocationSaved] = useState(false);
    const [isLocationContactSaved, setIsLocationContactSaved] = useState(false);
    const [isLocationContactType, setIsLocationContactType] = useState("");
    const [locationNumber, setLocationNumber] = useState("");

    // client fields states
    const [fetchedClientsData, setFetchedClientsData] = useState({});

    // client details selection states
    const [clientNames, setClientNames] = useState([]);
    const [selectedClientNumber, setSelectedClientNumber] = useState({});
    const [selectedClient, setSelectedClient] = useState([]);
    const [selectedClientData, setSelectedClientData] = useState("");

    // pickup point details selection states
    const [pickupPointNames, setPickupPointNames] = useState([]);
    const [pickupLocationData, setPickupLocationData] = useState("");
    const [selectedPickupPoint, setSelectedPickupPoint] = useState([]);
    const [selectedPickupPointData, setSelectedPickupPointData] = useState("");
    const [open, setOpen] = useState(false);

    // pickup point contact details selection states
    const [pickupMarketingContactNames, setPickupMarketingContactNames] = useState([]);
    const [selectedPickupMarketingContact, setSelectedPickupMarketingContact] = useState([]);
    const [pickupDispatchContactNames, setPickupDispatchContactNames] = useState([]);
    const [selectedPickupDispatchContact, setSelectedPickupDispatchContact] = useState([]);
    const [pickupLocationContactData, setPickupLocationContactData] = useState("");
    // const [selectedPickupPointData, setSelectedPickupPointData] = useState("");

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

    const [cityRefs, setCityRefs] = useState([]);
    const [dropCitySelection, setDropCitySelection] = useState([]);
    const [pickupCitySelection, setPickupCitySelection] = useState([]);
    const [validated, setValidated] = useState(false);
    const [checkAllRefs, setCheckAllRefs] = useState(false);
    const [orderCityReferenceOptions, setOrderCityReferenceOptions] = useState([]);
    const [cityReferenceOptions, setCityReferenceOptions] = useState(null);
    const [sizeReferenceOptions, setSizeReferenceOptions] = useState(null);
    const [materialTypeReferenceOptions, setMaterialTypeReferenceOptions] = useState(null);
    const [priorityReferenceOptions, setPriorityReferenceOptions] = useState(null);


    async function getPickupPointDetails() {
        if(pickupCitySelection[0]) {
            try {
                setIsLoading(true);
                let { data: pickupLocationData, error } = await supabase
                    .from("location")
                    .select("*")
                    .eq("location_type", "Pickup")
                    .eq("pickup_city", pickupCitySelection[0]);

                if (pickupLocationData) {
                    setPickupLocationData(pickupLocationData);

                    // set pickup names
                    const allPickupNames = [];
                    for (let i = 0; i < pickupLocationData.length; i++) {
                        allPickupNames.push(pickupLocationData[i].name_of_pickup_point);
                    }
                    allPickupNames.sort();
                    setPickupPointNames(allPickupNames);

                    if (isLocationSaved) {
                        document.getElementById("addLocationModalCloseButton").click();
                        setIsLocationSaved(false);
                    }
                }

            } catch (e) {
                toast.error(
                    "System is unavailable.  Unable to fetch location Data.  Please try again later or contact tech support!",
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
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        getPickupPointDetails();
    }, [pickupCitySelection, isLocationSaved]);

    async function getPickupLocationContactData() {
        if (selectedPickupPointData && selectedPickupPointData.location_number) {
            // get location contact details
            try {
                setIsLoading(true);
                let { data: pickupLocationContactData, error } = await supabase
                    .from("location_contact")
                    .select("*")
                    .eq("location_number", selectedPickupPointData.location_number);

                if (pickupLocationContactData) {
                    setPickupLocationContactData(pickupLocationContactData);

                    // set pickup names
                    const allPickupMarketingContactNames = [];
                    const allPickupDispatchContactNames = [];
                    for (let i = 0; i < pickupLocationContactData.length; i++) {
                        if (pickupLocationContactData[i].contact_type === "Marketing") {
                            allPickupMarketingContactNames.push(pickupLocationContactData[i].contact_name + " - " + pickupLocationContactData[i].contact_phone);
                        } else {
                            allPickupDispatchContactNames.push(pickupLocationContactData[i].contact_name + " - " + pickupLocationContactData[i].contact_phone);
                        }
                    }
                    allPickupMarketingContactNames.sort();
                    allPickupDispatchContactNames.sort();
                    setPickupMarketingContactNames(allPickupMarketingContactNames);
                    setPickupDispatchContactNames(allPickupDispatchContactNames);

                    if (isLocationContactSaved) {
                        document.getElementById("addLocationContactModalCloseButton").click();
                        setIsLocationContactSaved(false);
                    }
                }

            } catch (e) {
                toast.error(
                    "System is unavailable.  Unable to fetch location Data.  Please try again later or contact tech support!",
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
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        getPickupLocationContactData();
    }, [selectedPickupPointData, isLocationContactSaved]);

    async function getSelectedPickupPointData() {
        if(pickupLocationData && pickupLocationData.length > 0) {
            setIsLoading(true);
            const findSelectedPickupData = pickupLocationData.find((i) => i.name_of_pickup_point === selectedPickupPoint[0]);
            setSelectedPickupPointData(findSelectedPickupData);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getSelectedPickupPointData();
    }, [selectedPickupPoint]);

    async function getClientDetails() {
        if (orderCity) {
            // fetch client addresses and contacts data
            try {
                setIsLoading(true);

                let { data: clientData, error } = await supabase
                    .from("client")
                    .select("*")
                    .eq("city", orderCity);

                if (clientData) {
                    setFetchedClientsData(clientData);

                    // set client names
                    const allClientNames = [];
                    for (let i = 0; i < clientData.length; i++) {
                        allClientNames.push(clientData[i].client_name);
                    }
                    allClientNames.sort();
                    setClientNames(allClientNames);
                }
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
            finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        getClientDetails();
    }, [orderCity]);

    function getSelectedClientData() {
        if (fetchedClientsData && fetchedClientsData.length > 0) {
            setIsLoading(true);
            const findSelectedClientData = fetchedClientsData.find((client) => client.client_name === selectedClient[0]);
            setSelectedClientData(findSelectedClientData);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getSelectedClientData();
    }, [selectedClient]);

    async function getReferences() {
        setIsLoading(true);
        // call reference to get orderCity options
        const { data: orderCityRefData, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "orderCity");

        if (orderCityRefData) {
            const orderCityNames = [];
            for (let i = 0; i < orderCityRefData.length; i++) {
                orderCityNames.push(orderCityRefData[i].ref_dspl);
            }
            orderCityNames.sort();
            setOrderCityReferenceOptions(orderCityNames);
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

        // call reference to get materialType options
        const { data: materialTypeRefData, error: materialErr } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "materialType");

        if (materialTypeRefData) {
            setMaterialTypeReferenceOptions(materialTypeRefData);
        }

        // call reference to get size options
        const { data: sizeRefData, error: sizeErr } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "size");

        if (sizeRefData) {
            setSizeReferenceOptions(sizeRefData);
        }

        // call reference to get priority options
        const { data: priorityRefData, error: priorityErr } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "priority");

        if (priorityRefData) {
            setPriorityReferenceOptions(priorityRefData);
        }
    };

    async function checkAllRefsData() {
        setIsLoading(true);
        if (
            cityRefs &&
            orderCityReferenceOptions &&
            cityReferenceOptions &&
            materialTypeReferenceOptions &&
            sizeReferenceOptions &&
            priorityReferenceOptions
        ) {
            setCheckAllRefs(true);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getReferences();
    }, []);

    useEffect(() => {
        // validate refs data
        checkAllRefsData();
    }, [cityRefs &&
        orderCityReferenceOptions &&
        cityReferenceOptions &&
        materialTypeReferenceOptions &&
        sizeReferenceOptions &&
        priorityReferenceOptions]
    );

    function checkRequiredFields() {
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
        setIsLoading(true);

        if (checkRequiredFields()) {
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
                        pickup_date: format(pickupDate, "yyyy-MM-dd"),
                        order_city: orderCity,
                        client_name: selectedClient[0],
                        pickup_location: pickupCitySelection[0],
                        drop_location: dropCitySelection[0],
                        pickup_point_name: selectedPickupPoint[0],
                        // dropping_point_name: nameOfDroppingPoint,
                        marketing_contact: selectedPickupMarketingContact[0],
                        dispatch_contact: selectedPickupDispatchContact[0],
                        material: material,
                        size: size,
                        quantity: quantity,
                        weight: weight,
                        priority: priority,
                        special_offered_freight: specialOfferedFreight,
                        notes: notes,
                        freight_notes: freightNotes,
                        status: "Under pickup process",
                        order_created_by: user.id
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
                    setIsLoading(false);
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
                    setSelectedClient([]);
                    setPickupCitySelection([]);
                    setDropCitySelection([]);
                    setSelectedPickupPoint([]);
                    setSelectedPickupMarketingContact([]);
                    setSelectedPickupDispatchContact([]);
                    setPickupDate(new Date());
                    setIsLoading(false);
                }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while placing Order, Please try again later or contact tech support",
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
            setIsLoading(false);
        }
    };

    return (
        <>
            { checkAllRefs ?
            <Form validated={validated}>
                { isLoading ?
                    <div style={{
                        height: "100%",
                        width: "100%",
                        position: "absolute",
                        background: "rgba(0, 0, 0, 0.3)",
                        zIndex: "1000",
                        paddingTop: "30%",
                        paddingLeft: "50%",
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
                                        setSelectedClient([]);
                                    }}
                                    value={orderCity}
                                >
                                    <option value=""></option>
                                    {orderCityReferenceOptions.map(
                                        (option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignor's GST Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Client Name</Form.Label>
                                <Typeahead
                                    id="clientName"
                                    disabled = {!orderCity}
                                    onChange={setSelectedClient}
                                    className="form-group"
                                    options={clientNames}
                                    selected={selectedClient}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                {/* { isLoading ?
                                    <div style={{ width: "20%", margin: "auto", marginTop: "-35px", position: "relative" }}>
                                        <Grid
                                            visible={true}
                                            height="30"
                                            width="30"
                                            color="#4fa94d"
                                            ariaLabel="grid-loading"
                                            radius="12.5"
                                            wrapperStyle={{}}
                                            wrapperClass="grid-wrapper"
                                        />
                                    </div> : ""
                                } */}
                                {selectedClientData ?
                                    <>
                                        <div className="optional">
                                            <span>{selectedClientData.address1 ? selectedClientData.address1 + ", " : ""}</span>
                                            <span>{selectedClientData.address2 ? selectedClientData.address2 + ", " : ""}</span>
                                            <span>{selectedClientData.area ? selectedClientData.area + ", " : ""}</span>
                                            <span>{selectedClientData.city ? selectedClientData.city + ", " : ""}</span>
                                            <span>{selectedClientData.state ? selectedClientData.state + ", " : ""}</span>
                                            <span>{selectedClientData.pin ? selectedClientData.pin : ""}</span>
                                        </div>
                                    </>
                                :  ""}
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
                                <CalendarComp setDate={setPickupDate} date1={pickupDate} />
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Pickup Location</Form.Label>
                                <Typeahead
                                    id="pickupLocation"
                                    onChange={(e) => {
                                        setPickupCitySelection(e);
                                        setSelectedPickupPoint([]);
                                        setSelectedPickupMarketingContact([]);
                                        setSelectedPickupDispatchContact([]);
                                    }}
                                    className="form-group"
                                    options={cityRefs}
                                    selected={pickupCitySelection}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>
                                    <ul className="option-list">
                                        Name of Pickup Point
                                        <li className="mx-2">
                                            { pickupCitySelection[0] ? 
                                                <button>
                                                    <a
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addLocationModal"
                                                    >
                                                        <span className="la la-plus"></span>
                                                    </a>
                                                </button>
                                            : "" }
                                        </li>
                                    </ul>
                                </Form.Label>
                                <Typeahead
                                    id="pickupPoint"
                                    disabled = {!pickupCitySelection[0]}
                                    onChange={setSelectedPickupPoint}
                                    className="form-group"
                                    options={pickupPointNames}
                                    selected={selectedPickupPoint}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                {selectedPickupPointData ?
                                    <>
                                        <div className="optional">
                                            <span>{selectedPickupPointData.address1 ? selectedPickupPointData.address1 + ", " : ""}</span>
                                            <span>{selectedPickupPointData.address2 ? selectedPickupPointData.address2 + ", " : ""}</span>
                                            <span>{selectedPickupPointData.area ? selectedPickupPointData.area + ", " : ""}</span>
                                            <span>{selectedPickupPointData.city ? selectedPickupPointData.city + ", " : ""}</span>
                                            <span>{selectedPickupPointData.state ? selectedPickupPointData.state + ", " : ""}</span>
                                            <span>{selectedPickupPointData.pin ? selectedPickupPointData.pin : ""}</span>
                                        </div>
                                    </>
                                : ""}
                            </Form.Group>
                        </Row>
                        <Row className="my-3">
                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                <Form.Label>
                                    <ul className="option-list">
                                        Marketing Contact 
                                        <li className="mx-2">
                                            { selectedPickupPoint[0] ? 
                                                <button>
                                                    <a
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addLocationContactModal"
                                                        onClick={() => {
                                                            setIsLocationContactType("Marketing");
                                                            setLocationNumber(selectedPickupPointData.location_number);
                                                        }}
                                                    >
                                                        <span className="la la-plus"></span>
                                                    </a>
                                                </button>
                                            : "" }
                                        </li>
                                    </ul>
                                </Form.Label>
                                <Typeahead
                                    id="marketingContact"
                                    disabled = {!pickupCitySelection[0]}
                                    onChange={setSelectedPickupMarketingContact}
                                    className="form-group"
                                    options={pickupMarketingContactNames}
                                    selected={selectedPickupMarketingContact}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom03">
                                <Form.Label>
                                    <ul className="option-list">
                                        Dispatch Contact 
                                        <li className="mx-2">
                                            { selectedPickupPoint[0] ? 
                                                <button>
                                                    <a
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addLocationContactModal"
                                                        onClick={() => {
                                                            setIsLocationContactType("Dispatch");
                                                            setLocationNumber(selectedPickupPointData.location_number);
                                                        }}
                                                    >
                                                        <span className="la la-plus"></span>
                                                    </a>
                                                </button>
                                            : "" }
                                        </li>
                                    </ul>
                                </Form.Label>
                                <Typeahead
                                    id="marketingContact"
                                    disabled = {!pickupCitySelection[0]}
                                    onChange={setSelectedPickupDispatchContact}
                                    className="form-group"
                                    options={pickupDispatchContactNames}
                                    selected={selectedPickupDispatchContact}
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

                {/* All Popup Modals */}
                {/* Add Location Modal */}
                <div
                    className="modal fade"
                    id="addLocationModal"
                    tabIndex="-1"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="apply-modal-content modal-content" style={{ overflow: "auto" }}>
                            <div className="text-center">
                                <button
                                    type="button"
                                    id="addLocationModalCloseButton"
                                    className="closed-modal"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <AddLocationPopup
                                setIsLocationSaved={setIsLocationSaved}
                                isLocationSaved={isLocationSaved}
                            />
                        </div>
                        {/* End .send-private-message-wrapper */}
                    </div>
                </div>
                {/* End of Add Location Modal */}

                {/* Add Location Contact Modal */}
                <div
                    className="modal fade"
                    id="addLocationContactModal"
                    tabIndex="-1"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="apply-modal-content modal-content" style={{ overflow: "auto" }}>
                            <div className="text-center">
                                <button
                                    type="button"
                                    id="addLocationContactModalCloseButton"
                                    className="closed-modal"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <AddLocationContactPopup
                                setIsLocationContactSaved={setIsLocationContactSaved}
                                isLocationContactSaved={isLocationContactSaved}
                                isLocationContactType={isLocationContactType}
                                locationNumber={locationNumber}
                            />
                        </div>
                        {/* End .send-private-message-wrapper */}
                    </div>
                </div>
                {/* End of Add Location Contact Modal */}
            </Form>
            :   ""
            }
            { isLoading && !checkAllRefs ?
                <div style={{
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                    background: "rgba(0, 0, 0, 0.3)",
                    zIndex: 1000,
                    paddingTop: "30%",
                    paddingLeft: "50%",
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

export default AddOrder;
