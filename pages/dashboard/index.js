import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Menu } from "primereact/menu";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ProductService } from "../../demo/service/ProductService";
import { LayoutContext } from "../../layout/context/layoutcontext";
import Link from "next/link";
import Spinner from "../../components/spinner";
import { supabase } from "../../config/supabaseClient";
import OrdersChart from "../../components/dashboard/OrdersChart";

const lineData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
        {
            label: "First Dataset",
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            backgroundColor: "#2f4860",
            borderColor: "#2f4860",
            tension: 0.4,
        },
        {
            label: "Second Dataset",
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: "#00bb7e",
            borderColor: "#00bb7e",
            tension: 0.4,
        },
    ],
};

const Dashboard = () => {
    const [products, setProducts] = useState(null);
    const menu1 = useRef(null);
    const menu2 = useRef(null);
    const [lineOptions, setLineOptions] = useState(null);
    const { layoutConfig } = useContext(LayoutContext);

    const applyLightTheme = () => {
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

        setLineOptions(lineOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: "#ebedef",
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#ebedef",
                    },
                    grid: {
                        color: "rgba(160, 167, 181, .3)",
                    },
                },
                y: {
                    ticks: {
                        color: "#ebedef",
                    },
                    grid: {
                        color: "rgba(160, 167, 181, .3)",
                    },
                },
            },
        };

        setLineOptions(lineOptions);
    };

    useEffect(() => {
        ProductService.getProductsSmall().then((data) => setProducts(data));
    }, []);

    useEffect(() => {
        if (layoutConfig.colorScheme === "light") {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    const formatCurrency = (value) => {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        });
    };

    // added by me
    const [recentOrderLoading, setRecentOrderLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState(
        "Dashboard Data is loading..."
    );

    // states for top card
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalClients, setTotalClients] = useState(0);
    const [totalLocations, setTotalLocations] = useState(0);

    // states for Orders
    const [recentOrders, setRecentOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalUnderPickupProcess, setTotalUnderPickupProcess] = useState(0);
    const [totalReadyForPickup, setTotalReadyForPickup] = useState(0);
    const [totalTempoUnderProcess, setTotalTempoUnderProcess] = useState(0);
    const [totalInProcessDeparture, setTotalInProcessDeparture] = useState(0);
    const [totalAtDestinationWarehouse, setTotalAtDestinationWarehouse] =
        useState(0);
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
    }

    async function fetchOrderData() {
        setIsLoading(true);

        // fetch data for Orders
        const { data: ordersData, error: ordersError } = await supabase
            .from("orders")
            .select("status, order_created_at")
            .neq("order_number", "DEFAULT")
            // .gte("order_created_at", convertToSearchFilterDateTimeFrom(range[0].startDate))
            // .lte("order_created_at", convertToSearchFilterDateTimeTo(range[0].endDate))
            .order("order_created_at", { ascending: false });

        if (ordersData) {
            setTotalOrders(ordersData);

            // filter by status
            const underPickupProcessCount = ordersData.filter(
                (i) => i.status === "Under pickup process"
            );
            setTotalUnderPickupProcess(underPickupProcessCount.length);

            const totalReadyForPickupCount = ordersData.filter(
                (i) => i.status === "Ready for pickup"
            );
            setTotalReadyForPickup(totalReadyForPickupCount.length);

            const totalTempoUnderProcessCount = ordersData.filter(
                (i) => i.status === "Tempo under the process"
            );
            setTotalTempoUnderProcess(totalTempoUnderProcessCount.length);

            const totalInProcessDepartureCount = ordersData.filter(
                (i) => i.status === "In process of departure"
            );
            setTotalInProcessDeparture(totalInProcessDepartureCount.length);

            const totalAtDestinationWarehouseCount = ordersData.filter(
                (i) => i.status === "At destination city warehouse"
            );
            setTotalAtDestinationWarehouse(
                totalAtDestinationWarehouseCount.length
            );

            const totalReadyForDeliveryCount = ordersData.filter(
                (i) => i.status === "Ready for final delivery"
            );
            setTotalReadyForDelivery(totalReadyForDeliveryCount.length);

            const totalCompletedCount = ordersData.filter(
                (i) => i.status === "Completed"
            );
            setTotalCompleted(totalCompletedCount.length);

            const totalCancelledCount = ordersData.filter(
                (i) => i.status === "Cancel"
            );
            setTotalCancelled(totalCancelledCount.length);

            setIsLoading(false);
        } else {
            setIsLoading(false);
        }

        // fetch data for Orders
        const { data: recentOrdersData, error: recentOrdersError } =
            await supabase
                .from("new_order_view")
                .select(
                    "order_created_by_name, order_updated_by_name, pickup_date, status, client_name, order_number, lr_number"
                )
                .order("order_created_at", { ascending: false })
                .range(0, 9);
        if (recentOrdersData) {
            setRecentOrders(recentOrdersData);
            setRecentOrderLoading(false);
        } else {
            setRecentOrderLoading(false);
        }
    }

    async function fetchLRsData() {
        setIsLoading(true);

        const { data: lrData, error: lrError } = await supabase
            .from("lr")
            .select("status")
            .neq("lr_number", "DEFAULT");
        //   .gte(
        //     "lr_created_date",
        //     convertToSearchFilterDateTimeFrom(range[0].startDate)
        //   )
        //   .lte(
        //     "lr_created_date",
        //     convertToSearchFilterDateTimeTo(range[0].endDate)
        //   );

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
    }

    async function fetchInvoicesData() {
        setIsLoading(true);

        const { data: invoiceData, error: invoiceError } = await supabase
            .from("invoice")
            .select("is_paid, total_amount");
        //   .gte(
        //     "invoice_created_at",
        //     convertToSearchFilterDateTimeFrom(range[0].startDate)
        //   )
        //   .lte(
        //     "invoice_created_at",
        //     convertToSearchFilterDateTimeTo(range[0].endDate)
        //   );

        if (invoiceData) {
            setTotalInvoices(invoiceData.length);

            // filter by status
            const paidCount = invoiceData.filter((i) => i.is_paid === true);
            setTotalPaid(paidCount.length);

            const unpaidCount = invoiceData.filter((i) => i.is_paid === false);
            setTotalUnpaid(unpaidCount.length);

            var totalDebAmount = 0;
            var totalCredAmount = 0;
            for (let i = 0; i < invoiceData.length; i++) {
                if (!invoiceData[i].is_paid) {
                    totalDebAmount =
                        totalDebAmount + invoiceData[i].total_amount;
                }
                if (invoiceData[i].is_paid) {
                    totalCredAmount =
                        totalCredAmount + invoiceData[i].total_amount;
                }
            }
            setTotalDebitAmount(totalDebAmount);
            setTotalCreditAmount(totalCredAmount);

            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }

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

    const orderCountsPerStatus = [
        {
            id: 1,
            status: "Under Pickup Process",
            count: totalUnderPickupProcess,
            percentage: (
                (totalUnderPickupProcess * 100) /
                totalOrders.length
            ).toFixed(2),
            backgroundColor: "#B55385",
        },
        {
            id: 2,
            status: "Ready for pickup",
            count: totalReadyForPickup,
            percentage: (
                (totalReadyForPickup * 100) /
                totalOrders.length
            ).toFixed(2),
            backgroundColor: "#87CEEB",
        },
        {
            id: 3,
            status: "Tempo under the process",
            count: totalTempoUnderProcess,
            percentage: (
                (totalTempoUnderProcess * 100) /
                totalOrders.length
            ).toFixed(2),
            backgroundColor: "#FFA500",
        },
        {
            id: 4,
            status: "In process of departure",
            count: totalInProcessDeparture,
            percentage: (
                (totalInProcessDeparture * 100) /
                totalOrders.length
            ).toFixed(2),
            backgroundColor: "#8f83c3",
        },
        {
            id: 5,
            status: "At destination city warehouse",
            count: totalAtDestinationWarehouse,
            percentage: (
                (totalAtDestinationWarehouse * 100) /
                totalOrders.length
            ).toFixed(2),
            backgroundColor: "#FFE284",
        },
        {
            id: 6,
            status: "Ready for final delivery",
            count: totalReadyForDelivery,
            percentage: (
                (totalReadyForDelivery * 100) /
                totalOrders.length
            ).toFixed(2),
            backgroundColor: "green",
        },
        {
            id: 7,
            status: "Completed",
            count: totalCompleted,
            percentage: ((totalCompleted * 100) / totalOrders.length).toFixed(
                2
            ),
            backgroundColor: "grey",
        },
        {
            id: 8,
            status: "Cancel",
            count: totalCancelled,
            percentage: ((totalCancelled * 100) / totalOrders.length).toFixed(
                2
            ),
            backgroundColor: "red",
        },
    ];

    const lrCountsPerStatus = [
        {
            id: 1,
            status: "Performa",
            count: totalPerforma,
            percentage: ((totalPerforma * 100) / totalLRs).toFixed(2),
            backgroundColor: "orange",
        },
        {
            id: 2,
            status: "Final",
            count: totalFinal,
            percentage: ((totalFinal * 100) / totalLRs).toFixed(2),
            backgroundColor: "green",
        },
        {
            id: 3,
            status: "Unknown",
            count: totalLRs - totalPerforma - totalFinal,
            percentage: (
                ((totalLRs - totalPerforma - totalFinal) * 100) /
                totalLRs
            ).toFixed(2),
            backgroundColor: "grey",
        },
    ];

    const invoiceCountsPerStatus = [
        {
            id: 1,
            status: "Paid",
            count: totalPaid,
            percentage: ((totalPaid * 100) / (totalPaid + totalUnpaid)).toFixed(
                2
            ),
            amount: totalCreditAmount,
            backgroundColor: "green",
        },
        {
            id: 2,
            status: "Unpaid",
            count: totalUnpaid,
            percentage: (
                (totalUnpaid * 100) /
                (totalPaid + totalUnpaid)
            ).toFixed(2),
            amount: totalDebitAmount,
            backgroundColor: "red",
        },
    ];
    // all recent order render blocks
    const orderCreatedInfoRender = (rowData) => {
        return (
            <>
                <span>{rowData.order_created_by_name}</span> <br />
                <span>
                    {rowData.order_updated_by_name
                        ? rowData.order_updated_by_name
                        : "-"}
                </span>
            </>
        );
    };

    return (
        <>
            <Spinner isLoading={isLoading} loadingText={loadingText} />

            <div className="grid">
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">
                                    Orders
                                </span>
                                <div className="text-900 font-medium text-xl">
                                    {totalOrders.length}
                                </div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-blue-100 border-round"
                                style={{ width: "2.5rem", height: "2.5rem" }}
                            >
                                <i className="pi pi-shopping-cart text-blue-500 text-xl" />
                            </div>
                        </div>
                        {/* <span className="text-green-500 font-medium">24 new </span>
            <span className="text-500">since last visit</span> */}
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">
                                    Clients
                                </span>
                                <div className="text-900 font-medium text-xl">
                                    {totalClients}
                                </div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-orange-100 border-round"
                                style={{ width: "2.5rem", height: "2.5rem" }}
                            >
                                <i className="pi pi-map-marker text-orange-500 text-xl" />
                            </div>
                        </div>
                        {/* <span className="text-green-500 font-medium">%52+ </span>
            <span className="text-500">since last week</span> */}
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">
                                    Locations
                                </span>
                                <div className="text-900 font-medium text-xl">
                                    {totalLocations}
                                </div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-cyan-100 border-round"
                                style={{ width: "2.5rem", height: "2.5rem" }}
                            >
                                <i className="pi pi-inbox text-cyan-500 text-xl" />
                            </div>
                        </div>
                        {/* <span className="text-green-500 font-medium">520 </span>
            <span className="text-500">newly registered</span> */}
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">
                                    Users
                                </span>
                                <div className="text-900 font-medium text-xl">
                                    {totalUsers}
                                </div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-purple-100 border-round"
                                style={{ width: "2.5rem", height: "2.5rem" }}
                            >
                                <i className="pi pi-comment text-purple-500 text-xl" />
                            </div>
                        </div>
                        {/* <span className="text-green-500 font-medium">85 </span>
            <span className="text-500">responded</span> */}
                    </div>
                </div>

                <div className="col-12 xl:col-6">
                    <div className="card">
                        <h5>Recent Sales</h5>
                        <DataTable
                            value={recentOrders}
                            loading={recentOrderLoading}
                            rows={5}
                            size="small"
                            paginator
                            dataKey="order_id"
                            showGridlines
                            stripedRows
                            rowHover
                            emptyMessage="No orders found"
                            responsiveLayout="scroll"
                        >
                            <Column
                                field="order_created_updated_by_name"
                                header="Created/Updated By"
                                body={orderCreatedInfoRender}
                            />
                            <Column field="client_name" header="Client Name" />
                            <Column
                                field="order_number"
                                header="ERP Order No"
                            />
                            <Column field="lr_number" header="LR No" />
                        </DataTable>
                    </div>
                </div>

                <div className="col-12 xl:col-6">
                    <div className="card min-h-full">
                        <h5>Sales Overview</h5>
                        <OrdersChart orderData={totalOrders} />
                        {/* <Chart type="line" data={lineData} options={lineOptions} /> */}
                    </div>
                </div>

                <div className="col-12 xl:col-6">
                    <div className="card">
                        <div className="flex justify-content-between align-items-center mb-5">
                            <h5>Order counts per status</h5>
                            {/* <div>
                <Button
                  type="button"
                  icon="pi pi-ellipsis-v"
                  className="p-button-rounded p-button-text p-button-plain"
                  onClick={(event) => menu1.current.toggle(event)}
                />
                <Menu
                  ref={menu1}
                  popup
                  model={[
                    { label: "Add New", icon: "pi pi-fw pi-plus" },
                    { label: "Remove", icon: "pi pi-fw pi-minus" },
                  ]}
                />
              </div> */}
                        </div>
                        <ul className="list-none p-0 m-0">
                            {orderCountsPerStatus.map((item) => (
                                <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                                    <div>
                                        <span className="text-900 font-medium mr-2 mb-1 md:mb-0">
                                            {item.status}
                                        </span>
                                        <div className="mt-1 text-600">
                                            (count: {item.count})
                                        </div>
                                    </div>
                                    <div className="mt-2 md:mt-0 flex align-items-center">
                                        <div
                                            className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                                            style={{ height: "8px" }}
                                        >
                                            <div
                                                className="h-full"
                                                style={{
                                                    backgroundColor:
                                                        item.backgroundColor,
                                                    width:
                                                        item.percentage + "%",
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="ml-3 font-medium"
                                            style={{
                                                color: item.backgroundColor,
                                            }}
                                        >
                                            %({item.percentage})
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-12 xl:col-6">
                    <div className="card">
                        <div className="flex justify-content-between align-items-center mb-5">
                            <h5>LR counts per status</h5>
                        </div>
                        <ul className="list-none p-0 m-0">
                            {lrCountsPerStatus.map((item) => (
                                <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                                    <div>
                                        <span className="text-900 font-medium mr-2 mb-1 md:mb-0">
                                            {item.status}
                                        </span>
                                        <div className="mt-1 text-600">
                                            (count: {item.count})
                                        </div>
                                    </div>
                                    <div className="mt-2 md:mt-0 flex align-items-center">
                                        <div
                                            className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                                            style={{ height: "8px" }}
                                        >
                                            <div
                                                className="h-full"
                                                style={{
                                                    backgroundColor:
                                                        item.backgroundColor,
                                                    width:
                                                        item.percentage + "%",
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="ml-3 font-medium"
                                            style={{
                                                color: item.backgroundColor,
                                            }}
                                        >
                                            %({item.percentage})
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="card">
                        <div className="flex justify-content-between align-items-center mb-5">
                            <h5>Invoice counts per status</h5>
                        </div>
                        <ul className="list-none p-0 m-0">
                            {invoiceCountsPerStatus.map((item) => (
                                <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                                    <div>
                                        <span className="text-900 font-medium mr-2 mb-1 md:mb-0">
                                            {item.status}
                                        </span>
                                        <div className="mt-1 text-600">
                                            (count: {item.count}, amount:{" "}
                                            {item.amount})
                                        </div>
                                    </div>
                                    <div className="mt-2 md:mt-0 flex align-items-center">
                                        <div
                                            className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                                            style={{ height: "8px" }}
                                        >
                                            <div
                                                className="h-full"
                                                style={{
                                                    backgroundColor:
                                                        item.backgroundColor,
                                                    width:
                                                        item.percentage + "%",
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="ml-3 font-medium"
                                            style={{
                                                color: item.backgroundColor,
                                            }}
                                        >
                                            %({item.percentage})
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* <div className="col-12 xl:col-6">
          <div className="card">
            <h5>Sales Overview</h5>
            <OrdersChart orderData={totalOrders} />
            <Chart type="line" data={lineData} options={lineOptions} />
          </div>

           <div className="card">
            <div className="flex align-items-center justify-content-between mb-4">
              <h5>Notifications</h5>
              <div>
                <Button
                  type="button"
                  icon="pi pi-ellipsis-v"
                  className="p-button-rounded p-button-text p-button-plain"
                  onClick={(event) => menu2.current.toggle(event)}
                />
                <Menu
                  ref={menu2}
                  popup
                  model={[
                    { label: "Add New", icon: "pi pi-fw pi-plus" },
                    { label: "Remove", icon: "pi pi-fw pi-minus" },
                  ]}
                />
              </div>
            </div>

            <span className="block text-600 font-medium mb-3">TODAY</span>
            <ul className="p-0 mx-0 mt-0 mb-4 list-none">
              <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                  <i className="pi pi-dollar text-xl text-blue-500" />
                </div>
                <span className="text-900 line-height-3">
                  Richard Jones
                  <span className="text-700">
                    {" "}
                    has purchased a blue t-shirt for{" "}
                    <span className="text-blue-500">79$</span>
                  </span>
                </span>
              </li>
              <li className="flex align-items-center py-2">
                <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
                  <i className="pi pi-download text-xl text-orange-500" />
                </div>
                <span className="text-700 line-height-3">
                  Your request for withdrawal of{" "}
                  <span className="text-blue-500 font-medium">2500$</span> has
                  been initiated.
                </span>
              </li>
            </ul>

            <span className="block text-600 font-medium mb-3">YESTERDAY</span>
            <ul className="p-0 m-0 list-none">
              <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                  <i className="pi pi-dollar text-xl text-blue-500" />
                </div>
                <span className="text-900 line-height-3">
                  Keyser Wick
                  <span className="text-700">
                    {" "}
                    has purchased a black jacket for{" "}
                    <span className="text-blue-500">59$</span>
                  </span>
                </span>
              </li>
              <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-pink-100 border-circle mr-3 flex-shrink-0">
                  <i className="pi pi-question text-xl text-pink-500" />
                </div>
                <span className="text-900 line-height-3">
                  Jane Davis
                  <span className="text-700">
                    {" "}
                    has posted a new questions about your product.
                  </span>
                </span>
              </li>
            </ul>
          </div> */}
                {/* <div
            className="px-4 py-5 shadow-2 flex flex-column md:flex-row md:align-items-center justify-content-between mb-3"
            style={{
              borderRadius: "1rem",
              background:
                "linear-gradient(0deg, rgba(0, 123, 255, 0.5), rgba(0, 123, 255, 0.5)), linear-gradient(92.54deg, #1C80CF 47.88%, #FFFFFF 100.01%)",
            }}
          >
            <div>
              <div className="text-blue-100 font-medium text-xl mt-2 mb-3">
                TAKE THE NEXT STEP
              </div>
              <div className="text-white font-medium text-5xl">
                Try PrimeBlocks
              </div>
            </div>
            <div className="mt-4 mr-auto md:mt-0 md:mr-0">
              <Link
                href="https://blocks.primereact.org"
                className="p-button font-bold px-5 py-3 p-button-warning p-button-rounded p-button-raised"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div> */}
            </div>
        </>
    );
};

export default Dashboard;
