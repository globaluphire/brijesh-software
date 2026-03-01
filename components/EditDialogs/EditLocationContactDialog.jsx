import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";

export default function EditLocationContactDialog({
    editLocationContactDialogVisible,
    setEditLocationContactDialogVisible,
    user,
    setRefreshLocationContactData,
    selectedLocationContact,
}) {
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    // form states
    // initialize form field
    const editLocationContactFields = {
        // contact details
        contactName: "",
        contactPhone: null,
        contactEmail: "",
    };
    const [locationContactFormData, setLocationContactFormData] = useState(
        JSON.parse(JSON.stringify(editLocationContactFields))
    );
    const {
        // contact details
        contactName,
        contactPhone,
        contactEmail,
    } = useMemo(() => locationContactFormData, [locationContactFormData]);

    // initialize form error fields
    const editLocationContactErrorFields = {
        // contact details
        contactNameError: "",
        contactPhoneError: "",
        contactEmailError: "",
    };
    const [locationContactErrorFormData, setLocationContactErrorFormData] =
        useState(JSON.parse(JSON.stringify(editLocationContactErrorFields)));
    const {
        // contact details
        contactNameError,
        contactPhoneError,
        contactEmailError,
    } = useMemo(
        () => locationContactErrorFormData,
        [locationContactErrorFormData]
    );

    // set pre loaded values
    useEffect(() => {
        if (selectedLocationContact) {
            setLocationContactFormData((previousState) => ({
                ...previousState,
                contactName: selectedLocationContact.contact_name,
                contactPhone: selectedLocationContact.contact_phone,
                contactEmail: selectedLocationContact.contact_email,
            }));
        }
    }, [selectedLocationContact]);

    const validateForm = () => {
        let isValid = true;

        if (!contactName) {
            setLocationContactErrorFormData((previousState) => ({
                ...previousState,
                contactNameError: "Contact name is required.",
            }));
            isValid = false;
        } else {
            setLocationContactErrorFormData((previousState) => ({
                ...previousState,
                contactNameError: "",
            }));
        }

        if (!contactPhone) {
            setLocationContactErrorFormData((previousState) => ({
                ...previousState,
                contactPhoneError: "Contact phone is required.",
            }));
            isValid = false;
        } else {
            setLocationContactErrorFormData((previousState) => ({
                ...previousState,
                contactPhoneError: "",
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

    const resetForm = () => {
        setLocationContactFormData(
            JSON.parse(JSON.stringify(editLocationContactFields))
        );
        setLocationContactErrorFormData(
            JSON.parse(JSON.stringify(editLocationContactErrorFields))
        );
    };

    const saveEditedChanges = async () => {
        try {
            // saving data
            const { data: locationContactData, error: locationContactError } =
                await supabase
                    .from("location_contact")
                    .update({
                        contact_name: contactName,
                        contact_phone: contactPhone,
                        contact_email: contactEmail,
                        location_contact_updated_at: new Date(),
                        location_contact_updated_by: user.id,
                    })
                    .eq(
                        "location_contact_id",
                        selectedLocationContact.location_contact_id
                    );
            if (locationContactError) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while saving Location Contact data, Please try again later or contact tech support",
                });
            } else {
                // open toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: " Location contact updated successfully",
                });
                resetForm();
            }
        } catch (err) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while saving Location Contact details, Please try again later or contact tech support",
            });
        }
    };

    const saveChanges = () => {
        setLoading(true);

        if (validateForm()) {
            try {
                saveEditedChanges().then(() => {
                    setEditLocationContactDialogVisible(false);
                    setLoading(false);
                    setRefreshLocationContactData(true);
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
                header={"Edit Location Contact"}
                visible={editLocationContactDialogVisible}
                style={{
                    width: "70vw",
                    height: "70vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!editLocationContactDialogVisible) return;
                    setEditLocationContactDialogVisible(false);
                    setLocationContactErrorFormData(
                        JSON.parse(
                            JSON.stringify(editLocationContactErrorFields)
                        )
                    );
                }}
                footer={footerContent}
                maximizable
            >
                <div className="grid p-fluid mt-1">
                    <div className="col-12">
                        <div className="card">
                            <h5>Location Contact Details</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="">Contact Type*</label>
                                    <InputText
                                        value={
                                            selectedLocationContact.contact_type
                                        }
                                        disabled
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="locationContactName">
                                        Contact Name
                                    </label>
                                    <InputText
                                        id="locationContactName"
                                        value={contactName}
                                        placeholder="Enter contact name"
                                        onChange={(e) => {
                                            setLocationContactFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    contactName: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                    {contactNameError ? (
                                        <Message
                                            severity="error"
                                            text={contactNameError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="locationContactPhone">
                                        Phone Number
                                    </label>
                                    <InputNumber
                                        id="locationContactPhone"
                                        value={contactPhone}
                                        onChange={(e) => {
                                            setLocationContactFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    contactPhone: e.value,
                                                })
                                            );
                                        }}
                                        prefix="+91 "
                                        useGrouping={false}
                                    />
                                    {contactPhoneError ? (
                                        <Message
                                            severity="error"
                                            text={contactPhoneError}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="locationContactEmail">
                                        Email Address
                                    </label>
                                    <InputText
                                        value={contactEmail}
                                        onChange={(e) => {
                                            setLocationContactFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    contactEmail:
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
