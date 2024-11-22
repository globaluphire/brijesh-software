import React, { useState, useEffect, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { subDays } from "date-fns";

import { supabase } from "../../config/supabaseClient";
import { Toast } from "primereact/toast";
import OpenOrderDialog from "../../components/dialogs/OpenOrderDialog";
import LrDialog from "../../components/dialogs/LrDialog";
import {
    convertToSearchFilterDateTimeFrom,
    convertToSearchFilterDateTimeTo,
} from "../../utils/convertToSearchFilterDateTime";
import AddOrderDialog from "../../components/dialogs/AddOrderDialog";
import CreateInvoiceDialog from "../../components/dialogs/CreateInvoiceDialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useSelector } from "react-redux";
import Spinner from "../../components/spinner";
import Seo from "../../components/seo";

const CompletedOrders = () => {
    const user = useSelector((state) => state.initialState.user);

    const [dateRange, setDateRange] = useState(null);

    const [fetchedCompletedOrderData, setFetchedCompletedOrderData] = useState(
        []
    );
    const [xlsxData, setXlsxData] = useState([]);
    const [loading1, setLoading1] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [filters1, setFilters1] = useState(null);
    const [globalFilterValue1, setGlobalFilterValue1] = useState("");
    const [references, setReferences] = useState([]);

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

    const [sizeOptions] = useState([
        { label: "Small", value: "small" },
        { label: "Normal", value: "normal" },
        { label: "Large", value: "large" },
    ]);
    const [size, setSize] = useState("small");

    const toast = useRef(null);

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

    async function getReferences() {
        // call reference to get dropdown options
        const { data: refData, error: refDataErr } = await supabase
            .from("reference")
            .select("*")
            .in("ref_nm", [
                "materialType",
                "size",
                "priority",
                "orderCity",
                "city",
                "cancelReason",
                "clientType",
                "clientContactType",
                "transportVehicleType",
                "lrStatus",
            ]);

        if (refData) {
            setReferences(refData);
        }
    }

    async function fetchCompletedOrders() {
        setLoading1(true);

        try {
            let query = supabase
                .from("new_order_view")
                .select("*")
                .eq("status", "Completed")
                .gte(
                    "order_created_at",
                    convertToSearchFilterDateTimeFrom(
                        dateRange ? dateRange[0] : subDays(new Date(), 30)
                    )
                )
                .lte(
                    "order_created_at",
                    convertToSearchFilterDateTimeTo(
                        dateRange ? dateRange[1] : new Date()
                    )
                );

            if (user.drop_branch) {
                query.eq("order_city", user.drop_branch);
            }

            let { data: orderData, error } = await query.order(
                "order_created_at",
                {
                    ascending: false,
                    nullsFirst: false,
                }
            );

            if (orderData) {
                orderData.forEach(
                    (i) =>
                        (i.order_created_at = dateTimeFormat(
                            i.order_created_at
                        ))
                );
                orderData.forEach(
                    (i) =>
                        (i.order_updated_at = dateTimeFormat(
                            i.order_updated_at
                        ))
                );
                orderData.forEach(
                    (i) =>
                        (i.status_last_updated_at = dateTimeFormat(
                            i.status_last_updated_at
                        ))
                );
                setXlsxData(orderData);
                // const sortedOpenOrdersData = orderData.reduce((acc, cv) => {
                //   if (acc[cv.order_number] && acc[cv.order_number].length > 0)
                //     acc[cv.order_number].push(cv);
                //   else acc[cv.order_number] = [cv];
                //   return acc;
                // }, {});

                // let sortedOpenOrdersDataArr = [];
                // for (var i=0; i<Object.keys(sortedOpenOrdersData).length; i++) {
                //     sortedOpenOrdersDataArr.push(sortedOpenOrdersData[i]);
                // }
                // Object.entries(sortedOpenOrdersData).forEach(([key, value]) => {
                //     // console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
                //     sortedOpenOrdersDataArr.push(`${value}`)
                //   });

                // sortedOpenOrdersDataArr = Object.values(sortedOpenOrdersData);

                orderData.forEach(
                    (i) =>
                        (i.pickup_date = convertPickupDateFormat(i.pickup_date))
                );

                setFetchedCompletedOrderData(orderData);
                setLoading1(false);
                setRefreshData(false);
            }
        } catch (e) {
            // TODO: open error toast
            //   toast.error(
            //     "System is unavailable.  Please try again later or contact tech support!",
            //     {
            //       position: "bottom-right",
            //       autoClose: false,
            //       hideProgressBar: false,
            //       closeOnClick: true,
            //       pauseOnHover: true,
            //       draggable: true,
            //       progress: undefined,
            //       theme: "colored",
            //     }
            //   );
            // console.warn(e);
        }
    }

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
            client_name: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                ],
            },
        });
        setGlobalFilterValue1("");
    };

    useEffect(() => {
        fetchCompletedOrders();
        initFilters1();
        getReferences();
    }, []);

    useEffect(() => {
        if (refreshData) {
            fetchCompletedOrders();
        }
    }, [refreshData]);

    const dateFilterTemplate = (options) => {
        return (
            <Calendar
                value={options.value}
                onChange={(e) => options.filterCallback(e.value, options.index)}
                dateFormat="dd/mm/yy"
                placeholder="dd/mm/yyyy"
                mask="99/99/9999"
            />
        );
    };

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(xlsxData);
            const workbook = {
                Sheets: { data: worksheet },
                SheetNames: ["data"],
            };
            const excelBuffer = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            saveAsExcelFile(excelBuffer, "Raftaar");
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {
        import("file-saver").then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
                let EXCEL_EXTENSION = ".xlsx";
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE,
                });

                module.default.saveAs(
                    data,
                    fileName +
                        "-Completed_Orders-" +
                        ("0" + new Date().getDate()).slice(-2) +
                        "_" +
                        ("0" + (new Date().getMonth() + 1)).slice(-2) +
                        "_" +
                        new Date().getFullYear() +
                        EXCEL_EXTENSION
                );
            }
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
                        outlined
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
                <div className="field col-12 lg:col-2 md:col-9 sm:col-11">
                    <Calendar
                        value={dateRange}
                        onChange={(e) => setDateRange(e.value)}
                        maxDate={new Date()}
                        dateFormat="dd/mm/yy"
                        selectionMode="range"
                        readOnlyInput
                        hideOnRangeSelection
                        // TODO: set the default selected date range instead of placeholder
                        placeholder="dd/mm/yy - dd/mm/yy"
                    />
                </div>
                <div className="field col-12 lg:col-1 md:col-1  sm:col-1">
                    <Button
                        type="button"
                        icon="pi pi-search"
                        onClick={
                            dateRange && dateRange[0] && dateRange[1]
                                ? () => {
                                      fetchCompletedOrders();
                                  }
                                : () => {}
                        }
                    />
                </div>
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
                        onClick={() => setAddOrderDialogVisible(true)}
                    />
                </div>
            </div>
        );
    };

    const determinePriorityColor = (priority) => {
        switch (priority) {
            case "Low":
                return { style: "inset 3px 0px 0px 0px green" };
            case "Normal":
                return { style: "inset 3px 0px 0px 0px orange" };
            case "High":
                return { style: "inset 3px 0px 0px 0px red" };
            default:
                return { style: "inset 3px 0px 0px 0px transparent" };
        }
    };

    //    All Render Blocks
    const actionButtonRender1 = (rowData) => {
        return (
            <div className="flex flex-wrap justify-content-center">
                {!rowData.invoice_number ? (
                    <Button
                        className="action-badge"
                        text
                        rounded
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
                        text
                        rounded
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

    // const orderPickupDateInfoRender = (rowData) => {
    //     return (
    //         <>
    //             <span>
    //                 {new Date(
    //                     rowData.pickup_date.split("-")[0],
    //                     rowData.pickup_date.split("-")[1] - 1,
    //                     rowData.pickup_date.split("-")[2]
    //                 ).toLocaleDateString("en-IN")}
    //             </span>{" "}
    //             <br />
    //         </>
    //     );
    // };

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

    const orderRouteInfoRender = (rowData) => {
        return (
            <>
                <span>
                    {rowData.pickup_location} - {rowData.drop_location}
                </span>
            </>
        );
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

    const orderCommentDialogRender = (rowData) => {
        return (
            <>
                <div className="flex flex-wrap justify-content-center">
                    <Button
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
                                editedOrderCreatedDate:
                                    rowData.order_created_at,
                                editedOrderUpdatedDate:
                                    rowData.order_updated_at,
                                editedOrderNotes: rowData.notes,
                                editedOrderLocation: rowData.order_city,
                                editedStatus: rowData.status,
                                editedPickupLocation: rowData.pickup_location,
                                editedDropLocation: rowData.drop_location,
                            }));
                        }}
                        style={{ height: "2rem", width: "2rem" }}
                        icon="pi pi-comments"
                        text
                        size="small"
                        aria-label="Filter"
                    ></Button>
                </div>
            </>
        );
    };

    const clientInfoRender = (rowData) => {
        const client_name = rowData.client_name;

        return <>{client_name ? client_name : "-"}</>;
    };

    const companyInfoRender = (rowData) => {
        return <>{rowData.company_name ? rowData.company_name : "-"}</>;
    };

    const orderWeightInfoRender = (rowData) => {
        return (
            <>
                <span>{rowData.weight ? rowData.weight + " Kg" : "-"}</span>
            </>
        );
    };

    const quantityInfoRender = (rowData) => {
        return (
            <>
                <span
                    style={{
                        boxShadow: determinePriorityColor(rowData.priority)
                            .style,
                        paddingLeft: "inherit",
                    }}
                >
                    {rowData.quantity ? rowData.quantity : "-"}
                </span>
            </>
        );
    };

    const notesInfoRender = (rowData) => {
        return <>{rowData.notes ? rowData.notes : "-"}</>;
    };

    const localTransportInfoRender = (rowData) => {
        return <>{rowData.local_transport ? rowData.local_transport : "-"}</>;
    };

    const truckDetailsInfoRender = (rowData) => {
        return <>{rowData.truck_details ? rowData.truck_details : "-"}</>;
    };

    const orderEwayInfoRender = (rowData) => {
        return (
            <>
                <span>{rowData.eway_number ? rowData.eway_number : "-"}</span>
                <br />
                <span>
                    {rowData.eway_verified ? (
                        <Tag
                            className="badge"
                            style={{ backgroundColor: "green" }}
                        >
                            Verified
                        </Tag>
                    ) : (
                        ""
                    )}
                </span>
            </>
        );
    };

    const billsInfoRender = (rowData) => {
        return <>{rowData.bill ? rowData.bill : "-"}</>;
    };

    //   End of All Render Blocks

    const statusOrderBodyTemplate = (rowData) => {
        return (
            <Tag
                value={rowData.status.toLowerCase()}
                severity={getOrderSeverity(rowData)}
            ></Tag>
        );
    };

    const searchBodyTemplate = () => {
        return <Button icon="pi pi-search" />;
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <Tag
                style={{
                    backgroundColor: getStatusSeverity(rowData).color,
                    color: getStatusSeverity(rowData).textColor,
                }}
            >
                {rowData.status} <br />
                {rowData.status_last_updated_at
                    ? rowData.status_last_updated_at
                    : orrowDatader.order_created_at}
            </Tag>
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

            default:
                return { color: "grey", textColor: "#fff" };
        }
    };

    const getOrderSeverity = (order) => {
        switch (order.status) {
            case "DELIVERED":
                return "success";

            case "CANCELLED":
                return "danger";

            case "PENDING":
                return "warning";

            case "RETURNED":
                return "info";

            default:
                return null;
        }
    };

    const header1 = renderHeader1();

    return (
        <>
            <Seo pageTitle="Completed Orders" />
            <div className="grid">
                <Spinner isLoading={isLoading} loadingText={loadingText} />

                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-baseline">
                            <h5>All Completed Orders</h5>
                            <small>
                                &nbsp;(Total: {fetchedCompletedOrderData.length}
                                )
                            </small>

                            {/* <SelectButton
          value={size}
          onChange={(e) => setSize(e.value)}
          options={sizeOptions}
        /> */}
                        </div>

                        <DataTable
                            value={fetchedCompletedOrderData}
                            size={size}
                            paginator
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            className="p-datatable-gridlines"
                            rows={10}
                            dataKey="order_id"
                            loading={loading1}
                            responsiveLayout="scroll"
                            showGridlines
                            stripedRows
                            rowHover
                            removableSort
                            scrollable
                            scrollHeight="65vh"
                            sortMode="multiple"
                            tableStyle={{ minWidth: "50rem" }}
                            filters={filters1}
                            header={header1}
                            filterDisplay="menu"
                            resizableColumns
                            columnResizeMode="expand"
                            emptyMessage="No completed orders found."
                        >
                            <Column
                                field="order_key_id"
                                header="Invoice"
                                body={actionButtonRender1}
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
                                field="order_created_at"
                                header="Created/Updated On"
                                body={createdUpdatedDateRender}
                                filter
                                filterPlaceholder="Search by order created on"
                                filterElement={dateFilterTemplate}
                                sortable
                            />
                            <Column
                                field="pickup_date"
                                header="Pickup Date"
                                // body={orderPickupDateInfoRender}
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
                                field="lr_number"
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
                        </DataTable>
                    </div>
                </div>

                <Toast ref={toast} />

                {/* Start of All Dialogs Blocks */}
                <AddOrderDialog
                    addOrderDialogVisible={addOrderDialogVisible}
                    setAddOrderDialogVisible={setAddOrderDialogVisible}
                    references={references}
                    user={user}
                    setRefreshData={setRefreshData}
                />

                <ConfirmDialog />

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
                    setCreateInvoiceDialogVisible={
                        setCreateInvoiceDialogVisible
                    }
                    selectedOrder={selectedOrder}
                    setRefreshData={setRefreshData}
                    user={user}
                />
            </div>
        </>
    );
};

export default CompletedOrders;
