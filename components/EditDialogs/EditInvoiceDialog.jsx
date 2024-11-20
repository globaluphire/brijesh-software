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
import {
  getClientNumber,
  getInvoiceNumber,
  getLrNumber,
  getOrderNumber,
} from "../../utils/generateUniqueNumber";
import { format } from "date-fns";
import Spinner from "../spinner";
import ViewInvoice from "../ViewInvoice/ViewInvoice";
import ViewOldInvoice from "../ViewOldInvoice/ViewOldInvoice";

export default function EditInvoiceDialog({
  editInvoiceDialogVisible,
  setEditInvoiceDialogVisible,
  user,
  setRefreshData,
  invoiceDetails,
  setInvoiceDetails,
  selectedInvoiceData,
  setSelectedInvoiceData,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const [invoiceDate, setInvoiceDate] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // form states
  // initialize form field
  const editInvoiceFields = {
    lrNumber: "",

    buyerName: "",
    buyerGST: "",
    buyerAddress: "",

    vehicalNumber: "",

    ewayBillNumber: "",
    fromCity: "",
    toCity: "",
    material: "",
    quantity: "",
    orderNumber: "",
    amount: null,
    weight: null,
  };
  const [invoiceFormData, setInvoiceFormData] = useState(
    JSON.parse(JSON.stringify(editInvoiceFields))
  );
  const {
    lrNumber,

    buyerName,
    buyerGST,
    buyerAddress,

    vehicalNumber,

    ewayBillNumber,
    fromCity,
    toCity,
    material,
    quantity,
    orderNumber,
    amount,
    weight,
  } = useMemo(() => invoiceFormData, [invoiceFormData]);

  // set pre loaded values
  useEffect(() => {
    if (editInvoiceDialogVisible) {
      setInvoiceFormData((previousState) => ({
        ...previousState,

        lrNumber: invoiceDetails.editedLrNumber,

        buyerName: invoiceDetails.editedBuyerName,
        buyerGST: invoiceDetails.editedBuyerGST,
        buyerAddress: invoiceDetails.editedBuyerAddress,

        vehicalNumber: invoiceDetails.editedVehicalNumber,

        ewayBillNumber: invoiceDetails.editedEwayBillNumber,
        fromCity: invoiceDetails.editedFromCity,
        toCity: invoiceDetails.editedToCity,
        material: invoiceDetails.editedMaterial,
        quantity: invoiceDetails.editedQuantity,
        orderNumber: invoiceDetails.editedOrderNumber,
        amount: invoiceDetails.editedAmount,
        weight: invoiceDetails.editedWeight,
      }));
      const [year, month, day] = invoiceDetails.editedInvoiceDate.split("-");
      setInvoiceDate(
        invoiceDetails.editedInvoiceDate ? new Date(year, month - 1, day) : null
      );
    }
  }, [editInvoiceDialogVisible]);

  const resetForm = () => {
    setInvoiceFormData(JSON.parse(JSON.stringify(editInvoiceFields)));
    setInvoiceDate(null);
  };

  const saveEditedChanges = async () => {
    try {
      const invoiceNumber = await getInvoiceNumber();

      const { data, error } = await supabase
        .from("invoice")
        .update({
          company_name: buyerName,
          company_gst: buyerGST,
          company_address: buyerAddress,
          vehical_number: vehicalNumber,
          eway_bill_number: ewayBillNumber,
          from_city: fromCity,
          to_city: toCity,
          material: material,
          quantity: quantity,
          lr_number: lrNumber,
          order_number: orderNumber,
          total_amount: amount,
          weight: weight,
          invoice_date: invoiceDate ? format(invoiceDate, "yyyy-MM-dd") : null,
          invoice_updated_at: new Date(),
        })
        .eq("invoice_number", invoiceDetails.editedInvoiceNumber);

      if (error) {
        // open toast
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            "Error while saving Invoice details, Please try again later or contact tech support",
        });
      } else {
        // open toast
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Invoice details saved successfully.",
        });

        resetForm();
      }
    } catch (err) {
      // open toast
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          "Error while saving Invoice details, Please try again later or contact tech support",
      });
    }
  };

  const saveChanges = () => {
    setLoading(true);

    try {
      saveEditedChanges().then(() => {
        setEditInvoiceDialogVisible(false);
        setLoading(false);
        setRefreshData(true);
      });
    } catch (e) {
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
        label="Save Changes"
        outlined
        icon="pi pi-check"
        autoFocus
        loading={loading}
        onClick={saveChanges}
      />
    </div>
  );

  async function savePDF() {
    setIsLoading(true);
    setLoadingText("Invoice PDF is being generated...");
    var element = document.getElementById("export-invoice");
    element.classList.add("exportClass");
    var opt = {
      margin: 0,
      filename: "Raftaar-Invoice-" + selectedInvoiceData.invoice_number + ".pdf",
      image: { type: "png" },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
    };

    window
      .html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        element.classList.remove("exportClass");
        setIsLoading(false);
        setLoadingText("");
      });
  }

  const renderHeader = (
    <>
      <div class="flex flex-wrap">
        <div class="surface-overlay">
          <span className="vertical-align-middle">Edit Invoice </span>
          <span className="vertical-align-middle">
            {selectedInvoiceData.invoice_number}
          </span>{" "}
          <Button
            label="Print / Export to PDF"
            severity="success"
            icon="pi pi-print"
            loading={loading}
            onClick={() => savePDF()}
            size="small"
            className="vertical-align-middle"
          />
        </div>
      </div>
    </>
  );
  return (
    <>
      <Toast ref={toast} appendTo={null} />
      <Spinner isLoading={isLoading} loadingText={loadingText} />

      <Dialog
        header={renderHeader}
        visible={editInvoiceDialogVisible}
        style={{ width: "80vw", height: "70vh", backgroundColor: "#eee" }}
        onHide={() => {
          if (!editInvoiceDialogVisible) return;
          setEditInvoiceDialogVisible(false);
        }}
        footer={footerContent}
        maximizable
      >
        <div className="grid p-fluid mt-1">
          <div className="col-12">
            <div className="card">
              <h5>Bill To</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-6 md:col-6">
                  <label htmlFor="buyerName">Company Name</label>
                  <InputText
                    id="buyerName"
                    value={buyerName}
                    placeholder="Enter company name"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        buyerName: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <label htmlFor="buyerGST">GSTIN/UIN</label>
                  <InputText
                    id="buyerGST"
                    value={buyerGST}
                    placeholder="Enter GST number"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        buyerGST: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12">
                  <label htmlFor="buyerAddress">Address</label>
                  <InputText
                    id="buyerAddress"
                    value={buyerAddress}
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        buyerAddress: e.target.value,
                      }));
                    }}
                    placeholder="Buyer's Address"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>General</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="vehicalNumber">Vehical Number</label>
                  <InputText
                    id="vehicalNumber"
                    value={vehicalNumber}
                    placeholder="Enter vehical number"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        vehicalNumber: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="lrNumber">LR Number</label>
                  <InputText
                    id="lrNumber"
                    value={lrNumber}
                    placeholder="Enter LR number"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        lrNumber: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="orderNumber">Order Number</label>
                  <InputText
                    id="orderNumber"
                    value={orderNumber}
                    placeholder="Enter order number"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        orderNumber: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>Services</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="invoiceDate">Invoice Date</label>
                  <Calendar
                    id="invoiceDate"
                    dateFormat="dd/mm/yy"
                    mask="99/99/9999"
                    value={invoiceDate} // TODO: needed Indian timezone
                    onChange={(e) => {
                      setInvoiceDate(e.target.value);
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="fromCity">From City</label>
                  <InputText
                    id="fromCity"
                    value={fromCity}
                    placeholder="Enter city"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        fromCity: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="toCity">To City</label>
                  <InputText
                    id="toCity"
                    value={toCity}
                    placeholder="Enter city"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        toCity: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12">
                  <label htmlFor="quantity">Quantity</label>
                  <InputText
                    id="quantity"
                    value={quantity}
                    placeholder="Enter quantity"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        quantity: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="material">Material</label>
                  <InputText
                    id="material"
                    value={material}
                    placeholder="Enter material"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        material: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="weight">Weight(Kg)</label>
                  <InputNumber
                    id="weight"
                    value={weight}
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        weight: e.value,
                      }));
                    }}
                    suffix=" Kg"
                    useGrouping={false}
                  />
                </div>
                <div className="field col-12 lg:col-4 md:col-4">
                  <label htmlFor="ewayBillNumber">EWay Bill Number</label>
                  <InputText
                    id="ewayBillNumber"
                    value={ewayBillNumber}
                    placeholder="Enter eway bill number"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        ewayBillNumber: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>Services Amount</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-6 md:col-6">
                  <label htmlFor="amount">Total Amount</label>
                  <InputNumber
                    id="amount"
                    value={amount}
                    mode="currency"
                    currency="INR"
                    currencyDisplay="code"
                    locale="en-IN"
                    onChange={(e) => {
                      setInvoiceFormData((previousState) => ({
                        ...previousState,
                        amount: e.value,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ViewOldInvoice selectedInvoiceData={selectedInvoiceData} />
      </Dialog>
    </>
  );
}
