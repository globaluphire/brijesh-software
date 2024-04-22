/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import DeliveryOrderProcess from "./deliveryOrderProcess";
import OpenOrderProcess from "./openOrderProcess";
import PickupOrderProcess from "./pickupOrderProcess";

const Orders = () => {
    return (
        <>
            <div
                className="widget-title"
                style={{ fontSize: "1.5rem", fontWeight: "500" }}
            >
                <b>All Orders!</b>
            </div>
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
            </Tabs>
            {/* End table widget content */}
        </>
    );
};

export default Orders;
