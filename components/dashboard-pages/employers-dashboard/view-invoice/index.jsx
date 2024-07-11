/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { supabase } from "../../../../config/supabaseClient";
import { convertToFullDateFormat } from "../../../../utils/convertToFullDateFormat";
import InfoBox from "./infoBox";
import ViewInvoice from "./viewInvoice";

const Index = () => {

    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [fetchedJobData, setFetchedJobData] = useState({});
    const router = useRouter();
    const id = router.query.id;
    const isEmployer = ["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role);
    const [fetchedInvoiceData, setFetchedInvoiceData] = useState({});
    const [fetchedOrderData, setFetchedOrderData] = useState({});
    const [fetchedLrData, setFetchedLrData] = useState([]);
    const [fetchedClientData, setFetchedClientData] = useState({});

    const [checkedAllStates, setCheckedAllStates] = useState(false);

    async function savePDF() {
        var element = document.getElementById("export-invoice");
        var opt = {
            margin:       0,
            filename:     "Raftaar-Invoice-" + fetchedInvoiceData.invoice_number + ".pdf",
            image:        { type: "jpeg", quality: 1 },
            html2canvas:  { scale: 2  },
            jsPDF:        { unit: "in", format: "A4", orientation: "portrait" },
            backimg:      "../../images/letter-head.jpeg"
          };

          window.html2pdf().from(element).set(opt).save();
    };

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

    const fetchInvoice = async () => {
        // fetch order, invoice, lr for all required details to show in invoice
        try {
            if (id) {
                const { data: invoiceData, error } = await supabase
                    .from("invoice")
                    .select("*")

                    // Filters
                    .eq("invoice_id", id);

                if (invoiceData) {
                    invoiceData.forEach(
                        (invoice) =>
                            (invoice.invoice_created_at = dateFormat(invoice.invoice_created_at))
                    );
                    setFetchedInvoiceData(invoiceData[0]);

                    // fetch order data
                    const { data: orderData, error } = await supabase
                        .from("orders")
                        .select("*")

                        // Filters
                        .eq("order_id", invoiceData[0].order_id);
                    
                    if (orderData) {
                        setFetchedOrderData(orderData[0]);
                    }

                    // fetch lr data
                    const { data: lrData, error: lrError } = await supabase
                        .from("lr")
                        .select("*")

                        // Filters
                        .eq("order_id", orderData[0].order_id)
                        .order("lr_created_date", { ascending: true });
                    
                    if (lrData) {
                        setFetchedLrData(lrData);
                    }

                    // fetch order data
                    const { data: clientData, error: clientError } = await supabase
                        .from("client")
                        .select("*")

                        // Filters
                        .eq("client_number", orderData[0].client_number);
                    
                    if (clientData) {
                        setFetchedClientData(clientData[0]);
                    }

                }
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
    };

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    useEffect(() => {
        setCheckedAllStates(true);
    }, [(Object.keys(fetchedInvoiceData).length !== 0 && 
        Object.keys(fetchedOrderData).length !== 0 && 
        fetchedLrData.length !== 0 && 
        Object.keys(fetchedClientData).length !== 0)]);

    return (
        <>
            <section>
                <div className="auto-container pb-2">
                    <span className="px-1"></span>
                    <button onClick={() => { window.history.back(); }} className="btn btn-danger btn-md text-nowrap">
                        Back
                    </button>
                    <span className="px-2"></span>
                    <button className="btn btn-success btn-md text-nowrap" onClick={() => savePDF()}>
                        Export to PDF
                    </button>
                </div>
                {/* End auto-container */}

                { checkedAllStates ? 
                    <div id="export-invoice">
                        <div className="auto-container" style={{ minHeight: "1100px" }}>
                            <div className="invoice-wrap">
                                <div className="invoice-watermark">
                                    <img src="../../images/letter-head.jpeg" alt="logo" />
                                </div>
                                <div className="info-box">
                                    <div className="left-column" style={{ top: "10px", left: "150px" }}>
                                        <div className="company-details px-3 py-2">
                                            <span><b>Comapny Name: RAFTAAR LOGISTICS </b></span><br />
                                            <span><b>Head Office: </b>51 and 52 Sinde Colony, S R P Road, Navapura, Vadodara, Gujarat 390001</span> <br />
                                            <span><b>PAN: </b>GFSPS6256B</span> <br />
                                            {/* <span>
                                            <t></t> | <t></t><b>Email: </b>margisoni031@gmail.com
                                            </span> */}
                                            <span><b>Website: </b>raftaarlogistics.com</span> <br />
                                            <span><b>GSTIN: </b>24GFSPS6256B1Z1</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="invoice-content" style={{ top: "50px" }}>

                                    <InfoBox
                                        fetchedInvoiceData={ fetchedInvoiceData }
                                        fetchedClientData={ fetchedClientData }
                                        fetchedOrderData={ fetchedOrderData }
                                        fetchedLrData={ fetchedLrData }
                                    />
                                    {/* End infobox */}

                                    <div className="table-outer">
                                        <ViewInvoice
                                            fetchedInvoiceData={ fetchedInvoiceData }
                                            fetchedClientData={ fetchedClientData }
                                            fetchedOrderData={ fetchedOrderData }
                                            fetchedLrData={ fetchedLrData }
                                        />
                                    </div>

                                    <div className="invoice-footer custom-border">
                                        <ul className="bottom-links">
                                            <li>
                                                SUBJECT TO BARODA JURISDICTION
                                            </li>
                                            <li>
                                                This is a Computer Generated Invoice
                                            </li>
                                            <li>
                                                Mobile No: +91 7016229891
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                : "" }
            </section>
            {/* <!-- End Invoice Section -->  */}
        </>
    );
};

export default Index;
