import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Slider } from "primereact/slider";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { ToggleButton } from "primereact/togglebutton";
import { Rating } from "primereact/rating";
import { CustomerService } from "../../demo/service/CustomerService";
import { ProductService } from "../../demo/service/ProductService";
import { SelectButton } from "primereact/selectbutton";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";

import { supabase } from "../../config/supabaseClient";
import { useSelector } from "react-redux";

import { Tooltip } from "primereact/tooltip";
import AddClientDialog from "../../components/dialogs/AddClientDialog";
import { getLocationNumber } from "../../utils/generateUniqueNumber";
import { Toast } from "primereact/toast";
import Spinner from "../../components/spinner";
import EditClientDialog from "../../components/EditDialogs/EditClientDialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ClientInfoDialog from "../../components/InfoDialogs/ClientInfoDialog";

const Clients = () => {
    const user = useSelector((state) => state.initialState.user);
    const toast = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    const [fetchedClientsData, setFetchedClientsData] = useState([]);

    const [filters1, setFilters1] = useState(null);
    const [loading1, setLoading1] = useState(true);
    const [idFrozen, setIdFrozen] = useState(false);
    const [globalFilterValue1, setGlobalFilterValue1] = useState("");
    const [references, setReferences] = useState([]);

    // all dialog states
    const [addClientDialogVisible, setAddClientDialogVisible] = useState(false);
    const [refreshClientData, setRefreshClientData] = useState(false);
    const [editClientDialogVisible, setEditClientDialogVisible] =
        useState(false);
    const [clientDetails, setClientDetails] = useState({
        editedClientNumber: "",
        editedClientType: "",
        editedClientName: "",
        editedClientGstin: "",
        editedClientPan: "",
        editedClientPhone: null,
        editedClientEmail: "",
        editedClientAddress1: "",
        editedClientAddress2: "",
        editedClientArea: "",
        editedClientCity: "",
        editedClientState: "",
        editedClientPin: null,
        editedClientContactName: "",
        editedClientContactPhone: null,
        editedClientContactEmail: "",
        editedClientStatus: "",
    });
    const [clientInfoDialogVisible, setClientInfoDialogVisible] =
        useState(false);

    const [sizeOptions] = useState([
        { label: "Small", value: "small" },
        { label: "Normal", value: "normal" },
        { label: "Large", value: "large" },
    ]);
    const [size, setSize] = useState(sizeOptions[0].value);

    const roles = ["SUPER_ADMIN", "ADMIN", "CANDIDATE", "NO ACCESS"];

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
                <div className="field col-12 lg:col-3">
                    {/* <Calendar
            value={new Date()}
            onChange={(e) => {
              setDate(e.value);
            }}
            selectionMode="range"
            readOnlyInput
            hideOnRangeSelection
          /> */}
                </div>
                <div className="field col-12 lg:col-2">
                    <Button
                        type="button"
                        icon="pi pi-file-excel"
                        severity="success"
                        raised
                        // onClick={exportExcel}
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
                        label="Add Client"
                        outlined
                        onClick={() => setAddClientDialogVisible(true)}
                    />
                </div>
            </div>
        );
    };

    const dateTimeFormat = (val) => {
        if (val) {
            return new Date(val);
        }
    };

    async function getReferences() {
        // call reference to get dropdown options
        const { data: refData, error: refDataErr } = await supabase
            .from("reference")
            .select("*")
            .in("ref_nm", ["city", "clientType"]);

        if (refData) {
            setReferences(refData);
        }
    }

    async function fetchClient() {
        setLoading1(true);

        // fetch users data
        try {
            let query = supabase.from("client_view").select("*");

            if (user.drop_branch && user.pickup_branch) {
                query.in("city", [user.drop_branch, user.pickup_branch]);
            } else if (user.drop_branch) {
                query.eq("city", user.drop_branch);
            } else if (user.pickup_branch) {
                query.eq("city", user.pickup_branch);
            }

            let { data: clientData, error } = await query.order(
                "client_created_at",
                {
                    ascending: false,
                    nullsFirst: false,
                }
            );

            if (clientData) {
                clientData.forEach(
                    (i) =>
                        (i.client_created_at = dateTimeFormat(
                            i.client_created_at
                        ))
                );
                clientData.forEach(
                    (i) =>
                        (i.client_last_updated_at = dateTimeFormat(
                            i.client_last_updated_at
                        ))
                );
                setFetchedClientsData(clientData);
                setLoading1(false);

                if (refreshClientData) {
                    setRefreshClientData(false);
                }
            }
        } catch (e) {
            // todo: add new error toast...
            //   toast.error(
            //     "System is unavailable.  Unable to fetch Client Data.  Please try again later or contact tech support!",
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
        }
    }

    useEffect(() => {
        fetchClient();
        initFilters1();
        getReferences();
    }, []);

    useEffect(() => {
        if (refreshClientData) {
            fetchClient();
        }
    }, [refreshClientData]);

    const initFilters1 = () => {
        setFilters1({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            name: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                ],
            },
            email: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                ],
            },
            created_at: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.DATE_IS },
                ],
            },
            role: {
                operator: FilterOperator.OR,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.EQUALS },
                ],
            },
        });
        setGlobalFilterValue1("");
    };

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

    const header1 = renderHeader1();

    const addClientToLocation = async (rowData) => {
        setIsLoading(true);
        try {
            // Generate location number
            const locationNumber = await getLocationNumber();

            // saving data
            const { data: locationData, error: locationError } = await supabase
                .from("location")
                .insert([
                    {
                        // client
                        location_number: locationNumber,
                        location_type: "Pickup",
                        name_of_pickup_point: rowData.client_name,
                        location_city: rowData.city,
                        address1: rowData.address1,
                        address2: rowData.address2,
                        area: rowData.area,
                        city: rowData.city,
                        pin: rowData.pin,
                        state: rowData.state,
                        location_created_by: user.id,
                    },
                ]);
            if (locationError) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while adding Location data, Please try again later or contact tech support",
                });
                setIsLoading(false);
            } else {
                // open toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail:
                        "'" +
                        rowData.client_name +
                        "'" +
                        " saved as Pickup Location successfully",
                });

                // increment location_number key
                await supabase.rpc("increment_sys_key", {
                    x: 1,
                    keyname: "location_number",
                });
                setIsLoading(false);
            }
        } catch (err) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while adding Location details, Please try again later or contact tech support",
            });
            // console.warn(err);
            setIsLoading(false);
        }
    };
    const createActionConfirmPopup = (rowData) => {
        confirmDialog({
            message:
                "Are you sure you want to copy this client to pick up location? ",
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                addClientToLocation(rowData);
            },
        });
    };
    //   All Render Blocks
    const actionButtonRender = (rowData) => {
        return (
            <div>
                <Button
                    className="action-badge"
                    style={{ height: "2rem", width: "2rem" }}
                    icon="pi pi-pen-to-square"
                    text
                    aria-label="Filter"
                    onClick={() => {
                        setEditClientDialogVisible(true);
                        setClientDetails((previousState) => ({
                            ...previousState,
                            editedClientNumber: rowData.client_number,
                            editedClientType: references.filter(
                                (i) =>
                                    i.ref_nm === "clientType" &&
                                    i.ref_dspl === rowData.client_type
                            )[0],
                            editedClientName: rowData.client_name,
                            editedClientGstin: rowData.client_gst,
                            editedClientPan: rowData.client_pan,
                            editedClientPhone: rowData.client_phone,
                            editedClientEmail: rowData.client_email,
                            editedClientAddress1: rowData.address1,
                            editedClientAddress2: rowData.address2,
                            editedClientArea: rowData.area,
                            editedClientCity: references.filter(
                                (i) =>
                                    i.ref_nm === "city" &&
                                    i.ref_dspl === rowData.city
                            )[0],
                            editedClientState: rowData.state,
                            editedClientPin: rowData.pin,
                            editedClientContactName: rowData.contact_name,
                            editedClientContactPhone: rowData.contact_phone,
                            editedClientContactEmail: rowData.contact_email,
                            editedClientStatus: rowData.client_status,
                        }));
                    }}
                />
                {user.role === "SUPER_ADMIN" ? (
                    <>
                        <Button
                            style={{ height: "2rem", width: "2rem" }}
                            icon="pi pi-map-marker"
                            text
                            aria-label="Filter"
                            onClick={() => {
                                createActionConfirmPopup(rowData);
                            }}
                            className="action-client-location action-badge"
                            data-pr-tooltip="Copy Client to Location"
                            data-pr-position="top"
                        />
                        <Tooltip target=".action-client-location" />
                    </>
                ) : (
                    ""
                )}
            </div>
        );
    };

    const createdUpdatedDateRender = (rowData) => {
        return (
            <>
                <span className="text-xs">
                    {rowData.client_created_at.toLocaleString("en-IN")}
                </span>{" "}
                <br />
                <span className="text-xs">
                    {rowData.client_last_updated_at
                        ? rowData.client_last_updated_at.toLocaleString("en-IN")
                        : ""}
                </span>
            </>
        );
    };

    const clientNameRender = (rowData) => {
        return (
            <div>
                {user.role === "SUPER_ADMIN" ? (
                    <a
                        onClick={() => {
                            setClientInfoDialogVisible(true);
                            setClientDetails((previousState) => ({
                                ...previousState,
                                editedClientNumber: rowData.client_number,
                                editedClientType: references.filter(
                                    (i) =>
                                        i.ref_nm === "clientType" &&
                                        i.ref_dspl === rowData.client_type
                                )[0],
                                editedClientName: rowData.client_name,
                                editedClientGstin: rowData.client_gst,
                                editedClientPan: rowData.client_pan,
                                editedClientPhone: rowData.client_phone,
                                editedClientEmail: rowData.client_email,
                                editedClientAddress1: rowData.address1,
                                editedClientAddress2: rowData.address2,
                                editedClientArea: rowData.area,
                                editedClientCity: references.filter(
                                    (i) =>
                                        i.ref_nm === "city" &&
                                        i.ref_dspl === rowData.city
                                )[0],
                                editedClientState: rowData.state,
                                editedClientPin: rowData.pin,
                                editedClientContactName: rowData.contact_name,
                                editedClientContactPhone: rowData.contact_phone,
                                editedClientContactEmail: rowData.contact_email,
                                editedClientStatus: rowData.client_status,
                            }));
                        }}
                    >
                        {rowData.client_name}
                    </a>
                ) : (
                    <span>{rowData.client_name}</span>
                )}
                <br />
                <span className="text-xs text-500">{rowData.client_phone}</span>
            </div>
        );
    };

    const clientAddressRender = (rowData) => {
        return (
            <>
                <div
                    className="max-w-10rem text-sm text-overflow-ellipsis overflow-hidden custom-target-icon"
                    data-pr-tooltip={[
                        rowData.address1,
                        rowData.address2,
                        rowData.area,
                        rowData.city,
                        rowData.state,
                        rowData.pin,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                    data-pr-position="top"
                >
                    {[
                        rowData.address1,
                        rowData.address2,
                        rowData.area,
                        rowData.city,
                        rowData.state,
                        rowData.pin,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                </div>
                <Tooltip target=".custom-target-icon" />
            </>
        );
    };

    const clientContactInfoRender = (rowData) => {
        return (
            <div>
                <span>{rowData.contact_name}</span> <br />
                <span className="text-xs text-500">
                    {rowData.contact_phone}
                </span>
                <br />
                <span className="text-xs text-500">
                    {rowData.contact_email}
                </span>
            </div>
        );
    };

    const clientStatusRender = (rowData) => {
        return (
            <Tag
                severity={rowData.client_status ? "success" : "danger"}
                value={rowData.client_status ? "Active" : "Inactive"}
            ></Tag>
        );
    };

    const totalOrdersRender = (rowData) => {
        return (
            <div>
                {rowData.total_orders ? (
                    <Tag
                        className="px-3 py-2 action-badge"
                        rounded
                        severity="warning"
                        value={rowData.total_orders}
                    ></Tag>
                ) : (
                    ""
                )}
            </div>
        );
    };

    const totalBillingsRender = (rowData) => {
        return (
            <div>
                {rowData.total_billings ? (
                    <Tag
                        className="px-3 py-2 action-badge"
                        rounded
                        severity="success"
                        value={rowData.total_billings}
                    ></Tag>
                ) : (
                    ""
                )}
            </div>
        );
    };

    const totalBillingsDueRender = (rowData) => {
        return (
            <div>
                {rowData.total_billings_due ? (
                    <Tag
                        className="px-3 py-2 action-badge"
                        rounded
                        severity="danger"
                        value={rowData.total_billings_due}
                    ></Tag>
                ) : (
                    ""
                )}
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} appendTo={null} />
            <Spinner isLoading={isLoading} loadingText={loadingText} />
            <ConfirmDialog />

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-baseline">
                            <h5>All Clients!</h5>
                            <small>
                                &nbsp;(Total: {fetchedClientsData.length})
                            </small>
                        </div>
                        <DataTable
                            value={fetchedClientsData}
                            size={size}
                            paginator
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            className="p-datatable-gridlines"
                            rows={10}
                            dataKey="id"
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
                            emptyMessage="No clients found."
                        >
                            <Column
                                field="client_key_id"
                                header="Action"
                                body={actionButtonRender}
                                align="center"
                                style={{ maxWidth: "5rem" }}
                            />
                            <Column
                                field="client_created_at"
                                sortable
                                filter
                                filterPlaceholder="Search by date"
                                header="Created/Updated On"
                                body={createdUpdatedDateRender}
                                // filterElement={dateFilterTemplate}
                            ></Column>
                            <Column
                                field="client_type"
                                header="Type"
                                filter
                                filterPlaceholder="Search by name"
                                sortable
                            ></Column>
                            <Column
                                field="city"
                                header="City"
                                filterMenuStyle={{ width: "14rem" }}
                                style={{ minWidth: "12rem" }}
                                sortable
                            ></Column>
                            <Column
                                field="client_name"
                                header="Client Name"
                                body={clientNameRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="total_orders"
                                header="Total Orders"
                                body={totalOrdersRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="total_billings"
                                header="Total Billing"
                                body={totalBillingsRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="total_billings_due"
                                header="Due Payment"
                                body={totalBillingsDueRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="address1"
                                header="Address"
                                body={clientAddressRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="client_gst"
                                header="GSTIN"
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="client_pan"
                                header="PAN No"
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="client_contact_name"
                                header="Contact"
                                body={clientContactInfoRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="client_status"
                                header="Status"
                                body={clientStatusRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                        </DataTable>
                    </div>
                </div>

                <AddClientDialog
                    addClientDialogVisible={addClientDialogVisible}
                    setAddClientDialogVisible={setAddClientDialogVisible}
                    references={references}
                    user={user}
                    setRefreshClientData={setRefreshClientData}
                />

                <EditClientDialog
                    editClientDialogVisible={editClientDialogVisible}
                    setEditClientDialogVisible={setEditClientDialogVisible}
                    references={references}
                    user={user}
                    setRefreshClientData={setRefreshClientData}
                    clientDetails={clientDetails}
                    setClientDetails={setClientDetails}
                />

                <ClientInfoDialog
                    clientInfoDialogVisible={clientInfoDialogVisible}
                    setClientInfoDialogVisible={setClientInfoDialogVisible}
                    user={user}
                    setRefreshClientData={setRefreshClientData}
                    clientDetails={clientDetails}
                    references={references}
                />
            </div>
        </>
    );
};

export default Clients;
