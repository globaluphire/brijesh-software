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
import AddOrderCommentDialog from "../../components/dialogs/AddOrderCommentDialog";
import CancelOrderDialog from "../../components/dialogs/CancelOrderDialog";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";

export default function OpenOrderDialog({
  orderDetailsDialogVisible,
  setOrderDetailsDialogVisible,
  selectedOrder,
  selectedOrderDetails,
  setSelectedOrderDetails,
  references,
  user,
  setRefreshData,
}) {
  const toast = useRef(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCommentSaved, setIsCommentSaved] = useState(false);
  const [cancelOrderDialogVisible, setCancelOrderDialogVisible] =
    useState(false);
  const [addOrderCommentDialogVisible, setAddOrderCommentDialogVisible] =
    useState(false);

  const [sizeReferenceOptions, setSizeReferenceOptions] = useState([]);
  const [materialTypeReferenceOptions, setMaterialTypeReferenceOptions] =
    useState([]);
  const [priorityReferenceOptions, setPriorityReferenceOptions] = useState([]);
  const [cancelReasonOptions, setCancelReasonOptions] = useState([]);
  const [fetchedOrderCommentData, setFetchedOrderCommentData] = useState([]);

  const addOrderDetailsErrorFields = {
    quantityError: "",
    materialError: "",
    weightError: null,
    sizeError: "",
    priorityError: "",
  };
  const [orderDetailsFormErrorData, setOrderDetailsFormErrorData] = useState(
    JSON.parse(JSON.stringify(addOrderDetailsErrorFields))
  );
  const {
    quantityError,
    materialError,
    weightError,
    sizeError,
    priorityError,
  } = useMemo(() => orderDetailsFormErrorData, [orderDetailsFormErrorData]);

  const validateForm = (data) => {
    let isValid = true;

    if (!selectedOrderDetails.editedMaterial) {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        materialError: "Material is required.",
      }));
      isValid = false;
    } else {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        materialError: "",
      }));
    }

    if (!selectedOrderDetails.editedSize) {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        sizeError: "Size is required.",
      }));
      isValid = false;
    } else {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        sizeError: "",
      }));
    }

    if (!selectedOrderDetails.editedPriority) {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        priorityError: "Priority is required.",
      }));
      isValid = false;
    } else {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        priorityError: "",
      }));
    }

    if (!selectedOrderDetails.editedQuantity) {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        quantityError: "Quantity is required.",
      }));
      isValid = false;
    } else {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        quantityError: "",
      }));
    }

    if (!selectedOrderDetails.editedWeight) {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        weightError: "Weight is required.",
      }));
      isValid = false;
    } else {
      setOrderDetailsFormErrorData((previousState) => ({
        ...previousState,
        weightError: "",
      }));
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

  const saveChanges = () => {
    setLoading(true);
    // console.log(selectedOrderDetails);
    if (validateForm()) {
      try {
        updateOrderDetails().then(() => {
          setOrderDetailsDialogVisible(false);
          setLoading(false);
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
        label="Discard"
        raised
        icon="pi pi-times"
        onClick={() => {
          setOrderDetailsDialogVisible(false);
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
        }}
        className="p-button-text"
      />
      <Button
        label="Save Changes"
        raised
        icon="pi pi-check"
        autoFocus
        loading={loading}
        onClick={saveChanges}
      />
    </div>
  );

  const dateTimeFormat = (val) => {
    if (val) {
      return new Date(val).toLocaleString("en-IN");
    }
  };

  const fetchOrderCommentData = async () => {
    const { data: orderCommentData, error: e } = await supabase
      .from("order_comments_view")
      .select("*")
      .eq("order_id", selectedOrderDetails.editedOrderId)
      .order("order_comment_created_at", { ascending: false });

    if (orderCommentData) {
      orderCommentData.forEach(
        (orderComment) =>
          (orderComment.order_comment_created_at = dateTimeFormat(
            orderComment.order_comment_created_at
          ))
      );
      setFetchedOrderCommentData(orderCommentData);
      setIsCommentSaved(false);
    }
  };

  useEffect(() => {
    if (selectedOrderDetails.editedOrderId) {
      fetchOrderCommentData();
    }
  }, [selectedOrderDetails.editedOrderId]);

  useEffect(() => {
    if (isCommentSaved) {
      fetchOrderCommentData();
    }
  }, [isCommentSaved]);

  async function getReferences() {
    setMaterialTypeReferenceOptions(
      references.filter((i) => i.ref_nm === "materialType")
    );
    setSizeReferenceOptions(references.filter((i) => i.ref_nm === "size"));
    setPriorityReferenceOptions(
      references.filter((i) => i.ref_nm === "priority")
    );
    setCancelReasonOptions(
      references.filter((i) => i.ref_nm === "cancelReason")
    );
  }
  useEffect(() => {
    if (references.length !== 0) getReferences();
  }, [references]);

  const updateOrderDetails = async () => {
    setLoading(true);

    if (selectedOrderDetails.editedStatus !== "Cancel") {
      if (selectedOrderDetails.editedStatus !== "Completed") {
        try {
          const { data, error } = await supabase
            .from("orders")
            .update({
              quantity: selectedOrderDetails.editedQuantity,
              material: selectedOrderDetails.editedMaterial.ref_dspl,
              size: selectedOrderDetails.editedSize.ref_dspl,
              priority: selectedOrderDetails.editedPriority.ref_dspl,
              weight: selectedOrderDetails.editedWeight,
              eway_number: selectedOrderDetails.editedEwayNumber,
              eway_verified: selectedOrderDetails.editedEwayVerified,
              company_name: selectedOrderDetails.editedCompanyName,
              local_transport: selectedOrderDetails.editedLocalTransport,
              truck_details: selectedOrderDetails.editedTruckDetails,
              order_updated_at: new Date(),
              order_updated_by: user.id,
            })
            .eq("order_id", selectedOrderDetails.editedOrderId)
            .select();

          if (data) {
            // open toast
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: "Order Details Changes saved successfully.",
            });
            setRefreshData(true);
            setLoading(false);
          } else {
            // open toast
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "Error while saving your changes.",
            });
            setLoading(false);
          }
        } catch (e) {
          // open toast
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail:
              "Error while saving your changes! Please contact tech support",
          });
          setLoading(false);
        }
      } else {
        // open toast
        toast.current.show({
          severity: "info",
          summary: "Info",
          detail:
            "This order is already Completed! You cannot save your changes.",
        });
        setLoading(false);
      }
    } else {
      // open toast
      toast.current.show({
        severity: "info",
        summary: "Info",
        detail:
          "This order is already Cancelled! You cannot save your changes.",
      });
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (selectedOrderDetails.editedStatus !== "Cancel") {
      if (selectedOrderDetails.editedStatus !== "Completed") {
        if (newStatus !== "N/A") {
          const { data, error } = await supabase
            .from("orders")
            .update({
              status: newStatus,
              status_last_updated_at: new Date(),
            })
            .eq("order_id", selectedOrderDetails.editedOrderId)
            .select();

          if (data) {
            setSelectedOrderDetails((previousState) => ({
              ...previousState,
              editedStatus: newStatus,
            }));
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: "Order status marked as " + newStatus,
            });
          } else {
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "Error while Saving Order Status!",
            });
          }
        } else {
          toast.current.show({
            severity: "info",
            summary: "Info",
            detail:
              "This order is already Completed! No further status updates needed.",
          });
        }
      } else {
        toast.current.show({
          severity: "info",
          summary: "Info",
          detail:
            "This order is already Completed! No further status updates needed.",
        });
      }
    } else {
      toast.current.show({
        severity: "warning",
        summary: "Warning",
        detail:
          "This order is already Cancelled! You cannot change the status.",
      });
    }
  };

  const determineBadgeColor = (status) => {
    switch (status) {
      case "Ready for pickup":
        return { color: "#87CEEB", textColor: "#333", tag: "Ready for pickup" };
      case "Tempo under the process":
        return {
          color: "#FFA500",
          textColor: "#333",
          tag: "Tempo under the process",
        };
      case "In process of departure":
        return {
          color: "#8f83c3",
          textColor: "#fff",
          tag: "In process of departure",
        };
      case "At destination city warehouse":
        return {
          color: "#FFE284",
          textColor: "#333",
          tag: "At destination city warehouse",
        };
      case "Ready for final delivery":
        return { color: "green", tag: "Ready for final delivery" };
      case "Cancel":
        return { color: "#dc3545", tag: "Cancel Order" };
      case "Completed":
        return { color: "gray", tag: "Completed" };
      default:
        return {
          color: "#B55385",
          textColor: "#fff",
          tag: "Under pickup process",
        };
    }
  };

  const determineNextStatus = (status) => {
    switch (status) {
      case "Under pickup process":
        return { color: "#87CEEB", tag: "Ready for pickup" };
      case "Ready for pickup":
        return { color: "#FFA500", tag: "Tempo under the process" };
      case "Tempo under the process":
        return { color: "#8f83c3", tag: "In process of departure" };
      case "In process of departure":
        return { color: "#FFE284", tag: "At destination city warehouse" };
      case "At destination city warehouse":
        return { color: "green", tag: "Ready for final delivery" };
      case "Ready for final delivery":
        return { color: "gray", tag: "Completed" };
      default:
        return { color: "#E9ECEF", tag: "N/A" };
    }
  };

  function cancelOrderDialogPermission() {
    if (selectedOrderDetails.editedStatus !== "Cancel") {
      if (selectedOrderDetails.editedStatus !== "Completed") {
        setCancelOrderDialogVisible(true);
      } else {
        toast.current.show({
          severity: "info",
          summary: "Info",
          detail:
            "This order is already Completed! No further status updates needed.",
        });
      }
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail:
          "This order is already Cancelled! You cannot change the status.",
      });
    }
  }
  function addCommentDialogPermission() {
    if (selectedOrderDetails.editedStatus !== "Cancel") {
      if (selectedOrderDetails.editedStatus !== "Completed") {
        setAddOrderCommentDialogVisible(true);
      } else {
        toast.current.show({
          severity: "info",
          summary: "Info",
          detail:
            "This order is already Completed! No further status updates needed.",
        });
      }
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail:
          "This order is already Cancelled! You cannot change the status.",
      });
    }
  }

  const renderHeader1 = () => {
    return (
      <div>
        <span>
          {"Order Details of " + selectedOrderDetails.editedOrderNumber}
        </span>{" "}
        <br />
        {selectedOrderDetails.editedStatus === "Cancel" ? (
          <Tag className="badge" severity="danger">
            This order is cancelled!
          </Tag>
        ) : (
          ""
        )}
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        header={renderHeader1}
        visible={orderDetailsDialogVisible}
        style={{ width: "90vw", height: "80vh", backgroundColor: "#eee" }}
        onHide={() => {
          if (!orderDetailsDialogVisible) return;
          setOrderDetailsDialogVisible(false);
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
        }}
        footer={footerContent}
        maximizable
      >
        <div className="grid mt-1">
          <div className="col-12">
            <div className="flex flex-wrap gap-2">
              <Button
                label="Cancel Order"
                severity="danger"
                raised
                onClick={cancelOrderDialogPermission}
              />
              <Button label="Split Order" severity="success" raised />
              <Button label="Add Breakage" severity="warning" raised />
              <Button
                label="Add Order Comment"
                severity="warning"
                raised
                onClick={addCommentDialogPermission}
              />
              <Button label="Breakage History" severity="info" raised />
              <Button
                label={
                  determineNextStatus(selectedOrderDetails.editedStatus).tag
                }
                severity="help"
                raised
                onClick={() => {
                  updateOrderStatus(
                    determineNextStatus(selectedOrderDetails.editedStatus).tag
                  );
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid p-fluid">
          <div className="col-12">
            <div className="card">
              {/* <h5>Advanced</h5> */}
              <div className="p-fluid formgrid grid">
                <div className="field col-12">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Quantity</span>
                    <InputTextarea
                      rows={2}
                      value={selectedOrderDetails.editedQuantity}
                      onChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedQuantity: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  {quantityError ? (
                    <Message severity="error" text={quantityError} />
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Material</span>
                    <Dropdown
                      id="materialType"
                      value={selectedOrderDetails.editedMaterial}
                      onChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedMaterial: e.target.value,
                        }));
                      }}
                      options={materialTypeReferenceOptions}
                      optionLabel="ref_dspl"
                      placeholder="select material type"
                    ></Dropdown>
                  </div>
                  {materialError ? (
                    <Message severity="error" text={materialError} />
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Weight</span>
                    <InputNumber
                      value={selectedOrderDetails.editedWeight}
                      onValueChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedWeight: e.target.value,
                        }));
                      }}
                      min={1}
                      locale="en-IN"
                      suffix=" Kg"
                    />
                  </div>
                  {weightError ? (
                    <Message severity="error" text={weightError} />
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Size</span>
                    <Dropdown
                      id="size"
                      value={selectedOrderDetails.editedSize}
                      onChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedSize: e.target.value,
                        }));
                      }}
                      options={sizeReferenceOptions}
                      optionLabel="ref_dspl"
                      placeholder="select size"
                    ></Dropdown>
                  </div>
                  {sizeError ? (
                    <Message severity="error" text={sizeError} />
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Priority</span>
                    <Dropdown
                      id="priority"
                      value={selectedOrderDetails.editedPriority}
                      onChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedPriority: e.target.value,
                        }));
                      }}
                      options={priorityReferenceOptions}
                      optionLabel="ref_dspl"
                      placeholder="select priority"
                    ></Dropdown>
                  </div>
                  {priorityError ? (
                    <Message severity="error" text={priorityError} />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 lg:col-6">
            <div className="card">
              {/* <h5>Advanced</h5> */}
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon col-4">
                      Eway Bill Number
                    </span>
                    <InputNumber
                      value={selectedOrderDetails.editedEwayNumber}
                      onValueChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedEwayNumber: e.target.value,
                        }));
                      }}
                      min={1}
                      format={false}
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon col-4">
                      Eway Bill Verified
                    </span>
                    <InputSwitch
                      checked={selectedOrderDetails.editedEwayVerified}
                      onChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedEwayVerified: e.value,
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="field col-12">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Company Name</span>
                    <InputText
                      value={selectedOrderDetails.editedCompanyName}
                      onChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedCompanyName: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="field col-12">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Local Transport</span>
                    <InputTextarea
                      value={selectedOrderDetails.editedLocalTransport}
                      onChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedLocalTransport: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="field col-12">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Truck Details</span>
                    <InputTextarea
                      value={selectedOrderDetails.editedTruckDetails}
                      onChange={(e) => {
                        setSelectedOrderDetails((previousState) => ({
                          ...previousState,
                          editedTruckDetails: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 lg:col-6">
            <div className="card">
              {/* <h5>Advanced</h5> */}
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Created On</span>
                    <InputText
                      value={selectedOrderDetails.editedOrderCreatedDate.toLocaleString("en-IN")}
                      disabled
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Updated On</span>
                    <InputText
                      value={selectedOrderDetails.editedOrderUpdatedDate.toLocaleString("en-IN")}
                      disabled
                    />
                  </div>
                </div>
                <div className="field col-12">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Order Notes</span>
                    <InputTextarea
                      rows={2}
                      value={selectedOrderDetails.editedNotes}
                      disabled
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Order Location</span>
                    <InputText
                      value={selectedOrderDetails.editedOrderLocation}
                      disabled
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Status</span>
                    <InputText
                      value={
                        determineBadgeColor(selectedOrderDetails.editedStatus)
                          .tag
                      }
                      style={{
                        backgroundColor: determineBadgeColor(
                          selectedOrderDetails.editedStatus
                        ).color,
                        color: determineBadgeColor(
                          selectedOrderDetails.editedStatus
                        ).textColor,
                        margin: "auto",
                      }}
                      disabled
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Pickup Location</span>
                    <InputText
                      value={selectedOrderDetails.editedPickupLocation}
                      disabled
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Drop Location</span>
                    <InputText
                      value={selectedOrderDetails.editedDropLocation}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>Order Comment History</h5>
              {/* <Splitter style={{ height: "fit-content" }}> */}
              {/* <SplitterPanel size={100} minSize={10}> */}
              <Timeline
                value={fetchedOrderCommentData}
                opposite={(item) => (
                  <>
                    <small className="text-color-secondary">
                      {item.order_comment_created_at}
                    </small>
                    <br />
                    <small className="text-color-secondary">{item.name}</small>
                  </>
                )}
                content={(item) => item.order_comment}
              />
              {/* </SplitterPanel> */}
              {/* <SplitterPanel size={70}>
                  <Splitter layout="vertical">
                    <SplitterPanel size={50} minSize={10}>
                      <div className="h-full flex align-items-center justify-content-center">
                        Panel 2
                      </div>
                    </SplitterPanel>
                    <SplitterPanel size={50} minSize={10}>
                      <div className="h-full flex align-items-center justify-content-center">
                        Panel 3
                      </div>
                    </SplitterPanel>
                  </Splitter>
                </SplitterPanel> */}
              {/* </Splitter> */}
            </div>
          </div>
        </div>
      </Dialog>

      <AddOrderCommentDialog
        addOrderCommentDialogVisible={addOrderCommentDialogVisible}
        setAddOrderCommentDialogVisible={setAddOrderCommentDialogVisible}
        selectedOrderDetails={selectedOrderDetails}
        user={user}
        setIsCommentSaved={setIsCommentSaved}
      />

      <CancelOrderDialog
        cancelOrderDialogVisible={cancelOrderDialogVisible}
        setCancelOrderDialogVisible={setCancelOrderDialogVisible}
        selectedOrderDetails={selectedOrderDetails}
        setSelectedOrderDetails={setSelectedOrderDetails}
        setOrderDetailsDialogVisible={setOrderDetailsDialogVisible}
        user={user}
        cancelReasonOptions={cancelReasonOptions}
        setRefreshData={setRefreshData}
      />
    </>
  );
}
