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
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import AddLocationContactDialog from "../dialogs/AddLocationContactDialog";
import EditLocationContactDialog from "./EditLocationContactDialog";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";

export default function EditLocationDialog({
    editLocationDialogVisible,
    setEditLocationDialogVisible,
    references,
    user,
    setRefreshLocationData,
    selectedLocation,
}) {
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const [loading1, setLoading1] = useState(false);

    const [filters1, setFilters1] = useState(null);
    const [globalFilterValue1, setGlobalFilterValue1] = useState("");

    const [radioSelection, setRadioSelection] = useState("");

    // all dialog states
    const [
        addLocationContactDialogVisible,
        setAddLocationContactDialogVisible,
    ] = useState(false);
    const [refreshLocationContactData, setRefreshLocationContactData] =
        useState(false);
    const [selectedContactType, setSelectedContactType] = useState("");
    const [locationNumber, setLocationNumber] = useState("");
    const [fetchedLocationContacts, setFetchedLocationContacts] = useState([]);

    const [
        editLocationContactDialogVisible,
        setEditLocationContactDialogVisible,
    ] = useState(false);
    const [selectedLocationContact, setSelectedLocationContact] = useState([]);

    // form states
    // initialize form field
    const editLocationFields = {
        nameOfPickupPoint: "",
        address1: "",
        address2: "",
        area: "",
        city: "",
        pin: null,
        state: "",
    };
    const [locationFormData, setLocationFormData] = useState(
        JSON.parse(JSON.stringify(editLocationFields))
    );
    const {
        // pick up details
        nameOfPickupPoint,
        address1,
        address2,
        area,
        city,
        pin,
        state,
    } = useMemo(() => locationFormData, [locationFormData]);

    // initialize form error fields
    const editLocationErrorFields = {
        nameOfPickupPointError: "",
        address1Error: "",
        areaError: "",
        cityError: "",
        pinError: "",
        stateError: "",
    };
    const [locationFormErrorData, setLocationFormErrorData] = useState(
        JSON.parse(JSON.stringify(editLocationErrorFields))
    );
    const {
        // pick up details
        nameOfPickupPointError,
        address1Error,
        areaError,
        cityError,
        pinError,
        stateError,
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

    async function fetchLocationContact() {
        setLoading1(true);

        const { data, error } = await supabase
            .from("location_contact")
            .select("*")
            .eq("location_number", selectedLocation.location_number)
            .order("location_contact_created_at", {
                ascending: false,
                nullsFirst: false,
            });

        if (data) {
            setFetchedLocationContacts(data);
            setLoading1(false);
            setRefreshLocationContactData(false);
        } else {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while loading Location Contact Data. Please try again later or contact tech support.",
            });
            setLoading1(false);
            setRefreshLocationContactData(false);
        }
    }

    useEffect(() => {
        if (refreshLocationContactData) fetchLocationContact();
    }, [refreshLocationContactData]);

    const onGlobalFilterChange1 = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters1 };
        _filters1["global"].value = value;

        setFilters1(_filters1);
        setGlobalFilterValue1(value);
    };

    const initFilters1 = () => {
        setFilters1({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });
        setGlobalFilterValue1("");
    };

    // set pre loaded values
    useEffect(() => {
        initFilters1();
        if (selectedLocation) {
            fetchLocationContact();
            setRadioSelection(selectedLocation.location_type);
            setLocationFormData((previousState) => ({
                ...previousState,
                nameOfPickupPoint: selectedLocation.name_of_pickup_point,
                address1: selectedLocation.address1,
                address2: selectedLocation.address2,
                area: selectedLocation.area,
                city: references.filter(
                    (i) =>
                        i.ref_nm === "city" &&
                        i.ref_dspl === selectedLocation.city
                )[0],
                pin: selectedLocation.pin,
                state: selectedLocation.state,
            }));
            setLocationNumber(selectedLocation.location_number);
        }
    }, [selectedLocation]);

    const validateForm = () => {
        let isValid = true;

        if (!nameOfPickupPoint) {
            setLocationFormErrorData((previousState) => ({
                ...previousState,
                nameOfPickupPointError: "Name of pick up point is required.",
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
        setLocationFormData(JSON.parse(JSON.stringify(editLocationFields)));
        setLocationFormErrorData(
            JSON.parse(JSON.stringify(editLocationErrorFields))
        );
    };

    const saveEditedChanges = async () => {
        try {
            // saving data
            const { data: locationData, error: locationError } = await supabase
                .from("location")
                .update({
                    location_type: radioSelection,
                    name_of_pickup_point: nameOfPickupPoint,
                    location_city: city.ref_dspl,
                    address1: address1,
                    address2: address2,
                    area: area,
                    city: city.ref_dspl,
                    pin: pin,
                    state: state,
                    location_updated_by: user.id,
                })
                .eq("location_id", selectedLocation.location_id);

            if (locationError) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while saving Location data, Please try again later or contact tech support",
                });
            } else {
                // open toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Location data saved successfully",
                });

                resetForm();
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
                saveEditedChanges().then(() => {
                    setEditLocationDialogVisible(false);
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

    const renderHeader1 = () => {
        return (
            <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-4">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilterValue1}
                            onChange={onGlobalFilterChange1}
                            placeholder="Keyword Search"
                        />
                    </span>
                </div>
                <div className="field col-12 lg:col-2">
                    <Button
                        type="button"
                        icon="pi pi-file-excel"
                        severity="success"
                        raised
                        // onClick={exportExcel}
                        label="Export to Excel"
                        className="mr-3"
                        placeholder="Top"
                        tooltip="Export to Excel"
                        tooltipOptions={{ position: "top" }}
                    />
                </div>
                <div className="field col-12 lg:col-3">
                    <Button
                        type="button"
                        icon="pi pi-plus"
                        label="Add Marketing Contact"
                        outlined
                        onClick={() => {
                            setAddLocationContactDialogVisible(true);
                            setSelectedContactType("Marketing");
                            setLocationNumber(selectedLocation.location_number);
                        }}
                    />
                </div>
                <div className="field col-12 lg:col-3">
                    <Button
                        type="button"
                        icon="pi pi-plus"
                        label="Add Dispatch Contact"
                        outlined
                        onClick={() => {
                            setAddLocationContactDialogVisible(true);
                            setSelectedContactType("Dispatch");
                            setLocationNumber(selectedLocation.location_number);
                        }}
                    />
                </div>
            </div>
        );
    };
    const header1 = renderHeader1();

    const handleAccept = async (rowData) => {
        try {
            const { error } = await supabase
                .from("location_contact")
                .delete()
                .eq("location_contact_id", rowData.location_contact_id);

            if (error) {
                // open toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error while deleting location contact, Please try again later or contact tech support",
                    life: 5000,
                });
            } else {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Location contact deleted successfully",
                    life: 5000,
                });

                setRefreshLocationContactData(true);
            }
        } catch (e) {
            // open toast
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error while deleting location contact, Please try again later or contact tech support",
                life: 5000,
            });
        }
    };
    const deletePopup = (event, rowData) => {
        confirmPopup({
            target: event.currentTarget,
            message: "Do you want to delete this record?",
            icon: "pi pi-info-circle",
            defaultFocus: "reject",
            acceptClassName: "p-button-danger",
            accept: () => {
                handleAccept(rowData);
            },
        });
    };

    // all render blocks
    const actionButtonRender1 = (rowData) => {
        return (
            <div>
                <Button
                    className="action-badge"
                    rounded
                    outlined
                    icon="pi pi-pen-to-square"
                    style={{ height: "2rem", width: "2rem" }}
                    onClick={() => {
                        setEditLocationContactDialogVisible(true);
                        setSelectedLocationContact(rowData);
                    }}
                ></Button>
                <Button
                    className="action-badge ml-2"
                    rounded
                    outlined
                    icon="pi pi-trash"
                    severity="danger"
                    style={{ height: "2rem", width: "2rem" }}
                    onClick={(event) => {
                        deletePopup(event, rowData);
                    }}
                ></Button>
            </div>
        );
    };
    const createdUpdatedDateRender = (rowData) => {
        return (
            <>
                <span className="text-xs">
                    {new Date(
                        rowData.location_contact_created_at
                    ).toLocaleString("en-IN")}
                </span>{" "}
                <br />
                <span className="text-xs">
                    {rowData.location_contact_updated_at
                        ? new Date(
                              rowData.location_contact_updated_at
                          ).toLocaleString("en-IN")
                        : ""}
                </span>
            </>
        );
    };

    return (
        <>
            <Toast ref={toast} appendTo={null} />
            <ConfirmPopup />

            <Dialog
                header={"Edit Location"}
                visible={editLocationDialogVisible}
                style={{
                    width: "80vw",
                    height: "80vh",
                    backgroundColor: "#eee",
                }}
                onHide={() => {
                    if (!editLocationDialogVisible) return;
                    setEditLocationDialogVisible(false);
                    setLocationFormErrorData(
                        JSON.parse(JSON.stringify(editLocationErrorFields))
                    );
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

                    <div className="col-12">
                        <div className="card">
                            <h5>Location Details</h5>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 lg:col-12 md:col-6">
                                    <label htmlFor="nameOfPickupPoint1">
                                        {radioSelection === "Pickup" ? (
                                            <>Name of Pickup Point*</>
                                        ) : (
                                            <>Name of Drop Point* </>
                                        )}
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
                                            text={nameOfPickupPointError}
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
                                                    address1: e.target.value,
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
                                                    address2: e.target.value,
                                                })
                                            );
                                        }}
                                    />
                                </div>
                                <div className="field col-12 lg:col-6 md:col-6">
                                    <label htmlFor="pickupArea">Area*</label>
                                    <InputText
                                        id="pickupArea"
                                        value={area}
                                        placeholder="Enter area"
                                        onChange={(e) => {
                                            setLocationFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    area: e.target.value,
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
                                    <label htmlFor="pickupCity">City*</label>
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
                                                    city: e.target.value,
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
                                    <label htmlFor="pickupState">State*</label>
                                    <InputText
                                        id="pickupState"
                                        value={state}
                                        placeholder="Enter state"
                                        onChange={(e) => {
                                            setLocationFormData(
                                                (previousState) => ({
                                                    ...previousState,
                                                    state: e.target.value,
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
                                    <label htmlFor="pickupPin">PIN*</label>
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

                            <DataTable
                                value={fetchedLocationContacts}
                                header={header1}
                                filters={filters1}
                                loading={loading1}
                                rows={5}
                                size="small"
                                paginator
                                dataKey="location_contact_id"
                                showGridlines
                                stripedRows
                                rowHover
                                emptyMessage="No location contacts found"
                                responsiveLayout="scroll"
                                removableSort
                            >
                                <Column
                                    field="order_key_id"
                                    header="Action"
                                    body={actionButtonRender1}
                                    align="center"
                                    style={{ minWidth: "6rem" }}
                                />
                                {user.role === "SUPER_ADMIN" ? (
                                    <Column
                                        field="location_created_updated_by_name"
                                        header="Created/Updated By"
                                        // body={orderCreatedInfoRender}
                                        sortable
                                    />
                                ) : (
                                    ""
                                )}
                                <Column
                                    field="order_created_at"
                                    header="Created/Updated On"
                                    body={createdUpdatedDateRender}
                                    sortable
                                />
                                <Column
                                    field="contact_type"
                                    header="Type"
                                    // body={orderPickupDateInfoRender}
                                    sortable
                                />
                                <Column
                                    field="contact_name"
                                    header="Name"
                                    // body={orderPickupDateInfoRender}
                                    sortable
                                />
                                <Column
                                    field="contact_phone"
                                    header="Phone"
                                    // body={orderPickupDateInfoRender}
                                    sortable
                                />
                                <Column
                                    field="contact_email"
                                    header="Email"
                                    // body={orderPickupDateInfoRender}
                                    sortable
                                />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </Dialog>

            <AddLocationContactDialog
                addLocationContactDialogVisible={
                    addLocationContactDialogVisible
                }
                setAddLocationContactDialogVisible={
                    setAddLocationContactDialogVisible
                }
                references={references}
                user={user}
                setRefreshLocationContactData={setRefreshLocationContactData}
                selectedContactType={selectedContactType}
                setSelectedContactType={setSelectedContactType}
                locationNumber={locationNumber}
            />

            <EditLocationContactDialog
                editLocationContactDialogVisible={
                    editLocationContactDialogVisible
                }
                setEditLocationContactDialogVisible={
                    setEditLocationContactDialogVisible
                }
                user={user}
                setRefreshLocationContactData={setRefreshLocationContactData}
                selectedLocationContact={selectedLocationContact}
            />
        </>
    );
}
