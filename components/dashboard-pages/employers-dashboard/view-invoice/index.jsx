/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { supabase } from "../../../../config/supabaseClient";
import InfoBox from "./infoBox";
import ViewInvoice from "./viewInvoice";

const Index = () => {

    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [fetchedJobData, setFetchedJobData] = useState({});
    const router = useRouter();
    const id = router.query.id;
    const isEmployer = ["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role);
    const [fetchedInvoicedata, setFetchedInvoicedata] = useState({});

    async function savePDF() {
        var element = document.getElementById("export-invoice");
        var opt = {
            margin:       0,
            filename:     "Raftaar-Invoice-" + fetchedInvoicedata.invoice_number + ".pdf",
            image:        { type: "jpeg", quality: 1 },
            html2canvas:  { scale: 2  },
            jsPDF:        { unit: "in", format: "A4", orientation: "portrait" }
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
                    setFetchedInvoicedata(invoiceData[0]);
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

    return (
        <>
            <section>
                <div className="auto-container">
                    <div className="upper-box btn-box mb-3" style={{ textAlign: "right" }}>
                        <Link href="/employers-dashboard/billing" className="btn btn-danger btn-sm text-nowrap m-1 p-3">
                            Back to Billing
                        </Link>
                        <button className="btn btn-success btn-sm text-nowrap m-1 p-3" onClick={() => savePDF()}>
                            Export to PDF
                        </button>
                    </div>
                </div>
                {/* End auto-container */}

                {fetchedInvoicedata ? 
                    <div id="export-invoice">
                        <div className="auto-container">
                            <div className="invoice-wrap">
                                <div className="invoice-content">
                                    <div className="logo-box">
                                        <div className="logo">
                                            <img src="../../images/logo.svg" alt="logo" />
                                        </div>
                                        <div>
                                            <Container className="custom-border">
                                                <Row className="custom-border">
                                                    <Col className="invoice-id">Invoice # <b>{fetchedInvoicedata.invoice_number}</b></Col>
                                                </Row>
                                                <Row className="custom-border">
                                                    <Col>Invoice date: <b>{fetchedInvoicedata.invoice_created_at}</b> </Col>
                                                </Row>
                                            </Container>
                                        </div>
                                    </div>
                                    {/* End logobox */}

                                    <InfoBox fetchedInvoicedata={ fetchedInvoicedata } />
                                    {/* End infobox */}

                                    <div className="table-outer">
                                        <ViewInvoice fetchedInvoicedata={ fetchedInvoicedata } />
                                    </div>
                                </div>

                                <div className="invoice-footer">
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
                : "" }
            </section>
            {/* <!-- End Invoice Section -->  */}
        </>
    );
};

export default Index;
