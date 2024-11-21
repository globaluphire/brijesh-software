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
import CreateInvoiceDialog from "../../components/dialogs/CreateInvoiceDialog";
import InvoiceDetailsDialog from "../../components/EditDialogs/InvoiceDetailsDialog";
import { Toast } from "primereact/toast";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import Seo from "../../components/seo";

const Invoices = () => {
    const toast = useRef(null);

    const user = useSelector((state) => state.initialState.user);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [createInvoiceDialogVisible, setCreateInvoiceDialogVisible] =
        useState(false);

    const [fetchedInvoiceData, setFetchedInvoiceData] = useState([]);

    const [filters1, setFilters1] = useState(null);
    const [loading1, setLoading1] = useState(true);
    const [idFrozen, setIdFrozen] = useState(false);
    const [globalFilterValue1, setGlobalFilterValue1] = useState("");
    const [references, setReferences] = useState([]);
    const [refreshData, setRefreshData] = useState(false);

    // all dialog states
    const [invoiceDetailsDialogVisible, setInvoiceDetailsDialogVisible] =
        useState(false);
    const [selectedInvoiceData, setSelectedInvoiceData] = useState("");

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
            .in("ref_nm", ["city", "clientContactType"]);

        if (refData) {
            setReferences(refData);
        }
    }

    async function fetchInvoice() {
        setLoading1(true);

        // fetch location data
        try {
            let query = supabase.from("invoice_view").select("*");

            if (user.drop_branch) {
                query.eq("order_city", user.drop_branch);
            }

            let { data: invoiceData, error } = await query.order(
                "invoice_created_at",
                { ascending: false, nullsFirst: false }
            );

            if (invoiceData) {
                invoiceData.forEach(
                    (i) =>
                        (i.invoice_created_at = dateTimeFormat(
                            i.invoice_created_at
                        ))
                );
                invoiceData.forEach(
                    (i) =>
                        (i.invoice_updated_at = dateTimeFormat(
                            i.invoice_updated_at
                        ))
                );

                setFetchedInvoiceData(invoiceData);
                setLoading1(false);
                setRefreshData(false);
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
        fetchInvoice();
        initFilters1();
        // getReferences();
    }, []);

    useEffect(() => {
        if (refreshData) fetchInvoice();
    }, [refreshData]);

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

    async function handleAccept(rowData) {
        try {
            const { data, error } = await supabase
                .from("invoice")
                .update({
                    is_paid: true,
                    invoice_updated_at: new Date(),
                    invoice_updated_by: user.id,
                })
                .eq("invoice_id", rowData.invoice_id);

            if (error) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while marking invoice as PAID. Please try again later or contact tech support",
                });
            } else {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Invoice marked as PAID",
                });
                setRefreshData(true);
            }
        } catch {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while mark invoice as PAID. Please try again later or contact tech support",
            });
        }
    }

    const paidConfirmPopup = (rowData) => {
        confirmDialog({
            message:
                "This Action can not be undo! Are you sure you want to mark this invoice as PAID?",
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                handleAccept(rowData);
            },
        });
    };

    //   All Render Blocks
    const actionButtonRender = (rowData) => {
        return (
            <div>
                <Button
                    className="action-badge"
                    text
                    rounded
                    icon="pi pi-eye"
                    style={{
                        backgroundColor: "#14A24A",
                        height: "2rem",
                        width: "2rem",
                        color: "white",
                    }}
                    onClick={() => {
                        setCreateInvoiceDialogVisible(true);
                        setSelectedOrder(rowData);
                    }}
                ></Button>

                <Tooltip target=".action-invoice-paid" />
                <Tooltip target=".action-invoice-unpaid" />

                {rowData.is_paid ? (
                    <>
                        <Button
                            icon="pi pi-indian-rupee"
                            text
                            rounded
                            aria-label="Filter"
                            style={{
                                backgroundColor: "#14A24A",
                                height: "2rem",
                                width: "2rem",
                                color: "white",
                            }}
                            onClick={() => {
                                toast.current.show({
                                    severity: "info",
                                    summary: "Info",
                                    detail: "Invoice already marked as PAID",
                                });
                            }}
                            className="action-invoice-paid action-badge ml-1"
                            data-pr-tooltip="Invoice is already paid!"
                            data-pr-position="top"
                        />
                    </>
                ) : (
                    <>
                        <Button
                            style={{
                                backgroundColor: "#BD2025",
                                height: "2rem",
                                width: "2rem",
                                color: "white",
                            }}
                            icon="pi pi-indian-rupee"
                            text
                            rounded
                            aria-label="Filter"
                            onClick={() => {
                                paidConfirmPopup(rowData);
                            }}
                            className="action-invoice-unpaid action-badge ml-1"
                            data-pr-tooltip="Mark invoice as Paid"
                            data-pr-position="top"
                        />
                    </>
                )}
            </div>
        );
    };

    const createdUpdatedDateRender = (rowData) => {
        return (
            <>
                <span className="text-xs">
                    {rowData.invoice_created_at.toLocaleString("en-IN")}
                </span>{" "}
                <br />
                <span className="text-xs">
                    {rowData.invoice_updated_at
                        ? rowData.invoice_updated_at.toLocaleString("en-IN")
                        : ""}
                </span>
            </>
        );
    };

    const invoiceDateInfoRender = (rowData) => {
        return (
            <>
                <span>
                    {new Date(
                        rowData.invoice_date.split("-")[0],
                        rowData.invoice_date.split("-")[1] - 1,
                        rowData.invoice_date.split("-")[2]
                    ).toLocaleDateString("en-IN")}
                </span>{" "}
                <br />
            </>
        );
    };

    const invoicePickupDateInfoRender = (rowData) => {
        return (
            <>
                <span>
                    {new Date(
                        rowData.pickup_date.split("-")[0],
                        rowData.pickup_date.split("-")[1] - 1,
                        rowData.pickup_date.split("-")[2]
                    ).toLocaleDateString("en-IN")}
                </span>{" "}
                <br />
            </>
        );
    };

    const invoiceNumberRender = (rowData) => {
        return (
            <>
                {user.role === "SUPER_ADMIN" ? (
                    <a
                        onClick={() => {
                            setInvoiceDetailsDialogVisible(true);
                            setSelectedInvoiceData(rowData);
                        }}
                    >
                        {rowData.invoice_number}
                    </a>
                ) : (
                    rowData.invoice_number
                )}
            </>
        );
    };

    const routeRender = (rowData) => {
        return (
            <>
                <span>
                    {rowData.pickup_location} - {rowData.drop_location}
                </span>
            </>
        );
    };

    const statusRender = (rowData) => {
        return (
            <Tag
                severity={rowData.is_paid ? "success" : "danger"}
                value={rowData.is_paid ? "PAID" : "UNPAID"}
            ></Tag>
        );
    };

    return (
        <>
            <Seo pageTitle="Invoices" />
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-baseline">
                            <h5>All Invoices!</h5>
                            <small>
                                &nbsp;(Total: {fetchedInvoiceData.length})
                            </small>
                        </div>
                        <DataTable
                            value={fetchedInvoiceData}
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
                            emptyMessage="No Invoices found."
                        >
                            <Column
                                field="invoice_key_id"
                                header="Action"
                                body={actionButtonRender}
                                align="center"
                                style={{ maxWidth: "5rem" }}
                            />
                            <Column
                                field="total_amount"
                                header="Amount"
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="invoice_created_at"
                                sortable
                                filter
                                filterPlaceholder="Search by date"
                                header="Created/Updated On"
                                body={createdUpdatedDateRender}
                                //   filterElement={dateFilterTemplate}
                            ></Column>
                            <Column
                                field="invoice_date"
                                header="Invoice Date"
                                body={invoiceDateInfoRender}
                                filter
                                filterPlaceholder="Search by name"
                                sortable
                            ></Column>
                            <Column
                                field="pickup_date"
                                header="Pickup Date"
                                body={invoicePickupDateInfoRender}
                                filterMenuStyle={{ width: "14rem" }}
                                style={{ minWidth: "12rem" }}
                                sortable
                            ></Column>
                            <Column
                                field="invoice_number"
                                header="Invoice No"
                                body={invoiceNumberRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="order_number"
                                header="Order No"
                                // body={locationAddressRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="order_city"
                                header="Order City"
                                // body={locationAddressRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="client_name"
                                header="Client Name"
                                // body={locationAddressRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="route"
                                header="Route"
                                body={routeRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                            <Column
                                field="weight"
                                header="Weight (Kg)"
                                // body={routeRender}
                                filter
                                filterPlaceholder="Search by email"
                                sortable
                            ></Column>
                        </DataTable>
                    </div>
                </div>

                <CreateInvoiceDialog
                    createInvoiceDialogVisible={createInvoiceDialogVisible}
                    setCreateInvoiceDialogVisible={
                        setCreateInvoiceDialogVisible
                    }
                    selectedOrder={selectedOrder}
                    user={user}
                />

                <InvoiceDetailsDialog
                    invoiceDetailsDialogVisible={invoiceDetailsDialogVisible}
                    setInvoiceDetailsDialogVisible={
                        setInvoiceDetailsDialogVisible
                    }
                    setRefreshData={setRefreshData}
                    user={user}
                    selectedInvoiceData={selectedInvoiceData}
                />
            </div>
        </>
    );
};

export default Invoices;
