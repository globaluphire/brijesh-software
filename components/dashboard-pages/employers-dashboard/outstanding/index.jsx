/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
/* eslint-disable dot-notation */
/* eslint-disable no-irregular-whitespace */
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
import { convertToSearchFilterDateTimeFrom, convertToSearchFilterDateTimeTo } from "../../../../utils/convertToSearchFilterDateTime";
import * as XLSX from "xlsx";
import * as XlsxPopulate from "xlsx-populate/browser/xlsx-populate";

const addSearchFilters = {
    clientName: ""
};

const index = () => {
    const [validated, setValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [tbodyCellCounter, setTbodyCellCounter] = useState(0);

    const [todayDate, setTodayDate] = useState(new Date());
    const [totalAmountLessThanOneDay, setTotalAmountLessThanOneDay] = useState(0);
    const [totalAmountGreaterThanOneDay, setTotalAmountGreaterThanOneDay] = useState(0);

    const [fetchedOutstandingData, setFetchedOutstandingData] = useState({});
    const [totalDebitAmount, setTotalDebitAmount] = useState(0);

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
        setSelectedClient([]);
        setFetchedOutstandingData([]);
        // setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
    };

    function getTotalAmountLessThanOneDayByClient (outstandingClient) {
        let lessThanOneDay = 0;
        for (let i=0; i<outstandingClient.length; i++) {
            if (((todayDate.getTime() - new Date(outstandingClient[i].invoice_created_at).getTime()) / (1000 * 60 * 60 * 24)) < 1) {
                lessThanOneDay += outstandingClient[i].total_amount;
            }
        }

        return lessThanOneDay;
    };

    function getTotalAmountGreaterThanOneDayByClient (outstandingClient) {
        let greaterThanOneDay = 0;
        for (let i=0; i<outstandingClient.length; i++) {
            if (((todayDate.getTime() - new Date(outstandingClient[i].invoice_created_at).getTime()) / (1000 * 60 * 60 * 24)) > 1) {
                greaterThanOneDay += outstandingClient[i].total_amount;
            }
        }

        return greaterThanOneDay;
    };

    function getDateComparedTotalAmount (outstandingData) {
        let lessThanOneDay = 0;
        let greaterThanOneDay = 0;
        for (let i=0; i<outstandingData.length; i++) {
            if (((todayDate.getTime() - new Date(outstandingData[i].invoice_created_at).getTime()) / (1000 * 60 * 60 * 24)) < 1) {
                lessThanOneDay += outstandingData[i].total_amount;
            } else {
                greaterThanOneDay += outstandingData[i].total_amount;
            }
        }

        setTotalAmountLessThanOneDay(lessThanOneDay);
        setTotalAmountGreaterThanOneDay(greaterThanOneDay);
    };

    function getTotalAmount (outstandingClient) {
        let totalAmount = 0;
        for (let i=0; i<outstandingClient.length; i++) {
            totalAmount += outstandingClient[i].total_amount;
        }
        return totalAmount;
    };

    async function fetchedOutstanding(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters) {
        setIsLoading(true);
        setLoadingText("Finding Outstanding collections...");

        if (searchInvoiceDateFrom && searchInvoiceDateTo) {
            // fetch Ledger
            try {

                let query = supabase
                    .from("ledger_view")
                    .select("*")
                    .eq("is_paid", false)
                    .gte("invoice_created_at", convertToSearchFilterDateTimeFrom(searchInvoiceDateFrom))
                    .lte("invoice_created_at", convertToSearchFilterDateTimeTo(searchInvoiceDateTo));

                    if (selectedClient.length > 0) {
                        query.eq("client_name", selectedClient);
                    }

                let { data: outstandingData, error } = await query;

                if (outstandingData) {
                    getDateComparedTotalAmount(outstandingData);
                    setTbodyCellCounter(outstandingData.length);

                    const sortedOutstandingData = outstandingData.reduce((acc, cv) => {
                        if(acc[cv.client_name] && acc[cv.client_name].length > 0) acc[cv.client_name].push(cv);
                        else acc[cv.client_name] = [cv];
                        return acc;
                    }, {});

                    console.log(sortedOutstandingData);

                    setFetchedOutstandingData(sortedOutstandingData);

                    var totalDebAmount = 0;
                    for (let i=0; i<outstandingData.length; i++) {
                        totalDebAmount = totalDebAmount + outstandingData[i].total_amount;
                    }
                    setTotalDebitAmount(totalDebAmount);

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
                "Please provide Date Range!",
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
            // find unique client names
            const uniqueLedgerClientNames = [
                ...new Map(ledgerClientData.map((item) => [item["client_name"], item])).values()
            ];
            // set unique client names
            const allLedgerClientNames = [];
            for (let i = 0; i < uniqueLedgerClientNames.length; i++) {
                allLedgerClientNames.push(uniqueLedgerClientNames[i].client_name);
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

    const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);

        const view = new Uint8Array(buf);

        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i);
        }

        return buf;
    };

    const workbook2blob = (workbook) => {

        const wopts = {
            bookType: "xlsx",
            type: "binary"
        };

        const wbout = XLSX.write(workbook, wopts);

        const blob = new Blob([s2ab(wbout)], {
            type: "application/octet-stream",
        });

        return blob;
    };

    const createDownloadData = () => {
        handleExport().then(url => {
            console.log(url);
            const downloadFile = document.createElement("a");
            downloadFile.setAttribute("href", url);
            downloadFile.setAttribute("download", "Raftaar-Outstanding-report.xlsx");
            downloadFile.click();
            downloadFile.remove();
        });
    };

    const handleExport = (e) => {
        
        var wb = XLSX.utils.book_new();
        
        // create a worksheet
        const sheet = XLSX.utils.table_to_sheet(document.getElementById("ledgerTable"), {
            skipHeader: true,
        });

        XLSX.utils.book_append_sheet(wb, sheet, "Outstanding Report");

        const workbookBlob = workbook2blob(wb);

        const dataInfo = {
            titleCell: "A2:A3",
            firstTitleRange: "A4:H4",
            lastTitleRange: "A5:H5",
            tbodyRange: `A6:H${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}`,
            tbodyDateRange: `A6:A${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}`,
            tbodyPartyNameRange: `C6:C${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}`,
            tbodyDueAmountRange: `E4:G${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}`,
            // tbodyClientTotalDueAmountRange: `D${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 3)}
            //                                 :G${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 3)}`,
            tbodyLastRowRange: `A${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}:H${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}`,
        };

        return addStyles(workbookBlob, dataInfo);


        // XLSX.writeFile(
        //     wb,
        //     "Outstanding-" + selectedClient + "-" + format(searchInvoiceDateFrom, "yyyy_MM_dd") + "-" + format(searchInvoiceDateTo, "yyyy_MM_dd") + ".xlsx"
        //     // {cellStyles: true}
        // );
        // return false;
    };

    const addStyles = (workbookBlob, dataInfo) => {
        return XlsxPopulate.fromDataAsync(workbookBlob).then(workbook => {
            workbook.sheets().forEach(sheet => {
                // sheet.useRange.style({
                //     fontFamily: "Arial",
                //     verticalAlignment: "center",
                // });
                
                sheet.column("A").width(25);
                sheet.column("B").width(10);
                sheet.column("C").width(35);
                sheet.column("D").width(10);
                sheet.column("E").width(10);
                sheet.column("F").width(10);
                sheet.column("G").width(10);
                sheet.column("H").width(10);

                // top 2 cells - company name and date
                sheet.range(dataInfo.titleCell).style({
                    fontFamily: "Arial",
                    fontSize: "12px",
                    bold: true,
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                    // fill: "FFFD04",
                    border: true
                });

                // header
                sheet.range(dataInfo.firstTitleRange).style({
                    fontFamily: "Arial",
                    fontSize: "10px",
                    bold: true,
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                    topBorder: true,
                    // fill: "FFFD04"
                });
                sheet.range(dataInfo.lastTitleRange).style({
                    fontFamily: "Arial",
                    fontSize: "10px",
                    bold: true,
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                    bottomBorder: true,
                    // fill: "FFFD04"
                });

                // body
                sheet.range(dataInfo.tbodyRange).style({
                    fontFamily: "Arial",
                    fontSize: "10px",
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                });
                // body due amounts
                sheet.range(dataInfo.tbodyDueAmountRange).style({
                    bold: true,
                });
                // body party names
                sheet.range(dataInfo.tbodyPartyNameRange).style({
                    bold: true,
                });
                // body date
                sheet.range(dataInfo.tbodyDateRange).style({
                    bold: true,
                });
                // body last row
                sheet.range(dataInfo.tbodyLastRowRange).style({
                    bold: true,
                    topBorder: true,
                    bottomBorder: true,
                });


            });

            return workbook.outputAsync().then(workbookBlob => URL.createObjectURL(workbookBlob));
        });
    };

    // exportCSV(headers, values, fileName) {
    //           let csv = "";
    //           const header = headers.join(",");
    //           const value = values.map((o) => Object.values(o).join(",")).join("\n");
    //      
    //           csv += header + "\n" + value;
    //           const link = document.createElement("a");
    //           link.id = "download-csv";
    //           link.setAttribute("href", "data:text/plain;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csv));
    //           // link.setAttribute("download", this.locale ? "accounts.csv" : "comptes.csv");
    //           link.setAttribute("download", fileName);
    //           document.body.appendChild(link);
    //           document.querySelector("#download-csv").click();
    //           document.querySelector("#download-csv").remove();
    //         },
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
                                        <h2><b>Outstanding Collection!</b></h2>
                                    </div>

                                    <Spinner isLoading={isLoading} loadingText={loadingText} />

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
                                                                fetchedOutstanding(searchInvoiceDateFrom, searchInvoiceDateTo, searchFilters);
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
                                                        { Object.keys(fetchedOutstandingData).length !== 0 ?
                                                            <>
                                                                {/* Form Submit Buttons Block Starts */}
                                                                <Row className="mt-3">
                                                                    <Form.Group as={Col} md="1" className="chosen-single form-input chosen-container mx-3 mb-1">
                                                                        <Button
                                                                            type="submit"
                                                                            variant="success"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                createDownloadData(e);
                                                                            }}
                                                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                                                        >
                                                                            Export Outstandings
                                                                        </Button>
                                                                    </Form.Group>
                                                                </Row>
                                                                {/* Form Submit Buttons Block Ends */}

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
                                                                            <td></td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>RAFTAAR LOGISTICS</td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                {searchInvoiceDateFrom ? " " + convertToFullDateFormat(format(searchInvoiceDateFrom, "yyyy-MM-dd"), false) : ""}
                                                                                {searchInvoiceDateTo ? " to " + convertToFullDateFormat(format(searchInvoiceDateTo, "yyyy-MM-dd"), false) : ""}
                                                                            </td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr style={{ backgroundColor: "yellow" }}>
                                                                            <td>Date</td>
                                                                            <td>Invoice No</td>
                                                                            <td>Party's Name</td>
                                                                            <td>Opening</td>
                                                                            <td>Pending</td>
                                                                            <td>(&lt;1 day)</td>
                                                                            <td>(1-31 day)</td>
                                                                            <td>Due On</td>
                                                                        </tr>
                                                                        <tr style={{ backgroundColor: "yellow" }}>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td>Amount</td>
                                                                            <td>Amount</td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                        </tr>
                                                                        { Object.values(fetchedOutstandingData).map((outstandingClient) => {
                                                                            return (
                                                                                <>
                                                                                    <tr>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td>{outstandingClient[0].client_name}</td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                    </tr>
                                                                                    { outstandingClient.map((outstanding) => {
                                                                                        return (
                                                                                            <tr>
                                                                                                <td>{outstanding.invoice_created_at ? convertToFullDateFormat(format(outstanding.invoice_created_at, "yyyy-MM-dd"), false) : ""}</td>
                                                                                                <td>{outstanding.invoice_number}</td>
                                                                                                <td></td>
                                                                                                <td>{outstanding.total_amount}.00 Dr</td>
                                                                                                <td>{outstanding.total_amount}.00 Dr</td>
                                                                                                { ((todayDate.getTime() - new Date(outstanding.invoice_created_at).getTime()) / (1000 * 60 * 60 * 24)) < 1 ?
                                                                                                    <>
                                                                                                        <td>
                                                                                                            {outstanding.total_amount}.00 Dr
                                                                                                        </td>
                                                                                                        <td></td>
                                                                                                    </>
                                                                                                :   <>
                                                                                                        <td></td>
                                                                                                        <td>{outstanding.total_amount}.00 Dr</td>
                                                                                                    </>
                                                                                                }
                                                                                                <td>{outstanding.invoice_created_at ? convertToFullDateFormat(format(outstanding.invoice_created_at, "yyyy-MM-dd"), false) : ""}</td>
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                    <tr>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td>
                                                                                            {getTotalAmount(outstandingClient)}.00 Dr
                                                                                        </td>
                                                                                        <td>
                                                                                            {getTotalAmount(outstandingClient)}.00 Dr
                                                                                        </td>
                                                                                        <td>{getTotalAmountLessThanOneDayByClient(outstandingClient)}.00 Dr</td>
                                                                                        <td>{getTotalAmountGreaterThanOneDayByClient(outstandingClient)}.00 Dr</td>
                                                                                        <td></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>&nbsp;</td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                    </tr>
                                                                                </>
                                                                            );
                                                                        })}
                                                                        <tr>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td>{totalDebitAmount}.00 Dr</td>
                                                                            <td>{totalDebitAmount}.00 Dr</td>
                                                                            <td>{totalAmountLessThanOneDay}.00 Dr</td>
                                                                            <td>{totalAmountGreaterThanOneDay}.00 Dr</td>
                                                                            <td></td>
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
                                                                                createDownloadData(e);
                                                                            }}
                                                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                                                        >
                                                                            Export Outstandings
                                                                        </Button>
                                                                    </Form.Group>
                                                                </Row>
                                                                {/* Form Submit Buttons Block Ends */}
                                                            </>
                                                        : <h5>There is no Outstanding in given Search Criteria.</h5> }
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
