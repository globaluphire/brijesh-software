/* eslint-disable no-unused-vars */
import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import Spinner from "../../../spinner/spinner";
import CalendarComp from "../../../date/CalendarComp";
import { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const addSearchFilters = {
    clientName: ""
};

const index = () => {
    const [validated, setValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    const [searchInvoiceDateFrom, setSearchInvoiceDateFrom] = useState();
    const [searchInvoiceDateTo, setSearchInvoiceDateTo] = useState();
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const {
        clientName
    } = useMemo(
        () => searchFilters,
        [searchFilters]
    );

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
    };

    // async function findInvoice(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters) {
    //     setIsLoading(true);

    //     let query = supabase
    //         .from("invoice")
    //         .select("*")
    //         .lt("invoice_created_at", "2024-06-01")
    //         .ilike("company_name", "%" + searchFilters.clientName + "%");

    //     if (searchInvoiceDateFrom) {
    //         query.gte("invoice_date", format(searchInvoiceDateFrom, "yyyy-MM-dd"));
    //     }
    //     if (searchInvoiceDateTo) {
    //         query.lte("invoice_date", format(searchInvoiceDateTo, "yyyy-MM-dd"));
    //     }
    //     if (searchInvoiceDateFrom && searchInvoiceDateTo) {
    //         query.gte("invoice_date", format(searchInvoiceDateFrom, "yyyy-MM-dd"));
    //         query.lte("invoice_date", format(searchInvoiceDateTo, "yyyy-MM-dd"));
    //     }

    //     // setTotalRecords((await query).data.length);

    //     let { data, error } = await query.order("invoice_created_at", {
    //         ascending: false,
    //         nullsFirst: false,
    //     });
    //     // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

    //     // if (facility) {
    //     //     data = data.filter((i) => i.facility_name === facility);
    //     // }

    //     if (data) {
    //         data.forEach(
    //             (invoice) =>
    //                 (invoice.invoice_created_at = dateTimeFormat(invoice.invoice_created_at))
    //         );
    //         setFetchedInvoicedata(data);

    //         // creating new array object for CSV export
    //         const invoiceDataCSV = data.map(({ invoice_id, order_id, lr_id, invoice_date, ...rest }) => ({ ...rest }));
    //         setFetchedInvoicedataCSV(invoiceDataCSV);
    //     }
    //     setIsLoading(false);
    // }

    const handleSubmit = (e) => {
        var wb = XLSX.utils.table_to_book(document.getElementById("sampletable"));
        XLSX.writeFile(wb, "sample.xlsx");
        return false;
    };

    return (
        <div className="page-wrapper dashboard">
            <span className="header-span"></span>
            {/* <!-- Header Span for hight --> */}

            <LoginPopup />
            {/* End Login Popup Modal */}

            <DashboardHeader />
            {/* End Header */}

            <MobileMenu />
            {/* End MobileMenu */}

            <DashboardEmployerSidebar />
            {/* <!-- End User Sidebar Menu --> */}

            {/* <!-- Dashboard --> */}
            <section className="user-dashboard">
                <div>
                    {/* <BreadCrumb title="Hired Applicants!" /> */}
                    {/* breadCrumb */}

                    <MenuToggler />
                    {/* Collapsible sidebar button */}

                    <div className="row">
                        <div className="col-lg-12">
                            {/* <!-- Ls widget --> */}
                            <div className="ls-widget">
                                <div className="tabs-box">
                                    <div className="widget-title">
                                        <h2><b>Ledgers!</b></h2>
                                    </div>

                                    <Spinner isLoading={isLoading} loadingText={loadingText} />

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
                                                        name="clientNameFilterBilling"
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
                                            </Row>
                                            
                                            <Row className="mx-3">
                                                <Col>
                                                    <Form.Group className="chosen-single form-input chosen-container mb-3">
                                                        <Button
                                                            variant="primary"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                // findInvoice(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters);
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
                                        </div>
                                    </Form>

                                    <span className="horizontal-divider" style={{ marginTop: "-20px" }}>
                                    </span>

                                    <div className="auto-container">
                                        <div className="invoice-wrap">
                                            <div className="invoice-content">
                                                <div className="table-outer">
                                                    <div className="widget-content">
                                                        {/* <PostJobSteps /> */}
                                                        {/* End job steps form */}
                                                        <table id="sampletable" class="default-table manage-job-table ledger-table">
                                                            <thead>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>&nbsp;</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="2">RAFTAAR LOGISTICS</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="2">AGL CERAMIC LEDGER ACCOUNT: 1-Jan-24 to 16-May-24</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td colspan="2">RAFTAAR LOGISTICS</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td colspan="2">51 & 52 Sinde Colony S R P  Road Navapura Vadodara Gujarat - 39001</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td colspan="2">GSTIN: 24GFSPS6256B1Z1</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>&nbsp;</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td colspan="2">AGL CERAMIC</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td colspan="2">Shop No: F-4 and 5, 1st Floor, Parshwa Darshan Complex, Cow Circle Cross Road, Akota Vadodara</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>&nbsp;</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Date</td>
                                                                    <td>Particular</td>
                                                                    <td>Vch Type</td>
                                                                    <td>Vch No</td>
                                                                    <td>Debit</td>
                                                                    <td>Credit</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>1/1/2024</td>
                                                                    <td>XYZ.LLC</td>
                                                                    <td>Sales</td>
                                                                    <td>GB0001</td>
                                                                    <td>50</td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td>50</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>5/1/2024</td>
                                                                    <td>ABC.LLC</td>
                                                                    <td>Sales</td>
                                                                    <td>GB0005</td>
                                                                    <td>100</td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>&nbsp;</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>&nbsp;</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td>Closing Balance</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td>150</td>
                                                                    <td>50</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        {/* Form Submit Buttons Block Starts */}
                                                        <Row className="mt-3">
                                                            <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mx-3 mb-1">
                                                                <Button
                                                                    type="submit"
                                                                    variant="success"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleSubmit(e);
                                                                    }}
                                                                    className="btn btn-add-lr btn-sm text-nowrap m-1"
                                                                >
                                                                    Export Ledger
                                                                </Button>
                                                            </Form.Group>
                                                        </Row>
                                                        {/* Form Submit Buttons Block Ends */}
                                                        {/* End post box form */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* End .row */}
                </div>
                {/* End dashboard-outer */}
            </section>
            {/* <!-- End Dashboard --> */}

            <CopyrightFooter />
            {/* <!-- End Copyright --> */}
        </div>
        // End page-wrapper
    );
};

export default index;
