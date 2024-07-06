/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../../../../config/supabaseClient";
import Router, { useRouter } from "next/router";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import { envConfig } from "../../../../../config/env";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";

const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false,
});

const apiKey = envConfig.JOB_PORTAL_GMAP_API_KEY;
const mapApiJs = "https://maps.googleapis.com/maps/api/js";

const editedJobFields = {
    editedJobTitle: "",
    editedJobDesc: "",
    editedJobType: "",
    editedSalary: "",
    editedSalaryRate: "",
    editedCareer: "",
    editedExp: "",
    editedCompleteAddress: "",
    editedFacility: "",
};

const editedLRFields = {
    // Consignor Block Fields
    editedConsignorName: "",
    editedConsignorGST: "",
    editedConsignorPhone: "",
    editedConsignorAddress: "",
    editedConsignorEmail: "",

    // Consignor Block Fields
    editedConsigneeName: "",
    editedConsigneeGST: "",
    editedConsigneePhone: "",
    editedConsigneeAddress: "",
    editedConsigneeEmail: "",

    // Other Block Fields
    editedFromCity: "",
    editedToCity: "",
    editedVehicalNumber: "",
    editedDriverName: "",
    editedDriverPhone: "",

    // Material Details Block Fields
    editedMaterialDetails: "",
    editedWeight: null,
    editedStatus: ""
};

// load google map api js
function loadAsyncScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("Script");
        Object.assign(script, {
            type: "text/javascript",
            async: true,
            src,
        });
        script.addEventListener("load", () => resolve(script));
        document.head.appendChild(script);
    });
}

const EditLRView = ({ fetchedLRData }) => {
    // console.log(fetchedJobData);
    const user = useSelector((state) => state.candidate.user);
    const [salaryType, setSalaryType] = useState("fixed");
    const [lowerLimit, setLowerLimit] = useState("");
    const [upperLimit, setUpperLimit] = useState("");

    const [editedJobData, setEditedJobData] = useState(
        JSON.parse(JSON.stringify(editedJobFields))
    );

    const handleSalaryTypeChange = (e) => {
        setSalaryType(e.target.value);
    };
    const {
        editedJobTitle,
        editedJobDesc,
        editedJobType,
        editedSalary,
        editedSalaryRate,
        editedCareer,
        editedExp,
        editedAddress,
        editedCompleteAddress,
        editedFacility,
    } = useMemo(() => editedJobData, [editedJobData]);

    const [lrFormData, setLrFormData] = useState(
        JSON.parse(JSON.stringify(editedLRFields))
    );
    const {
        // Consignor Block Fields
        editedConsignorName,
        editedConsignorGST,
        editedConsignorPhone,
        editedConsignorAddress,
        editedConsignorEmail,

        // Consignor Block Fields
        editedConsigneeName,
        editedConsigneeGST,
        editedConsigneePhone,
        editedConsigneeAddress,
        editedConsigneeEmail,

        // Other Block Fields
        editedFromCity,
        editedToCity,
        editedVehicalNumber,
        editedDriverName,
        editedDriverPhone,

        // Material Details Block Fields
        editedMaterialDetails,
        editedWeight,
        editedStatus
    } = useMemo(() => lrFormData, [lrFormData]);

    const router = useRouter();
    const JobId = router.query.id;
    const [validated, setValidated] = useState(false);

    const [
        lRStatusReferenceOptions,
        setLRStatusReferenceOptions,
    ] = useState(null);

    async function getLRStatusOptions() {
        // call reference to get lrStatus options
        const { data, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "lrStatus");

        if (data) {
            setLRStatusReferenceOptions(data);
        }

    }

    useEffect(() => {
        getLRStatusOptions();
    }, []);

    const assignLRData = () => {
        setLrFormData({
            // Consignor Block Fields
            editedConsignorName: fetchedLRData.consignor,
            editedConsignorGST: fetchedLRData.consignor_gst,
            editedConsignorPhone: fetchedLRData.consignor_phone,
            editedConsignorAddress: fetchedLRData.pickup_address,
            editedConsignorEmail: fetchedLRData.consignor_email,
    
            // Consignor Block Fields
            editedConsigneeName: fetchedLRData.consignee,
            editedConsigneeGST: fetchedLRData.consignee_gst,
            editedConsigneePhone: fetchedLRData.consignee_phone,
            editedConsigneeAddress: fetchedLRData.drop_address,
            editedConsigneeEmail: fetchedLRData.consignee_email,
    
            // Other Block Fields
            editedFromCity: fetchedLRData.from_city,
            editedToCity: fetchedLRData.to_city,
            editedVehicalNumber: fetchedLRData.vehical_number,
            editedDriverName: fetchedLRData.driver_name,
            editedDriverPhone: fetchedLRData.driver_phone,
    
            // Material Details Block Fields
            editedMaterialDetails: fetchedLRData.material_details,
            editedWeight: fetchedLRData.weight,
            editedStatus: fetchedLRData.status
        });
    };

    useEffect(() => {
        assignLRData(fetchedLRData);
    }, [fetchedLRData]);

    const SaveLRChanges = async (
        {
            // Consignor Block Fields
            editedConsignorName,
            editedConsignorGST,
            editedConsignorPhone,
            editedConsignorAddress,
            editedConsignorEmail,
    
            // Consignor Block Fields
            editedConsigneeName,
            editedConsigneeGST,
            editedConsigneePhone,
            editedConsigneeAddress,
            editedConsigneeEmail,
    
            // Other Block Fields
            editedFromCity,
            editedToCity,
            editedVehicalNumber,
            editedDriverName,
            editedDriverPhone,
    
            // Material Details Block Fields
            editedMaterialDetails,
            editedWeight,
            editedStatus
        },
        setLrFormData,
        user
    ) => {
        // if (checkRequiredFields(lrFormData)) {
            try {
                const { data, error } = await supabase
                .from("lr")
                .update({
                    // Consignor Fields
                    consignor: editedConsignorName,
                    pickup_address: editedConsignorAddress,
                    consignor_gst: editedConsignorGST,
                    consignor_email: editedConsignorEmail,
                    consignor_phone: editedConsignorPhone,

                    // Consignee Fields
                    consignee: editedConsigneeName,
                    drop_address: editedConsigneeAddress,
                    consignee_gst: editedConsigneeGST,
                    consignee_email: editedConsigneeEmail,
                    consignee_phone: editedConsigneePhone,

                    // Other Block Fields
                    from_city: editedFromCity,
                    to_city: editedToCity,
                    vehical_number: editedVehicalNumber,
                    driver_name: editedDriverName,
                    driver_phone: editedDriverPhone,

                    // Material Details Block Fields
                    material_details: editedMaterialDetails,
                    weight: editedWeight,

                    // Default fields
                    status: editedStatus
                })
                .eq("lr_number", fetchedLRData.lr_number);

                if (error) {
                    // open toast
                    toast.error(
                        "Error while saving LR changes, Please try again later or contact tech support",
                        {
                            position: "bottom-right",
                            autoClose: false,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        }
                    );
                } else {
                    // open toast
                    toast.success("LR Changes saved successfully", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                    
                }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while saving LR changes, Please try again later or contact tech support",
                    {
                        position: "bottom-right",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    }
                );
                // console.warn(err);
            }
        // } else {
        //     // open toast
        //     toast.error("Please fill all the required fields.", {
        //         position: "top-center",
        //         autoClose: false,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         theme: "colored",
        //     });
        // }
    };

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        }
        setValidated(true);
    };

    return (
        <>
            {lRStatusReferenceOptions ? <Form noValidate validated={validated}>
                {/* Consigner Block starts */}
                <div>
                    <div className="divider">
                        <span><b>Consignor</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Consignor"
                                    // defaultValue="Mark"
                                    value={editedConsignorName}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedConsignorName: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignor name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>GST Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    // placeholder="GST number"
                                    // defaultValue="Otto"
                                    value={editedConsignorGST}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedConsignorGST: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                <Form.Label>Phone Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        // placeholder="Username"
                                        aria-describedby="inputGroupPrepend"
                                        // required
                                        value={editedConsignorPhone}
                                        onChange={(e) => {
                                            setLrFormData((previousState) => ({
                                                ...previousState,
                                                editedConsignorPhone: e.target.value,
                                            }));
                                        }}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="9" controlId="validationCustom03">
                                <Form.Label>Address</Form.Label>
                                <Form.Control 
                                    type="text"
                                    placeholder="Pickup Address"
                                    // required
                                    value={editedConsignorAddress}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedConsignorAddress: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid Consignor's Address.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom04">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    value={editedConsignorEmail}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedConsignorEmail: e.target.value,
                                        }));
                                    }}
                                />
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Consigner Block ends */}

                {/* Consignee Block starts */}
                <div>
                    <div className="divider">
                        <span><b>Consignee</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Consignee"
                                    // defaultValue="Mark"
                                    value={editedConsigneeName}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedConsigneeName: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignee's name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>GST Number</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="GST number"
                                    // defaultValue="Otto"
                                    value={editedConsigneeGST}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedConsigneeGST: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignee's GST Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                <Form.Label>Phone Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        // placeholder="Username"
                                        aria-describedby="inputGroupPrepend"
                                        // required
                                        value={editedConsigneePhone}
                                        onChange={(e) => {
                                            setLrFormData((previousState) => ({
                                                ...previousState,
                                                editedConsigneePhone: e.target.value,
                                            }));
                                        }}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="9" controlId="validationCustom03">
                                <Form.Label>Address</Form.Label>
                                <Form.Control    
                                    type="text"
                                    placeholder="Drop Address"
                                    // required
                                    value={editedConsigneeAddress}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedConsigneeAddress: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid Consignee's Address.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom04">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    value={editedConsigneeEmail}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedConsigneeEmail: e.target.value,
                                        }));
                                    }}
                                />
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Consignee Block ends */}

                {/* Other Block starts */}
                <div>
                    <div className="divider divider-other">
                        <span><b>Other</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="3" controlId="validationCustom01">
                                <Form.Label>From</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Consignee"
                                    // defaultValue="Mark"
                                    value={editedFromCity}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedFromCity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment From location.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>To</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="To"
                                    // defaultValue="Otto"
                                    value={editedToCity}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedToCity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment To location.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Vehical Number</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="GJ011234"
                                    // defaultValue="Otto"
                                    value={editedVehicalNumber}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedVehicalNumber: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Vehical Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Driver Name</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Driver Name"
                                    // defaultValue="Otto"
                                    value={editedDriverName}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedDriverName: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment's Driver Name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomDriverPhonenumber">
                                <Form.Label>Driver Phone Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text id="inputGroupPrepend">+91</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        // placeholder="Driver Phone Number"
                                        aria-describedby="inputGroupPrepend"
                                        // required
                                        value={editedDriverPhone}
                                        onChange={(e) => {
                                            setLrFormData((previousState) => ({
                                                ...previousState,
                                                editedDriverPhone: e.target.value,
                                            }));
                                        }}
                                    />
                                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter Consignment's Driver Phone Number.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Other Block ends */}


                {/* Material Details starts */}
                <div>
                    <div className="divider divider-material">
                        <span><b>Material Details</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="validationCustom01">
                                <Form.Label>Material Details</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Material Details"
                                    // defaultValue="Mark"
                                    value={editedMaterialDetails}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedMaterialDetails: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment Material Details.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Weight(Kg)</Form.Label>
                                <Form.Control
                                    // required
                                    type="number"
                                    // placeholder="Weight"
                                    // defaultValue="Otto"
                                    value={editedWeight}
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedWeight: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment Weight in Kg.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    className="chosen-single form-select"
                                    onChange={(e) => {
                                        setLrFormData((previousState) => ({
                                            ...previousState,
                                            editedStatus: e.target.value,
                                        }));
                                    }}
                                    value={editedStatus}
                                    // required
                                >
                                    <option value=""></option>
                                    {lRStatusReferenceOptions.map(
                                        (option) => (
                                            <option value={option.ref_dspl}>
                                                {option.ref_dspl}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter LR Status.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Material Details ends */}

                {/* Form Submit Buttons Block Starts */}
                <Row className="mt-5">
                    <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                        <Button
                            variant="secondary"
                            onClick={() => {Router.push("/employers-dashboard/old-lr"); }}
                            className="btn btn-back btn-sm text-nowrap m-1"
                        >
                            Back to LR
                        </Button>
                    </Form.Group>
                    <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                        <Button
                            type="submit"
                            variant="success"
                            onClick={(e) => {
                                e.preventDefault();
                                // handleSubmit(e);
                                // if(validated) {
                                    SaveLRChanges(lrFormData, setLrFormData, user);
                                // }
                            }}
                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                        >
                            Save Changes
                        </Button>
                    </Form.Group>
                    {/* <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mb-3">
                        <Button
                            type="submit"
                            variant="success"
                            onClick={() => Router.push("/employers-dashboard/")}
                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                        >
                            Add New LR & Export to PDF
                        </Button>
                    </Form.Group> */}
                </Row>
                {/* Form Submit Buttons Block Ends */}

            </Form>
            : "" }
        </>
    );
};

export default EditLRView;
