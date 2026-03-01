import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";

export default function CancelOrderDialog({
    cancelOrderDialogVisible,
    setCancelOrderDialogVisible,
    selectedOrderDetails,
    setSelectedOrderDetails,
    user,
    setOrderDetailsDialogVisible,
    cancelReasonOptions,
    setRefreshData,
}) {
    const [loading, setLoading] = useState(false);
    const [notesError, setNotesError] = useState(false);
    const [notes, setNotes] = useState("");
    const [cancelReasonError, setCancelReasonError] = useState(false);
    const [cancelReason, setCancelReason] = useState({});
    const toast = useRef(null);

    function validateForm() {
        let isValid = true;
        if (!notes) {
            setNotesError(true);
            isValid = false;
        } else {
            setNotesError(false);
        }
        if (Object.keys(cancelReason).length === 0) {
            setCancelReasonError(true);
            isValid = false;
        } else {
            setCancelReasonError(false);
        }

        return isValid;
    }
    const cancelOrder = async () => {
        try {
            const { data, error } = await supabase
                .from("orders")
                .update({
                    status: "Cancel",
                    cancel_reason: cancelReason.ref_dspl,
                    cancel_note: notes,
                    order_updated_at: new Date(),
                    order_updated_by: user.id,
                    cancel_date: new Date(),
                })
                .eq("order_id", selectedOrderDetails.editedOrderId)
                .select();

            if (data) {
                setCancelReason("");
                setNotes("");
                // open toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Order cancelled successfully.",
                });
            } else {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while Cancelling Order. Please try again later or contact tech support.",
                });
            }
        } catch (err) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while Cancelling Order, Please try again later or contact tech support",
            });
        }
    };

    const saveChanges = () => {
        setLoading(true);

        if (validateForm()) {
            try {
                cancelOrder().then(() => {
                    setOrderDetailsDialogVisible(false);
                    setCancelOrderDialogVisible(false);
                    setLoading(false);
                    setRefreshData(true);
                    setSelectedOrderDetails((previousState) => ({
                        ...previousState,
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
                    }));
                });
            } catch (e) {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const footerContent = (
        <div>
            <Button
                label="Cancel Order"
                outlined
                severity="danger"
                icon="pi pi-times"
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
                header={"Are you sure you want to cancel this order?"}
                visible={cancelOrderDialogVisible}
                style={{
                    width: "60vw",
                    height: "50vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!cancelOrderDialogVisible) return;
                    setCancelOrderDialogVisible(false);
                    setCancelReasonError(false);
                    setNotesError(false);
                }}
                footer={footerContent}
                maximizable
            >
                <div className="grid p-fluid mt-1">
                    <div className="col-12">
                        <div className="card">
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12">
                                    <label htmlFor="cancelReason">
                                        Cancel Reason
                                    </label>
                                    <Dropdown
                                        id="cancelReason"
                                        options={cancelReasonOptions}
                                        optionLabel="ref_dspl"
                                        placeholder="Select cancel Reason"
                                        filter
                                        onChange={(e) => {
                                            setCancelReason(e.target.value);
                                        }}
                                        value={cancelReason}
                                    />
                                    {cancelReasonError ? (
                                        <Message
                                            severity="error"
                                            text="Cancel Reason is required."
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12">
                                    <label htmlFor="notes">Note</label>
                                    <InputTextarea
                                        id="notes"
                                        value={notes}
                                        placeholder="Add order cancellation notes"
                                        rows={5}
                                        onChange={(e) => {
                                            setNotes(e.target.value);
                                        }}
                                    />
                                    {notesError ? (
                                        <Message
                                            severity="error"
                                            text="Notes is required"
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
