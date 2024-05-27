/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import Spinner from "../../../spinner/spinner";
import CalendarComp from "../../../date/CalendarComp";
import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { convertToFullDateFormat } from "../../../../utils/convertToFullDateFormat";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { supabase } from "../../../../config/supabaseClient";
import { Typeahead } from "react-bootstrap-typeahead";

const addSearchFilters = {
    clientName: ""
};

const index = () => {
    const [validated, setValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    const [fetchedLedgerData, setFetchedLedgerData] = useState([]);
    const [totalDebitAmount, setTotalDebitAmount] = useState(0);
    const [totalCreditAmount, setTotalCreditAmount] = useState(0);

    const [searchInvoiceDateFrom, setSearchInvoiceDateFrom] = useState();
    const [searchInvoiceDateTo, setSearchInvoiceDateTo] = useState();
    const [clientNames, setClientNames] = useState([]);
    const [selectedClient, setSelectedClient] = useState([]);
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

    async function fetchedLedger(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters) {
        setIsLoading(true);
        setLoadingText("Finding Ledger...");

        if (searchInvoiceDateFrom && searchInvoiceDateTo && selectedClient) {
            // fetch Ledger
            try {

                let query = supabase
                    .from("ledger_view")
                    .select("*")
                    .eq("client_name", selectedClient)
                    .gte("invoice_created_at", format(searchInvoiceDateFrom, "yyyy-MM-dd"))
                    .lte("invoice_created_at", format(searchInvoiceDateTo, "yyyy-MM-dd"));

                let { data: ledgerData, error } = await query

                if (ledgerData) {

                    setFetchedLedgerData(ledgerData);

                    var totalDebAmount = 0;
                    var totalCredAmount = 0;
                    for (let i=0; i<ledgerData.length; i++) {
                        totalDebAmount = totalDebAmount + ledgerData[i].total_amount;
                        if(ledgerData[i].is_paid) {
                            totalCredAmount = totalCredAmount + ledgerData[i].total_amount;
                        }
                    }
                    setTotalDebitAmount(totalDebAmount);
                    setTotalCreditAmount(totalCredAmount);

                    setIsLoading(false);
                    setLoadingText("");
                } else {
                    toast.error(
                        "Error while finding Ledger data.  Please try again later or contact tech support!",
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
                    setIsLoading(false);
                    setLoadingText("");
                }
            } catch (e) {
                toast.error(
                    "System is unavailable.  Unable to fetch Ledger data.  Please try again later or contact tech support!",
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
                // console.warn(e);
                setIsLoading(false);
                setLoadingText("");
            }
        } else {
            toast.error(
                "Please provide Date and Client Name!",
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
            // console.warn(e);
            setIsLoading(false);
            setLoadingText("");
        }
    }

    async function fetchedClientNames() {
        setIsLoading(true);
        setLoadingText("");
        let { data: ledgerClientData, error } = await supabase
            .from("ledger_view")
            .select("client_name", { distinct: true });
    
        if (ledgerClientData) {
            // set client names
            const allLedgerClientNames = [];
            for (let i = 0; i < ledgerClientData.length; i++) {
                allLedgerClientNames.push(ledgerClientData[i].client_name);
            }
            allLedgerClientNames.sort();
            setClientNames(allLedgerClientNames);
            setIsLoading(false);
            setLoadingText("");
        } else {
            setIsLoading(false);
            setLoadingText("");
        }

    };

    useEffect(() => {
        fetchedClientNames();
    }, []);

    const handleSubmit = (e) => {
        var wb = XLSX.utils.table_to_book(document.getElementById("ledgerTable"));
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
                                                    <Typeahead
                                                        id="clientName"
                                                        onChange={setSelectedClient}
                                                        className="form-group"
                                                        options={clientNames}
                                                        selected={selectedClient}
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
                                                                fetchedLedger(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters);
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

                                    <div className="auto-container pb-5">
                                        <div className="invoice-wrap">
                                            <div className="invoice-content">
                                                <div className="table-outer">
                                                    <div className="widget-content">
                                                        {/* <PostJobSteps /> */}
                                                        {/* End job steps form */}
                                                        {}
                                                        <table id="ledgerTable" class="default-table manage-job-table ledger-table">
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
                                                                    <td colspan="2">{fetchedLedgerData.length > 0 ? fetchedLedgerData[0].client_name.toUpperCase() : ""} LEDGER ACCOUNT:
                                                                        {searchInvoiceDateFrom ? " " + convertToFullDateFormat(format(searchInvoiceDateFrom, "yyyy-MM-dd"), false) : ""}
                                                                        {searchInvoiceDateTo ? " to " + convertToFullDateFormat(format(searchInvoiceDateTo, "yyyy-MM-dd"), false) : ""}
                                                                    </td>
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
                                                                    <td colspan="2">{fetchedLedgerData.length > 0 ? fetchedLedgerData[0].client_name.toUpperCase() : ""}</td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td colspan="2">
                                                                        { fetchedLedgerData.length > 0 ?
                                                                            fetchedLedgerData[0].address1 + ", " +
                                                                            fetchedLedgerData[0].address2 + ", " +
                                                                            fetchedLedgerData[0].area + ", " +
                                                                            fetchedLedgerData[0].city + ", " +
                                                                            fetchedLedgerData[0].state + ", " +
                                                                            fetchedLedgerData[0].pin
                                                                        : "" }
                                                                    </td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td colspan="2">GSTIN: { fetchedLedgerData.length > 0 ? fetchedLedgerData[0].client_gst : "" }</td>
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
                                                                { fetchedLedgerData.map((ledger) => (
                                                                    <>
                                                                        <tr>
                                                                            <td>{ledger.invoice_created_at ? convertToFullDateFormat(format(ledger.invoice_created_at, "yyyy-MM-dd"), false) : ""}</td>
                                                                            <td>XYZ.LLC</td>
                                                                            <td>Sales</td>
                                                                            <td>{ledger.invoice_number}</td>
                                                                            <td>{ledger.total_amount}</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        { ledger.is_paid ?
                                                                            <tr>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td>{ledger.is_paid ? ledger.total_amount : ""}</td>
                                                                            </tr>
                                                                        : "" }
                                                                    </>
                                                                ))}
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
                                                                    <td>{totalDebitAmount}</td>
                                                                    <td>{totalCreditAmount}</td>
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
