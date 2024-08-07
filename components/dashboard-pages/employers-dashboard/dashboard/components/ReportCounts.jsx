/* eslint-disable no-unused-vars */
import { supabase } from "../../../../../config/supabaseClient";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import Spinner from "../../../../spinner/spinner";
import DateRangePickerComp from "../../../../date/DateRangePickerComp";
import { addDays, subDays } from "date-fns";
import { convertToSearchFilterDateTimeFrom, convertToSearchFilterDateTimeTo } from "../../../../../utils/convertToSearchFilterDateTime";
import OrdersChart from "./OrdersChart";

const ReportCounts = () => {
    // global states
    const facility = useSelector((state) => state.employer.facility.payload);
    const user = useSelector((state) => state.candidate.user);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Dashboard Data is loading...");

    // search filters
    const [range, setRange] = useState([
        {
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
        key: "selection"
        }
    ]);
    const [maxDateLimit, setMaxDateLimit] = useState(new Date());

    // states for LRs
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalClients, setTotalClients] = useState(0);
    const [totalLocations, setTotalLocations] = useState(0);

    // states for Orders
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalUnderPickupProcess, setTotalUnderPickupProcess] = useState(0);
    const [totalReadyForPickup, setTotalReadyForPickup] = useState(0);
    const [totalTempoUnderProcess, setTotalTempoUnderProcess] = useState(0);
    const [totalInProcessDeparture, setTotalInProcessDeparture] = useState(0);
    const [totalAtDestinationWarehouse, setTotalAtDestinationWarehouse] = useState(0);
    const [totalReadyForDelivery, setTotalReadyForDelivery] = useState(0);
    const [totalCompleted, setTotalCompleted] = useState(0);
    const [totalCancelled, setTotalCancelled] = useState(0);

    // states for LRs
    const [totalLRs, setTotalLRs] = useState(0);
    const [totalPerforma, setTotalPerforma] = useState(0);
    const [totalFinal, setTotalFinal] = useState(0);

    // states for Billings
    const [totalInvoices, setTotalInvoices] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalUnpaid, setTotalUnpaid] = useState(0);
    const [totalDebitAmount, setTotalDebitAmount] = useState(0);
    const [totalCreditAmount, setTotalCreditAmount] = useState(0);


    async function fetchTopCardData() {
        // fetch total users
        const countTotalUsers = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });
        setTotalUsers(countTotalUsers.count);

        // fetch total clients
        const countTotalClients = await supabase
            .from("client")
            .select("*", { count: "exact", head: true });
        setTotalClients(countTotalClients.count);

        // fetch total locations
        const countTotalLocations = await supabase
            .from("location")
            .select("*", { count: "exact", head: true });
        setTotalLocations(countTotalLocations.count);
    };

    async function fetchOrderData() {
        setIsLoading(true);

        // fetch data for Orders
        const { data: ordersData, error: ordersError } = await supabase
            .from("orders")
            .select("status, order_created_at")
            .neq("order_number", "DEFAULT")
            .gte("order_created_at", convertToSearchFilterDateTimeFrom(range[0].startDate))
            .lte("order_created_at", convertToSearchFilterDateTimeTo(range[0].endDate))
            .order("order_created_at", { ascending: false });

        if (ordersData) {
            setTotalOrders(ordersData);
            
            // filter by status
            const underPickupProcessCount = ordersData.filter((i) => i.status === "Under pickup process");
            setTotalUnderPickupProcess(underPickupProcessCount.length);

            const totalReadyForPickupCount = ordersData.filter((i) => i.status === "Ready for pickup");
            setTotalReadyForPickup(totalReadyForPickupCount.length);

            const totalTempoUnderProcessCount = ordersData.filter((i) => i.status === "Tempo under the process");
            setTotalTempoUnderProcess(totalTempoUnderProcessCount.length);

            const totalInProcessDepartureCount = ordersData.filter((i) => i.status === "In process of departure");
            setTotalInProcessDeparture(totalInProcessDepartureCount.length);

            const totalAtDestinationWarehouseCount = ordersData.filter((i) => i.status === "At destination city warehouse");
            setTotalAtDestinationWarehouse(totalAtDestinationWarehouseCount.length);

            const totalReadyForDeliveryCount = ordersData.filter((i) => i.status === "Ready for final delivery");
            setTotalReadyForDelivery(totalReadyForDeliveryCount.length);

            const totalCompletedCount = ordersData.filter((i) => i.status === "Completed");
            setTotalCompleted(totalCompletedCount.length);

            const totalCancelledCount = ordersData.filter((i) => i.status === "Cancel");
            setTotalCancelled(totalCancelledCount.length);

            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    async function fetchLRsData() {
        setIsLoading(true);

        const { data: lrData, error: lrError } = await supabase
            .from("lr")
            .select("status")
            .neq("lr_number", "DEFAULT")
            .gte("lr_created_date", convertToSearchFilterDateTimeFrom(range[0].startDate))
            .lte("lr_created_date", convertToSearchFilterDateTimeTo(range[0].endDate));

        if (lrData) {
            setTotalLRs(lrData.length);

            // filter by status
            const performaCount = lrData.filter((i) => i.status === "Performa");
            setTotalPerforma(performaCount.length);

            const finalCount = lrData.filter((i) => i.status === "Final");
            setTotalFinal(finalCount.length);

            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    async function fetchInvoicesData() {
        setIsLoading(true);

        const { data: invoiceData, error: invoiceError } = await supabase
            .from("invoice")
            .select("is_paid, total_amount")
            .gte("invoice_created_at", convertToSearchFilterDateTimeFrom(range[0].startDate))
            .lte("invoice_created_at", convertToSearchFilterDateTimeTo(range[0].endDate));

        if (invoiceData) {
            setTotalInvoices(invoiceData.length);

            // filter by status
            const paidCount = invoiceData.filter((i) => i.is_paid === true);
            setTotalPaid(paidCount.length);

            const unpaidCount = invoiceData.filter((i) => i.is_paid === false);
            setTotalUnpaid(unpaidCount.length);

            var totalDebAmount = 0;
            var totalCredAmount = 0;
            for (let i=0; i<invoiceData.length; i++) {
                if(!invoiceData[i].is_paid) {
                    totalDebAmount = totalDebAmount + invoiceData[i].total_amount;
                }
                if(invoiceData[i].is_paid) {
                    totalCredAmount = totalCredAmount + invoiceData[i].total_amount;
                }
            }
            setTotalDebitAmount(totalDebAmount);
            setTotalCreditAmount(totalCredAmount);

            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);

        // fetch Top Card Data
        fetchTopCardData();

        // fetch order data
        fetchOrderData();

        // fetch LRs data
        fetchLRsData();

        // fetch data for Jobs
        fetchInvoicesData();
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const determineBadgeColor = (status) => {
        switch (status) {
            // Order Badges
            case "Ready for pickup":
                return { color: "#87CEEB", textColor: "#333", tag: "Ready for pickup" };
            case "Tempo under the process":
                return { color: "#FFA500", textColor: "#333", tag: "Tempo under the process" };
            case "In process of departure":
                return { color: "#8f83c3", textColor: "#fff", tag: "In process of departure" };
            case "At destination city warehouse":
                return { color: "#FFE284", textColor: "#333", tag: "At destination city warehouse" };
            case "Ready for final delivery":
                return { color: "green", textColor: "#fff", tag: "Ready for final delivery" };
            case "Cancel":
                return { color: "#dc3545", textColor: "#fff", tag: "Cancelled" };
            case "Completed":
                return { color: "gray", textColor: "#fff", tag: "Completed" };
            
            // LR Badges
            case "Performa":
                return { color: "orange", textColor: "#333", tag: "Performa" };
            case "Final":
                return { color: "green", textColor: "#fff", tag: "Final" };
            case "Unknown":
                return { color: "gray", textColor: "#fff", tag: "Unknown" };

            // Invoices Badges
            case "Paid":
                return { color: "green", textColor: "#fff", tag: "Paid" };
            case "Unpaid":
                return { color: "#dc3545", textColor: "#fff", tag: "Unpaid" };

            default:
                return { color: "#B55385", textColor: "#fff", tag: "Under pickup process" };
        }
    };

    const cardContent = [
        {
            id: 1,
            icon: "flaticon-user",
            countNumber: totalUsers,
            metaName: "Total Registered Users",
            uiClass: "ui-blue",
            link: "/employers-dashboard/users",
        },
        {
            id: 2,
            icon: "flaticon-briefcase",
            countNumber: totalClients,
            metaName: "Total Clients",
            link: "/employers-dashboard/clients",
            uiClass: "ui-green",
        },
        {
            id: 3,
            icon: "flaticon-map-locator",
            countNumber: totalLocations,
            metaName: "Total Locations",
            link: "/employers-dashboard/locations",
            uiClass: "ui-yellow",
        },
    ];

    return (
        <>
            <Spinner isLoading={isLoading} loadingText={loadingText} />

            <div>
                <Form>
                    <Row>
                        {cardContent.map((item) => (
                            <div
                                className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12"
                                key={item.id}
                            >
                                <Link href={item.link ? item.link : "#"}>
                                    <div
                                        className={`ui-item ${item.uiClass}`}
                                    >
                                        <div className="left">
                                            <i className={`icon la ${item.icon}`}></i>
                                        </div>
                                        <div className="right">
                                            <h4>{item.countNumber}</h4>
                                            <p>{item.metaName}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </Row>

                    <div className="report-box">
                        <Row className="mb-5" >
                            <Col>
                                <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                    <Form.Label
                                        className="optional"
                                        style={{
                                            letterSpacing: "2px",
                                            fontSize: "12px",
                                        }}
                                    >
                                        REPORTS (FROM - TO)
                                    </Form.Label> <br />
                                    <DateRangePickerComp range={range} setRange={setRange} maxDateLimit={maxDateLimit} />
                                    <Button
                                        variant="primary"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            fetchDashboardData();
                                        }}
                                        className="btn btn-submit btn-sm text-nowrap m-1"
                                    >
                                        Search
                                    </Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    
                        <Row>
                            <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                {/* total counts */}
                                <div className="table-outer dashboard-table client-table">
                                    <b>
                                        Total Counts
                                        <a
                                            className="la la-refresh"
                                            onClick={() => { fetchDashboardData(); }}
                                            style={{ marginLeft: "10px" }}>
                                        </a>
                                    </b>
                                    <Table className="default-table manage-job-table" style={{ minWidth: "300px" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ fontSize: "14px" }}>#</th>
                                                <th style={{ fontSize: "14px" }}>Counts</th>
                                            </tr>
                                        </thead>
                                            <tbody style={{ fontSize: "14px" }}>
                                                <tr>
                                                    <td>Total Orders</td>
                                                    <td>{totalOrders.length}</td>
                                                </tr>
                                                <tr>
                                                    <td>Total LRs</td>
                                                    <td>{totalLRs}</td>
                                                </tr>
                                                <tr>
                                                    <td>Total Invoices</td>
                                                    <td>{totalInvoices}</td>
                                                </tr>
                                            </tbody>
                                    </Table>
                                </div>
                            </Form.Group>
                            <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                {/* number of order by status */}
                                <div className="table-outer dashboard-table client-table">
                                    <b>
                                        # of Orders by Status
                                        <a
                                            className="la la-refresh"
                                            onClick={() => { fetchOrderData(); }}
                                            style={{ marginLeft: "10px" }}>
                                        </a>
                                    </b>
                                    <Table className="default-table manage-job-table" style={{ minWidth: "300px" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ fontSize: "14px" }}>#</th>
                                                <th style={{ fontSize: "14px" }}>Counts</th>
                                            </tr>
                                        </thead>
                                            <tbody style={{ fontSize: "14px" }}>
                                                <tr style={{ backgroundColor: determineBadgeColor("Under Pickup Process").color }}>
                                                    <td style={{ color: determineBadgeColor("Under Pickup Process").textColor }}>
                                                        {determineBadgeColor("Under Pickup Process").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Under Pickup Process").textColor }}>{totalUnderPickupProcess}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("Ready for pickup").color }}>
                                                    <td style={{ color: determineBadgeColor("Ready for pickup").textColor }}>
                                                        {determineBadgeColor("Ready for pickup").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Ready for pickup").textColor }}>{totalReadyForPickup}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("Tempo under the process").color }}>
                                                    <td style={{ color: determineBadgeColor("Tempo under the process").textColor }}>
                                                        {determineBadgeColor("Tempo under the process").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Tempo under the process").textColor }}>{totalTempoUnderProcess}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("In process of departure").color }}>
                                                    <td style={{ color: determineBadgeColor("In process of departure").textColor }}>
                                                        {determineBadgeColor("In process of departure").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("In process of departure").textColor }}>{totalInProcessDeparture}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("At destination city warehouse").color }}>
                                                    <td style={{ color: determineBadgeColor("At destination city warehouse").textColor }}>
                                                        {determineBadgeColor("At destination city warehouse").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("At destination city warehouse").textColor }}>{totalAtDestinationWarehouse}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("Ready for final delivery").color }}>
                                                    <td style={{ color: determineBadgeColor("Ready for final delivery").textColor }}>
                                                        {determineBadgeColor("Ready for final delivery").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Ready for final delivery").textColor }}>{totalReadyForDelivery}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("Completed").color }}>
                                                    <td style={{ color: determineBadgeColor("Completed").textColor }}>
                                                        {determineBadgeColor("Completed").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Completed").textColor }}>{totalCompleted}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("Cancel").color }}>
                                                    <td style={{ color: determineBadgeColor("Cancel").textColor }}>
                                                        {determineBadgeColor("Cancel").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Cancel").textColor }}>{totalCancelled}</td>
                                                </tr>
                                            </tbody>
                                    </Table>
                                </div>
                            </Form.Group>

                            <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                {/* number of LR by status */}
                                <div className="table-outer dashboard-table client-table">
                                    <b>
                                        # of LRs by Status
                                        <a
                                            className="la la-refresh"
                                            onClick={() => { fetchLRsData(); }}
                                            style={{ marginLeft: "10px" }}>
                                        </a>
                                    </b>
                                    <Table className="default-table manage-job-table" style={{ minWidth: "300px" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ fontSize: "14px" }}>#</th>
                                                <th style={{ fontSize: "14px" }}>Counts</th>
                                            </tr>
                                        </thead>
                                            <tbody style={{ fontSize: "14px" }}>
                                                <tr style={{ backgroundColor: determineBadgeColor("Performa").color }}>
                                                    <td style={{ color: determineBadgeColor("Performa").textColor }}>
                                                        {determineBadgeColor("Performa").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Performa").textColor }}>{totalPerforma}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("Final").color }}>
                                                    <td style={{ color: determineBadgeColor("Final").textColor }}>
                                                        {determineBadgeColor("Final").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Final").textColor }}>{totalFinal}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("Unknown").color }}>
                                                    <td style={{ color: determineBadgeColor("Unknown").textColor }}>
                                                        {determineBadgeColor("Unknown").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Unknown").textColor }}>{totalLRs - totalPerforma - totalFinal}</td>
                                                </tr>
                                            </tbody>
                                    </Table>
                                </div>
                            </Form.Group>

                            <Form.Group as={Col} md="auto" controlId="validationCustom01">
                                {/* number of invoice by status */}
                                <div className="table-outer dashboard-table client-table">
                                    <b>
                                        # of Invoices by Status
                                        <a
                                            className="la la-refresh"
                                            onClick={() => { fetchInvoicesData(); }}
                                            style={{ marginLeft: "10px" }}>
                                        </a>
                                    </b>
                                    <Table className="default-table manage-job-table" style={{ minWidth: "300px" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ fontSize: "14px" }}>#</th>
                                                <th style={{ fontSize: "14px" }}>Counts</th>
                                                <th style={{ fontSize: "14px" }}>Total Amount</th>
                                            </tr>
                                        </thead>
                                            <tbody style={{ fontSize: "14px" }}>
                                                <tr style={{ backgroundColor: determineBadgeColor("Paid").color }}>
                                                    <td style={{ color: determineBadgeColor("Paid").textColor }}>
                                                        {determineBadgeColor("Paid").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Paid").textColor }}>{totalPaid}</td>
                                                    <td style={{ color: determineBadgeColor("Paid").textColor }}>{totalCreditAmount}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: determineBadgeColor("Unpaid").color }}>
                                                    <td style={{ color: determineBadgeColor("Unpaid").textColor }}>
                                                        {determineBadgeColor("Unpaid").tag}
                                                    </td>
                                                    <td style={{ color: determineBadgeColor("Unpaid").textColor }}>{totalUnpaid}</td>
                                                    <td style={{ color: determineBadgeColor("Unpaid").textColor }}>{totalDebitAmount}</td>
                                                </tr>
                                            </tbody>
                                    </Table>
                                </div>
                            </Form.Group>
                        </Row>

                        <Row>
                            <Form.Group as={Col} md="6" controlId="validationCustom01">
                                { totalOrders ?
                                    <OrdersChart orderData={totalOrders} range={range} />
                                : "" }
                            </Form.Group>
                        </Row>
                    </div>
                </Form>
            </div>
        </>
    );
};

export default ReportCounts;
