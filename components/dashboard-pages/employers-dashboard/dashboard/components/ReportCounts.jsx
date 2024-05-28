/* eslint-disable no-unused-vars */
import { supabase } from "../../../../../config/supabaseClient";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { BallTriangle } from "react-loader-spinner";
import Link from "next/link";
import { Col, Container, Row, Table } from "react-bootstrap";
import Spinner from "../../../../spinner/spinner";

const ReportCounts = () => {
    // global states
    const facility = useSelector((state) => state.employer.facility.payload);
    const user = useSelector((state) => state.candidate.user);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Dashboard Data is loading...");

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


    async function fetchOrderData() {
        setIsLoading(true);

        // fetch data for Orders
        const { data: ordersData, error: ordersError} = await supabase
            .from("orders")
            .select("*")
            .neq("order_number", "DEFAULT");

        if (ordersData) {
            setTotalOrders(ordersData.length);
            
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
            .select("*")
            .neq("lr_number", "DEFAULT");

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

        const { data: invoiceData, error: invoiceError} = await supabase
            .from("invoice")
            .select("*");

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

    return (
        <>
            <Container>
                <Row>
                    <Col>
                        {/* total counts */}
                        <div className="widget-content" style={{ maxWidth: "fit-content" }}>
                            <Spinner isLoading={isLoading} loadingText={loadingText} />

                            <div className="table-outer dashboard-table">
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
                                                <td>{totalOrders}</td>
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
                        </div>

                        {/* number of order by status */}
                        <div className="widget-content" style={{ maxWidth: "fit-content" }}>
                            <Spinner isLoading={isLoading} loadingText={loadingText} />

                            <div className="table-outer dashboard-table">
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
                        </div>
                    </Col>
                    <Col>
                        {/* number of LR by status */}
                        <div className="widget-content" style={{ maxWidth: "fit-content" }}>
                            <Spinner isLoading={isLoading} loadingText={loadingText} />

                            <div className="table-outer dashboard-table">
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
                        </div>

                        {/* number of invoice by status */}
                        <div className="widget-content" style={{ maxWidth: "fit-content" }}>
                            <Spinner isLoading={isLoading} loadingText={loadingText} />

                            <div className="table-outer dashboard-table">
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
                        </div>
                    </Col>
                </Row>
            </Container>
            

        </>
    );
};

export default ReportCounts;
