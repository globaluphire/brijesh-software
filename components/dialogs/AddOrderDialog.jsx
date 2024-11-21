import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { getLrNumber, getOrderNumber } from "../../utils/generateUniqueNumber";
import { format } from "date-fns";
import AddClientDialog from "./AddClientDialog";
import AddLocationDialog from "./AddLocationDialog";
import AddLocationContactDialog from "./AddLocationContactDialog";

export default function AddOrderDialog({
    addOrderDialogVisible,
    setAddOrderDialogVisible,
    references,
    user,
    setRefreshData,
}) {
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const [pickupDate, setPickupDate] = useState(new Date());

    // all dialog states
    const [addClientDialogVisible, setAddClientDialogVisible] = useState(false);
    const [refreshClientData, setRefreshClientData] = useState(false);
    const [addLocationDialogVisible, setAddLocationDialogVisible] =
        useState(false);
    const [refreshLocationData, setRefreshLocationData] = useState(false);
    const [selectedLocationType, setSelectedLocationType] = useState("");
    const [
        addLocationContactDialogVisible,
        setAddLocationContactDialogVisible,
    ] = useState(false);
    const [refreshLocationContactData, setRefreshLocationContactData] =
        useState(false);
    const [selectedContactType, setSelectedContactType] = useState("");
    const [locationNumber, setLocationNumber] = useState("");

    // form states
    // initialize form field
    const addOrderFields = {
        orderCity: null,
        clientName: null,
        pickupLocation: null,
        dropLocation: null,
        nameOfPickupPoint: null,
        nameOfDroppingPoint: null,
        marketingContact: null,
        dispatchContact: null,
        material: null,
        size: null,
        quantity: "",
        weight: 0,
        priority: null,
        specialOfferedFreight: 0,
        notes: "",
        freightNotes: "",
    };
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
        freightNotes,
    } = useMemo(() => orderFormData, [orderFormData]);

    // initialize form error fields
    const addOrderErrorFields = {
        orderCityError: "",
        clientNameError: "",
        materialError: "",
        sizeError: "",
        quantityError: "",
        weightError: null,
        priorityError: "",
    };
    const [orderFormErrorData, setOrderFormErrorData] = useState(
        JSON.parse(JSON.stringify(addOrderErrorFields))
    );
    const {
        orderCityError,
        clientNameError,
        materialError,
        sizeError,
        quantityError,
        weightError,
        priorityError,
    } = useMemo(() => orderFormErrorData, [orderFormErrorData]);

    // all refs
    const [cityRefs, setCityRefs] = useState([]);
    const [orderCityRefs, setOrderCityRefs] = useState([]);
    const [sizeReferenceOptions, setSizeReferenceOptions] = useState([]);
    const [materialTypeReferenceOptions, setMaterialTypeReferenceOptions] =
        useState([]);
    const [priorityReferenceOptions, setPriorityReferenceOptions] = useState(
        []
    );

    // get references block
    async function getReferences() {
        setCityRefs(references.filter((i) => i.ref_nm === "city"));
        setOrderCityRefs(references.filter((i) => i.ref_nm === "orderCity"));
        setMaterialTypeReferenceOptions(
            references.filter((i) => i.ref_nm === "materialType")
        );
        setSizeReferenceOptions(references.filter((i) => i.ref_nm === "size"));
        setPriorityReferenceOptions(
            references.filter((i) => i.ref_nm === "priority")
        );
    }
    useEffect(() => {
        if (references.length !== 0) getReferences();
    }, [references]);

    // initial data fetch
    // client fields states
    const [fetchedClientsData, setFetchedClientsData] = useState([]);
    const [clientNames, setClientNames] = useState([]);
    const [selectedClient, setSelectedClient] = useState([]);

    // location fields states
    const [fetchedLocationsData, setFetchedLocationsData] = useState([]);
    const [pickupPointData, setPickupPointData] = useState([]);
    const [selectedPickupPoint, setSelectedPickupPoint] = useState([]);

    // location contacts fields states
    const [fetchedLocationsContactsData, setFetchedLocationsContactsData] =
        useState([]);
    const [pickupMarketingContactsData, setPickupMarketingContactsData] =
        useState([]);
    const [pickupDispatchContactsData, setPickupDispatchContactsData] =
        useState([]);
    const [
        selectedPickupMarketingContactsData,
        setSelectedPickupMarketingContactsData,
    ] = useState([]);
    const [
        selectedPickupDispatchContactsData,
        setSelectedPickupDispatchContactsData,
    ] = useState([]);

    async function fetchClients() {
        // fetch client data
        try {
            let { data: clientData, error } = await supabase
                .from("client")
                .select("*");

            if (clientData) {
                setFetchedClientsData(clientData);

                if (refreshClientData) {
                    setRefreshClientData(false);
                }
            }
        } catch (e) {}
    }
    async function fetchLocations() {
        try {
            let { data: locationData, error } = await supabase
                .from("location")
                .select("*");

            if (locationData) {
                setFetchedLocationsData(locationData);

                if (refreshLocationData) {
                    setRefreshLocationData(false);
                    setSelectedLocationType("");
                }
            }
        } catch (e) {}
    }
    async function fetchLocationsContacts() {
        try {
            let { data: locationContactData, error } = await supabase
                .from("location_contact")
                .select("*");

            if (locationContactData) {
                setFetchedLocationsContactsData(locationContactData);

                if (refreshLocationContactData) {
                    setRefreshLocationContactData(false);
                    setSelectedContactType("");
                    setLocationNumber("");
                }
            }
        } catch (e) {}
    }
    useEffect(() => {
        if (addOrderDialogVisible) {
            if (fetchedClientsData.length === 0) fetchClients();
            if (fetchedLocationsData.length === 0) fetchLocations();
            if (fetchedLocationsContactsData.length === 0)
                fetchLocationsContacts();
        }
    }, [addOrderDialogVisible]);

    useEffect(() => {
        if (refreshClientData) {
            fetchClients();
        }
    }, [refreshClientData]);
    useEffect(() => {
        if (refreshLocationData) {
            fetchLocations();
            fetchLocationsContacts();
        }
    }, [refreshLocationData]);
    useEffect(() => {
        if (refreshLocationContactData) {
            fetchLocationsContacts();
        }
    }, [refreshLocationContactData]);

    // get client name on change order city block
    async function getClientDetails() {
        if (fetchedClientsData.length > 0 && orderCity) {
            // set client names
            let filteredClientsData = [];

            filteredClientsData = fetchedClientsData.filter(
                (i) => i.city === orderCity.ref_dspl
            );
            setClientNames(filteredClientsData);
        }
    }
    useEffect(() => {
        getClientDetails();
    }, [orderCity, fetchedClientsData]);

    // get Name of pick up point block
    async function getPickupPointDetails() {
        if (fetchedLocationsData.length > 0 && pickupLocation) {
            let filteredPickupPointData = [];

            filteredPickupPointData = fetchedLocationsData.filter(
                (i) =>
                    i.city === pickupLocation.ref_dspl &&
                    i.location_type === "Pickup"
            );
            setPickupPointData(filteredPickupPointData);
        }
    }
    useEffect(() => {
        getPickupPointDetails();
    }, [pickupLocation, fetchedLocationsData]);

    // get pick up contacts block
    async function getPickupPointContactData() {
        if (selectedPickupPoint && fetchedLocationsContactsData.length > 0) {
            // filterting marketing contact details
            let filteredLocationsContactsData = [];

            filteredLocationsContactsData = fetchedLocationsContactsData.filter(
                (i) => i.location_number === selectedPickupPoint.location_number
            );

            const allPickupMarketingContactNames = [];
            const allPickupDispatchContactNames = [];
            for (let i = 0; i < filteredLocationsContactsData.length; i++) {
                if (
                    filteredLocationsContactsData[i].contact_type ===
                    "Marketing"
                ) {
                    allPickupMarketingContactNames.push({
                        pickupMarketingContactName:
                            filteredLocationsContactsData[i].contact_name +
                            "-" +
                            filteredLocationsContactsData[i].contact_phone,
                        pickupMarketingContactId:
                            filteredLocationsContactsData[i]
                                .location_contact_id,
                    });
                } else {
                    allPickupDispatchContactNames.push({
                        pickupDispatchContactName:
                            filteredLocationsContactsData[i].contact_name +
                            "-" +
                            filteredLocationsContactsData[i].contact_phone,
                        pickupDispatchContactId:
                            filteredLocationsContactsData[i]
                                .location_contact_id,
                    });
                }
            }

            allPickupMarketingContactNames.sort();
            allPickupDispatchContactNames.sort();
            setPickupMarketingContactsData(allPickupMarketingContactNames);
            setPickupDispatchContactsData(allPickupDispatchContactNames);
        }
    }
    useEffect(() => {
        getPickupPointContactData();
    }, [selectedPickupPoint, fetchedLocationsContactsData]);

    const validateForm = (data) => {
        let isValid = true;
        if (!orderCity) {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                orderCityError: "Order City is required.",
            }));
            isValid = false;
        } else {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                orderCityError: "",
            }));
        }

        if (selectedClient.length === 0) {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                clientNameError: "Client Name is required.",
            }));
            isValid = false;
        } else {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                clientNameError: "",
            }));
        }

        if (!material) {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                materialError: "Material is required.",
            }));
            isValid = false;
        } else {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                materialError: "",
            }));
        }

        if (!size) {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                sizeError: "Size is required.",
            }));
            isValid = false;
        } else {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                sizeError: "",
            }));
        }

        if (!priority) {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                priorityError: "Priority is required.",
            }));
            isValid = false;
        } else {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                priorityError: "",
            }));
        }

        if (!quantity) {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                quantityError: "Quantity is required.",
            }));
            isValid = false;
        } else {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                quantityError: "",
            }));
        }

        if (!weight) {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                weightError: "Weight is required.",
            }));
            isValid = false;
        } else {
            setOrderFormErrorData((previousState) => ({
                ...previousState,
                weightError: "",
            }));
        }

        if (!isValid) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Please fill all listed required fields",
            });
        }

        return isValid;
    };

    const resetForm = () => {
        setOrderFormData(JSON.parse(JSON.stringify(addOrderFields)));
        setOrderFormErrorData(JSON.parse(JSON.stringify(addOrderErrorFields)));
        setSelectedClient([]);
        setSelectedPickupPoint([]);
        setSelectedPickupMarketingContactsData([]);
        setSelectedPickupDispatchContactsData([]);
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
                    pickup_location_id: !Array.isArray(selectedPickupPoint)
                        ? selectedPickupPoint.location_id
                        : null,
                    pickup_marketing_contact_id: !Array.isArray(
                        selectedPickupMarketingContactsData
                    )
                        ? selectedPickupMarketingContactsData.pickupMarketingContactId
                        : null,
                    pickup_dispatch_contact_id: !Array.isArray(
                        selectedPickupDispatchContactsData
                    )
                        ? selectedPickupDispatchContactsData.pickupDispatchContactId
                        : null,

                    // consignor and consignee details
                    consignor_client_id: !Array.isArray(selectedPickupPoint)
                        ? selectedPickupPoint.location_id
                        : null,
                    consignee_client_id: selectedClient
                        ? selectedClient.client_id
                        : null,
                },
            ]);
            if (error) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while generating LR, Please try again later or contact tech support",
                });
            } else {
                // open toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New LR generated successfully",
                });

                // increment lr_number key
                await supabase.rpc("increment_sys_key", {
                    x: 1,
                    keyname: "lr_number",
                });
            }
        } catch (e) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Errors while generating LR, Please try again later or contact tech support",
            });
        }
    }

    const addNewOrder = async () => {
        // generate order
        try {
            const lrNumber = await getLrNumber();
            const orderNumber = await getOrderNumber();

            const { data, error } = await supabase
                .from("orders")
                .insert([
                    {
                        order_number: orderNumber,
                        pickup_date: format(pickupDate, "yyyy-MM-dd"),
                        order_city: orderCity.ref_dspl,
                        client_name: selectedClient.client_name,
                        pickup_location: pickupLocation
                            ? pickupLocation.ref_dspl
                            : "",
                        drop_location: dropLocation
                            ? dropLocation.ref_dspl
                            : "",
                        material: material.ref_dspl,
                        size: size.ref_dspl,
                        quantity: quantity,
                        weight: weight,
                        priority: priority.ref_dspl,
                        special_offered_freight: specialOfferedFreight,
                        notes: notes,
                        freight_notes: freightNotes,
                        status: "Under pickup process",
                        order_created_by: user.id,
                        client_number: selectedClient.client_number,
                    },
                ])
                .select();
            if (error) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while placing order, Please try again later or contact tech support",
                });
            } else {
                // open toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Order placed successfully",
                });

                // increment order_number key
                await supabase.rpc("increment_sys_key", {
                    x: 1,
                    keyname: "order_number",
                });

                resetForm();

                if (data[0].order_id) {
                    // TODO: Integrate below code
                    //   axios({
                    //     method: "POST",
                    //     url: "/api/orderReport/addOrderNotify",
                    //     data: {
                    //       redirectionUrl: `https://www.raftaarlogistics.com/employers-dashboard/order-details/${data[0].order_id}`,
                    //       orderCity: data[0].order_city,
                    //       clientName: data[0].client_name,
                    //       pickupDate: convertToFullDateFormat(data[0].pickup_date, false),
                    //       pickupLocation: data[0].pickup_location,
                    //       dropLocation: data[0].drop_location,
                    //       material: data[0].material,
                    //       size: data[0].size,
                    //       priority: data[0].priority,
                    //       quantity: data[0].quantity,
                    //       weight: data[0].weight,
                    //     },
                    //   });

                    // generate LR
                    try {
                        await generateLR(lrNumber, data[0].order_id);
                    } catch {
                        // open toast
                        toast.current.show({
                            severity: "error",
                            summary: "Error",
                            detail: "Error while generating LR, Please try to generate manually from Open Orders page",
                        });
                    }
                } else {
                    // open toast
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Unable to find required details to generate LR, Please try to generate manually from Open Orders page",
                    });
                }
            }
        } catch (err) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while placing Order, Please try again later or contact tech support",
            });
        }
    };

    const saveChanges = () => {
        setLoading(true);

        if (validateForm()) {
            try {
                addNewOrder().then(() => {
                    setAddOrderDialogVisible(false);
                    setLoading(false);
                    setRefreshData(true);
                });
            } catch (e) {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const footerContent = (
        <div>
            <span className="px-3">
                <Button
                    label="Reset"
                    outlined
                    icon="pi pi-times"
                    onClick={resetForm}
                    severity="danger"
                />
            </span>
            <Button
                label="Add Order"
                outlined
                icon="pi pi-check"
                autoFocus
                loading={loading}
                onClick={saveChanges}
            />
        </div>
    );

    const pickupPointDataTemplate = (option) => {
        return (
            <div className="w-30rem">
                <b>{option.name_of_pickup_point}</b> <br />
                <div
                    className="px-1 text-color-secondary text-sm"
                    style={{ whiteSpace: "normal" }}
                >
                    {[
                        option.address1,
                        option.address2,
                        option.area,
                        option.city,
                        option.state,
                        option.pin,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} appendTo={null} />

            <Dialog
                header={"Place Order"}
                visible={addOrderDialogVisible}
                style={{
                    width: "90vw",
                    height: "80vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!addOrderDialogVisible) return;
                    setAddOrderDialogVisible(false);
                    setOrderFormErrorData(
                        JSON.parse(JSON.stringify(addOrderErrorFields))
                    );
                }}
                footer={footerContent}
                maximizable
            >
                <div className="grid p-fluid mt-1">
                    <div className="col-12">
                        <div className="card">
                            {/* <h5>Advanced</h5> */}
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-3 md:col-6">
                                    <label htmlFor="orderCity">
                                        Order City*
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="orderCity"
                                        options={orderCityRefs}
                                        optionLabel="ref_dspl"
                                        placeholder="Select order city"
                                        filter
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    orderCity: e.target.value,
                                                })
                                            );
                                            setSelectedClient([]);
                                        }}
                                        value={orderCity}
                                    />
                                    {orderCityError ? (
                                        <Message
                                            severity="error"
                                            text={orderCityError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientName">
                                        Client Name*
                                        {orderCity ? (
                                            <Button
                                                className="mx-2 action-badge add-dialog-action-badge"
                                                icon="pi pi-plus"
                                                style={{
                                                    marginTop: "-7px",
                                                    height: "1rem",
                                                    width: "2rem",
                                                }}
                                                onClick={() => {
                                                    setAddClientDialogVisible(
                                                        true
                                                    );
                                                }}
                                            ></Button>
                                        ) : (
                                            ""
                                        )}
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="clientName"
                                        disabled={!orderCity}
                                        value={selectedClient}
                                        options={clientNames}
                                        optionLabel="client_name"
                                        placeholder="Select a client"
                                        filter
                                        onChange={(e) => {
                                            setSelectedClient(e.target.value);
                                        }}
                                    />
                                    {clientNameError ? (
                                        <Message
                                            severity="error"
                                            text={clientNameError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                    {selectedClient ? (
                                        <>
                                            <div className="text-color-secondary text-sm px-3 pt-1">
                                                <span>
                                                    {selectedClient.address1
                                                        ? selectedClient.address1 +
                                                          ", "
                                                        : ""}
                                                </span>
                                                <span>
                                                    {selectedClient.address2
                                                        ? selectedClient.address2 +
                                                          ", "
                                                        : ""}
                                                </span>
                                                <span>
                                                    {selectedClient.area
                                                        ? selectedClient.area +
                                                          ", "
                                                        : ""}
                                                </span>
                                                <span>
                                                    {selectedClient.city
                                                        ? selectedClient.city +
                                                          ", "
                                                        : ""}
                                                </span>
                                                <span>
                                                    {selectedClient.state
                                                        ? selectedClient.state +
                                                          ", "
                                                        : ""}
                                                </span>
                                                <span>
                                                    {selectedClient.pin
                                                        ? selectedClient.pin
                                                        : ""}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <h5>Pickup Details</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-2 md:col-6">
                                    <label htmlFor="pickupDate">
                                        Pickup Date*
                                    </label>
                                    <Calendar
                                        id="pickupDate"
                                        dateFormat="dd/mm/yy"
                                        mask="99/99/9999"
                                        value={pickupDate} // TODO: needed Indian timezone
                                        disabled
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="pickupLocation">
                                        Pickup Location
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="pickupLocation"
                                        value={pickupLocation}
                                        options={cityRefs}
                                        optionLabel="ref_dspl"
                                        placeholder="Select a pickup location"
                                        filter
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    pickupLocation:
                                                        e.target.value,
                                                })
                                            );
                                            setSelectedPickupPoint([]);
                                            setSelectedPickupMarketingContactsData(
                                                []
                                            );
                                            setSelectedPickupDispatchContactsData(
                                                []
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-12">
                                    <label htmlFor="nameOfPickupPoint">
                                        Name of Pickup Point
                                        {pickupLocation ? (
                                            <Button
                                                className="mx-2 action-badge add-dialog-action-badge"
                                                icon="pi pi-plus"
                                                style={{
                                                    marginTop: "-7px",
                                                    height: "1rem",
                                                    width: "2rem",
                                                }}
                                                onClick={() => {
                                                    setAddLocationDialogVisible(
                                                        true
                                                    );
                                                    setSelectedLocationType(
                                                        "Pickup"
                                                    );
                                                }}
                                            ></Button>
                                        ) : (
                                            ""
                                        )}
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="nameOfPickupPoint"
                                        disabled={!pickupLocation}
                                        value={selectedPickupPoint}
                                        options={pickupPointData}
                                        optionLabel="name_of_pickup_point"
                                        placeholder="Select a pickup point"
                                        filter
                                        onChange={(e) => {
                                            setSelectedPickupPoint(
                                                e.target.value
                                            );
                                            setSelectedPickupMarketingContactsData(
                                                []
                                            );
                                            setSelectedPickupDispatchContactsData(
                                                []
                                            );
                                        }}
                                        // valueTemplate={selectedCountryTemplate}
                                        itemTemplate={pickupPointDataTemplate}
                                    />
                                    {selectedPickupPoint ? (
                                        <>
                                            <div className="text-color-secondary text-sm px-3 pt-1">
                                                {[
                                                    selectedPickupPoint.address1,
                                                    selectedPickupPoint.address2,
                                                    selectedPickupPoint.area,
                                                    selectedPickupPoint.city,
                                                    selectedPickupPoint.state,
                                                    selectedPickupPoint.pin,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </div>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-3 md:col-6">
                                    <label htmlFor="pickupMarketingContact">
                                        Marketing Contact
                                        {!Array.isArray(selectedPickupPoint) ? (
                                            <Button
                                                className="mx-2 action-badge add-dialog-action-badge"
                                                icon="pi pi-plus"
                                                style={{
                                                    marginTop: "-7px",
                                                    height: "1rem",
                                                    width: "2rem",
                                                }}
                                                onClick={() => {
                                                    setAddLocationContactDialogVisible(
                                                        true
                                                    );
                                                    setSelectedContactType(
                                                        "Marketing"
                                                    );
                                                    setLocationNumber(
                                                        selectedPickupPoint.location_number
                                                    );
                                                }}
                                            ></Button>
                                        ) : (
                                            ""
                                        )}
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="pickupMarketingContact"
                                        disabled={Array.isArray(
                                            selectedPickupPoint
                                        )}
                                        value={
                                            selectedPickupMarketingContactsData
                                        }
                                        options={pickupMarketingContactsData}
                                        optionLabel="pickupMarketingContactName"
                                        placeholder="Select a marketing contact"
                                        filter
                                        onChange={(e) => {
                                            setSelectedPickupMarketingContactsData(
                                                e.target.value
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12 lg:col-3 md:col-6">
                                    <label htmlFor="pickupMarketingContact">
                                        Dispatch Contact
                                        {!Array.isArray(selectedPickupPoint) ? (
                                            <Button
                                                className="mx-2 action-badge add-dialog-action-badge"
                                                icon="pi pi-plus"
                                                style={{
                                                    marginTop: "-7px",
                                                    height: "1rem",
                                                    width: "2rem",
                                                }}
                                                onClick={() => {
                                                    setAddLocationContactDialogVisible(
                                                        true
                                                    );
                                                    setSelectedContactType(
                                                        "Dispatch"
                                                    );
                                                    setLocationNumber(
                                                        selectedPickupPoint.location_number
                                                    );
                                                }}
                                            ></Button>
                                        ) : (
                                            ""
                                        )}
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="pickupDispatchContact"
                                        disabled={Array.isArray(
                                            selectedPickupPoint
                                        )}
                                        value={
                                            selectedPickupDispatchContactsData
                                        }
                                        options={pickupDispatchContactsData}
                                        optionLabel="pickupDispatchContactName"
                                        placeholder="Select a dispatch contact"
                                        filter
                                        onChange={(e) => {
                                            setSelectedPickupDispatchContactsData(
                                                e.target.value
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <h5>Drop Details</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-4 md:col-6">
                                    <label htmlFor="dropLocation">
                                        Drop Location
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="dropLocation"
                                        value={dropLocation}
                                        options={cityRefs}
                                        optionLabel="ref_dspl"
                                        placeholder="Select a drop location"
                                        filter
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    dropLocation:
                                                        e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <h5>Consignor</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-4 md:col-6">
                                    <label htmlFor="consignorCity">City</label>
                                    <InputText
                                        type="text"
                                        value={
                                            pickupLocation &&
                                            pickupLocation.ref_dspl
                                                ? pickupLocation.ref_dspl
                                                : ""
                                        }
                                        disabled
                                    />
                                </div>
                                <div className="field col-12 lg:col-8 md:col-6">
                                    <label htmlFor="consignorClientName">
                                        Client Name
                                    </label>
                                    <InputText
                                        type="text"
                                        value={
                                            selectedPickupPoint &&
                                            selectedPickupPoint.name_of_pickup_point
                                                ? selectedPickupPoint.name_of_pickup_point
                                                : ""
                                        }
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <h5>Consignee</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-4 md:col-6">
                                    <label htmlFor="consigneeCity">City</label>
                                    <InputText
                                        type="text"
                                        value={
                                            orderCity && orderCity.ref_dspl
                                                ? orderCity.ref_dspl
                                                : ""
                                        }
                                        disabled
                                    />
                                </div>
                                <div className="field col-12 lg:col-8 md:col-6">
                                    <label htmlFor="consigneeClientName">
                                        Client Name
                                    </label>
                                    <InputText
                                        type="text"
                                        value={
                                            selectedClient &&
                                            selectedClient.client_name
                                                ? selectedClient.client_name
                                                : ""
                                        }
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <h5>Material Details</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-4 md:col-6">
                                    <label htmlFor="material">Material*</label>
                                    <Dropdown
                                        showClear
                                        id="material"
                                        value={material}
                                        options={materialTypeReferenceOptions}
                                        optionLabel="ref_dspl"
                                        placeholder="select material type"
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    material: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {materialError ? (
                                        <Message
                                            severity="error"
                                            text={materialError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-4 md:col-6">
                                    <label htmlFor="size">Size*</label>
                                    <Dropdown
                                        showClear
                                        id="size"
                                        value={size}
                                        options={sizeReferenceOptions}
                                        optionLabel="ref_dspl"
                                        placeholder="select size"
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    size: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {sizeError ? (
                                        <Message
                                            severity="error"
                                            text={sizeError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-4 md:col-6">
                                    <label htmlFor="priority">Priority*</label>
                                    <Dropdown
                                        showClear
                                        id="priority"
                                        value={priority}
                                        options={priorityReferenceOptions}
                                        optionLabel="ref_dspl"
                                        placeholder="select priority"
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    priority: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {priorityError ? (
                                        <Message
                                            severity="error"
                                            text={priorityError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-12">
                                    <label htmlFor="quantity">Quantity*</label>
                                    <InputText
                                        placeholder="Enter order quantity"
                                        value={quantity}
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    quantity: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {quantityError ? (
                                        <Message
                                            severity="error"
                                            text={quantityError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-3 md:col-6">
                                    <label htmlFor="weight">Weight*</label>
                                    <InputNumber
                                        id="weight"
                                        value={weight}
                                        min={0}
                                        locale="en-IN"
                                        suffix=" Kg"
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    weight: e.value,
                                                })
                                            );
                                        }}
                                    />
                                    {weightError ? (
                                        <Message
                                            severity="error"
                                            text={weightError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-3 md:col-6">
                                    <label htmlFor="specialOfferedFreight">
                                        Special Offered Freight
                                    </label>
                                    <InputNumber
                                        id="specialOfferedFreight"
                                        value={specialOfferedFreight}
                                        // onValueChange={(e) => setValue4(e.value)}
                                        min={0}
                                        locale="en-IN"
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    specialOfferedFreight:
                                                        e.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <h5>Additional Details</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-6 md:col-12">
                                    <label htmlFor="notes">Notes</label>
                                    <InputTextarea
                                        id="notes"
                                        value={notes}
                                        placeholder="Add order notes"
                                        rows={3}
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    notes: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-12">
                                    <label htmlFor="freightNotes">
                                        Freight Notes
                                    </label>
                                    <InputTextarea
                                        id="freightNotes"
                                        value={freightNotes}
                                        placeholder="Add freight notes"
                                        rows={3}
                                        onChange={(e) => {
                                            setOrderFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    freightNotes:
                                                        e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            <AddClientDialog
                addClientDialogVisible={addClientDialogVisible}
                setAddClientDialogVisible={setAddClientDialogVisible}
                references={references}
                user={user}
                setRefreshClientData={setRefreshClientData}
            />

            <AddLocationDialog
                addLocationDialogVisible={addLocationDialogVisible}
                setAddLocationDialogVisible={setAddLocationDialogVisible}
                references={references}
                user={user}
                setRefreshLocationData={setRefreshLocationData}
                selectedLocationType={selectedLocationType}
                setSelectedLocationType={setSelectedLocationType}
            />

            <AddLocationContactDialog
                addLocationContactDialogVisible={
                    addLocationContactDialogVisible
                }
                setAddLocationContactDialogVisible={
                    setAddLocationContactDialogVisible
                }
                references={references}
                user={user}
                setRefreshLocationContactData={setRefreshLocationContactData}
                selectedContactType={selectedContactType}
                setSelectedContactType={setSelectedContactType}
                locationNumber={locationNumber}
            />
        </>
    );
}
