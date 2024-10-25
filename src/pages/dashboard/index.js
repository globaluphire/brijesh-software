/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
// import Seo from "../../../components/common/Seo";
// import DashboadHome from "../../../components/dashboard-pages/employers-dashboard/dashboard";
// import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import Router from "next/router";
// import { authenticate } from "../../../utils/authenticate";
import Seo from "@/components/seo";
import { PanelMenu } from "primereact/panelmenu";
import { useRef } from "react";
import { Toast } from "primereact/toast";
import { Menu } from "primereact/menu";
import Image from "next/image";

const index = () => {
  const user = useSelector((state) => state.initialState.user);
  const toast = useRef(null);
  // const dispatch = useDispatch();

  // const [authenticated, setAuthenticated] = useState(false);
  // const isEmployer = ["SUPER_ADMIN"].includes(user.role);

  // useEffect(() => {
  //     authenticate(user.id, dispatch)
  //         .then((res) => {
  //             if (!isEmployer || res === "NO ACCESS") {
  //                 Router.push("/404");
  //             } else {
  //                 setAuthenticated(true);
  //             }
  //         });
  // }, []);

  const items = [
    {
      label: "Dashboard",
      icon: "pi pi-home",
      access: ["SUPER_ADMIN"],
    },
    {
      label: "Clients",
      icon: "pi pi-users",
      access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
    },
    {
      label: "Locations",
      icon: "pi pi-map-marker",
      access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
    },
    {
      label: "Orders",
      icon: "pi pi-shopping-cart",
      items: [
        {
          label: "Open Orders",
          icon: "pi pi-list",
          url: "/orders/openOrders",
          access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
        },
        {
          label: "Completed Orders",
          icon: "pi pi-list-check",
          url: "/orders/completedOrders",
          access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
        },
        {
          label: "Canceled Orders",
          icon: "pi pi-cart-minus",
          url: "/orders/canceledOrders",
          access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
        },
      ],
      access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
    },
    {
      label: "Billing",
      icon: "pi pi-money-bill",
      access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
    },
    {
      label: "LR",
      icon: "pi pi-receipt",
      access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
    },
    {
      label: "Old Billing",
      icon: "pi pi-money-bill",
      access: ["SUPER_ADMIN"],
    },
    {
      label: "Old LR",
      icon: "pi pi-receipt",
      access: ["SUPER_ADMIN"],
    },
    {
      label: "Ledger",
      icon: "pi pi-address-book",
      access: ["SUPER_ADMIN"],
    },
    {
      label: "Outstandings",
      icon: "pi pi-briefcase",
      access: ["SUPER_ADMIN"],
    },
    {
      label: "Users",
      icon: "pi pi-user-plus",
      access: ["SUPER_ADMIN"],
    },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => {
        toast.current.show({
          severity: "info",
          summary: "Signed out",
          detail: "User logged out",
          life: 3000,
        });
      },
      access: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"],
    },
  ];

  // const items = [
  //     {
  //         label: 'Orders',
  //         items: [
  //             {
  //                 label: 'Open Orders',
  //                 icon: 'pi pi-list',
  //                 url: '/orders/open-orders'
  //             },
  //             {
  //                 label: 'Completed Orders',
  //                 icon: 'pi pi-list-check',
  //                 url: '/orders/completed-orders'
  //             },
  //             {
  //                 label: 'Canceled Orders',
  //                 icon: 'pi pi-cart-minus',
  //                 url: '/orders/canceled-orders'
  //             }
  //         ]
  //     },
  //     {
  //         label: 'Billing',
  //         url: '/billing'
  //     },
  //     {
  //         label: 'LR',
  //         url: '/lr'
  //     },
  //     {
  //         label: 'Clients',
  //         url: '/clients'
  //     },
  //     {
  //         label: 'Locations',
  //         url: '/locations'
  //     },
  //     {
  //         label: 'logout',
  //         url: '/logout'
  //     }
  // ];

  return (
    <>
      {" "}
      {/* {authenticated ? ( */}
      <>
        <Seo pageTitle="Dashboard" />
        {/* <DashboadHome /> */}

        <div className="card flex justify-content-center layout-left">
          <Image
            aria-hidden
            src="/logo.svg"
            alt="Raftaar logo"
            style={{ width: "100%" }}
            width={100}
            height={100}
            className="mb-3"
          />
          <PanelMenu
            model={items}
            className="w-full md:w-20rem layout-left-content"
            multiple
            style={{ fontSize: "12px" }}
          />
          <Toast ref={toast} />

          {/* <div className="card flex justify-content-center">
                <Toast ref={toast} />
                <Menu model={items} />
            </div> */}
        </div>

        <div className="layout-right">
          <div className="layout-right-content">
            <span>Right Side Layout's content</span>
          </div>
        </div>
      </>
      {/* ) : (
                ""
            )} */}
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
