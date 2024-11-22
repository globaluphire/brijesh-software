import React, { useState, useEffect, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";

import { supabase } from "../../config/supabaseClient";
import { useSelector } from "react-redux";

import { Tooltip } from "primereact/tooltip";
import AddLocationDialog from "../../components/dialogs/AddLocationDialog";
import Seo from "../../components/seo";
import Spinner from "../../components/spinner";
import { Toast } from "primereact/toast";
import EditLocationDialog from "../../components/EditDialogs/EditLocationDialog";

const Locations = () => {
    const user = useSelector((state) => state.initialState.user);
    const toast = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingText, setIsLoadingText] = useState("");

    const [fetchedLocationsData, setFetchedLocationsData] = useState([]);

    const [filters1, setFilters1] = useState(null);
    const [loading1, setLoading1] = useState(true);
    const [idFrozen, setIdFrozen] = useState(false);
    const [globalFilterValue1, setGlobalFilterValue1] = useState("");
    const [references, setReferences] = useState([]);

    // all dialog states
    const [addLocationDialogVisible, setAddLocationDialogVisible] =
        useState(false);
    const [refreshLocationData, setRefreshLocationData] = useState(false);
    const [selectedLocationType, setSelectedLocationType] = useState("");
    const [editLocationDialogVisible, setEditLocationDialogVisible] =
        useState(false);
    const [selectedLocation, setSelectedLocation] = useState([]);

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
                        label="Add Location"
                        outlined
                        onClick={() => {
                            setAddLocationDialogVisible(true);
                            setSelectedLocationType("Pickup");
                        }}
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
            .in("ref_nm", ["city", "clientContactType"]);

        if (refData) {
            setReferences(refData);
        }
    }

    async function fetchLocations() {
        setLoading1(true);

        // fetch location data
        try {
            let query = supabase.from("location").select("*");

            let { data: locationData, error } = await query.order(
                "location_created_at",
                {
                    ascending: false,
                    nullsFirst: false,
                }
            );

            if (locationData) {
                locationData.forEach(
                    (i) =>
                        (i.location_created_at = dateTimeFormat(
                            i.location_created_at
                        ))
                );

                locationData.forEach(
                    (i) =>
                        (i.location_updated_at = dateTimeFormat(
                            i.location_updated_at
                        ))
                );

                var locationTypeFilteredData = [...locationData];
                var locationCityFilteredData = [...locationData];
                var filteredLocationData = [];
                if (user.drop_branch) {
                    locationTypeFilteredData = locationTypeFilteredData.filter(
                        (data) =>
                            data.location_type === "Drop" &&
                            data.location_city === user.drop_branch
                    );
                    Array.prototype.push.apply(
                        filteredLocationData,
                        locationTypeFilteredData
                    );
                }
                if (user.pickup_branch) {
                    locationCityFilteredData = locationCityFilteredData.filter(
                        (data) =>
                            data.location_type === "Pickup" &&
                            data.location_city === user.pickup_branch
                    );
                    Array.prototype.push.apply(
                        filteredLocationData,
                        locationCityFilteredData
                    );
                }

                if (filteredLocationData.length > 0) {
                    setFetchedLocationsData(filteredLocationData);
                    setLoading1(false);

                    if (refreshLocationData) {
                        setRefreshLocationData(false);
                        setSelectedLocationType("");
                    }
                } else {
                    setFetchedLocationsData(locationData);
                    setLoading1(false);

                    if (refreshLocationData) {
                        setRefreshLocationData(false);
                        setSelectedLocationType("");
                    }
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
        fetchLocations();
        initFilters1();
        getReferences();
    }, []);

    useEffect(() => {
        if (refreshLocationData) {
            fetchLocations();
        }
    }, [refreshLocationData]);

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

    //   All Render Blocks
    const actionButtonRender = (rowData) => {
        return (
            <div>
                <Button
                    style={{ height: "2rem", width: "2rem" }}
                    icon="pi pi-pen-to-square"
                    text
                    aria-label="Filter"
                    onClick={() => {
                        setEditLocationDialogVisible(true);
                        setSelectedLocation(rowData);
                    }}
                />
            </div>
        );
    };

    const createdUpdatedDateRender = (rowData) => {
        return (
            <>
                <span className="text-xs">
                    {rowData.location_created_at.toLocaleString("en-IN")}
                </span>{" "}
                <br />
                <span className="text-xs">
                    {rowData.location_updated_at
                        ? rowData.location_updated_at.toLocaleString("en-IN")
                        : ""}
                </span>
            </>
        );
    };

    const clientNameRender = (rowData) => {
        return (
            <div>
                <span>{rowData.client_name}</span> <br />
                <span className="text-xs text-500">{rowData.client_phone}</span>
            </div>
        );
    };

    const locationAddressRender = (rowData) => {
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
            <Seo pageTitle="Locations" />
            <Toast ref={toast} appendTo={null} />
            <Spinner isLoading={isLoading} isLoadingText={isLoadingText} />

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-baseline">
                            <h5>All Locations!</h5>
                            <small>
                                &nbsp;(Total: {fetchedLocationsData.length})
                            </small>
                        </div>
                        <DataTable
                            value={fetchedLocationsData}
                            size="small"
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
                            emptyMessage="No Locations found."
                        >
                            <Column
                                field="location_key_id"
                                header="Action"
                                body={actionButtonRender}
                                align="center"
                                style={{ maxWidth: "5rem" }}
                            />
                            <Column
                                field="location_created_at"
                                sortable
                                // filter
                                // filterPlaceholder="Search by date"
                                header="Created/Updated On"
                                body={createdUpdatedDateRender}
                                //   filterElement={dateFilterTemplate}
                            ></Column>
                            <Column
                                field="location_type"
                                header="Type"
                                // filter
                                // filterPlaceholder="Search by name"
                                sortable
                            ></Column>
                            <Column
                                field="city"
                                header="City"
                                // filterMenuStyle={{ width: "14rem" }}
                                style={{ minWidth: "12rem" }}
                                sortable
                            ></Column>
                            <Column
                                field="name_of_pickup_point"
                                header="Location Name"
                                //   body={clientNameRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="address1"
                                header="Address"
                                body={locationAddressRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                        </DataTable>
                    </div>
                </div>

                <AddLocationDialog
                    addLocationDialogVisible={addLocationDialogVisible}
                    setAddLocationDialogVisible={setAddLocationDialogVisible}
                    references={references}
                    user={user}
                    setRefreshLocationData={setRefreshLocationData}
                    selectedLocationType={selectedLocationType}
                    setSelectedLocationType={setSelectedLocationType}
                />

                <EditLocationDialog
                    editLocationDialogVisible={editLocationDialogVisible}
                    setEditLocationDialogVisible={setEditLocationDialogVisible}
                    references={references}
                    user={user}
                    setRefreshLocationData={setRefreshLocationData}
                    selectedLocation={selectedLocation}
                />
            </div>
        </>
    );
};

export default Locations;
