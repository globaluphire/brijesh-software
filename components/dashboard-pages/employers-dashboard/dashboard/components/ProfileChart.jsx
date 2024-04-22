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
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

const ProfileChart = () => {
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

    const lastOneMonth = [
        monthNames[today_date.getMonth() - 2],
        monthNames[today_date.getMonth() - 1],
        monthNames[today_date.getMonth()],
    ];
    const [lastOneMonthData, setLastOneMonthData] = useState([]);

    const lastThreeMonths = [
        monthNames[today_date.getMonth() - 3],
        monthNames[today_date.getMonth() - 2],
        monthNames[today_date.getMonth() - 1],
        monthNames[today_date.getMonth()],
    ];
    const [lastThreeMonthsData, setLastThreeMonthsData] = useState([]);

    const lastSixMonths = [
        monthNames[today_date.getMonth() - 5],
        monthNames[today_date.getMonth() - 4],
        monthNames[today_date.getMonth() - 3],
        monthNames[today_date.getMonth() - 2],
        monthNames[today_date.getMonth() - 1],
        monthNames[today_date.getMonth()],
    ];
    const [lastSixMonthsData, setLastSixMonthsData] = useState([]);

    const [horizontalData, setHorizontalData] = useState(lastSixMonths);
    const [verticalData, setVerticalData] = useState(lastSixMonthsData);

    const data = {
        labels: horizontalData,
        datasets: [
            {
                label: "Applications",
                data: verticalData,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
                fill: false,
            },
        ],
    };

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    );

    const one_month_ago = today_date.setMonth(today_date.getMonth() - 1);
    const last_month_date = new Date(one_month_ago);
    const last_month_date_format =
        last_month_date.getMonth() +
        1 +
        "-" +
        last_month_date.getDate() +
        "-" +
        last_month_date.getFullYear();

    const three_month_ago = today_date.setMonth(today_date.getMonth() - 2);
    const three_month_date = new Date(three_month_ago);
    const three_month_ago_format =
        three_month_date.getMonth() +
        1 +
        "-" +
        three_month_date.getDate() +
        "-" +
        three_month_date.getFullYear();

    const six_month_ago = today_date.setMonth(today_date.getMonth() - 2);
    const six_month_date = new Date(six_month_ago);
    const six_month_ago_format =
        six_month_date.getMonth() +
        1 +
        "-" +
        six_month_date.getDate() +
        "-" +
        six_month_date.getFullYear();

    // let twelve_month_ago = today_date.setMonth(today_date.getMonth() - 2);
    // const twelve_month_date = new Date(twelve_month_ago);
    // const twelve_month_ago_format = (twelve_month_date.getMonth() + 1) + "-" + twelve_month_date.getDate() + "-" + twelve_month_date.getFullYear();

    const user = useSelector((state) => state.candidate.user);
    const [isLoading, setIsLoading] = useState(false);
    const [searchField, setSearchField] = useState("");
    const [lastMonthField, setLastMonthField] = useState(
        last_month_date_format
    );
    const [threeMonthField, setThreeMonthField] = useState(
        three_month_ago_format
    );
    const [sixMonthField, setSixMonthField] = useState(six_month_ago_format);

    const dateFormat = (val) => {
        const date = new Date(val);
        return (
            date.toLocaleDateString("en-IN", {
                month: "long",
                day: "numeric",
            }) +
            ", " +
            date.getFullYear()
        );
    };

    const fetchedAllApplicantsView = async (selectedMonth) => {
        // console.log("selectedMonth",selectedMonth);
        const { data, error } = await supabase
            .from("applicants_view")
            .select("*")
            // .eq('cust_id', user.id)
            .gte("created_at", dateFormat(selectedMonth))
            .order("created_at", { ascending: false });
        if (data) {
            const monthsData = [];
            data.forEach((item, index) => {
                const d = new Date(item.created_at);
                monthsData.push(monthNames[d.getMonth()]);
                if (index === 0) {
                    monthsData.push(monthNames[d.getMonth() - 1]);
                }
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
            } else {
                setHorizontalData([]);
                setVerticalData([]);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        setIsLoading(true);
        setSearchField(six_month_ago_format);
        fetchedAllApplicantsView(six_month_ago_format);
    }, []);

    const handleSelectedMonth = (selectedMonth) => {
        const d1 = new Date();
        const d2 = new Date(selectedMonth);
        const diff = d1.getTime() - d2.getTime();
        const daydiff = diff / (1000 * 60 * 60 * 24);
        if (daydiff < 32) {
            setHorizontalData(lastOneMonth);
            setVerticalData(lastOneMonthData);
        } else if (daydiff < 93) {
            setHorizontalData(lastThreeMonths);
            setVerticalData(lastThreeMonthsData);
        } else {
            setHorizontalData(lastSixMonths);
            setVerticalData(lastSixMonthsData);
        }
        setSearchField(selectedMonth);
        fetchedAllApplicantsView(selectedMonth);
    };

    return (
        <div className="tabs-box">
            <div className="widget-title">
                <h4>Applications</h4>
                <div className="chosen-outer">
                    {/* <!--Tabs Box--> */}
                    <select
                        className="chosen-single form-select"
                        value={searchField}
                        onChange={(e) => {
                            handleSelectedMonth(e.target.value);
                        }}
                    >
                        <option value={sixMonthField}>Last 6 Months</option>
                        <option value={threeMonthField}>Last 3 Months</option>
                        <option value={lastMonthField}>Last 1 Month</option>
                    </select>
                </div>
            </div>
            {/* End widget top bar */}

            <div className="widget-content">
                {isLoading && (
                    <div style={{ width: "20%", margin: "auto" }}>
                        <BallTriangle
                            height={100}
                            width={100}
                            radius={5}
                            color="#000"
                            ariaLabel="ball-triangle-loading"
                            wrapperClass={{}}
                            wrapperStyle=""
                            visible={true}
                        />
                    </div>
                )}
                {isLoading === false && horizontalData && verticalData && (
                    <div className="widget-content">
                        <Line data={data} />
                    </div>
                )}

                {/* {
          isLoading == false && fetchedAllApplicants.length > 0 &&
          <ul className="notification-list">
            {
              fetchedAllApplicants.map((item, index) => {
                return (
                  <li>
                    <span className="icon flaticon-briefcase"></span>
                    <span className="colored1"><small>{item.application_id} ---- {item.job_title}<b>{moment(item.created_at).format("MMMM D, YYYY")}</b></small></span>
                  </li>
                )
              })
            }
          </ul>
        } */}
            </div>
        </div>
    );
};

export default ProfileChart;
