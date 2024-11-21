const ViewOldLR = ({ selectedLRData }) => {
    const dateFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                }) +
                ", " +
                date.getFullYear()
            );
        }
    };

    return (
        <>
            <div id="print-old-lr" className="hide-old-lr-block">
                <div class="lr-grid mx-1">
                    <div class="item">
                        <img
                            src="/logo.svg"
                            alt="logo1"
                            class="logo1"
                            width={70}
                        />
                    </div>
                    <div class="company_name item">
                        <span>
                            <b>Comapny Name: RAFTAAR LOGISTICS </b>
                        </span>
                        <br />
                        <span>
                            <b>Head Office: </b>51 and 52 Sinde Colony, S R P
                            Road, Navapura, Vadodara, Gujarat 390001
                        </span>{" "}
                        <br />
                        <span>
                            <b>Mobile No: </b>7227002803
                        </span>
                        <span>
                            <t></t> | <t></t>
                            <b>Email: </b>raftaarlogistic@gmail.com
                        </span>
                        {/* <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span>  */}
                        <br />
                        <span>
                            <b>PAN No: </b>GFSPS6256B
                        </span>
                        <span>
                            <t></t> | <t></t>
                            <b>GST No: </b>24GFSPS6256B1Z1
                        </span>
                    </div>
                    <div class="copy item">
                        <input type="checkbox" />
                        <span> Consignor Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Consignee Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Office Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Driver Copy</span>
                        <br />
                    </div>
                    <div class="lr_date item">
                        <span>
                            <b>LR Date:</b>{" "}
                            {selectedLRData.lr_created_date.toLocaleString(
                                "en-IN"
                            )}
                        </span>
                    </div>
                    {selectedLRData.status === "Final" ? (
                        <span class="fina_lr item" style={{ color: "green" }}>
                            {" "}
                            {selectedLRData.status} LR
                        </span>
                    ) : (
                        <span
                            class="fina_lr item"
                            style={{ color: "darkorange" }}
                        >
                            {" "}
                            {selectedLRData.status} LR
                        </span>
                    )}
                    <span class="lr_number item">
                        <b>LR Number:</b> {selectedLRData.lr_number}
                    </span>
                    <span class="last_modified_date item">
                        <b>Last Modified Date: </b>{" "}
                        {selectedLRData.lr_last_modified_date
                            ? selectedLRData.lr_last_modified_date.toLocaleString(
                                  "en-IN"
                              )
                            : selectedLRData.lr_created_date.toLocaleString(
                                  "en-IN"
                              )}
                    </span>
                    <div class="pickup_address item">
                        <span>
                            <b>Pickup Address: {selectedLRData.consignor}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.pickup_address}</span>
                    </div>
                    <div class="from_to item">
                        <span>
                            <b>From: </b>
                            {selectedLRData.from_city}
                        </span>
                        <br />
                        <span>
                            <b>To: </b>
                            {selectedLRData.to_city}
                        </span>
                    </div>
                    <div class="delivery_address item">
                        <span>
                            <b>Delivery Address: {selectedLRData.consignee}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.drop_address}</span>
                    </div>
                    <div class="consignor item">
                        <span>
                            <b>Consignor: {selectedLRData.consignor}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.pickup_address}</span>
                        <br />
                        <span>
                            <b>GST No: </b>
                            {selectedLRData.consignor_gst}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {selectedLRData.consignor_phone}
                        </span>
                    </div>
                    <div class="vehicle item">
                        <span>
                            <b>Vehical No: </b>
                            {selectedLRData.vehical_number}
                        </span>
                        <br />
                        <span>
                            <b>Driver: </b>
                            {selectedLRData.driver_name}
                        </span>
                        <br />
                    </div>
                    <div class="consignee item">
                        <span>
                            <b>Consignee: {selectedLRData.consignee}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.drop_address}</span>
                        <br />
                        <span>
                            <b>GST No: </b>
                            {selectedLRData.consignee_gst}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {selectedLRData.consignee_phone}
                        </span>
                    </div>
                    <div class="material_detail item">
                        <span>
                            <b>Material Details</b>
                        </span>
                        <br />
                        <span>{selectedLRData.material_details}</span>
                    </div>
                    <div class="weight item">
                        <span>
                            <b>Weight(Kg)</b>
                        </span>
                        <br />
                        <span>{selectedLRData.weight}</span>
                    </div>
                    <div class="total_amount item">
                        <span>
                            <b>Total Amount(Rs)</b>
                        </span>
                        <br />
                        <span>As Per Invoice</span>
                    </div>
                    <div class="terms_condition item">
                        <span>
                            <b>Terms & Conditions:</b>
                        </span>
                        <br />
                        <span>
                            1. The Weight and size are subject to actual
                            material received at the pickup city godown.
                        </span>
                        <br />
                        <span>
                            2. The weight and boxes will be updating as per the
                            material received in the company invoice.
                        </span>
                        <br />
                        <span>
                            3. All the other terms and conditions are as
                            mentioned behind the pages.
                        </span>
                        <br />
                        <span>
                            4. This LR is auto generated and shall be subjected
                            to correction as signed by the warehouse supervisor.
                        </span>
                        <br />
                    </div>
                    <div class="material_receiver_sign item">
                        <span>
                            <b>Material Receiver</b>
                        </span>
                        <br />
                        <span>
                            <b>I have received full material as per the LR</b>
                        </span>
                        <br />
                        <span>
                            <b>Signature</b>
                        </span>
                        <br />
                        <br />
                    </div>
                    <div class="authorized_sign item">
                        <span>
                            <b>For, Raftaar Logistics</b>
                        </span>
                        <br />
                        <span>
                            <b>Authorized Signatory</b>
                        </span>
                    </div>
                </div>

                <div class="lr-grid mx-1">
                    <div class="item">
                        <img
                            src="/logo.svg"
                            alt="logo1"
                            class="logo1"
                            width={70}
                        />
                    </div>
                    <div class="company_name item">
                        <span>
                            <b>Comapny Name: RAFTAAR LOGISTICS </b>
                        </span>
                        <br />
                        <span>
                            <b>Head Office: </b>51 and 52 Sinde Colony, S R P
                            Road, Navapura, Vadodara, Gujarat 390001
                        </span>{" "}
                        <br />
                        <span>
                            <b>Mobile No: </b>7227002803
                        </span>
                        <span>
                            <t></t> | <t></t>
                            <b>Email: </b>raftaarlogistic@gmail.com
                        </span>
                        {/* <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span>  */}
                        <br />
                        <span>
                            <b>PAN No: </b>GFSPS6256B
                        </span>
                        <span>
                            <t></t> | <t></t>
                            <b>GST No: </b>24GFSPS6256B1Z1
                        </span>
                    </div>
                    <div class="copy item">
                        <input type="checkbox" />
                        <span> Consignor Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Consignee Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Office Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Driver Copy</span>
                        <br />
                    </div>
                    <div class="lr_date item">
                        <span>
                            <b>LR Date:</b>{" "}
                            {selectedLRData.lr_created_date.toLocaleString(
                                "en-IN"
                            )}
                        </span>
                    </div>
                    {selectedLRData.status === "Final" ? (
                        <span class="fina_lr item" style={{ color: "green" }}>
                            {" "}
                            {selectedLRData.status} LR
                        </span>
                    ) : (
                        <span
                            class="fina_lr item"
                            style={{ color: "darkorange" }}
                        >
                            {" "}
                            {selectedLRData.status} LR
                        </span>
                    )}
                    <span class="lr_number item">
                        <b>LR Number:</b> {selectedLRData.lr_number}
                    </span>
                    <span class="last_modified_date item">
                        <b>Last Modified Date: </b>{" "}
                        {selectedLRData.lr_last_modified_date
                            ? selectedLRData.lr_last_modified_date.toLocaleString(
                                  "en-IN"
                              )
                            : selectedLRData.lr_created_date.toLocaleString(
                                  "en-IN"
                              )}
                    </span>
                    <div class="pickup_address item">
                        <span>
                            <b>Pickup Address: {selectedLRData.consignor}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.pickup_address}</span>
                    </div>
                    <div class="from_to item">
                        <span>
                            <b>From: </b>
                            {selectedLRData.from_city}
                        </span>
                        <br />
                        <span>
                            <b>To: </b>
                            {selectedLRData.to_city}
                        </span>
                    </div>
                    <div class="delivery_address item">
                        <span>
                            <b>Delivery Address: {selectedLRData.consignee}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.drop_address}</span>
                    </div>
                    <div class="consignor item">
                        <span>
                            <b>Consignor: {selectedLRData.consignor}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.pickup_address}</span>
                        <br />
                        <span>
                            <b>GST No: </b>
                            {selectedLRData.consignor_gst}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {selectedLRData.consignor_phone}
                        </span>
                    </div>
                    <div class="vehicle item">
                        <span>
                            <b>Vehical No: </b>
                            {selectedLRData.vehical_number}
                        </span>
                        <br />
                        <span>
                            <b>Driver: </b>
                            {selectedLRData.driver_name}
                        </span>
                        <br />
                    </div>
                    <div class="consignee item">
                        <span>
                            <b>Consignee: {selectedLRData.consignee}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.drop_address}</span>
                        <br />
                        <span>
                            <b>GST No: </b>
                            {selectedLRData.consignee_gst}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {selectedLRData.consignee_phone}
                        </span>
                    </div>
                    <div class="material_detail item">
                        <span>
                            <b>Material Details</b>
                        </span>
                        <br />
                        <span>{selectedLRData.material_details}</span>
                    </div>
                    <div class="weight item">
                        <span>
                            <b>Weight(Kg)</b>
                        </span>
                        <br />
                        <span>{selectedLRData.weight}</span>
                    </div>
                    <div class="total_amount item">
                        <span>
                            <b>Total Amount(Rs)</b>
                        </span>
                        <br />
                        <span>As Per Invoice</span>
                    </div>
                    <div class="terms_condition item">
                        <span>
                            <b>Terms & Conditions:</b>
                        </span>
                        <br />
                        <span>
                            1. The Weight and size are subject to actual
                            material received at the pickup city godown.
                        </span>
                        <br />
                        <span>
                            2. The weight and boxes will be updating as per the
                            material received in the company invoice.
                        </span>
                        <br />
                        <span>
                            3. All the other terms and conditions are as
                            mentioned behind the pages.
                        </span>
                        <br />
                        <span>
                            4. This LR is auto generated and shall be subjected
                            to correction as signed by the warehouse supervisor.
                        </span>
                        <br />
                    </div>
                    <div class="material_receiver_sign item">
                        <span>
                            <b>Material Receiver</b>
                        </span>
                        <br />
                        <span>
                            <b>I have received full material as per the LR</b>
                        </span>
                        <br />
                        <span>
                            <b>Signature</b>
                        </span>
                        <br />
                        <br />
                    </div>
                    <div class="authorized_sign item">
                        <span>
                            <b>For, Raftaar Logistics</b>
                        </span>
                        <br />
                        <span>
                            <b>Authorized Signatory</b>
                        </span>
                    </div>
                </div>

                <div class="lr-grid mx-1">
                    <div class="item">
                        <img
                            src="/logo.svg"
                            alt="logo1"
                            class="logo1"
                            width={70}
                        />
                    </div>
                    <div class="company_name item">
                        <span>
                            <b>Comapny Name: RAFTAAR LOGISTICS </b>
                        </span>
                        <br />
                        <span>
                            <b>Head Office: </b>51 and 52 Sinde Colony, S R P
                            Road, Navapura, Vadodara, Gujarat 390001
                        </span>{" "}
                        <br />
                        <span>
                            <b>Mobile No: </b>7227002803
                        </span>
                        <span>
                            <t></t> | <t></t>
                            <b>Email: </b>raftaarlogistic@gmail.com
                        </span>
                        {/* <span>
                    <t></t> | <t></t><b>Website: </b>raftaarlogistics.com
                    </span>  */}
                        <br />
                        <span>
                            <b>PAN No: </b>GFSPS6256B
                        </span>
                        <span>
                            <t></t> | <t></t>
                            <b>GST No: </b>24GFSPS6256B1Z1
                        </span>
                    </div>
                    <div class="copy item">
                        <input type="checkbox" />
                        <span> Consignor Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Consignee Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Office Copy</span>
                        <br />
                        <input type="checkbox" />
                        <span> Driver Copy</span>
                        <br />
                    </div>
                    <div class="lr_date item">
                        <span>
                            <b>LR Date:</b>{" "}
                            {selectedLRData.lr_created_date.toLocaleString(
                                "en-IN"
                            )}
                        </span>
                    </div>
                    {selectedLRData.status === "Final" ? (
                        <span class="fina_lr item" style={{ color: "green" }}>
                            {" "}
                            {selectedLRData.status} LR
                        </span>
                    ) : (
                        <span
                            class="fina_lr item"
                            style={{ color: "darkorange" }}
                        >
                            {" "}
                            {selectedLRData.status} LR
                        </span>
                    )}
                    <span class="lr_number item">
                        <b>LR Number:</b> {selectedLRData.lr_number}
                    </span>
                    <span class="last_modified_date item">
                        <b>Last Modified Date: </b>{" "}
                        {selectedLRData.lr_last_modified_date
                            ? selectedLRData.lr_last_modified_date.toLocaleString(
                                  "en-IN"
                              )
                            : selectedLRData.lr_created_date.toLocaleString(
                                  "en-IN"
                              )}
                    </span>
                    <div class="pickup_address item">
                        <span>
                            <b>Pickup Address: {selectedLRData.consignor}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.pickup_address}</span>
                    </div>
                    <div class="from_to item">
                        <span>
                            <b>From: </b>
                            {selectedLRData.from_city}
                        </span>
                        <br />
                        <span>
                            <b>To: </b>
                            {selectedLRData.to_city}
                        </span>
                    </div>
                    <div class="delivery_address item">
                        <span>
                            <b>Delivery Address: {selectedLRData.consignee}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.drop_address}</span>
                    </div>
                    <div class="consignor item">
                        <span>
                            <b>Consignor: {selectedLRData.consignor}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.pickup_address}</span>
                        <br />
                        <span>
                            <b>GST No: </b>
                            {selectedLRData.consignor_gst}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {selectedLRData.consignor_phone}
                        </span>
                    </div>
                    <div class="vehicle item">
                        <span>
                            <b>Vehical No: </b>
                            {selectedLRData.vehical_number}
                        </span>
                        <br />
                        <span>
                            <b>Driver: </b>
                            {selectedLRData.driver_name}
                        </span>
                        <br />
                    </div>
                    <div class="consignee item">
                        <span>
                            <b>Consignee: {selectedLRData.consignee}</b>
                        </span>
                        <br />
                        <span>{selectedLRData.drop_address}</span>
                        <br />
                        <span>
                            <b>GST No: </b>
                            {selectedLRData.consignee_gst}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {selectedLRData.consignee_phone}
                        </span>
                    </div>
                    <div class="material_detail item">
                        <span>
                            <b>Material Details</b>
                        </span>
                        <br />
                        <span>{selectedLRData.material_details}</span>
                    </div>
                    <div class="weight item">
                        <span>
                            <b>Weight(Kg)</b>
                        </span>
                        <br />
                        <span>{selectedLRData.weight}</span>
                    </div>
                    <div class="total_amount item">
                        <span>
                            <b>Total Amount(Rs)</b>
                        </span>
                        <br />
                        <span>As Per Invoice</span>
                    </div>
                    <div class="terms_condition item">
                        <span>
                            <b>Terms & Conditions:</b>
                        </span>
                        <br />
                        <span>
                            1. The Weight and size are subject to actual
                            material received at the pickup city godown.
                        </span>
                        <br />
                        <span>
                            2. The weight and boxes will be updating as per the
                            material received in the company invoice.
                        </span>
                        <br />
                        <span>
                            3. All the other terms and conditions are as
                            mentioned behind the pages.
                        </span>
                        <br />
                        <span>
                            4. This LR is auto generated and shall be subjected
                            to correction as signed by the warehouse supervisor.
                        </span>
                        <br />
                    </div>
                    <div class="material_receiver_sign item">
                        <span>
                            <b>Material Receiver</b>
                        </span>
                        <br />
                        <span>
                            <b>I have received full material as per the LR</b>
                        </span>
                        <br />
                        <span>
                            <b>Signature</b>
                        </span>
                        <br />
                        <br />
                    </div>
                    <div class="authorized_sign item">
                        <span>
                            <b>For, Raftaar Logistics</b>
                        </span>
                        <br />
                        <span>
                            <b>Authorized Signatory</b>
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewOldLR;
