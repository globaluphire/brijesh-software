// eslint-disable-next-line
import { Table } from "react-bootstrap";

const ViewLR = ({ fetchedLRdata }) => {
    return (
        <>
            <div class="grid">
                <div class="item">
                    <img src="../../images/logo-1.svg" alt="logo1" class="logo1" width={70} />
                </div>
                <div class="company_name item">
                    <span><b>Comapny Name: RAFTAAR LOGISTICS </b></span><br />
                    <span><b>Head Office: </b>CC-101 Saivandan Madan, Opp Azad Madan, Raopura, Vadodara, Gujarat 390001</span> <br />
                    <span><b>Mobile No: </b>7227002803</span>
                    <span>
                    <t></t> | <t></t><b>Email: </b>raftaarlogistic@gmail.com
                    </span>
                    {/* <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span>  */}
                    <br />
                    <span><b>PAN No: </b>CUBPP3442C</span>
                    <span>
                    <t></t> | <t></t><b>GST No: </b>24CUBPP3442C1Z2
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
                    <span><b>LR Date:</b> {fetchedLRdata.lr_created_date}</span>
                </div>
                {fetchedLRdata.status === "Final" ?
                    <span class="fina_lr item" style={{ color: "green" }}> {fetchedLRdata.status} LR</span>
                    : <span class="fina_lr item" style={{ color: "darkorange" }}> {fetchedLRdata.status} LR</span>
                }
                <span class="lr_number item"><b>LR Number:</b> {fetchedLRdata.lr_number}</span>
                <span class="last_modified_date item"><b>Last Modified Date: </b> {fetchedLRdata.lr_last_modified_date ? fetchedLRdata.lr_last_modified_date : fetchedLRdata.lr_created_date}</span>
                <div class="pickup_address item">
                    <span><b>Pickup Address: {fetchedLRdata.consignor_name}</b></span><br />
                    <span>
                        {fetchedLRdata.pickup_point_address1 ? <span>{fetchedLRdata.pickup_point_address1}, </span> : "" }
                        {fetchedLRdata.pickup_point_address2 ? <span>{fetchedLRdata.pickup_point_address2}, </span> : "" }
                        {fetchedLRdata.pickup_point_area ? <span>{fetchedLRdata.pickup_point_area}, </span> : "" }
                        {fetchedLRdata.pickup_point_city ? <span>{fetchedLRdata.pickup_point_city}, </span> : "" }
                        {fetchedLRdata.pickup_point_state ? <span>{fetchedLRdata.pickup_point_state}, </span> : "" }
                        {fetchedLRdata.pickup_point_pin ? <span>{fetchedLRdata.pickup_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="from_to item">
                    <span><b>From: </b>{fetchedLRdata.pickup_point_location_city}</span><br />
                    <span><b>To: </b>{fetchedLRdata.drop_point_location_city}</span>
                </div>
                <div class="delivery_address item">
                    <span><b>Delivery Address: {fetchedLRdata.consignee_name}</b></span><br />
                    <span>
                        {fetchedLRdata.drop_point_address1 ? <span>{fetchedLRdata.drop_point_address1}, </span> : "" }
                        {fetchedLRdata.drop_point_address2 ? <span>{fetchedLRdata.drop_point_address2}, </span> : "" }
                        {fetchedLRdata.drop_point_area ? <span>{fetchedLRdata.drop_point_area}, </span> : "" }
                        {fetchedLRdata.drop_point_city ? <span>{fetchedLRdata.drop_point_city}, </span> : "" }
                        {fetchedLRdata.drop_point_state ? <span>{fetchedLRdata.drop_point_state}, </span> : "" }
                        {fetchedLRdata.drop_point_pin ? <span>{fetchedLRdata.drop_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="consignor item">
                    <span><b>Consignor: {fetchedLRdata.consignor_name}</b></span><br />
                    <span>
                        {fetchedLRdata.pickup_point_address1 ? <span>{fetchedLRdata.pickup_point_address1}, </span> : "" }
                        {fetchedLRdata.pickup_point_address2 ? <span>{fetchedLRdata.pickup_point_address2}, </span> : "" }
                        {fetchedLRdata.pickup_point_area ? <span>{fetchedLRdata.pickup_point_area}, </span> : "" }
                        {fetchedLRdata.pickup_point_city ? <span>{fetchedLRdata.pickup_point_city}, </span> : "" }
                        {fetchedLRdata.pickup_point_state ? <span>{fetchedLRdata.pickup_point_state}, </span> : "" }
                        {fetchedLRdata.pickup_point_pin ? <span>{fetchedLRdata.pickup_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="vehicle item">
                    <span><b>Vehical No: </b>{fetchedLRdata.vehical_number}</span><br />
                    <span><b>Driver: </b>{fetchedLRdata.truck_details}</span><br /> {/* ask what to show here */}
                </div>
                <div class="consignee item">
                    <span><b>Consignee: {fetchedLRdata.consignee_name}</b></span><br />
                    <span>
                        {fetchedLRdata.drop_point_address1 ? <span>{fetchedLRdata.drop_point_address1}, </span> : "" }
                        {fetchedLRdata.drop_point_address2 ? <span>{fetchedLRdata.drop_point_address2}, </span> : "" }
                        {fetchedLRdata.drop_point_area ? <span>{fetchedLRdata.drop_point_area}, </span> : "" }
                        {fetchedLRdata.drop_point_city ? <span>{fetchedLRdata.drop_point_city}, </span> : "" }
                        {fetchedLRdata.drop_point_state ? <span>{fetchedLRdata.drop_point_state}, </span> : "" }
                        {fetchedLRdata.drop_point_pin ? <span>{fetchedLRdata.drop_point_pin}, </span> : "" }
                    </span> <br />
                    <span><b>GST No: </b>{fetchedLRdata.consignee_gst}</span>
                    <span><b> | Ph No: </b>{fetchedLRdata.consignee_phone}</span>
                </div>
                <div class="material_detail item">
                    <span><b>Material Details</b></span><br />
                    <span>{fetchedLRdata.quantity}</span>
                </div>
                <div class="weight item">
                    <span><b>Weight(Kg)</b></span><br />
                    <span>{fetchedLRdata.weight}</span>
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
                    <span><b>For, Raftaar Logistics</b></span><br />
                    <span><b>Authorized Signatory</b></span>
                </div>
            </div>

            <div class="grid">
                <div class="item">
                    <img src="../../images/logo-1.svg" alt="logo1" class="logo1" width={70} />
                </div>
                <div class="company_name item">
                    <span><b>Comapny Name: RAFTAAR LOGISTICS </b></span><br />
                    <span><b>Head Office: </b>CC-101 Saivandan Madan, Opp Azad Madan, Raopura, Vadodara, Gujarat 390001</span> <br />
                    <span><b>Mobile No: </b>7227002803</span>
                    <span>
                    <t></t> | <t></t><b>Email: </b>raftaarlogistic@gmail.com
                    </span>
                    {/* <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span>  */}
                    <br />
                    <span><b>PAN No: </b>CUBPP3442C</span>
                    <span>
                    <t></t> | <t></t><b>GST No: </b>24CUBPP3442C1Z2
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
                    <span><b>LR Date:</b> {fetchedLRdata.lr_created_date}</span>
                </div>
                {fetchedLRdata.status === "Final" ?
                    <span class="fina_lr item" style={{ color: "green" }}> {fetchedLRdata.status} LR</span>
                    : <span class="fina_lr item" style={{ color: "darkorange" }}> {fetchedLRdata.status} LR</span>
                }
                <span class="lr_number item"><b>LR Number:</b> {fetchedLRdata.lr_number}</span>
                <span class="last_modified_date item"><b>Last Modified Date: </b> {fetchedLRdata.lr_last_modified_date ? fetchedLRdata.lr_last_modified_date : fetchedLRdata.lr_created_date}</span>
                <div class="pickup_address item">
                    <span><b>Pickup Address: {fetchedLRdata.consignor_name}</b></span><br />
                    <span>
                        {fetchedLRdata.pickup_point_address1 ? <span>{fetchedLRdata.pickup_point_address1}, </span> : "" }
                        {fetchedLRdata.pickup_point_address2 ? <span>{fetchedLRdata.pickup_point_address2}, </span> : "" }
                        {fetchedLRdata.pickup_point_area ? <span>{fetchedLRdata.pickup_point_area}, </span> : "" }
                        {fetchedLRdata.pickup_point_city ? <span>{fetchedLRdata.pickup_point_city}, </span> : "" }
                        {fetchedLRdata.pickup_point_state ? <span>{fetchedLRdata.pickup_point_state}, </span> : "" }
                        {fetchedLRdata.pickup_point_pin ? <span>{fetchedLRdata.pickup_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="from_to item">
                    <span><b>From: </b>{fetchedLRdata.pickup_point_location_city}</span><br />
                    <span><b>To: </b>{fetchedLRdata.drop_point_location_city}</span>
                </div>
                <div class="delivery_address item">
                    <span><b>Delivery Address: {fetchedLRdata.consignee_name}</b></span><br />
                    <span>
                        {fetchedLRdata.drop_point_address1 ? <span>{fetchedLRdata.drop_point_address1}, </span> : "" }
                        {fetchedLRdata.drop_point_address2 ? <span>{fetchedLRdata.drop_point_address2}, </span> : "" }
                        {fetchedLRdata.drop_point_area ? <span>{fetchedLRdata.drop_point_area}, </span> : "" }
                        {fetchedLRdata.drop_point_city ? <span>{fetchedLRdata.drop_point_city}, </span> : "" }
                        {fetchedLRdata.drop_point_state ? <span>{fetchedLRdata.drop_point_state}, </span> : "" }
                        {fetchedLRdata.drop_point_pin ? <span>{fetchedLRdata.drop_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="consignor item">
                    <span><b>Consignor: {fetchedLRdata.consignor_name}</b></span><br />
                    <span>
                        {fetchedLRdata.pickup_point_address1 ? <span>{fetchedLRdata.pickup_point_address1}, </span> : "" }
                        {fetchedLRdata.pickup_point_address2 ? <span>{fetchedLRdata.pickup_point_address2}, </span> : "" }
                        {fetchedLRdata.pickup_point_area ? <span>{fetchedLRdata.pickup_point_area}, </span> : "" }
                        {fetchedLRdata.pickup_point_city ? <span>{fetchedLRdata.pickup_point_city}, </span> : "" }
                        {fetchedLRdata.pickup_point_state ? <span>{fetchedLRdata.pickup_point_state}, </span> : "" }
                        {fetchedLRdata.pickup_point_pin ? <span>{fetchedLRdata.pickup_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="vehicle item">
                    <span><b>Vehical No: </b>{fetchedLRdata.vehical_number}</span><br />
                    <span><b>Driver: </b>{fetchedLRdata.truck_details}</span><br /> {/* ask what to show here */}
                </div>
                <div class="consignee item">
                    <span><b>Consignee: {fetchedLRdata.consignee_name}</b></span><br />
                    <span>
                        {fetchedLRdata.drop_point_address1 ? <span>{fetchedLRdata.drop_point_address1}, </span> : "" }
                        {fetchedLRdata.drop_point_address2 ? <span>{fetchedLRdata.drop_point_address2}, </span> : "" }
                        {fetchedLRdata.drop_point_area ? <span>{fetchedLRdata.drop_point_area}, </span> : "" }
                        {fetchedLRdata.drop_point_city ? <span>{fetchedLRdata.drop_point_city}, </span> : "" }
                        {fetchedLRdata.drop_point_state ? <span>{fetchedLRdata.drop_point_state}, </span> : "" }
                        {fetchedLRdata.drop_point_pin ? <span>{fetchedLRdata.drop_point_pin}, </span> : "" }
                    </span> <br />
                    <span><b>GST No: </b>{fetchedLRdata.consignee_gst}</span>
                    <span><b> | Ph No: </b>{fetchedLRdata.consignee_phone}</span>
                </div>
                <div class="material_detail item">
                    <span><b>Material Details</b></span><br />
                    <span>{fetchedLRdata.quantity}</span>
                </div>
                <div class="weight item">
                    <span><b>Weight(Kg)</b></span><br />
                    <span>{fetchedLRdata.weight}</span>
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
                    <span><b>For, Raftaar Logistics</b></span><br />
                    <span><b>Authorized Signatory</b></span>
                </div>
            </div>

            <div class="grid">
                <div class="item">
                    <img src="../../images/logo-1.svg" alt="logo1" class="logo1" width={70} />
                </div>
                <div class="company_name item">
                    <span><b>Comapny Name: RAFTAAR LOGISTICS </b></span><br />
                    <span><b>Head Office: </b>CC-101 Saivandan Madan, Opp Azad Madan, Raopura, Vadodara, Gujarat 390001</span> <br />
                    <span><b>Mobile No: </b>7227002803</span>
                    <span>
                    <t></t> | <t></t><b>Email: </b>raftaarlogistic@gmail.com
                    </span>
                    {/* <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span>  */}
                    <br />
                    <span><b>PAN No: </b>CUBPP3442C</span>
                    <span>
                    <t></t> | <t></t><b>GST No: </b>24CUBPP3442C1Z2
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
                    <span><b>LR Date:</b> {fetchedLRdata.lr_created_date}</span>
                </div>
                {fetchedLRdata.status === "Final" ?
                    <span class="fina_lr item" style={{ color: "green" }}> {fetchedLRdata.status} LR</span>
                    : <span class="fina_lr item" style={{ color: "darkorange" }}> {fetchedLRdata.status} LR</span>
                }
                <span class="lr_number item"><b>LR Number:</b> {fetchedLRdata.lr_number}</span>
                <span class="last_modified_date item"><b>Last Modified Date: </b> {fetchedLRdata.lr_last_modified_date ? fetchedLRdata.lr_last_modified_date : fetchedLRdata.lr_created_date}</span>
                <div class="pickup_address item">
                    <span><b>Pickup Address: {fetchedLRdata.consignor_name}</b></span><br />
                    <span>
                        {fetchedLRdata.pickup_point_address1 ? <span>{fetchedLRdata.pickup_point_address1}, </span> : "" }
                        {fetchedLRdata.pickup_point_address2 ? <span>{fetchedLRdata.pickup_point_address2}, </span> : "" }
                        {fetchedLRdata.pickup_point_area ? <span>{fetchedLRdata.pickup_point_area}, </span> : "" }
                        {fetchedLRdata.pickup_point_city ? <span>{fetchedLRdata.pickup_point_city}, </span> : "" }
                        {fetchedLRdata.pickup_point_state ? <span>{fetchedLRdata.pickup_point_state}, </span> : "" }
                        {fetchedLRdata.pickup_point_pin ? <span>{fetchedLRdata.pickup_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="from_to item">
                    <span><b>From: </b>{fetchedLRdata.pickup_point_location_city}</span><br />
                    <span><b>To: </b>{fetchedLRdata.drop_point_location_city}</span>
                </div>
                <div class="delivery_address item">
                    <span><b>Delivery Address: {fetchedLRdata.consignee_name}</b></span><br />
                    <span>
                        {fetchedLRdata.drop_point_address1 ? <span>{fetchedLRdata.drop_point_address1}, </span> : "" }
                        {fetchedLRdata.drop_point_address2 ? <span>{fetchedLRdata.drop_point_address2}, </span> : "" }
                        {fetchedLRdata.drop_point_area ? <span>{fetchedLRdata.drop_point_area}, </span> : "" }
                        {fetchedLRdata.drop_point_city ? <span>{fetchedLRdata.drop_point_city}, </span> : "" }
                        {fetchedLRdata.drop_point_state ? <span>{fetchedLRdata.drop_point_state}, </span> : "" }
                        {fetchedLRdata.drop_point_pin ? <span>{fetchedLRdata.drop_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="consignor item">
                    <span><b>Consignor: {fetchedLRdata.consignor_name}</b></span><br />
                    <span>
                        {fetchedLRdata.pickup_point_address1 ? <span>{fetchedLRdata.pickup_point_address1}, </span> : "" }
                        {fetchedLRdata.pickup_point_address2 ? <span>{fetchedLRdata.pickup_point_address2}, </span> : "" }
                        {fetchedLRdata.pickup_point_area ? <span>{fetchedLRdata.pickup_point_area}, </span> : "" }
                        {fetchedLRdata.pickup_point_city ? <span>{fetchedLRdata.pickup_point_city}, </span> : "" }
                        {fetchedLRdata.pickup_point_state ? <span>{fetchedLRdata.pickup_point_state}, </span> : "" }
                        {fetchedLRdata.pickup_point_pin ? <span>{fetchedLRdata.pickup_point_pin}, </span> : "" }
                    </span>
                </div>
                <div class="vehicle item">
                    <span><b>Vehical No: </b>{fetchedLRdata.vehical_number}</span><br />
                    <span><b>Driver: </b>{fetchedLRdata.truck_details}</span><br /> {/* ask what to show here */}
                </div>
                <div class="consignee item">
                    <span><b>Consignee: {fetchedLRdata.consignee_name}</b></span><br />
                    <span>
                        {fetchedLRdata.drop_point_address1 ? <span>{fetchedLRdata.drop_point_address1}, </span> : "" }
                        {fetchedLRdata.drop_point_address2 ? <span>{fetchedLRdata.drop_point_address2}, </span> : "" }
                        {fetchedLRdata.drop_point_area ? <span>{fetchedLRdata.drop_point_area}, </span> : "" }
                        {fetchedLRdata.drop_point_city ? <span>{fetchedLRdata.drop_point_city}, </span> : "" }
                        {fetchedLRdata.drop_point_state ? <span>{fetchedLRdata.drop_point_state}, </span> : "" }
                        {fetchedLRdata.drop_point_pin ? <span>{fetchedLRdata.drop_point_pin}, </span> : "" }
                    </span> <br />
                    <span><b>GST No: </b>{fetchedLRdata.consignee_gst}</span>
                    <span><b> | Ph No: </b>{fetchedLRdata.consignee_phone}</span>
                </div>
                <div class="material_detail item">
                    <span><b>Material Details</b></span><br />
                    <span>{fetchedLRdata.quantity}</span>
                </div>
                <div class="weight item">
                    <span><b>Weight(Kg)</b></span><br />
                    <span>{fetchedLRdata.weight}</span>
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
                    <span><b>For, Raftaar Logistics</b></span><br />
                    <span><b>Authorized Signatory</b></span>
                </div>
            </div>
        </>
    );
};

export default ViewLR;
