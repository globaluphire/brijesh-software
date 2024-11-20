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
import { format } from "date-fns";
import { getInvoiceNumber } from "../../utils/generateUniqueNumber";
import ViewInvoice from "../ViewInvoice/ViewInvoice";
import Spinner from "../spinner";

export default function CreateInvoiceDialog({
  createInvoiceDialogVisible,
  setCreateInvoiceDialogVisible,
  selectedOrder,
  setRefreshData,
  user,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // form states
  const [totalAmount, setTotalAmount] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date());

  const [totalAmountError, setTotalAmountError] = useState("");

  // initialize form error fields
  const invoiceFormErrorFields = {
    lrStatusError: [],
    vehicalNumberError: [],
  };
  const [invoiceFormErrorData, setInvoiceFormErrorData] = useState(
    JSON.parse(JSON.stringify(invoiceFormErrorFields))
  );
  const { lrStatusError, vehicalNumberError } = useMemo(
    () => invoiceFormErrorData,
    [invoiceFormErrorData]
  );

  const validateForm = () => {
    let isValid = true;

    if (!totalAmount) {
      setTotalAmountError("Total Amount is required.");
      isValid = false;
    } else {
      setTotalAmountError("");
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
    setTotalAmount(null);
    setInvoiceDate(new Date());
    setTotalAmountError("");
    setInvoiceFormErrorData(JSON.parse(JSON.stringify(invoiceFormErrorFields)));
  };

  async function finalValidation() {
    const { data: lrData, error: e } = await supabase
      .from("lr")
      .select("*")
      .eq("order_id", selectedOrder.order_id);

    if (lrData) {
      let isValid = true;
      let checkLRStatus = [];
      let checkVehicleNumber = [];

      for (var i = 0; i < lrData.length; i++) {
        if (lrData[i].status === "Performa") {
          checkLRStatus.push(lrData[i].lr_number);
        }
        if (!lrData[i].vehical_number) {
          checkVehicleNumber.push(lrData[i].lr_number);
        }
      }

      if (checkLRStatus && checkLRStatus.length > 0) {
        setInvoiceFormErrorData((previousState) => ({
          ...previousState,
          lrStatusError: checkLRStatus,
        }));
        isValid = false;
      }

      if (checkVehicleNumber && checkVehicleNumber.length > 0) {
        setInvoiceFormErrorData((previousState) => ({
          ...previousState,
          vehicalNumberError: checkVehicleNumber,
        }));
        isValid = false;
      }

      return isValid;
    } else {
      // error while validating
    }
  }
  async function createInvoice() {
    if (await finalValidation()) {
      try {
        // Generate Invoice Number
        const invoiceNumber = await getInvoiceNumber();

        const { data, error } = await supabase.from("invoice").insert([
          {
            invoice_number: invoiceNumber,
            total_amount: totalAmount,
            invoice_date: format(invoiceDate, "yyyy-MM-dd"),
            order_id: selectedOrder.order_id,
            invoice_created_by: user.id,
          },
        ]);
        if (error) {
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail:
              "Error while saving Invoice details, Please try again later or contact tech support",
          });
        } else {
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "New Invoice saved successfully",
          });

          // increment lr_number key
          await supabase.rpc("increment_sys_key", {
            x: 1,
            keyname: "invoice_number",
          });
        }
      } catch (err) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            "Error while saving Invoice details, Please try again later or contact tech support",
        });
      }
    } else {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Please complete all listed points",
      });

      throw new Error("Please complete all listed points");
    }
  }

  async function savePDF() {
    setIsLoading(true);
    setLoadingText("Invoice PDF is being generated...");
    var element = document.getElementById("export-invoice");
    element.classList.add("exportClass");
    var opt = {
      margin: 0,
      filename: "Raftaar-Invoice-" + selectedOrder.invoice_number + ".pdf",
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

  const saveChanges = () => {
    setLoading(true);

    if (validateForm()) {
      try {
        createInvoice()
          .then(() => {
            setCreateInvoiceDialogVisible(false);
            setLoading(false);
            setRefreshData(true);
          })
          .catch((e) => {
            setLoading(false);
          });
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const footerContent = (
    <>
      {!(selectedOrder && selectedOrder.invoice_number) ? (
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
            label="Create Invoice"
            outlined
            icon="pi pi-check"
            autoFocus
            loading={loading}
            onClick={saveChanges}
          />
        </div>
      ) : (
        <Button
          label="Export to PDF"
          severity="success"
          icon="pi pi-print"
          autoFocus
          loading={loading}
          onClick={() => savePDF()}
        />
      )}
    </>
  );

  const renderHeader =
    selectedOrder && selectedOrder.invoice_number ? (
      <>
        <span>View Invoice for </span>
        <span>{selectedOrder.order_number}</span>
        <span className="text-sm">
          {" "}
          (Created By {selectedOrder.invoice_created_by_name})
        </span>
      </>
    ) : selectedOrder ? (
      "Create Invoice for " + selectedOrder.order_number
    ) : (
      ""
    );
  return (
    <>
      <Toast ref={toast} appendTo={null} />
      <Spinner isLoading={isLoading} loadingText={loadingText} />

      <Dialog
        header={renderHeader}
        visible={createInvoiceDialogVisible}
        style={{ width: "80vw", height: "80vh", backgroundColor: "#eee" }}
        onHide={() => {
          if (!createInvoiceDialogVisible) return;
          setCreateInvoiceDialogVisible(false);
          setInvoiceFormErrorData(
            JSON.parse(JSON.stringify(invoiceFormErrorFields))
          );
        }}
        maximizable
        footer={footerContent}
      >
        {!(selectedOrder && selectedOrder.invoice_number) ? (
          <div className="grid p-fluid mt-1">
            <div className="col-12">
              <div className="card">
                {/* <h5>Advanced</h5> */}
                <div className="p-fluid formgrid grid">
                  <div className="field col-12 lg:col-6 md:col-6">
                    <label htmlFor="totalAmount">Total Amount*</label>
                    <InputNumber
                      id="totalAmount"
                      value={totalAmount}
                      min={1}
                      mode="currency"
                      currency="INR"
                      currencyDisplay="code"
                      locale="en-IN"
                      onChange={(e) => {
                        setTotalAmount(e.value);
                      }}
                    />
                    {totalAmountError ? (
                      <Message severity="error" text={totalAmountError} />
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="field col-12 lg:col-6 md:col-6">
                    <label htmlFor="invoiceDate">Invoice Date*</label>
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
                </div>
              </div>
            </div>
            {lrStatusError.length > 0 || vehicalNumberError.length > 0 ? (
              <div className="col-12">
                <div className="card">
                  {/* <h5>Advanced</h5> */}
                  <div className="p-fluid formgrid grid">
                    <div className="field col-12 text-red-600">
                      <span>
                        Order is incomplete! Please complete below listed points
                        before creating invoice.
                      </span>
                      <br />
                      <br />
                      {lrStatusError.length > 0 ? (
                        <ul className="m-0 px-3 pt-1">
                          <li>Below LR must be in FINAL Status:</li>
                          <ul className="m-0 px-3 pt-1">
                            {lrStatusError.map((item) => (
                              <li>
                                {/* TODO: link direct to LrDialog */}
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </ul>
                      ) : (
                        ""
                      )}
                      <br />
                      {vehicalNumberError.length > 0 ? (
                        <ul className="m-0 px-3 pt-1">
                          <li>Below LR must have Vehical Number:</li>
                          <ul className="m-0 px-3 pt-1">
                            {vehicalNumberError.map((item) => (
                              <li>
                                {/* TODO: link direct to LrDialog */}
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </ul>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        ) : (
          <ViewInvoice invoiceNumber={selectedOrder.invoice_number} />
        )}
      </Dialog>
    </>
  );
}
