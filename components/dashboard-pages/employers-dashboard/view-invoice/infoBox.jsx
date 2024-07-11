/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import { convertToFullDateFormat } from "../../../../utils/convertToFullDateFormat";

const infoBox = ({ fetchedInvoiceData, fetchedClientData, fetchedOrderData, fetchedLrData }) => {
    const [checkedAllStates, setCheckedAllStates] = useState(false);

    useEffect(() => {
        setCheckedAllStates(true);
    }, [(Object.keys(fetchedInvoiceData).length !== 0 && 
        Object.keys(fetchedOrderData).length !== 0 && 
        fetchedLrData.length !== 0 && 
        Object.keys(fetchedClientData).length !== 0)]);

    return (
        <>
            { checkedAllStates ?
                <div className="info-box">
                    <div className="left-column">
                        {/* <div className="company-details custom-border px-3 py-2">
                            <span><b>Comapny Name: RAFTAAR LOGISTICS </b></span><br />
                            <span><b>Head Office: </b>51 and 52 Sinde Colony, S R P Road, Navapura, Vadodara, Gujarat 390001</span> <br />
                            <span><b>PAN: </b>GFSPS6256B</span>
                            <span>
                            <t></t> | <t></t><b>GSTIN: </b>24GFSPS6256B1Z1
                            </span>
                        </div> */}
                        <div className="company-details px-3 py-2" style={{ border: "2px solid black" }}>
                            <b>Buyer (Bill to)</b> <br />
                            <div className="px-2">
                                <span><b>Company Name: {fetchedClientData.client_name}</b></span> <br />
                                <span>
                                    <b>Address: </b>
                                    {fetchedClientData.address1 ? fetchedClientData.address1 + ", ": ""}
                                    {fetchedClientData.address2 ? fetchedClientData.address2 + ", ": ""}
                                    {fetchedClientData.area ? fetchedClientData.area + ", ": ""}
                                    {fetchedClientData.city ? fetchedClientData.city + ", ": ""}
                                    {fetchedClientData.state ? fetchedClientData.state + ", ": ""}
                                    {fetchedClientData.pin ? fetchedClientData.pin: ""}
                                </span> <br />
                                <span>
                                    <b>GSTIN/UIN:</b> {fetchedClientData.client_gst}<br />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="right-column line-height-shrink">
                        <div className="info">
                            <Container className="custom-border">
                                {Object.keys(fetchedInvoiceData).length !== 0 ?
                                    <Row>
                                        <Col className="custom-border"> 
                                            Invoice # <br />
                                            <b>{ fetchedInvoiceData.invoice_number }</b>
                                        </Col>
                                        <Col className="custom-border">
                                            <span> Invoice date: </span> <br />
                                            <b>
                                                { convertToFullDateFormat(fetchedInvoiceData.invoice_date, true) }
                                            </b>
                                        </Col>
                                    </Row>
                                : "" }
                                <Row>
                                    <Col className="custom-border">Vehicle No. <br />
                                        <b>
                                            {fetchedLrData.length > 0 ? fetchedLrData[0].vehical_number : ""}
                                        </b>
                                    </Col>
                                    <Col className="custom-border">Bill of Lading/LR-RR No. <br />
                                        <b>
                                            {fetchedLrData.length > 0 ? fetchedLrData[0].lr_number : ""}
                                        </b>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="custom-border">Terms of Delivery <br /> &nbsp; <br /> &nbsp; <br /> &nbsp; <br /> &nbsp; </Col>
                                </Row>
                            </Container>
                        </div>
                    </div>
                </div>
            : "" }
        </>
    );
};

export default infoBox;
