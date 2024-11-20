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
import AddLocationDialog from "./AddLocationDialog";
import AddLocationContactDialog from "./AddLocationContactDialog";
import AddClientDialog from "./AddClientDialog";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import ViewLR from "../ViewLR/ViewLR";
import Spinner from "../spinner";

export default function LrDialog({
  lrDetailsDialogVisible,
  setLrDetailsDialogVisible,
  references,
  user,
  setRefreshData,
  fetchedOrderData,
  fetchedLRData,
  fetchedClientData,
  fetchedPickupLocationData,
  fetchedPickupLocationMarketingData,
  fetchedpickupLocationDispatchData,
  fetchedDropLocationData,
  fetchedDropLocationMarketingData,
  fetchedDropLocationDispatchData,
  fetchedConsignorClientsData,
  fetchedConsigneeClientsData,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // all dialog states
  const [addClientDialogVisible, setAddClientDialogVisible] = useState(false);
  const [refreshClientData, setRefreshClientData] = useState(false);
  const [addLocationDialogVisible, setAddLocationDialogVisible] =
    useState(false);
  const [refreshLocationData, setRefreshLocationData] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState("");
  const [addLocationContactDialogVisible, setAddLocationContactDialogVisible] =
    useState(false);
  const [refreshLocationContactData, setRefreshLocationContactData] =
    useState(false);
  const [selectedContactType, setSelectedContactType] = useState("");
  const [locationNumber, setLocationNumber] = useState("");

  // form states
  // initialize form field

  // pickup details states
  const [pickupPointData, setPickupPointData] = useState(null);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(null);
  const [pickupMarketingContactsData, setPickupMarketingContactsData] =
    useState(null);
  const [pickupDispatchContactsData, setPickupDispatchContactsData] =
    useState(null);
  const [
    selectedPickupMarketingContactsData,
    setSelectedPickupMarketingContactsData,
  ] = useState(null);
  const [
    selectedPickupDispatchContactsData,
    setSelectedPickupDispatchContactsData,
  ] = useState(null);

  // drop details states
  const [dropPointData, setDropPointData] = useState(null);
  const [selectedDropPoint, setSelectedDropPoint] = useState(null);
  const [dropMarketingContactsData, setDropMarketingContactsData] =
    useState(null);
  const [dropDispatchContactsData, setDropDispatchContactsData] =
    useState(null);
  const [
    selectedDropMarketingContactsData,
    setSelectedDropMarketingContactsData,
  ] = useState(null);
  const [
    selectedDropDispatchContactsData,
    setSelectedDropDispatchContactsData,
  ] = useState(null);

  // consignor details states
  const [selectedConsignor, setSelectedConsignor] = useState(null);
  const [consignorData, setConsignorData] = useState(null);

  // consignee details states
  const [selectedConsignee, setSelectedConsignee] = useState(null);
  const [consigneeData, setConsigneeData] = useState(null);

  const addLrDetailsFields = {
    pickupLocation: null,
    dropLocation: null,
    consignorCity: null,
    consigneeCity: null,
    transportVehicleType: null,
    transportVehicleDetail: "",
    lrStatus: null,
    vehicleNumber: "",
    driverDetails: "",
  };
  const [lrDetailsData, setLrDetailsData] = useState(
    JSON.parse(JSON.stringify(addLrDetailsFields))
  );
  const {
    pickupLocation,
    dropLocation,
    consignorCity,
    consigneeCity,
    transportVehicleType,
    transportVehicleDetail,
    lrStatus,
    vehicleNumber,
    driverDetails,
  } = useMemo(() => lrDetailsData, [lrDetailsData]);

  // initialize form error fields
  const lrErrorFields = {
    pickupLocationError: "",
    dropLocationError: "",
    consignorCityError: "",
    consigneeCityError: "",
    selectedPickupPointError: "",
    selectedDropPointError: "",
    selectedConsignorError: "",
    selectedConsigneeError: "",
  };
  const [lrFormErrorData, setLrFormErrorData] = useState(
    JSON.parse(JSON.stringify(lrErrorFields))
  );
  const {
    pickupLocationError,
    dropLocationError,
    consignorCityError,
    consigneeCityError,
    selectedPickupPointError,
    selectedDropPointError,
    selectedConsignorError,
    selectedConsigneeError,
  } = useMemo(() => lrFormErrorData, [lrFormErrorData]);

  // all refs
  const [cityRefs, setCityRefs] = useState(null);
  const [transportVehicleTypeRefs, setTransportVehicleTypeRefs] =
    useState(null);
  const [lRStatusReferenceOptions, setLRStatusReferenceOptions] =
    useState(null);

  async function getReferences() {
    setCityRefs(references.filter((i) => i.ref_nm === "city"));
    setTransportVehicleTypeRefs(
      references.filter((i) => i.ref_nm === "transportVehicleType")
    );
    setLRStatusReferenceOptions(
      references.filter((i) => i.ref_nm === "lrStatus")
    );
  }

  useEffect(() => {
    if (references.length !== 0) getReferences();
  }, [references]);

  const [getClientData, setGetClientData] = useState([]);
  const [getLocationsData, setGetLocationsData] = useState([]);
  const [getLocationsContactData, setGetLocationsContactData] = useState([]);

  async function getClients() {
    // fetch client data
    try {
      let { data: clientData, error } = await supabase
        .from("client")
        .select("*");

      if (clientData) {
        setGetClientData(clientData);

        if (refreshClientData) {
          setRefreshClientData(false);
        }
      }
    } catch (e) {}
  }
  async function getLocations() {
    try {
      let { data: locationData, error } = await supabase
        .from("location")
        .select("*");

      if (locationData) {
        setGetLocationsData(locationData);

        if (refreshLocationData) {
          setRefreshLocationData(false);
          setSelectedLocationType("");
        }
      }
    } catch (e) {}
  }
  async function getLocationsContacts() {
    try {
      let { data: locationContactData, error } = await supabase
        .from("location_contact")
        .select("*");

      if (locationContactData) {
        setGetLocationsContactData(locationContactData);

        if (refreshLocationContactData) {
          setRefreshLocationContactData(false);
          setSelectedContactType("");
          setLocationNumber("");
        }
      }
    } catch (e) {}
  }
  useEffect(() => {
    if (lrDetailsDialogVisible) {
      if (getClientData.length === 0) getClients();
      if (getLocationsData.length === 0) getLocations();
      if (getLocationsContactData.length === 0) getLocationsContacts();
    }
  }, [lrDetailsDialogVisible]);

  useEffect(() => {
    if (refreshClientData) {
      getClients();
    }
  }, [refreshClientData]);
  useEffect(() => {
    if (refreshLocationData) {
      getLocations();
      getLocationsContacts();
    }
  }, [refreshLocationData]);
  useEffect(() => {
    if (refreshLocationContactData) {
      getLocationsContacts();
    }
  }, [refreshLocationContactData]);

  // set pre loaded values
  useEffect(() => {
    if (lrDetailsDialogVisible) {
      setLrDetailsData((previousState) => ({
        ...previousState,
        pickupLocation: references.filter(
          (i) =>
            i.ref_nm === "city" &&
            i.ref_dspl === fetchedOrderData.pickup_location
        )[0],
        dropLocation: references.filter(
          (i) =>
            i.ref_nm === "city" && i.ref_dspl === fetchedOrderData.drop_location
        )[0],
        consignorCity: fetchedConsignorClientsData
          ? references.filter(
              (i) =>
                i.ref_nm === "city" &&
                i.ref_dspl === fetchedConsignorClientsData.city
            )[0]
          : null,
        consigneeCity: fetchedConsigneeClientsData
          ? references.filter(
              (i) =>
                i.ref_nm === "city" &&
                i.ref_dspl === fetchedConsigneeClientsData.city
            )[0]
          : null,
        transportVehicleType: references.filter(
          (i) =>
            i.ref_nm === "transportVehicleType" &&
            i.ref_dspl === fetchedLRData.transport_vehicle_type
        )[0],
        transportVehicleDetail: fetchedLRData.transport_vehicle_details,
        lrStatus: references.filter(
          (i) => i.ref_nm === "lrStatus" && i.ref_dspl === fetchedLRData.status
        )[0],
        vehicleNumber: fetchedLRData.vehical_number,
        driverDetails: fetchedLRData.driver_details,
      }));

      // set pick up details states
      setSelectedPickupPoint(fetchedPickupLocationData);
      if (fetchedPickupLocationMarketingData) {
        setSelectedPickupMarketingContactsData({
          pickupMarketingContactName:
            fetchedPickupLocationMarketingData.contact_name +
            "-" +
            fetchedPickupLocationMarketingData.contact_phone,
          pickupMarketingContactId:
            fetchedPickupLocationMarketingData.location_contact_id,
        });
      }
      if (fetchedpickupLocationDispatchData) {
        setSelectedPickupDispatchContactsData({
          pickupDispatchContactName:
            fetchedpickupLocationDispatchData.contact_name +
            "-" +
            fetchedpickupLocationDispatchData.contact_phone,
          pickupDispatchContactId:
            fetchedpickupLocationDispatchData.location_contact_id,
        });
      }
      // set drop details states
      setSelectedDropPoint(fetchedDropLocationData);
      if (fetchedDropLocationMarketingData) {
        setSelectedDropMarketingContactsData({
          dropMarketingContactName:
            fetchedDropLocationMarketingData.contact_name +
            "-" +
            fetchedDropLocationMarketingData.contact_phone,
          dropMarketingContactId:
            fetchedDropLocationMarketingData.location_contact_id,
        });
      }
      if (fetchedDropLocationDispatchData) {
        setSelectedDropDispatchContactsData({
          dropDispatchContactName:
            fetchedDropLocationDispatchData.contact_name +
            "-" +
            fetchedDropLocationDispatchData.contact_phone,
          dropDispatchContactId:
            fetchedDropLocationDispatchData.location_contact_id,
        });
      }
      // set consignor details states
      setSelectedConsignor(fetchedConsignorClientsData);
      // set consignee details states
      setSelectedConsignee(fetchedConsigneeClientsData);
    }
  }, [lrDetailsDialogVisible]);

  // get Name of pick up point block
  async function getPickupPointDetails() {
    if (getLocationsData.length > 0 && pickupLocation) {
      let filteredPickupPointData = [];

      filteredPickupPointData = getLocationsData.filter(
        (i) =>
          i.city === pickupLocation.ref_dspl && i.location_type === "Pickup"
      );
      setPickupPointData(filteredPickupPointData);
    }
  }
  useEffect(() => {
    getPickupPointDetails();
  }, [pickupLocation, getLocationsData]);
  // get pick up contacts block
  async function getPickupPointContactData() {
    if (selectedPickupPoint && getLocationsContactData.length > 0) {
      // filterting marketing contact details
      let filteredLocationsContactsData = [];

      filteredLocationsContactsData = getLocationsContactData.filter(
        (i) => i.location_number === selectedPickupPoint.location_number
      );

      const allPickupMarketingContactNames = [];
      const allPickupDispatchContactNames = [];
      for (let i = 0; i < filteredLocationsContactsData.length; i++) {
        if (filteredLocationsContactsData[i].contact_type === "Marketing") {
          allPickupMarketingContactNames.push({
            pickupMarketingContactName:
              filteredLocationsContactsData[i].contact_name +
              "-" +
              filteredLocationsContactsData[i].contact_phone,
            pickupMarketingContactId:
              filteredLocationsContactsData[i].location_contact_id,
          });
        } else {
          allPickupDispatchContactNames.push({
            pickupDispatchContactName:
              filteredLocationsContactsData[i].contact_name +
              "-" +
              filteredLocationsContactsData[i].contact_phone,
            pickupDispatchContactId:
              filteredLocationsContactsData[i].location_contact_id,
          });
        }
      }

      allPickupMarketingContactNames.sort();
      allPickupDispatchContactNames.sort();
      setPickupMarketingContactsData(allPickupMarketingContactNames);
      setPickupDispatchContactsData(allPickupDispatchContactNames);
    }
  }
  useEffect(() => {
    getPickupPointContactData();
  }, [selectedPickupPoint, getLocationsContactData]);

  // get Name of drop point block
  async function getDropPointDetails() {
    if (getLocationsData.length > 0 && dropLocation) {
      let filteredDropPointData = [];

      filteredDropPointData = getLocationsData.filter(
        (i) => i.city === dropLocation.ref_dspl && i.location_type === "Drop"
      );
      setDropPointData(filteredDropPointData);
    }
  }
  useEffect(() => {
    getDropPointDetails();
  }, [dropLocation, getLocationsData]);
  // get drop contacts block
  async function getDropPointContactData() {
    if (selectedDropPoint && getLocationsContactData.length > 0) {
      // filterting marketing contact details
      let filteredDropLocationsContactsData = [];

      filteredDropLocationsContactsData = getLocationsContactData.filter(
        (i) => i.location_number === selectedDropPoint.location_number
      );

      const allDropMarketingContactNames = [];
      const allDropDispatchContactNames = [];
      for (let i = 0; i < filteredDropLocationsContactsData.length; i++) {
        if (filteredDropLocationsContactsData[i].contact_type === "Marketing") {
          allDropMarketingContactNames.push({
            dropMarketingContactName:
              filteredDropLocationsContactsData[i].contact_name +
              "-" +
              filteredDropLocationsContactsData[i].contact_phone,
            dropMarketingContactId:
              filteredDropLocationsContactsData[i].location_contact_id,
          });
        } else {
          allDropDispatchContactNames.push({
            dropDispatchContactName:
              filteredDropLocationsContactsData[i].contact_name +
              "-" +
              filteredDropLocationsContactsData[i].contact_phone,
            dropDispatchContactId:
              filteredDropLocationsContactsData[i].location_contact_id,
          });
        }
      }

      allDropMarketingContactNames.sort();
      allDropDispatchContactNames.sort();
      setDropMarketingContactsData(allDropMarketingContactNames);
      setDropDispatchContactsData(allDropDispatchContactNames);
    }
  }
  useEffect(() => {
    getDropPointContactData();
  }, [selectedDropPoint, getLocationsContactData]);

  // get consignor details block
  async function getConsignorDetails() {
    if (getLocationsData.length > 0 && consignorCity) {
      let filteredConsignorData = [];

      filteredConsignorData = getLocationsData.filter(
        (i) => i.city === consignorCity.ref_dspl
      );

      setConsignorData(filteredConsignorData);
    }
  }
  useEffect(() => {
    getConsignorDetails();
  }, [consignorCity, getLocationsData]);

  // get consignee details block
  async function getConsigneeDetails() {
    if (getClientData.length > 0 && consigneeCity) {
      let filteredConsigneeData = [];

      filteredConsigneeData = getClientData.filter(
        (i) => i.city === consigneeCity.ref_dspl
      );

      setConsigneeData(filteredConsigneeData);
    }
  }
  useEffect(() => {
    getConsigneeDetails();
  }, [consigneeCity, getClientData]);

  const validateForm = (data) => {
    let isValid = true;
    if (!pickupLocation) {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        pickupLocationError: "Pickup Location is required.",
      }));
      isValid = false;
    } else {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        pickupLocationError: "",
      }));
    }
    if (!dropLocation) {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        dropLocationError: "Drop Location is required.",
      }));
      isValid = false;
    } else {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        dropLocationError: "",
      }));
    }
    if (!consignorCity) {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        consignorCityError: "Consignor City is required.",
      }));
      isValid = false;
    } else {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        consignorCityError: "",
      }));
    }
    if (!consigneeCity) {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        consigneeCityError: "Consignee City is required.",
      }));
      isValid = false;
    } else {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        consigneeCityError: "",
      }));
    }

    if (!selectedPickupPoint) {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        selectedPickupPointError: "Name of pickup point is required.",
      }));
      isValid = false;
    } else {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        selectedPickupPointError: "",
      }));
    }
    if (!selectedDropPoint) {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        selectedDropPointError: "Name of drop point is required.",
      }));
      isValid = false;
    } else {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        selectedDropPointError: "",
      }));
    }
    if (!selectedConsignor) {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        selectedConsignorError: "Consignor Client Name is required.",
      }));
      isValid = false;
    } else {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        selectedConsignorError: "",
      }));
    }
    if (!selectedConsignee) {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        selectedConsigneeError: "Consignee Client Name is required.",
      }));
      isValid = false;
    } else {
      setLrFormErrorData((previousState) => ({
        ...previousState,
        selectedConsigneeError: "",
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
    // reset form fields
    setLrDetailsData(JSON.parse(JSON.stringify(addLrDetailsFields)));
    setLrFormErrorData(JSON.parse(JSON.stringify(lrErrorFields)));

    // reset pickup details states
    setPickupPointData(null);
    setSelectedPickupPoint(null);
    setPickupMarketingContactsData(null);
    setSelectedPickupMarketingContactsData(null);
    setPickupDispatchContactsData(null);
    setSelectedPickupDispatchContactsData(null);

    // reset drop details states
    setDropPointData(null);
    setSelectedDropPoint(null);
    setDropMarketingContactsData(null);
    setSelectedDropMarketingContactsData(null);
    setDropDispatchContactsData(null);
    setSelectedDropDispatchContactsData(null);

    // reset consignor details states
    setSelectedConsignor(null);
    setConsignorData(null);

    // reset consignee details states
    setSelectedConsignee(null);
    setConsigneeData(null);
  };

  const saveLrDetails = async () => {
    // Pickup and Drop Point, Consignor Client, Consignee Client are required fields
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          pickup_location: pickupLocation.ref_dspl,
          drop_location: dropLocation.ref_dspl,
          order_updated_at: new Date(),
        })
        .eq("order_id", fetchedLRData.order_id);

      const { data: updatedLRData, error: updatedLRError } = await supabase
        .from("lr")
        .update({
          // pick up location details
          pickup_location_id: selectedPickupPoint.location_id,
          pickup_marketing_contact_id: selectedPickupMarketingContactsData
            ? selectedPickupMarketingContactsData.pickupMarketingContactId
            : null,
          pickup_dispatch_contact_id: selectedPickupDispatchContactsData
            ? selectedPickupDispatchContactsData.pickupDispatchContactId
            : null,

          // drop location details
          drop_location_id: selectedDropPoint.location_id,
          drop_marketing_contact_id: selectedDropMarketingContactsData
            ? selectedDropMarketingContactsData.dropMarketingContactId
            : null,
          drop_dispatch_contact_id: selectedDropDispatchContactsData
            ? selectedDropDispatchContactsData.dropDispatchContactId
            : null,

          // consignor and consignee details
          consignor_client_id: selectedConsignor.location_id,
          consignee_client_id: selectedConsignee.client_id,

          // other details
          transport_vehicle_type: transportVehicleType
            ? transportVehicleType.ref_dspl
            : "",
          transport_vehicle_details: transportVehicleDetail
            ? transportVehicleDetail
            : "",
          status: lrStatus ? lrStatus.ref_dspl : "",
          vehical_number: vehicleNumber ? vehicleNumber : "",
          driver_details: driverDetails ? driverDetails : "",
          lr_last_modified_date: new Date(),
        })
        .eq("lr_id", fetchedLRData.lr_id);

      if (!updatedLRError) {
        // open toast
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "LR Changes updated successfully",
        });
      } else {
        // open toast
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            "Error while saving LR changes, Please try again later or contact tech support",
        });
      }
    } catch (err) {
      // open toast
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          "Error while saving LR Details changes, Please try again later or contact tech support",
      });
      // console.warn(err);
    }
  };

  const saveChanges = () => {
    setLoading(true);

    if (validateForm()) {
      try {
        saveLrDetails().then(() => {
          setLrDetailsDialogVisible(false);
          setLoading(false);
          setRefreshData(true);
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

  const pickupDropConsignorOptionTemplate = (option) => {
    return (
      <div className="w-30rem">
        <b>{option.name_of_pickup_point}</b> <br />
        <div
          className="px-1 text-color-secondary text-sm"
          style={{ whiteSpace: "normal" }}
        >
          {[
            option.address1,
            option.address2,
            option.area,
            option.city,
            option.state,
            option.pin,
          ]
            .filter(Boolean)
            .join(", ")}
        </div>
      </div>
    );
  };

  const consigneeOptionTemplate = (option) => {
    return (
      <div className="w-30rem">
        <b>{option.client_name}</b> <br />
        <div
          className="px-1 text-color-secondary text-sm"
          style={{ whiteSpace: "normal" }}
        >
          {[
            option.address1,
            option.address2,
            option.area,
            option.city,
            option.state,
            option.pin,
          ]
            .filter(Boolean)
            .join(", ")}
        </div>
      </div>
    );
  };

  async function savePDF() {
    setIsLoading(true);
    setLoadingText("LR PDF is being generated...");
    var element = document.getElementById("print-lr");
    element.classList.remove("hide-lr-block");
    var opt = {
      margin: 0,
      filename: fetchedLRData.lr_number + ".pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
    };

    window
      .html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        element.classList.add("hide-lr-block");
        setIsLoading(false);
        setLoadingText("");
      });
  }

  const renderHeader = (
    <>
      <div class="flex flex-wrap">
        <div class="surface-overlay">
          <span className="vertical-align-middle">LR Details of </span>
          <span className="vertical-align-middle">
            {fetchedLRData.lr_number}
          </span>{" "}
          <Button
            label="Print / Export to PDF"
            severity="success"
            icon="pi pi-print"
            loading={loading}
            onClick={() => savePDF()}
            size="small"
            className="vertical-align-middle"
          />
        </div>
      </div>
    </>
  );
  return (
    <>
      <Toast ref={toast} appendTo={null} />
      <Spinner isLoading={isLoading} loadingText={loadingText} />

      <Dialog
        header={renderHeader}
        visible={lrDetailsDialogVisible}
        style={{ width: "90vw", height: "80vh", backgroundColor: "#eee" }}
        onHide={() => {
          if (!lrDetailsDialogVisible) return;
          setLrDetailsDialogVisible(false);
          resetForm();
        }}
        footer={footerContent}
        maximizable
      >
        <div className="grid p-fluid mt-1">
          <div className="col-12">
            <div className="card">
              {/* <h5>Advanced</h5> */}
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Order #</span>
                    <InputText
                      value={
                        fetchedOrderData ? fetchedOrderData.order_number : ""
                      }
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Route</span>
                    <InputText
                      value={
                        fetchedOrderData
                          ? fetchedOrderData.pickup_location +
                            "-" +
                            fetchedOrderData.drop_location
                          : ""
                      }
                      disabled
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Client Name</span>
                    <InputText
                      value={
                        fetchedClientData ? fetchedClientData.client_name : ""
                      }
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-12 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Client Address</span>
                    <InputTextarea
                      rows={3}
                      value={
                        fetchedClientData
                          ? [
                              fetchedClientData.address1,
                              fetchedClientData.address2,
                              fetchedClientData.area,
                              fetchedClientData.city,
                              fetchedClientData.state,
                              fetchedClientData.pin,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : ""
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>Pickup Details</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-4 md:col-4">
                  <label>Pickup Location</label>
                  <Dropdown
                    showClear
                    value={pickupLocation}
                    onChange={(e) => {
                      setLrDetailsData((previousState) => ({
                        ...previousState,
                        pickupLocation: e.target.value,
                      }));
                      setSelectedPickupPoint(null);
                      setSelectedPickupMarketingContactsData(null);
                      setSelectedPickupDispatchContactsData(null);
                    }}
                    options={cityRefs}
                    optionLabel="ref_dspl"
                    placeholder="Select a city"
                    filter
                    //   valueTemplate={selectedCountryTemplate}
                    //   itemTemplate={countryOptionTemplate}
                  />
                  {pickupLocationError ? (
                    <Message severity="error" text={pickupLocationError} />
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-8 md:col-8">
                  <label>
                    Name of Pickup Point
                    {pickupLocation ? (
                      <Button
                        className="mx-2 action-badge add-dialog-action-badge"
                        icon="pi pi-plus"
                        style={{
                          marginTop: "-7px",
                          height: "1rem",
                          width: "2rem",
                        }}
                        onClick={() => {
                          setAddLocationDialogVisible(true);
                          setSelectedLocationType("Pickup");
                        }}
                      ></Button>
                    ) : (
                      ""
                    )}
                  </label>
                  <Dropdown
                    showClear
                    disabled={!pickupLocation}
                    value={selectedPickupPoint}
                    options={pickupPointData}
                    optionLabel="name_of_pickup_point"
                    placeholder="Select a pickup point"
                    filter
                    onChange={(e) => {
                      setSelectedPickupPoint(e.target.value);
                      setSelectedPickupMarketingContactsData(null);
                      setSelectedPickupDispatchContactsData(null);
                    }}
                    //   valueTemplate={selectedCountryTemplate}
                    itemTemplate={pickupDropConsignorOptionTemplate}
                  />
                  {selectedPickupPointError ? (
                    <Message severity="error" text={selectedPickupPointError} />
                  ) : (
                    ""
                  )}
                  {selectedPickupPoint ? (
                    <>
                      <div className="text-color-secondary text-sm px-3 pt-1">
                        {[
                          selectedPickupPoint.address1,
                          selectedPickupPoint.address2,
                          selectedPickupPoint.area,
                          selectedPickupPoint.city,
                          selectedPickupPoint.state,
                          selectedPickupPoint.pin,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <label>
                    Marketing Contact
                    {selectedPickupPoint ? (
                      <Button
                        className="mx-2 action-badge add-dialog-action-badge"
                        icon="pi pi-plus"
                        style={{
                          marginTop: "-7px",
                          height: "1rem",
                          width: "2rem",
                        }}
                        onClick={() => {
                          setAddLocationContactDialogVisible(true);
                          setSelectedContactType("Marketing");
                          setLocationNumber(
                            selectedPickupPoint.location_number
                          );
                        }}
                      ></Button>
                    ) : (
                      ""
                    )}
                  </label>
                  <Dropdown
                    showClear
                    disabled={!selectedPickupPoint}
                    value={selectedPickupMarketingContactsData}
                    options={pickupMarketingContactsData}
                    optionLabel="pickupMarketingContactName"
                    placeholder="Select a marketing contact"
                    filter
                    onChange={(e) => {
                      setSelectedPickupMarketingContactsData(e.target.value);
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <label>
                    Dispatch Contact
                    {selectedPickupPoint ? (
                      <Button
                        className="mx-2 action-badge add-dialog-action-badge"
                        icon="pi pi-plus"
                        style={{
                          marginTop: "-7px",
                          height: "1rem",
                          width: "2rem",
                        }}
                        onClick={() => {
                          setAddLocationContactDialogVisible(true);
                          setSelectedContactType("Dispatch");
                          setLocationNumber(
                            selectedPickupPoint.location_number
                          );
                        }}
                      ></Button>
                    ) : (
                      ""
                    )}
                  </label>
                  <Dropdown
                    showClear
                    disabled={!selectedPickupPoint}
                    value={selectedPickupDispatchContactsData}
                    options={pickupDispatchContactsData}
                    optionLabel="pickupDispatchContactName"
                    placeholder="Select a dispatch contact"
                    filter
                    onChange={(e) => {
                      setSelectedPickupDispatchContactsData(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>Drop Details</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-4 md:col-4">
                  <label>Drop Location</label>
                  <Dropdown
                    showClear
                    value={dropLocation}
                    onChange={(e) => {
                      setLrDetailsData((previousState) => ({
                        ...previousState,
                        dropLocation: e.target.value,
                      }));
                      setSelectedDropPoint(null);
                      setSelectedDropMarketingContactsData(null);
                      setSelectedDropDispatchContactsData(null);
                    }}
                    options={cityRefs}
                    optionLabel="ref_dspl"
                    placeholder="Select a drop location"
                    filter
                    //   valueTemplate={selectedCountryTemplate}
                    //   itemTemplate={countryOptionTemplate}
                  />
                  {dropLocationError ? (
                    <Message severity="error" text={dropLocationError} />
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-8 md:col-8">
                  <label>
                    Name of Drop Point
                    {dropLocation ? (
                      <Button
                        className="mx-2 action-badge add-dialog-action-badge"
                        icon="pi pi-plus"
                        style={{
                          marginTop: "-7px",
                          height: "1rem",
                          width: "2rem",
                        }}
                        onClick={() => {
                          setAddLocationDialogVisible(true);
                          setSelectedLocationType("Drop");
                        }}
                      ></Button>
                    ) : (
                      ""
                    )}
                  </label>
                  <Dropdown
                    showClear
                    disabled={!dropLocation}
                    value={selectedDropPoint}
                    options={dropPointData}
                    optionLabel="name_of_pickup_point"
                    placeholder="Select a drop point"
                    filter
                    onChange={(e) => {
                      setSelectedDropPoint(e.target.value);
                      setSelectedDropMarketingContactsData(null);
                      setSelectedDropDispatchContactsData(null);
                    }}
                    //   valueTemplate={selectedCountryTemplate}
                    itemTemplate={pickupDropConsignorOptionTemplate}
                  />
                  {selectedDropPointError ? (
                    <Message severity="error" text={selectedDropPointError} />
                  ) : (
                    ""
                  )}
                  {selectedDropPoint ? (
                    <>
                      <div className="text-color-secondary text-sm px-3 pt-1">
                        {[
                          selectedDropPoint.address1,
                          selectedDropPoint.address2,
                          selectedDropPoint.area,
                          selectedDropPoint.city,
                          selectedDropPoint.state,
                          selectedDropPoint.pin,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <label>
                    Marketing Contact
                    {selectedDropPoint ? (
                      <Button
                        className="mx-2 action-badge add-dialog-action-badge"
                        icon="pi pi-plus"
                        style={{
                          marginTop: "-7px",
                          height: "1rem",
                          width: "2rem",
                        }}
                        onClick={() => {
                          setAddLocationContactDialogVisible(true);
                          setSelectedContactType("Marketing");
                          setLocationNumber(selectedDropPoint.location_number);
                        }}
                      ></Button>
                    ) : (
                      ""
                    )}
                  </label>
                  <Dropdown
                    showClear
                    disabled={!selectedDropPoint}
                    value={selectedDropMarketingContactsData}
                    options={dropMarketingContactsData}
                    optionLabel="dropMarketingContactName"
                    placeholder="Select a marketing contact"
                    filter
                    onChange={(e) => {
                      setSelectedDropMarketingContactsData(e.target.value);
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <label>
                    Dispatch Contact
                    {selectedDropPoint ? (
                      <Button
                        className="mx-2 action-badge add-dialog-action-badge"
                        icon="pi pi-plus"
                        style={{
                          marginTop: "-7px",
                          height: "1rem",
                          width: "2rem",
                        }}
                        onClick={() => {
                          setAddLocationContactDialogVisible(true);
                          setSelectedContactType("Dispatch");
                          setLocationNumber(selectedDropPoint.location_number);
                        }}
                      ></Button>
                    ) : (
                      ""
                    )}
                  </label>
                  <Dropdown
                    showClear
                    disabled={!selectedDropPoint}
                    value={selectedDropDispatchContactsData}
                    options={dropDispatchContactsData}
                    optionLabel="dropDispatchContactName"
                    placeholder="Select a dispatch contact"
                    filter
                    onChange={(e) => {
                      setSelectedDropDispatchContactsData(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>Consignor Details</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-4 md:col-4">
                  <label>City</label>
                  <Dropdown
                    showClear
                    value={consignorCity}
                    onChange={(e) => {
                      setLrDetailsData((previousState) => ({
                        ...previousState,
                        consignorCity: e.target.value,
                      }));
                      setSelectedConsignor(null);
                    }}
                    options={cityRefs}
                    optionLabel="ref_dspl"
                    placeholder="Select consignor city"
                    filter
                  />
                  {consignorCityError ? (
                    <Message severity="error" text={consignorCityError} />
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-8 md:col-8">
                  <label>
                    Client Name
                    {consignorCity ? (
                      <Button
                        className="mx-2 action-badge add-dialog-action-badge"
                        icon="pi pi-plus"
                        style={{
                          marginTop: "-7px",
                          height: "1rem",
                          width: "2rem",
                        }}
                        onClick={() => {
                          setAddLocationDialogVisible(true);
                          setSelectedLocationType("Pickup");
                        }}
                      ></Button>
                    ) : (
                      ""
                    )}
                  </label>
                  <Dropdown
                    showClear
                    disabled={!consignorCity}
                    value={selectedConsignor}
                    options={consignorData}
                    optionLabel="name_of_pickup_point"
                    placeholder="Select a client"
                    filter
                    onChange={(e) => {
                      setSelectedConsignor(e.target.value);
                    }}
                    //   valueTemplate={selectedCountryTemplate}
                    itemTemplate={pickupDropConsignorOptionTemplate}
                  />
                  {selectedConsignorError ? (
                    <Message severity="error" text={selectedConsignorError} />
                  ) : (
                    ""
                  )}
                  {selectedConsignor ? (
                    <>
                      <div className="text-color-secondary text-sm px-3 pt-1">
                        {[
                          selectedConsignor.address1,
                          selectedConsignor.address2,
                          selectedConsignor.area,
                          selectedConsignor.city,
                          selectedConsignor.state,
                          selectedConsignor.pin,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>Consignee Details</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-4 md:col-4">
                  <label>City</label>
                  <Dropdown
                    showClear
                    value={consigneeCity}
                    onChange={(e) => {
                      setLrDetailsData((previousState) => ({
                        ...previousState,
                        consigneeCity: e.target.value,
                      }));
                      setSelectedConsignee(null);
                    }}
                    options={cityRefs}
                    optionLabel="ref_dspl"
                    placeholder="Select consignor city"
                    filter
                    //   valueTemplate={selectedCountryTemplate}
                    //   itemTemplate={countryOptionTemplate}
                  />
                  {consigneeCityError ? (
                    <Message severity="error" text={consigneeCityError} />
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-8 md:col-8">
                  <label>
                    Client Name
                    {consigneeCity ? (
                      <Button
                        className="mx-2 action-badge add-dialog-action-badge"
                        icon="pi pi-plus"
                        style={{
                          marginTop: "-7px",
                          height: "1rem",
                          width: "2rem",
                        }}
                        onClick={() => {
                          setAddClientDialogVisible(true);
                        }}
                      ></Button>
                    ) : (
                      ""
                    )}
                  </label>
                  <Dropdown
                    showClear
                    disabled={!consigneeCity}
                    value={selectedConsignee}
                    options={consigneeData}
                    optionLabel="client_name"
                    placeholder="Select a client"
                    filter
                    onChange={(e) => {
                      setSelectedConsignee(e.target.value);
                    }}
                    //   valueTemplate={selectedCountryTemplate}
                    itemTemplate={consigneeOptionTemplate}
                  />
                  {selectedConsigneeError ? (
                    <Message severity="error" text={selectedConsigneeError} />
                  ) : (
                    ""
                  )}
                  {selectedConsignee ? (
                    <>
                      <div className="text-color-secondary text-sm px-3 pt-1">
                        {[
                          selectedConsignee.address1,
                          selectedConsignee.address2,
                          selectedConsignee.area,
                          selectedConsignee.city,
                          selectedConsignee.state,
                          selectedConsignee.pin,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
                {selectedConsignee ? (
                  <>
                    <div className="field col-12 lg:col-6 md:col-6">
                      <label>GSTIN</label>
                      <InputText
                        disabled
                        value={selectedConsignee.client_gst}
                      />
                    </div>
                    <div className="field col-12 lg:col-6 md:col-6">
                      <label>Client Phone</label>
                      <InputText
                        disabled
                        value={
                          selectedConsignee.client_phone
                            ? "+91 " + selectedConsignee.client_phone
                            : ""
                        }
                      />
                    </div>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <h5>Other Details</h5>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 lg:col-4 md:col-6">
                  <label>Transport Vehicle</label>
                  <Dropdown
                    showClear
                    value={transportVehicleType}
                    onChange={(e) => {
                      setLrDetailsData((previousState) => ({
                        ...previousState,
                        transportVehicleType: e.target.value,
                      }));

                      if (
                        e.target.value &&
                        e.target.value.ref_dspl === "Local Vehicle"
                      ) {
                        setLrDetailsData((previousState) => ({
                          ...previousState,
                          transportVehicleDetail: "Crossing",
                        }));
                      } else if (
                        e.target.value &&
                        e.target.value.ref_dspl === "Main Vehicle"
                      ) {
                        setLrDetailsData((previousState) => ({
                          ...previousState,
                          transportVehicleDetail: "Direct",
                        }));
                      } else {
                        setLrDetailsData((previousState) => ({
                          ...previousState,
                          transportVehicleDetail: "",
                        }));
                      }
                    }}
                    options={transportVehicleTypeRefs}
                    optionLabel="ref_dspl"
                    placeholder="Select vehicle type"
                  />
                  {transportVehicleDetail ? (
                    <>
                      <div className="text-color-secondary text-sm px-3 pt-1">
                        {transportVehicleDetail}
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
                <div className="field col-12 lg:col-4 md:col-6">
                  <label>LR Status</label>
                  <Dropdown
                    showClear
                    value={lrStatus}
                    onChange={(e) => {
                      setLrDetailsData((previousState) => ({
                        ...previousState,
                        lrStatus: e.target.value,
                      }));
                    }}
                    options={lRStatusReferenceOptions}
                    optionLabel="ref_dspl"
                    placeholder="Select a status"
                  />
                </div>
                <div className="field col-12 lg:col-4 md:col-6">
                  <label>Vehicle Number</label>
                  <InputText
                    value={vehicleNumber}
                    onChange={(e) => {
                      setLrDetailsData((previousState) => ({
                        ...previousState,
                        vehicleNumber: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <label>Truck Driver</label>
                  <InputTextarea
                    rows={2}
                    value={
                      fetchedOrderData.truck_details
                        ? fetchedOrderData.truck_details
                        : ""
                    }
                  />
                </div>
                <div className="field col-12 lg:col-6 md:col-6">
                  <label>Driver Details</label>
                  <InputTextarea
                    rows={2}
                    value={driverDetails}
                    onChange={(e) => {
                      setLrDetailsData((previousState) => ({
                        ...previousState,
                        driverDetails: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="field col-12 lg:col-12 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Quantity</span>
                    <InputTextarea
                      rows={2}
                      disabled
                      value={fetchedOrderData.quantity}
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Material</span>
                    <InputText disabled value={fetchedOrderData.material} />
                  </div>
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Weight</span>
                    <InputText
                      disabled
                      value={fetchedOrderData.weight + " Kg"}
                    />
                  </div>
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Size</span>
                    <InputText disabled value={fetchedOrderData.size} />
                  </div>
                </div>
                <div className="field col-12 lg:col-3 md:col-6">
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">Amount</span>
                    <InputText disabled value="As Per Invoice" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ViewLR
          fetchedOrderData={fetchedOrderData}
          fetchedLRData={fetchedLRData}
          fetchedClientData={fetchedClientData}
          fetchedPickupLocationData={fetchedPickupLocationData}
          fetchedPickupLocationMarketingData={
            fetchedPickupLocationMarketingData
          }
          fetchedpickupLocationDispatchData={fetchedpickupLocationDispatchData}
          fetchedDropLocationData={fetchedDropLocationData}
          fetchedDropLocationMarketingData={fetchedDropLocationMarketingData}
          fetchedDropLocationDispatchData={fetchedDropLocationDispatchData}
          fetchedConsignorClientsData={fetchedConsignorClientsData}
          fetchedConsigneeClientsData={fetchedConsigneeClientsData}
        />
      </Dialog>

      <AddClientDialog
        addClientDialogVisible={addClientDialogVisible}
        setAddClientDialogVisible={setAddClientDialogVisible}
        references={references}
        user={user}
        setRefreshClientData={setRefreshClientData}
      />

      <AddLocationDialog
        addLocationDialogVisible={addLocationDialogVisible}
        setAddLocationDialogVisible={setAddLocationDialogVisible}
        references={references}
        user={user}
        setRefreshLocationData={setRefreshLocationData}
        selectedLocationType={selectedLocationType}
        setSelectedLocationType={setSelectedLocationType}
      />

      <AddLocationContactDialog
        addLocationContactDialogVisible={addLocationContactDialogVisible}
        setAddLocationContactDialogVisible={setAddLocationContactDialogVisible}
        references={references}
        user={user}
        setRefreshLocationContactData={setRefreshLocationContactData}
        selectedContactType={selectedContactType}
        setSelectedContactType={setSelectedContactType}
        locationNumber={locationNumber}
      />
    </>
  );
}
