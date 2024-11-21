import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { getLocationNumber } from "../../utils/generateUniqueNumber";
import { RadioButton } from "primereact/radiobutton";

export default function AddLocationDialog({
    addLocationDialogVisible,
    setAddLocationDialogVisible,
    references,
    user,
    setRefreshLocationData,
    selectedLocationType,
    setSelectedLocationType,
}) {
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    const [radioSelection, setRadioSelection] = useState("");

    // form states
    // initialize form field
    const addLocationFields = {
        // pick up details
        nameOfPickupPoint: "",
        address1: "",
        address2: "",
        area: "",
        city: "",
        pin: null,
        state: "",

        // pick up contact details
        contactType: "",
        contactName: "",
        contactPhone: null,
        contactEmail: "",

        // Drop details
        nameOfDropPoint: "",
        dropAddress1: "",
        dropAddress2: "",
        dropArea: "",
        dropCity: "",
        dropPin: null,
        dropState: "",

        // contact details
        dropContactType: "",
        dropContactName: "",
        dropContactPhone: null,
        dropContactEmail: "",
    };
    const [locationFormData, setLocationFormData] = useState(
        JSON.parse(JSON.stringify(addLocationFields))
    );
    const {
        // pick up details
        nameOfPickupPoint,
        pickupPointCity,
        address1,
        address2,
        area,
        city,
        pin,
        state,

        // contact details
        contactType,
        contactName,
        contactPhone,
        contactEmail,

        // Drop details
        nameOfDropPoint,
        dropPointCity,
        dropAddress1,
        dropAddress2,
        dropArea,
        dropCity,
        dropPin,
        dropState,

        // contact details
        dropContactType,
        dropContactName,
        dropContactPhone,
        dropContactEmail,
    } = useMemo(() => locationFormData, [locationFormData]);

    // initialize form error fields
    const addLocationErrorFields = {
        // pick up details
        nameOfPickupPointError: "",
        address1Error: "",
        areaError: "",
        cityError: "",
        pinError: "",
        stateError: "",

        // pick up contact details
        contactTypeError: "",
        contactNameError: "",
        contactPhoneError: "",

        // Drop details
        nameOfDropPointError: "",
        dropAddress1Error: "",
        dropAreaError: "",
        dropCityError: "",
        dropPinError: "",
        dropStateError: "",

        // contact details
        dropContactTypeError: "",
        dropContactNameError: "",
        dropContactPhoneError: "",
    };
    const [locationFormErrorData, setLocationFormErrorData] = useState(
        JSON.parse(JSON.stringify(addLocationErrorFields))
    );
    const {
        // pick up details
        nameOfPickupPointError,
        pickupPointCityError,
        address1Error,
        addres2,
        areaError,
        cityError,
        pinError,
        stateError,

        // contact details
        contactTypeError,
        contactNameError,
        contactPhoneError,

        // Drop details
        nameOfDropPointError,
        dropPointCityError,
        dropAddress1Error,
        dropAreaError,
        dropCityError,
        dropPinError,
        dropStateError,

        // contact details
        dropContactTypeError,
        dropContactNameError,
        dropContactPhoneError,
    } = useMemo(() => locationFormErrorData, [locationFormErrorData]);

    // all refs
    const [cityRefs, setCityRefs] = useState([]);
    const [loactionContactTypeRefs, setLocationContactTypeRefs] = useState([]);

    // get references block
    async function getReferences() {
        setCityRefs(references.filter((i) => i.ref_nm === "city"));
        setLocationContactTypeRefs(
            references.filter((i) => i.ref_nm === "clientContactType")
        );
    }
    useEffect(() => {
        if (references.length !== 0) getReferences();
    }, [references]);

    useEffect(() => {
        setRadioSelection(selectedLocationType);
    }, [selectedLocationType]);

    const validateForm = () => {
        let isValid = true;

        if (radioSelection === "Pickup") {
            // pickup point fields
            if (!nameOfPickupPoint) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    nameOfPickupPointError:
                        "Name of pick up point is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    nameOfPickupPointError: "",
                }));
            }

            if (!address1) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    address1Error: "Address 1 is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    address1Error: "",
                }));
            }

            if (!area) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    areaError: "Area is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    areaError: "",
                }));
            }

            if (!city) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    cityError: "City is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    cityError: "",
                }));
            }

            if (!pin) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    pinError: "PIN is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    pinError: "",
                }));
            }

            if (!state) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    stateError: "State is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    stateError: "",
                }));
            }

            if (!contactType) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    contactTypeError: "Contact type is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    contactTypeError: "",
                }));
            }

            if (!contactName) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    contactNameError: "Contact name is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    contactNameError: "",
                }));
            }

            if (!contactPhone) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    contactPhoneError: "Contact phone is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    contactPhoneError: "",
                }));
            }
        } else {
            // Drop fields
            if (!nameOfDropPoint) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    nameOfDropPointError: "Name of Drop point is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    nameOfDropPointError: "",
                }));
            }

            if (!dropAddress1) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropAddress1Error: "Address 1 is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropAddress1Error: "",
                }));
            }

            if (!dropArea) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropAreaError: "Area is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropAreaError: "",
                }));
            }

            if (!dropCity) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropCityError: "City is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropCityError: "",
                }));
            }

            if (!dropPin) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropPinError: "PIN is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropPinError: "",
                }));
            }

            if (!dropState) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropStateError: "State is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropStateError: "",
                }));
            }

            if (!dropContactType) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropContactTypeError: "Contact type is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropContactTypeError: "",
                }));
            }

            if (!dropContactName) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropContactNameError: "Contact name is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropContactNameError: "",
                }));
            }

            if (!dropContactPhone) {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropContactPhoneError: "Contact phone is required.",
                }));
                isValid = false;
            } else {
                setLocationFormErrorData((previousState) => ({
                    ...previousState,
                    dropContactPhoneError: "",
                }));
            }
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
        setLocationFormData(JSON.parse(JSON.stringify(addLocationFields)));
        setLocationFormErrorData(
            JSON.parse(JSON.stringify(addLocationErrorFields))
        );
    };

    const addNewLocation = async () => {
        try {
            const locationNumber = await getLocationNumber();

            // saving data
            const { data: locationData, error: locationError } = await supabase
                .from("location")
                .insert([
                    {
                        // client
                        location_number: locationNumber,
                        location_type: radioSelection,
                        name_of_pickup_point:
                            radioSelection === "Pickup"
                                ? nameOfPickupPoint
                                : nameOfDropPoint,
                        location_city:
                            radioSelection === "Pickup"
                                ? city.ref_dspl
                                : dropCity.ref_dspl,
                        address1:
                            radioSelection === "Pickup"
                                ? address1
                                : dropAddress1,
                        address2:
                            radioSelection === "Pickup"
                                ? address2
                                : dropAddress2,
                        area: radioSelection === "Pickup" ? area : dropArea,
                        city:
                            radioSelection === "Pickup"
                                ? city.ref_dspl
                                : dropCity.ref_dspl,
                        pin: radioSelection === "Pickup" ? pin : dropPin,
                        state: radioSelection === "Pickup" ? state : dropState,
                        location_created_by: user.id,
                    },
                ]);
            if (locationError) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while saving Location data, Please try again later or contact tech support",
                });
            } else {
                // saving location contact data
                const {
                    data: locationContactData,
                    error: locationContactError,
                } = await supabase.from("location_contact").insert([
                    {
                        // location contact details
                        location_number: locationNumber,
                        contact_type:
                            radioSelection === "Pickup"
                                ? contactType.ref_dspl
                                : dropContactType.ref_dspl,
                        contact_name:
                            radioSelection === "Pickup"
                                ? contactName
                                : dropContactName,
                        contact_phone:
                            radioSelection === "Pickup"
                                ? contactPhone
                                : dropContactPhone,
                        contact_email:
                            radioSelection === "Pickup"
                                ? contactEmail
                                : dropContactEmail,
                        location_contact_created_by: user.id,
                    },
                ]);
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
                        detail:
                            "New " +
                            radioSelection +
                            " location saved successfully",
                    });

                    // increment lr_number key
                    await supabase.rpc("increment_sys_key", {
                        x: 1,
                        keyname: "location_number",
                    });
                    resetForm();
                }
            }
        } catch (err) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while saving Location details, Please try again later or contact tech support",
            });
        }
    };

    const saveChanges = () => {
        setLoading(true);

        if (validateForm()) {
            try {
                addNewLocation().then(() => {
                    setAddLocationDialogVisible(false);
                    setLoading(false);
                    setRefreshLocationData(true);
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
                label="Add Location"
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
                header={"Add New Location"}
                visible={addLocationDialogVisible}
                style={{
                    width: "80vw",
                    height: "70vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!addLocationDialogVisible) return;
                    setAddLocationDialogVisible(false);
                    setLocationFormErrorData(
                        JSON.parse(JSON.stringify(addLocationErrorFields))
                    );
                    setSelectedLocationType("");
                }}
                footer={footerContent}
                maximizable
            >
                <div className="grid p-fluid mt-1">
                    <div className="col-12">
                        <div className="card">
                            <h5>Location Type</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="flex field col-12 lg:col-3 md:col-6">
                                    <RadioButton
                                        inputId="pickupLocationSelection"
                                        name="location-type"
                                        value="Pickup"
                                        onChange={(e) => {
                                            setRadioSelection(e.target.value);
                                        }}
                                        checked={radioSelection === "Pickup"}
                                    />
                                    <label
                                        htmlFor="pickupLocationSelection"
                                        className="ml-2"
                                    >
                                        Pickup
                                    </label>
                                </div>
                                <div className="flex field col-12 lg:col-6 md:col-6">
                                    <RadioButton
                                        inputId="dropLocationSelection"
                                        name="location-type"
                                        value="Drop"
                                        onChange={(e) => {
                                            setRadioSelection(e.target.value);
                                        }}
                                        checked={radioSelection === "Drop"}
                                    />
                                    <label
                                        htmlFor="dropLocationSelection"
                                        className="ml-2"
                                    >
                                        Drop
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {radioSelection && radioSelection === "Pickup" ? (
                        <>
                            <div className="col-12">
                                <div className="card">
                                    <h5>Location Details</h5>
                                    <div className="p-fluid formgrid grid">
                                        <div className="field col-12 lg:col-12 md:col-6">
                                            <label htmlFor="nameOfPickupPoint1">
                                                Name of Pickup Point*
                                            </label>
                                            <InputText
                                                id="nameOfPickupPoint1"
                                                value={nameOfPickupPoint}
                                                placeholder="Enter name of pickup point"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            nameOfPickupPoint:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {nameOfPickupPointError ? (
                                                <Message
                                                    severity="error"
                                                    text={
                                                        nameOfPickupPointError
                                                    }
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="pickupAddress1">
                                                Address 1*
                                            </label>
                                            <InputText
                                                id="pickupAddress1"
                                                value={address1}
                                                placeholder="Enter address 1"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            address1:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {address1Error ? (
                                                <Message
                                                    severity="error"
                                                    text={address1Error}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="pickupAddress2">
                                                Address 2
                                            </label>
                                            <InputText
                                                id="pickupAddress2"
                                                value={address2}
                                                placeholder="Enter address 2"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            address2:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="pickupArea">
                                                Area*
                                            </label>
                                            <InputText
                                                id="pickupArea"
                                                value={area}
                                                placeholder="Enter area"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            area: e.target
                                                                .value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {areaError ? (
                                                <Message
                                                    severity="error"
                                                    text={areaError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="pickupCity">
                                                City*
                                            </label>
                                            <Dropdown
                                                id="pickupCity"
                                                options={cityRefs}
                                                optionLabel="ref_dspl"
                                                placeholder="Select a city"
                                                filter
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            city: e.target
                                                                .value,
                                                        })
                                                    );
                                                }}
                                                value={city}
                                            />
                                            {cityError ? (
                                                <Message
                                                    severity="error"
                                                    text={cityError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="pickupState">
                                                State*
                                            </label>
                                            <InputText
                                                id="pickupState"
                                                value={state}
                                                placeholder="Enter state"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            state: e.target
                                                                .value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {stateError ? (
                                                <Message
                                                    severity="error"
                                                    text={stateError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="pickupPin">
                                                PIN*
                                            </label>
                                            <InputNumber
                                                id="pickupPin"
                                                value={pin}
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            pin: e.value,
                                                        })
                                                    );
                                                }}
                                                useGrouping={false}
                                            />
                                            {pinError ? (
                                                <Message
                                                    severity="error"
                                                    text={pinError}
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
                                    <h5>Location Contact Details</h5>
                                    <div className="p-fluid formgrid grid">
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="pickupContactType">
                                                Contact Type*
                                            </label>
                                            <Dropdown
                                                id="pickupContactType"
                                                options={
                                                    loactionContactTypeRefs
                                                }
                                                optionLabel="ref_dspl"
                                                placeholder="Select a contact type"
                                                filter
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            contactType:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                                value={contactType}
                                            />
                                            {contactTypeError ? (
                                                <Message
                                                    severity="error"
                                                    text={contactTypeError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="pickupContactName">
                                                Contact Name*
                                            </label>
                                            <InputText
                                                id="pickupContactName"
                                                value={contactName}
                                                placeholder="Enter contact name"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            contactName:
                                                                e.target.value,
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
                                            <label htmlFor="pickupContactPhone">
                                                Phone Number*
                                            </label>
                                            <InputNumber
                                                id="pickupContactPhone"
                                                value={contactPhone}
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            contactPhone:
                                                                e.value,
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
                                                    setLocationFormData(
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
                        </>
                    ) : (
                        <>
                            <div className="col-12">
                                <div className="card">
                                    <h5>Location Details</h5>
                                    <div className="p-fluid formgrid grid">
                                        <div className="field col-12 lg:col-12 md:col-6">
                                            <label htmlFor="nameOfDropPoint1">
                                                Name of Drop Point*
                                            </label>
                                            <InputText
                                                id="nameOfDropPoint1"
                                                value={nameOfDropPoint}
                                                placeholder="Enter name of drop point"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            nameOfDropPoint:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {nameOfDropPointError ? (
                                                <Message
                                                    severity="error"
                                                    text={nameOfDropPointError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropAddress1">
                                                Address 1*
                                            </label>
                                            <InputText
                                                id="dropAddress1"
                                                value={dropAddress1}
                                                placeholder="Enter address 1"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropAddress1:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {dropAddress1Error ? (
                                                <Message
                                                    severity="error"
                                                    text={dropAddress1Error}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropAddress2">
                                                Address 2
                                            </label>
                                            <InputText
                                                id="dropAddress2"
                                                value={dropAddress2}
                                                placeholder="Enter address 2"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropAddress2:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropArea">
                                                Area*
                                            </label>
                                            <InputText
                                                id="dropArea"
                                                value={dropArea}
                                                placeholder="Enter area"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropArea:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {dropAreaError ? (
                                                <Message
                                                    severity="error"
                                                    text={dropAreaError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropCity">
                                                City*
                                            </label>
                                            <Dropdown
                                                id="dropCity"
                                                options={cityRefs}
                                                optionLabel="ref_dspl"
                                                placeholder="Select a city"
                                                filter
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropCity:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                                value={dropCity}
                                            />
                                            {dropCityError ? (
                                                <Message
                                                    severity="error"
                                                    text={dropCityError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropState">
                                                State*
                                            </label>
                                            <InputText
                                                id="dropState"
                                                value={dropState}
                                                placeholder="Enter state"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropState:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {dropStateError ? (
                                                <Message
                                                    severity="error"
                                                    text={dropStateError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropPin">
                                                PIN*
                                            </label>
                                            <InputNumber
                                                value={dropPin}
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropPin: e.value,
                                                        })
                                                    );
                                                }}
                                                useGrouping={false}
                                            />
                                            {dropPinError ? (
                                                <Message
                                                    severity="error"
                                                    text={dropPinError}
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
                                    <h5>Location Contact Details</h5>
                                    <div className="p-fluid formgrid grid">
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropContactType">
                                                Contact Type*
                                            </label>
                                            <Dropdown
                                                id="dropContactType"
                                                options={
                                                    loactionContactTypeRefs
                                                }
                                                optionLabel="ref_dspl"
                                                placeholder="Select a contact type"
                                                filter
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropContactType:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                                value={dropContactType}
                                            />
                                            {dropContactTypeError ? (
                                                <Message
                                                    severity="error"
                                                    text={dropContactTypeError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropContactName">
                                                Contact Name*
                                            </label>
                                            <InputText
                                                id="dropContactName"
                                                value={dropContactName}
                                                placeholder="Enter contact name"
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropContactName:
                                                                e.target.value,
                                                        })
                                                    );
                                                }}
                                            />
                                            {dropContactNameError ? (
                                                <Message
                                                    severity="error"
                                                    text={dropContactNameError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropContactPhone">
                                                Phone Number*
                                            </label>
                                            <InputNumber
                                                id="dropContactPhone"
                                                value={dropContactPhone}
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropContactPhone:
                                                                e.value,
                                                        })
                                                    );
                                                }}
                                                prefix="+91 "
                                                useGrouping={false}
                                            />
                                            {dropContactPhoneError ? (
                                                <Message
                                                    severity="error"
                                                    text={dropContactPhoneError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="dropContactEmail">
                                                Email Address
                                            </label>
                                            <InputText
                                                id="dropContactEmail"
                                                value={dropContactEmail}
                                                onChange={(e) => {
                                                    setLocationFormData(
                                                        (previousState) => ({
                                                            ...previousState,
                                                            dropContactEmail:
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
                        </>
                    )}
                </div>
            </Dialog>
        </>
    );
}
