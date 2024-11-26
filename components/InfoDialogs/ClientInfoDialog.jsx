import { Dialog } from "primereact/dialog";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Toast } from "primereact/toast";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import { Badge } from "primereact/badge";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { getLrNumber } from "../../utils/generateUniqueNumber";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import AddOrderDialog from "../dialogs/AddOrderDialog";
import OpenOrderDialog from "../dialogs/OpenOrderDialog";
import LrDialog from "../dialogs/LrDialog";
import CreateInvoiceDialog from "../dialogs/CreateInvoiceDialog";
import Spinner from "../spinner";
import { Tag } from "primereact/tag";

export default function ClientInfoDialog({
    clientInfoDialogVisible,
    setClientInfoDialogVisible,
    references,
    user,
    setRefreshClientData,
    clientDetails,
    setClientDetails,
}) {
    const [loading1, setLoading1] = useState(false);
    const toast = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [xlsxData, setXlsxData] = useState([]);

    const [fetchedOrdersData, setFetchedOrdersData] = useState([]);
    const [totalDebitAmount, setTotalDebitAmount] = useState(0);
    const [totalCreditAmount, setTotalCreditAmount] = useState(0);

    const [filters1, setFilters1] = useState(null);
    const [globalFilterValue1, setGlobalFilterValue1] = useState("");

    // All dialog states
    const [refreshData, setRefreshData] = useState(false);
    const [orderDetailsDialogVisible, setOrderDetailsDialogVisible] =
        useState(false);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState({
        editedOrderId: "",
        editedOrderNumber: "",
        editedQuantity: "",
        editedMaterial: {},
        editedPriority: {},
        editedSize: {},
        editedWeight: null,
        editedEwayNumber: "",
        editedEwayVerified: null,
        editedCompanyName: "",
        editedLocalTransport: "",
        editedTruckDetails: "",
        editedOrderCreatedDate: "",
        editedOrderUpdatedDate: "",
        editedOrderNotes: "",
        editedOrderLocation: "",
        editedStatus: "",
        editedPickupLocation: "",
        editedDropLocation: "",
    });
    const [lrDetailsDialogVisible, setLrDetailsDialogVisible] = useState(false);
    const [addOrderDialogVisible, setAddOrderDialogVisible] = useState(false);
    const [createInvoiceDialogVisible, setCreateInvoiceDialogVisible] =
        useState(false);

    // LR Details states
    const [fetchedOrderData, setFetchedOrderData] = useState([]);
    const [fetchedLRData, setFetchedLRData] = useState([]);
    const [fetchedClientData, setFetchedClientData] = useState([]);
    const [fetchedPickupLocationData, setFetchedPickupLocationData] = useState(
        []
    );
    const [
        fetchedPickupLocationMarketingData,
        setFetchedPickupLocationMarketingData,
    ] = useState([]);
    const [
        fetchedpickupLocationDispatchData,
        setFetchedPickupLocationDispatchData,
    ] = useState([]);
    const [fetchedDropLocationData, setFetchedDropLocationData] = useState([]);
    const [
        fetchedDropLocationMarketingData,
        setFetchedDropLocationMarketingData,
    ] = useState([]);
    const [
        fetchedDropLocationDispatchData,
        setFetchedDropLocationDispatchData,
    ] = useState([]);

    const [fetchedConsignorClientsData, setFetchedConsignorClientsData] =
        useState([]);
    const [fetchedConsigneeClientsData, setFetchedConsigneeClientsData] =
        useState([]);

    const dateFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                }) +
                ", " +
                date.getFullYear()
            );
        }
    };

    const dateTimeFormat = (val) => {
        if (val) {
            return new Date(val);
        }
    };

    const convertPickupDateFormat = (val) => {
        if (val) {
            return new Date(
                val.split("-")[0],
                val.split("-")[1] - 1,
                val.split("-")[2]
            ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
    };

    const clearFilter1 = () => {
        initFilters1();
    };

    const onGlobalFilterChange1 = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters1 };
        _filters1["global"].value = value;

        setFilters1(_filters1);
        setGlobalFilterValue1(value);
    };

    const initFilters1 = () => {
        setFilters1({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });
        setGlobalFilterValue1("");
    };

    async function fetchData() {
        setLoading1(true);
        if (clientDetails.editedClientNumber) {
            try {
                // fetch Orders
                let { data: ordersData, error } = await supabase
                    .from("new_order_view")
                    .select("*")
                    .eq("client_number", clientDetails.editedClientNumber)
                    .order("order_created_at", {
                        ascending: false,
                        nullsFirst: false,
                    });

                if (ordersData && ordersData.length > 0) {
                    ordersData.forEach(
                        (order) =>
                            (order.order_created_at = dateTimeFormat(
                                order.order_created_at
                            ))
                    );
                    ordersData.forEach(
                        (order) =>
                            (order.order_updated_at = dateTimeFormat(
                                order.order_updated_at
                            ))
                    );
                    ordersData.forEach(
                        (order) =>
                            (order.status_last_updated_at = dateTimeFormat(
                                order.status_last_updated_at
                            ))
                    );

                    ordersData.forEach(
                        (i) =>
                            (i.pickup_date = convertPickupDateFormat(
                                i.pickup_date
                            ))
                    );

                    setXlsxData(ordersData);
                    setFetchedOrdersData(ordersData);
                    setRefreshData(false);

                    // fetch invoices
                    let { data: invoiceData, error } = await supabase
                        .from("invoice_view")
                        .select("total_amount, is_paid")
                        .eq("client_number", clientDetails.editedClientNumber);

                    if (invoiceData && invoiceData.length > 0) {
                        var totalDebAmount = 0;
                        var totalCredAmount = 0;
                        for (let i = 0; i < invoiceData.length; i++) {
                            if (invoiceData[i].is_paid) {
                                totalCredAmount =
                                    totalCredAmount +
                                    invoiceData[i].total_amount;
                            } else {
                                totalDebAmount =
                                    totalDebAmount +
                                    invoiceData[i].total_amount;
                            }
                        }
                        setTotalDebitAmount(totalDebAmount);
                        setTotalCreditAmount(totalCredAmount);
                    }
                    setLoading1(false);
                }
            } catch (e) {
                // toast.error(
                //   "System is unavailable.  Unable to fetch Client Data.  Please try again later or contact tech support!",
                //   {
                //     position: "bottom-right",
                //     autoClose: false,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: "colored",
                //   }
                // );
                // console.warn(e);
                // setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        fetchData();
        initFilters1();
    }, [clientDetails.editedClientNumber]);

    useEffect(() => {
        if (refreshData) fetchData();
    }, [refreshData]);

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            // prepare sheet data
            xlsxData.forEach(
                (i) =>
                    (i.order_created_at =
                        i.order_created_at.toLocaleString("en-IN"))
            );
            xlsxData.forEach(
                (i) =>
                    (i.order_updated_at =
                        i.order_updated_at.toLocaleString("en-IN"))
            );
            let ws = xlsxData.map(
                ({
                    order_id,
                    pickup_location,
                    drop_location,
                    order_created_by,
                    client_number,
                    order_updated_by,
                    ...rest
                }) => {
                    return {
                        Route: `${pickup_location} - ${drop_location}`,
                        ...rest,
                    };
                }
            );
            ws = ws.map(
                ({
                    order_created_at,
                    order_updated_at,
                    pickup_date,
                    order_number,
                    Route,
                    status,
                    client_name,
                    pickup_point,
                    drop_point,
                    company_name,
                    weight,
                    quantity,
                    material,
                    size,
                    priority,
                    notes,
                    lr_number,
                    local_transport,
                    truck_details,
                    eway_number,
                    order_city,
                }) => ({
                    "Created on": order_created_at,
                    "Updated on": order_updated_at,
                    "Pickup Date": pickup_date,
                    "ERP Order No": order_number,
                    Route,
                    Status: status,
                    "Client Name": client_name,
                    "Pickup Point": pickup_point,
                    "Drop Point": drop_point,
                    "Company Name": company_name,
                    "Total Weight(Kg)": weight,
                    Quantity: quantity,
                    Material: material,
                    Size: size,
                    Priority: priority,
                    "Order Note": notes,
                    "LR number": lr_number,
                    "Local Transport": local_transport,
                    "Truck Details": truck_details,
                    "Eway Bill Number": eway_number,
                    "Order City": order_city,
                })
            );

            const worksheet = xlsx.utils.json_to_sheet(ws);
            /* create workbook and export */
            var wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, worksheet, "Open orders");
            xlsx.writeFile(
                wb,
                `Raftaar-Open_Orders-${("0" + new Date().getDate()).slice(
                    -2
                )}_${("0" + (new Date().getMonth() + 1)).slice(
                    -2
                )}_${new Date().getFullYear()}.xlsx`
            );
        });
    };

    const renderHeader1 = () => {
        return (
            <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-1">
                    <Button
                        type="button"
                        icon="pi pi-filter-slash"
                        label="Clear"
                        severity="secondary"
                        onClick={clearFilter1}
                    />
                </div>
                <div className="field col-12 lg:col-4">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilterValue1}
                            onChange={onGlobalFilterChange1}
                            placeholder="Keyword Search"
                        />
                    </span>
                </div>
                <div className="field col-12 lg:col-3"></div>
                <div className="field col-12 lg:col-2">
                    <Button
                        type="button"
                        icon="pi pi-file-excel"
                        severity="success"
                        raised
                        onClick={exportExcel}
                        label="Export to Excel"
                        className="mr-3"
                        placeholder="Top"
                        tooltip="Export to Excel"
                        tooltipOptions={{ position: "top" }}
                    />
                </div>
                <div className="field col-12 lg:col-2">
                    <Button
                        type="button"
                        icon="pi pi-plus"
                        label="Add Order"
                        outlined
                        onClick={() => {
                            setAddOrderDialogVisible(true);
                        }}
                    />
                </div>
            </div>
        );
    };
    const header1 = renderHeader1();

    const handleAccept = async (orderId) => {
        const lrNumber = await getLrNumber();

        try {
            const { data, error } = await supabase.from("lr").insert([
                {
                    lr_number: lrNumber,
                    order_id: orderId,
                    status: "Performa",
                    lr_created_by: user.id,
                },
            ]);
            if (error) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while generating LR, Please try again later or contact tech support",
                    life: 5000,
                });
            } else {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New LR generated successfully",
                    life: 5000,
                });

                // increment lr_number key
                await supabase.rpc("increment_sys_key", {
                    x: 1,
                    keyname: "lr_number",
                });

                setRefreshData(true);
            }
        } catch (e) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while fetching required details to generate LR, Please try again later or contact tech support",
                life: 5000,
            });
        }
    };
    const createLrConfirmPopup = (orderId, lrCount) => {
        confirmDialog({
            message:
                "This order have " +
                lrCount +
                " LR(s)! Are you sure want to create new LR??",
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                handleAccept(orderId);
            },
        });
    };

    //    All Render Blocks
    const actionButtonRender1 = (rowData) => {
        return (
            <div className="flex flex-wrap justify-content-center">
                {!rowData.invoice_number ? (
                    <Button
                        className="action-badge"
                        rounded
                        text
                        icon="pi pi-plus"
                        style={{
                            backgroundColor: "#BD2025",
                            height: "2.25rem",
                            width: "2.25rem",
                            color: "white",
                        }}
                        onClick={() => {
                            setCreateInvoiceDialogVisible(true);
                            setSelectedOrder(rowData);
                        }}
                    ></Button>
                ) : (
                    <Button
                        className="action-badge"
                        rounded
                        text
                        icon="pi pi-eye"
                        style={{
                            backgroundColor: "#14A24A",
                            height: "2.25rem",
                            width: "2.25rem",
                            color: "white",
                        }}
                        onClick={() => {
                            setCreateInvoiceDialogVisible(true);
                            setSelectedOrder(rowData);
                        }}
                    ></Button>
                )}
            </div>
        );
    };

    const actionButtonRender2 = (rowData) => {
        return (
            <div className="flex flex-wrap justify-content-center">
                <Button
                    outlined
                    className="action-badge mt-1"
                    onClick={() => {
                        createLrConfirmPopup(
                            rowData.order_id,
                            rowData.lr_number.split(", ").length
                        );
                    }}
                    rounded
                    style={{
                        height: "2.25rem",
                        width: "2.25rem",
                    }}
                    severity="info"
                    icon="pi pi-plus"
                ></Button>
            </div>
        );
    };

    const createdUpdatedDateRender = (rowData) => {
        return (
            <>
                <span className="text-xs">
                    {rowData.order_created_at.toLocaleString("en-IN")}
                </span>{" "}
                <br />
                <span className="text-xs">
                    {rowData.order_updated_at
                        ? rowData.order_updated_at.toLocaleString("en-IN")
                        : ""}
                </span>
            </>
        );
    };

    const orderCreatedInfoRender = (rowData) => {
        return (
            <>
                <span>{rowData.order_created_by_name}</span> <br />
                <span>
                    {rowData.order_updated_by_name
                        ? rowData.order_updated_by_name
                        : "-"}
                </span>
            </>
        );
    };

    const orderDetailsDialogRender = (rowData) => {
        return (
            <>
                <a
                    onClick={() => {
                        setOrderDetailsDialogVisible(true);
                        setSelectedOrder(rowData);
                        setSelectedOrderDetails((previousState) => ({
                            ...previousState,
                            editedOrderId: rowData.order_id,
                            editedOrderNumber: rowData.order_number,
                            editedQuantity: rowData.quantity,
                            editedMaterial: references.filter(
                                (i) =>
                                    i.ref_nm === "materialType" &&
                                    i.ref_dspl === rowData.material
                            )[0],
                            editedPriority: references.filter(
                                (i) =>
                                    i.ref_nm === "priority" &&
                                    i.ref_dspl === rowData.priority
                            )[0],
                            editedSize: references.filter(
                                (i) =>
                                    i.ref_nm === "size" &&
                                    i.ref_dspl === rowData.size
                            )[0],
                            editedWeight: rowData.weight,
                            editedEwayNumber: rowData.eway_number,
                            editedEwayVerified: rowData.eway_verified,
                            editedCompanyName: rowData.company_name,
                            editedLocalTransport: rowData.local_transport,
                            editedTruckDetails: rowData.truck_details,
                            editedOrderCreatedDate: rowData.order_created_at,
                            editedOrderUpdatedDate: rowData.order_updated_at,
                            editedOrderNotes: rowData.notes,
                            editedOrderLocation: rowData.order_city,
                            editedStatus: rowData.status,
                            editedPickupLocation: rowData.pickup_location,
                            editedDropLocation: rowData.drop_location,
                        }));
                    }}
                >
                    {rowData.order_number}
                </a>
            </>
        );
    };

    const preparingDataForLrDialog = async (lrNumber, row) => {
        setIsLoading(true);
        setLoadingText("Please wait... LR Details are loading");
        try {
            /**
             *  Fetch LR Details
             *  @lrNumber
             */
            let { data: lrData, error: lrError } = await supabase
                .from("lr")
                .select("*")
                .eq("lr_number", lrNumber);

            if (lrData) {
                lrData = lrData[0];
                setFetchedLRData(lrData);
                setFetchedOrderData(row);

                /**
                 *  Fetch Client and Details
                 *  @order.client_number
                 */
                if (row.client_number) {
                    let { data: clientData, error: e } = await supabase
                        .from("client")
                        .select("*")
                        .eq("client_number", row.client_number);
                    if (clientData) {
                        setFetchedClientData(
                            clientData.filter(
                                (i) => i.client_number === row.client_number
                            )[0]
                        );
                    }
                }

                if (lrData && lrData.consignee_client_id) {
                    let { data: consigneeClientData, error: er } =
                        await supabase
                            .from("client")
                            .select("*")
                            .eq("client_id", lrData.consignee_client_id);

                    if (consigneeClientData) {
                        setFetchedConsigneeClientsData(consigneeClientData[0]);
                    }
                }

                /**
                 *  Fetch Pick up Location, Drop Location, Consignor Details
                 *  @order.pickup_location_number
                 */
                let locationQueryParamArray = [
                    lrData.pickup_location_id,
                    lrData.drop_location_id,
                    lrData.consignor_client_id,
                ].filter((value) => value !== null);

                let { data: locationData, error: pickupLocationError } =
                    await supabase
                        .from("location")
                        .select("*")
                        .in("location_id", locationQueryParamArray);

                if (locationData) {
                    setFetchedPickupLocationData(
                        locationData.filter(
                            (i) => i.location_id === lrData.pickup_location_id
                        )[0]
                    );
                    setFetchedDropLocationData(
                        locationData.filter(
                            (i) => i.location_id === lrData.drop_location_id
                        )[0]
                    );
                    setFetchedConsignorClientsData(
                        locationData.filter(
                            (i) => i.location_id === lrData.consignor_client_id
                        )[0]
                    );
                }

                /**
                 *  Fetch
                 *    pickup Location Marketing Contact data,
                 *    Pick up Location Dispatch Contact data,
                 *    Drop Location Marketing Contact data,
                 *    Drop Location Dispatch Contact data
                 */
                let locationContactQueryParamArray = [
                    lrData.pickup_marketing_contact_id,
                    lrData.pickup_dispatch_contact_id,
                    lrData.drop_marketing_contact_id,
                    lrData.drop_dispatch_contact_id,
                ].filter((value) => value !== null);

                let {
                    data: locatinContactData,
                    error: pickupLocationMarketingError,
                } = await supabase
                    .from("location_contact")
                    .select("*")
                    .in("location_contact_id", locationContactQueryParamArray);

                if (locatinContactData) {
                    setFetchedPickupLocationMarketingData(
                        locatinContactData.filter(
                            (i) =>
                                i.location_contact_id ===
                                lrData.pickup_marketing_contact_id
                        )[0]
                    );
                    setFetchedPickupLocationDispatchData(
                        locatinContactData.filter(
                            (i) =>
                                i.location_contact_id ===
                                lrData.pickup_dispatch_contact_id
                        )[0]
                    );
                    setFetchedDropLocationMarketingData(
                        locatinContactData.filter(
                            (i) =>
                                i.location_contact_id ===
                                lrData.drop_marketing_contact_id
                        )[0]
                    );
                    setFetchedDropLocationDispatchData(
                        locatinContactData.filter(
                            (i) =>
                                i.location_contact_id ===
                                lrData.drop_dispatch_contact_id
                        )[0]
                    );
                    setLrDetailsDialogVisible(true);

                    setIsLoading(false);
                    setLoadingText("");
                }
            } else {
                setIsLoading(false);
                setLoadingText("");
            }
        } catch (e) {
            setIsLoading(false);
            setLoadingText("");
        }
    };

    const orderLRDialogRender = (rowData) => {
        return (
            <>
                <span>
                    {rowData.lr_number.split(", ").map((lrNumber) => (
                        <>
                            <a
                                onClick={() => {
                                    preparingDataForLrDialog(lrNumber, rowData);
                                }}
                            >
                                {lrNumber}
                            </a>
                            <br />
                        </>
                    ))}
                </span>
            </>
        );
    };

    const getStatusSeverity = (status) => {
        switch (status) {
            case "Under pickup process":
                return { color: "#B55385", textColor: "#fff" };

            case "Ready for pickup":
                return { color: "#87CEEB", textColor: "#333" };

            case "Tempo under the process":
                return { color: "#FFA500", textColor: "#333" };

            case "In process of departure":
                return { color: "#8f83c3", textColor: "#fff" };

            case "At destination city warehouse":
                return { color: "#FFE284", textColor: "#333" };

            case "Ready for final delivery":
                return { color: "green", textColor: "#fff" };

            case "Completed":
                return { color: "grey", textColor: "#fff" };

            default:
                return { color: "red", textColor: "#fff" };
        }
    };

    const orderStatusInfoRender = (rowData) => {
        return (
            <>
                <Tag
                    className="badge"
                    style={{
                        backgroundColor: getStatusSeverity(rowData.status)
                            .color,
                        color: getStatusSeverity(rowData.status).textColor,
                        padding: "0.2rem 0.5rem",
                    }}
                >
                    {rowData.status} <br />
                    {rowData.status_last_updated_at
                        ? rowData.status_last_updated_at.toLocaleString("en-IN")
                        : rowData.order_created_at.toLocaleString("en-IN")}
                </Tag>
            </>
        );
    };

    return (
        <>
            <Toast ref={toast} appendTo={null} />
            <ConfirmDialog />
            <Spinner isLoading={isLoading} loadingText={loadingText} />

            <Dialog
                header={"Client Info"}
                visible={clientInfoDialogVisible}
                style={{
                    width: "95vw",
                    height: "100vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!clientInfoDialogVisible) return;
                    setClientInfoDialogVisible(false);
                    setRefreshClientData(true);
                }}
                maximizable
            >
                <div className="grid p-fluid mt-1">
                    <div className="col-12 lg:col-5">
                        <div className="card">
                            {/* <h5>Details</h5> */}
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12">
                                    <Avatar
                                        className="p-overlay-badge"
                                        label={
                                            clientDetails.editedClientName
                                                ? clientDetails.editedClientName
                                                      .match(/\b(\w)/g)
                                                      .join("")
                                                      .slice(0, 2)
                                                : "?"
                                        }
                                        size="xlarge"
                                        style={{
                                            backgroundColor: "#9c27b0",
                                            color: "#ffffff",
                                        }}
                                    >
                                        <Badge
                                            value={
                                                clientDetails.editedClientStatus
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            style={{
                                                backgroundColor:
                                                    clientDetails.editedClientStatus
                                                        ? "green"
                                                        : "red",
                                            }}
                                        />
                                    </Avatar>
                                    <span className="pl-4 font-bold text-base lg:text-2xl">
                                        {clientDetails.editedClientName}
                                    </span>
                                </div>
                                <div className="field col-12">
                                    <span>
                                        <Chip
                                            icon="pi pi-map-marker"
                                            label={[
                                                clientDetails.editedClientAddress1,
                                                clientDetails.editedClientAddress2,
                                                clientDetails.editedClientArea,
                                                clientDetails.editedClientCity
                                                    .ref_dspl,
                                                clientDetails.editedClientState,
                                                clientDetails.editedClientPin,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        />
                                    </span>
                                </div>
                                <div className="field col-12">
                                    <span>
                                        <Chip
                                            icon="pi pi-briefcase"
                                            label={
                                                clientDetails.editedClientType
                                                    .ref_dspl
                                            }
                                        />
                                    </span>
                                    <span className="pl-2">
                                        <Chip
                                            icon="pi pi-phone"
                                            label={
                                                "+91 " +
                                                clientDetails.editedClientPhone
                                            }
                                        />
                                    </span>
                                    <span className="pl-2">
                                        <Chip
                                            icon="pi pi-envelope"
                                            label={
                                                clientDetails.editedClientEmail
                                            }
                                        />
                                    </span>
                                </div>
                                <div className="field col-12">
                                    <span>
                                        <Chip
                                            label={
                                                clientDetails.editedClientGstin
                                            }
                                            style={{
                                                backgroundColor: "#DBEDE4",
                                                color: "#33A852",
                                            }}
                                        />
                                    </span>
                                    <span className="pl-2">
                                        <Chip
                                            label={
                                                clientDetails.editedClientPan
                                            }
                                            style={{
                                                backgroundColor: "#D4E1F6",
                                                color: "#004F8C",
                                            }}
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 lg:col-4 ">
                        <div className="card min-h-full">
                            {/* <h5>Details</h5> */}
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12">
                                    <span>
                                        Client Number:{" "}
                                        {clientDetails.editedClientNumber}
                                    </span>
                                </div>
                                <div className="field col-12">
                                    <span>
                                        Client Contact Name:{" "}
                                        {clientDetails.editedClientContactName}
                                    </span>
                                </div>
                                <div className="field col-12">
                                    <span>
                                        Client Contact Number: +91{" "}
                                        {clientDetails.editedClientContactPhone}
                                    </span>
                                </div>
                                <div className="field col-12">
                                    <span>
                                        Client Contact Email:{" "}
                                        {clientDetails.editedClientContactEmail}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 lg:col-3 ">
                        <div className="card min-h-full">
                            {/* <h5>Details</h5> */}
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12">
                                    <span>
                                        Total Order: {fetchedOrdersData.length}
                                    </span>
                                </div>
                                <div className="field col-12">
                                    <span>
                                        Total Sale:{" "}
                                        {totalCreditAmount + totalDebitAmount}
                                    </span>
                                </div>
                                <div className="field col-12">
                                    <span>Total Due: {totalDebitAmount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        {/* TODO: temporary table needs to replace with open order data table functionality so that we can manage order for a client from here only */}
                        <DataTable
                            value={fetchedOrdersData}
                            loading={loading1}
                            header={header1}
                            filters={filters1}
                            rows={10}
                            size="small"
                            paginator
                            dataKey="order_id"
                            showGridlines
                            stripedRows
                            rowHover
                            emptyMessage="No orders found"
                            responsiveLayout="scroll"
                            sortMode="multiple"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} orders"
                        >
                            <Column
                                field="order_key_id"
                                header="Invoice"
                                body={actionButtonRender1}
                                align="center"
                                style={{ minWidth: "6rem" }}
                            />
                            <Column
                                field="order_key_id"
                                header="LR"
                                body={actionButtonRender2}
                                align="center"
                                style={{ minWidth: "6rem" }}
                            />
                            <Column
                                field="order_created_at"
                                header="Created/Updated On"
                                body={createdUpdatedDateRender}
                                // filter
                                // filterPlaceholder="Search by order created on"
                                // filterElement={dateFilterTemplate}
                                sortable
                            />
                            <Column
                                field="order_created_updated_by_name"
                                header="Created/Updated By"
                                body={orderCreatedInfoRender}
                            />
                            <Column
                                field="order_number"
                                header="ERP Order No"
                                body={orderDetailsDialogRender}
                                // filter
                                // filterPlaceholder="Search by ERP Order No"
                                sortable
                            />
                            <Column
                                field="lr_number"
                                header="LR No"
                                body={orderLRDialogRender}
                                // filter
                                // filterPlaceholder="Search by LR No"
                                sortable
                            />
                            <Column
                                field="status"
                                header="Status"
                                body={orderStatusInfoRender}
                                // filter
                                // filterPlaceholder="Search by status"
                                sortable
                            />
                        </DataTable>
                        {/* <DataTable
              value={fetchedOrdersData}
              size="small"
              paginator
              rowsPerPageOptions={[5, 10, 15, 30]}
              className="p-datatable-gridlines"
              rows={5}
              dataKey="order_id"
              loading={loading1}
              responsiveLayout="scroll"
              showGridlines
              stripedRows
              rowHover
              removableSort
              scrollable
              scrollHeight="40vh"
              sortMode="multiple"
              tableStyle={{ minWidth: "50rem" }}
              filterDisplay="menu"
              resizableColumns
              columnResizeMode="expand"
              emptyMessage="No orders found."
            >
              <Column
                field="order_key_id"
                header="Invoice"
                body={actionButtonRender1}
                align="center"
                style={{ minWidth: "6rem" }}
              />
              <Column
                field="order_key_id"
                header="LR"
                body={actionButtonRender2}
                align="center"
                style={{ minWidth: "6rem" }}
              />
              {user.role === "SUPER_ADMIN" ? (
                <Column
                  field="order_created_updated_by_name"
                  header="Created/Updated By"
                  body={orderCreatedInfoRender}
                  filterField="order_created_by_name"
                  filter
                  filterPlaceholder="Search created by"
                  sortable
                />
              ) : (
                ""
              )}
              <Column
                field="order_created_updated_at"
                header="Created/Updated On"
                body={orderCreatedDateInfoRender}
                filter
                filterPlaceholder="Search by order created on"
                filterElement={dateFilterTemplate}
                sortable
              />
              <Column
                field="pickup_date"
                header="Pickup Date"
                body={orderPickupDateInfoRender}
                filter
                filterPlaceholder="Search by Pickup Date"
                filterElement={dateFilterTemplate}
                sortable
              />
              <Column
                field="order_number"
                header="ERP Order No"
                body={orderDetailsDialogRender}
                filter
                filterPlaceholder="Search by ERP Order No"
                sortable
              />
              <Column
                field="order_number"
                header="LR No"
                body={orderLRDialogRender}
                filter
                filterPlaceholder="Search by LR No"
                sortable
              />
              <Column
                field="route"
                header="Route"
                body={orderRouteInfoRender}
                filter
                filterPlaceholder="Search by route"
                sortable
              />
              <Column
                field="status"
                header="Status"
                body={orderStatusInfoRender}
                filter
                filterPlaceholder="Search by status"
                sortable
              />
              <Column
                field=""
                header="Comment"
                body={orderCommentDialogRender}
                filter
                filterPlaceholder="Search by comment"
                sortable
              />
              <Column
                filterField="client_name"
                header="Client Name"
                body={clientInfoRender}
                filter
                filterPlaceholder="Search by client name"
                sortable
              />
              <Column
                field="company_name"
                header="Company"
                body={companyInfoRender}
                filter
                filterPlaceholder="Search by company"
                sortable
              />
              <Column
                field="weight"
                header="Total Weight"
                body={orderWeightInfoRender}
                filter
                filterPlaceholder="Search by weight"
                sortable
              />
              <Column
                field="quantity"
                header="Order Details"
                body={quantityInfoRender}
                filter
                filterPlaceholder="Search by quatity"
                sortable
              />
              <Column
                field="notes"
                header="Order Notes"
                body={notesInfoRender}
                filter
                filterPlaceholder="Search by order notes"
                sortable
              />
              <Column
                field="local_transport"
                header="Local Transport"
                body={localTransportInfoRender}
                filter
                filterPlaceholder="Search by local transport"
                sortable
              />
              <Column
                field="truck_details"
                header="Truck Details"
                body={truckDetailsInfoRender}
                filter
                filterPlaceholder="Search by truck details"
                sortable
              />
              <Column
                field="eway_number"
                header="EWay Bill Number"
                body={orderEwayInfoRender}
                filter
                filterPlaceholder="Search by Eway bill number"
                sortable
              />
              <Column
                field="bills"
                header="Bills"
                body={billsInfoRender}
                filter
                filterPlaceholder="Search by bills"
                sortable
              />
            </DataTable> */}
                    </div>
                </div>
            </Dialog>

            {/* Start of All Dialogs Blocks */}
            <AddOrderDialog
                addOrderDialogVisible={addOrderDialogVisible}
                setAddOrderDialogVisible={setAddOrderDialogVisible}
                references={references}
                user={user}
                setRefreshData={setRefreshData}
                clientDetails={clientDetails}
            />

            <OpenOrderDialog
                orderDetailsDialogVisible={orderDetailsDialogVisible}
                setOrderDetailsDialogVisible={setOrderDetailsDialogVisible}
                selectedOrder={selectedOrder}
                selectedOrderDetails={selectedOrderDetails}
                setSelectedOrderDetails={setSelectedOrderDetails}
                references={references}
                user={user}
                setRefreshData={setRefreshData}
            />

            <LrDialog
                lrDetailsDialogVisible={lrDetailsDialogVisible}
                setLrDetailsDialogVisible={setLrDetailsDialogVisible}
                references={references}
                user={user}
                setRefreshData={setRefreshData}
                fetchedOrderData={fetchedOrderData}
                fetchedLRData={fetchedLRData}
                fetchedClientData={fetchedClientData}
                fetchedPickupLocationData={fetchedPickupLocationData}
                fetchedPickupLocationMarketingData={
                    fetchedPickupLocationMarketingData
                }
                fetchedpickupLocationDispatchData={
                    fetchedpickupLocationDispatchData
                }
                fetchedDropLocationData={fetchedDropLocationData}
                fetchedDropLocationMarketingData={
                    fetchedDropLocationMarketingData
                }
                fetchedDropLocationDispatchData={
                    fetchedDropLocationDispatchData
                }
                fetchedConsignorClientsData={fetchedConsignorClientsData}
                fetchedConsigneeClientsData={fetchedConsigneeClientsData}
            />

            <CreateInvoiceDialog
                createInvoiceDialogVisible={createInvoiceDialogVisible}
                setCreateInvoiceDialogVisible={setCreateInvoiceDialogVisible}
                selectedOrder={selectedOrder}
                setRefreshData={setRefreshData}
                user={user}
            />
        </>
    );
}
