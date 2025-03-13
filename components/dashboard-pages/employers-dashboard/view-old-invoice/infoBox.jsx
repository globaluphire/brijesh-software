/* eslint-disable no-unused-vars */
import { Col, Container, Row, Table } from "react-bootstrap";

const infoBox = ({ fetchedInvoicedata }) => {
    return (
        <div className="info-box">
            <div className="left-column">
                <div className="company-details custom-border px-3 py-2">
                    <span><b>Comapny Name: RAFTAAR LOGISTICS </b></span><br />
                    <span><b>Head Office: </b>CC-101 Saivandan Madan, Opp Azad Madan, Raopura, Vadodara, Gujarat 390001</span> <br />
                    <span><b>PAN: </b>CUBPP3442C</span>
                    {/* <span>
                    <t></t> | <t></t><b>Email: </b>margisoni031@gmail.com
                    </span> */}
                    {/* <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span>  */}
                    <span>
                    <t></t> | <t></t><b>GSTIN: </b>24CUBPP3442C1Z2
                    </span>
                </div>
                <div className="company-details custom-border px-3 py-2">
                    <b>Buyer (Bill to)</b> <br />
                    <div className="px-2">
                        <span><b>Company Name: {fetchedInvoicedata.company_name}</b></span> <br />
                        <span>
                            <b>Address: </b>{fetchedInvoicedata.company_address}
                        </span> <br />
                        <span>
                            <b>GSTIN/UIN:</b> {fetchedInvoicedata.company_gst}<br />
                        </span>
                    </div>
                </div>
            </div>

            <div className="right-column line-height-shrink">
                <div className="info">
                    <Container className="custom-border">
                        <Row>
                            <Col className="custom-border">Vehicle No. <br /><b>{fetchedInvoicedata.vehical_number}</b> </Col>
                            <Col className="custom-border">Bill of Lading/LR-RR No. <br /><b>{fetchedInvoicedata.lr_number}</b> </Col>
                        </Row>
                        <Row>
                            <Col className="custom-border">Terms of Delivery <br /> &nbsp; <br /> &nbsp; <br /> &nbsp; <br /> &nbsp; </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default infoBox;
