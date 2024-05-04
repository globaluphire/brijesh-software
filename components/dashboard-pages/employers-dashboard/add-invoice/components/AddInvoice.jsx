/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../../../../config/supabaseClient";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import { Typeahead } from "react-bootstrap-typeahead";
import { envConfig } from "../../../../../config/env";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import Router from "next/router";
import CalendarComp from "../../../../../components/date/CalendarComp";

const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false,
});

const apiKey = envConfig.JOB_PORTAL_GMAP_API_KEY;
const mapApiJs = "https://maps.googleapis.com/maps/api/js";

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

const addJobFields = {
    jobTitle: "",
    jobDesc: "",
    jobType: "Full Time",
    salary: "",
    salaryRate: "Per Hour",
    education: "",
    exp: "0 - 1 year",
    address: "",
    completeAddress: "",
    facility: "",
};

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
    amountInNumbers: "",
    weight: "",
    amountInWords: ""
};
const AddInvoice = () => {
    // const [jobTitle, setJobTitle] = useState("");
    // const [jobDesc, setJobDesc] = useState("");
    // const [email, setEmail] = useState("");
    // const [username, setUsername] = useState("");
    // const [specialism, setSpecialism] = useState([]);
    // const [jobType, setJobType] = useState("");
    // const [salary, setSalary] = useState("");
    // const [salaryRate, setSalaryRate] = useState("");
    // const [education, setEducation] = useState("");
    // const [exp, setExp] = useState("");
    // const [gender, setGender] = useState("");
    // const [industy, setIndustry] = useState("");
    // const [qualification, setQualification] = useState("");
    // const [deadline, setDeadline] = useState("");
    // const [country, setCountry] = useState("");
    // const [city, setCity] = useState("");
    // const [address, setAddress] = useState("");
    const user = useSelector((state) => state.candidate.user);
    const [salaryType, setSalaryType] = useState("fixed");
    const [lowerLimit, setLowerLimit] = useState("");
    const [upperLimit, setUpperLimit] = useState("");

    const handleSalaryTypeChange = (e) => {
        setSalaryType(e.target.value);
    };

    const [jobData, setJobData] = useState(
        JSON.parse(JSON.stringify(addJobFields))
    );
    // const {
    //     jobTitle,
    //     jobDesc,
    //     jobType,
    //     salary,
    //     salaryRate,
    //     education,
    //     exp,
    //     address,
    //     completeAddress,
    //     facility,
    // } = useMemo(() => jobData, [jobData]);
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
        amountInNumbers,
        weight,
        amountInWords
        
    } = useMemo(() => invoiceFormData, [invoiceFormData]);

    const searchInput = useRef(null);

    const [singleSelections, setSingleSelections] = useState([]);
    const [facilityNames, setFacilityNames] = useState([]);
    const [facilitySingleSelections, setFacilitySingleSelections] = useState(
        []
    );
    const [validated, setValidated] = useState(false);
    const [
        lRStatusReferenceOptions,
        setLRStatusReferenceOptions,
    ] = useState(null);


    const addresses = [
        "601 Evergreen Rd., Woodburn, OR 97071",
        "160 NE Conifer Blvd., Corvallis, OR 97330",
        "1735 Adkins St., Eugene, OR 97401",
        "1201 McLean Blvd., Eugene, OR 97405",
        "1166 E 28th Ave., Eugene, OR 97403",
        "740 NW Hill Pl., Roseburg, OR 97471",
        "525 W Umpqua St., Roseburg, OR 97471",
        "2075 NW Highland Avenue, Grants Pass, OR 97526",
        "2201 NW Highland Avenue, Grants Pass, OR 97526",
        "2901 E Barnett Rd., Medford, OR 97504",
        "4062 Arleta Ave NE, Keizer,	OR 97303",
        "2350 Oakmont Way, Suite 204, Eugene, OR 97401",
        "1677 Pensacola Street, Honolulu, HI 96822",
        "10503 Timberwood Cir, Suite 200, Louisville, KY 40223",
        "252 LA Hwy 402, Napoleonville, LA 70390",
        "5976 Highway 65N, Lake Providence, LA 71254",
        "1400 Lindberg Street, Slidell, LA 70458",
        "4021 Cadillac Street, New Orleans, LA 70122",
    ];

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
        // getLRStatusOptions();
    }, []);

    useEffect(() => {
        jobData.facility = facilitySingleSelections[0];
    }, [facilitySingleSelections]);

    useEffect(() => {
        jobData.completeAddress = singleSelections[0];
    }, [singleSelections]);

    // init google map script
    const initMapScript = () => {
        // if script already loaded
        if (window.google) {
            return Promise.resolve();
        }
        const src = `${mapApiJs}?key=${apiKey}&libraries=places&v=weekly`;
        return loadAsyncScript(src);
    };

    // do something on address change
    const onChangeAddress = (autocomplete) => {
        const location = autocomplete.getPlace();
        setJobData((previousState) => ({
            ...previousState,
            address: searchInput.current.value,
        }));
    };

    // init autocomplete
    const initAutocomplete = () => {
        if (!searchInput.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(
            searchInput.current,
            {
                types: ["(cities)"],
            }
        );
        autocomplete.setFields(["address_component", "geometry"]);
        autocomplete.addListener("place_changed", () =>
            onChangeAddress(autocomplete)
        );
    };

    // load map script after mounted
    useEffect(() => {
        initMapScript().then(() => initAutocomplete());
    }, []);
    /*
  const specialisms = [
    { value: "Banking", label: "Banking" },
    { value: "Digital & Creative", label: "Digital & Creative" },
    { value: "Retail", label: "Retail" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Managemnet", label: "Managemnet" },
    { value: "Accounting & Finance", label: "Accounting & Finance" },
    { value: "Digital", label: "Digital" },
    { value: "Creative Art", label: "Creative Art" },
    { value: "Engineer", label: "Engineer" },
  ];
 */
    function checkRequiredFields(lrFormData) {
        if (
            // Consignor Block Fields
            consignorName &&
            consignorGST &&
            consignorAddress &&

            // Consignor Block Fields
            consigneeName &&
            consigneeGST &&
            consigneeAddress &&

            // Other Block Fields
            fromCity &&
            toCity &&
            vehicalNumber &&
            driverName &&
            driverPhone &&

            // Material Details Block Fields
            materialDetails &&
            weight &&
            status
        ) {
            return true;
        } else {
            return false;
        }
    };

    const addNewInvoice = async (
        {
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
            amountInNumbers,
            weight,
            amountInWords
        },
        setInvoiceFormData,
        user
    ) => {
        // if (checkRequiredFields(lrFormData)) {
            try {
                // Generate Invoice Number
                const today = new Date();
                let date = today.getDate();
                if (date < 10) {
                    date = "0" + date;
                }
                let month = today.getMonth() + 1;
                if (month < 10) {
                    month = "0" + month;
                }
                var year = today.getFullYear();

                const { data: sysKeyInvoiceData, error: sysKeyInvoiceError } = await supabase
                    .from("sys_key")
                    .select("sys_seq_nbr")
                    .eq("key_name", "invoice_number");

                let invoiceSeqNbr = sysKeyInvoiceData[0].sys_seq_nbr + 1;
                if (invoiceSeqNbr < 10) {
                    invoiceSeqNbr = "00" + invoiceSeqNbr;
                } else if(invoiceSeqNbr < 100) {
                    invoiceSeqNbr = "0" + invoiceSeqNbr;
                }
                const invoiceNumber = "INV" + "" + date + "" + month + "" + year.toString().substring(2) + "" + invoiceSeqNbr;

                const { data, error } = await supabase.from("invoice").insert([
                    {
                        invoice_number: invoiceNumber,
                        // invoice_date: "",
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
                        total_amount: amountInNumbers,
                        weight: weight,
                        total_amount_in_words: amountInWords
                    },
                ]);
                if (error) {
                    // open toast
                    toast.error(
                        "Error while saving Invoice details, Please try again later or contact tech support",
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
                    toast.success("New Invoice saved successfully", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                    
                    // increment lr_number key
                    await supabase.rpc("increment_sys_key", {
                        x: 1,
                        keyname: "invoice_number",
                    });

                    setInvoiceFormData(JSON.parse(JSON.stringify(addInvoiceFields)));
                }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while saving Invoice details, Please try again later or contact tech support",
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
            <Form noValidate validated={validated}>
                {/* Consigner Block starts */}
                <div>
                    <div className="divider">
                        <span><b>Bill To</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="validationCustom01">
                                <Form.Label>Company Name</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Consignor"
                                    // defaultValue="Mark"
                                    value={buyerName}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            buyerName: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Buyer's Company Name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>GSTIN/UIN</Form.Label>
                                <Form.Control
                                    type="text"
                                    // placeholder="GST number"
                                    // defaultValue="Otto"
                                    value={buyerGST}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            buyerGST: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="12" controlId="validationCustom03">
                                <Form.Label>Address</Form.Label>
                                <Form.Control 
                                    type="text"
                                    placeholder="Buyer's Address"
                                    // required
                                    value={buyerAddress}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            buyerAddress: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid Consignor's Address.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Buyer Block ends */}

                {/* Invoice Details Block starts */}
                <div>
                    <div className="divider">
                        <span><b>General</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>Vehical Number</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Consignee"
                                    // defaultValue="Mark"
                                    value={vehicalNumber}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            vehicalNumber: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignee's name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>LR Number</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="GST number"
                                    // defaultValue="Otto"
                                    value={lrNumber}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            lrNumber: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignee's GST Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>Order Number</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Driver Name"
                                    // defaultValue="Otto"
                                    value={orderNumber}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            orderNumber: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment's Driver Name.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Consignee Block ends */}

                {/* Other Block starts */}
                <div>
                    <div className="divider divider-other">
                        <span><b>Services</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="2" controlId="validationCustom01">
                                <Form.Label>From City</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Consignee"
                                    // defaultValue="Mark"
                                    value={fromCity}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            fromCity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment From location.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="auto" controlId="validationCustom02">
                                <Form.Label>To City</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="To"
                                    // defaultValue="Otto"
                                    value={toCity}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            toCity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment To location.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>Material</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="GJ011234"
                                    // defaultValue="Otto"
                                    value={material}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            material: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Vehical Number.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="2" controlId="validationCustom02">
                                <Form.Label>Weight(Kg)</Form.Label>
                                <Form.Control
                                    // required
                                    type="number"
                                    // placeholder="Weight"
                                    // defaultValue="Otto"
                                    value={weight}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            weight: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment Weight in Kg.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="9" controlId="validationCustom02">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Driver Name"
                                    // defaultValue="Otto"
                                    value={quantity}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            quantity: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment's Driver Name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>EWay Bill Number</Form.Label>
                                <Form.Control
                                    // required
                                    type="text"
                                    // placeholder="Driver Name"
                                    // defaultValue="Otto"
                                    value={ewayBillNumber}
                                    onChange={(e) => {
                                        setInvoiceFormData((previousState) => ({
                                            ...previousState,
                                            ewayBillNumber: e.target.value,
                                        }));
                                    }}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Consignment's Driver Name.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                {/* Other Block ends */}


                {/* Material Details starts */}
                <div>
                    <div className="divider divider-material">
                        <span><b>Services Amount</b></span>
                    </div>
                    <div style={{ padding: "0 2rem" }}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="validationCustomPhonenumber">
                                <Form.Label>Total Amount (in numbers)</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text id="inputGroupPrepend"><i className="las la-rupee-sign"></i></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        // placeholder="900"
                                        aria-describedby="inputGroupPrepend"
                                        // required
                                        value={amountInNumbers}
                                        onChange={(e) => {
                                            setInvoiceFormData((previousState) => ({
                                                ...previousState,
                                                amountInNumbers: e.target.value,
                                            }));
                                        }}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Form.Group as={Col} md="8" controlId="validationCustomPhonenumber">
                                <Form.Label>Total Amount (in words)</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text id="inputGroupPrepend"><i className="las la-rupee-sign"></i></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        // placeholder="Username"
                                        aria-describedby="inputGroupPrepend"
                                        // required
                                        value={amountInWords}
                                        onChange={(e) => {
                                            setInvoiceFormData((previousState) => ({
                                                ...previousState,
                                                amountInWords: e.target.value,
                                            }));
                                        }}
                                    />
                                </InputGroup>
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
                            onClick={() => {Router.push("/employers-dashboard/billing"); }}
                            className="btn btn-back btn-sm text-nowrap m-1"
                        >
                            Back to Billing
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
                                    addNewInvoice(invoiceFormData, setInvoiceFormData, user);
                                // }
                            }}
                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                        >
                            Add Invoice
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
        </>
    );
};

export default AddInvoice;
