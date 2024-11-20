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

const Outstandings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const toast = useRef(null);
  const [tbodyCellCounter, setTbodyCellCounter] = useState(0);

  const [todayDate, setTodayDate] = useState(new Date());
  const [totalAmountLessThanOneDay, setTotalAmountLessThanOneDay] = useState(0);
  const [totalAmountGreaterThanOneDay, setTotalAmountGreaterThanOneDay] =
    useState(0);

  const [fetchedOutstandingData, setFetchedOutstandingData] = useState({});
  const [totalDebitAmount, setTotalDebitAmount] = useState(0);

  const [searchInvoiceDateFrom, setSearchInvoiceDateFrom] = useState();
  const [searchInvoiceDateTo, setSearchInvoiceDateTo] = useState();
  const [clientNames, setClientNames] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [searchInvoiceDateFromError, setSearchInvoiceDateFromError] =
    useState();
  const [searchInvoiceDateToError, setSearchInvoiceDateToError] = useState();

  // clear all filters
  const clearAll = () => {
    setSearchInvoiceDateFrom();
    setSearchInvoiceDateTo();
    setSelectedClient(null);
    setFetchedOutstandingData({});
    setSearchInvoiceDateFromError();
    setSearchInvoiceDateToError();
  };

  const validateSearchFilters = (data) => {
    let isValid = true;
    if (!searchInvoiceDateFrom) {
      setSearchInvoiceDateFromError("Select outstandings start date");
      isValid = false;
    } else {
      setSearchInvoiceDateFromError("");
    }

    if (!searchInvoiceDateTo) {
      setSearchInvoiceDateToError("Select outstandings end date");
      isValid = false;
    } else {
      setSearchInvoiceDateToError("");
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

  function getTotalAmountLessThanOneDayByClient(outstandingClient) {
    let lessThanOneDay = 0;
    for (let i = 0; i < outstandingClient.length; i++) {
      if (
        (todayDate.getTime() -
          new Date(outstandingClient[i].invoice_created_at).getTime()) /
          (1000 * 60 * 60 * 24) <
        1
      ) {
        lessThanOneDay += outstandingClient[i].total_amount;
      }
    }

    return lessThanOneDay;
  }

  function getTotalAmountGreaterThanOneDayByClient(outstandingClient) {
    let greaterThanOneDay = 0;
    for (let i = 0; i < outstandingClient.length; i++) {
      if (
        (todayDate.getTime() -
          new Date(outstandingClient[i].invoice_created_at).getTime()) /
          (1000 * 60 * 60 * 24) >
        1
      ) {
        greaterThanOneDay += outstandingClient[i].total_amount;
      }
    }

    return greaterThanOneDay;
  }

  function getDateComparedTotalAmount(outstandingData) {
    let lessThanOneDay = 0;
    let greaterThanOneDay = 0;
    for (let i = 0; i < outstandingData.length; i++) {
      if (
        (todayDate.getTime() -
          new Date(outstandingData[i].invoice_created_at).getTime()) /
          (1000 * 60 * 60 * 24) <
        1
      ) {
        lessThanOneDay += outstandingData[i].total_amount;
      } else {
        greaterThanOneDay += outstandingData[i].total_amount;
      }
    }

    setTotalAmountLessThanOneDay(lessThanOneDay);
    setTotalAmountGreaterThanOneDay(greaterThanOneDay);
  }

  function getTotalAmount(outstandingClient) {
    let totalAmount = 0;
    for (let i = 0; i < outstandingClient.length; i++) {
      totalAmount += outstandingClient[i].total_amount;
    }
    return totalAmount;
  }

  async function fetchOutstandings() {
    setIsLoading(true);
    setLoadingText("Finding Outstanding collections...");

    if (validateSearchFilters()) {
      // fetch Ledger
      try {
        let query = supabase
          .from("ledger_view")
          .select("*")
          .eq("is_paid", false)
          .gte(
            "invoice_created_at",
            convertToSearchFilterDateTimeFrom(searchInvoiceDateFrom)
          )
          .lte(
            "invoice_created_at",
            convertToSearchFilterDateTimeTo(searchInvoiceDateTo)
          );

        if (selectedClient && selectedClient.length > 0) {
          query.eq("client_name", selectedClient);
        }

        let { data: outstandingData, error } = await query;

        if (outstandingData) {
          getDateComparedTotalAmount(outstandingData);
          setTbodyCellCounter(outstandingData.length);

          const sortedOutstandingData = outstandingData.reduce((acc, cv) => {
            if (acc[cv.client_name] && acc[cv.client_name].length > 0)
              acc[cv.client_name].push(cv);
            else acc[cv.client_name] = [cv];
            return acc;
          }, {});

          setFetchedOutstandingData(sortedOutstandingData);

          var totalDebAmount = 0;
          for (let i = 0; i < outstandingData.length; i++) {
            totalDebAmount = totalDebAmount + outstandingData[i].total_amount;
          }
          setTotalDebitAmount(totalDebAmount);

          setIsLoading(false);
          setLoadingText("");
        } else {
          // error toast
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Error While getting Outstanding data",
          });
          setIsLoading(false);
          setLoadingText("");
        }
      } catch (e) {
        // show error toast
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            "Error While getting Outstanding data, Please try again or contact tech support!",
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
      downloadFile.setAttribute("download", "Raftaar-Outstanding-report.xlsx");
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

    XLSX.utils.book_append_sheet(wb, sheet, "Outstanding Report");

    const workbookBlob = workbook2blob(wb);

    const dataInfo = {
      titleCell: "A2:A3",
      firstTitleRange: "A4:H4",
      lastTitleRange: "A5:H5",
      tbodyRange: `A6:H${
        6 + tbodyCellCounter + Object.values(fetchedOutstandingData).length * 2
      }`,
      tbodyDateRange: `A6:A${
        6 + tbodyCellCounter + Object.values(fetchedOutstandingData).length * 2
      }`,
      tbodyPartyNameRange: `C6:C${
        6 + tbodyCellCounter + Object.values(fetchedOutstandingData).length * 2
      }`,
      tbodyDueAmountRange: `E4:G${
        6 + tbodyCellCounter + Object.values(fetchedOutstandingData).length * 2
      }`,
      // tbodyClientTotalDueAmountRange: `D${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 3)}
      //                                 :G${6 + tbodyCellCounter + (Object.values(fetchedOutstandingData).length * 3)}`,
      tbodyLastRowRange: `A${
        6 + tbodyCellCounter + Object.values(fetchedOutstandingData).length * 2
      }:H${
        6 + tbodyCellCounter + Object.values(fetchedOutstandingData).length * 2
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
          border: true,
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
            <h5>Outstandings</h5>
            <div className="grid p-fluid mt-1">
              <div className="col-12">
                <div className="card">
                  <h5>Search Filters</h5>
                  <div className="p-fluid formgrid grid">
                    <div className="field col-12 lg:col-3 md:col-6">
                      <label htmlFor="orderCity">Invoice Date (From)</label>
                      <Calendar
                        value={searchInvoiceDateFrom}
                        onChange={(e) => {
                          setSearchInvoiceDateFrom(e.value);
                        }}
                        readOnlyInput
                        hideOnRangeSelection
                      />
                      {searchInvoiceDateFromError ? (
                        <Message
                          severity="error"
                          text={searchInvoiceDateFromError}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="field col-12 lg:col-3 md:col-6">
                      <label htmlFor="orderCity">Invoice Date (To)</label>
                      <Calendar
                        value={searchInvoiceDateTo}
                        onChange={(e) => {
                          setSearchInvoiceDateTo(e.value);
                        }}
                        readOnlyInput
                        hideOnRangeSelection
                      />
                      {searchInvoiceDateToError ? (
                        <Message
                          severity="error"
                          text={searchInvoiceDateToError}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="field col-12 lg:col-6 md:col-6">
                      <label htmlFor="ledgerClientName">Client Name</label>
                      <Dropdown
                        showClear
                        id="ledgerClientName"
                        options={clientNames}
                        placeholder="Select client"
                        filter
                        onChange={(e) => {
                          setSelectedClient(e.target.value);
                        }}
                        value={selectedClient}
                      />
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
                          fetchOutstandings();
                        }}
                        severity="info"
                      />
                    </div>
                  </div>

                  <Divider />

                  {Object.keys(fetchedOutstandingData).length !== 0 ? (
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
                          tooltipOptions={{ position: "top" }}
                        />
                      </div>
                      <table
                        id="ledgerTable"
                        class="default-table manage-job-table ledger-table"
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
                              {searchInvoiceDateFrom
                                ? " " +
                                  convertToFullDateFormat(
                                    format(searchInvoiceDateFrom, "yyyy-MM-dd"),
                                    false
                                  )
                                : ""}
                              {searchInvoiceDateTo
                                ? " to " +
                                  convertToFullDateFormat(
                                    format(searchInvoiceDateTo, "yyyy-MM-dd"),
                                    false
                                  )
                                : ""}
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
                          {Object.values(fetchedOutstandingData).map(
                            (outstandingClient) => {
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
                                  {outstandingClient.map((outstanding) => {
                                    return (
                                      <tr>
                                        <td>
                                          {outstanding.invoice_created_at
                                            ? convertToFullDateFormat(
                                                format(
                                                  outstanding.invoice_created_at,
                                                  "yyyy-MM-dd"
                                                ),
                                                false
                                              )
                                            : ""}
                                        </td>
                                        <td>{outstanding.invoice_number}</td>
                                        <td></td>
                                        <td>
                                          {outstanding.total_amount}.00 Dr
                                        </td>
                                        <td>
                                          {outstanding.total_amount}.00 Dr
                                        </td>
                                        {(todayDate.getTime() -
                                          new Date(
                                            outstanding.invoice_created_at
                                          ).getTime()) /
                                          (1000 * 60 * 60 * 24) <
                                        1 ? (
                                          <>
                                            <td>
                                              {outstanding.total_amount}.00 Dr
                                            </td>
                                            <td></td>
                                          </>
                                        ) : (
                                          <>
                                            <td></td>
                                            <td>
                                              {outstanding.total_amount}.00 Dr
                                            </td>
                                          </>
                                        )}
                                        <td>
                                          {outstanding.invoice_created_at
                                            ? convertToFullDateFormat(
                                                format(
                                                  outstanding.invoice_created_at,
                                                  "yyyy-MM-dd"
                                                ),
                                                false
                                              )
                                            : ""}
                                        </td>
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
                                    <td>
                                      {getTotalAmountLessThanOneDayByClient(
                                        outstandingClient
                                      )}
                                      .00 Dr
                                    </td>
                                    <td>
                                      {getTotalAmountGreaterThanOneDayByClient(
                                        outstandingClient
                                      )}
                                      .00 Dr
                                    </td>
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
                            }
                          )}
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
                    </div>
                  ) : (
                    <div className="col-12">
                      <h6>
                        There is no invoice exists in given Search Criteria.
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

export default Outstandings;
