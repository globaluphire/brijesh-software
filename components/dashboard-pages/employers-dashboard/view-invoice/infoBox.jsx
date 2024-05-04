/* eslint-disable no-unused-vars */
import { Col, Container, Row, Table } from "react-bootstrap";

const infoBox = () => {
    return (
        <div className="info-box">
            <div className="left-column">
                <div className="company-details custom-border px-3 py-2">
                    <span><b>Comapny Name: RAFTAAR LOGISTICS </b></span><br />
                    <span><b>Head Office: </b>51 and 52 Sinde Colony, S R P Road, Navapura <br /> Vadodara, Gujarat 390001</span> <br />
                    <span><b>Mobile No: </b>7016229891</span>
                    {/* <span>
                    <t></t> | <t></t><b>Email: </b>margisoni031@gmail.com
                    </span> */}
                    {/* <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span>  */}
                    <span>
                    <t></t> | <t></t><b>GSTIN/UIN: </b>24GFSPS6256B1Z1
                    </span>
                </div>
                <div className="company-details custom-border px-3 py-2">
                    <b>Buyer (Bill to)</b> <br />
                    <div className="px-2">
                        <span><b>Company Name: SHREE MATOSHREE ENTERPRISE</b></span> <br />
                        <span>
                            <b>Address: </b>Tarsali Bypass, Opp. Hotel Legend,
                            N H, No 8, Vadodara, Gujarat 390009 Tarsali Bypass, Opp. Hotel Legend,
                            N H, No 8, Vadodara, Gujarat 390009
                        </span> <br />
                        <span>
                            <b>GSTIN/UIN:</b> 24ADBFS7408J1Z0<br />
                            <b>Code:</b> 24<br />
                            <b>Place of Supply:</b> Gujarat
                        </span>
                    </div>
                </div>
            </div>

            <div className="right-column line-height-shrink">
                <div className="info">
                    <Container className="custom-border">
                        <Row>
                            <Col className="custom-border">Delivery Note <br /> &nbsp; </Col>
                            <Col className="custom-border">Mode/Terms of Payment <br /> &nbsp; </Col>
                        </Row>
                        <Row>
                            <Col className="custom-border">Buyer's Order No. <br /> &nbsp; </Col>
                            <Col className="custom-border">Dated <br /> &nbsp; </Col>
                        </Row>
                        <Row>
                            <Col className="custom-border">Dispatch Doc No. <br /> &nbsp; </Col>
                            <Col className="custom-border">Delivery Note Date <br /> &nbsp; </Col>
                        </Row>
                        <Row>
                            <Col className="custom-border">Dispatched through <br /> &nbsp; </Col>
                            <Col className="custom-border">Destination <br /> &nbsp; </Col>
                        </Row>
                        <Row>
                            <Col className="custom-border">Vehicle No. <br /><b>GJ 33 NM 2431</b> </Col>
                            <Col className="custom-border">Place of receipt by shipper <br /> &nbsp; </Col>
                        </Row>
                        <Row>
                            <Col className="custom-border">City/Port of Loading <br /> &nbsp; </Col>
                            <Col className="custom-border">City/Port of Discharge <br /> &nbsp; </Col>
                        </Row>
                        <Row>
                            <Col className="custom-border">Bill of Lading/LR-RR No. <br /><b>RLR232323011</b> </Col>
                            <Col className="custom-border"> <br /> </Col>
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
