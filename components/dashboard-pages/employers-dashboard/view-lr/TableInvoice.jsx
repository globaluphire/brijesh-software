// eslint-disable-next-line
import { Table } from "react-bootstrap";

const TableInvoice = () => {
    return (
        // <div>
        //     <Table bordered responsive="sm" style={{ fontSize: "8px", lineHeight: "normal", margin: 0 }}>
        //         <thead>
        //             <tr>
        //                 <th style={{ textAlign: "left", width: "20%", padding: 0 }}>
        //                     <div className="logo1-box">
        //                         <div className="logo1" style={{ margin: 0 }}>
        //                             <img src="../../images/logo.svg" alt="logo1" width="150"/>
        //                         </div>
        //                     </div>
        //                 </th>
        //                 <th style={{ textAlign: "center", width: "50%", padding: "5px" }}>
        //                     <span>Comapny Name: <b>Raftaar Pvt Ltd </b></span> <br />
        //                     <span>Head Office: Baroda, Gujarat, India</span> <br />
        //                     <span>Mobile No: 98765 43210</span> <br />
        //                     <span>PAN No: AA12345633</span>
        //                     <span><t></t> | <t></t>GST No: 23ASDCDE3345S324</span>
        //                 </th>
        //                 <th style={{  gap: "15px", width: "30%", padding: "5px" }}>
        //                     <div>
        //                         <input type="checkbox"/>
        //                         <label> Consignor Copy</label>
        //                         <input type="checkbox"/>
        //                         <label> Consignee Copy</label>
        //                     </div>
        //                     <div>
        //                         <input type="checkbox"/> 
        //                         <span> Office Copy</span>
        //                         <input type="checkbox"/> 
        //                         <span> Driver Copy</span>
        //                     </div>
        //                 </th>
        //             </tr>
        //         </thead>
        //     </Table>
        //     <Table bordered responsive="sm" style={{ fontSize: "8px", lineHeight: "normal", margin: 0 }}>
        //         <thead>
        //             <tr>
        //                 <th style={{ textAlign: "left", width: "33.33%" }}>
        //                     <span>LR Date: 15 MAR 2024</span>
        //                 </th>
        //                 <th style={{ textAlign: "center", fontSize: "Medium", color: "green", textDecoration: "underline", width: "33.33%" }}>
        //                     <span>FINAL LR</span>
        //                 </th>
        //                 <th style={{ textAlign: "right", width: "33.33%" }}>
        //                     <span>Last Modified Date: 15 MAR 2024</span>
        //                 </th>
        //             </tr>
        //         </thead>
        //     </Table>
        //     <Table bordered responsive="sm" style={{ fontSize: "8px", lineHeight: "normal", margin: 0 }}>
        //         <tbody>
        //             <tr>
        //                 <td style={{ textAlign: "left", width: "33.33%" }}>
        //                     <span><b>Pickup Address: RAK Ceramic India Pvt Ltd</b></span><br />
        //                     <span>Lalpur, Morbi, Gujarat</span>
        //                 </td>
        //                 <td style={{ textAlign: "center", width: "33.33%" }}>
        //                     <span><b>From: Morbi</b></span><br />
        //                     <span><b>To: Mumbai</b></span>
        //                 </td>
        //                 <td style={{ textAlign: "right", width: "33.33%" }}>
        //                     <span><b>Delivery Address: R K Ceramics</b></span><br />
        //                     <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span>
        //                 </td>
        //             </tr>
        //         </tbody>
        //     </Table>
        //     <Table bordered responsive="sm" style={{ fontSize: "8px", lineHeight: "normal", margin: 0 }}>
        //         <tbody>
        //             <tr>
        //                 <td style={{ textAlign: "left", width: "33.33%" }}>
        //                     <span><b>Consignor: RAK Ceramic India Pvt Ltd </b></span><br />
        //                     <span>Lalpur, Morbi, Gujarat</span><br />
        //                     <span>GST No: 24AADFHEY7649JK</span>
        //                 </td>
        //                 <td style={{ textAlign: "center", width: "33.33%" }}>
        //                     <span>Vehical No: GJ017557</span><br />
        //                     <span>Driver: Rajdeep Bhai</span><br />
        //                     <span>98765 43210</span>
        //                 </td>
        //                 <td style={{ textAlign: "right", width: "33.33%" }}>
        //                     <span><b>Consignee: R K Ceramics</b></span><br />
        //                     <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span><br />
        //                     <span>GST No: 24BBDFHEY7649JK</span>
        //                 </td>
        //             </tr>
        //         </tbody>
        //     </Table>
        //     <Table bordered responsive="sm" style={{ fontSize: "8px", lineHeight: "normal", margin: 0 }}>
        //         <thead>
        //             <tr>
        //                 <th style={{ textAlign: "left", width: "60%" }}>
        //                     <span><b>Material Details</b></span>
        //                 </th>
        //                 <th style={{ textAlign: "", width: "20%" }}>
        //                     <span>Weight(Kg)</span>
        //                 </th>
        //                 <th style={{ textAlign: "", width: "20%" }}>
        //                     <span><b>Total Amount(Rs)</b></span>
        //                 </th>
        //             </tr>
        //         </thead>
        //         <tbody>
        //             <tr>
        //                 <td style={{ textAlign: "left", width: "60%" }}>
        //                     <span>1200X2400=24  800X2400=47  1200X1800=6 Box (Big Size)</span>
        //                 </td>
        //                 <td style={{ textAlign: "", width: "20%" }}>
        //                     <span>6200 Kg</span>
        //                 </td>
        //                 <td style={{ textAlign: "", width: "20%" }}>
        //                     <span>As Per Invoice</span>
        //                 </td>
        //             </tr>
        //         </tbody>
        //     </Table>
        //     <Table bordered responsive="sm" style={{ fontSize: "8px", lineHeight: "normal", margin: 0 }}>
        //         <thead>
        //             <tr>
        //                 <th style={{ textAlign: "left", width: "40%", lineHeight: "10px", verticalAlign: "top" }}>
        //                     <span><b>Terms & Conditions:</b></span><br />
        //                     <span>1. The Weight and size are subject to actual material received at the pickup city godown.</span><br />
        //                     <span>2. The weight and boxes will be updating as per the material received in the company invoice.</span><br />
        //                     <span>3. All the other terms and conditions are as mentioned behind the pages.</span><br />
        //                     <span>4. This LR is auto generated and shall be subjected to correction as signed by the warehouse supervisor.</span><br />
        //                 </th>
        //                 <th style={{ textAlign: "", width: "30%", verticalAlign: "top" }}>
        //                     <span>Material Receiver</span><br />
        //                     <span>I have received full material as per the LR</span><br />
        //                     <span>Sign</span><br /><br />
        //                 </th>
        //                 <th style={{ textAlign: "", width: "30%", verticalAlign: "top" }}>
        //                     <span><b>For, Raftaar Pvt Ltd</b></span><br />
        //                     <span><b>Authorized Signatory</b></span>
        //                 </th>
        //             </tr>
        //         </thead>
        //     </Table>
        // </div>
        <>
            <div class="grid">
                <img src="../../images/logo.svg" alt="logo1" class="logo1 item" />
                <div class="company_name item">
                    <span><b>Comapny Name: Raftaar Pvt Ltd </b></span><br />
                    <span><b>Head Office: </b>Baroda, Gujarat, India</span> <br />
                    <span><b>Mobile No: </b>9876543210</span>
                    <span>
                    <t></t> | <t></t><b>Email: </b>info@raftaarlogistics.com
                    </span>
                    <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span> <br />
                    <span><b>PAN No: </b>AA12345633</span>
                    <span>
                    <t></t> | <t></t><b>GST No: </b>23ASDCDE3345S324
                    </span>
                </div>
                <div class="copy item">
                    <input type="checkbox" />
                    <span> Consignor Copy</span><br />
                    <input type="checkbox" />
                    <span> Consignee Copy</span><br />
                    <input type="checkbox" />
                    <span> Office Copy</span><br />
                    <input type="checkbox" />
                    <span> Driver Copy</span><br />
                </div>
                <div class="lr_date item">
                    <span><b>LR Date:</b> 15 MAR 2024 </span>
                </div>
                <span class="fina_lr item">FINAL LR</span>
                <span class="lr_number item"><b>LR Number:</b> RLR240302100</span>
                <span class="last_modified_date item"><b>Last Modified Date: </b>15 MAR 2024</span>
                <div class="pickup_address item">
                    <span><b>Pickup Address: RAK Ceramic India Pvt Ltd</b></span><br />
                    <span>Lalpur, Morbi, Gujarat</span>
                </div>
                <div class="from_to item">
                    <span><b>From: </b>Morbi</span><br />
                    <span><b>To: </b>Mumbai</span>
                </div>
                <div class="delivery_address item">
                    <span><b>Delivery Address: R K Ceramics</b></span><br />
                    <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span>
                </div>
                <div class="consignor item">
                    <span><b>Consignor: RAK Ceramic India Pvt Ltd </b></span><br />
                    <span>Lalpur, Morbi, Gujarat</span><br />
                    <span><b>GST No: </b>24AADFHEY7649JK</span>
                </div>
                <div class="vehicle item">
                    <span><b>Vehical No: </b>GJ017557</span><br />
                    <span><b>Driver: </b>Rajdeep Bhai</span><br />
                    <span><b>Driver Phone: </b>9876543210</span>
                </div>
                <div class="consignee item">
                    <span><b>Consignee: R K Ceramics</b></span><br />
                    <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span><br />
                    <span><b>GST No: </b>24BBDFHEY7649JK</span>
                </div>
                <div class="material_detail item">
                    <span><b>Material Details</b></span><br />
                    <span>1200X2400=24 800X2400=47 1200X1800=6 Box (Big Size)</span>
                </div>
                <div class="weight item">
                    <span><b>Weight(Kg)</b></span><br />
                    <span>6200 Kg</span>
                </div>
                <div class="total_amount item">
                    <span><b>Total Amount(Rs)</b></span><br />
                    <span>As Per Invoice</span>
                </div>
                <div class="terms_condition item">
                    <span><b>Terms & Conditions:</b></span><br />
                    <span>1. The Weight and size are subject to actual material received at the pickup city godown.</span><br />
                    <span>2. The weight and boxes will be updating as per the material received in the company invoice.</span><br />
                    <span>3. All the other terms and conditions are as mentioned behind the pages.</span><br />
                    <span>4. This LR is auto generated and shall be subjected to correction as signed by the warehouse supervisor.</span><br />
                </div>
                <div class="material_receiver_sign item">
                    <span><b>Material Receiver</b></span><br />
                    <span><b>I have received full material as per the LR</b></span><br />
                    <span><b>Signature</b></span><br /><br />
                </div>
                <div class="authorized_sign item">
                    <span><b>For, Raftaar Pvt Ltd</b></span><br />
                    <span><b>Authorized Signatory</b></span>
                </div>
            </div>

            <div class="grid">
                <img src="../../images/logo.svg" alt="logo1" class="logo1 item" />
                <div class="company_name item">
                    <span><b>Comapny Name: Raftaar Pvt Ltd </b></span><br />
                    <span><b>Head Office: </b>Baroda, Gujarat, India</span> <br />
                    <span><b>Mobile No: </b>9876543210</span>
                    <span>
                    <t></t> | <t></t><b>Email: </b>info@raftaarlogistics.com
                    </span>
                    <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span> <br />
                    <span><b>PAN No: </b>AA12345633</span>
                    <span>
                    <t></t> | <t></t><b>GST No: </b>23ASDCDE3345S324
                    </span>
                </div>
                <div class="copy item">
                    <input type="checkbox" />
                    <span> Consignor Copy</span><br />
                    <input type="checkbox" />
                    <span> Consignee Copy</span><br />
                    <input type="checkbox" />
                    <span> Office Copy</span><br />
                    <input type="checkbox" />
                    <span> Driver Copy</span><br />
                </div>
                <div class="lr_date item">
                    <span><b>LR Date:</b> 15 MAR 2024 </span>
                </div>
                <span class="fina_lr item">FINAL LR</span>
                <span class="lr_number item"><b>LR Number:</b> RLR240302100</span>
                <span class="last_modified_date item"><b>Last Modified Date: </b>15 MAR 2024</span>
                <div class="pickup_address item">
                    <span><b>Pickup Address: RAK Ceramic India Pvt Ltd</b></span><br />
                    <span>Lalpur, Morbi, Gujarat</span>
                </div>
                <div class="from_to item">
                    <span><b>From: </b>Morbi</span><br />
                    <span><b>To: </b>Mumbai</span>
                </div>
                <div class="delivery_address item">
                    <span><b>Delivery Address: R K Ceramics</b></span><br />
                    <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span>
                </div>
                <div class="consignor item">
                    <span><b>Consignor: RAK Ceramic India Pvt Ltd </b></span><br />
                    <span>Lalpur, Morbi, Gujarat</span><br />
                    <span><b>GST No: </b>24AADFHEY7649JK</span>
                </div>
                <div class="vehicle item">
                    <span><b>Vehical No: </b>GJ017557</span><br />
                    <span><b>Driver: </b>Rajdeep Bhai</span><br />
                    <span><b>Driver Phone: </b>9876543210</span>
                </div>
                <div class="consignee item">
                    <span><b>Consignee: R K Ceramics</b></span><br />
                    <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span><br />
                    <span><b>GST No: </b>24BBDFHEY7649JK</span>
                </div>
                <div class="material_detail item">
                    <span><b>Material Details</b></span><br />
                    <span>1200X2400=24 800X2400=47 1200X1800=6 Box (Big Size)</span>
                </div>
                <div class="weight item">
                    <span><b>Weight(Kg)</b></span><br />
                    <span>6200 Kg</span>
                </div>
                <div class="total_amount item">
                    <span><b>Total Amount(Rs)</b></span><br />
                    <span>As Per Invoice</span>
                </div>
                <div class="terms_condition item">
                    <span><b>Terms & Conditions:</b></span><br />
                    <span>1. The Weight and size are subject to actual material received at the pickup city godown.</span><br />
                    <span>2. The weight and boxes will be updating as per the material received in the company invoice.</span><br />
                    <span>3. All the other terms and conditions are as mentioned behind the pages.</span><br />
                    <span>4. This LR is auto generated and shall be subjected to correction as signed by the warehouse supervisor.</span><br />
                </div>
                <div class="material_receiver_sign item">
                    <span><b>Material Receiver</b></span><br />
                    <span><b>I have received full material as per the LR</b></span><br />
                    <span><b>Signature</b></span><br /><br />
                </div>
                <div class="authorized_sign item">
                    <span><b>For, Raftaar Pvt Ltd</b></span><br />
                    <span><b>Authorized Signatory</b></span>
                </div>
            </div>

            <div class="grid">
                <img src="../../images/logo.svg" alt="logo1" class="logo1 item" />
                <div class="company_name item">
                    <span><b>Comapny Name: Raftaar Pvt Ltd </b></span><br />
                    <span><b>Head Office: </b>Baroda, Gujarat, India</span> <br />
                    <span><b>Mobile No: </b>9876543210</span>
                    <span>
                    <t></t> | <t></t><b>Email: </b>info@raftaarlogistics.com
                    </span>
                    <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span> <br />
                    <span><b>PAN No: </b>AA12345633</span>
                    <span>
                    <t></t> | <t></t><b>GST No: </b>23ASDCDE3345S324
                    </span>
                </div>
                <div class="copy item">
                    <input type="checkbox" />
                    <span> Consignor Copy</span><br />
                    <input type="checkbox" />
                    <span> Consignee Copy</span><br />
                    <input type="checkbox" />
                    <span> Office Copy</span><br />
                    <input type="checkbox" />
                    <span> Driver Copy</span><br />
                </div>
                <div class="lr_date item">
                    <span><b>LR Date:</b> 15 MAR 2024 </span>
                </div>
                <span class="fina_lr item">FINAL LR</span>
                <span class="lr_number item"><b>LR Number:</b> RLR240302100</span>
                <span class="last_modified_date item"><b>Last Modified Date: </b>15 MAR 2024</span>
                <div class="pickup_address item">
                    <span><b>Pickup Address: RAK Ceramic India Pvt Ltd</b></span><br />
                    <span>Lalpur, Morbi, Gujarat</span>
                </div>
                <div class="from_to item">
                    <span><b>From: </b>Morbi</span><br />
                    <span><b>To: </b>Mumbai</span>
                </div>
                <div class="delivery_address item">
                    <span><b>Delivery Address: R K Ceramics</b></span><br />
                    <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span>
                </div>
                <div class="consignor item">
                    <span><b>Consignor: RAK Ceramic India Pvt Ltd </b></span><br />
                    <span>Lalpur, Morbi, Gujarat</span><br />
                    <span><b>GST No: </b>24AADFHEY7649JK</span>
                </div>
                <div class="vehicle item">
                    <span><b>Vehical No: </b>GJ017557</span><br />
                    <span><b>Driver: </b>Rajdeep Bhai</span><br />
                    <span><b>Driver Phone: </b>9876543210</span>
                </div>
                <div class="consignee item">
                    <span><b>Consignee: R K Ceramics</b></span><br />
                    <span>318, Dheeraj Heritage, Junction of Mira Road Milan Subway, Santacruz(W), Mumbai, Maharashtra - 400054</span><br />
                    <span><b>GST No: </b>24BBDFHEY7649JK</span>
                </div>
                <div class="material_detail item">
                    <span><b>Material Details</b></span><br />
                    <span>1200X2400=24 800X2400=47 1200X1800=6 Box (Big Size)</span>
                </div>
                <div class="weight item">
                    <span><b>Weight(Kg)</b></span><br />
                    <span>6200 Kg</span>
                </div>
                <div class="total_amount item">
                    <span><b>Total Amount(Rs)</b></span><br />
                    <span>As Per Invoice</span>
                </div>
                <div class="terms_condition item">
                    <span><b>Terms & Conditions:</b></span><br />
                    <span>1. The Weight and size are subject to actual material received at the pickup city godown.</span><br />
                    <span>2. The weight and boxes will be updating as per the material received in the company invoice.</span><br />
                    <span>3. All the other terms and conditions are as mentioned behind the pages.</span><br />
                    <span>4. This LR is auto generated and shall be subjected to correction as signed by the warehouse supervisor.</span><br />
                </div>
                <div class="material_receiver_sign item">
                    <span><b>Material Receiver</b></span><br />
                    <span><b>I have received full material as per the LR</b></span><br />
                    <span><b>Signature</b></span><br /><br />
                </div>
                <div class="authorized_sign item">
                    <span><b>For, Raftaar Pvt Ltd</b></span><br />
                    <span><b>Authorized Signatory</b></span>
                </div>
            </div>
        </>
        
    );
};

export default TableInvoice;
