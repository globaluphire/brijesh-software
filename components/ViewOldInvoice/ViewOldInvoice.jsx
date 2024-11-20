import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { convertToFullDateFormat } from "../../utils/convertToFullDateFormat";
import Spinner from "../spinner";
import { ToWords } from "to-words";

const ViewOldInvoice = ({ selectedInvoiceData }) => {
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

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        // can be used to override defaults for the selected locale
        name: "Rupee",
        singular: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          singular: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      },
    },
  });

  return (
    <>
      <div id="export-invoice">
        <div class="header">
          <div class="header-content">
            <p>
              <b>Comapny Name: RAFTAAR LOGISTICS </b>
            </p>
            <p>
              <b>Head Office: </b>51 and 52 Sinde Colony, S R P Road, Navapura,
              Vadodara, Gujarat 390001
            </p>
            <p>
              <b>PAN: </b>GFSPS6256B
            </p>
            <p>
              <b>Website: </b>raftaarlogistics.com
            </p>
            <p>
              <b>GSTIN: </b>24GFSPS6256B1Z1
            </p>
          </div>
        </div>
        <div className="content">
          <div class="grid">
            <div class="col-6 pl-3">
              <div class="min-h-full p-3 border-1">
                <b>Buyer (Bill to)</b> <br />
                <div className="px-2">
                  <span>
                    <b>Company Name: {selectedInvoiceData.company_name}</b>
                  </span>
                  <br />
                  <span>
                    <b>Address: </b>
                    {selectedInvoiceData.company_address
                      ? selectedInvoiceData.company_address
                      : ""}
                  </span>
                  <br />
                  <span>
                    <b>GSTIN/UIN:</b> {selectedInvoiceData.company_gst}
                    <br />
                  </span>
                </div>
              </div>
            </div>
            <div class="col-6 pr-4">
              <div class="">
                <div class="grid">
                  <div class="col-6 px-0">
                    <div class="border-sm border-1 px-3 py-1">
                      <div class="p-0">Invoice #</div>
                      <div class="p-0">
                        <div class="font-bold">
                          {selectedInvoiceData.invoice_number}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6 px-0">
                    <div class="border-sm border-1 border-left-none px-3 py-1">
                      <div class="p-0">Invoice Date:</div>
                      <div class="p-0">
                        <div class="font-bold">
                          {selectedInvoiceData.invoice_date
                            ? convertToFullDateFormat(
                                selectedInvoiceData.invoice_date,
                                true
                              )
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="grid">
                  <div class="col-6 p-0">
                    <div class="border-sm border-top-none border-1 px-3 py-1">
                      <div class="p-0">Vehicle No.</div>
                      <div class="p-0">
                        <div class="font-bold">
                          {selectedInvoiceData
                            ? selectedInvoiceData.vehical_number
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6 p-0">
                    <div class="border-sm border-top-none border-1 border-left-none px-3 py-1">
                      <div class="p-0">Bill of Landing/LR-RR No.</div>
                      <div class="p-0">
                        <div class="font-bold">
                          {selectedInvoiceData
                            ? selectedInvoiceData.lr_number
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="grid">
                  <div class="col-12 px-0">
                    <div class="border-sm border-top-none border-1 px-3 py-1">
                      <div class="p-0">Terms of Delivery</div>
                      <div class="p-0">
                        <div class="h-5rem"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12">
              <div class="px-3">
                <div class="grid">
                  <div class="col-1 p-0">
                    <div class="surface-500 text-white text-center p-3 border-1 border-black-alpha-50 font-bold">
                      #
                    </div>
                  </div>
                  <div class="col-5 p-0">
                    <div class="surface-500 text-white p-3 border-1 border-black-alpha-50 border-left-none font-bold">
                      Description of Services
                    </div>
                  </div>
                  <div class="col-2 p-0">
                    <div class="surface-500 text-white p-3 border-1 border-black-alpha-50 border-left-none font-bold">
                      HSN/SAC
                    </div>
                  </div>
                  <div class="col-2 p-0">
                    <div class="surface-500 text-white p-3 border-1 border-black-alpha-50 border-left-none font-bold">
                      Quantity
                    </div>
                  </div>
                  <div class="col-2 p-0">
                    <div class="surface-500 text-white p-3 border-1 border-black-alpha-50 border-left-none font-bold">
                      Amount
                    </div>
                  </div>
                </div>
                <div class="grid">
                  <div class="col-1 px-0">
                    <div class="min-h-full text-center p-3 border-1 border-top-none font-bold">
                      1
                    </div>
                  </div>
                  <div class="col-5 px-0">
                    <div class="min-h-full p-3 border-1 border-top-none border-left-none">
                      <span className="font-bold">
                        {selectedInvoiceData
                          ? selectedInvoiceData.vehical_number
                          : ""}
                      </span>
                      <div className="px-2 text-600 text-sm">
                        <span>
                          {selectedInvoiceData.from_city} to{" "}
                          {selectedInvoiceData.to_city}
                        </span>{" "}
                        <br />
                        <span>{selectedInvoiceData.quantity}</span> <br />
                        <span>{selectedInvoiceData.material}</span> <br />
                        <span>{selectedInvoiceData.order_number}</span> <br />
                        <span>
                          Eway Bill #{selectedInvoiceData.eway_bill_number}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col-2 px-0">
                    <div class="min-h-full p-3 border-1 border-top-none border-left-none font-bold">
                      996791
                    </div>
                  </div>
                  <div class="col-2 px-0">
                    <div class="min-h-full p-3 border-1 border-top-none border-left-none font-bold">
                      {selectedInvoiceData.weight} Kgs
                    </div>
                  </div>
                  <div class="col-2 px-0">
                    <div class="min-h-full p-3 border-1 border-top-none border-left-none font-bold">
                      {parseFloat(selectedInvoiceData.total_amount).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div class="grid">
                  <div class="col-1 p-0">
                    <div class="min-h-full text-center p-3 border-1 border-top-none font-bold"></div>
                  </div>
                  <div class="col-5 p-0">
                    <div class="min-h-full p-3 border-1 border-top-none border-left-none font-bold">
                      Total
                    </div>
                  </div>
                  <div class="col-2 p-0">
                    <div class="min-h-full p-3 border-1 border-top-none border-left-none font-bold"></div>
                  </div>
                  <div class="col-2 p-0">
                    <div class="min-h-full p-3 border-1 border-top-none border-left-none font-bold">
                      {selectedInvoiceData.weight} Kgs
                    </div>
                  </div>
                  <div class="col-2 p-0">
                    <div class="min-h-full p-3 border-1 border-top-none border-left-none">
                      <i className="pi pi-indian-rupee" />
                      <span className="font-bold ml-2">
                        {parseFloat(selectedInvoiceData.total_amount).toFixed(
                          2
                        )}
                      </span>
                      <div className="text-500 text-sm">
                        (INR{" "}
                        {selectedInvoiceData && selectedInvoiceData.total_amount
                          ? toWords.convert(selectedInvoiceData.total_amount)
                          : ""}
                        )<i> E. & O.E </i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 px-4">
              <div class="grid">
                <div class="col-5 p-0">
                  <div class="min-h-full p-3 border-1">
                    <span className="font-bold">Company's Bank Details</span>
                    <div className="px-2">
                      <span>
                        <b>A/C Holder's Name: </b>Raftaar Logistics
                      </span>{" "}
                      <br />
                      <span>
                        <b>Bank Name: </b>HDFC HO - 38410
                      </span>{" "}
                      <br />
                      <span>
                        <b>A/C No: </b>50200093338410
                      </span>{" "}
                      <br />
                      <span>
                        <b>Branch & IFS Code: </b>Baroda Raopura Branch &
                        HDFC0000429
                      </span>{" "}
                      <br />
                      <span>
                        <b>SWIFT Code: </b>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-3 p-0">
                  <div class="min-h-full p-3 border-1 border-left-none">
                    <span className="font-bold">Declaration</span>
                    <div className="px-2">
                      We declare that this invoice shows the actual price of the
                      goods described and that all particulars are true and
                      correct.
                    </div>
                  </div>
                </div>
                <div class="col-4 p-0">
                  <div class="min-h-full p-3 border-1 border-left-none">
                    <span className="font-bold">
                      For RAFTAAR LOGISTICS
                      <br /> &nbsp; <br /> &nbsp; <br /> &nbsp; <br /> &nbsp;
                      <br /> &nbsp; <br />
                      Authorised Signatory
                    </span>
                  </div>
                </div>
              </div>
              <div class="grid">
                <div class="col-4 px-0 text-xs">
                  <div class="text-center p-3 border-1 border-right-none border-top-none font-bold text-500">
                    SUBJECT TO BARODA JURISDICTION
                  </div>
                </div>
                <div class="col-4 px-0 text-xs">
                  <div class="text-center p-3 border-1 border-right-none border-left-none border-top-none -none font-bold text-500">
                    This is a Computer Generated Invoice
                  </div>
                </div>
                <div class="col-4 px-0 text-xs">
                  <div class="text-center p-3 border-1 border-left-none border-top-none font-bold text-500">
                    Mobile No: +91 7016229891
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewOldInvoice;
