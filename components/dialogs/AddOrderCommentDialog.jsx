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
import { getLrNumber, getOrderNumber } from "../../utils/generateUniqueNumber";
import { format } from "date-fns";

export default function AddOrderCommentDialog({
  addOrderCommentDialogVisible,
  setAddOrderCommentDialogVisible,
  selectedOrderDetails,
  user,
  setIsCommentSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [notesError, setNotesError] = useState(false);
  const [notes, setNotes] = useState("");
  const toast = useRef(null);

  const addOrderComment = async () => {
    // generate order
    try {
      const { data, error } = await supabase
        .from("order_comments")
        .insert([
          {
            order_comment: notes,
            order_number: selectedOrderDetails.editedOrderNumber,
            user_id: user.id,
            order_id: selectedOrderDetails.editedOrderId,
          },
        ])
        .select();
      if (error) {
        // open toast
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            "Error while saving order comment, Please try again later or contact tech support",
        });
      } else {
        // open toast
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Order comment saved successfully",
        });

        setNotes("");
        setNotesError(false);
      }
    } catch (err) {
      // open toast
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          "Error while Saving Order Comment, Please try again later or contact tech support",
      });
    }
  };

  const saveChanges = () => {
    setLoading(true);

    if (notes) {
      try {
        addOrderComment().then(() => {
          setIsCommentSaved(true);
          setAddOrderCommentDialogVisible(false);
          setLoading(false);
        });
      } catch (e) {
        setLoading(false);
      }
    } else {
      setNotesError(true);
      setLoading(false);
    }
  };

  const footerContent = (
    <div>
      <Button
        label="Add Comment"
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
        header={"Add Order Comment"}
        visible={addOrderCommentDialogVisible}
        style={{ width: "60vw", height: "50vh", backgroundColor: "#eee" }}
        onHide={() => {
          if (!addOrderCommentDialogVisible) return;
          setAddOrderCommentDialogVisible(false);
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
                  <label htmlFor="notes">Enter Note</label>
                  <InputTextarea
                    id="notes"
                    value={notes}
                    placeholder="Add order notes"
                    rows={5}
                    onChange={(e) => {
                      setNotes(e.target.value);
                    }}
                  />
                  {notesError ? (
                    <Message severity="error" text="Notes is required" />
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
