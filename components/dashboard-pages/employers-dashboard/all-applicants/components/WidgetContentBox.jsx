/* eslint-disable prefer-const */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import candidatesData from "../../../../../data/candidates";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "../../../../../config/supabaseClient";
import { toast } from "react-toastify";
import Applicants from "./Applicants";
import { Typeahead } from "react-bootstrap-typeahead";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Table } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import "react-chat-elements/dist/main.css";
import CommunicationModal from "./communicationModal";
import Pagination from "../../../../common/Pagination";

const addSearchFilters = {
    name: "",
    jobTitle: "",
    status: "",
};

const WidgetContentBox = () => {
    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    // const [searchField, setSearchField] = useState('');
    const [applicationStatus, setApplicationStatus] = useState("");
    const [
        applicationStatusReferenceOptions,
        setApplicationStatusReferenceOptions,
    ] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [applicationId, setApplicationId] = useState("");
    const [filterByNewMessage, setFilterByNewMessage] = useState(false);
    const [newMessageDot, setNewMessageDot] = useState(false);

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

    // selected applicant for sms/mail modal
    const [selectedApplicant, setSelectedApplicant] = useState();

    const [isCommunicationModalOpen, setIsCommunicationModalOpen] =
        useState(false);

    // async function getOrgId() {
    //   const { data, error } = await supabase
    //     .from("org")
    //     .select("*")
    //   return data[0].org_id
    // }

    async function updateApplicationStatus(
        applicationStatus,
        selectedApplicant
    ) {
        // save updated applicant status
        if (applicationStatus === "Hired") {
            // generate emp id

            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            const { data, error } = await supabase
                .from("sys_key")
                .select("sys_seq_nbr")
                .eq("tbl_nm", "applications");

            const seq_nbr = data[0].sys_seq_nbr + 1;

            const empID =
                selectedApplicant.facility_id +
                "" +
                month +
                "" +
                year.toString().substring(2) +
                "" +
                seq_nbr;
            await supabase
                .from("applications")
                .update({
                    status: applicationStatus,
                    hired_date: today,
                    emp_id: empID,
                })
                .eq("application_id", selectedApplicant.application_id);

            await supabase.rpc("increment_sys_key", {
                x: 1,
                tablename: "applications",
            });
        } else {
            await supabase
                .from("applications")
                .update({ status: applicationStatus })
                .eq("application_id", selectedApplicant.application_id);
        }
        await supabase.rpc("increment", {
            x: 1,
            row_id: selectedApplicant.application_id,
        });

        // this will prevent the page to keep filtered if have any search filters set
        let { data, error } = await supabase
            .from("applicants_view")
            .select("*")
            .neq("status", "Rejection")
            .neq("status", "Hired")
            .neq("status", "Withdraw")
            .ilike("name", "%" + name + "%")
            .ilike("job_title", "%" + jobTitle + "%")
            .ilike("status", "%" + status + "%")
            .order("created_at", { ascending: false });
        // For pagination uncomment this line
        // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        if (facility) {
            data = data.filter((i) => i.facility_name === facility);
        }

        if (data) {
            data.forEach(
                (applicant) =>
                    (applicant.created_at = dateFormat(applicant.created_at))
            );
            setFetchedAllApplicantsData(data);
        }
    }

    const dateFormat = (val) => {
        const date = new Date(val);
        return (
            date.toLocaleDateString("en-IN", {
                month: "long",
                day: "numeric",
            }) +
            ", " +
            date.getFullYear()
        );
    };

    // clear all filters
    const clearAll = () => {
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        fetchedAllApplicantsView({ name: "", jobTitle: "", status: "" });
    };

    async function findApplicant({ name, jobTitle, status }) {
        // setCurrentPage(1);

        let query = supabase
            .from("applicants_view")
            .select("*")
            .neq("status", "Rejection")
            .neq("status", "Hired")
            .neq("status", "Withdraw")
            .ilike("name", "%" + name + "%")
            .ilike("job_title", "%" + jobTitle + "%")
            .ilike("status", "%" + status + "%");

        if (facility) {
            query.ilike("facility_name", "%" + facility + "%");
        }

        // setTotalRecords((await query).data.length);

        let { data, error } = await query.order("created_at", {
            ascending: false,
        });
        // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        if (data) {
            data.forEach(
                (applicant) =>
                    (applicant.created_at = dateFormat(applicant.created_at))
            );

            // if (facility) {
            //     data = data.filter((i) => i.facility_name === facility);
            // }

            setFetchedAllApplicantsData(data);
        }
    }

    const toggleNewMessageFilter = () => {
        setFilterByNewMessage(!filterByNewMessage);
    };

    async function newMessageFilter() {
        try {
            let query = supabase
                .from("applicants_view")
                .select("*")
                .neq("status", "Rejection")
                .neq("status", "Hired")
                .neq("status", "Withdraw");

            if (name) {
                query.ilike("name", "%" + name + "%");
            }
            if (jobTitle) {
                query.ilike("job_title", "%" + jobTitle + "%");
            }
            if (status) {
                query.ilike("status", "%" + status + "%");
            }
            if (facility) {
                query.ilike("facility_name", "%" + facility + "%");
            }

            // setTotalRecords((await query).data.length);

            // eslint-disable-next-line prefer-const
            let { data, error } = await query
                .order("last_contacted_at", { ascending: true })
                .order("created_at", { ascending: false });
            // .range(
            //     (currentPage - 1) * pageSize,
            //     currentPage * pageSize - 1
            // );

            data.sort((a, b) => {
                if (b.last_contacted_at && a.last_contacted_at) {
                    return (
                        new Date(b.last_contacted_at) -
                        new Date(a.last_contacted_at)
                    );
                } else if (b.last_contacted_at) {
                    return 1;
                } else if (a.last_contacted_at) {
                    return -1;
                }

                return new Date(b.created_at) - new Date(a.created_at);
            });

            data.forEach(
                (applicant) =>
                    (applicant.created_at = dateFormat(applicant.created_at))
            );

            setFetchedAllApplicantsData(data);
        } catch (error) {
            console.log(error);
        }
    }

    // useEffect(() => {}, [filterByNewMessage, pageSize, currentPage]);

    async function fetchedAllApplicantsView({ name, jobTitle, status }) {
        try {
            const localSearchFilters = localStorage.getItem("status");

            // call reference to get applicantStatus options
            const { data, error: e } = await supabase
                .from("reference")
                .select("*")
                .eq("ref_nm", "applicantStatus");

            if (data) {
                setApplicationStatusReferenceOptions(data);
            }
            let query = supabase
                .from("applicants_view")
                .select("*")
                .neq("status", "Rejection")
                .neq("status", "Hired")
                .neq("status", "Withdraw");

            if (name) {
                query.ilike("name", "%" + name + "%");
            }
            if (jobTitle) {
                query.ilike("job_title", "%" + jobTitle + "%");
            }
            if (status) {
                query.ilike("status", "%" + status + "%");
            }
            if (facility) {
                query.ilike("facility_name", "%" + facility + "%");
            }

            // setTotalRecords((await query).data.length);

            let { data: allApplicantsView, error } = await query.order(
                "created_at",
                { ascending: false }
            );
            // .range(
            //     (currentPage - 1) * pageSize,
            //     currentPage * pageSize - 1
            // );

            setNewMessageDot(
                data.some((el) => el.new_message_received === true)
            );

            setNewMessageDot(
                data.some((el) => el.new_message_received === true)
            );

            // allApplicantsView.sort((a, b) => {
            //     if (!a.last_contacted_at && b.last_contacted_at) {
            //         return 1;
            //     } else if (a.last_contacted_at && !b.last_contacted_at) {
            //         return -1;
            //     } else if (!a.last_contacted_at && !b.last_contacted_at) {
            //         return 0;
            //     }
            //     return (
            //         new Date(b.last_contacted_at) -
            //         new Date(a.last_contacted_at)
            //     );
            // });

            if (localSearchFilters) {
                setSearchFilters((previousState) => ({
                    ...previousState,
                    status: localSearchFilters,
                }));
                allApplicantsView = allApplicantsView.filter(
                    (i) => i.status === localSearchFilters
                );
                localStorage.removeItem("status");
            }

            // if (facility) {
            //     allApplicantsView = allApplicantsView.filter(
            //         (i) => i.facility_name === facility
            //     );
            // }

            if (allApplicantsView) {
                allApplicantsView.forEach(
                    (i) => (i.created_at = dateFormat(i.created_at))
                );
                setFetchedAllApplicantsData(allApplicantsView);
            }
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

    useEffect(() => {
        if (filterByNewMessage) {
            newMessageFilter();
        } else {
            fetchedAllApplicantsView(searchFilters);
        }
        if (facility) {
            localStorage.setItem("facility", facility);
        } else {
            localStorage.setItem("facility", "");
        }
    }, [
        filterByNewMessage,
        facility,
        // currentPage,
        // pageSize
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

    const addNotes = async () => {
        await supabase
            .from("applications")
            .update({
                notes: noteText,
            })
            .eq("application_id", applicationId);

        await supabase.rpc("increment", { x: 1, row_id: applicationId });

        // open toast
        toast.success("Applicant notes has been saved!", {
            position: "bottom-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });

        // fetching for refresh the data
        // fetchedAllApplicantsView();

        // close popup
        document.getElementById("notesCloseButton").click();

        // reset NoteText
        setNoteText("");
        setApplicationId("");
    };

    const sendSms = async (content, recipient) => {
        try {
            const response = await fetch("/api/sms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content,
                    recipient,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error("Failed to send SMS");
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!isCommunicationModalOpen) {
            fetchedAllApplicantsView(searchFilters);
        }
    }, [isCommunicationModalOpen]);

    // const handlePageChange = (newPage) => {
    //     setCurrentPage(newPage);
    // };

    // function perPageHandler(event) {
    //     setCurrentPage(1);
    //     const selectedValue = JSON.parse(event.target.value);
    //     const end = selectedValue.end;

    //     setPageSize(end);
    // }

    return (
        <div className="tabs-box">
            <div
                className="widget-title"
                style={{ fontSize: "1.5rem", fontWeight: "500" }}
            >
                <b>All Applicants!</b>
            </div>
            {applicationStatusReferenceOptions != null ? (
                <Form>
                    <Form.Label
                        className="optional"
                        style={{
                            marginLeft: "24px",
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
                        <Col>
                            <Form.Group className="mb-3 mx-3">
                                <Form.Label className="chosen-single form-input chosen-container">
                                    Applicant Status
                                </Form.Label>
                                <Form.Select
                                    className="chosen-single form-select"
                                    onChange={(e) => {
                                        setSearchFilters((previousState) => ({
                                            ...previousState,
                                            status: e.target.value,
                                        }));
                                    }}
                                    value={status}
                                    style={{ maxWidth: "300px" }}
                                >
                                    <option value=""></option>
                                    {applicationStatusReferenceOptions.map(
                                        (option) => (
                                            <option value={option.ref_dspl}>
                                                {option.ref_dspl}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        findApplicant(searchFilters);
                                    }}
                                    className="btn btn-sm text-nowrap m-1 btn-submit"
                                >
                                    Filter
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={clearAll}
                                    className="btn btn-secondary btn-sm text-nowrap mx-2"
                                    style={{
                                        minHeight: "40px",
                                        padding: "0 20px",
                                    }}
                                >
                                    Clear
                                </Button>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            ) : (
                ""
            )}
            {/* End filter top bar */}
            {/* Start table widget content */}
            <div
                className="optional"
                style={{
                    textAlign: "right",
                    marginRight: "50px",
                    marginBottom: "10px",
                }}
            >
                Showing ({fetchedAllApplicants.length}) Applicants Applied
                {/* Out of ({totalRecords}) <br /> Page: {currentPage} */}
            </div>
            <div className="widget-content">
                <div className="table-outer">
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Applied On</th>
                                <th>Job Title</th>
                                <th>Facility</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>
                                    Last Contacted{" "}
                                    <button
                                        id="new-filter-button"
                                        onClick={() => {
                                            toggleNewMessageFilter();
                                        }}
                                    >
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 150 130"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M0 0H75.8844H150L94.3396 39.4333V130H76.8868H59.9057V39.4333L0 0Z"
                                                fill={
                                                    filterByNewMessage
                                                        ? "#f9ab00"
                                                        : "#004f8d"
                                                }
                                            />
                                        </svg>
                                        {newMessageDot ? (
                                            <svg
                                                width="11"
                                                height="11"
                                                viewBox="0 0 70 70"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                style={{ right: "20px" }}
                                            >
                                                <circle
                                                    cx="35"
                                                    cy="35"
                                                    r="35"
                                                    fill="green"
                                                />
                                            </svg>
                                        ) : (
                                            ""
                                        )}
                                    </button>
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        {fetchedAllApplicants.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr>
                                    <td>
                                        <b>No results found!</b>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedAllApplicants).map(
                                    (applicant) => (
                                        <tr key={applicant.application_id}>
                                            <td>
                                                {/* <!-- Job Block --> */}
                                                <div className="job-block">
                                                    <div>
                                                        {/* <span className="company-logo">
                                                <img src={item.logo} alt="logo" />
                                                </span> */}
                                                        <h4>
                                                            {/* <Link href={`/employers-dashboard/edit-job/${applicant.user_id}`}>
                                                    {applicant.name}
                                                </Link> */}
                                                            {applicant.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {/* <Link href="/employers-dashboard/all-applicants/${item.job_id}">3+ Applied</Link> */}
                                                <span>
                                                    {applicant.created_at}
                                                </span>
                                            </td>
                                            <td>{applicant.job_title}</td>
                                            <td>{applicant.facility_name}</td>
                                            <td>
                                                <select
                                                    className="chosen-single form-select"
                                                    value={applicant.status}
                                                    onChange={(e) => {
                                                        updateApplicationStatus(
                                                            e.target.value,
                                                            applicant
                                                        );
                                                    }}
                                                >
                                                    {applicationStatusReferenceOptions.map(
                                                        (option) => (
                                                            <option
                                                                value={
                                                                    option.ref_dspl
                                                                }
                                                            >
                                                                {
                                                                    option.ref_dspl
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </td>
                                            <td>
                                                <ul className="option-list">
                                                    {applicant.notes ? (
                                                        <li>
                                                            <button data-text="Add, View, Edit, Delete Notes">
                                                                <a
                                                                    href="#"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#addNoteModal"
                                                                    onClick={() => {
                                                                        setNoteData(
                                                                            applicant.application_id
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="la la-comment-dots"></span>
                                                                </a>
                                                            </button>
                                                        </li>
                                                    ) : (
                                                        <li>
                                                            <button data-text="Add, View, Edit, Delete Notes">
                                                                <a
                                                                    href="#"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#addNoteModal"
                                                                    onClick={() => {
                                                                        setNoteData(
                                                                            applicant.application_id
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="la la-comment-alt"></span>
                                                                </a>
                                                            </button>
                                                        </li>
                                                    )}
                                                </ul>
                                            </td>
                                            <td>
                                                <ul className="option-list">
                                                    <li>
                                                        <button data-text="Send Message">
                                                            <a
                                                                href="#"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#communication-modal"
                                                                onClick={() => {
                                                                    applicant.new_message_received = false;
                                                                    setSelectedApplicant(
                                                                        applicant
                                                                    );
                                                                    setIsCommunicationModalOpen(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <span className="flaticon-chat"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        {applicant?.last_contacted_at ? (
                                                            applicant?.new_message_received ? (
                                                                <strong>
                                                                    {new Date(
                                                                        applicant?.last_contacted_at
                                                                    ).toLocaleString()}
                                                                </strong>
                                                            ) : (
                                                                <div
                                                                    style={{
                                                                        textDecoration:
                                                                            "underline",
                                                                    }}
                                                                >
                                                                    {new Date(
                                                                        applicant?.last_contacted_at
                                                                    ).toLocaleString()}
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div
                                                                style={{
                                                                    textDecoration:
                                                                        "underline",
                                                                }}
                                                            >
                                                                No contact yet
                                                            </div>
                                                        )}
                                                    </li>
                                                    <li>
                                                        {applicant?.new_message_received ? (
                                                            <>
                                                                <div
                                                                    className="badge"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "green",
                                                                    }}
                                                                >
                                                                    New Message
                                                                </div>
                                                            </>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </li>
                                                </ul>
                                            </td>
                                            <td>
                                                <div className="option-box">
                                                    <ul className="option-list">
                                                        <li
                                                            onClick={() => {
                                                                ViewCV(
                                                                    applicant.application_id
                                                                );
                                                            }}
                                                        >
                                                            <button data-text="View CV">
                                                                <span className="la la-file-download"></span>
                                                            </button>
                                                        </li>
                                                        <li
                                                            onClick={() =>
                                                                DownloadHandler(
                                                                    applicant
                                                                )
                                                            }
                                                        >
                                                            <button data-text="Download CV">
                                                                <span className="la la-download"></span>
                                                            </button>
                                                        </li>
                                                        {/* <li onClick={()=>{ Qualified(applicant.application_id, applicant.status) }} >
                                                    <button data-text="Qualified">
                                                    <span className="la la-check"></span>
                                                    </button>
                                                </li>
                                                <li onClick={()=>{ NotQualified(applicant.application_id, applicant.status) }} >
                                                    <button data-text="Not Qualified">
                                                    <span className="la la-times-circle"></span>
                                                    </button>
                                                </li>
                                                <li onClick={()=>{ ResetStatus(applicant.application_id, applicant.status) }} >
                                                    <button data-text="Reset Status">
                                                    <span className="la la-undo-alt"></span>
                                                    </button>
                                                </li> */}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        )}
                    </Table>
                    {/* Add Notes Modal Popup */}
                    <div
                        className="modal fade"
                        id="addNoteModal"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="apply-modal-content modal-content">
                                <div className="text-center">
                                    <h3 className="title">Add Notes</h3>
                                    <button
                                        type="button"
                                        id="notesCloseButton"
                                        className="closed-modal"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                {/* End modal-header */}
                                <form>
                                    <textarea
                                        value={noteText}
                                        id="notes"
                                        cols="45"
                                        rows="10"
                                        onChange={(e) => {
                                            setNoteText(e.target.value);
                                        }}
                                        style={{
                                            resize: "vertical",
                                            overflowY: "scroll",
                                            border: "1px solid #ccc",
                                            padding: "10px",
                                        }}
                                    ></textarea>
                                    <br />
                                    <div className="form-group text-center">
                                        <button
                                            className="theme-btn btn-style-one"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addNotes();
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                                {/* End PrivateMessageBox */}
                            </div>
                            {/* End .send-private-message-wrapper */}
                        </div>
                    </div>
                    {/* Send SMS/Email Modal Popup */}
                    <CommunicationModal
                        applicantData={selectedApplicant}
                        setIsCommunicationModalOpen={
                            setIsCommunicationModalOpen
                        }
                    />
                    {/* {!hidePagination ? (
                        <Pagination
                            currentPage={currentPage}
                            totalRecords={totalRecords}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                        />
                    ) : null} */}
                </div>
            </div>
            {/* End table widget content */}
        </div>
    );
};

export default WidgetContentBox;
