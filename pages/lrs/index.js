import React, { useState, useEffect } from "react";
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

const LRs = () => {
    const user = useSelector((state) => state.initialState.user);

    const [fetchedLRData, setFetchedLRData] = useState([]);

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
                {/* <div className="field col-12 lg:col-2">
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
        </div> */}
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
            .in("ref_nm", ["lrStatus"]);

        if (refData) {
            setReferences(refData);
        }
    }

    async function fetchLR() {
        setLoading1(true);

        // fetch location data
        try {
            let query = supabase.from("lr_view").select("*");

            if (user.drop_branch) {
                query.eq("order_city", user.drop_branch);
            }

            let { data: lrData, error } = await query.order("lr_created_date", {
                ascending: false,
                nullsFirst: false,
            });

            if (lrData) {
                lrData.forEach(
                    (i) =>
                        (i.lr_created_date = dateTimeFormat(i.lr_created_date))
                );
                lrData.forEach(
                    (i) =>
                        (i.lr_last_modified_date = dateTimeFormat(
                            i.lr_last_modified_date
                        ))
                );

                setFetchedLRData(lrData);
                setLoading1(false);
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
        fetchLR();
        initFilters1();
        getReferences();
    }, []);

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
                    //   onClick={() => setLRDialogVisible(true)}
                />
            </div>
        );
    };

    const createdUpdatedDateRender = (rowData) => {
        return (
            <>
                <span className="text-xs">
                    {rowData.lr_created_date.toLocaleString("en-IN")}
                </span>{" "}
                <br />
                <span className="text-xs">
                    {rowData.lr_last_modified_date
                        ? rowData.lr_last_modified_date.toLocaleString("en-IN")
                        : ""}
                </span>
            </>
        );
    };

    const consignorRender = (rowData) => {
        return (
            <div>
                <span>{rowData.consignor_name}</span> <br />
                <span className="text-xs text-500">
                    {rowData.consignor_phone
                        ? "+91 " + rowData.consignor_phone
                        : ""}
                </span>{" "}
                <br />
                <span className="text-xs text-500">
                    {rowData.consignor_email}
                </span>
            </div>
        );
    };

    const consigneeRender = (rowData) => {
        return (
            <div>
                <span>{rowData.consignee_name}</span> <br />
                <span className="text-xs text-500">
                    {rowData.consignee_phone
                        ? "+91 " + rowData.consignee_phone
                        : ""}
                </span>{" "}
                <br />
                <span className="text-xs text-500">
                    {rowData.consignee_email}
                </span>
            </div>
        );
    };

    const pickupPointRender = (rowData) => {
        return (
            <>
                <div
                    className="max-w-10rem text-sm text-overflow-ellipsis overflow-hidden pickup-point-render-tooltip"
                    data-pr-tooltip={[
                        rowData.pickup_point_address1,
                        rowData.pickup_point_address2,
                        rowData.pickup_point_area,
                        rowData.pickup_point_city,
                        rowData.pickup_point_state,
                        rowData.pickup_point_pin,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                    data-pr-position="top"
                >
                    {[
                        rowData.pickup_point_address1,
                        rowData.pickup_point_address2,
                        rowData.pickup_point_area,
                        rowData.pickup_point_city,
                        rowData.pickup_point_state,
                        rowData.pickup_point_pin,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                </div>
                <Tooltip target=".pickup-point-render-tooltip" />
            </>
        );
    };

    const dropPointRender = (rowData) => {
        return (
            <>
                <div
                    className="max-w-10rem text-sm text-overflow-ellipsis overflow-hidden drop-point-render-tooltip"
                    data-pr-tooltip={[
                        rowData.drop_point_address1,
                        rowData.drop_point_address2,
                        rowData.drop_point_area,
                        rowData.drop_point_city,
                        rowData.drop_point_state,
                        rowData.drop_point_pin,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                    data-pr-position="top"
                >
                    {[
                        rowData.drop_point_address1,
                        rowData.drop_point_address2,
                        rowData.drop_point_area,
                        rowData.drop_point_city,
                        rowData.drop_point_state,
                        rowData.drop_point_pin,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                </div>
                <Tooltip target=".drop-point-render-tooltip" />
            </>
        );
    };

    const itemRender = (rowData) => {
        return (
            <div>
                <span>{rowData.material}</span> <br />
                <span>{rowData.quantity}</span>
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

    return (
        <>
            <Seo pageTitle="LRs" />
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-baseline">
                            <h5>All LRs!</h5>
                            <small>&nbsp;(Total: {fetchedLRData.length})</small>
                        </div>
                        <DataTable
                            value={fetchedLRData}
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
                            emptyMessage="No LRs found."
                        >
                            <Column
                                field="lr_key_id"
                                header="Action"
                                body={actionButtonRender}
                                align="center"
                                style={{ maxWidth: "5rem" }}
                            />
                            <Column
                                field="lr_created_date"
                                sortable
                                // filter
                                // filterPlaceholder="Search by date"
                                header="Created/Updated On"
                                body={createdUpdatedDateRender}
                                //   filterElement={dateFilterTemplate}
                            ></Column>
                            <Column
                                field="lr_number"
                                header="LR No"
                                // filter
                                // filterPlaceholder="Search by name"
                                sortable
                            ></Column>
                            <Column
                                field="order_number"
                                header="Order No"
                                // filterMenuStyle={{ width: "14rem" }}
                                style={{ minWidth: "12rem" }}
                                sortable
                            ></Column>
                            <Column
                                field="consignor_name"
                                header="Consignor"
                                body={consignorRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="consignee_name"
                                header="Consignee"
                                body={consigneeRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="pickup_point_address1"
                                header="Pickup Point"
                                body={pickupPointRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="drop_point_address1"
                                header="Drop Point"
                                body={dropPointRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="material"
                                header="Item"
                                body={itemRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="weight"
                                header="Weight(Kg)"
                                //   body={locationAddressRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="vehical_number"
                                header="Truck No"
                                //   body={locationAddressRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="driver_details"
                                header="Driver Details"
                                //   body={locationAddressRender}
                                // filter
                                // filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="status"
                                header="Status"
                                //   body={locationAddressRender}
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
            </div>
        </>
    );
};

export default LRs;
