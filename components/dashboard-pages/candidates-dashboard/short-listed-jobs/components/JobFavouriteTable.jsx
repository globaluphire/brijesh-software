/* eslint-disable no-unused-vars */
import Link from "next/link.js";
import jobs from "../../../../../data/job-featured.js";
import { supabase } from "../../../../../config/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Table } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import Button from "react-bootstrap/Button";
import { useRouter } from "next/router.js";
import { ToastContainer, toast } from "react-toastify";

const addSearchFilters = {
    jobTitle: "",
    jobType: "",
};

const JobFavouriteTable = () => {
    const [shortlistedJobs, setShortlistedJobs] = useState([]);

    // for search filters
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const { jobTitle, jobType } = useMemo(() => searchFilters, [searchFilters]);

    const user = useSelector((state) => state.candidate.user);
    const router = useRouter();

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
        fetchShortlistedJobs();
    };

    async function findShortlistedJobs({ jobTitle, jobType }) {
        const { data, error } = await supabase
            .from("shortlisted_jobs_view")
            .select()
            .eq("user_id", user.id)
            .ilike("job_title", "%" + jobTitle + "%")
            .ilike("job_type", "%" + jobType + "%")
            .order("created_at", { ascending: false });

        if (data) {
            data.forEach(
                (job) => (job.created_at = dateFormat(job.created_at))
            );
            setShortlistedJobs(data);
        }
    }

    const fetchShortlistedJobs = async () => {
        const { data, error } = await supabase
            .from("shortlisted_jobs_view")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (data) {
            data.forEach((i) => (i.created_at = dateFormat(i.created_at)));
            setShortlistedJobs(data);
        }
    };

    useEffect(() => {
        fetchShortlistedJobs();
    }, []);

    // unShortList job action
    async function unShortListJob(jobId) {
        if (confirm("Are you sure want to remove this shortlisted job?")) {
            await supabase
                .from("shortlisted_jobs")
                .delete()
                .eq("job_id", jobId)
                .eq("user_id", user.id);

            toast.success("Job Unshortlisted!", {
                position: "bottom-right",
                autoClose: "4000",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });

            fetchShortlistedJobs();
        }
    }
    return (
        <div className="tabs-box">
            <div
                className="widget-title"
                style={{ fontSize: "1.5rem", fontWeight: "500" }}
            >
                <b>My Short Listed Jobs!</b>
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
                                    findShortlistedJobs(searchFilters);
                                }}
                                className="btn btn-submit btn-sm text-nowrap m-1"
                            >
                                Filter
                            </Button>
                            <Button
                                variant="primary"
                                onClick={clearAll}
                                className="btn btn-secondary btn-sm text-nowrap mx-2"
                                style={{ minHeight: "40px", padding: "0 20px" }}
                            >
                                Clear
                            </Button>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            <div
                className="optional"
                style={{
                    textAlign: "right",
                    marginRight: "50px",
                    marginBottom: "10px",
                }}
            >
                Showing ({shortlistedJobs.length}) Shortlisted jobs
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
                                    <th>Shortlisted On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            {shortlistedJobs.length === 0 ? (
                                <tbody
                                    style={{
                                        fontSize: "1.5rem",
                                        fontWeight: "500",
                                    }}
                                >
                                    <tr>
                                        <td>
                                            <b>No Shortlisted Job(s)!</b>
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                    {shortlistedJobs.map((item) => (
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
                                            <td>{item.facility_name}</td>
                                            <td>{item.job_type}</td>
                                            <td>{item.created_at}</td>
                                            <td>
                                                <div className="option-box">
                                                    <ul className="option-list">
                                                        <li
                                                            onClick={() => {
                                                                router.push(
                                                                    `/job/${item.job_id}`
                                                                );
                                                            }}
                                                        >
                                                            <button data-text="Preview Job">
                                                                <span className="la la-file-alt"></span>
                                                            </button>
                                                        </li>
                                                        <li
                                                            onClick={() => {
                                                                unShortListJob(
                                                                    item.job_id
                                                                );
                                                            }}
                                                        >
                                                            <button
                                                                data-text="Remove from Shortlist"
                                                                className="bookmark-btn-filled"
                                                            >
                                                                <i className="las la-trash"></i>
                                                            </button>
                                                        </li>
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

export default JobFavouriteTable;
