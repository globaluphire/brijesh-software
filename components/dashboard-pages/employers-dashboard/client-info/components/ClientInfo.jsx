/* eslint-disable prefer-const */
/* eslint no-unneeded-ternary: "error" */
/* eslint-disable no-unused-vars */
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
import Spinner from "../../../../spinner/spinner";
import PrivateMessageBox from "../../../../employer-single-pages/shared-components/PrivateMessageBox";
import JobDetailsDescriptions from "../../../../employer-single-pages/shared-components/JobDetailsDescriptions";
import RelatedJobs from "../../../../employer-single-pages/related-jobs/RelatedJobs";
import ClientOrdersTable from "./ClientOrdersTable";
import ClientLRsTable from "./ClientLRsTable";
import ClientInvoicesTable from "./ClientInvoicesTable";

const addSearchFilters = {
    consignorName: "",
    consigneeName: "",
    fromCity: "",
    toCity: "",
    driverName: "",
    status: ""
};

const ClientInfo = () => {
    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);
    const clientNumber = router.query.id;

    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("");

    const [fetchedClientData, setFetchedClientData] = useState({});
    const [fetchedOrdersData, setFetchedOrdersData] = useState({});
    const [fetchedLRData, setFetchedLRData] = useState({});
    const [fetchedInvoiceData, setFetchedInvoiceData] = useState({});

    const [totalDebitAmount, setTotalDebitAmount] = useState(0);
    const [totalCreditAmount, setTotalCreditAmount] = useState(0);

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

    async function fetchData() {
        setIsLoading(true);
        if (clientNumber) {
            // fetch client data
            try {
                let { data: clientData, error } = await supabase
                .from("client")
                .select("*")
                .eq("client_number", clientNumber)
                .order(
                    "client_created_at",
                    { ascending: false, nullsFirst: false }
                );
                // if (facility) {
                //     allApplicantsView = allApplicantsView.filter(
                //         (i) => i.facility_name === facility
                //     );
                // }

                if (clientData) {
                    clientData.forEach(
                        (i) => (i.client_created_at = dateTimeFormat(i.client_created_at))
                    );
                    setFetchedClientData(clientData[0]);

                    // fetch Orders
                    let { data: ordersData, error } = await supabase
                        .from("orders")
                        .select("*")
                        .eq("client_number", clientNumber)
                        .order(
                            "order_created_at",
                            { ascending: false, nullsFirst: false }
                        )
                        .range(0, 4);
        
                    if (ordersData && ordersData.length > 0) {
                        ordersData.forEach(
                            (order) => (order.order_created_at = dateFormat(order.order_created_at))
                        );
                        ordersData.forEach(
                            (order) => (order.order_updated_at = dateFormat(order.order_updated_at))
                        );
                        ordersData.forEach(
                            (order) => (order.status_last_updated_at = dateTimeFormat(order.status_last_updated_at))
                        );
            
                        setFetchedOrdersData(ordersData);
    
                        // fetch LRs
                        let { data: lrData, error: e } = await supabase
                            .from("lr_view")
                            .select("*")
                            .eq("client_number", clientNumber)
                            .order(
                                "lr_created_date",
                                { ascending: false, nullsFirst: false }
                            )
                            .range(0, 4);
            
                        if (lrData && lrData.length > 0) {

                            lrData.forEach(
                                (lr) => (lr.lr_created_date = dateTimeFormat(lr.lr_created_date))
                            );

                            setFetchedLRData(lrData);
                        }
                        // fetch invoices
                        let { data: invoiceData, error } = await supabase
                            .from("invoice_view")
                            .select("*")
                            .eq("client_number", clientNumber)
                            .order(
                                "invoice_created_at",
                                { ascending: false, nullsFirst: false }
                            )
                            .range(0, 4);
            
                        if (invoiceData && invoiceData.length > 0) {
                            invoiceData.forEach(
                                (invoice) => (invoice.invoice_created_at = dateTimeFormat(invoice.invoice_created_at))
                            );
                            setFetchedInvoiceData(invoiceData);

                            var totalDebAmount = 0;
                            var totalCredAmount = 0;
                            for (let i=0; i<invoiceData.length; i++) {
                                if(invoiceData[i].is_paid) {
                                    totalCredAmount = totalCredAmount + invoiceData[i].total_amount;
                                } else {
                                    totalDebAmount = totalDebAmount + invoiceData[i].total_amount;
                                }
                            }
                            setTotalDebitAmount(totalDebAmount);
                            setTotalCreditAmount(totalCredAmount);
        
                            setIsLoading(false);
                        } else {
                            setIsLoading(false);
                        }
                    } else {
                        setIsLoading(false);
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (e) {
                toast.error(
                    "System is unavailable.  Unable to fetch Client Data.  Please try again later or contact tech support!",
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
        }
    }

    useEffect(() => {
        fetchData();
        // if (facility) {
        //     localStorage.setItem("facility", facility);
        // } else {
        //     localStorage.setItem("facility", "");
        // }
    }, [clientNumber]);


    return (
        <>
            <Spinner isLoading={isLoading} loadingText={loadingText} />

            {/* <!-- Client Detail Section --> */}
            <div className="job-detail-section">
                {/* <!-- Upper Box --> */}
                <div className="upper-box">
                    <div>
                        <div className="job-block-seven">
                            <div className="inner-box">
                                <div className="content">
                                    <span className="company-logo">
                                        {/* <img src={employer?.img} alt="logo" /> */}
                                    </span>
                                    <h4>
                                        <b>{fetchedClientData.client_name ? fetchedClientData.client_name : ""}</b>
                                    </h4>

                                    <ul className="job-info">
                                        <li>
                                            <span className="icon flaticon-map-locator"></span>
                                            <span>{fetchedClientData.address1 ? fetchedClientData.address1 + ", " : ""}</span>
                                            <span>{fetchedClientData.address2 ? fetchedClientData.address2 + ", " : ""}</span>
                                            <span>{fetchedClientData.area ? fetchedClientData.area + ", " : ""}</span>
                                            <span>{fetchedClientData.city ? fetchedClientData.city + ", " : ""}</span>
                                            <span>{fetchedClientData.state ? fetchedClientData.state + ", " : ""}</span>
                                            <span>{fetchedClientData.pin ? fetchedClientData.pin : ""}</span>
                                        </li>
                                    </ul>
                                    <ul className="job-info">
                                        {/* compnay info */}
                                        <li>
                                            <span className="icon flaticon-briefcase"></span>
                                            {fetchedClientData.client_type ? fetchedClientData.client_type : "-"}
                                        </li>
                                        {/* location info */}
                                        <li>
                                            <span className="icon flaticon-telephone-1"></span>
                                            {fetchedClientData.client_phone ? "+91 " + fetchedClientData.client_phone : "-"}
                                        </li>
                                        {/* time info */}
                                        <li>
                                            <span className="icon flaticon-mail"></span>
                                            {fetchedClientData.email ? fetchedClientData.email : "-"}
                                        </li>
                                        {/* salary info */}
                                    </ul>
                                    {/* End .job-info */}

                                    <ul className="job-other-info">
                                        <li className="time">
                                            GSTIN: {fetchedClientData.client_gst ? fetchedClientData.client_gst : "-"}
                                        </li>
                                        <li className="time">
                                            PAN No: {fetchedClientData.client_pan ? fetchedClientData.client_pan : "-"}
                                        </li>
                                    </ul>
                                    {/* End .job-other-info */}
                                </div>
                                {/* End .content */}

                                <div className="btn-box">
                                    <Link
                                        variant="secondary"
                                        href={`/employers-dashboard/client-details/${fetchedClientData.client_number}`}
                                        className="theme-btn btn-style-four"
                                    >
                                        Edit Client Details
                                    </Link>
                                </div>
                                {/* End btn-box */}

                            </div>
                        </div>
                        {/* <!-- Job Block --> */}
                    </div>
                </div>
                {/* <!-- Upper Box --> */}

                {/* <!-- job-detail-outer--> */}
                <div className="job-detail-outer">
                    <div>
                        <div className="row">
                            <div className="content-column col-lg-9 col-md-12 col-sm-12">

                                <ClientOrdersTable fetchedOrdersData={fetchedOrdersData} />

                                <ClientLRsTable fetchedLRData={fetchedLRData} />

                                <ClientInvoicesTable fetchedInvoiceData={fetchedInvoiceData} />

                            </div>
                            {/* End .content-column */}

                            <div className="sidebar-column col-lg-3 col-md-12 col-sm-12">
                                <aside className="sidebar">
                                    <div className="sidebar-widget company-widget">
                                        <div className="widget-content">
                                            {/*  compnay-info */}
                                            <ul className="company-info mt-0">
                                                <li>
                                                    Client Status:{" "}
                                                    {
                                                        fetchedClientData.client_status ?
                                                            <span className="badge" style={{ backgroundColor: "green", color: "#fff" }}>
                                                                Active
                                                            </span>
                                                        :   <span className="badge" style={{ backgroundColor: "red" }}>
                                                                Not Active
                                                            </span>
                                                    }
                                                </li>
                                                <li>
                                                    Primary Industry:{" "}
                                                    <span>Tiles, Sanitary</span>
                                                </li>
                                                <li>
                                                    Founded In:{" "}
                                                    <span>2020</span>
                                                </li>
                                                <li>
                                                    Total Orders:{" "}
                                                    <span>
                                                        {fetchedOrdersData && fetchedOrdersData.length > 0 ? fetchedOrdersData.length : "0"}
                                                    </span>
                                                </li>
                                                <li>
                                                    Total Sale:{" "}
                                                    <span>
                                                        {totalCreditAmount + totalDebitAmount}
                                                    </span>
                                                </li>
                                                <li>
                                                    Total Due:{" "}
                                                    <span>
                                                        {totalDebitAmount ? totalDebitAmount : "0"}
                                                    </span>
                                                </li>
                                            </ul>
                                            {/* End compnay-info */}

                                            {/* <div className="btn-box">
                                                <a
                                                    href="#"
                                                    className="theme-btn btn-style-three"
                                                    style={{
                                                        textTransform:
                                                            "lowercase",
                                                    }}
                                                >
                                                    www.{fetchedClientData.client_name ? fetchedClientData.client_name : "raftaarlogistics"}.com
                                                </a>
                                            </div> */}
                                            {/* btn-box */}
                                        </div>
                                    </div>
                                    {/* End company-widget */}
                                    <div className="sidebar-widget company-widget">
                                        <div className="widget-content">
                                            {/*  compnay-info */}
                                            <ul className="company-info mt-0">
                                                <li>
                                                    Client Contact Person Details:{" "}
                                                </li>
                                                <li>
                                                    Name:{" "}
                                                    <span>{fetchedClientData.contact_name ? fetchedClientData.contact_name : "-"}</span>
                                                </li>
                                                <li>
                                                    Phone:{" "}
                                                    <span>{fetchedClientData.contact_phone ? fetchedClientData.contact_phone : "-"}</span>
                                                </li>
                                                <li>
                                                    Email:{" "}
                                                    <span>{fetchedClientData.contact_email ? fetchedClientData.contact_email : "-"}</span>
                                                </li>
                                            </ul>
                                            {/* End compnay-info */}

                                            {/* <div className="btn-box">
                                                <a
                                                    href="#"
                                                    className="theme-btn btn-style-three"
                                                    style={{
                                                        textTransform:
                                                            "lowercase",
                                                    }}
                                                >
                                                    www.{fetchedClientData.client_name ? fetchedClientData.client_name : "raftaarlogistics"}.com
                                                </a>
                                            </div> */}
                                            {/* btn-box */}
                                        </div>
                                    </div>
                                    {/* End sidebar-widget */}
                                </aside>
                                {/* End .sidebar */}
                            </div>
                            {/* End .sidebar-column */}
                        </div>
                    </div>
                </div>
                {/* <!-- job-detail-outer--> */}
            </div>
            {/* <!-- End Job Detail Section --> */}
        </>
    );
};

export default ClientInfo;