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
import Spinner from "../../../../spinner/spinner";
import AddClientPopup from "../../add-client/components/AddClientPopup";


const addOrderFields = {
    orderCity: "",
    clientName: "",
    pickupLocation: "",
    dropLocation: "",
    nameOfPickupPoint: "",
    nameOfDroppingPoint: "",
    consignorCity: "",
    consigneeCity: "",
    marketingContact: "",
    dispatchContact: "",
    material: "",
    size: "",
    quantity: "",
    weight: null,
    priority: "",
    specialOfferedFreight: 0,
    notes: "",
    freightNotes: ""
};

const AddOrder = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("");
    const [isLRGenerating, setIsLRGenerating] = useState(false);
    const user = useSelector((state) => state.candidate.user);
    const [pickupDate, setPickupDate] = useState(new Date());
    const [dateDisabled, setDateDisabled] = useState(true);
    const [isLocationSaved, setIsLocationSaved] = useState(false);
    const [isLocationContactSaved, setIsLocationContactSaved] = useState(false);
    const [isLocationContactType, setIsLocationContactType] = useState("");
    const [locationNumber, setLocationNumber] = useState("");
    const [isClient, setIsClient] = useState(false);
    const [isClientSaved, setIsClientSaved] = useState(false);

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
    const [pickupMarketingContactDetails, setPickupMarketingContactDetails] = useState([]);
    const [selectedPickupMarketingContactDetails, setSelectedPickupMarketingContactDetails] = useState([]);
    const [pickupDispatchContactDetails, setPickupDispatchContactDetails] = useState([]);
    const [selectedPickupDispatchContactDetails, setSelectedPickupDispatchContactDetails] = useState([]);
    const [pickupLocationContactData, setPickupLocationContactData] = useState("");

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
        consignorCity,
        consigneeCity,
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

    const [isConsignor, setIsConsignor] = useState(false);
    const [isConsignee, setIsConsignee] = useState(false);
    const [isConsignorSaved, setIsConsignorSaved] = useState(false);
    const [isConsigneeSaved, setIsConsigneeSaved] = useState(false);

    // consignor states
    const [fetchedConsignorClientsData, setFetchedConsignorClientsData] = useState({});
    const [consignorClientNames, setConsignorClientNames] = useState([]);
    const [selectedConsignorClient, setSelectedConsignorClient] = useState([]);
    const [selectedConsignorClientData, setSelectedConsignorClientData] = useState("");

    // consignee states
    const [fetchedConsigneeClientsData, setFetchedConsigneeClientsData] = useState({});
    const [consigneeClientNames, setConsigneeClientNames] = useState([]);
    const [selectedConsigneeClient, setSelectedConsigneeClient] = useState([]);
    const [selectedConsigneeClientData, setSelectedConsigneeClientData] = useState("");

    // start of pick up point details
    async function getPickupPointDetails() {
        if(pickupCitySelection[0]) {
            try {
                setIsLoading(true);
                setLoadingText("Pickup Point Details are Loading...");
                let { data: pickupLocationData, error } = await supabase
                    .from("location")
                    .select("*")
                    .eq("location_type", "Pickup")
                    .eq("location_city", pickupCitySelection[0]);

                if (pickupLocationData) {
                    setPickupLocationData(pickupLocationData);
                    
                    // set pickup names
                    const allPickupNames = [];
                    for (let i = 0; i < pickupLocationData.length; i++) {
                        allPickupNames.push({
                            "pickupName": pickupLocationData[i].name_of_pickup_point,
                            "pickupAddress": pickupLocationData[i].address1 + ", " +
                                            pickupLocationData[i].address2 + ", " +
                                            pickupLocationData[i].area + ", " +
                                            pickupLocationData[i].city + ", " +
                                            pickupLocationData[i].state + ", " +
                                            pickupLocationData[i].pin,
                            "pickupLocationNumber": pickupLocationData[i].location_number
                        });
                    }
                    allPickupNames.sort();
                    setPickupPointNames(allPickupNames);

                    if (isLocationSaved) {
                        document.getElementById("addLocationModalCloseButton").click();
                        setIsLocationSaved(false);
                    }
                    setIsLoading(false);
                    setLoadingText("");
                } else {
                    setIsLoading(false);
                    setLoadingText("");
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
                setLoadingText("Pickup Point Contact Details are Loading...");
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
                            allPickupMarketingContactNames.push({
                                "pickupMarketingContactName": pickupLocationContactData[i].contact_name + "-" + pickupLocationContactData[i].contact_phone,
                                "pickupMarketingContactId": pickupLocationContactData[i].location_contact_id
                            });
                        } else {
                            allPickupDispatchContactNames.push({
                                "pickupDispatchContactName": pickupLocationContactData[i].contact_name + "-" + pickupLocationContactData[i].contact_phone,
                                "pickupDispatchContactId": pickupLocationContactData[i].location_contact_id
                            });
                        }
                    }
                    allPickupMarketingContactNames.sort();
                    allPickupDispatchContactNames.sort();
                    setPickupMarketingContactDetails(allPickupMarketingContactNames);
                    setPickupDispatchContactDetails(allPickupDispatchContactNames);


                    if (isLocationContactSaved) {
                        document.getElementById("addLocationContactModalCloseButton").click();
                        setIsLocationContactSaved(false);
                        setLoadingText("");
                    }
                    setIsLoading(false);
                    setLoadingText("");
                } else {
                    setIsLoading(false);
                    setLoadingText("");
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
            }
        }
    };
    useEffect(() => {
        getPickupLocationContactData();
    }, [selectedPickupPointData, isLocationContactSaved]);

    async function getSelectedPickupPointData() {
        if(pickupLocationData && pickupLocationData.length > 0 && selectedPickupPoint.length > 0) {
            setIsLoading(true);
            setLoadingText("Selected Pickup Point Details are Loading...");
            const findSelectedPickupData = pickupLocationData.find((i) => i.location_number === selectedPickupPoint[0].pickupLocationNumber);
            setSelectedPickupPointData(findSelectedPickupData);
            setIsLoading(false);
            setLoadingText("");
        } else if (selectedPickupPoint.length === 0) {
            setSelectedPickupPointData([]);
        }
    };
    useEffect(() => {
        getSelectedPickupPointData();
    }, [selectedPickupPoint]);
    // end of pick up point details


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

                if (isClientSaved) {
                    document.getElementById("addClientModalCloseButton").click();
                    setIsClientSaved(false);
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
    }, [orderCity, isClientSaved]);

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

    async function getConsignorConsigneeDetails() {
        if (consignorCity) {
            // fetch consignor client addresses and contacts data
            try {
                setIsLoading(true);
                setLoadingText("Consignor Details are Loading...");

                let { data: consignorClientData, error } = await supabase
                    .from("client")
                    .select("*")
                    .eq("city", consignorCity);

                if (consignorClientData) {
                    setFetchedConsignorClientsData(consignorClientData);

                    // set client names
                    const allConsignorClientNames = [];
                    for (let i = 0; i < consignorClientData.length; i++) {
                        allConsignorClientNames.push({
                            "clientName": consignorClientData[i].client_name,
                            "clientAddress": consignorClientData[i].address1 + ", " +
                                            consignorClientData[i].address2 + ", " +
                                            consignorClientData[i].area + ", " +
                                            consignorClientData[i].city + ", " +
                                            consignorClientData[i].state + ", " +
                                            consignorClientData[i].pin,
                            "clientId": consignorClientData[i].client_id
                        });
                    }
                    allConsignorClientNames.sort();
                    setConsignorClientNames(allConsignorClientNames);
                    setIsLoading(false);
                    setLoadingText("");

                    if (isConsignorSaved) {
                        document.getElementById("addClientModalCloseButton").click();
                        setIsConsignorSaved(false);
                    }
                } else {
                    setIsLoading(false);
                    setLoadingText("");
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
                setIsLoading(false);
                setLoadingText("");
            }
        }

        if (consigneeCity) {
            // fetch consignee client addresses and contacts data
            try {
                setIsLoading(true);
                setLoadingText("Consignee Details are Loading...");

                let { data: consigneeClientData, error } = await supabase
                    .from("client")
                    .select("*")
                    .eq("city", consigneeCity);

                if (consigneeClientData) {
                    setFetchedConsigneeClientsData(consigneeClientData);

                    // set client names
                    const allConsigneeClientNames = [];
                    for (let i = 0; i < consigneeClientData.length; i++) {
                        allConsigneeClientNames.push({
                            "clientName": consigneeClientData[i].client_name,
                            "clientAddress": consigneeClientData[i].address1 + ", " +
                                            consigneeClientData[i].address2 + ", " +
                                            consigneeClientData[i].area + ", " +
                                            consigneeClientData[i].city + ", " +
                                            consigneeClientData[i].state + ", " +
                                            consigneeClientData[i].pin,
                            "clientId": consigneeClientData[i].client_id
                        });
                    }
                    allConsigneeClientNames.sort();
                    setConsigneeClientNames(allConsigneeClientNames);
                    setIsLoading(false);
                    setLoadingText("");

                    if (isConsigneeSaved) {
                        document.getElementById("addClientModalCloseButton").click();
                        setIsConsigneeSaved(false);
                    }
                } else {
                    setIsLoading(false);
                    setLoadingText("");
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
                setIsLoading(false);
                setLoadingText("");
            }
        }
    };
    useEffect(() => {
        getConsignorConsigneeDetails();
    }, [consignorCity, consigneeCity, isConsignorSaved, isConsigneeSaved]);

    function getSelectedConsignorConsigneeData() {
        if (fetchedConsignorClientsData && fetchedConsignorClientsData.length > 0 && selectedConsignorClient.length > 0) {
            setIsLoading(true);
            setLoadingText("Selected Consignor Details are Loading...");
            const findSelectedConsignorClientData = fetchedConsignorClientsData.find((client) => client.client_id === selectedConsignorClient[0].clientId);
            setSelectedConsignorClientData(findSelectedConsignorClientData);
            setIsLoading(false);
            setLoadingText("");
        } else if (selectedConsignorClient.length === 0) {
            setSelectedConsignorClientData([]);
        }

        if (fetchedConsigneeClientsData && fetchedConsigneeClientsData.length > 0 && selectedConsigneeClient.length > 0) {
            setIsLoading(true);
            setLoadingText("Selected Consignee Details are Loading...");
            const findSelectedConsigneeClientData = fetchedConsigneeClientsData.find((client) => client.client_id === selectedConsigneeClient[0].clientId);
            setSelectedConsigneeClientData(findSelectedConsigneeClientData);
            setIsLoading(false);
            setLoadingText("");
        } else if (selectedConsigneeClient.length === 0) {
            setSelectedConsigneeClientData([]);
        }
    };
    useEffect(() => {
        getSelectedConsignorConsigneeData();
    }, [selectedConsignorClient, selectedConsigneeClient]);

    function checkRequiredFields() {
        if(pickupDate && material && size && priority) {
            return true;
        } else {
            setValidated(true);
            return false;
        }
    };

    async function generateLR(lrNumber, orderId) {

        try {
            const { data, error } = await supabase.from("lr").insert([
                {
                    lr_number: lrNumber,
                    order_id: orderId,
                    status: "Performa",
                    auto_generated: true,

                    // pick up location details
                    pickup_location_id: selectedPickupPointData ? selectedPickupPointData.location_id : null,
                    pickup_marketing_contact_id: selectedPickupMarketingContactDetails.length > 0 ? selectedPickupMarketingContactDetails[0].pickupMarketingContactId : null,
                    pickup_dispatch_contact_id: selectedPickupDispatchContactDetails.length > 0 ? selectedPickupDispatchContactDetails[0].pickupDispatchContactId : null,
                    
                    // consignor and consignee details
                    consignor_client_id: selectedConsignorClientData ? selectedConsignorClientData.client_id : null,
                    consignee_client_id: selectedConsigneeClientData ? selectedConsigneeClientData.client_id : null,

                },
            ]);
            if (error) {
                // open toast
                toast.error(
                    "Error while generating LR, Please try again later or contact tech support",
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
                setIsLRGenerating(false);
            } else {
                // reset all selected states
                setSelectedConsignorClient([]);
                setSelectedConsignorClientData("");
                setSelectedConsigneeClient([]);
                setSelectedConsigneeClientData("");

                // open toast
                toast.success("New LR generated successfully", {
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

                setIsLRGenerating(false);
            }
            setIsLRGenerating(false);
        } catch (e) {
            // open toast
            toast.error(
                "Errors while generating LR, Please try again later or contact tech support",
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
            setIsLRGenerating(false);
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
            // generate order
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
                        order_number: orderNumber,
                        pickup_date: format(pickupDate, "yyyy-MM-dd"),
                        order_city: orderCity,
                        client_name: selectedClient[0],
                        pickup_location: pickupCitySelection[0],
                        drop_location: dropCitySelection[0],
                        material: material,
                        size: size,
                        quantity: quantity,
                        weight: weight,
                        priority: priority,
                        special_offered_freight: specialOfferedFreight,
                        notes: notes,
                        freight_notes: freightNotes,
                        status: "Under pickup process",
                        order_created_by: user.id,
                        client_number: selectedClientData.client_number
                    }
                ]).select();
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
                    setSelectedPickupMarketingContactDetails([]);
                    setSelectedPickupDispatchContactDetails([]);
                    setPickupDate(new Date());
                    setIsLoading(false);

                    if (data[0].order_id) {
                        // generate LR
                        try {
                            setIsLRGenerating(true);
                            generateLR(lrNumber, data[0].order_id);
                        } catch {
                            // open toast
                            toast.error(
                                "Error while generating LR, Please try to generate manually from Open Orders page",
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
                        toast.error(
                            "Unable to find required details to generate LR, Please try to generate manually from Open Orders page",
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

    useEffect(() => {
        if (user.drop_branch) {
            setOrderFormData((previousState) => ({
                ...previousState,
                orderCity: user.drop_branch,
                consigneeCity: user.drop_branch
            }));

            let preSelectedDropCity = [];
            preSelectedDropCity.push(user.drop_branch);
            setDropCitySelection(preSelectedDropCity);
        }
        if (user.pickup_branch) {
            setOrderFormData((previousState) => ({
                ...previousState,
                consignorCity: user.pickup_branch
            }));

            let preSelectedPickupCity = [];
            preSelectedPickupCity.push(user.pickup_branch);
            setPickupCitySelection(preSelectedPickupCity);
        }
    }, [user]);

    return (
        <>
            { checkAllRefs ?
            <Form validated={validated}>
                {/* General Details Block starts */}
                <div>
                    <div className="divider divider-general">
                        <span><b>General</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>Order City</Form.Label>
                                { !user.drop_branch ?
                                    <Form.Select
                                        className="chosen-single form-select"
                                        size="md"
                                        disabled={user.drop_branch}
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
                                :
                                    <Form.Control type="text" disabled value={orderCity} />
                                }
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>
                                    <ul className="option-list">
                                        Client Name
                                        <li className="mx-2">
                                            { orderCity ?
                                                <button>
                                                    <a
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addClientModal"
                                                        onClick={() => {
                                                            setIsClient(true);
                                                            setIsConsignor(false);
                                                            setIsConsignee(false);
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
                                    Pickup Date
                                </Form.Label><br />
                                <CalendarComp setDate={setPickupDate} date1={pickupDate} dateDisabled={dateDisabled} />
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Pickup Location</Form.Label>
                                { !user.pickup_branch ?
                                    <Typeahead
                                        id="pickupLocation"
                                        onChange={(e) => {
                                            setPickupCitySelection(e);
                                            setSelectedPickupPoint([]);
                                            setSelectedPickupMarketingContactDetails([]);
                                            setSelectedPickupDispatchContactDetails([]);
                                        }}
                                        className="form-group"
                                        options={cityRefs}
                                        selected={pickupCitySelection}
                                    />
                                :
                                    <Form.Control type="text" disabled value={pickupCitySelection} />
                                }
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
                                    onChange={(e) => {
                                        setSelectedPickupPoint(e);
                                        // add logic to show pre loaded values for contacts if they select same point
                                        setSelectedPickupMarketingContactDetails([]);
                                        setSelectedPickupDispatchContactDetails([]);
                                    }}
                                    className="form-group"
                                    options={pickupPointNames}
                                    selected={selectedPickupPoint}
                                    highlightOnlyResult
                                    labelKey="pickupName"
                                    renderMenuItemChildren={(option) => (
                                        <div>
                                            <b>
                                                {option.pickupName}
                                            </b>
                                            <div className="px-1" style={{ fontSize: "small", whiteSpace: "normal" }}>
                                                {option.pickupAddress}
                                            </div>
                                        </div>
                                    )}
                                    style={{ lineHeight: "normal" }}
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
                                    disabled = {!selectedPickupPoint[0]}
                                    onChange={setSelectedPickupMarketingContactDetails}
                                    className="form-group"
                                    options={pickupMarketingContactDetails}
                                    selected={selectedPickupMarketingContactDetails}
                                    labelKey="pickupMarketingContactName"
                                    renderMenuItemChildren={(option) => (
                                        <div>
                                            {option.pickupMarketingContactName}
                                        </div>
                                    )}
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
                                    disabled = {!selectedPickupPoint[0]}
                                    onChange={setSelectedPickupDispatchContactDetails}
                                    className="form-group"
                                    options={pickupDispatchContactDetails}
                                    selected={selectedPickupDispatchContactDetails}
                                    labelKey="pickupDispatchContactName"
                                    renderMenuItemChildren={(option) => (
                                        <div>
                                            {option.pickupDispatchContactName}
                                        </div>
                                    )}
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
                            { !user.drop_branch ?
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
                            :
                                <Form.Group as={Col} md="4">
                                    <Form.Control type="text" disabled value={dropCitySelection} />
                                </Form.Group>
                            }
                        </Row>
                    </div>
                </div>
                {/* Drop Details Block ends */}
                
                {/* Consignor Details Block starts */}
                <div>
                    <div className="divider divider-general">
                        <span><b>Consignor</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>City</Form.Label>
                                { !user.drop_branch ?
                                    <Form.Select
                                        className="chosen-single form-select"
                                        size="md"
                                        onChange={(e) => {
                                            setOrderFormData((previousState) => ({
                                                ...previousState,
                                                consignorCity: e.target.value,
                                            }));
                                            setSelectedConsignorClient([]);
                                        }}
                                        value={consignorCity}
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
                                :
                                    <Form.Control type="text" disabled value={consignorCity} />
                                }
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignor's City.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="8" controlId="validationCustom01">
                                <Form.Label>
                                    <ul className="option-list">
                                        Client Name
                                        <li className="mx-2">
                                            { consignorCity ?
                                                <button>
                                                    <a
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addClientModal"
                                                        onClick={() => {
                                                            setIsConsignor(true);
                                                            setIsConsignee(false);
                                                            setIsClient(false);
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
                                    id="clientName"
                                    disabled = {!consignorCity}
                                    onChange={setSelectedConsignorClient}
                                    className="form-group"
                                    options={consignorClientNames}
                                    selected={selectedConsignorClient}
                                    labelKey="clientName"
                                    renderMenuItemChildren={(option) => (
                                        <div>
                                            <b>
                                                {option.clientName}
                                            </b>
                                            <div className="px-1" style={{ fontSize: "small", whiteSpace: "normal" }}>
                                                {option.clientAddress}
                                            </div>
                                        </div>
                                    )}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                {selectedConsignorClient && selectedConsignorClientData ?
                                    <>
                                        <div className="optional" style={{ paddingLeft: "inherit" }}>
                                            <span>{selectedConsignorClientData.address1 ? selectedConsignorClientData.address1 + ", " : ""}</span>
                                            <span>{selectedConsignorClientData.address2 ? selectedConsignorClientData.address2 + ", " : ""}</span>
                                            <span>{selectedConsignorClientData.area ? selectedConsignorClientData.area + ", " : ""}</span>
                                            <span>{selectedConsignorClientData.city ? selectedConsignorClientData.city + ", " : ""}</span>
                                            <span>{selectedConsignorClientData.state ? selectedConsignorClientData.state + ", " : ""}</span>
                                            <span>{selectedConsignorClientData.pin ? selectedConsignorClientData.pin : ""}</span>
                                        </div>
                                    </>
                                :  ""}
                            </Form.Group>
                        </Row>
                        {selectedConsignorClient && selectedConsignorClientData ?
                            <Row className="pb-3">
                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                    <InputGroup size="sm">
                                        <InputGroup.Text id="inputGroupPrepend">GSTIN</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            // placeholder="Username"
                                            aria-describedby="inputGroupPrepend"
                                            disabled
                                            value={selectedConsignorClientData.client_gst}
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                    <InputGroup 
                                        size="sm" >
                                        <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            disabled
                                            // placeholder="Username"
                                            aria-describedby="inputGroupPrepend"
                                            // required
                                            value={selectedConsignorClientData.client_phone}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Row>
                        : ""}
                    </div>
                </div>
                {/* Consignor Details Block ends */}

                {/* Consignee Details Block starts */}
                <div className="pb-4">
                    <div className="divider divider-general">
                        <span><b>Consignee</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>City</Form.Label>
                                { !user.pickup_branch ?
                                    <Form.Select
                                        className="chosen-single form-select"
                                        size="md"
                                        onChange={(e) => {
                                            setOrderFormData((previousState) => ({
                                                ...previousState,
                                                consigneeCity: e.target.value,
                                            }));
                                            setSelectedConsigneeClient([]);
                                        }}
                                        value={consigneeCity}
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
                                :
                                    <Form.Control type="text" disabled value={consigneeCity} />
                                }
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignee's City.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="8" controlId="validationCustom01">
                                <Form.Label>
                                    <ul className="option-list">
                                        Client Name
                                        <li className="mx-2">
                                            { consigneeCity[0] ?
                                                <button>
                                                    <a
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addClientModal"
                                                        onClick={() => {
                                                            setIsConsignor(false);
                                                            setIsConsignee(true);
                                                            setIsClient(false);
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
                                    id="consigneeClientName"
                                    disabled = {!consigneeCity}
                                    onChange={setSelectedConsigneeClient}
                                    className="form-group"
                                    options={consigneeClientNames}
                                    selected={selectedConsigneeClient}
                                    labelKey="clientName"
                                    renderMenuItemChildren={(option) => (
                                        <div>
                                            <b>
                                                {option.clientName}
                                            </b>
                                            <div className="px-1" style={{ fontSize: "small", whiteSpace: "normal" }}>
                                                {option.clientAddress}
                                            </div>
                                        </div>
                                    )}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                {selectedConsigneeClient && selectedConsigneeClientData ?
                                    <>
                                        <div className="optional" style={{ paddingLeft: "inherit" }}>
                                            <span>{selectedConsigneeClientData.address1 ? selectedConsigneeClientData.address1 + ", " : ""}</span>
                                            <span>{selectedConsigneeClientData.address2 ? selectedConsigneeClientData.address2 + ", " : ""}</span>
                                            <span>{selectedConsigneeClientData.area ? selectedConsigneeClientData.area + ", " : ""}</span>
                                            <span>{selectedConsigneeClientData.city ? selectedConsigneeClientData.city + ", " : ""}</span>
                                            <span>{selectedConsigneeClientData.state ? selectedConsigneeClientData.state + ", " : ""}</span>
                                            <span>{selectedConsigneeClientData.pin ? selectedConsigneeClientData.pin : ""}</span>
                                        </div>
                                    </>
                                :  ""}
                            </Form.Group>
                        </Row>
                        {selectedConsigneeClient && selectedConsigneeClientData ?
                            <Row className="pb-3">
                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                    <InputGroup size="sm">
                                        <InputGroup.Text id="inputGroupPrepend">GSTIN</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            // placeholder="Username"
                                            aria-describedby="inputGroupPrepend"
                                            disabled
                                            value={selectedConsigneeClientData.client_gst}
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                    <InputGroup 
                                        size="sm" >
                                        <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            disabled
                                            // placeholder="Username"
                                            aria-describedby="inputGroupPrepend"
                                            // required
                                            value={selectedConsigneeClientData.client_phone}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Row>
                        : ""}
                    </div>
                    <span className="horizontal-divider">
                    </span>
                </div>
                {/* Consignee Details Block ends */}

                {/* Material Details starts */}
                <div>
                    <div className="divider divider-material">
                        <span><b>Material Details</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
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
                                    Material
                                </Form.Label>
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
                                    Size
                                </Form.Label>
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
                                    Priority
                                </Form.Label>
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
                                    Quantity
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="order-quantity"
                                    // placeholder="Material Details"
                                    // defaultValue="Mark"
                                    value={quantity}
                                    required
                                    onChange={(e) => {
                                        setOrderFormData((previousState) => ({
                                            ...previousState,
                                            quantity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter material's quantity.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom01">
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
                                    Weight(Kg)
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        name="order-weight"
                                        // placeholder="Weight"
                                        // defaultValue="Otto"
                                        required
                                        value={weight}
                                        onChange={(e) => {
                                            setOrderFormData((previousState) => ({
                                                ...previousState,
                                                weight: e.target.value,
                                            }));
                                        }}
                                    />
                                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter material's weight.
                                    </Form.Control.Feedback>
                                </InputGroup>
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

                {/* Add Client Modal */}
                <div
                    className="modal fade"
                    id="addClientModal"
                    tabIndex="-1"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="apply-modal-content modal-content" style={{ overflow: "auto" }}>
                            <div className="text-center">
                                <button
                                    type="button"
                                    id="addClientModalCloseButton"
                                    className="closed-modal"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <AddClientPopup
                                isClient={isClient}
                                setIsClient={setIsClient}
                                isClientSaved={isClientSaved}
                                setIsClientSaved={setIsClientSaved}
                                isConsignor={isConsignor}
                                setIsConsignor={setIsConsignor}
                                isConsignee={isConsignee}
                                setIsConsignee={setIsConsignee}
                                isConsigneeSaved={isConsigneeSaved}
                                setIsConsigneeSaved={setIsConsigneeSaved}
                                isConsignorSaved={isConsignorSaved}
                                setIsConsignorSaved={setIsConsignorSaved}
                            />
                        </div>
                        {/* End .send-private-message-wrapper */}
                    </div>
                </div>
                {/* End of Add Client Modal */}
            </Form>
            :   ""
            }
            <Spinner isLoading={isLoading} loadingText={loadingText} />
        </>
    );
};

export default AddOrder;
