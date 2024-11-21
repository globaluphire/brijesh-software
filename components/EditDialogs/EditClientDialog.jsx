import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";

export default function EditClientDialog({
    editClientDialogVisible,
    setEditClientDialogVisible,
    references,
    user,
    setRefreshClientData,
    clientDetails,
    setClientDetails,
}) {
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    // form states
    // initialize form field
    const editClientFields = {
        clientType: null,
        clientName: "",
        clientGstin: "",
        clientPan: "",
        clientPhone: null,
        clientEmail: "",
        clientAddress1: "",
        clientAddress2: "",
        clientArea: "",
        clientCity: "",
        clientState: "",
        clientPin: null,
        clientContactName: "",
        clientContactPhone: null,
        clientContactEmail: "",
    };
    const [clientFormData, setClientFormData] = useState(
        JSON.parse(JSON.stringify(editClientFields))
    );
    const {
        clientType,
        clientName,
        clientGstin,
        clientPan,
        clientPhone,
        clientEmail,
        clientAddress1,
        clientAddress2,
        clientArea,
        clientCity,
        clientState,
        clientPin,
        clientContactName,
        clientContactPhone,
        clientContactEmail,
    } = useMemo(() => clientFormData, [clientFormData]);

    // initialize form error fields
    const editClientErrorFields = {
        clientTypeError: "",
        clientNameError: "",
        clientGstinError: "",
        clientPhoneError: "",
        clientAddress1Error: "",
        clientAreaError: "",
        clientCityError: "",
        clientStateError: "",
        clientPinError: "",
    };
    const [clientFormErrorData, setClientFormErrorData] = useState(
        JSON.parse(JSON.stringify(editClientErrorFields))
    );
    const {
        clientTypeError,
        clientNameError,
        clientGstinError,
        clientPhoneError,
        clientAddress1Error,
        clientAreaError,
        clientCityError,
        clientStateError,
        clientPinError,
    } = useMemo(() => clientFormErrorData, [clientFormErrorData]);

    // set pre loaded values
    useEffect(() => {
        if (editClientDialogVisible) {
            setClientFormData((previousState) => ({
                ...previousState,
                clientType: clientDetails.editedClientType,
                clientName: clientDetails.editedClientName,
                clientGstin: clientDetails.editedClientGstin,
                clientPan: clientDetails.editedClientPan,
                clientPhone: clientDetails.editedClientPhone,
                clientEmail: clientDetails.editedClientEmail,
                clientAddress1: clientDetails.editedClientAddress1,
                clientAddress2: clientDetails.editedClientAddress2,
                clientArea: clientDetails.editedClientArea,
                clientCity: clientDetails.editedClientCity,
                clientState: clientDetails.editedClientState,
                clientPin: clientDetails.editedClientPin,
                clientContactName: clientDetails.editedClientContactName,
                clientContactPhone: clientDetails.editedClientContactPhone,
                clientContactEmail: clientDetails.editedClientContactEmail,
            }));
        }
    }, [editClientDialogVisible]);

    // all refs
    const [cityRefs, setCityRefs] = useState([]);
    const [clientTypeRefs, setClientTypeRefs] = useState([]);

    // get references block
    async function getReferences() {
        setCityRefs(references.filter((i) => i.ref_nm === "city"));
        setClientTypeRefs(references.filter((i) => i.ref_nm === "clientType"));
    }
    useEffect(() => {
        if (references.length !== 0) getReferences();
    }, [references]);

    const validateForm = (data) => {
        let isValid = true;
        if (!clientType) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientTypeError: "Client type is required.",
            }));
            isValid = false;
        }

        if (!clientName) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientNameError: "Client Name is required.",
            }));
            isValid = false;
        }

        if (!clientGstin) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientGstinError: "Client GST Number is required.",
            }));
            isValid = false;
        }

        if (!clientPhone) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientPhoneError: "Client Phone Number is required.",
            }));
            isValid = false;
        }

        if (!clientAddress1) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientAddress1Error: "Address 1 is required.",
            }));
            isValid = false;
        }

        if (!clientArea) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientAreaError: "Area is required.",
            }));
            isValid = false;
        }

        if (!clientCity) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientCityError: "City is required.",
            }));
            isValid = false;
        }

        if (!clientState) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientStateError: "State is required.",
            }));
            isValid = false;
        }

        if (!clientPin) {
            setClientFormErrorData((previousState) => ({
                ...previousState,
                clientPinError: "PIN is required.",
            }));
            isValid = false;
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
        setClientFormData(JSON.parse(JSON.stringify(editClientFields)));
        setClientFormErrorData(
            JSON.parse(JSON.stringify(editClientErrorFields))
        );
    };

    const saveEditedChanges = async () => {
        try {
            const { data: clientData, error: clientError } = await supabase
                .from("client")
                .update({
                    // client
                    client_type: clientType.ref_dspl,
                    client_name: clientName,
                    client_email: clientEmail,
                    client_phone: clientPhone,
                    client_gst: clientGstin,
                    client_pan: clientPan,

                    // client address
                    address1: clientAddress1,
                    address2: clientAddress2,
                    city: clientCity.ref_dspl,
                    state: clientState,
                    area: clientArea,
                    pin: clientPin,

                    // client contact
                    contact_name: clientContactName,
                    contact_phone: clientContactPhone,
                    contact_email: clientContactEmail,

                    client_last_updated_at: new Date(),
                    client_updated_by: user.id,
                })
                .eq("client_number", clientDetails.editedClientNumber);

            if (clientError) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while saving Client Details, Please try again later or contact tech support.",
                });
            } else {
                // open toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Client Details updated successfully",
                });

                resetForm();
            }
        } catch (err) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while saving client details, Please try again later or contact tech support.",
            });
        }
    };

    const saveChanges = () => {
        setLoading(true);

        if (validateForm()) {
            try {
                saveEditedChanges().then(() => {
                    setEditClientDialogVisible(false);
                    setLoading(false);
                    setRefreshClientData(true);
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

    return (
        <>
            <Toast ref={toast} appendTo={null} />

            <Dialog
                header={"Edit Client (" + clientDetails.editedClientName + ")"}
                visible={editClientDialogVisible}
                style={{
                    width: "80vw",
                    height: "70vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!editClientDialogVisible) return;
                    setEditClientDialogVisible(false);
                    setClientFormErrorData(
                        JSON.parse(JSON.stringify(editClientErrorFields))
                    );
                }}
                footer={footerContent}
                maximizable
            >
                <div className="grid p-fluid mt-1">
                    <div className="col-12">
                        <div className="card">
                            <h5>Details</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-3 md:col-6">
                                    <label htmlFor="clientType">
                                        Client Type*
                                    </label>
                                    <Dropdown
                                        id="clientType"
                                        options={clientTypeRefs}
                                        optionLabel="ref_dspl"
                                        placeholder="Select client type"
                                        filter
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientType: e.target.value,
                                                })
                                            );
                                        }}
                                        value={clientType}
                                    />
                                    {clientTypeError ? (
                                        <Message
                                            severity="error"
                                            text={clientTypeError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientName">
                                        Client Name*
                                    </label>
                                    <InputText
                                        id="clientName"
                                        value={clientName}
                                        placeholder="Enter client name"
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientName: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {clientNameError ? (
                                        <Message
                                            severity="error"
                                            text={clientNameError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientName">GSTIN*</label>
                                    <InputText
                                        id="clientGstin"
                                        value={clientGstin}
                                        placeholder="Enter GST number"
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientGstin:
                                                        e.target.value.toUpperCase(),
                                                })
                                            );
                                        }}
                                    />
                                    {clientGstinError ? (
                                        <Message
                                            severity="error"
                                            text={clientGstinError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientName">
                                        PAN Number
                                    </label>
                                    <InputText
                                        id="clientPan"
                                        value={clientPan}
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientPan:
                                                        e.target.value.toUpperCase(),
                                                })
                                            );
                                        }}
                                        placeholder="Enter PAN"
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientName">
                                        Phone Number*
                                    </label>
                                    <InputNumber
                                        value={clientPhone}
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientPhone: e.value,
                                                })
                                            );
                                        }}
                                        prefix="+91 "
                                        useGrouping={false}
                                    />
                                    {clientPhoneError ? (
                                        <Message
                                            severity="error"
                                            text={clientPhoneError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientName">
                                        Email Address
                                    </label>
                                    <InputText
                                        value={clientEmail}
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientEmail: e.target.value,
                                                })
                                            );
                                        }}
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <h5>Client Address</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-3 md:col-6">
                                    <label htmlFor="clientAddress1">
                                        Address 1*
                                    </label>
                                    <InputText
                                        id="clientAddress1"
                                        value={clientAddress1}
                                        placeholder="Enter address 1"
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientAddress1:
                                                        e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {clientAddress1Error ? (
                                        <Message
                                            severity="error"
                                            text={clientAddress1Error}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientAddress2">
                                        Address 2
                                    </label>
                                    <InputText
                                        id="clientAddress2"
                                        value={clientAddress2}
                                        placeholder="Enter address 2"
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientAddress2:
                                                        e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientArea">Area*</label>
                                    <InputText
                                        id="clientArea"
                                        value={clientArea}
                                        placeholder="Enter area"
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientArea: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {clientAreaError ? (
                                        <Message
                                            severity="error"
                                            text={clientAreaError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientCity">City*</label>
                                    <Dropdown
                                        id="clientCity"
                                        options={cityRefs}
                                        optionLabel="ref_dspl"
                                        placeholder="Select a city"
                                        filter
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientCity: e.target.value,
                                                })
                                            );
                                        }}
                                        value={clientCity}
                                    />
                                    {clientCityError ? (
                                        <Message
                                            severity="error"
                                            text={clientCityError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientState">State*</label>
                                    <InputText
                                        id="clientState"
                                        value={clientState}
                                        placeholder="Enter state"
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientState: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {clientStateError ? (
                                        <Message
                                            severity="error"
                                            text={clientStateError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientName">PIN*</label>
                                    <InputNumber
                                        value={clientPin}
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientPin: e.value,
                                                })
                                            );
                                        }}
                                        useGrouping={false}
                                    />
                                    {clientPinError ? (
                                        <Message
                                            severity="error"
                                            text={clientPinError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <h5>Client Contact</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-3 md:col-6">
                                    <label htmlFor="clientContactName">
                                        Contact Name
                                    </label>
                                    <InputText
                                        id="clientContactName"
                                        value={clientContactName}
                                        placeholder="Enter contact name"
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientContactName:
                                                        e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientContactPhone">
                                        Phone Number
                                    </label>
                                    <InputNumber
                                        value={clientContactPhone}
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientContactPhone: e.value,
                                                })
                                            );
                                        }}
                                        prefix="+91 "
                                        useGrouping={false}
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="clientContactEmail">
                                        Email Address
                                    </label>
                                    <InputText
                                        value={clientContactEmail}
                                        onChange={(e) => {
                                            setClientFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    clientContactEmail:
                                                        e.target.value,
                                                })
                                            );
                                        }}
                                        placeholder="Enter email address"
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
