/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import { useSelector } from "react-redux";
import { supabase } from "../../../../../config/supabaseClient";
import { BallTriangle } from "react-loader-spinner";
import { useEffect, useState } from "react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import Spinner from "../../../../spinner/spinner";
import { convertToFullDateFormat } from "../../../../../utils/convertToFullDateFormat";

const OrdersChart = ({ orderData, range }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Orders Chart is loading...");

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

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const today_date = new Date();

    const [horizontalData, setHorizontalData] = useState([]);
    const [verticalData, setVerticalData] = useState([]);

    const data = {
        labels: horizontalData,
        datasets: [
            {
                label: "Total Orders",
                data: verticalData,
                backgroundColor: "rgba(75,192,192,1)",
                borderColor: "rgba(75,192,192,1)",
                fill: true,
            },
        ],
    };

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    function fetchOrdersChartData(orderData) {
        setIsLoading(true);

        if (orderData.length > 0) {
            const monthsData = [];
            orderData.forEach((item, index) => {
                const d = new Date(item.order_created_at);
                monthsData.push(monthNames[d.getMonth()]);
                // if (index === 0) {
                //     monthsData.push(monthNames[d.getMonth() - 1]);
                // }
            });
            const uniqueMonthsData = monthsData.reduce(function (prev, cur) {
                prev[cur] = (prev[cur] || 0) + 1;
                return prev;
            }, {});
            if (uniqueMonthsData) {
                const monthsArr = [];
                const monthsValArr = [];
                for (const inner_data in uniqueMonthsData) {
                    monthsArr.push(inner_data);
                    monthsValArr.push(uniqueMonthsData[inner_data]);
                }
                setHorizontalData(monthsArr);
                setVerticalData(monthsValArr);
                setIsLoading(false);
            } else {
                setHorizontalData([]);
                setVerticalData([]);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);}
    };

    useEffect(() => {
        fetchOrdersChartData(orderData);
    }, [orderData]);

    return (
        <>
            <Spinner isLoading={isLoading} loadingText={loadingText} />

            <div className="tabs-box dashboard-table client-table">
                <div className="widget-title">
                    <h4>Total Orders{" "}
                        <span className="optional">
                            ({range && range.length > 0 ? dateFormat(range[0].startDate) : "-"} 
                            {" "} - {" "} {range && range.length > 0 ? dateFormat(range[0].endDate) : "-"})
                        </span>
                    </h4>
                </div>
                {/* End widget top bar */}

                <div className="widget-content">
                    <div className="widget-content">
                        <Bar data={data} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrdersChart;
