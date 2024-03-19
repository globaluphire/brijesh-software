/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import candidatesData from "../../../../../data/candidates";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../../config/supabaseClient";
import { toast } from "react-toastify";
import { Typeahead } from "react-bootstrap-typeahead";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useSelector } from "react-redux";
import Pagination from "../../../../common/Pagination";
import Table from "react-bootstrap/Table";

const addSearchFilters = {
    name: "",
    jobTitle: "",
};

const LR = () => {
    const router = useRouter();

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedLRdata, setFetchedLRdata] = useState({});

    const [applicationStatus, setApplicationStatus] = useState("");
    const [
        applicationStatusReferenceOptions,
        setApplicationStatusReferenceOptions,
    ] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [applicationId, setApplicationId] = useState("");

    // For Pagination
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [hidePagination, setHidePagination] = useState(false);
    // const [pageSize, setPageSize] = useState(10);

    // for search filters
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const { name, jobTitle, status } = useMemo(
        () => searchFilters,
        [searchFilters]
    );

    // global states
    const facility = useSelector((state) => state.employer.facility.payload);

    const dateFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                }) +
                ", " +
                date.getFullYear()
            );
        }
    };

    // clear all filters
    const clearAll = () => {
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        fetchedAllApplicantsView({ name: "", jobTitle: "" });
    };

    async function findApplicant() {
        // call reference to get applicantStatus options
        // setCurrentPage(1);
        const { data: refData, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "applicantStatus");

        if (refData) {
            setApplicationStatusReferenceOptions(refData);
        }

        let query = supabase
            .from("applicants_view")
            .select("*")
            .eq("status", "Hired");

        if (name) {
            query.ilike("name", "%" + name + "%");
        }
        if (jobTitle) {
            query.ilike("job_title", "%" + jobTitle + "%");
        }
        if (facility) {
            query.ilike("facility_name", "%" + facility + "%");
        }

        // setTotalRecords((await query).data.length);

        let { data, error } = await query.order("hired_date", {
            ascending: false,
            nullsFirst: false,
        });
        // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        // if (facility) {
        //     data = data.filter((i) => i.facility_name === facility);
        // }

        if (data) {
            data.forEach(
                (applicant) =>
                    (applicant.hired_date = dateFormat(applicant.hired_date))
            );
            data.forEach(
                (applicant) =>
                    (applicant.created_at = dateFormat(applicant.created_at))
            );
            setFetchedAllApplicantsData(data);
        }
    }

    async function fetchedLR({ name, jobTitle }) {
        try {
            // call reference to get applicantStatus options
            const { data, error: e } = await supabase
                .from("reference")
                .select("*")
                .eq("ref_nm", "applicantStatus");

            if (data) {
                setApplicationStatusReferenceOptions(data);
            }

            let query = supabase
                .from("lr")
                .select("*")

            // if (name) {
            //     query.ilike("name", "%" + name + "%");
            // }
            // if (jobTitle) {
            //     query.ilike("job_title", "%" + jobTitle + "%");
            // }
            // if (facility) {
            //     query.ilike("facility_name", "%" + facility + "%");
            // }

            // setTotalRecords((await query).data.length);

            let { data: lrData, error } = await query.order(
                "lr_created_date",
                { ascending: false, nullsFirst: false }
            );
            // .range(
            //     (currentPage - 1) * pageSize,
            //     currentPage * pageSize - 1
            // );

            // if (facility) {
            //     allApplicantsView = allApplicantsView.filter(
            //         (i) => i.facility_name === facility
            //     );
            // }

            if (lrData) {
                lrData.forEach(
                    (i) => (i.lr_created_date = dateFormat(i.lr_created_date))
                );
            }

            setFetchedLRdata(lrData);
        } catch (e) {
            toast.error(
                "System is unavailable.  Please try again later or contact tech support!",
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
            console.warn(e);
        }
    }
    // const handlePageChange = (newPage) => {
    //     setCurrentPage(newPage);
    // };

    // function perPageHandler(event) {
    //     setCurrentPage(1);
    //     const selectedValue = JSON.parse(event.target.value);
    //     const end = selectedValue.end;

    //     setPageSize(end);
    // }

    useEffect(() => {
        fetchedLR(searchFilters);
        if (facility) {
            localStorage.setItem("facility", facility);
        } else {
            localStorage.setItem("facility", "");
        }
    }, [
        facility,
        // pageSize,
        // currentPage
    ]);

    const setNoteData = async (applicationId) => {
        // reset NoteText
        setNoteText("");
        setApplicationId("");

        const { data, error } = await supabase
            .from("applicants_view")
            .select("*")
            .eq("application_id", applicationId);

        if (data) {
            setNoteText(data[0].notes);
            setApplicationId(data[0].application_id);
        }
    };

    const ViewCV = async (applicationId) => {
        const { data, error } = await supabase
            .from("applicants_view")
            .select("*")
            .eq("application_id", applicationId);

        if (data) {
            window.open(
                data[0].doc_dwnld_url.slice(14, -2),
                "_blank",
                "noreferrer"
            );
        }
        if (error) {
            toast.error(
                "Error while retrieving CV.  Please try again later or contact tech support!",
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
    };

    const DownloadHandler = async (applicant) => {
        const { data, error } = await supabase
            .from("applicants_view")
            .select("*")
            .eq("application_id", applicant.application_id);

        if (data) {
            const fileName = data[0].doc_dwnld_url.slice(14, -2);
            fetch(fileName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/pdf",
                },
            })
                .then((response) => response.blob())
                .then((blob) => {
                    const url = window.URL.createObjectURL(new Blob([blob]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                });
            // window.open(data[0].doc_dwnld_url.slice(14, -2), '_blank', 'noreferrer');
        }
        if (error) {
            toast.error(
                "Error while retrieving CV.  Please try again later or contact tech support!",
                {
                    position: "bottom-right",
                    autoClose: true,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                }
            );
        }
    };

    const determineBadgeColor = (status) => {
        switch (status?.toLowerCase()) {
            case "sent":
                return { color: "orange", tag: "Sent" };
            case "read":
                return { color: "#87CEEB", tag: "Read" };
            case "completed":
                return { color: "green", tag: "Signed" };
            case "signed":
                return { color: "green", tag: "Signed" };
            default:
                return { color: "red", tag: "Not Sent" };
        }
    };

    const CSVSmartLinx = async (applicant) => {
        fetch("/api/csv", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(applicant),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                toast.success("Sent to SmartLinx!");
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                toast.error(
                    "Error while sending CSV to SmartLinx.  Please try again later or contact tech support!"
                );
                // Handle errors here, such as displaying an error message to the user
            });
    };

    return (
        // <div className="tabs-box">
        //     <div
        //         className="widget-title"
        //         style={{ fontSize: "1.5rem", fontWeight: "500" }}
        //     >
        //         <b>Hired Applicants!</b>
        //     </div>
        //     {applicationStatusReferenceOptions != null ? (
        //         <Form>
        //             <Form.Label
        //                 className="optional"
        //                 style={{
        //                     marginLeft: "32px",
        //                     letterSpacing: "2px",
        //                     fontSize: "12px",
        //                 }}
        //             >
        //                 SEARCH BY
        //             </Form.Label>
        //             <Row className="mx-1" md={4}>
        //                 <Col>
        //                     <Form.Group className="mb-3 mx-3">
        //                         <Form.Label className="chosen-single form-input chosen-container">
        //                             Applicant Name
        //                         </Form.Label>
        //                         <Form.Control
        //                             className="chosen-single form-input chosen-container"
        //                             type="text"
        //                             value={name}
        //                             onChange={(e) => {
        //                                 setSearchFilters((previousState) => ({
        //                                     ...previousState,
        //                                     name: e.target.value,
        //                                 }));
        //                             }}
        //                             onKeyDown={(e) => {
        //                                 if (e.key === "Enter") {
        //                                     findApplicant(searchFilters);
        //                                 }
        //                             }}
        //                             style={{ maxWidth: "300px" }}
        //                         />
        //                     </Form.Group>
        //                 </Col>
        //                 <Col>
        //                     <Form.Group className="mb-3 mx-3">
        //                         <Form.Label className="chosen-single form-input chosen-container">
        //                             Job Title
        //                         </Form.Label>
        //                         <Form.Control
        //                             className="chosen-single form-input chosen-container"
        //                             type="text"
        //                             value={jobTitle}
        //                             onChange={(e) => {
        //                                 setSearchFilters((previousState) => ({
        //                                     ...previousState,
        //                                     jobTitle: e.target.value,
        //                                 }));
        //                             }}
        //                             onKeyDown={(e) => {
        //                                 if (e.key === "Enter") {
        //                                     findApplicant(searchFilters);
        //                                 }
        //                             }}
        //                             style={{ maxWidth: "300px" }}
        //                         />
        //                     </Form.Group>
        //                 </Col>
        //                 {/* <Form.Group
        //                     className="mb-3 mx-3"
        //                     style={{
        //                         width: "20%",
        //                     }}
        //                 >
        //                     <Form.Label className="chosen-single form-input chosen-container">
        //                         Per Page Size
        //                     </Form.Label>
        //                     <Form.Select
        //                         onChange={perPageHandler}
        //                         className="chosen-single form-select"
        //                     >
        //                         <option
        //                             value={JSON.stringify({
        //                                 start: 0,
        //                                 end: 10,
        //                             })}
        //                         >
        //                             10 per page
        //                         </option>
        //                         <option
        //                             value={JSON.stringify({
        //                                 start: 0,
        //                                 end: 20,
        //                             })}
        //                         >
        //                             20 per page
        //                         </option>
        //                         <option
        //                             value={JSON.stringify({
        //                                 start: 0,
        //                                 end: 30,
        //                             })}
        //                         >
        //                             30 per page
        //                         </option>
        //                     </Form.Select>
        //                 </Form.Group> */}
        //             </Row>
        //             <Row className="mx-3">
        //                 <Col>
        //                     <Form.Group className="chosen-single form-input chosen-container mb-3">
        //                         <Button
        //                             variant="primary"
        //                             onClick={(e) => {
        //                                 e.preventDefault();
        //                                 findApplicant(searchFilters);
        //                             }}
        //                             className="btn btn-submit btn-sm text-nowrap m-1"
        //                         >
        //                             Filter
        //                         </Button>
        //                         <Button
        //                             variant="primary"
        //                             onClick={clearAll}
        //                             className="btn btn-secondary btn-sm text-nowrap mx-2"
        //                             style={{
        //                                 minHeight: "40px",
        //                                 padding: "0 20px",
        //                             }}
        //                         >
        //                             Clear
        //                         </Button>
        //                     </Form.Group>
        //                 </Col>
        //             </Row>
        //         </Form>
        //     ) : (
        //         ""
        //     )}
        //     {/* End filter top bar */}

        //     <div
        //         className="optional"
        //         style={{
        //             textAlign: "right",
        //             marginRight: "50px",
        //             marginBottom: "10px",
        //         }}
        //     >
        //         Showing ({fetchedAllApplicants.length}) Applicants Hired
        //         {/* Out of ({totalRecords}) <br /> Page: {currentPage} */}
        //     </div>

        //     {/* Start table widget content */}
        //     <div className="widget-content">
        //         <div className="table-outer">
        //             <Table className="default-table manage-job-table">
        //                 <thead>
        //                     <tr>
        //                         <th>Name</th>
        //                         <th>Applied On</th>
        //                         <th>Hired On</th>
        //                         <th>Job Title</th>
        //                         <th>Facility</th>
        //                         {/* <th>Status</th> */}
        //                         <th>Onboarding Status</th>
        //                         <th>Notes</th>
        //                         <th>Actions</th>
        //                     </tr>
        //                 </thead>
        //                 {fetchedAllApplicants.length === 0 ? (
        //                     <tbody
        //                         style={{
        //                             fontSize: "1.5rem",
        //                             fontWeight: "500",
        //                         }}
        //                     >
        //                         <tr>
        //                             <td>
        //                                 <b>No results found!</b>
        //                             </td>
        //                         </tr>
        //                     </tbody>
        //                 ) : (
        //                     <tbody>
        //                         {Array.from(fetchedAllApplicants).map(
        //                             (applicant) => (
        //                                 <tr key={applicant.application_id}>
        //                                     <td>
        //                                         {/* <!-- Job Block --> */}
        //                                         <div className="job-block">
        //                                             <div>
        //                                                 {/* <span className="company-logo">
        //                                         <img src={item.logo} alt="logo" />
        //                                         </span> */}
        //                                                 <h4>
        //                                                     <Link
        //                                                         href={{
        //                                                             pathname:
        //                                                                 "/employers-dashboard/user-documents",
        //                                                             query: {
        //                                                                 applicationId:
        //                                                                     applicant.application_id,
        //                                                             },
        //                                                         }}
        //                                                         style={{
        //                                                             whiteSpace:
        //                                                                 "nowrap",
        //                                                         }}
        //                                                     >
        //                                                         {applicant.name}
        //                                                     </Link>
        //                                                 </h4>
        //                                             </div>
        //                                         </div>
        //                                     </td>
        //                                     <td>
        //                                         {/* <Link href="/employers-dashboard/all-applicants/${item.job_id}">3+ Applied</Link> */}
        //                                         <span>
        //                                             {applicant.created_at}
        //                                         </span>
        //                                     </td>
        //                                     <td>
        //                                         {applicant.hired_date ? (
        //                                             <span>
        //                                                 {applicant.hired_date}
        //                                             </span>
        //                                         ) : (
        //                                             <span>-</span>
        //                                         )}
        //                                     </td>
        //                                     <td>{applicant.job_title}</td>
        //                                     <td>{applicant.facility_name}</td>
        //                                     {/* <td>
        //                                         <select
        //                                             className="chosen-single form-select"
        //                                             value={applicant.status}
        //                                             disabled
        //                                         >
        //                                             {applicationStatusReferenceOptions.map(
        //                                                 (option) => (
        //                                                     <option
        //                                                         value={
        //                                                             option.ref_dspl
        //                                                         }
        //                                                     >
        //                                                         {
        //                                                             option.ref_dspl
        //                                                         }
        //                                                     </option>
        //                                                 )
        //                                             )}
        //                                         </select>
        //                                     </td> */}
        //                                     <td>
        //                                         <div
        //                                             className="badge"
        //                                             style={{
        //                                                 backgroundColor:
        //                                                     determineBadgeColor(
        //                                                         applicant.onboarding_status
        //                                                     ).color,
        //                                                 margin: "auto",
        //                                             }}
        //                                         >
        //                                             {
        //                                                 determineBadgeColor(
        //                                                     applicant.onboarding_status
        //                                                 ).tag
        //                                             }
        //                                         </div>
        //                                     </td>
        //                                     <td>
        //                                         <ul className="option-list">
        //                                             {applicant.notes ? (
        //                                                 <li>
        //                                                     <button data-text="Add, View, Edit, Delete Notes">
        //                                                         <a
        //                                                             href="#"
        //                                                             data-bs-toggle="modal"
        //                                                             data-bs-target="#addNoteModal"
        //                                                             onClick={() => {
        //                                                                 setNoteData(
        //                                                                     applicant.application_id
        //                                                                 );
        //                                                             }}
        //                                                         >
        //                                                             <span className="la la-comment-dots"></span>
        //                                                         </a>
        //                                                     </button>
        //                                                 </li>
        //                                             ) : (
        //                                                 <li>
        //                                                     <button data-text="Add, View, Edit, Delete Notes">
        //                                                         <a
        //                                                             href="#"
        //                                                             data-bs-toggle="modal"
        //                                                             data-bs-target="#addNoteModal"
        //                                                             onClick={() => {
        //                                                                 setNoteData(
        //                                                                     applicant.application_id
        //                                                                 );
        //                                                             }}
        //                                                         >
        //                                                             <span className="la la-comment-alt"></span>
        //                                                         </a>
        //                                                     </button>
        //                                                 </li>
        //                                             )}
        //                                         </ul>
        //                                     </td>
        //                                     <td>
        //                                         <div className="option-box">
        //                                             <ul className="option-list">
        //                                                 <li
        //                                                     onClick={() => {
        //                                                         ViewCV(
        //                                                             applicant.application_id
        //                                                         );
        //                                                     }}
        //                                                 >
        //                                                     <button data-text="View CV">
        //                                                         <span className="la la-file-download"></span>
        //                                                     </button>
        //                                                 </li>
        //                                                 {/* <li
        //                                                     onClick={() => {
        //                                                         CSVSmartLinx(
        //                                                             applicant
        //                                                         );
        //                                                     }}
        //                                                 >
        //                                                     <button data-text="Transfer To Smartlinx">
        //                                                         <span className="la la-file-csv"></span>
        //                                                     </button>
        //                                                 </li> */}
        //                                                 <li
        //                                                     onClick={() =>
        //                                                         DownloadHandler(
        //                                                             applicant
        //                                                         )
        //                                                     }
        //                                                 >
        //                                                     <button data-text="Download CV">
        //                                                         <span className="la la-download"></span>
        //                                                     </button>
        //                                                 </li>
        //                                                 {/* <li onClick={()=>{ Qualified(applicant.application_id, applicant.status) }} >
        //                                             <button data-text="Qualified">
        //                                             <span className="la la-check"></span>
        //                                             </button>
        //                                         </li>
        //                                         <li onClick={()=>{ NotQualified(applicant.application_id, applicant.status) }} >
        //                                             <button data-text="Not Qualified">
        //                                             <span className="la la-times-circle"></span>
        //                                             </button>
        //                                         </li>
        //                                         <li onClick={()=>{ ResetStatus(applicant.application_id, applicant.status) }} >
        //                                             <button data-text="Reset Status">
        //                                             <span className="la la-undo-alt"></span>
        //                                             </button>
        //                                         </li> */}
        //                                             </ul>
        //                                         </div>
        //                                     </td>
        //                                 </tr>
        //                             )
        //                         )}
        //                     </tbody>
        //                 )}
        //             </Table>

        //             {/* Add Notes Modal Popup */}
        //             <div
        //                 className="modal fade"
        //                 id="addNoteModal"
        //                 tabIndex="-1"
        //                 aria-hidden="true"
        //             >
        //                 <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        //                     <div className="apply-modal-content modal-content">
        //                         <div className="text-center">
        //                             <h3 className="title">Add Notes</h3>
        //                             <button
        //                                 type="button"
        //                                 id="notesCloseButton"
        //                                 className="closed-modal"
        //                                 data-bs-dismiss="modal"
        //                                 aria-label="Close"
        //                             ></button>
        //                         </div>
        //                         {/* End modal-header */}
        //                         <form>
        //                             <textarea
        //                                 value={noteText}
        //                                 id="notes"
        //                                 cols="45"
        //                                 rows="10"
        //                                 onChange={(e) => {
        //                                     setNoteText(e.target.value);
        //                                 }}
        //                                 style={{
        //                                     resize: "vertical",
        //                                     overflowY: "scroll",
        //                                     border: "1px solid #ccc",
        //                                     padding: "10px",
        //                                 }}
        //                             ></textarea>
        //                             <br />
        //                         </form>
        //                         {/* End PrivateMessageBox */}
        //                     </div>
        //                     {/* End .send-private-message-wrapper */}
        //                 </div>
        //             </div>
        //             {/* {!hidePagination ? (
        //                 <Pagination
        //                     currentPage={currentPage}
        //                     totalRecords={totalRecords}
        //                     pageSize={pageSize}
        //                     onPageChange={handlePageChange}
        //                 />
        //             ) : null} */}
        //         </div>
        //     </div>
        //     {/* End table widget content */}
        // </div>
        <>
            <div>
                <div
                    className="widget-title"
                    style={{ fontSize: "1.5rem", fontWeight: "500" }}
                >
                    <b>All LRs!</b>
                </div>
                <Form>
                    <Form.Label
                        className="optional"
                        style={{
                            marginLeft: "32px",
                            letterSpacing: "2px",
                            fontSize: "12px",
                        }}
                    >
                        SEARCH BY
                    </Form.Label>
                    <Row className="mx-1" md={4}>
                        <Col>
                            <Form.Group className="mb-3 mx-3">
                                <Form.Label className="chosen-single form-input chosen-container">
                                    Applicant Name
                                </Form.Label>
                                <Form.Control
                                    className="chosen-single form-input chosen-container"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setSearchFilters((previousState) => ({
                                            ...previousState,
                                            name: e.target.value,
                                        }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            findApplicant(searchFilters);
                                        }
                                    }}
                                    style={{ maxWidth: "300px" }}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3 mx-3">
                                <Form.Label className="chosen-single form-input chosen-container">
                                    Job Title
                                </Form.Label>
                                <Form.Control
                                    className="chosen-single form-input chosen-container"
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => {
                                        setSearchFilters((previousState) => ({
                                            ...previousState,
                                            jobTitle: e.target.value,
                                        }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            findApplicant(searchFilters);
                                        }
                                    }}
                                    style={{ maxWidth: "300px" }}
                                />
                            </Form.Group>
                        </Col>
                        {/* <Form.Group
                            className="mb-3 mx-3"
                            style={{
                                width: "20%",
                            }}
                        >
                            <Form.Label className="chosen-single form-input chosen-container">
                                Per Page Size
                            </Form.Label>
                            <Form.Select
                                onChange={perPageHandler}
                                className="chosen-single form-select"
                            >
                                <option
                                    value={JSON.stringify({
                                        start: 0,
                                        end: 10,
                                    })}
                                >
                                    10 per page
                                </option>
                                <option
                                    value={JSON.stringify({
                                        start: 0,
                                        end: 20,
                                    })}
                                >
                                    20 per page
                                </option>
                                <option
                                    value={JSON.stringify({
                                        start: 0,
                                        end: 30,
                                    })}
                                >
                                    30 per page
                                </option>
                            </Form.Select>
                        </Form.Group> */}
                    </Row>
                    <Row className="mx-3">
                        <Col>
                            <Form.Group className="chosen-single form-input chosen-container mb-3">
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        findApplicant(searchFilters);
                                    }}
                                    className="btn btn-submit btn-sm text-nowrap m-1"
                                >
                                    Filter
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={clearAll}
                                    className="btn btn-secondary btn-sm text-nowrap mx-2"
                                    style={{
                                        minHeight: "40px",
                                        padding: "0 20px"
                                    }}
                                >
                                    Clear
                                </Button>
                            </Form.Group>
                        </Col>
                        <Col style={{ display: "relative", textAlign: "right" }}>
                            <Form.Group className="chosen-single form-input chosen-container mb-3">
                                <Button
                                    variant="success"
                                    onClick={() => Router.push("/employers-dashboard/add-lr")}
                                    className="btn btn-add-lr btn-sm text-nowrap m-1"
                                >
                                    Add LR
                                </Button>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
                {/* End filter top bar */}

                <div
                    className="optional"
                    style={{
                        textAlign: "right",
                        marginRight: "50px",
                        marginBottom: "10px",
                    }}
                >
                    Showing ({fetchedLRdata.length}) LR(s)
                    {/* Out of ({totalRecords}) <br /> Page: {currentPage} */}
                </div>

            </div>
            {/* Start table widget content */}
            <div className="widget-content">
                <div className="table-outer">
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>LR No</th>
                                <th>LR Date</th>
                                <th>Order No</th>
                                <th>Consignor</th>
                                <th>Consignee</th>
                                <th>Pickup Point</th>
                                <th>Drop Point</th>
                                <th>Item</th>
                                <th>Weight(Kg)</th>
                                <th>Truck No</th>
                                <th>Driver Details</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        {fetchedLRdata.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr>
                                    <td>
                                        <b>No LR found!</b>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedLRdata).map(
                                    (lr) => (
                                        <tr key={lr.id}>
                                            <td>
                                            <td>
                                                <ui>
                                                    <li>
                                                        <a onClick={() => router.push(`/employers-dashboard/view-lr/${lr.id}`)}>
                                                            <i className="la la-print" title="Print LR"></i>
                                                        </a>
                                                    </li>
                                                </ui>
                                            </td>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.lr_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.lr_created_date}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.order_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.consigner}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.consignee}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.pickup_point}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.drop_point}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.item}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.weight}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.truck_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.driver}
                                                </span>
                                            </td>
                                            <td>
                                                {
                                                    lr.status == "Final" ? (
                                                        <span style={{ color: "green" }}>
                                                            {lr.status}
                                                        </span>
                                                    ) : lr.status == "Performa" ? (
                                                            <span style={{ color: "darkorange" }}>
                                                                {lr.status}
                                                            </span>
                                                    ) : <span>-</span>
                                                }
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        )}
                    </Table>
                </div>
            </div>
            {/* End table widget content */}
        </>
    );
};

export default LR;
