import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { format } from "date-fns";

export default function CreateInvoiceDialog({
    invoiceDetailsDialogVisible,
    setInvoiceDetailsDialogVisible,
    setRefreshData,
    user,
    selectedInvoiceData,
}) {
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    // form states
    const [totalAmount, setTotalAmount] = useState(null);
    const [invoiceDate, setInvoiceDate] = useState(null);

    const [totalAmountError, setTotalAmountError] = useState("");
    const [invoiceDateError, setInvoiceDateError] = useState("");

    // pre set values
    useEffect(() => {
        if (invoiceDetailsDialogVisible) {
            setTotalAmount(selectedInvoiceData.total_amount);
            let preSetInvoiceDate = new Date(
                selectedInvoiceData.invoice_date.split("-")[0],
                selectedInvoiceData.invoice_date.split("-")[1] - 1,
                selectedInvoiceData.invoice_date.split("-")[2]
            );
            setInvoiceDate(preSetInvoiceDate);
        }
    }, [invoiceDetailsDialogVisible]);

    const validateForm = () => {
        let isValid = true;

        if (!totalAmount) {
            setTotalAmountError("Total Amount is required.");
            isValid = false;
        } else {
            setTotalAmountError("");
        }

        if (!invoiceDate) {
            setInvoiceDateError("Invoice Date is required.");
            isValid = false;
        } else {
            setInvoiceDateError("");
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
        setInvoiceDate(null);
        setTotalAmountError("");
        setInvoiceDateError("");
    };

    async function saveEditedChanges() {
        try {
            const { data, error } = await supabase
                .from("invoice")
                .update({
                    total_amount: totalAmount,
                    invoice_date: format(invoiceDate, "yyyy-MM-dd"),
                    invoice_updated_at: new Date(),
                    invoice_updated_by: user.id,
                })
                .eq("invoice_id", selectedInvoiceData.invoice_id);
            if (error) {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Error while saving Invoice details, Please try again later or contact tech support",
                });
            } else {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Invoice details saved successfully",
                });
            }
        } catch (err) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while saving Invoice details, Please try again later or contact tech support",
            });
        }
    }

    const saveChanges = () => {
        setLoading(true);

        if (validateForm()) {
            try {
                saveEditedChanges()
                    .then(() => {
                        setInvoiceDetailsDialogVisible(false);
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
        </>
    );

    return (
        <>
            <Toast ref={toast} appendTo={null} />

            <Dialog
                header={"Edit Invoice Details"}
                visible={invoiceDetailsDialogVisible}
                style={{
                    width: "80vw",
                    height: "80vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!invoiceDetailsDialogVisible) return;
                    setInvoiceDetailsDialogVisible(false);
                }}
                maximizable
                footer={footerContent}
            >
                <div className="grid p-fluid mt-1">
                    <div className="col-12">
                        <div className="card">
                            {/* <h5>Advanced</h5> */}
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <div className="p-inputgroup flex-1">
                                        <span className="p-inputgroup-addon">
                                            Invoice Number
                                        </span>
                                        <InputText
                                            value={
                                                selectedInvoiceData.invoice_number
                                            }
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <div className="p-inputgroup flex-1">
                                        <span className="p-inputgroup-addon">
                                            Created On
                                        </span>
                                        <InputText
                                            value={new Date(
                                                selectedInvoiceData.invoice_created_at
                                            ).toLocaleString("en-IN")}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <div className="p-inputgroup flex-1">
                                        <span className="p-inputgroup-addon">
                                            Updated On
                                        </span>
                                        <InputText
                                            value={new Date(
                                                selectedInvoiceData.invoice_updated_at
                                            ).toLocaleString("en-IN")}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            {/* <h5>Advanced</h5> */}
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="totalAmount">
                                        Total Amount*
                                    </label>
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
                                        <Message
                                            severity="error"
                                            text={totalAmountError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="invoiceDate">
                                        Invoice Date*
                                    </label>
                                    <Calendar
                                        id="invoiceDate"
                                        dateFormat="dd/mm/yy"
                                        mask="99/99/9999"
                                        value={invoiceDate} // TODO: needed Indian timezone
                                        onChange={(e) => {
                                            setInvoiceDate(e.target.value);
                                        }}
                                    />
                                    {invoiceDateError ? (
                                        <Message
                                            severity="error"
                                            text={invoiceDateError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
