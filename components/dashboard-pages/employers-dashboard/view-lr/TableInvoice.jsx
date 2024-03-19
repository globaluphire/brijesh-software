import { Table } from "react-bootstrap";

const TableInvoice = () => {
    return (
        <div>
            <Table responsive="sm">
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", width: "33.33%"}}>
                            <div className="logo-box">
                                <div className="logo">
                                    <img src="../../images/logo.svg" alt="logo" width="150"/>
                                </div>
                            </div>
                        </th>
                        <th style={{ textAlign: "center", width: "33.33%"}}>
                            <span>Comapny Name: <b>Raftaar Pvt Ltd </b></span> <br />
                            <span>Head Office: Baroda, Gujarat, India</span> <br />
                            <span>Mobile No: 98765 43210</span> <br />
                            <span>PAN No: AA12345633</span>
                            <span><t></t> | <t></t>GST No: 23ASDCDE3345S324</span>
                        </th>
                        <th style={{ textAlign: "right", width: "33.33%"}}>
                            <input type="checkbox"/> 
                            <span> Consignor Copy</span><br />
                            <input type="checkbox"/> 
                            <span> Consignee Copy</span><br />
                            <input type="checkbox"/> 
                            <span> Office Copy</span><br />
                            <input type="checkbox"/> 
                            <span> Driver Copy</span><br />
                        </th>
                    </tr>
                </thead>
            </Table>
            <Table responsive="sm">
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", width: "33.33%"}}>
                            <span>LR Date: 15 MAR 2024</span>
                        </th>
                        <th style={{ textAlign: "center", fontSize: "x-large", color: "green", textDecoration: "underline", width: "33.33%"}}>
                            <span>FINAL LR</span>
                        </th>
                        <th style={{ textAlign: "right", width: "33.33%"}}>
                            <span>Last Modified Date: 15 MAR 2024</span>
                        </th>
                    </tr>
                </thead>
            </Table>
            <Table responsive="sm">
                <tbody>
                    <tr>
                        <td style={{ textAlign: "left", width: "33.33%"}}>
                            <span><b>Pickup Address: RAK Ceramic India Pvt Ltd</b></span><br />
                            <span>Lalpur, Morbi, Gujarat</span>
                        </td>
                        <td style={{ textAlign: "center", width: "33.33%"}}>
                            <span><b>From: Morbi</b></span><br />
                            <span><b>To: Mumbai</b></span>
                        </td>
                        <td style={{ textAlign: "right", width: "33.33%"}}>
                            <span><b>Delivery Address: R K Ceramics</b></span><br />
                            <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span>
                        </td>
                    </tr>
                </tbody>
            </Table>
            <Table responsive="sm">
                <tbody>
                    <tr>
                        <td style={{ textAlign: "left", width: "33.33%"}}>
                            <span><b>Consignor: RAK Ceramic India Pvt Ltd </b></span><br />
                            <span>Lalpur, Morbi, Gujarat</span><br />
                            <span>GST No: 24AADFHEY7649JK</span>
                        </td>
                        <td style={{ textAlign: "center", width: "33.33%"}}>
                            <span>Vehical No: GJ017557</span><br />
                            <span>Driver: Rajdeep Bhai</span><br />
                            <span>98765 43210</span>
                        </td>
                        <td style={{ textAlign: "right", width: "33.33%"}}>
                            <span><b>Consignee: R K Ceramics</b></span><br />
                            <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span><br />
                            <span>GST No: 24BBDFHEY7649JK</span>
                        </td>
                    </tr>
                </tbody>
            </Table>
            <Table responsive="sm">
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", width: "60%"}}>
                            <span><b>Material Details</b></span>
                        </th>
                        <th style={{ textAlign: "", width: "20%"}}>
                            <span>Weight(Kg)</span>
                        </th>
                        <th style={{ textAlign: "", width: "20%"}}>
                            <span><b>Total Amount(Rs)</b></span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ textAlign: "left", width: "60%"}}>
                            <span>1200X2400=24  800X2400=47  1200X1800=6 Box (Big Size)</span>
                        </td>
                        <td style={{ textAlign: "", width: "20%"}}>
                            <span>6200 Kg</span>
                        </td>
                        <td style={{ textAlign: "", width: "20%"}}>
                            <span>As Per Invoice</span>
                        </td>
                    </tr>
                </tbody>
            </Table>
            <br />
            <Table responsive="sm">
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", width: "40%", fontSize:"xx-small", lineHeight: "10px", verticalAlign: "top"}}>
                            <span><b>Terms & Conditions:</b></span><br />
                            <span>1. The Weight and size are subject to actual material received at the pickup city godown.</span><br />
                            <span>2. The weight and boxes will be updating as per the material received in the company invoice.</span><br />
                            <span>3. All the other terms and conditions are as mentioned behind the pages.</span><br />
                            <span>4. This LR is auto generated and shall be subjected to correction as signed by the warehouse supervisor.</span><br />
                        </th>
                        <th style={{ textAlign: "", width: "30%", verticalAlign: "top"}}>
                            <span>Material Receiver</span><br />
                            <span>I have received full material as per the LR</span><br />
                            <span>Sign</span><br /><br />
                        </th>
                        <th style={{ textAlign: "", width: "30%", verticalAlign: "top"}}>
                            <span><b>For, Raftaar Pvt Ltd</b></span><br />
                            <span><b>Authorized Signatory</b></span>
                        </th>
                    </tr>
                </thead>
            </Table>
        </div>
    );
};

export default TableInvoice;
