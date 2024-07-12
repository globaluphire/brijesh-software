/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import DeliveryOrderProcess from "./deliveryOrderProcess";
import OpenOrderProcess from "./openOrderProcess";
import PickupOrderProcess from "./pickupOrderProcess";
import CompletedOrderProcess from "./completedOrderProcess";
import CancelledOrderProcess from "./cancelledOrderProcess";

const Orders = () => {
    return (
        <>
            {/* <div
                className="widget-title"
                style={{ minHeight: "5px", padding: "0px" }}
            >
                <b>All Orders!</b>
            </div> */}
            {/* Start table widget content */}
            <Tabs
                defaultActiveKey="Open"
                transition={true}
                id="noanim-tab-example"
                className="mb-3"
            >
                <Tab eventKey="Pickup" title="Pickup Order Process">
                    <PickupOrderProcess />
                </Tab>
                <Tab eventKey="Delivery" title="Delivery Order Process">
                    <DeliveryOrderProcess />
                </Tab>
                <Tab eventKey="Open" title="Open Order Process">
                    <OpenOrderProcess />
                </Tab>
                <Tab eventKey="Completed" title="Completed Orders">
                    <CompletedOrderProcess />
                </Tab>
                <Tab eventKey="Cancelled" title="Cancelled Orders">
                    <CancelledOrderProcess />
                </Tab>
            </Tabs>
            {/* End table widget content */}
        </>
    );
};

export default Orders;
