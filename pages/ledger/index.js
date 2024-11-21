import { format } from "date-fns";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import React, { useState, useEffect, useRef } from "react";
import Spinner from "../../components/spinner";
import { supabase } from "../../config/supabaseClient";
import { convertToFullDateFormat } from "../../utils/convertToFullDateFormat";
import {
    convertToSearchFilterDateTimeFrom,
    convertToSearchFilterDateTimeTo,
} from "../../utils/convertToSearchFilterDateTime";
import * as XLSX from "xlsx";
import * as XlsxPopulate from "xlsx-populate/browser/xlsx-populate";
import { Message } from "primereact/message";

const Ledger = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const toast = useRef(null);

    const [fetchedLedgerData, setFetchedLedgerData] = useState([]);
    const [totalDebitAmount, setTotalDebitAmount] = useState(0);
    const [totalCreditAmount, setTotalCreditAmount] = useState(0);

    const [searchInvoiceDateFrom, setSearchInvoiceDateFrom] = useState();
    const [searchInvoiceDateTo, setSearchInvoiceDateTo] = useState();
    const [clientNames, setClientNames] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [searchInvoiceDateFromError, setSearchInvoiceDateFromError] =
        useState();
    const [searchInvoiceDateToError, setSearchInvoiceDateToError] = useState();
    const [selectedClientError, setSelectedClientError] = useState();

    // clear all filters
    const clearAll = () => {
        setSearchInvoiceDateFrom();
        setSearchInvoiceDateTo();
        setSelectedClient(null);
        setFetchedLedgerData([]);
        setSearchInvoiceDateFromError();
        setSearchInvoiceDateToError();
        setSelectedClientError();
    };

    const validateSearchFilters = (data) => {
        let isValid = true;
        if (!searchInvoiceDateFrom) {
            setSearchInvoiceDateFromError("Select ledger start date");
            isValid = false;
        } else {
            setSearchInvoiceDateFromError("");
        }

        if (!searchInvoiceDateTo) {
            setSearchInvoiceDateToError("Select ledger end date");
            isValid = false;
        } else {
            setSearchInvoiceDateToError("");
        }

        if (!selectedClient) {
            setSelectedClientError("Select a client");
            isValid = false;
        } else {
            setSelectedClientError("");
        }

        if (!isValid) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Please fill all listed required fields",
            });
        }

        return isValid;
    };

    async function fetchLedger() {
        setIsLoading(true);
        setLoadingText("Finding Ledger...");

        if (validateSearchFilters()) {
            // fetch Ledger
            try {
                let query = supabase
                    .from("ledger_view")
                    .select("*")
                    .eq("client_name", selectedClient)
                    .gte(
                        "invoice_created_at",
                        convertToSearchFilterDateTimeFrom(searchInvoiceDateFrom)
                    )
                    .lte(
                        "invoice_created_at",
                        convertToSearchFilterDateTimeTo(searchInvoiceDateTo)
                    )
                    .order("invoice_number", {
                        ascending: false,
                        nullsFirst: false,
                    });

                let { data: ledgerData, error } = await query;

                if (ledgerData) {
                    setFetchedLedgerData(ledgerData);

                    var totalDebAmount = 0;
                    var totalCredAmount = 0;
                    for (let i = 0; i < ledgerData.length; i++) {
                        totalDebAmount =
                            totalDebAmount + ledgerData[i].total_amount;
                        if (ledgerData[i].is_paid) {
                            totalCredAmount =
                                totalCredAmount + ledgerData[i].total_amount;
                        }
                    }
                    setTotalDebitAmount(totalDebAmount);
                    setTotalCreditAmount(totalCredAmount);

                    setIsLoading(false);
                    setLoadingText("");
                } else {
                    // error toast
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Error While getting ledger data",
                    });
                    setIsLoading(false);
                    setLoadingText("");
                }
            } catch (e) {
                // show error toast
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Error While getting ledger data, Please try again or contact tech support!",
                });

                // console.warn(e);
                setIsLoading(false);
                setLoadingText("");
            }
        } else {
            setIsLoading(false);
            setLoadingText("");
        }
    }

    async function fetchClientNames() {
        setIsLoading(true);
        setLoadingText("");

        let { data: ledgerClientData, error } = await supabase
            .from("ledger_view")
            .select("client_name", { distinct: true });

        if (ledgerClientData) {
            // find unique client names
            const uniqueLedgerClientNames = [
                ...new Map(
                    ledgerClientData.map((item) => [item["client_name"], item])
                ).values(),
            ];
            // set unique client names
            const allLedgerClientNames = [];
            for (let i = 0; i < uniqueLedgerClientNames.length; i++) {
                allLedgerClientNames.push(
                    uniqueLedgerClientNames[i].client_name
                );
            }
            allLedgerClientNames.sort();
            setClientNames(allLedgerClientNames);

            setIsLoading(false);
            setLoadingText("");
        } else {
            setIsLoading(false);
            setLoadingText("");
        }
    }

    useEffect(() => {
        fetchClientNames();
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
            bookSST: false,
            type: "binary",
        };

        const wbout = XLSX.write(workbook, wopts);

        const blob = new Blob([s2ab(wbout)], {
            type: "application/octet-stream",
        });

        return blob;
    };

    const createDownloadData = () => {
        handleExport().then((url) => {
            console.log(url);
            const downloadFile = document.createElement("a");
            downloadFile.setAttribute("href", url);
            downloadFile.setAttribute("download", "Raftaar-Ledger.xlsx");
            downloadFile.click();
            downloadFile.remove();
        });
    };

    const handleExport = (e) => {
        var wb = XLSX.utils.book_new();

        // create a worksheet
        const sheet = XLSX.utils.table_to_sheet(
            document.getElementById("ledgerTable"),
            {
                skipHeader: true,
            }
        );

        XLSX.utils.book_append_sheet(wb, sheet, "Ledger");

        const workbookBlob = workbook2blob(wb);

        const dataInfo = {
            titleCell: "A2:A3",
            firstTitleRange: "C4:C6",
            lastTitleRange: "C8:C10",
            theaderRange: "A12:F12",
            tbodyRange: `A13:F${13 + fetchedLedgerData.length + 2}`,
            // tbodyDateRange: `A6:A${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}`,
            // tbodyPartyNameRange: `C6:C${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}`,
            // tbodyDueAmountRange: `E4:G${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 2)}`,
            // tbodyClientTotalDueAmountRange: `D${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 3)}
            //                                 :G${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 3)}`,
            tbodyLastRowRange: `A${13 + fetchedLedgerData.length + 2}:F${
                13 + fetchedLedgerData.length + 2
            }`,
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
        return XlsxPopulate.fromDataAsync(workbookBlob).then((workbook) => {
            workbook.sheets().forEach((sheet) => {
                sheet.column("A").width(15);
                sheet.column("B").width(20);
                sheet.column("C").width(15);
                sheet.column("D").width(15);
                sheet.column("E").width(15);
                sheet.column("F").width(15);

                sheet.row("3").height(60);
                sheet.row("5").height(30);
                sheet.row("9").height(100);

                // top 2 cells - company name and date
                sheet.range(dataInfo.titleCell).style({
                    fontFamily: "Arial",
                    fontSize: "12px",
                    bold: true,
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                    // fill: "FFFD04",
                    wrapText: true,
                });

                // header
                sheet.range(dataInfo.firstTitleRange).style({
                    fontFamily: "Arial",
                    fontSize: "10px",
                    bold: true,
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                    // topBorder: true,
                    // fill: "FFFD04",
                    wrapText: true,
                });
                sheet.range(dataInfo.lastTitleRange).style({
                    fontFamily: "Arial",
                    fontSize: "10px",
                    bold: true,
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                    // bottomBorder: true,
                    // fill: "FFFD04",
                    wrapText: true,
                });
                sheet.range(dataInfo.theaderRange).style({
                    fontFamily: "Arial",
                    fontSize: "10px",
                    bold: true,
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                    // bottomBorder: true,
                    fill: "FFFD04",
                    wrapText: true,
                    topBorder: true,
                    bottomBorder: true,
                });

                // body
                sheet.range(dataInfo.tbodyRange).style({
                    fontFamily: "Arial",
                    fontSize: "10px",
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                });
                // body due amounts
                // sheet.range(dataInfo.tbodyDueAmountRange).style({
                //     bold: true,
                // });
                // body party names
                // sheet.range(dataInfo.tbodyPartyNameRange).style({
                //     bold: true,
                // });
                // body date
                // sheet.range(dataInfo.tbodyDateRange).style({
                //     bold: true,
                // });
                // body last row
                sheet.range(dataInfo.tbodyLastRowRange).style({
                    bold: true,
                    topBorder: true,
                    bottomBorder: true,
                });
            });

            return workbook
                .outputAsync()
                .then((workbookBlob) => URL.createObjectURL(workbookBlob));
        });
    };

    return (
        <>
            <Spinner isLoading={isLoading} loadingText={loadingText} />
            <Toast ref={toast} appendTo={null} />

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <h5>Ledger</h5>
                        <div className="grid p-fluid mt-1">
                            <div className="col-12">
                                <div className="card">
                                    <h5>Search Filters</h5>
                                    <div className="p-fluid formgrid grid">
                                        <div className="field col-12 lg:col-3 md:col-6">
                                            <label htmlFor="orderCity">
                                                Invoice Date (From)
                                            </label>
                                            <Calendar
                                                value={searchInvoiceDateFrom}
                                                onChange={(e) => {
                                                    setSearchInvoiceDateFrom(
                                                        e.value
                                                    );
                                                }}
                                                readOnlyInput
                                                hideOnRangeSelection
                                            />
                                            {searchInvoiceDateFromError ? (
                                                <Message
                                                    severity="error"
                                                    text={
                                                        searchInvoiceDateFromError
                                                    }
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-3 md:col-6">
                                            <label htmlFor="orderCity">
                                                Invoice Date (To)
                                            </label>
                                            <Calendar
                                                value={searchInvoiceDateTo}
                                                onChange={(e) => {
                                                    setSearchInvoiceDateTo(
                                                        e.value
                                                    );
                                                }}
                                                readOnlyInput
                                                hideOnRangeSelection
                                            />
                                            {searchInvoiceDateToError ? (
                                                <Message
                                                    severity="error"
                                                    text={
                                                        searchInvoiceDateToError
                                                    }
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="field col-12 lg:col-6 md:col-6">
                                            <label htmlFor="ledgerClientName">
                                                Client Name
                                            </label>
                                            <Dropdown
                                                showClear
                                                id="ledgerClientName"
                                                options={clientNames}
                                                placeholder="Select client"
                                                filter
                                                onChange={(e) => {
                                                    setSelectedClient(
                                                        e.target.value
                                                    );
                                                }}
                                                value={selectedClient}
                                            />
                                            {selectedClientError ? (
                                                <Message
                                                    severity="error"
                                                    text={selectedClientError}
                                                />
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-fluid formgrid grid">
                                        <div className="field col-12 lg:col-2 md:col-12">
                                            <Button
                                                type="button"
                                                icon="pi pi-filter-slash"
                                                label="Clear"
                                                onClick={clearAll}
                                                severity="secondary"
                                            />
                                        </div>
                                        <div className="field col-12 lg:col-2 md:col-12">
                                            <Button
                                                type="button"
                                                icon="pi pi-search"
                                                label="Search"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    fetchLedger();
                                                }}
                                                severity="info"
                                            />
                                        </div>
                                    </div>

                                    <Divider />

                                    {fetchedLedgerData.length > 0 ? (
                                        <div className="col-6 mx-auto">
                                            <div className="field col-12">
                                                <Button
                                                    type="button"
                                                    icon="pi pi-file-excel"
                                                    severity="success"
                                                    raised
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        createDownloadData(e);
                                                    }}
                                                    label="Export to Excel"
                                                    className="mr-3"
                                                    placeholder="Top"
                                                    tooltip="Export to Excel"
                                                    tooltipOptions={{
                                                        position: "top",
                                                    }}
                                                />
                                            </div>
                                            <table
                                                id="ledgerTable"
                                                class="ledger-table"
                                            >
                                                <thead></thead>
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
                                                        <td colspan="2">
                                                            RAFTAAR LOGISTICS
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="2">
                                                            {fetchedLedgerData.length >
                                                            0
                                                                ? fetchedLedgerData[0].client_name.toUpperCase()
                                                                : ""}{" "}
                                                            - LEDGER ACCOUNT:
                                                            {searchInvoiceDateFrom
                                                                ? " " +
                                                                  convertToFullDateFormat(
                                                                      format(
                                                                          searchInvoiceDateFrom,
                                                                          "yyyy-MM-dd"
                                                                      ),
                                                                      false
                                                                  )
                                                                : ""}
                                                            {searchInvoiceDateTo
                                                                ? " to " +
                                                                  convertToFullDateFormat(
                                                                      format(
                                                                          searchInvoiceDateTo,
                                                                          "yyyy-MM-dd"
                                                                      ),
                                                                      false
                                                                  )
                                                                : ""}
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td colspan="2">
                                                            RAFTAAR LOGISTICS
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td colspan="2">
                                                            51 & 52 Sinde Colony
                                                            S R P Road Navapura
                                                            Vadodara Gujarat -
                                                            39001
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td colspan="2">
                                                            GSTIN:
                                                            24GFSPS6256B1Z1
                                                        </td>
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
                                                        <td colspan="2">
                                                            {fetchedLedgerData.length >
                                                            0
                                                                ? fetchedLedgerData[0].client_name.toUpperCase()
                                                                : ""}
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td colspan="2">
                                                            {fetchedLedgerData.length >
                                                            0
                                                                ? fetchedLedgerData[0]
                                                                      .address1 +
                                                                  ", " +
                                                                  fetchedLedgerData[0]
                                                                      .address2 +
                                                                  ", " +
                                                                  fetchedLedgerData[0]
                                                                      .area +
                                                                  ", " +
                                                                  fetchedLedgerData[0]
                                                                      .city +
                                                                  ", " +
                                                                  fetchedLedgerData[0]
                                                                      .state +
                                                                  ", " +
                                                                  fetchedLedgerData[0]
                                                                      .pin
                                                                : ""}
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td colspan="2">
                                                            GSTIN:{" "}
                                                            {fetchedLedgerData.length >
                                                            0
                                                                ? fetchedLedgerData[0]
                                                                      .client_gst
                                                                : ""}
                                                        </td>
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
                                                    <tr
                                                        style={{
                                                            backgroundColor:
                                                                "yellow",
                                                        }}
                                                    >
                                                        <td>Date</td>
                                                        <td>Particular</td>
                                                        <td>Vch Type</td>
                                                        <td>Vch No</td>
                                                        <td>Debit</td>
                                                        <td>Credit</td>
                                                    </tr>
                                                    {fetchedLedgerData.map(
                                                        (ledger) => (
                                                            <>
                                                                <tr>
                                                                    <td>
                                                                        {ledger.invoice_created_at
                                                                            ? convertToFullDateFormat(
                                                                                  format(
                                                                                      ledger.invoice_created_at,
                                                                                      "yyyy-MM-dd"
                                                                                  ),
                                                                                  false
                                                                              )
                                                                            : ""}
                                                                    </td>
                                                                    <td>
                                                                        Freight
                                                                        Income
                                                                    </td>
                                                                    <td>
                                                                        Sales
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            ledger.invoice_number
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            ledger.total_amount
                                                                        }
                                                                    </td>
                                                                    <td></td>
                                                                </tr>
                                                                {ledger.is_paid ? (
                                                                    <tr>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td>
                                                                            {ledger.is_paid
                                                                                ? ledger.total_amount
                                                                                : ""}
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </>
                                                        )
                                                    )}
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
                                                        <td>
                                                            {totalDebitAmount}
                                                        </td>
                                                        <td>
                                                            {totalCreditAmount}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="col-12">
                                            <h6>
                                                There is no invoice exists in
                                                given Search Criteria.
                                            </h6>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Ledger;
