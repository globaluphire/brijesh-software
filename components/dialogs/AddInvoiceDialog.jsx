import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useMemo, useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { getInvoiceNumber } from "../../utils/generateUniqueNumber";
import { format } from "date-fns";

export default function AddInvoiceDialog({
    addInvoiceDialogVisible,
    setAddInvoiceDialogVisible,
    user,
    setRefreshData,
}) {
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const [invoiceDate, setInvoiceDate] = useState(null);

    // form states
    // initialize form field
    const addInvoiceFields = {
        lrNumber: "",

        buyerName: "",
        buyerGST: "",
        buyerAddress: "",

        vehicalNumber: "",
        termsOfDelivery: "",

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
        JSON.parse(JSON.stringify(addInvoiceFields))
    );
    const {
        lrNumber,

        buyerName,
        buyerGST,
        buyerAddress,

        vehicalNumber,
        termsOfDelivery,

        ewayBillNumber,
        fromCity,
        toCity,
        material,
        quantity,
        orderNumber,
        amount,
        weight,
    } = useMemo(() => invoiceFormData, [invoiceFormData]);

    const resetForm = () => {
        setInvoiceFormData(JSON.parse(JSON.stringify(addInvoiceFields)));
        setInvoiceDate(null);
    };

    const addNewInvoice = async () => {
        try {
            const invoiceNumber = await getInvoiceNumber();

            const { data, error } = await supabase.from("invoice").insert([
                {
                    invoice_number: invoiceNumber,
                    lr_id: "1e6d8fcf-9792-4c21-91c6-fb314c20def7", // DEFAULT LR
                    order_id: "24189c03-dfd1-4a71-8b4e-6ea96bceaa2e", // DEFAULT ORDER
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
                    invoice_date: invoiceDate
                        ? format(invoiceDate, "yyyy-MM-dd")
                        : null,
                    invoice_created_by: user.id,
                },
            ]);

            if (error) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while saving new Invoice, Please try again later or contact tech support",
                });
            } else {
                // open toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New Invoice saved successfully.",
                });

                // increment lr_number key
                await supabase.rpc("increment_sys_key", {
                    x: 1,
                    keyname: "invoice_number",
                });

                resetForm();
            }
        } catch (err) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while saving new Invoice, Please try again later or contact tech support",
            });
        }
    };

    const saveChanges = () => {
        setLoading(true);

        try {
            addNewInvoice().then(() => {
                setAddInvoiceDialogVisible(false);
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
                label="Add Invoice"
                outlined
                icon="pi pi-check"
                autoFocus
                loading={loading}
                onClick={saveChanges}
            />
        </div>
    );

    return (
        <>
            <Toast ref={toast} appendTo={null} />

            <Dialog
                header={"Add New Invoice"}
                visible={addInvoiceDialogVisible}
                style={{
                    width: "80vw",
                    height: "70vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!addInvoiceDialogVisible) return;
                    setAddInvoiceDialogVisible(false);
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
                                    <label htmlFor="buyerName">
                                        Company Name
                                    </label>
                                    <InputText
                                        id="buyerName"
                                        value={buyerName}
                                        placeholder="Enter company name"
                                        onChange={(e) => {
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    buyerName: e.target.value,
                                                })
                                            );
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
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    buyerGST: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12">
                                    <label htmlFor="buyerAddress">
                                        Address
                                    </label>
                                    <InputText
                                        id="buyerAddress"
                                        value={buyerAddress}
                                        onChange={(e) => {
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    buyerAddress:
                                                        e.target.value,
                                                })
                                            );
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
                                    <label htmlFor="vehicalNumber">
                                        Vehical Number
                                    </label>
                                    <InputText
                                        id="vehicalNumber"
                                        value={vehicalNumber}
                                        placeholder="Enter vehical number"
                                        onChange={(e) => {
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    vehicalNumber:
                                                        e.target.value,
                                                })
                                            );
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
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    lrNumber: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12 lg:col-4 md:col-4">
                                    <label htmlFor="orderNumber">
                                        Order Number
                                    </label>
                                    <InputText
                                        id="orderNumber"
                                        value={orderNumber}
                                        placeholder="Enter order number"
                                        onChange={(e) => {
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    orderNumber: e.target.value,
                                                })
                                            );
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
                                    <label htmlFor="invoiceDate">
                                        Invoice Date
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
                                </div>
                                <div className="field col-12 lg:col-4 md:col-4">
                                    <label htmlFor="fromCity">From City</label>
                                    <InputText
                                        id="fromCity"
                                        value={fromCity}
                                        placeholder="Enter city"
                                        onChange={(e) => {
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    fromCity: e.target.value,
                                                })
                                            );
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
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    toCity: e.target.value,
                                                })
                                            );
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
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    quantity: e.target.value,
                                                })
                                            );
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
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    material: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12 lg:col-4 md:col-4">
                                    <label htmlFor="weight">Weight(Kg)</label>
                                    <InputNumber
                                        id="weight"
                                        value={weight}
                                        onChange={(e) => {
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    weight: e.value,
                                                })
                                            );
                                        }}
                                        suffix=" Kg"
                                        useGrouping={false}
                                    />
                                </div>
                                <div className="field col-12 lg:col-4 md:col-4">
                                    <label htmlFor="ewayBillNumber">
                                        EWay Bill Number
                                    </label>
                                    <InputText
                                        id="ewayBillNumber"
                                        value={ewayBillNumber}
                                        placeholder="Enter eway bill number"
                                        onChange={(e) => {
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    ewayBillNumber:
                                                        e.target.value,
                                                })
                                            );
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
                                            setInvoiceFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    amount: e.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
