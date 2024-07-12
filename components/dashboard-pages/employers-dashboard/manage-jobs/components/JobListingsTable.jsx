/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { auth, db } from "../../../../common/form/firebase";
// import jobs from "../../../../../data/job-featured.js";
import { supabase } from "../../../../../config/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import { Typeahead } from "react-bootstrap-typeahead";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Table } from "react-bootstrap";
import Pagination from "../../../../common/Pagination";

const addSearchFilters = {
    jobTitle: "",
    jobType: "",
};

const JobListingsTable = () => {
    const [jobs, setjobs] = useState([]);

    // for search filters
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const { jobTitle, jobType } = useMemo(() => searchFilters, [searchFilters]);

    // add applicants popup
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("+1");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [phoneNumberError, setPhoneNumberError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [licenseNumberError, setLicenseNumberError] = useState("");
    const [guestSelectedFile, setGuestSelectedFile] = useState(null);
    const [jobId, setJobId] = useState("");

    // const [jobStatus, setJobStatus] = useState('');
    const user = useSelector((state) => state.candidate.user);
    const router = useRouter();

    // For Pagination
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [hidePagination, setHidePagination] = useState(false);
    // const [pageSize, setPageSize] = useState(10);

    // global states
    const facility = useSelector((state) => state.employer.facility.payload);

    const dateFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                }) +
                ", " +
                date.getFullYear()
            );
        }
    };

    function handleFileInputChange(event) {
        setGuestSelectedFile(event.target.files[0]);
    }

    const validateForm = () => {
        let isValid = true;
        if (!firstName) {
            setFirstNameError("Please enter your first name");
            isValid = false;
        } else {
            setFirstNameError("");
        }

        if (!lastName) {
            setLastNameError("Please enter your last name");
            isValid = false;
        } else {
            setLastNameError("");
        }

        // if (!email) {
        //   setEmailError("Please enter your email address");
        //   isValid = false;
        // } else if (!/\S+@\S+\.\S+/.test(email)) {
        //   setEmailError("Please enter a valid email address");
        //   isValid = false;
        // }
        if (phoneNumber && phoneNumber.length > 2 && phoneNumber.length < 12) {
            setPhoneNumberError("Phone number should be in +11234567890");
            isValid = false;
        } else {
            setPhoneNumberError("");
        }

        return isValid;
    };

    const resetAddApplicantsFields = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("+1");
        setGuestSelectedFile(null);
    };

    // add applicants
    async function addApplicants(event) {
        event.preventDefault();
        if (validateForm()) {
            if (guestSelectedFile) {
                let file;
                const fileTimestamp = Date.now();

                // upload document to applications/cv folder
                const {
                    data: guestFileUploadSuccess,
                    error: guestFileUploadError,
                } = await supabase.storage
                    .from("applications")
                    .upload(
                        "cv/" + fileTimestamp + "-" + guestSelectedFile.name,
                        guestSelectedFile,
                        file
                    );
                if (guestFileUploadError) {
                    if (guestFileUploadError.error === "Payload too large") {
                        toast.error(
                            "Failed to upload attachment.  Attachment size exceeded maximum allowed size!",
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
                    }
                } else {
                    // get document downloadable url
                    const { data: docURL, error: docURLError } =
                        supabase.storage
                            .from("applications")
                            .getPublicUrl(
                                "cv/" +
                                    fileTimestamp +
                                    "-" +
                                    guestSelectedFile.name
                            );
                    if (docURLError) {
                        console.warn("Failed to get download URL for file");
                    }

                    // save applied application
                    const { data: applications, error: applicationsError } =
                        await supabase.from("applications").insert([
                            {
                                email,
                                name: firstName + " " + lastName,
                                phn_nbr: phoneNumber,
                                doc_name: guestSelectedFile.name,
                                doc_size: guestSelectedFile.size,
                                doc_typ: guestSelectedFile.type,
                                job_id: jobId,
                                doc_dwnld_url: docURL,
                                status: "New",
                            },
                        ]);

                    if (applicationsError) {
                        toast.error(
                            "Error while Applying in this job, Please try again later!",
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
                        const time = new Date();
                        const toBase64 = (file) =>
                            new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.readAsDataURL(file);
                                reader.onload = () => {
                                    let encoded = reader.result
                                        .toString()
                                        .replace(/^data:(.*,)?/, "");
                                    if (encoded.length % 4 > 0) {
                                        encoded += "=".repeat(
                                            4 - (encoded.length % 4)
                                        );
                                    }
                                    resolve(encoded);
                                };
                                reader.onerror = reject;
                            });

                        // const fileBase64 = await toBase64(guestSelectedFile)
                        // const notifyMeEmail = company.notify_me ? company.email : 'support@globaluphire.com'

                        //   axios({
                        //     method: 'POST',
                        //     url: '/api/mail',
                        //     data: {
                        //       name: firstName + " " + lastName,
                        //       redirectionUrl: `https://globaluphire.com`,
                        //       time: time.toLocaleString('en-IN'),
                        //       jobId: jobId,
                        //       jobTitle: company.job_title,
                        //       notifyMeEmail: notifyMeEmail,
                        //       facilityName: company.facility_name,
                        //       attachments: [
                        //         {
                        //           content: fileBase64,
                        //           filename: guestSelectedFile.name,
                        //           type: guestSelectedFile.type,
                        //           disposition: "attachment"
                        //         }
                        //       ]
                        //     }
                        //   })
                        // open toast
                        toast.success("Successfully Applied in this job!", {
                            position: "bottom-right",
                            autoClose: 8000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        });

                        // reset all fields
                        resetAddApplicantsFields();

                        // let { data:jobs, error } = await supabase
                        //     .from('jobs')
                        //     .select()
                        //     .eq('job_id', jobId)

                        // if (jobs) {
                        //     await supabase
                        //       .from('notification')
                        //       .insert([{
                        //               type: `New Candidate Applied`,
                        //               job_id: jobs[0].job_id,
                        //               user_id: `GUEST`,
                        //               facility: jobs[0].facility_name,
                        //               notification_text: `<b>${firstName + " " + lastName}</b> Applied in <b>${jobs[0].job_title}</b>`,
                        //               created_at: dateFormat(new Date())
                        //           }
                        //       ]);
                        // }
                    }
                }
            } else {
                console.warn("No file selected.");
            }
        }
    }

    // enableNotifyMeFlag
    const enableNotifyMeFlag = async (jobId) => {
        if (jobId && user) {
            const { data: authUser, error: e } = await supabase
                .from("jobs")
                .select()
                .eq("job_id", jobId)
                .eq("user_id", user.id);

            if (authUser.length > 0) {
                const { data, error } = await supabase
                    .from("jobs")
                    .update({ notify_me: true })
                    .eq("job_id", jobId);

                // open toast
                toast.success("Success!", {
                    position: "bottom-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            } else {
                // open toast
                toast.error(
                    "Action Restricted! You are not the owner of this Job!",
                    {
                        position: "bottom-right",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    }
                );
            }

            // fetching all posts to refresh the data in Job Listing Table
            fetchPost(searchFilters);
        } else {
            // open toast
            toast.error(
                "Error on enabling Notify Me Flag! Please contact tech support!",
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

    // disableNotifyMeFlag
    const disableNotifyMeFlag = async (jobId) => {
        if (jobId && user) {
            const { data: authUser, error: e } = await supabase
                .from("jobs")
                .select()
                .eq("job_id", jobId)
                .eq("user_id", user.id);

            if (authUser.length > 0) {
                const { data, error } = await supabase
                    .from("jobs")
                    .update({ notify_me: false })
                    .eq("job_id", jobId);

                // open toast
                toast.success("Success!", {
                    position: "bottom-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            } else {
                // open toast
                toast.error(
                    "Action Restricted! You are not the owner of this Job!",
                    {
                        position: "bottom-right",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    }
                );
            }

            // fetching all posts to refresh the data in Job Listing Table
            fetchPost(searchFilters);
        } else {
            // open toast
            toast.error(
                "Error on disabling Notify Me Flag! Please contact tech support!",
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

    // Unpublish job action
    const unpublishJob = async (jobId, status) => {
        if (status !== "Unpublished") {
            const { data, error } = await supabase
                .from("jobs")
                .update({
                    status: "Unpublished",
                    unpublished_date: new Date(),
                })
                .eq("job_id", jobId);

            // open toast
            toast.success("Job successfully unpublished!", {
                position: "bottom-right",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });

            // fetching all posts to refresh the data in Job Listing Table
            fetchPost(searchFilters);
        } else {
            // open toast
            toast.error("Job is already unpublished!", {
                position: "bottom-right",
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

    // clear all filters
    const clearAll = () => {
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        fetchPost({ jobTitle: "", jobType: "" });
    };

    // Search function
    async function findJob() {
        let query = supabase
            .from("manage_jobs_view")
            .select("*")
            .eq("status", "Published");

        if (jobTitle) {
            query.ilike("job_title", "%" + jobTitle + "%");
        }
        if (jobType) {
            query.ilike("job_type", "%" + jobType + "%");
        }
        if (facility) {
            query.ilike("facility_name", "%" + facility + "%");
        }
        // setTotalRecords((await query).data.length);
        let { data, error } = await query.order("published_date", {
            ascending: false,
            nullsFirst: false,
        });

        data.forEach((job) => (job.created_at = dateFormat(job.created_at)));
        data.forEach(
            (job) => (job.published_date = dateFormat(job.published_date))
        );
        setjobs(data);
    }

    // Initial Function
    async function fetchPost({ jobTitle, jobType }) {
        let query = supabase
            .from("manage_jobs_view")
            .select("*")
            .eq("status", "Published");

        if (jobTitle) {
            query.ilike("job_title", "%" + jobTitle + "%");
        }
        if (jobType) {
            query.ilike("job_type", "%" + jobType + "%");
        }
        if (facility) {
            query.ilike("facility_name", "%" + facility + "%");
        }
        // setTotalRecords((await query).data.length);

        let { data, error } = await query.order("published_date", {
            ascending: false,
            nullsFirst: false,
        });
        // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        data.forEach((job) => (job.created_at = dateFormat(job.created_at)));
        data.forEach(
            (job) => (job.published_date = dateFormat(job.published_date))
        );

        // if (facility) {
        //     data = data.filter((i) => i.facility_name === facility);
        // }

        setjobs(data);
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
        fetchPost({ jobTitle, jobType });
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

    return (
        <div className="tabs-box">
            <div
                className="widget-title"
                style={{ fontSize: "1.5rem", fontWeight: "500" }}
            >
                <b>All Published Jobs!</b>
            </div>
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
                                        findJob(searchFilters);
                                    }
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
                                <option value="Per Diem">Per Diem</option>
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
                                variant="primary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    findJob(searchFilters);
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
                Showing ({jobs.length}) Published Job(s)
                {/* Out of ({totalRecords})<br /> Page: {currentPage} */}
            </div>
            <div className="widget-content">
                <div className="table-outer">
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Facility</th>
                                <th>Applications</th>
                                <th>Published On</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        {jobs.length === 0 ? (
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
                                {jobs.map((item) => (
                                    <tr key={item.job_id}>
                                        <td>
                                            {/* <!-- Job Block --> */}
                                            <div className="job-block">
                                                <div>
                                                    <div>
                                                        {/* <span className="company-logo">
                            <img src={item.logo} alt="logo" />
                          </span> */}
                                                        <h4>
                                                            <Link
                                                                href={`/employers-dashboard/edit-job/${item.job_id}`}
                                                            >
                                                                {item.job_title}
                                                            </Link>
                                                        </h4>
                                                        <ul className="job-info">
                                                            {item?.job_type ? (
                                                                <li>
                                                                    <i className="flaticon-clock-3"></i>{" "}
                                                                    {
                                                                        item?.job_type
                                                                    }
                                                                </li>
                                                            ) : (
                                                                ""
                                                            )}
                                                            {item?.job_address ? (
                                                                <li>
                                                                    <span className="flaticon-map-locator"></span>{" "}
                                                                    {
                                                                        item?.job_address
                                                                    }
                                                                </li>
                                                            ) : (
                                                                ""
                                                            )}
                                                            {/* location info */}
                                                            {item?.salary ? (
                                                                <li>
                                                                    <span className="flaticon-money"></span>{" "}
                                                                    $
                                                                    {
                                                                        item?.salary
                                                                    }{" "}
                                                                    {
                                                                        item?.salary_rate
                                                                    }
                                                                </li>
                                                            ) : (
                                                                ""
                                                            )}
                                                            {/* salary info */}
                                                        </ul>
                                                        {/* End .job-info */}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.facility_name}</td>
                                        <td>
                                            {item.total_applicants > 0 ? (
                                                <a
                                                    className="applied"
                                                    onClick={() => {
                                                        router.push(
                                                            `/employers-dashboard/all-applicants-view/${item.job_id}`
                                                        );
                                                    }}
                                                >
                                                    {item.total_applicants}{" "}
                                                    applied
                                                </a>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {item.published_date
                                                ? item.published_date
                                                : item.created_at}
                                        </td>
                                        {item.unpublished_date ? (
                                            <td className="status">
                                                Republished
                                            </td>
                                        ) : (
                                            <td className="status">
                                                {item.status}
                                                {item?.is_edited ? (
                                                    <div
                                                        style={{
                                                            color: "green",
                                                        }}
                                                    >
                                                        Edited
                                                    </div>
                                                ) : (
                                                    ""
                                                )}
                                                {item?.is_cloned ? (
                                                    <div
                                                        style={{
                                                            color: "green",
                                                        }}
                                                    >
                                                        Cloned
                                                    </div>
                                                ) : (
                                                    ""
                                                )}
                                            </td>
                                        )}
                                        <td>
                                            <div className="option-box">
                                                <ul className="option-list">
                                                    {item.notify_me ? (
                                                        <li
                                                            onClick={() => {
                                                                disableNotifyMeFlag(
                                                                    item.job_id
                                                                );
                                                            }}
                                                        >
                                                            <button data-text="Notify job owner when application recieved">
                                                                <span className="la la-bell"></span>
                                                            </button>
                                                        </li>
                                                    ) : (
                                                        <li
                                                            onClick={() => {
                                                                enableNotifyMeFlag(
                                                                    item.job_id
                                                                );
                                                            }}
                                                        >
                                                            <button data-text="Notify job owner when application recieved">
                                                                <span className="la la-bell-slash"></span>
                                                            </button>
                                                        </li>
                                                    )}
                                                    <li
                                                        onClick={() => {
                                                            router.push(
                                                                `/employers-dashboard/clone-job/${item.job_id}`
                                                            );
                                                        }}
                                                    >
                                                        <button data-text="Clone Job">
                                                            <span className="la la-copy"></span>
                                                        </button>
                                                    </li>
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
                                                </ul>
                                                <ul
                                                    className="option-list"
                                                    style={{ marginTop: "5px" }}
                                                >
                                                    <li
                                                        onClick={() => {
                                                            unpublishJob(
                                                                item.job_id,
                                                                item.status
                                                            );
                                                        }}
                                                    >
                                                        <button data-text="Unpublish Job">
                                                            <span className="la la-trash"></span>
                                                        </button>
                                                    </li>
                                                    {user.id ===
                                                        "mHTljO3nNwWNfs2Cmp3lKTJhY002" ||
                                                    user.id ===
                                                        "2M0F2ed7HINNU5qiuoQzCOi4mL92" ? (
                                                        <li>
                                                            <button data-text="Add Applicants">
                                                                <a
                                                                    href="#"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#addApplicantsModal"
                                                                    onClick={() => {
                                                                        setJobId(
                                                                            item.job_id
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="la la-file-upload"></span>
                                                                </a>
                                                            </button>
                                                        </li>
                                                    ) : (
                                                        ""
                                                    )}

                                                    {/* <li onClick={()=>{ addApplicant(item.job_id) }}>
                            <button data-text="Add Applicant">
                              <span className="la la-file-upload"></span>
                            </button>
                          </li> */}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </Table>

                    {/* Add Notes Modal Popup */}
                    <div
                        className="modal fade"
                        id="addApplicantsModal"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="apply-modal-content modal-content">
                                <div className="text-center">
                                    <h3 className="title">Add Applicants</h3>
                                    <button
                                        type="button"
                                        id="notesCloseButton"
                                        className="closed-modal"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                {/* End modal-header */}
                                <div className="widget-content">
                                    <form
                                        className="default-form"
                                        onSubmit={addApplicants}
                                    >
                                        <div className="form-group">
                                            <label>
                                                First Name
                                                <span className="required">
                                                    {" "}
                                                    (required)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="globaluphire-first_name"
                                                placeholder="Enter first name"
                                                value={firstName}
                                                onChange={(e) => {
                                                    setFirstName(
                                                        e.target.value
                                                    );
                                                    setFirstNameError("");
                                                }}
                                                required
                                            />
                                            {firstNameError && (
                                                <div className="required">
                                                    {firstNameError}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label>
                                                Last Name
                                                <span className="required">
                                                    {" "}
                                                    (required)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="globaluphire-last_name"
                                                placeholder="Enter last name"
                                                value={lastName}
                                                onChange={(e) => {
                                                    setLastName(e.target.value);
                                                    setLastNameError("");
                                                }}
                                                required
                                            />
                                            {lastNameError && (
                                                <div className="required">
                                                    {lastNameError}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input
                                                type="email"
                                                name="globaluphire-email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setEmailError("");
                                                }}
                                                placeholder="Enter your email"
                                            />
                                            {emailError && (
                                                <div>{emailError}</div>
                                            )}
                                        </div>
                                        {/* name */}

                                        <div className="form-group">
                                            <label>
                                                Phone Number{" "}
                                                <span className="optional">
                                                    (optional)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={phoneNumber}
                                                minlength="12"
                                                onChange={(e) => {
                                                    if (
                                                        e.target.value.trim() ===
                                                        ""
                                                    ) {
                                                        setPhoneNumber("+1");
                                                        return;
                                                    }
                                                    const number =
                                                        e.target.value.replace(
                                                            "+1",
                                                            ""
                                                        );
                                                    if (isNaN(number)) return;
                                                    if (
                                                        e.target.value.length <=
                                                        12
                                                    ) {
                                                        setPhoneNumber(
                                                            e.target.value.trim()
                                                        );
                                                    }
                                                }}
                                            />
                                            {phoneNumberError && (
                                                <div className="required">
                                                    {phoneNumberError}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                                            <div className="uploading-outer apply-cv-outer">
                                                <div>
                                                    <input
                                                        className="uploadButton-input"
                                                        type="file"
                                                        name="attachments[]"
                                                        accept="image/*, application/pdf"
                                                        id="upload"
                                                        required
                                                        onChange={
                                                            handleFileInputChange
                                                        }
                                                    />
                                                    <label
                                                        className="uploadButton-button ripple-effect"
                                                        htmlFor="upload"
                                                    >
                                                        Upload CV (doc, docx,
                                                        pdf)
                                                        <br />
                                                        {guestSelectedFile && (
                                                            <p>
                                                                Selected file:{" "}
                                                                {
                                                                    guestSelectedFile.name
                                                                }
                                                            </p>
                                                        )}
                                                        {!guestSelectedFile && (
                                                            <label className="required">
                                                                Please select a
                                                                file before
                                                                Apply
                                                            </label>
                                                        )}
                                                    </label>
                                                    <br />
                                                    <label htmlFor="max_upload_size">
                                                        {" "}
                                                        Max size 5MB allowed{" "}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        {/* End .col */}
                                        {/* 
                    <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                      <div className="input-group">
                        <label htmlFor="rememberMe" className="remember">
                          <span className="custom-checkbox"></span> <i>* By applying into this job you accept our {" "}
                          <span data-bs-dismiss="modal">
                            <Link href="/terms">
                              Terms and Conditions & Privacy Policy
                            </Link>
                          </span></i>
                        </label>
                      </div>
                    </div> */}
                                        {/* End .col */}

                                        <div className="form-group">
                                            <button
                                                className="theme-btn btn-style-one"
                                                type="submit"
                                                onClick={addApplicants}
                                            >
                                                Add
                                            </button>
                                            <button
                                                className="theme-btn btn-style-one"
                                                onClick={
                                                    resetAddApplicantsFields
                                                }
                                                style={{ float: "right" }}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        {/* login */}
                                    </form>
                                </div>
                                {/* End PrivateMessageBox */}
                            </div>
                            {/* End .send-private-message-wrapper */}
                        </div>
                    </div>
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

export default JobListingsTable;
