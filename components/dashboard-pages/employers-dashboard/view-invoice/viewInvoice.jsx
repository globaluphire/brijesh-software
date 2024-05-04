/* eslint-disable no-unused-vars */
import { Col, Container, Row } from "react-bootstrap";

const ViewInvoice = () => {
    return (
        <>
            <Container className="custom-border">
                <Row>
                    <Col md={1} className="custom-border"><b>Sl No</b></Col>
                    <Col md={5} className="custom-border"><b>Description of Services</b></Col>
                    <Col md={2} className="custom-border"><b>HSN/SAC</b></Col>
                    <Col md={2} className="custom-border"><b>Quantity</b></Col>
                    <Col md={2} className="custom-border"><b>Amount</b></Col>
                </Row>
                <Row>
                    <Col md={1} className="custom-border">1</Col>
                    <Col md={5} className="custom-border">
                        <b>GJ 13AW 8607</b> <br />
                        <div className="px-2 line-height-shrink">
                            <span className="optional">Morbi to Baroda</span> <br />
                            <span className="optional">200X1200=10</span> <br />
                            <span className="optional">metro ceramic</span> <br />
                            <span className="optional">BRD20240410001</span> <br />
                            <span className="optional">ewaybill.601709969843</span> <br /> &nbsp; <br /> &nbsp;
                        </div>
                    </Col>
                    <Col md={2} className="custom-border">996791</Col>
                    <Col md={2} className="custom-border">200.00 kgs</Col>
                    <Col md={2} className="custom-border">900.00</Col>
                </Row>
                <Row>
                    <Col md={1} className="custom-border"></Col>
                    <Col md={5} className="custom-border">
                        <b>Total</b>
                    </Col>
                    <Col md={2} className="custom-border"></Col>
                    <Col md={2} className="custom-border">200.00 kgs</Col>
                    <Col md={2} className="custom-border"><b><i className="las la-rupee-sign"></i>900.00</b> <br />
                        <div className="line-height-shrink optional">(INR Nine Hundred Only)</div>
                    </Col>
                </Row>
            </Container>

            <Container className="custom-border mt-1 line-height-shrink">
                <Row>
                    <Col md={6} className="custom-border" style={{ borderBottom: 0 }}><b>Taxable</b></Col>
                    <Col md={2} className="custom-border"><b>CGST</b></Col>
                    <Col md={2} className="custom-border"><b>SGST/UTGST</b></Col>
                    <Col md={2} className="custom-border" style={{ borderBottom: 0 }}><b>Total</b></Col>
                </Row>
                <Row>
                    <Col md={6} className="custom-border" style={{ borderTop: 0 }}><b>Value</b></Col>
                    <Col md={1} className="custom-border"><b>Rate</b></Col>
                    <Col md={1} className="custom-border"><b>Amount</b></Col>
                    <Col md={1} className="custom-border"><b>Rate</b></Col>
                    <Col md={1} className="custom-border"><b>Amount</b></Col>
                    <Col md={2} className="custom-border" style={{ borderTop: 0 }}><b>Tax Amount</b></Col>
                </Row>
                <Row>
                    <Col md={6} className="custom-border">900.00</Col>
                    <Col md={1} className="custom-border">2.50%</Col>
                    <Col md={1} className="custom-border">22.50</Col>
                    <Col md={1} className="custom-border">2.50%</Col>
                    <Col md={1} className="custom-border">22.50</Col>
                    <Col md={2} className="custom-border">45.00</Col>
                </Row>
                <Row>
                    <Col md={6} className="custom-border"><b>Total: 900.00</b></Col>
                    <Col md={1} className="custom-border"><b></b></Col>
                    <Col md={1} className="custom-border"><b>22.50</b></Col>
                    <Col md={1} className="custom-border"><b></b></Col>
                    <Col md={1} className="custom-border"><b>22.50</b></Col>
                    <Col md={2} className="custom-border"><b><i className="las la-rupee-sign"></i>45.00 </b>
                        <span className="line-height-shrink optional">(INR Forty Five Only) Amount of tax subject to Reverse Charge</span>
                    </Col>
                </Row>
            </Container>

            <Container className="custom-border mt-2">
                <Row>
                    <Col md={5} className="custom-border">
                        <b>
                            Company's Bank Details <br />
                        </b>
                        <div className="px-2 line-height-shrink">
                            <span><b>A/C Holder's Name: </b>RAFTAAR LOGISTICS - BARODA</span> <br />
                            <span><b>Bank Name: </b>ICICI HO - 00313</span> <br />
                            <span><b>A/C No: </b>230805000313</span> <br />
                            <span><b>Branch & IFS Code: </b>Ahmedabad Bodakdev Branch & ICIC0002308</span> <br />
                            <span><b>SWIFT Code : </b></span> 
                        </div>
                    </Col>
                    <Col md={3} className="custom-border">
                        <b>Company's PAN: </b> GFSPS6256B <br />
                        <div className="optional line-height-shrink">
                            <div style={{ textDecoration: "underline", marginBottom: "-8px" }}>Declaration</div> <br />
                            <div className="px-1">
                                We declare that this invoice shows the actual price of
                                the goods described and that all particulars are true
                                and correct.
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="custom-border"><b>for RAFTAAR LOGISTICS <br /> &nbsp; <br /> &nbsp; <br /> Authorised Signatory</b></Col>
                </Row>
            </Container>
        </>
    );
};

export default ViewInvoice;
