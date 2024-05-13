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
import { convertToFullDateFormat } from "../../../../../utils/convertToFullDateFormat";
import CalendarComp from "../../../../date/CalendarComp";
import { format } from "date-fns";

const addSearchFilters = {
    clientName: "",
    consigneeName: "",
    fromCity: "",
    toCity: "",
    driverName: "",
    status: ""
};

const Billing = () => {
    const router = useRouter();

    const [fetchedInvoicedata, setFetchedInvoicedata] = useState({});
    const [fetchedInvoicedataCSV, setFetchedInvoicedataCSV] = useState({});

    const [applicationStatus, setApplicationStatus] = useState("");
    const [
        applicationStatusReferenceOptions,
        setApplicationStatusReferenceOptions,
    ] = useState(null);
    const [
        invoiceStatusReferenceOptions,
        setInvoiceStatusReferenceOptions,
    ] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [applicationId, setApplicationId] = useState("");

    // For Pagination
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [hidePagination, setHidePagination] = useState(false);
    // const [pageSize, setPageSize] = useState(10);

    // for search filters
    const [searchInvoiceDateFrom, setSearchInvoiceDateFrom] = useState();
    const [searchInvoiceDateTo, setSearchInvoiceDateTo] = useState();
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const {
        clientName,
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

    const dateTimeFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })
            );
        }
    };

    // clear from date Filter
    const clearFromDateFilter = () => {
        setSearchInvoiceDateFrom();
    };

    // clear to date Filter
    const clearToDateFilter = () => {
        setSearchInvoiceDateTo();
    };

    // clear all filters
    const clearAll = () => {
        setSearchInvoiceDateFrom();
        setSearchInvoiceDateTo();
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        fetchedInvoice(JSON.parse(JSON.stringify(addSearchFilters)));
    };

    async function findInvoice(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters) {
        let query = supabase
            .from("invoice")
            .select("*")
            .ilike("company_name", "%" + searchFilters.clientName + "%");

        if (searchInvoiceDateFrom) {
            query.gte("invoice_date", format(searchInvoiceDateFrom, "yyyy-MM-dd"));
        }
        if (searchInvoiceDateTo) {
            query.lte("invoice_date", format(searchInvoiceDateTo, "yyyy-MM-dd"));
        }
        if (searchInvoiceDateFrom && searchInvoiceDateTo) {
            query.gte("invoice_date", format(searchInvoiceDateFrom, "yyyy-MM-dd"));
            query.lte("invoice_date", format(searchInvoiceDateTo, "yyyy-MM-dd"));
        }

        // setTotalRecords((await query).data.length);

        let { data, error } = await query.order("invoice_created_at", {
            ascending: false,
            nullsFirst: false,
        });
        // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        // if (facility) {
        //     data = data.filter((i) => i.facility_name === facility);
        // }

        if (data) {
            data.forEach(
                (invoice) =>
                    (invoice.invoice_created_at = dateTimeFormat(invoice.invoice_created_at))
            );
            setFetchedInvoicedata(data);

            // creating new array object for CSV export
            const invoiceDataCSV = data.map(({ invoice_id, order_id, lr_id, invoice_date, ...rest }) => ({ ...rest }));
            setFetchedInvoicedataCSV(invoiceDataCSV);
        }
    }

    async function fetchedInvoice({
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
                setInvoiceStatusReferenceOptions(data);
            }

            let query = supabase
                .from("invoice")
                .select("*");

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

            let { data: invoiceData, error } = await query.order(
                "invoice_created_at",
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

            if (invoiceData) {
                invoiceData.forEach(
                    (i) => (i.invoice_created_at = dateTimeFormat(i.invoice_created_at))
                );

                setFetchedInvoicedata(invoiceData);

                // creating new array object for CSV export
                const invoiceDataCSV = invoiceData.map(({ invoice_id, order_id, lr_id, invoice_date, ...rest }) => ({ ...rest }));
                setFetchedInvoicedataCSV(invoiceDataCSV);
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
        fetchedInvoice(searchFilters);
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
                    <b>Client Billing!</b>
                </div>
                { invoiceStatusReferenceOptions != null ? (
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
                                <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                    <Form.Label className="">
                                        Invoice Date
                                        <span className="px-1">
                                            <Button
                                                className="btn-sm btn-secondary"
                                                onClick={clearFromDateFilter}
                                                style={{ fontSize: "10px", margin: "0", padding: "4px" }}
                                            >
                                                Clear From Date
                                            </Button>
                                        </span>
                                        <span>
                                            <Button
                                                className="btn-sm btn-secondary"
                                                onClick={clearToDateFilter}
                                                style={{ fontSize: "10px", margin: "0", padding: "4px" }}
                                            >
                                                Clear To Date
                                            </Button>
                                        </span>
                                    </Form.Label><br />
                                    <div className="p-1" style={{ border: "1px solid #dee2e6", borderRadius: "3px"  }}>
                                        <div className="pb-1">
                                            <span className="px-1">From</span>
                                            <CalendarComp setDate={setSearchInvoiceDateFrom} date1={searchInvoiceDateFrom} />
                                        </div>
                                        <div>
                                            <span className="px-1">To &nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <CalendarComp setDate={setSearchInvoiceDateTo} date1={searchInvoiceDateTo} />
                                        </div>
                                    </div>
                                </Form.Group>
                               <Form.Group as={Col} md="4" controlId="validationCustom01">
                                    <Form.Label>Client Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={clientName}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                clientName: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findInvoice(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                {/* <Form.Group as={Col} md="2" controlId="validationCustom02">
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
                                                // findLR(searchFilters);
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
                                                // findLR(searchFilters);
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
                                                // findLR(searchFilters);
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
                                        {invoiceStatusReferenceOptions.map(
                                            (option) => (
                                                <option value={option.ref_dspl}>
                                                    {option.ref_dspl}
                                                </option>
                                            )
                                        )}
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
                                                findInvoice(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters);
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
                                        { fetchedInvoicedataCSV.length > 0 ?
                                            <CSVLink
                                                data={fetchedInvoicedataCSV}
                                                className="btn btn-export-csv btn-sm text-nowrap m-1"
                                                filename={"Raftaar-Invoice-" + new Date().toLocaleDateString() + ".csv"}
                                            >
                                                Export to CSV
                                            </CSVLink>
                                        : "" }
                                        <Button
                                            variant="success"
                                            onClick={() => Router.push("/employers-dashboard/add-invoice")}
                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                        >
                                            Add Invoice
                                        </Button>
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
                    Showing ({fetchedInvoicedata.length}) Invoice(s)
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
                                <th>Created On</th>
                                <th>Invoice Date</th>
                                <th>Pickup Date</th>
                                <th>Invoice No</th>
                                <th>Order No</th>
                                <th>Order City</th>
                                <th>Client Name</th>
                                <th>Route</th>
                                <th>Status</th>
                                <th>LR No</th>
                                <th>Truck Number</th>
                                <th>Weight(Kg)</th>
                                <th>Order Details</th>
                            </tr>
                        </thead>
                        {fetchedInvoicedata.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr>
                                    <td>
                                        <b>No Invoices found!</b>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedInvoicedata).map(
                                    (invoice) => (
                                        <tr key={invoice.invoice_id}>
                                            <td>
                                                <ui className="option-list" style={{ border: "none" }}>
                                                    <li>
                                                        <button>
                                                            <a onClick={() => router.push(`/employers-dashboard/view-invoice/${invoice.invoice_id}`)}>
                                                                <span className="la la-print" title="Print Invoice"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ui>
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.invoice_created_at}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {convertToFullDateFormat(invoice.invoice_date, false)}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    -
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.invoice_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.order_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    -
                                                </span>
                                            </td>
                                            <td>
                                                {invoice.company_name}
                                            </td>
                                            <td>
                                                {invoice.from_city} - {invoice.to_city}
                                            </td>
                                            <td>
                                                -
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.lr_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.vehical_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {invoice.weight}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    -
                                                </span>
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

export default Billing;
