import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Timeline } from "primereact/timeline";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { getClientNumber } from "../../utils/generateUniqueNumber";
import { format } from "date-fns";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import { Badge } from "primereact/badge";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

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

  const [fetchedOrdersData, setFetchedOrdersData] = useState([]);
  const [totalDebitAmount, setTotalDebitAmount] = useState(0);
  const [totalCreditAmount, setTotalCreditAmount] = useState(0);

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
      const date = new Date(val);
      return date.toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
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
          .order("order_created_at", { ascending: false, nullsFirst: false });

        if (ordersData && ordersData.length > 0) {
          ordersData.forEach(
            (order) =>
              (order.order_created_at = dateFormat(order.order_created_at))
          );
          ordersData.forEach(
            (order) =>
              (order.order_updated_at = dateFormat(order.order_updated_at))
          );
          ordersData.forEach(
            (order) =>
              (order.status_last_updated_at = dateTimeFormat(
                order.status_last_updated_at
              ))
          );

          setFetchedOrdersData(ordersData);

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
                totalCredAmount = totalCredAmount + invoiceData[i].total_amount;
              } else {
                totalDebAmount = totalDebAmount + invoiceData[i].total_amount;
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
  }, [clientDetails.editedClientNumber]);

  // all recent order render blocks
  const orderCreatedInfoRender = (rowData) => {
    return (
      <>
        <span>{rowData.order_created_by_name}</span> <br />
        <span>
          {rowData.order_updated_by_name ? rowData.order_updated_by_name : "-"}
        </span>
      </>
    );
  };

  return (
    <>
      <Toast ref={toast} appendTo={null} />

      <Dialog
        header={"Client Info"}
        visible={clientInfoDialogVisible}
        style={{ width: "80vw", height: "70vh", backgroundColor: "#eee" }}
        onHide={() => {
          if (!clientInfoDialogVisible) return;
          setClientInfoDialogVisible(false);
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
                    style={{ backgroundColor: "#9c27b0", color: "#ffffff" }}
                  >
                    <Badge
                      value={
                        clientDetails.editedClientStatus ? "Active" : "Inactive"
                      }
                      style={{
                        backgroundColor: clientDetails.editedClientStatus
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
                        clientDetails.editedClientCity.ref_dspl,
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
                      label={clientDetails.editedClientType.ref_dspl}
                    />
                  </span>
                  <span className="pl-2">
                    <Chip
                      icon="pi pi-phone"
                      label={"+91 " + clientDetails.editedClientPhone}
                    />
                  </span>
                  <span className="pl-2">
                    <Chip
                      icon="pi pi-envelope"
                      label={clientDetails.editedClientEmail}
                    />
                  </span>
                </div>
                <div className="field col-12">
                  <span>
                    <Chip
                      label={clientDetails.editedClientGstin}
                      style={{ backgroundColor: "#DBEDE4", color: "#33A852" }}
                    />
                  </span>
                  <span className="pl-2">
                    <Chip
                      label={clientDetails.editedClientPan}
                      style={{ backgroundColor: "#D4E1F6", color: "#004F8C" }}
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
                  <span>Client Number: {clientDetails.editedClientNumber}</span>
                </div>
                <div className="field col-12">
                  <span>
                    Client Contact Name: {clientDetails.editedClientContactName}
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
                  <span>Total Order: {fetchedOrdersData.length}</span>
                </div>
                <div className="field col-12">
                  <span>
                    Total Sale: {totalCreditAmount + totalDebitAmount}
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
              rows={5}
              size="small"
              paginator
              dataKey="order_id"
              showGridlines
              stripedRows
              rowHover
              emptyMessage="No orders found"
              responsiveLayout="scroll"
            >
              <Column
                field="order_created_updated_by_name"
                header="Created/Updated By"
                body={orderCreatedInfoRender}
              />
              <Column field="client_name" header="Client Name" />
              <Column field="order_number" header="ERP Order No" />
              <Column field="lr_number" header="LR No" />
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
    </>
  );
}
