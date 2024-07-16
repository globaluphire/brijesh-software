/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
/* eslint no-unneeded-ternary: "error" */
/* eslint-disable no-redeclare */
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
import AddLocationContactPopup from "../../../components/dashboard-pages/employers-dashboard/add-location/components/AddLocationContactPopup";
import AddLocationPopup from "../../../components/dashboard-pages/employers-dashboard/add-location/components/AddLocationPopup";
import { Grid } from "react-loader-spinner";
import Spinner from "../../../components/spinner/spinner";
import AddClientPopup from "../../../components/dashboard-pages/employers-dashboard/add-client/components/AddClientPopup";


const cancelOrderDataFields = {
    cancelReason: "",
    cancelNote: ""
};

const addLrDetailsFields = {
    consignorCity: "",
    consigneeCity: "",
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
    freightNotes: "",
    transportVehicleType: "",
    vehicleNumber: "",
    driverDetails: ""
};

const LRDetails = (orderDetails) => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [fetchedOrderCommentData, setFetchedOrderCommentData] = useState([]);
    const [ewayBillVerified, setEwayBillVerified] = useState(false);
    const [isAllDataFetched, setIsAllDataFetched] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("LR details are loading...");

    const [isLocationSaved, setIsLocationSaved] = useState(false);
    const [isLocationContactSaved, setIsLocationContactSaved] = useState(false);
    const [isLocationContactType, setIsLocationContactType] = useState("");
    const [locationNumber, setLocationNumber] = useState("");
    const [isConsignor, setIsConsignor] = useState(false);
    const [isConsignee, setIsConsignee] = useState(false);
    const [isConsignorSaved, setIsConsignorSaved] = useState(false);
    const [isConsigneeSaved, setIsConsigneeSaved] = useState(false);

    // LR Details states
    const [fetchedOrderData, setFetchedOrderData] = useState({});
    const [fetchedLRData, setFetchedLRData] = useState({});
    const [fetchedClientData, setFetchedClientData] = useState({});
    const [fetchedPickupLocationData, setFetchedPickupLocationData] = useState({});
    const [fetchedPickupLocationMarketingData, setFetchedPickupLocationMarketingData] = useState({});
    const [fetchedpickupLocationDispatchData, setFetchedPickupLocationDispatchData] = useState({});
    const [fetchedDropLocationData, setFetchedDropLocationData] = useState({});
    const [fetchedDropLocationMarketingData, setFetchedDropLocationMarketingData] = useState({});
    const [fetchedDropLocationDispatchData, setFetchedDropLocationDispatchData] = useState({});

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

    // drop point details selection states
    const [dropPointNames, setDropPointNames] = useState([]);
    const [dropLocationData, setDropLocationData] = useState("");
    const [selectedDropPoint, setSelectedDropPoint] = useState([]);
    const [selectedDropPointData, setSelectedDropPointData] = useState("");

    // drop point contact details selection states
    const [dropMarketingContactDetails, setDropMarketingContactDetails] = useState([]);
    const [selectedDropMarketingContactDetails, setSelectedDropMarketingContactDetails] = useState([]);
    const [dropDispatchContactDetails, setDropDispatchContactDetails] = useState([]);
    const [selectedDropDispatchContactDetails, setSelectedDropDispatchContactDetails] = useState([]);
    const [dropLocationContactData, setDropLocationContactData] = useState("");

    // consignor states
    const [fetchedConsignorClientsData, setFetchedConsignorClientsData] = useState({});
    const [consignorClientNames, setConsignorClientNames] = useState([]);
    const [selectedConsignorClient, setSelectedConsignorClient] = useState([]);
    const [selectedConsignorClientData, setSelectedConsignorClientData] = useState("");
    const [consignorCitySelection, setConsignorCitySelection] = useState([]);

    // consignee states
    const [fetchedConsigneeClientsData, setFetchedConsigneeClientsData] = useState({});
    const [consigneeClientNames, setConsigneeClientNames] = useState([]);
    const [selectedConsigneeClient, setSelectedConsigneeClient] = useState([]);
    const [selectedConsigneeClientData, setSelectedConsigneeClientData] = useState("");
    const [consigneeCitySelection, setConsigneeCitySelection] = useState([]);

    // other fields states
    const [transportVehicleDetail, setTransportVehicleDetail] = useState("");
    const [lrStatus, setLrStatus] = useState("");

    // temp action fields data
    const [ewayBillNumber, setEwayBillNumber] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [localTransport, setLocalTransport] = useState("");
    const [truckDetails, setTruckDetails] = useState("");
    const [orderComment, setOrderComment] = useState("");
    const [cancelOrderData, setCancelOrderData] = useState(JSON.parse(JSON.stringify(cancelOrderDataFields)));
    const { cancelReason, cancelNote } = useMemo(() => cancelOrderData, [cancelOrderData]);

    const [lrDetailsFormData, setLrDetailsFormData] = useState(
        JSON.parse(JSON.stringify(addLrDetailsFields))
    );
    const {
        consignorCity,
        consigneeCity,
        transportVehicleType,
        vehicleNumber,
        driverDetails
    } = useMemo(() => lrDetailsFormData, [lrDetailsFormData]);

    // all references state
    const [sortedCancelReasonRefs, setSortedCancelReasonRefs] = useState([]);
    const [cancelReasonReferenceOptions, setCancelReasonReferenceOptions] = useState(null);
    const [orderCityReferenceOptions, setOrderCityReferenceOptions] = useState([]);
    const [cityRefs, setCityRefs] = useState([]);
    const [dropCitySelection, setDropCitySelection] = useState([]);
    const [pickupCitySelection, setPickupCitySelection] = useState([]);
    const [cityReferenceOptions, setCityReferenceOptions] = useState(null);
    const [transportVehicleTypeReferenceOptions, setTransportVehicleTypeReferenceOptions] = useState([]);
    const [lRStatusReferenceOptions, setLRStatusReferenceOptions] = useState(null);

    const router = useRouter();
    const lrNumber = router.query.id;

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

    const handleChange=(e)=>{
        setEwayBillVerified(!ewayBillVerified);
    };

    async function getReferences() {
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

        // call reference to get transportVehicleType options
        const { data: transportVehicleTypeRefData, error: er } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "transportVehicleType");

        if (transportVehicleTypeRefData) {
            const transportVehicleTypes = [];
            for (let i = 0; i < transportVehicleTypeRefData.length; i++) {
                transportVehicleTypes.push(transportVehicleTypeRefData[i].ref_dspl);
            }
            transportVehicleTypes.sort();
            setTransportVehicleTypeReferenceOptions(transportVehicleTypes);
        }

        // call reference to get lrStatus options
        const { data: lrData, error: lrError } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "lrStatus");

        if (lrData) {
            setLRStatusReferenceOptions(lrData);
        }
    };
    useEffect(() => {
        getReferences();
    }, []);

    async function checkAllData() {
        if (fetchedOrderData &&
            fetchedLRData &&
            fetchedClientData &&
            fetchedPickupLocationData &&
            fetchedPickupLocationMarketingData &&
            fetchedpickupLocationDispatchData &&
            fetchedDropLocationData &&
            fetchedDropLocationMarketingData &&
            fetchedDropLocationDispatchData)
        {
            setIsAllDataFetched(true);
        }
    };

    useEffect(() => {
        checkAllData();
    }, [fetchedOrderData &&
        fetchedLRData &&
        fetchedClientData &&
        fetchedPickupLocationData &&
        fetchedPickupLocationMarketingData &&
        fetchedpickupLocationDispatchData &&
        fetchedDropLocationData &&
        fetchedDropLocationMarketingData &&
        fetchedDropLocationDispatchData
        ]
    );


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


                    // setting whatever the pickup marketing and dispatch contact already set in orders data
                    if (Object.keys(fetchedLRData).length !== 0 && Object.keys(fetchedPickupLocationMarketingData).length !== 0  && fetchedLRData.pickup_marketing_contact_id) {
                        for (let i = 0; i < pickupLocationContactData.length; i++) {
                            if (pickupLocationContactData[i].location_contact_id === fetchedLRData.pickup_marketing_contact_id) {
                                // set pre loaded marketing contact values
                                var pickupMarketingDetails = [];
                                pickupMarketingDetails.push({
                                    "pickupMarketingContactName": fetchedPickupLocationMarketingData.contact_name + "-" + fetchedPickupLocationMarketingData.contact_phone,
                                    "pickupMarketingContactId": fetchedPickupLocationMarketingData.location_contact_id
                                });
                                setSelectedPickupMarketingContactDetails(pickupMarketingDetails);
                                break;
                            }
                        }
                    }
                    if (Object.keys(fetchedLRData).length !== 0 && Object.keys(fetchedpickupLocationDispatchData).length !== 0  && fetchedLRData.pickup_dispatch_contact_id) {
                        for (let i = 0; i < pickupLocationContactData.length; i++) {
                            if (pickupLocationContactData[i].location_contact_id === fetchedLRData.pickup_dispatch_contact_id) {
                                // set pre loaded dispatch contact values
                                var pickupDispatchDetails = [];
                                pickupDispatchDetails.push({
                                    "pickupDispatchContactName": fetchedpickupLocationDispatchData.contact_name + "-" + fetchedpickupLocationDispatchData.contact_phone,
                                    "pickupDispatchContactId": fetchedpickupLocationDispatchData.location_contact_id
                                });
                                setSelectedPickupDispatchContactDetails(pickupDispatchDetails);
                                break;
                            }
                        }
                    }

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


    // start of Drop point details
    async function getDropPointDetails() {
        if(dropCitySelection[0]) {
            try {
                setIsLoading(true);
                setLoadingText("Drop Point Details are Loading...");
                let { data: dropLocationData, error } = await supabase
                    .from("location")
                    .select("*")
                    .eq("location_type", "Drop")
                    .eq("location_city", dropCitySelection[0]);

                if (dropLocationData) {
                    setDropLocationData(dropLocationData);

                    
                    // set pickup names
                    const allDropNames = [];
                    for (let i = 0; i < dropLocationData.length; i++) {
                        allDropNames.push({
                            "dropName": dropLocationData[i].name_of_pickup_point,
                            "dropAddress": dropLocationData[i].address1 + ", " +
                                            dropLocationData[i].address2 + ", " +
                                            dropLocationData[i].area + ", " +
                                            dropLocationData[i].city + ", " +
                                            dropLocationData[i].state + ", " +
                                            dropLocationData[i].pin,
                            "dropLocationNumber": dropLocationData[i].location_number
                        });
                    }
                    allDropNames.sort();
                    setDropPointNames(allDropNames);

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
                    "System is unavailable.  Unable to fetch Drop location Data.  Please try again later or contact tech support!",
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
        getDropPointDetails();
    }, [dropCitySelection, isLocationSaved]);

    async function getDropLocationContactData() {
        if (selectedDropPointData && selectedDropPointData.location_number) {
            // get location contact details
            try {
                setIsLoading(true);
                setLoadingText("Drop Point Contact Details are Loading...");
                let { data: dropLocationContactData, error } = await supabase
                    .from("location_contact")
                    .select("*")
                    .eq("location_number", selectedDropPointData.location_number);

                if (dropLocationContactData) {
                    setDropLocationContactData(dropLocationContactData);

                    // set drop names
                    const allDropMarketingContactNames = [];
                    const allDropDispatchContactNames = [];
                    for (let i = 0; i < dropLocationContactData.length; i++) {
                        if (dropLocationContactData[i].contact_type === "Marketing") {
                            allDropMarketingContactNames.push({
                                "dropMarketingContactName": dropLocationContactData[i].contact_name + "-" + dropLocationContactData[i].contact_phone,
                                "dropMarketingContactId": dropLocationContactData[i].location_contact_id
                            });
                        } else {
                            allDropDispatchContactNames.push({
                                "dropDispatchContactName": dropLocationContactData[i].contact_name + "-" + dropLocationContactData[i].contact_phone,
                                "dropDispatchContactId": dropLocationContactData[i].location_contact_id
                            });
                        }
                    }
                    allDropMarketingContactNames.sort();
                    allDropDispatchContactNames.sort();
                    setDropMarketingContactDetails(allDropMarketingContactNames);
                    setDropDispatchContactDetails(allDropDispatchContactNames);

                    // setting whatever the drop marketing and dispatch contact already set in orders data
                    if (Object.keys(fetchedLRData).length !== 0 && Object.keys(fetchedDropLocationMarketingData).length !== 0  && fetchedLRData.drop_marketing_contact_id) {
                        for (let i = 0; i < dropLocationContactData.length; i++) {
                            if (dropLocationContactData[i].location_contact_id === fetchedLRData.drop_marketing_contact_id) {
                                // set pre loaded marketing contact values
                                var dropMarketingDetails = [];
                                dropMarketingDetails.push({
                                    "dropMarketingContactName": fetchedDropLocationMarketingData.contact_name + "-" + fetchedDropLocationMarketingData.contact_phone,
                                    "dropMarketingContactId": fetchedDropLocationMarketingData.location_contact_id
                                });
                                setSelectedDropMarketingContactDetails(dropMarketingDetails);
                                break;
                            }
                        }
                    }
                    if (Object.keys(fetchedLRData).length !== 0 && Object.keys(fetchedDropLocationDispatchData).length !== 0  && fetchedLRData.drop_dispatch_contact_id) {
                        for (let i = 0; i < pickupLocationContactData.length; i++) {
                            if (pickupLocationContactData[i].location_contact_id === fetchedLRData.drop_dispatch_contact_id) {
                                // set pre loaded dispatch contact values
                                var dropDispatchDetails = [];
                                dropDispatchDetails.push({
                                    "dropDispatchContactName": fetchedDropLocationDispatchData.contact_name + "-" + fetchedDropLocationDispatchData.contact_phone,
                                    "dropDispatchContactId": fetchedDropLocationDispatchData.location_contact_id
                                });
                                setSelectedDropDispatchContactDetails(dropDispatchDetails);
                                break;
                            }
                        }
                    }

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
                    "System is unavailable.  Unable to fetch Drop location Data.  Please try again later or contact tech support!",
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
        getDropLocationContactData();
    }, [selectedDropPointData, isLocationContactSaved]);

    async function getSelectedDropPointData() {
        if(dropLocationData && dropLocationData.length > 0 && selectedDropPoint.length > 0) {
            setIsLoading(true);
            setLoadingText("Selected Drop Point Details are Loading...");
            const findSelectedDropData = dropLocationData.find((i) => i.location_number === selectedDropPoint[0].dropLocationNumber);
            setSelectedDropPointData(findSelectedDropData);
            setIsLoading(false);
            setLoadingText("");
        } else {
            setSelectedDropPointData([]);
        }
    };
    useEffect(() => {
        getSelectedDropPointData();
    }, [selectedDropPoint]);
    // end of Drop point details


    async function getClientDetails() {
        if (consignorCitySelection[0]) {
            // fetch consignor client addresses and contacts data
            try {
                setIsLoading(true);
                setLoadingText("Consignor Details are Loading...");

                let { data: consignorClientData, error } = await supabase
                    .from("location")
                    .select("*")
                    .eq("location_city", consignorCitySelection[0]);

                if (consignorClientData) {
                    setFetchedConsignorClientsData(consignorClientData);

                    // set client names
                    const allConsignorClientNames = [];
                    for (let i = 0; i < consignorClientData.length; i++) {
                        allConsignorClientNames.push({
                            "clientName": consignorClientData[i].name_of_pickup_point,
                            "clientAddress": consignorClientData[i].address1 + ", " +
                                            consignorClientData[i].address2 + ", " +
                                            consignorClientData[i].area + ", " +
                                            consignorClientData[i].city + ", " +
                                            consignorClientData[i].state + ", " +
                                            consignorClientData[i].pin,
                            "clientId": consignorClientData[i].location_id
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

        if (consigneeCitySelection[0]) {
            // fetch consignee client addresses and contacts data
            try {
                setIsLoading(true);
                setLoadingText("Consignee Details are Loading...");

                let { data: consigneeClientData, error } = await supabase
                    .from("client")
                    .select("*")
                    .eq("city", consigneeCitySelection[0]);

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
        getClientDetails();
    }, [consignorCitySelection, consigneeCitySelection, isConsignorSaved, isConsigneeSaved]);

    function getSelectedClientData() {
        if (fetchedConsignorClientsData && fetchedConsignorClientsData.length > 0 && selectedConsignorClient.length > 0) {
            setIsLoading(true);
            setLoadingText("Selected Consignor Details are Loading...");
            const findSelectedConsignorClientData = fetchedConsignorClientsData.find((client) => client.location_id === selectedConsignorClient[0].clientId);
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
        getSelectedClientData();
    }, [selectedConsignorClient, selectedConsigneeClient]);

    
    // fetch LR Details
    const fetchLRData = async () => {
        try {
            if (lrNumber) {
                /**
                 *  Fetch LR Details
                 *  @lrNumber
                 */
                setLoadingText("LR Details are Loading...");
                const { data: lrData, error: lrError } = await supabase
                    .from("lr")
                    .select("*")
                    .eq("lr_number", lrNumber);

                if (lrData) {
                    setFetchedLRData(lrData[0]);
                    setLrStatus(lrData[0].status);
                    setLrDetailsFormData((previousState) => ({
                        ...previousState,
                        transportVehicleType: lrData[0].transport_vehicle_type,
                        vehicleNumber: lrData[0].vehical_number,
                        driverDetails: lrData[0].driver_details
                    }));

                    if(lrData[0].transport_vehicle_type === "Local Vehicle") {
                        setTransportVehicleDetail("Crossing");
                    } else if (lrData[0].transport_vehicle_type === "Main Vehicle") {
                        setTransportVehicleDetail("Direct");
                    } else {
                        setTransportVehicleDetail("");
                    }
                    lrData[0].lr_created_at = dateFormat(lrData[0].lr_created_at);

                    if (lrData[0].lr_last_modified_date) {
                        lrData[0].lr_last_modified_date = dateFormat(lrData[0].lr_last_modified_date);
                    }

                    /**
                     *  Fetch Order Details
                     *  @lr.order_id
                     */
                    setLoadingText("Order Details are Loading...");
                    const { data: orderData, error } = await supabase
                            .from("orders")
                            .select("*")

                            // Filters
                            .eq("order_id", lrData[0].order_id);

                    if (orderData) {
                        setFetchedOrderData(orderData[0]);
                        orderData[0].order_created_at = dateFormat(orderData[0].order_created_at);

                        if (orderData[0].order_updated_at) {
                            orderData[0].order_updated_at = dateFormat(orderData[0].order_updated_at);
                        }

                        // set pre loaded values
                        // pickup city
                        var prePickupCitySelection = [];
                        prePickupCitySelection.push(orderData[0]?.pickup_location);
                        setPickupCitySelection(prePickupCitySelection ? prePickupCitySelection : []);

                        // drop city
                        var preDropCitySelection = [];
                        preDropCitySelection.push(orderData[0].drop_location);
                        setDropCitySelection(preDropCitySelection ? preDropCitySelection : []);
                    } else {
                        setIsLoading(false);
                        setLoadingText("");
                    }

                    /**
                     *  Fetch Client Details
                     *  @order.client_number
                     */
                    setLoadingText("Client Details are Loading...");
                    let { data: clientData, error: e } = await supabase
                        .from("client")
                        .select("*")
                        .eq("client_number", orderData[0].client_number);

                    if (clientData) {
                        setFetchedClientData(clientData[0]);
                    } else {
                        setIsLoading(false);
                        setLoadingText("");
                    }

                    /**
                     *  Fetch Pick up Location Details
                     *  @order.pickup_location_number
                     */
                    setLoadingText("Pick up Location Details are Loading...");
                    let { data: pickupLocationData, error: pickupLocationError } = await supabase
                        .from("location")
                        .select("*")
                        .eq("location_id", lrData[0].pickup_location_id);

                    if (pickupLocationData) {
                        setFetchedPickupLocationData(pickupLocationData[0]);

                        // set pre loaded values
                        // pickup city
                        var prePickupCitySelection = [];
                        prePickupCitySelection.push(pickupLocationData[0]?.location_city);
                        setPickupCitySelection(prePickupCitySelection ? prePickupCitySelection : []);

                        // set pre selected drop name
                        const preSelectedPickupPoint = [];
                        preSelectedPickupPoint.push({
                            "pickupName": pickupLocationData[0].name_of_pickup_point,
                            "pickupAddress": pickupLocationData[0].address1 + ", " +
                                            pickupLocationData[0].address2 + ", " +
                                            pickupLocationData[0].area + ", " +
                                            pickupLocationData[0].city + ", " +
                                            pickupLocationData[0].state + ", " +
                                            pickupLocationData[0].pin,
                            "pickupLocationNumber": pickupLocationData[0].location_number
                        });
                        setSelectedPickupPoint(preSelectedPickupPoint);

                        setSelectedPickupPointData(pickupLocationData[0]);
                    } else {
                        setIsLoading(false);
                        setLoadingText("");
                    }
                    setLoadingText("Pick up Location Contact Details are Loading...");
                    // get pickup Location Marketing Contact data
                    if (lrData[0].pickup_marketing_contact_id) {
                        let { data: pickupLocationMarketingData, pickupLocationMarketingError } = await supabase
                            .from("location_contact")
                            .select("*")
                            .eq("location_contact_id", lrData[0].pickup_marketing_contact_id);

                        if (pickupLocationMarketingData) {
                            setFetchedPickupLocationMarketingData(pickupLocationMarketingData[0]);

                            // set pre loaded values
                            var pickupMarketingDetails = [];
                            pickupMarketingDetails.push({
                                "pickupMarketingContactName": pickupLocationMarketingData[0].contact_name + "-" + pickupLocationMarketingData[0].contact_phone,
                                "pickupMarketingContactId": pickupLocationMarketingData[0].location_contact_id
                            });
                            setSelectedPickupMarketingContactDetails(pickupMarketingDetails);
                        } else {
                            setIsLoading(false);
                            setLoadingText("");
                        }
                    }
                    // get Pick up Location Dispatch Contact data
                    if (lrData[0].pickup_dispatch_contact_id) {
                        let { data: pickupLocationDispatchData, error: pickupLocationDispatchError } = await supabase
                            .from("location_contact")
                            .select("*")
                            .eq("location_contact_id", lrData[0].pickup_dispatch_contact_id);

                        if (pickupLocationDispatchData) {
                            setFetchedPickupLocationDispatchData(pickupLocationDispatchData[0]);

                            // set pre loaded values
                            var pickupDispatchDetails = [];
                            pickupDispatchDetails.push({
                                "pickupDispatchContactName": pickupLocationDispatchData[0].contact_name + "-" + pickupLocationDispatchData[0].contact_phone,
                                "pickupDispatchContactId": pickupLocationDispatchData[0].location_contact_id
                            });
                            setSelectedPickupDispatchContactDetails(pickupDispatchDetails);
                        } else {
                            setIsLoading(false);
                            setLoadingText("");
                        }
                    }
                    /**
                     *  Fetch Drop Location Details
                     *  @order.drop_location_number
                     */
                    setLoadingText("Drop Location Details are Loading...");
                    let { data: dropLocationData, error: dropLocationError } = await supabase
                        .from("location")
                        .select("*")
                        .eq("location_id", lrData[0].drop_location_id);

                    if (dropLocationData) {
                        setFetchedDropLocationData(dropLocationData[0]);

                        // set pre loaded values
                        // drop city
                        var preDropCitySelection = [];
                        preDropCitySelection.push(dropLocationData[0]?.location_city);
                        setDropCitySelection(preDropCitySelection ? preDropCitySelection : []);

                        // set pre selected drop name
                        const preSelectedDropPoint = [];
                        preSelectedDropPoint.push({
                            "dropName": dropLocationData[0].name_of_pickup_point,
                            "dropAddress": dropLocationData[0].address1 + ", " +
                                            dropLocationData[0].address2 + ", " +
                                            dropLocationData[0].area + ", " +
                                            dropLocationData[0].city + ", " +
                                            dropLocationData[0].state + ", " +
                                            dropLocationData[0].pin,
                            "dropLocationNumber": dropLocationData[0].location_number
                        });
                        setSelectedDropPoint(preSelectedDropPoint);

                        setSelectedDropPointData(dropLocationData[0]);
                    } else {
                        setIsLoading(false);
                        setLoadingText("");
                    }
                    setLoadingText("Drop Location Contact Details are Loading...");
                    // get drop Location Marketing Contact data
                    if (lrData[0].drop_marketing_contact_id) {
                        let { data: dropLocationMarketingData, dropLocationMarketingError } = await supabase
                            .from("location_contact")
                            .select("*")
                            .eq("location_contact_id", lrData[0].drop_marketing_contact_id);

                        if (dropLocationMarketingData) {
                            setFetchedDropLocationMarketingData(dropLocationMarketingData[0]);

                            // set pre loaded values
                            var dropMarketingDetails = [];
                            dropMarketingDetails.push({
                                "dropMarketingContactName": dropLocationMarketingData[0].contact_name + "-" + dropLocationMarketingData[0].contact_phone,
                                "dropMarketingContactId": dropLocationMarketingData[0].location_contact_id
                            });
                            setSelectedDropMarketingContactDetails(dropMarketingDetails);
                        } else {
                            setIsLoading(false);
                            setLoadingText("");
                        }
                    }
                    // get Drop Location Dispatch Contact data
                    if (lrData[0].drop_dispatch_contact_id) {
                        let { data: dropLocationDispatchData, error: dropLocationDispatchError } = await supabase
                            .from("location_contact")
                            .select("*")
                            .eq("location_contact_id", lrData[0].drop_dispatch_contact_id);

                        if (dropLocationDispatchData) {
                            setFetchedDropLocationDispatchData(dropLocationDispatchData[0]);

                            // set pre loaded values
                            var dropDispatchDetails = [];
                            dropDispatchDetails.push({
                                "dropDispatchContactName": dropLocationDispatchData[0].contact_name + "-" + dropLocationDispatchData[0].contact_phone,
                                "dropDispatchContactId": dropLocationDispatchData[0].location_contact_id
                            });
                            setSelectedDropDispatchContactDetails(dropDispatchDetails);
                        } else {
                            setIsLoading(false);
                            setLoadingText("");
                        }
                    }
                    /**
                     *  Fetch Consignor Details
                     *  @lr.consignor_client_id
                     */
                    setLoadingText("Consignor Details are Loading...");
                    if (lrData[0].consignor_client_id) {
                        let { data: consignorData, error: consignorError } = await supabase
                            .from("location")
                            .select("*")
                            .eq("location_id", lrData[0].consignor_client_id);

                        if (consignorData) {
                            setFetchedConsignorClientsData(consignorData[0]);

                            // set pre loaded values
                            // pickup city
                            var preConsignorCitySelection = [];
                            preConsignorCitySelection.push(consignorData[0]?.location_city);
                            setConsignorCitySelection(preConsignorCitySelection);

                            // set pre selected consignor
                            const preSelectedConsignorClient = [];
                            preSelectedConsignorClient.push({
                                "clientName": consignorData[0].name_of_pickup_point,
                                "clientAddress": consignorData[0].address1 + ", " +
                                                consignorData[0].address2 + ", " +
                                                consignorData[0].area + ", " +
                                                consignorData[0].city + ", " +
                                                consignorData[0].state + ", " +
                                                consignorData[0].pin,
                                "clientId": consignorData[0].location_id
                            });
                            setSelectedConsignorClient(preSelectedConsignorClient);

                            setSelectedConsignorClientData(consignorData[0]);
                        } else {
                            setIsLoading(false);
                            setLoadingText("");
                        }
                    }
                    /**
                     *  Fetch Consignee Details
                     *  @lr.consignee_client_id
                     */
                    setLoadingText("Consignor Details are Loading...");
                    if (lrData[0].consignee_client_id) {
                        let { data: consigneeData, error: consigneeError } = await supabase
                            .from("client")
                            .select("*")
                            .eq("client_id", lrData[0].consignee_client_id);

                        if (consigneeData) {
                            setFetchedConsignorClientsData(consigneeData[0]);

                            // set pre loaded values
                            // pickup city
                            var preConsigneeCitySelection = [];
                            preConsigneeCitySelection.push(consigneeData[0]?.city);
                            setConsigneeCitySelection(preConsigneeCitySelection);


                            // set pre selected consignee
                            const preSelectedConsigneeClient = [];
                            preSelectedConsigneeClient.push({
                                "clientName": consigneeData[0].client_name,
                                "clientAddress": consigneeData[0].address1 + ", " +
                                                consigneeData[0].address2 + ", " +
                                                consigneeData[0].area + ", " +
                                                consigneeData[0].city + ", " +
                                                consigneeData[0].state + ", " +
                                                consigneeData[0].pin,
                                "clientId": consigneeData[0].client_id
                            });
                            setSelectedConsigneeClient(preSelectedConsigneeClient);

                            setSelectedConsigneeClientData(consigneeData[0]);
                        } else {
                            setIsLoading(false);
                            setLoadingText("");
                        }
                    }

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
            console.warn(e);
        }
    };
    useEffect(() => {
        fetchLRData();
    }, [lrNumber]);

    const saveLRDetails = async () => {
        // Pickup and Drop Point, Consignor Client, Consignee Client are required fields
        if (
            selectedPickupPointData && selectedPickupPointData.location_id &&
            selectedDropPointData && selectedDropPointData.location_id &&
            selectedConsignorClientData && selectedConsignorClientData.location_id &&
            selectedConsigneeClientData && selectedConsigneeClientData.client_id
        ) {
            try {
            
                const { data, error } = await supabase
                    .from("orders")
                    .update({
                        pickup_location: pickupCitySelection[0],
                        drop_location: dropCitySelection[0],
                        order_updated_at: new Date()
                    })
                    .eq("order_id", fetchedLRData.order_id);
                    // .select(); // this will return the updated record in object

                const { data: updatedLRData, error: updatedLRError } = await supabase
                    .from("lr")
                    .update({
                        // pick up location details
                        pickup_location_id: selectedPickupPointData ? selectedPickupPointData.location_id : null,
                        pickup_marketing_contact_id: selectedPickupMarketingContactDetails.length > 0 ? selectedPickupMarketingContactDetails[0].pickupMarketingContactId : null,
                        pickup_dispatch_contact_id: selectedPickupDispatchContactDetails.length > 0 ? selectedPickupDispatchContactDetails[0].pickupDispatchContactId : null,
                        
                        // drop location details
                        drop_location_id: selectedDropPointData ? selectedDropPointData.location_id : null,
                        drop_marketing_contact_id: selectedDropMarketingContactDetails.length > 0 ? selectedDropMarketingContactDetails[0].dropMarketingContactId : null,
                        drop_dispatch_contact_id: selectedDropDispatchContactDetails.length > 0 ? selectedDropDispatchContactDetails[0].dropDispatchContactId : null,
                        
                        // consignor and consignee details
                        consignor_client_id: selectedConsignorClientData ? selectedConsignorClientData.location_id : null,
                        consignee_client_id: selectedConsigneeClientData ? selectedConsigneeClientData.client_id : null,

                        // other details
                        transport_vehicle_type: transportVehicleType ? transportVehicleType : "",
                        transport_vehicle_details: transportVehicleDetail ? transportVehicleDetail : "",
                        status: lrStatus ? lrStatus : "",
                        vehical_number: vehicleNumber ? vehicleNumber : "",
                        driver_details: driverDetails ? driverDetails : "",
                        lr_last_modified_date: new Date()
                    })
                    .eq("lr_id", fetchedLRData.lr_id)
                    .select(); // this will return the updated record in object

                if (!updatedLRError) {
                    // open toast
                    toast.success("LR Changes updated successfully", {
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
                        "Error while saving LR changes, Please try again later or contact tech support",
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
                // console.warn(err);
            }
        } else {

            var pickupPointRequired = selectedPickupPointData && selectedPickupPointData.length === 0 && !selectedPickupPointData.location_id ? "Name Of Pickup Point, " : "";
            var dropPointRequired = selectedDropPointData && selectedDropPointData.length === 0 && !selectedDropPointData.location_id ? "Name Of Drop Point, " : "";
            var consignorRequired = selectedConsignorClientData && selectedConsignorClientData.length === 0 && !selectedConsignorClientData.client_id ? "Consignor Client Name, " : "";
            var consigneeRequired = selectedConsigneeClientData && selectedConsigneeClientData.length === 0 && !selectedConsigneeClientData.client_id ? "Consignee Client Name" : "";

            // open toast
            toast.error("Please fill all listed required fields before saving ---------" +
                pickupPointRequired + dropPointRequired + consignorRequired + consigneeRequired
            ,{
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
                                        <h3><b>LR Details</b></h3>
                                    </div>

                                    <div className="widget-content">
                                        <Spinner isLoading={isLoading} loadingText={loadingText} />

                                        {/* Start Main fields */}
                                        <div className="pb-4" style={{ padding: "0 2rem" }}>
                                            <Row>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">LR Number</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedLRData.lr_number}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Order Number</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.order_number}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Route</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.pickup_location + "-" + fetchedOrderData.drop_location}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Main fields */}

                                        {/* Start Main fields */}
                                        <div style={{ padding: "0 2rem" }}>
                                            <Row>
                                                <Form.Group as={Col} md="3" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Client Name</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedClientData.client_name}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="9" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Client Address</InputGroup.Text>
                                                        <textarea
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={
                                                                fetchedClientData.address1 + ", " +
                                                                fetchedClientData.address1 + ", " +
                                                                fetchedClientData.area + ", " +
                                                                fetchedClientData.city + ", " +
                                                                fetchedClientData.state + ", " +
                                                                fetchedClientData.pin
                                                            }
                                                            cols="100"
                                                            rows="2"
                                                            style={{
                                                                resize:"both",
                                                                overflowY: "scroll",
                                                                border: "1px solid #dee2e6",
                                                                padding: "10px",
                                                                fontSize: "14px",
                                                                color: "#212529",
                                                                backgroundColor: "#e9ecef",
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                        </div>
                                        {/* End Main fields */}

                                        {/* Pickup Details Block starts */}
                                        <div>
                                            <div className="divider divider-general">
                                                <span><b>Pickup</b></span>
                                            </div>
                                            <div style={{ padding: "0 2rem" }}>
                                                <Row className="mb-3">
                                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                                        <Form.Label>Pickup Location</Form.Label>
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
                                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group as={Col} md="9" controlId="validationCustom01">
                                                        <Form.Label>
                                                            <ul className="option-list">
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
                                                                Name of Pickup Point
                                                                {pickupCitySelection[0] ?
                                                                    <li className="mx-2">
                                                                        <button>
                                                                            <a
                                                                                href="#"
                                                                                data-bs-toggle="modal"
                                                                                data-bs-target="#addLocationModal"
                                                                            >
                                                                                <span className="la la-plus"></span>
                                                                            </a>
                                                                        </button>
                                                                    </li>
                                                                :   ""}
                                                            </ul>
                                                        </Form.Label>
                                                        <Typeahead
                                                            id="pickupPoint"
                                                            disabled={!pickupCitySelection}
                                                            onChange={(e) => {
                                                                setSelectedPickupPoint(e);
                                                                // add logic to show pre loaded values for contacts if they select same point
                                                                setSelectedPickupMarketingContactDetails([]);
                                                                setSelectedPickupDispatchContactDetails([]);
                                                            }}
                                                            className="form-group pb-1"
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
                                                        {selectedPickupPoint && selectedPickupPointData ?
                                                            <>
                                                                <div className="optional" style={{ paddingLeft: "inherit" }}>
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
                                                    <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                                        <Form.Label>
                                                            <ul className="option-list">
                                                                Marketing Contact 
                                                                <li className="mx-2">
                                                                    { selectedPickupPoint[0] && selectedPickupPointData ? 
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
                                                    <Form.Group as={Col} md="6" controlId="validationCustom03">
                                                        <Form.Label>
                                                            <ul className="option-list">
                                                                Dispatch Contact 
                                                                <li className="mx-2">
                                                                    { selectedPickupPoint[0] && selectedPickupPointData ? 
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
                                            <div className="divider divider-general">
                                                <span><b>Drop</b></span>
                                            </div>
                                            <div style={{ padding: "0 2rem" }}>
                                                <Row className="mb-3">
                                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                                        <Form.Label>Drop Location</Form.Label>
                                                        <Typeahead
                                                            id="dropLocation"
                                                            onChange={(e) => {
                                                                setDropCitySelection(e);
                                                                setSelectedDropPoint([]);
                                                                setSelectedDropMarketingContactDetails([]);
                                                                setSelectedDropDispatchContactDetails([]);
                                                            }}
                                                            className="form-group"
                                                            options={cityRefs}
                                                            selected={dropCitySelection}
                                                        />
                                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group as={Col} md="9" controlId="validationCustom01">
                                                        <Form.Label>
                                                            <ul className="option-list">
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
                                                                Name of Drop Point
                                                                {dropCitySelection[0] ?
                                                                    <li className="mx-2">
                                                                        <button>
                                                                            <a
                                                                                href="#"
                                                                                data-bs-toggle="modal"
                                                                                data-bs-target="#addLocationModal"
                                                                            >
                                                                                <span className="la la-plus"></span>
                                                                            </a>
                                                                        </button>
                                                                    </li>
                                                                : ""}
                                                            </ul>
                                                        </Form.Label>
                                                        <Typeahead
                                                            id="dropPoint"
                                                            disabled={!dropCitySelection}
                                                            onChange={(e) => {
                                                                setSelectedDropPoint(e);
                                                                // add logic to show pre loaded values for contacts if they select same point
                                                                setSelectedDropMarketingContactDetails([]);
                                                                setSelectedDropDispatchContactDetails([]);
                                                            }}
                                                            className="form-group pb-1"
                                                            options={dropPointNames}
                                                            selected={selectedDropPoint}
                                                            highlightOnlyResult
                                                            labelKey="dropName"
                                                            renderMenuItemChildren={(option) => (
                                                                <div>
                                                                    <b>
                                                                        {option.dropName}
                                                                    </b>
                                                                    <div className="px-1" style={{ fontSize: "small", whiteSpace: "normal" }}>
                                                                        {option.dropAddress}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            style={{ lineHeight: "normal" }}
                                                        />
                                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                        {selectedDropPoint && selectedDropPointData ?
                                                            <>
                                                                <div className="optional" style={{ paddingLeft: "inherit" }}>
                                                                    <span>{selectedDropPointData.address1 ? selectedDropPointData.address1 + ", " : ""}</span>
                                                                    <span>{selectedDropPointData.address2 ? selectedDropPointData.address2 + ", " : ""}</span>
                                                                    <span>{selectedDropPointData.area ? selectedDropPointData.area + ", " : ""}</span>
                                                                    <span>{selectedDropPointData.city ? selectedDropPointData.city + ", " : ""}</span>
                                                                    <span>{selectedDropPointData.state ? selectedDropPointData.state + ", " : ""}</span>
                                                                    <span>{selectedDropPointData.pin ? selectedDropPointData.pin : ""}</span>
                                                                </div>
                                                            </>
                                                        : ""}
                                                    </Form.Group>
                                                </Row>
                                                <Row className="my-3">
                                                    <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                                        <Form.Label>
                                                            <ul className="option-list">
                                                                Marketing Contact 
                                                                <li className="mx-2">
                                                                    { selectedDropPoint[0] && selectedDropPointData ? 
                                                                        <button>
                                                                            <a
                                                                                href="#"
                                                                                data-bs-toggle="modal"
                                                                                data-bs-target="#addLocationContactModal"
                                                                                onClick={() => {
                                                                                    setIsLocationContactType("Marketing");
                                                                                    setLocationNumber(selectedDropPointData.location_number);
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
                                                            disabled = {!selectedDropPoint[0]}
                                                            onChange={setSelectedDropMarketingContactDetails}
                                                            className="form-group"
                                                            options={dropMarketingContactDetails}
                                                            selected={selectedDropMarketingContactDetails}
                                                            labelKey="dropMarketingContactName"
                                                            renderMenuItemChildren={(option) => (
                                                                <div>
                                                                    {option.dropMarketingContactName}
                                                                </div>
                                                            )}
                                                        />
                                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group as={Col} md="6" controlId="validationCustom03">
                                                        <Form.Label>
                                                            <ul className="option-list">
                                                                Dispatch Contact 
                                                                <li className="mx-2">
                                                                    { selectedDropPoint[0] && selectedDropPointData ? 
                                                                        <button>
                                                                            <a
                                                                                href="#"
                                                                                data-bs-toggle="modal"
                                                                                data-bs-target="#addLocationContactModal"
                                                                                onClick={() => {
                                                                                    setIsLocationContactType("Dispatch");
                                                                                    setLocationNumber(selectedDropPointData.location_number);
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
                                                            disabled = {!selectedDropPoint[0]}
                                                            onChange={setSelectedDropDispatchContactDetails}
                                                            className="form-group"
                                                            options={dropDispatchContactDetails}
                                                            selected={selectedDropDispatchContactDetails}
                                                            labelKey="dropDispatchContactName"
                                                            renderMenuItemChildren={(option) => (
                                                                <div>
                                                                    {option.dropDispatchContactName}
                                                                </div>
                                                            )}
                                                        />
                                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                    </Form.Group>
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
                                                        <Typeahead
                                                            id="consignorCity"
                                                            onChange={(e) => {
                                                                setConsignorCitySelection(e);
                                                                setSelectedConsignorClient([]);
                                                                setSelectedConsignorClientData("");
                                                            }}
                                                            className="form-group"
                                                            options={cityRefs}
                                                            selected={consignorCitySelection}
                                                        />
                                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                        <Form.Control.Feedback type="invalid">
                                                            Please enter Consignor's City.
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group as={Col} md="8" controlId="validationCustom01">
                                                        <Form.Label>
                                                            <ul className="option-list">
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
                                                                <li className="mx-2">
                                                                    { consignorCitySelection[0] ?
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
                                                            id="clientName"
                                                            disabled = {!consignorCitySelection[0]}
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
                                                        <Typeahead
                                                            id="consigneeCity"
                                                            onChange={(e) => {
                                                                setConsigneeCitySelection(e);
                                                                setSelectedConsigneeClient([]);
                                                                setSelectedConsigneeClientData("");
                                                            }}
                                                            className="form-group"
                                                            options={cityRefs}
                                                            selected={consigneeCitySelection}
                                                        />
                                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                        <Form.Control.Feedback type="invalid">
                                                            Please enter Consignee's City.
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group as={Col} md="8" controlId="validationCustom01">
                                                        <Form.Label>
                                                            <ul className="option-list">
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
                                                                <li className="mx-2">
                                                                    { consigneeCitySelection[0] ?
                                                                        <button>
                                                                            <a
                                                                                href="#"
                                                                                data-bs-toggle="modal"
                                                                                data-bs-target="#addClientModal"
                                                                                onClick={() => {
                                                                                    setIsConsignor(false);
                                                                                    setIsConsignee(true);
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
                                                            disabled = {!consigneeCitySelection[0]}
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

                                        {/* Start Other Details fields */}
                                        <div style={{ padding: "0 2rem" }}>
                                            <Row className="pb-3">
                                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                                    <Form.Label>Transport Vehicle</Form.Label>
                                                    <Form.Select
                                                        className="chosen-single form-select"
                                                        size="sm"
                                                        onChange={(e) => {
                                                            setLrDetailsFormData((previousState) => ({
                                                                ...previousState,
                                                                transportVehicleType: e.target.value,
                                                            }));

                                                            if(e.target.value === "Local Vehicle") {
                                                                setTransportVehicleDetail("Crossing");
                                                            } else if (e.target.value === "Main Vehicle") {
                                                                setTransportVehicleDetail("Direct");
                                                            } else {
                                                                setTransportVehicleDetail("");
                                                            }
                                                        }}
                                                        value={transportVehicleType}
                                                    >
                                                        <option value=""></option>
                                                        {transportVehicleTypeReferenceOptions.map(
                                                            (option) => (
                                                                <option key={option} value={option}>
                                                                    {option}
                                                                </option>
                                                            )
                                                        )}
                                                    </Form.Select>
                                                    { transportVehicleDetail ?
                                                            <>
                                                                <div className="optional" style={{ paddingLeft: "inherit" }}>
                                                                    <span>{transportVehicleDetail ? transportVehicleDetail : ""}</span>
                                                                </div>
                                                            </>
                                                    : "" }
                                                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter Consignor's City.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                                    <Form.Label>Status</Form.Label>
                                                    <Form.Select
                                                        className="chosen-single form-select"
                                                        onChange={(e) => { setLrStatus(e.target.value); }}
                                                        value={lrStatus}
                                                        size="sm"
                                                        // required
                                                    >
                                                        <option value=""></option>
                                                        {lRStatusReferenceOptions ? lRStatusReferenceOptions.map(
                                                            (option) => (
                                                                <option value={option.ref_dspl}>
                                                                    {option.ref_dspl}
                                                                </option>
                                                            )
                                                        ) : "" }
                                                    </Form.Select>
                                                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter LR Status.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group as={Col} md="8" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Driver Details</InputGroup.Text>
                                                        <textarea
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            value={driverDetails}
                                                            onChange={(e) => {
                                                                setLrDetailsFormData((previousState) => ({
                                                                    ...previousState,
                                                                    driverDetails: e.target.value,
                                                                }));
                                                            }}    
                                                            cols="75"
                                                            rows="2"
                                                            style={{
                                                                resize: "both",
                                                                overflowY: "scroll",
                                                                border: "1px solid #dee2e6",
                                                                padding: "10px",
                                                                fontSize: "14px",
                                                                color: "#212529"
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <Row className="pb-3">
                                                <Form.Group as={Col} md="6" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Quantity</InputGroup.Text>
                                                        <textarea
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.quantity}
                                                            cols="75"
                                                            rows="2"
                                                            style={{
                                                                resize: "both",
                                                                overflowY: "scroll",
                                                                border: "1px solid #dee2e6",
                                                                padding: "10px",
                                                                fontSize: "14px",
                                                                color: "#212529",
                                                                backgroundColor: "#e9ecef",
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Vehicle Number</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            value={vehicleNumber}
                                                            onChange={(e) => {
                                                                setLrDetailsFormData((previousState) => ({
                                                                    ...previousState,
                                                                    vehicleNumber: e.target.value,
                                                                }));
                                                            }}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <Row className="pb-3">
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Material</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.material}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Weight</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.weight + " Kg"}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Size</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.size}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <Row>
                                                <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Amount</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value="As Per Invoice"
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                                <Form.Group as={Col} md="8" controlId="validationCustomPhonenumber">
                                                    <InputGroup size="sm">
                                                        <InputGroup.Text id="inputGroupPrepend">Truck Driver</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            // placeholder="Username"
                                                            aria-describedby="inputGroupPrepend"
                                                            disabled
                                                            value={fetchedOrderData.truck_details}
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>
                                            <span className="horizontal-divider">
                                            </span>
                                        </div>
                                        {/* End Other Details fields */}

                                    </div>
                                    {/* Page Navigation Buttons */}
                                    <Row className="px-5">
                                        <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                                            <Button
                                                variant="secondary"
                                                onClick={() => { window.history.back(); }}
                                                className="btn btn-back btn-sm text-nowrap m-1"
                                            >
                                                Back
                                            </Button>
                                        </Form.Group>
                                        <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                                            <Button
                                                type="submit"
                                                variant="success"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    saveLRDetails();
                                                }}
                                                className="btn btn-add-lr btn-sm text-nowrap m-1"
                                            >
                                                Save Changes
                                            </Button>
                                        </Form.Group>
                                    </Row>
                                </div>
                            </div>

                            {/* Start of All Popup Modals */}
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
                            {/* End of All Popup Modals */}

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

export default LRDetails;
