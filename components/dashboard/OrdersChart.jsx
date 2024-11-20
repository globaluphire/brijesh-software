/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";

const OrdersChart = ({ orderData }) => {
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
        label: "Total Sales",
        data: verticalData,
        fill: false,
        backgroundColor: "#2f4860",
        borderColor: "#2f4860",
        tension: 0.4,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        grace: 20,
      },
    },
  };

  const lineOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#495057",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
      y: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
    },
  };

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
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchOrdersChartData(orderData);
  }, [orderData]);

  return (
    <>
      <div className="tabs-box dashboard-table client-table">
        <Chart type="line" data={data} options={lineOptions} />

        {/* <Bar data={data} options={options} /> */}
      </div>
    </>
  );
};

export default OrdersChart;
