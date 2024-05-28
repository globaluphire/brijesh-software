/* eslint-disable no-unused-vars */
import { supabase } from "../../../../../config/supabaseClient";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { BallTriangle } from "react-loader-spinner";
import Link from "next/link";
import { Table } from "react-bootstrap";
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
        setLoadingText("Orders Data is loading...");

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
            setLoadingText("");
        } else {
            setIsLoading(false);
            setLoadingText("");
        }
    };

    async function fetchLRsData() {
        setIsLoading(true);
        setLoadingText("LR Data is loading...");

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
            setLoadingText("");
        } else {
            setIsLoading(false);
            setLoadingText("");
        }
    };

    async function fetchInvoicesData() {
        setIsLoading(true);
        setLoadingText("Invoice Data is loading...");

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
            setLoadingText("");
        } else {
            setIsLoading(false);
            setLoadingText("");
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

    return (
        <>
            {/* total counts */}
            <div className="widget-content" style={{ maxWidth: "fit-content" }}>
                <Spinner isLoading={isLoading} loadingText={loadingText} />

                <div className="table-outer">
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

                <div className="table-outer">
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
                                <tr>
                                    <td>Under Pickup Process</td>
                                    <td>{totalUnderPickupProcess}</td>
                                </tr>
                                <tr>
                                    <td>Ready for pickup</td>
                                    <td>{totalReadyForPickup}</td>
                                </tr>
                                <tr>
                                    <td>Tempo under the process</td>
                                    <td>{totalTempoUnderProcess}</td>
                                </tr>
                                <tr>
                                    <td>In process of departure</td>
                                    <td>{totalInProcessDeparture}</td>
                                </tr>
                                <tr>
                                    <td>At destination city warehouse</td>
                                    <td>{totalAtDestinationWarehouse}</td>
                                </tr>
                                <tr>
                                    <td>Ready for final delivery</td>
                                    <td>{totalReadyForDelivery}</td>
                                </tr>
                                <tr>
                                    <td>Completed</td>
                                    <td>{totalCompleted}</td>
                                </tr>
                                <tr>
                                    <td>Cancelled</td>
                                    <td>{totalCancelled}</td>
                                </tr>
                            </tbody>
                    </Table>
                </div>
            </div>

            {/* number of order by status */}
            <div className="widget-content" style={{ maxWidth: "fit-content" }}>
                <Spinner isLoading={isLoading} loadingText={loadingText} />

                <div className="table-outer">
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
                                <tr>
                                    <td>Performa</td>
                                    <td>{totalPerforma}</td>
                                </tr>
                                <tr>
                                    <td>Final</td>
                                    <td>{totalFinal}</td>
                                </tr>
                                <tr>
                                    <td>Unknown</td>
                                    <td>{totalLRs - totalPerforma - totalFinal}</td>
                                </tr>
                            </tbody>
                    </Table>
                </div>
            </div>

            {/* number of invoice by status */}
            <div className="widget-content" style={{ maxWidth: "fit-content" }}>
                <Spinner isLoading={isLoading} loadingText={loadingText} />

                <div className="table-outer">
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
                                <tr>
                                    <td>Paid</td>
                                    <td>{totalPaid}</td>
                                    <td>{totalCreditAmount}</td>
                                </tr>
                                <tr>
                                    <td>Unpaid</td>
                                    <td>{totalUnpaid}</td>
                                    <td>{totalDebitAmount}</td>
                                </tr>
                            </tbody>
                    </Table>
                </div>
            </div>
        </>
    );
};

export default ReportCounts;
