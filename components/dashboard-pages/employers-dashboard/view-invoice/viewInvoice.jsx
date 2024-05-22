/* eslint-disable no-unused-vars */
import { Col, Container, Row } from "react-bootstrap";
import { convertNumberToWords } from "../../../../utils/convertNumberToWords";
import { ToWords } from "to-words";
import { useEffect, useState } from "react";

const ViewInvoice = ({ fetchedInvoiceData, fetchedClientData, fetchedOrderData, fetchedLrData }) => {
    const [checkedAllStates, setCheckedAllStates] = useState(false);

    useEffect(() => {
        setCheckedAllStates(true);
    }, [(Object.keys(fetchedInvoiceData).length !== 0 && 
        Object.keys(fetchedOrderData).length !== 0 && 
        fetchedLrData.length !== 0 && 
        Object.keys(fetchedClientData).length !== 0)]);

    const toWords = new ToWords({
        localeCode: "en-IN",
        converterOptions: {
            currency: true,
            ignoreDecimal: false,
            ignoreZeroCurrency: false,
            doNotAddOnly: false,
            currencyOptions: {
                // can be used to override defaults for the selected locale
                name: "Rupee",
                singular: "Rupee",
                plural: "Rupees",
                symbol: "₹",
                fractionalUnit: {
                    name: "Paisa",
                    singular: "Paisa",
                    plural: "Paise",
                    symbol: "",
                },
            },
        },
    });

    return (
        <>
            { checkedAllStates ?
                <>
                    <Container className="custom-border" style={{ borderRadius: "10px !important" }}>
                        <Row style={{ backgroundColor: "#5F8CAB" }}>
                            <Col md={1} className="custom-border"><b>#</b></Col>
                            <Col md={5} className="custom-border"><b>Description of Services</b></Col>
                            <Col md={2} className="custom-border"><b>HSN/SAC</b></Col>
                            <Col md={2} className="custom-border"><b>Quantity</b></Col>
                            <Col md={2} className="custom-border"><b>Amount</b></Col>
                        </Row>
                        <Row>
                            <Col md={1} className="custom-border">1</Col>
                            <Col md={5} className="custom-border">
                                <b>{fetchedLrData.length > 0 ? fetchedLrData[1].vehical_number : ""}</b> <br />
                                <div className="px-2 pb-1 line-height-shrink">
                                    <span className="optional">{fetchedOrderData.pickup_location} to {fetchedOrderData.drop_location}</span> <br />
                                    <span className="optional">{fetchedOrderData.quantity}</span> <br />
                                    <span className="optional">{fetchedOrderData.material}</span> <br />
                                    <span className="optional">{fetchedOrderData.order_number}</span> <br />
                                    <span className="optional">Eway Bill #{fetchedOrderData.eway_number}</span>
                                </div>
                            </Col>
                            <Col md={2} className="custom-border">996791</Col>
                            <Col md={2} className="custom-border">{fetchedOrderData.weight} Kgs</Col>
                            <Col md={2} className="custom-border">{parseFloat(fetchedInvoiceData.total_amount).toFixed(2)}</Col>
                        </Row>
                        <Row>
                            <Col md={1} className="custom-border"></Col>
                            <Col md={5} className="custom-border">
                                <b>Total</b>
                            </Col>
                            <Col md={2} className="custom-border"></Col>
                            <Col md={2} className="custom-border">{fetchedInvoiceData.weight} Kgs</Col>
                            <Col md={2} className="custom-border"><b><i className="las la-rupee-sign"></i>{parseFloat(fetchedInvoiceData.total_amount).toFixed(2)}</b><br />
                                <div className="line-height-shrink optional" style={{ fontSize: "xx-small" }}>
                                    {/* (INR {convertNumberToWords(parseInt(fetchedInvoicedata.total_amount))} Rs
                                        {parseFloat(fetchedInvoicedata.total_amount).toFixed(2).slice(-2) !== "00" ?
                                            " And " + convertNumberToWords(parseFloat(fetchedInvoicedata.total_amount).toFixed(2).slice(-2)) + " Paisa "
                                        :  " And Zero Paisa "}
                                    Only) */}
                                    (INR {fetchedInvoiceData && fetchedInvoiceData.total_amount ? toWords.convert(fetchedInvoiceData.total_amount) : ""})
                                    <i> E. & O.E </i>
                                </div>
                            </Col>
                        </Row>
                    </Container>

                    {/* <Container className="custom-border mt-1 line-height-shrink">
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
                            <Col md={6} className="custom-border">{fetchedInvoicedata.total_amount}</Col>
                            <Col md={1} className="custom-border">2.50%</Col>
                            <Col md={1} className="custom-border">{parseFloat(fetchedInvoicedata.total_amount * 0.025).toFixed(2)}</Col>
                            <Col md={1} className="custom-border">2.50%</Col>
                            <Col md={1} className="custom-border">{parseFloat(fetchedInvoicedata.total_amount * 0.025).toFixed(2)}</Col>
                            <Col md={2} className="custom-border">{parseFloat(fetchedInvoicedata.total_amount * 0.025 * 2).toFixed(2)}</Col>
                        </Row>
                        <Row>
                            <Col md={6} className="custom-border"><b>Total: {fetchedInvoicedata.total_amount}</b></Col>
                            <Col md={1} className="custom-border"><b></b></Col>
                            <Col md={1} className="custom-border"><b>{parseFloat(fetchedInvoicedata.total_amount * 0.025).toFixed(2)}</b></Col>
                            <Col md={1} className="custom-border"><b></b></Col>
                            <Col md={1} className="custom-border"><b>{parseFloat(fetchedInvoicedata.total_amount * 0.025).toFixed(2)}</b></Col>
                            <Col md={2} className="custom-border">
                                <div className="py-1">
                                    <b>
                                        <i className="las la-rupee-sign"></i>
                                        {parseFloat(fetchedInvoicedata.total_amount * 0.025 * 2).toFixed(2)}
                                    </b>
                                </div>
                                <div className="line-height-shrink optional" style={{ fontSize: "xx-small" }}>
                                    (INR {convertNumberToWords(parseInt(fetchedInvoicedata.total_amount * 0.025 * 2))} Rs
                                        {parseFloat(fetchedInvoicedata.total_amount * 0.025 * 2).toFixed(2).slice(-2) !== "00" ?
                                            " And " + convertNumberToWords(parseFloat(fetchedInvoicedata.total_amount * 0.025 * 2).toFixed(2).slice(-2)) + " Paisa "
                                        :  " And Zero Paisa "}
                                    Only)
                                    (INR {fetchedInvoicedata && fetchedInvoicedata.total_amount ? toWords.convert(fetchedInvoicedata.total_amount * 0.025 * 2) : ""})
                                    <i><u> Amount of tax subject to Reverse Charge</u></i>
                                </div>
                            </Col>
                        </Row>
                    </Container> */}

                    <Container className="custom-border mt-2">
                        <Row>
                            <Col md={5} className="custom-border">
                                <b>
                                    Company's Bank Details <br />
                                </b>
                                <div className="px-2 line-height-shrink">
                                    <span><b>A/C Holder's Name: </b>Raftaar Logistics</span> <br />
                                    <span><b>Bank Name: </b>HDFC HO - 38410</span> <br />
                                    <span><b>A/C No: </b>50200093338410</span> <br />
                                    <span><b>Branch & IFS Code: </b>Baroda Raopura Branch & HDFC0000429</span> <br />
                                    <span><b>SWIFT Code: </b></span>
                                </div>
                            </Col>
                            <Col md={3} className="custom-border">
                                <div className="optional line-height-shrink" style={{ color: "black" }}>
                                    <div className="pt-2" style={{ textDecoration: "underline", marginBottom: "-8px" }}>Declaration</div> <br />
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
            : "" }
        </>
    );
};

export default ViewInvoice;
