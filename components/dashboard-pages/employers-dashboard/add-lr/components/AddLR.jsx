/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../../../../config/supabaseClient";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import { Typeahead } from "react-bootstrap-typeahead";
import { envConfig } from "../../../../../config/env";
import { Row } from "react-bootstrap";

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

const AddLR = () => {
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

    const searchInput = useRef(null);

    const [singleSelections, setSingleSelections] = useState([]);
    const [facilityNames, setFacilityNames] = useState([]);
    const [facilitySingleSelections, setFacilitySingleSelections] = useState(
        []
    );

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

    async function getFacilityNames() {
        // call reference to get applicantStatus options
        const { data: refData, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "facilityName");

        if (refData) {
            // setFacilityNames(refData)
            const facilities = [];
            for (let i = 0; i < refData.length; i++) {
                facilities.push(refData[i].ref_dspl);
            }
            facilities.sort();
            setFacilityNames(facilities);
        }
    }

    useEffect(() => {
        getFacilityNames();
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
    const submitJobPost = async (
        {
            jobTitle,
            jobDesc,
            jobType,
            salary,
            salaryRate,
            education,
            exp,
            completeAddress,
            address,
            facility,
        },
        setJobData,
        user
    ) => {
        if (salaryType === "ranged") {
            if (!upperLimit || !lowerLimit) {
                return;
            }
            salary = `${lowerLimit} - ${upperLimit}`;
        }
        if (
            jobTitle &&
            jobDesc &&
            jobType &&
            salary &&
            salaryRate &&
            exp &&
            completeAddress &&
            facility
        ) {
            try {
                const { data: facilityData, error: facilityError } =
                    await supabase
                        .from("facility")
                        .select("facility_id")
                        .eq("facility_name", facility)
                        .single();

                if (facilityData) {
                    const { data, error } = await supabase.from("jobs").insert([
                        {
                            user_id: user.id,
                            job_title: jobTitle,
                            job_desc: jobDesc,
                            job_type: jobType,
                            experience: exp,
                            education,
                            salary,
                            salary_rate: salaryRate,
                            job_comp_add: completeAddress,
                            facility_name: facility,
                            facility_id: facilityData.facility_id,
                        },
                    ]);
                    if (error) {
                        // open toast
                        toast.error(
                            "Error while fetching facility details, Please try again later or contact tech support",
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
                        toast.success("Job Posted successfully", {
                            position: "bottom-right",
                            autoClose: 8000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        });
                        setJobData(JSON.parse(JSON.stringify(addJobFields)));
                    }
                } else {
                    // open toast
                    toast.error(
                        "Error while saving your job application, Please try again later or contact tech support",
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
                }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while saving your job application, Please try again later or contact tech support",
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
        } else {
            // open toast
            toast.error("Please fill all the required fields.", {
                position: "top-center",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };

    async function printHtml2pdf() {
        var element = document.getElementById("element")
        html2pdf(element)
    };

    return (
        <>
            <div >
                <span>Testing First Page PDF</span>
                <br />
                <button onClick={() => printHtml2pdf()}>Print</button>
            </div>
            <form className="default-form">
                <div className="row">
                    {/* <!-- Input --> */}
                    <div className="form-group col-lg-12 col-md-12">
                        <label>
                            Company Name <span className="required">(required)</span>
                        </label>
                        <input
                            type="text"
                            name="globaluphire-jobTitle"
                            value={jobData.jobTitle}
                            required
                            onChange={(e) => {
                                setJobData((previousState) => ({
                                    ...previousState,
                                    jobTitle: e.target.value,
                                }));
                            }}
                            placeholder="Job Title"
                        />
                    </div>
                    {/* <!-- About Company --> */}
                    <div className="form-group col-lg-12 col-md-12">
                        <label>
                            Job Description{" "}
                            <span className="required">(required)</span>
                        </label>
                        <SunEditor
                            setOptions={{
                                buttonList: [
                                    ["fontSize", "formatBlock"],
                                    [
                                        "bold",
                                        "underline",
                                        "italic",
                                        "strike",
                                        "subscript",
                                        "superscript",
                                    ],
                                    ["align", "horizontalRule", "list", "table"],
                                    ["fontColor", "hiliteColor"],
                                    ["outdent", "indent"],
                                    ["undo", "redo"],
                                    ["removeFormat"],
                                    ["outdent", "indent"],
                                    ["link"],
                                    ["preview", "print"],
                                    ["fullScreen", "showBlocks", "codeView"],
                                ],
                            }}
                            setDefaultStyle="color:black;"
                            onChange={(e) => {
                                setJobData((previousState) => ({
                                    ...previousState,
                                    jobDesc: e,
                                }));
                            }}
                        />
                    </div>
                    {/* <!-- Input --> */}
                    {/*
            <div className="form-group col-lg-6 col-md-12">
            <label>Email Address <span className="optional">(optional)</span></label>
            <input
                type="text"
                name="name"
                placeholder="example@test.com"
                value={email}
                onChange={(e) => {
                setEmail(e.target.value);
                }}
            />
            </div>
    */}
                    {/* <!-- Input --> */}
                    {/*
            <div className="form-group col-lg-6 col-md-12">
            <label>Username</label>
            <input
                type="text"
                name="name"
                placeholder=""
                value={username}
                onChange={(e) => {
                setUsername(e.target.value);
                }}
            />
            </div>
    */}
                    {/* <!-- Search Select --> */}
                    {/*
            <div className="form-group col-lg-6 col-md-12">
            <label>Specialisms </label>
            <Select
                defaultValue={[specialisms[2]]}
                isMulti
                name="colors"
                options={specialisms}
                className="basic-multi-select"
                classNamePrefix="select"
                value={specialism}
                onChange={(e) => {
                // const updatedOptions = [...e.target.options]
                //   .filter((option) => option.selected)
                //   .map((x) => x.value);
                // console.log("updatedOptions", updatedOptions);
                // setSpecialism(updatedOptions);
                setSpecialism(e || []);
                }}
            />
            </div>
    */}
                    <div className="form-group col-lg-6 col-md-12">
                        <label>
                            Job Type <span className="required"> (required)</span>
                        </label>
                        <select
                            className="chosen-single form-select"
                            value={jobData.jobType}
                            required
                            onChange={(e) => {
                                console.log(e.target.value);
                                setJobData((previousState) => ({
                                    ...previousState,
                                    jobType: e.target.value,
                                }));
                            }}
                        >
                            <option>Full Time</option>
                            <option>Part Time</option>
                            <option>Both</option>
                            <option>PRN</option>
                        </select>
                    </div>
                    <div className="form-group col-lg-6 col-md-12">
                        <label>
                            Experience<span className="required"> (required)</span>
                        </label>
                        <select
                            className="chosen-single form-select"
                            value={jobData.exp}
                            onChange={(e) => {
                                setJobData((previousState) => ({
                                    ...previousState,
                                    exp: e.target.value,
                                }));
                            }}
                            required
                        >
                            <option>0 - 1 year</option>
                            <option>1 - 3 years</option>
                            <option>4 - 7 years</option>
                            <option>7+ years</option>
                        </select>
                    </div>
                    {/* <!-- Input --> */}
                    <div className="form-group col-lg-6 col-md-12">
                        <label>Offered Salary </label>
                        <span className="required">(required)</span>
                        <span style={{ marginLeft: "1em" }}>
                            <label>
                                <input
                                    type="radio"
                                    name="salaryType"
                                    value="fixed"
                                    checked={salaryType === "fixed"}
                                    onChange={handleSalaryTypeChange}
                                    style={{ marginRight: "0.5em" }}
                                />
                                Exact Amount
                            </label>
                            <label style={{ marginLeft: "2em" }}>
                                <input
                                    type="radio"
                                    name="salaryType"
                                    value="ranged"
                                    checked={salaryType === "ranged"}
                                    onChange={handleSalaryTypeChange}
                                    style={{ marginRight: "0.5em" }}
                                />
                                Ranged
                            </label>
                        </span>
                        {salaryType === "fixed" ? (
                            <input
                                type="text"
                                name="globaluphire-salary"
                                value={jobData.salary}
                                placeholder="$100,000.00"
                                onChange={(e) => {
                                    setJobData((previousState) => ({
                                        ...previousState,
                                        salary: e.target.value,
                                    }));
                                }}
                                required
                            />
                        ) : (
                            <Row>
                                <div className="col-6">
                                    <input
                                        type="text"
                                        name="lowerLimit"
                                        value={lowerLimit}
                                        placeholder="$80,000.00"
                                        onChange={(e) =>
                                            setLowerLimit(e.target.value)
                                        }
                                        required
                                    />
                                    <label>Lower Limit</label>
                                </div>
                                <div className="col-6">
                                    <input
                                        type="text"
                                        name="upperLimit"
                                        value={upperLimit}
                                        placeholder="$120,000.00"
                                        onChange={(e) =>
                                            setUpperLimit(e.target.value)
                                        }
                                        required
                                    />
                                    <label>Upper Limit</label>
                                </div>
                            </Row>
                        )}
                    </div>
                    <div className="form-group col-lg-6 col-md-12">
                        <label>
                            Salary Rate <span className="required">(required)</span>
                        </label>
                        <select
                            className="chosen-single form-select"
                            value={jobData.salaryRate}
                            onChange={(e) => {
                                setJobData((previousState) => ({
                                    ...previousState,
                                    salaryRate: e.target.value,
                                }));
                            }}
                            required
                        >
                            <option>Per hour</option>
                            <option>Per diem</option>
                            <option>Per month</option>
                            <option>Per year</option>
                        </select>
                    </div>
                    <div className="form-group col-lg-6 col-md-12">
                        <label>
                            Education<span className="optional"> (optional)</span>
                        </label>
                        <select
                            className="chosen-single form-select"
                            value={jobData.education}
                            onChange={(e) => {
                                setJobData((previousState) => ({
                                    ...previousState,
                                    education: e.target.value,
                                }));
                            }}
                        >
                            <option></option>
                            <option>Certificate</option>
                            <option>High School</option>
                            <option>Associate Degree</option>
                            <option>Bachelor's Degree</option>
                            <option>Master's Degree</option>
                        </select>
                    </div>
                    {/*
            <div className="form-group col-lg-6 col-md-12">
            <label>Gender</label>
            <select
                className="chosen-single form-select"
                value={gender}
                onChange={(e) => {
                setGender(e.target.value);
                }}
            >
                <option>Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
            </select>
            </div>
    */}
                    {/*
            <div className="form-group col-lg-6 col-md-12">
            <label>Industry</label>
            <select
                className="chosen-single form-select"
                value={industy}
                onChange={(e) => {
                setIndustry(e.target.value);
                }}
            >
                <option>Select</option>
                <option>Banking</option>
                <option>Digital & Creative</option>
                <option>Retail</option>
                <option>Human Resources</option>
                <option>Management</option>
            </select>
            </div>
    */}
                    {/*
            <div className="form-group col-lg-6 col-md-12">
            <label>Qualification</label>
            <select
                className="chosen-single form-select"
                value={qualification}
                onChange={(e) => {
                setQualification(e.target.value);
                }}
            >
                <option>Select</option>
                <option>Banking</option>
                <option>Digital & Creative</option>
                <option>Retail</option>
                <option>Human Resources</option>
                <option>Management</option>
            </select>
            </div>
    */}
                    {/* <!-- Input --> */}
                    {/*
            <div className="form-group col-lg-12 col-md-12">
            <label>Application Deadline Date</label>
            <input
                type="text"
                name="name"
                placeholder="06.04.2020"
                value={deadline}
                onChange={(e) => {
                setDeadline(e.target.value);
                }}
            />
            </div>
    */}
                    {/*
            <div className="form-group col-lg-6 col-md-12">
            <label>City <span className="required">(required)</span></label>
            <input
                type="text"
                name="globaluphire-city"
                required
                value={city}
                onChange={(e) => {
                setCity(e.target.value);
                }}
                placeholder="City"
            />
            </div>
            */}
                    {/* <!-- Input --> */}
                    {/*

            <div className="form-group col-lg-6 col-md-12">
            <label>Country <span className="required">(required)</span></label>
            <select
                className="chosen-single form-select"
                value={country}
                required
                onChange={(e) => {
                setCountry(e.target.value);
                }}
            >
                <option></option>
                <option>Australia</option>
                <option>Pakistan</option>
                <option>USA</option>
                <option>Japan</option>
                <option>India</option>
            </select>
            </div>
    */}

                    {/* <div className="form-group col-lg-12 col-md-12">
            <label>Complete Address <span className="optional">(optional)</span></label>
            <input
                type="text"
                name="globaluphire-address"
                value={completeAddress}
                onChange={(e) => {
                setJobData((previousState) => ({ 
                    ...previousState,
                    completeAddress: e.target.value
                }))
                }}
                placeholder="Address"
            />
            </div> */}

                    <div className="form-group col-lg-12 col-md-12">
                        <label>
                            Facility Name{" "}
                            <span className="required">(required)</span>
                        </label>
                        <Typeahead
                            onChange={setFacilitySingleSelections}
                            id="facilityName"
                            className="form-group"
                            placeholder="Facility Name"
                            options={facilityNames}
                            selected={facilitySingleSelections}
                            required
                        />
                    </div>

                    <div className="form-group col-lg-12 col-md-12">
                        <label>
                            Complete Address{" "}
                            <span className="required">(required)</span>
                        </label>
                        <Typeahead
                            onChange={setSingleSelections}
                            id="completeAddress"
                            className="form-group"
                            placeholder="Address"
                            options={addresses}
                            selected={singleSelections}
                            required
                        />
                    </div>

                    {/* <!-- Input --> */}
                    {/* <div className="form-group col-lg-12 col-md-12">
            <label>City, State <span className="required">(required)</span></label>
            <input
                type="text"
                name="globaluphire-address"
                ref={searchInput}            
                placeholder="City, State"
                required
            />
            </div> */}

                    {/* <!-- Input --> */}
                    {/* <div className="form-group col-lg-6 col-md-12">
            <label>Find On Map</label>
            <input
                type="text"
                name="name"
                placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
            />
            </div> */}
                    {/* <!-- Input --> */}
                    {/* <div className="form-group col-lg-3 col-md-12">
            <label>Latitude</label>
            <input type="text" name="name" placeholder="Melbourne" />
            </div> */}
                    {/* <!-- Input --> */}
                    {/* <div className="form-group col-lg-3 col-md-12">
            <label>Longitude</label>
            <input type="text" name="name" placeholder="Melbourne" />
            </div> */}
                    {/* <!-- Input --> */}
                    {/* <div className="form-group col-lg-12 col-md-12">
            <button className="theme-btn btn-style-three">Search Location</button>
            </div>
            <div className="form-group col-lg-12 col-md-12">
            <div className="map-outer">
                <div style={{ height: "420px", width: "100%" }}>
                <Map />
                </div>
            </div>
            </div> */}
                    {/* <!-- Input --> */}
                    <div className="form-group col-lg-12 col-md-12 text-right">
                        <button
                            className="theme-btn btn-style-one"
                            onClick={(e) => {
                                e.preventDefault();
                                submitJobPost(jobData, setJobData, user);
                            }}
                        >
                            Post
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default AddLR;
