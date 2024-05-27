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

    // states for LRs
    const [totalLRs, setTotalLRs] = useState(0);

    // states for Billings
    const [totalInvoices, setTotalInvoices] = useState(0);


    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);

        // fetch data for Orders
        const countTotalOrders = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true });

        setTotalOrders(countTotalOrders.count);

        // fetch data for LRs
        const countTotalLRs = await supabase
            .from("lr")
            .select("*", { count: "exact", head: true });

        setTotalLRs(countTotalLRs.count);

        // fetch data for Jobs
        const countTotalInvoices = await supabase
            .from("invoice")
            .select("*", { count: "exact", head: true });

        setTotalInvoices(countTotalInvoices.count);

        setIsLoading(false);
    };

    return (
        <>
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
                                <th style={{ fontSize: "14px" }}>Total Count</th>
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
        </>
    );
};

export default ReportCounts;
