/* eslint-disable no-unused-vars */
import Link from "next/link.js";
import { supabase } from "../../../../../config/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";

const addSearchFilters = {
    jobTitle: "",
    jobType: "",
    status: "",
};

const JobListingsTable = () => {
    const [applications, setApplications] = useState([]);

    // for search filters
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const { jobTitle, jobType, status } = useMemo(
        () => searchFilters,
        [searchFilters]
    );
    const [
        applicationStatusReferenceOptions,
        setApplicationStatusReferenceOptions,
    ] = useState(null);

    const user = useSelector((state) => state.candidate.user);

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
        fetchApplications();
    };

    const ViewCV = async (applicationId) => {
        const { data, error } = await supabase
            .from("candidate_view")
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

    async function findAppliedJob({ jobTitle, jobType, status }) {
        const { data, error } = await supabase
            .from("candidate_view")
            .select()
            .eq("user_id", user.id)
            .ilike("job_title", "%" + jobTitle + "%")
            .ilike("job_type", "%" + jobType + "%")
            .ilike("status", "%" + status + "%")
            .order("created_at", { ascending: false });

        if (data) {
            data.forEach(
                (job) => (job.created_at = dateFormat(job.created_at))
            );
            setApplications(data);
        }
    }

    const fetchApplications = async () => {
        // call reference to get applicantStatus options
        const { data, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "applicantStatus");
        if (data) {
            setApplicationStatusReferenceOptions(data);
        }

        const { data: applications, error } = await supabase
            .from("candidate_view")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (applications) {
            applications.forEach(
                (i) => (i.created_at = dateFormat(i.created_at))
            );
            setApplications(applications);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="tabs-box">
            <div
                className="widget-title"
                style={{ fontSize: "1.5rem", fontWeight: "500" }}
            >
                <b>My Applied Jobs!</b>
            </div>
            {applicationStatusReferenceOptions != null ? (
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
                        <Col>
                            <Form.Group className="mb-3 mx-3">
                                <Form.Label className="chosen-single form-input chosen-container">
                                    Job Type
                                </Form.Label>
                                <Form.Select
                                    className="chosen-single form-select"
                                    onChange={(e) => {
                                        setSearchFilters((previousState) => ({
                                            ...previousState,
                                            jobType: e.target.value,
                                        }));
                                    }}
                                    value={jobType}
                                    style={{ maxWidth: "300px" }}
                                >
                                    <option value=""></option>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Both">Both</option>
                                    <option value="PRN">PRN</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mx-3">
                        <Col>
                            <Form.Group className="chosen-single form-input chosen-container mb-3">
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        findAppliedJob(searchFilters);
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

            <div
                className="optional"
                style={{
                    textAlign: "right",
                    marginRight: "50px",
                    marginBottom: "10px",
                }}
            >
                Showing ({applications.length}) Jobs Applied
            </div>

            {/* Start table widget content */}
            <div className="widget-content">
                <div className="table-outer">
                    <div className="table-outer">
                        <table className="default-table manage-job-table">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Location</th>
                                    <th>Job Type</th>
                                    <th>Date Applied</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                    {/* <th>Action</th> */}
                                </tr>
                            </thead>

                            {applications.length === 0 ? (
                                <tbody
                                    style={{
                                        fontSize: "1.5rem",
                                        fontWeight: "500",
                                    }}
                                >
                                    <tr>
                                        <td>
                                            <b>No Applied Job(s)!</b>
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                    {applications.map((item) => (
                                        <tr key={item.application_id}>
                                            <td>
                                                {/* <!-- Job Block --> */}
                                                <div className="job-block">
                                                    {/* <span className="company-logo">
                                  <img src={item.logo} alt="logo" />
                                </span> */}
                                                    <h4>
                                                        <Link
                                                            href={`/job/${item.job_id}`}
                                                        >
                                                            {item.job_title}
                                                        </Link>
                                                    </h4>
                                                </div>
                                            </td>
                                            <td>{item.job_comp_add}</td>
                                            <td>{item.job_type}</td>
                                            <td>{item.created_at}</td>
                                            {item.status === "Qualified" ? (
                                                <td className="status">
                                                    {item.status}
                                                </td>
                                            ) : item.status ===
                                              "Not Qualified" ? (
                                                    <td
                                                        className="status"
                                                        style={{ color: "red" }}
                                                    >
                                                        {item.status}
                                                    </td>
                                                ) : item.status == null ? (
                                                    <td className="pending">
                                                    Pending
                                                    </td>
                                                ) : (
                                                    <td className="pending">
                                                        {item.status}
                                                    </td>
                                                )}
                                            <td>
                                                <div className="option-box">
                                                    <ul className="option-list">
                                                        <li
                                                            onClick={() => {
                                                                ViewCV(
                                                                    item.application_id
                                                                );
                                                            }}
                                                        >
                                                            <button data-text="View/Download CV">
                                                                <span className="la la-file-download"></span>
                                                            </button>
                                                        </li>
                                                        {/* <li>
                                <button data-text="Delete Aplication">
                                  <span className="la la-trash"></span>
                                </button>
                              </li> */}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobListingsTable;
