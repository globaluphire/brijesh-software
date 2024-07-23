/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import candidatesData from "../../../../../data/candidates";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { useEffect, useState, useMemo, useRef } from "react";
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
import { convertToSearchFilterDateTimeFrom, convertToSearchFilterDateTimeTo } from "../../../../../utils/convertToSearchFilterDateTime";
import Spinner from "../../../../spinner/spinner";

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

    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("");

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedLRdata, setFetchedLRdata] = useState({});
    const [fetchedOrderData, setFetchedOrderData] = useState({});
    const [fetchedLRdataCSV, setFetchedLRdataCSV] = useState([]);
    const csvLink = useRef();

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
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hidePagination, setHidePagination] = useState(false);
    const [pageSize, setPageSize] = useState(10);

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

    async function getReferences() {
        // call reference to get lrStatus options
        const { data, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "lrStatus");

        if (data) {
            setLRStatusReferenceOptions(data);
        }
    };

    useEffect(() => {
        getReferences();
    }, []);

    async function fetchedLR(searchFilters, searchLRDateFrom, searchLRDateTo) {
        setIsLoading(true);
        try {
            let query = supabase
                .from("lr_view")
                .select("*");

            if (user.drop_branch) {
                query.eq("order_city", user.drop_branch);
            }
    
            if (searchLRDateFrom) {
                query.gte("lr_created_date", convertToSearchFilterDateTimeFrom(searchLRDateFrom));
            }
            if (searchLRDateTo) {
                query.lte("lr_created_date", convertToSearchFilterDateTimeTo(searchLRDateTo));
            }
            if (searchLRDateFrom && searchLRDateTo) {
                query.gte("lr_created_date", convertToSearchFilterDateTimeFrom(searchLRDateFrom));
                query.lte("lr_created_date", convertToSearchFilterDateTimeTo(searchLRDateTo));
            }
            if (searchFilters.consignorName) {
                query.ilike("consignor_name", "%" + searchFilters.consignorName + "%");
            }
            if (searchFilters.consigneeName) {
                query.ilike("consignee_name", "%" + searchFilters.consigneeName + "%");
            }
            if (searchFilters.fromCity) {
                query.ilike("pickup_point_city", "%" + searchFilters.fromCity + "%");
            }
            if (searchFilters.toCity) {
                query.ilike("drop_point_city", "%" + searchFilters.toCity + "%");
            }
            if (searchFilters.driverName) {
                query.ilike("driver_details", "%" + searchFilters.driverName + "%");
            }
            if (searchFilters.status) {
                query.ilike("status", "%" + searchFilters.status + "%");
            }

            let { data: lrData, error } = await query.order(
                "lr_created_date",
                { ascending: false, nullsFirst: false }
            )
            .range(
                (currentPage - 1) * pageSize,
                currentPage * pageSize - 1
            );

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
                fetchedTotalLRCounts(searchFilters);
                setIsLoading(false);
            } else {
                setIsLoading(false);
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
            setIsLoading(false);
        }
    };
    async function fetchedTotalLRCounts(searchFilters) {

        let query = supabase
            .from("lr_view")
            .select("*", { count: "exact", head: true });

        if (user.drop_branch) {
            query.eq("order_city", user.drop_branch);
        }

        if (searchLRDateFrom) {
            query.gte("lr_created_date", convertToSearchFilterDateTimeFrom(searchLRDateFrom));
        }
        if (searchLRDateTo) {
            query.lte("lr_created_date", convertToSearchFilterDateTimeTo(searchLRDateTo));
        }
        if (searchLRDateFrom && searchLRDateTo) {
            query.gte("lr_created_date", convertToSearchFilterDateTimeFrom(searchLRDateFrom));
            query.lte("lr_created_date", convertToSearchFilterDateTimeTo(searchLRDateTo));
        }

        if (searchFilters.consignorName) {
            query.ilike("consignor_name", "%" + searchFilters.consignorName + "%");
        }
        if (searchFilters.consigneeName) {
            query.ilike("consignee_name", "%" + searchFilters.consigneeName + "%");
        }
        if (searchFilters.fromCity) {
            query.ilike("pickup_point_city", "%" + searchFilters.fromCity + "%");
        }
        if (searchFilters.toCity) {
            query.ilike("drop_point_city", "%" + searchFilters.toCity + "%");
        }
        if (searchFilters.driverName) {
            query.ilike("driver_details", "%" + searchFilters.driverName + "%");
        }
        if (searchFilters.status) {
            query.ilike("status", "%" + searchFilters.status + "%");
        }

        const countTotalLR = await query;

        setTotalRecords(countTotalLR.count);

    };
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    function perPageHandler(event) {
        setIsLoading(true);

        setCurrentPage(1);
        const selectedValue = JSON.parse(event.target.value);
        const end = selectedValue.end;

        setPageSize(end);

        setIsLoading(false);
    };

    useEffect(() => {
        fetchedLR(searchFilters);
        // if (facility) {
        //     localStorage.setItem("facility", facility);
        // } else {
        //     localStorage.setItem("facility", "");
        // }
    }, [
        // facility,
        pageSize,
        currentPage
    ]);

    async function fetchedCSV(searchFilters) {
        setIsLoading(true);
        setLoadingText("Please Wait..., Your CSV is being generated");
        try {
            let query = supabase
                .from("lr_view")
                .select("*")
                .neq("lr_id", "1e6d8fcf-9792-4c21-91c6-fb314c20def7");

            if (user.drop_branch) {
                query.eq("order_city", user.drop_branch);
            }
    
            if (searchLRDateFrom) {
                query.gte("lr_created_date", convertToSearchFilterDateTimeFrom(searchLRDateFrom));
            }
            if (searchLRDateTo) {
                query.lte("lr_created_date", convertToSearchFilterDateTimeTo(searchLRDateTo));
            }
            if (searchLRDateFrom && searchLRDateTo) {
                query.gte("lr_created_date", convertToSearchFilterDateTimeFrom(searchLRDateFrom));
                query.lte("lr_created_date", convertToSearchFilterDateTimeTo(searchLRDateTo));
            }

            if (searchFilters.consignorName) {
                query.ilike("consignor_name", "%" + searchFilters.consignorName + "%");
            }
            if (searchFilters.consigneeName) {
                query.ilike("consignee_name", "%" + searchFilters.consigneeName + "%");
            }
            if (searchFilters.fromCity) {
                query.ilike("pickup_point_city", "%" + searchFilters.fromCity + "%");
            }
            if (searchFilters.toCity) {
                query.ilike("drop_point_city", "%" + searchFilters.toCity + "%");
            }
            if (searchFilters.driverName) {
                query.ilike("driver_details", "%" + searchFilters.driverName + "%");
            }
            if (searchFilters.status) {
                query.ilike("status", "%" + searchFilters.status + "%");
            }

            let { data: lrData, error } = await query.order(
                    "lr_created_date",
                    { ascending: false, nullsFirst: false }
                );

            // if (facility) {
            //     allApplicantsView = allApplicantsView.filter(
            //         (i) => i.facility_name === facility
            //     );
            // }

            if (lrData) {
                lrData.forEach(
                    (i) => (i.lr_created_date = dateFormat(i.lr_created_date))
                );

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
            setIsLoading(false);
            setLoadingText("");
        }
    }

    useEffect(() => {
        if (fetchedLRdataCSV && fetchedLRdataCSV.length > 0) {
            csvLink.current.link.click();
            setIsLoading(false);
            setLoadingText("");
        }
    }, [ fetchedLRdataCSV ]);

    return (
        <>
            <div>
                <Form>
                    <div style={{ fontSize: "1.5rem", fontWeight: "500", padding: "20px 20px 0px 20px" }}>
                        <Row>
                            <Col>
                                <b>All LRs!</b>
                            </Col>
                            <Col style={{ display: "relative", textAlign: "right" }}>
                                <Form.Group className="chosen-single form-input chosen-container mb-3">
                                    { user.role === "SUPER_ADMIN" ?
                                        <Button
                                            variant="success"
                                            onClick={() => Router.push("/employers-dashboard/add-lr")}
                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                        >
                                            Add LR
                                        </Button>
                                    : "" }
                                    <button
                                        className="btn btn-export-csv btn-sm text-nowrap m-1"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            fetchedCSV(searchFilters);
                                        }}
                                    >
                                        Export to CSV
                                    </button>
                                    <CSVLink
                                        data={fetchedLRdataCSV}
                                        filename={"Raftaar-LR-" + new Date().toLocaleDateString() + ".csv"}
                                        className='hidden'
                                        ref={csvLink}
                                        target='_blank'
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Form>

                <Spinner isLoading={isLoading} loadingText={loadingText} />

                { lRStatusReferenceOptions != null ? (
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
                                                fetchedLR(searchFilters);
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
                                                fetchedLR(searchFilters);
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
                                                fetchedLR(searchFilters);
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
                                                fetchedLR(searchFilters);
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
                                    <Form.Label style={{ marginBottom: "-5px" }}>LR Date</Form.Label><br />
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
                                                fetchedLR(searchFilters, searchLRDateFrom, searchLRDateTo);
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
                            </Row>
                            <Row className="mx-3">
                                <Col style={{ display: "relative", textAlign: "right" }}>
                                    <Form.Group className="chosen-single form-input chosen-container mb-3 pagination-panel">
                                        <span
                                            style={{ marginRight: "5px", fontWeight: "100" }}
                                        >
                                            Total Record: {totalRecords} |
                                        </span>
                                        <span style={{ fontWeight: "100" }}>Show:
                                            <select
                                                className="pagination-page-selector"
                                                onChange={perPageHandler}
                                                style={{ border: "1px solid black", padding: "1px", marginLeft: "5px" }}
                                            >
                                                <option
                                                    value={JSON.stringify({
                                                        start: 0,
                                                        end: 10,
                                                    })}
                                                >
                                                    10 Per page
                                                </option>
                                                <option
                                                    value={JSON.stringify({
                                                        start: 0,
                                                        end: 30,
                                                    })}
                                                >
                                                    30 Per page
                                                </option>
                                                <option
                                                    value={JSON.stringify({
                                                        start: 0,
                                                        end: 50,
                                                    })}
                                                >
                                                    50 Per page
                                                </option>
                                                <option
                                                    value={JSON.stringify({
                                                        start: 0,
                                                        end: 100,
                                                    })}
                                                >
                                                    100 Per page
                                                </option>
                                            </select>
                                        </span>
                                        <span>
                                                {!hidePagination ? (
                                                    <Pagination
                                                        currentPage={currentPage}
                                                        totalRecords={totalRecords}
                                                        pageSize={pageSize}
                                                        onPageChange={handlePageChange}
                                                    />
                                                ) : null}
                                            </span>
                                        
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
