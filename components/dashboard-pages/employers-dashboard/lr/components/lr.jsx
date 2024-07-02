/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
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
import { InputGroup } from "react-bootstrap";
import { CSVLink } from "react-csv";
import CalendarComp from "../../../../date/CalendarComp";

const addSearchFilters = {
    consignorName: "",
    consigneeName: "",
    fromCity: "",
    toCity: "",
    driverName: "",
    status: ""
};

const LR = () => {
    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedLRdata, setFetchedLRdata] = useState({});
    const [fetchedOrderData, setFetchedOrderData] = useState({});
    const [fetchedLRdataCSV, setFetchedLRdataCSV] = useState({});

    const [applicationStatus, setApplicationStatus] = useState("");
    const [
        applicationStatusReferenceOptions,
        setApplicationStatusReferenceOptions,
    ] = useState(null);
    const [
        lRStatusReferenceOptions,
        setLRStatusReferenceOptions,
    ] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [applicationId, setApplicationId] = useState("");

    // For Pagination
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [hidePagination, setHidePagination] = useState(false);
    // const [pageSize, setPageSize] = useState(10);

    // for search filters
    const [searchLRDateFrom, setSearchLRDateFrom] = useState();
    const [searchLRDateTo, setSearchLRDateTo] = useState();
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const {
        consignorName,
        consigneeName,
        fromCity,
        toCity,
        driverName,
        status } = useMemo(
        () => searchFilters,
        [searchFilters]
    );

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

    // clear all filters
    const clearAll = () => {
        setSearchLRDateFrom();
        setSearchLRDateTo();
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        fetchedLR(JSON.parse(JSON.stringify(addSearchFilters)));
    };

    async function findLR(searchFilters, searchLRDateFrom, searchLRDateTo) {
        // call reference to get applicantStatus options
        // setCurrentPage(1);
        // const { data: refData, error: e } = await supabase
        //     .from("reference")
        //     .select("*")
        //     .eq("ref_nm", "applicantStatus");

        // if (refData) {
        //     setApplicationStatusReferenceOptions(refData);
        // }

        let query = supabase
            .from("lr")
            .select("*");

        if (searchLRDateFrom) {
            query.gte("lr_created_date", searchLRDateFrom.getTime());
        }
        if (searchLRDateTo) {
            query.lte("lr_created_date", searchLRDateTo.getTime());
        }
        if (searchLRDateFrom && searchLRDateTo) {
            query.gte("lr_created_date", searchLRDateFrom.getTime());
            query.lte("lr_created_date", searchLRDateTo.getTime());
        }
        if (searchFilters.consignorName) {
            query.ilike("consignor", "%" + searchFilters.consignorName + "%");
        }
        if (searchFilters.consigneeName) {
            query.ilike("consignee", "%" + searchFilters.consigneeName + "%");
        }
        if (searchFilters.fromCity) {
            query.ilike("from_city", "%" + searchFilters.fromCity + "%");
        }
        if (searchFilters.toCity) {
            query.ilike("to_city", "%" + searchFilters.toCity + "%");
        }
        if (searchFilters.driverName) {
            query.ilike("driver_name", "%" + searchFilters.driverName + "%");
        }
        if (searchFilters.status) {
            query.ilike("status", "%" + searchFilters.status + "%");
        }

        // if (facility) {
        //     query.ilike("facility_name", "%" + facility + "%");
        // }

        // setTotalRecords((await query).data.length);

        let { data, error } = await query.order("lr_created_date", {
            ascending: false,
            nullsFirst: false,
        });
        // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        // if (facility) {
        //     data = data.filter((i) => i.facility_name === facility);
        // }

        if (data) {
            data.forEach(
                (lr) =>
                    (lr.lr_created_date = dateFormat(lr.lr_created_date))
            );
            setFetchedLRdata(data);

            // creating new array object for CSV export
            const lrDataCSV = data.map(({ id, lr_created_by,...rest }) => ({ ...rest }));
            setFetchedLRdataCSV(lrDataCSV);
        }
    }

    async function fetchedLR({
        consignorName,
        consigneeName,
        fromCity,
        toCity,
        driverName,
        status
    }) {
        try {
            // call reference to get lrStatus options
            const { data, error: e } = await supabase
                .from("reference")
                .select("*")
                .eq("ref_nm", "lrStatus");

            if (data) {
                setLRStatusReferenceOptions(data);
            }

            let query = supabase
                .from("lr_view")
                .select("*");

            if (user.drop_branch) {
                query.eq("order_city", user.drop_branch);
            }
    
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

                setFetchedLRdata(lrData);

                // creating new array object for CSV export
                const lrDataCSV = lrData.map(({ id, lr_created_by,...rest }) => ({ ...rest }));
                setFetchedLRdataCSV(lrDataCSV);

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
        // if (facility) {
        //     localStorage.setItem("facility", facility);
        // } else {
        //     localStorage.setItem("facility", "");
        // }
    }, [
        // facility,
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
        <>
            <div>
                <div
                    className="widget-title"
                    style={{ fontSize: "1.5rem", fontWeight: "500" }}
                >
                    <b>All LRs!</b>
                </div>
                { lRStatusReferenceOptions != null ? (
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
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                            <Row className="mb-1 mx-3">
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Status</Form.Label>
                                    <Form.Select
                                        className="chosen-single form-select"
                                        size="sm"
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                status: e.target.value,
                                            }));
                                        }}
                                        value={status}
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
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom01">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Consignor</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={consignorName}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                consignorName: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findLR(searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Consignee</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={consigneeName}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                consigneeName: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findLR(searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>From</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={fromCity}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                fromCity: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findLR(searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>To</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={toCity}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                toCity: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findLR(searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom01">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Driver Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        // placeholder="Consignor"
                                        // defaultValue="Mark"
                                        value={driverName}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                driverName: e.target.value,
                                            }));
                                        }}
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3 mx-3">
                                <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Invoice Date</Form.Label><br />
                                    <div className="p-1" style={{ border: "1px solid #dee2e6", borderRadius: "3px" }}>
                                        <div className="pb-1">
                                            <span className="px-1">From</span>
                                            <CalendarComp setDate={setSearchLRDateFrom} date1={searchLRDateFrom} />
                                        </div>
                                        <div>
                                            <span className="px-1">To &nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <CalendarComp setDate={setSearchLRDateTo} date1={searchLRDateTo} />
                                        </div>
                                    </div>
                                </Form.Group>
                            </Row>
                            <Row className="mx-3">
                                <Col>
                                    <Form.Group className="chosen-single form-input chosen-container mb-3">
                                        <Button
                                            variant="primary"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                findLR(searchFilters, searchLRDateFrom, searchLRDateTo);
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
                                        { fetchedLRdataCSV.length > 0 ?
                                            <CSVLink
                                                data={fetchedLRdataCSV}
                                                className="btn btn-export-csv btn-sm text-nowrap m-1"
                                                filename={"Raftaar-LR-" + new Date().toLocaleDateString() + ".csv"}
                                            >
                                                Export to CSV
                                            </CSVLink>
                                        : "" }
                                        { user.id === "NnxOeP2axndJjCYRX74985oipdo2" ?
                                            <Button
                                                variant="success"
                                                onClick={() => Router.push("/employers-dashboard/add-lr")}
                                                className="btn btn-add-lr btn-sm text-nowrap m-1"
                                            >
                                                Add LR
                                            </Button>
                                        : "" }
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                ) : ( "" 
                )}
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
                                <tr style={{ border: "1px solid #333" }}>
                                    <td colSpan={4} style={{ border: "none" }}>
                                        <span><b>No LRs found!</b></span>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedLRdata).map(
                                    (lr) => (
                                        <tr key={lr.id}>
                                            <td>
                                                <ui className="option-list" style={{ border: "none" }}>
                                                    <li>
                                                        <button>
                                                            <a onClick={() => router.push(`/employers-dashboard/view-lr/${lr.lr_id}`)}>
                                                                <span className="la la-print" title="Print LR"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ui>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/employers-dashboard/lr-details/${lr.lr_number}`} 
                                                    style={{ textDecoration: "underline" }}
                                                >
                                                    {lr.lr_number}
                                                </Link>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.lr_created_date}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/employers-dashboard/order-details/${lr.order_id}`} 
                                                    style={{ textDecoration: "underline" }}
                                                >
                                                    {lr.order_number}
                                                </Link>
                                            </td>
                                            <td>
                                                <span>{lr.consignor_name}</span><br />
                                                <span className="optional">{lr.consignor_phone ? "+91 " + lr.consignor_phone : ""}</span><br />
                                                <span className="optional">{lr.consignor_email}</span>
                                            </td>
                                            <td>
                                                <span>{lr.consignee_name}</span><br />
                                                <span className="optional">{lr.consignee_phone ? "+91 " + lr.consignee_phone : ""}</span><br />
                                                <span className="optional">{lr.consignee_email}</span>
                                            </td>
                                            <td>
                                                {lr.pickup_point_address1 ? <span>{lr.pickup_point_address1}, </span> : "" }
                                                {lr.pickup_point_address2 ? <span>{lr.pickup_point_address2}, </span> : "" }
                                                {lr.pickup_point_area ? <span>{lr.pickup_point_area}, </span> : "" }
                                                {lr.pickup_point_city ? <span>{lr.pickup_point_city}, </span> : "" }
                                                {lr.pickup_point_state ? <span>{lr.pickup_point_state}, </span> : "" }
                                                {lr.pickup_point_pin ? <span>{lr.pickup_point_pin}, </span> : "" }
                                            </td>
                                            <td>
                                                {lr.drop_point_address1 ? <span>{lr.drop_point_address1}, </span> : "" }
                                                {lr.drop_point_address2 ? <span>{lr.drop_point_address2}, </span> : "" }
                                                {lr.drop_point_area ? <span>{lr.drop_point_area}, </span> : "" }
                                                {lr.drop_point_city ? <span>{lr.drop_point_city}, </span> : "" }
                                                {lr.drop_point_state ? <span>{lr.drop_point_state}, </span> : "" }
                                                {lr.drop_point_pin ? <span>{lr.drop_point_pin}, </span> : "" }
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.material}
                                                </span> <br />
                                                <span>
                                                    {lr.quantity}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.weight}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.vehical_number ? lr.vehical_number : "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span>{lr.driver_details ? lr.driver_details : "-"}</span><br />
                                            </td>
                                            <td>
                                                {
                                                    lr.status === "Final" ? (
                                                        <span style={{ color: "green" }}>
                                                            {lr.status}
                                                        </span>
                                                    ) : lr.status === "Performa" ? (
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
