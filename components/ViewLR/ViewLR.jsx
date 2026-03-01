const ViewLR = ({
    fetchedOrderData,
    fetchedLRData,
    fetchedClientData,
    fetchedPickupLocationData,
    fetchedPickupLocationMarketingData,
    fetchedpickupLocationDispatchData,
    fetchedDropLocationData,
    fetchedDropLocationMarketingData,
    fetchedDropLocationDispatchData,
    fetchedConsignorClientsData,
    fetchedConsigneeClientsData,
}) => {
    const dateFormat = (val) => {
        if (val) {
            return new Date(val).toLocaleString("en-IN");
        }
    };

    return (
        <>
            <div id="print-lr" className="hide-lr-block">
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
                            {dateFormat(fetchedLRData.lr_created_date)}
                        </span>
                    </div>
                    {fetchedLRData.status === "Final" ? (
                        <span class="fina_lr item" style={{ color: "green" }}>
                            {" "}
                            {fetchedLRData.status} LR
                        </span>
                    ) : (
                        <span
                            class="fina_lr item"
                            style={{ color: "darkorange" }}
                        >
                            {" "}
                            {fetchedLRData.status} LR
                        </span>
                    )}
                    <span class="lr_number item">
                        <b>LR Number:</b> {fetchedLRData.lr_number}
                    </span>
                    <span class="last_modified_date item">
                        <b>Last Modified Date: </b>{" "}
                        {fetchedLRData.lr_last_modified_date
                            ? dateFormat(fetchedLRData.lr_last_modified_date)
                            : dateFormat(fetchedLRData.lr_created_date)}
                    </span>
                    <div class="pickup_address item">
                        <span>
                            <b>
                                Pickup Address:{" "}
                                {fetchedPickupLocationData
                                    ? fetchedPickupLocationData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedPickupLocationData
                                ? [
                                      fetchedPickupLocationData.address1,
                                      fetchedPickupLocationData.address2,
                                      fetchedPickupLocationData.area,
                                      fetchedPickupLocationData.city,
                                      fetchedPickupLocationData.state,
                                      fetchedPickupLocationData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="from_to item">
                        <span>
                            <b>From: </b>
                            {fetchedOrderData.pickup_location}
                        </span>
                        <br />
                        <span>
                            <b>To: </b>
                            {fetchedOrderData.drop_location}
                        </span>
                    </div>
                    <div class="delivery_address item">
                        <span>
                            <b>
                                Delivery Address:{" "}
                                {fetchedDropLocationData
                                    ? fetchedDropLocationData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedDropLocationData
                                ? [
                                      fetchedDropLocationData.address1,
                                      fetchedDropLocationData.address2,
                                      fetchedDropLocationData.area,
                                      fetchedDropLocationData.city,
                                      fetchedDropLocationData.state,
                                      fetchedDropLocationData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="consignor item">
                        <span>
                            <b>
                                Consignor:{" "}
                                {fetchedConsignorClientsData
                                    ? fetchedConsignorClientsData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedConsignorClientsData
                                ? [
                                      fetchedConsignorClientsData.address1,
                                      fetchedConsignorClientsData.address2,
                                      fetchedConsignorClientsData.area,
                                      fetchedConsignorClientsData.city,
                                      fetchedConsignorClientsData.state,
                                      fetchedConsignorClientsData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="vehicle item">
                        <span>
                            <b>Vehical No: </b>
                            {fetchedLRData.vehical_number}
                        </span>
                        <br />
                        <span>
                            <b>Driver: </b>
                            {fetchedLRData.driver_details}
                        </span>
                        <br /> {/* ask what to show here */}
                    </div>
                    <div class="consignee item">
                        <span>
                            <b>
                                Consignee:{" "}
                                {fetchedConsigneeClientsData
                                    ? fetchedConsigneeClientsData.client_name
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedConsigneeClientsData
                                ? [
                                      fetchedConsigneeClientsData.address1,
                                      fetchedConsigneeClientsData.address2,
                                      fetchedConsigneeClientsData.area,
                                      fetchedConsigneeClientsData.city,
                                      fetchedConsigneeClientsData.state,
                                      fetchedConsigneeClientsData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>{" "}
                        <br />
                        <span>
                            <b>GST No: </b>
                            {fetchedConsigneeClientsData
                                ? fetchedConsigneeClientsData.client_gst
                                : ""}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {fetchedConsigneeClientsData
                                ? fetchedConsigneeClientsData.client_phone
                                : ""}
                        </span>
                    </div>
                    <div class="material_detail item">
                        <span>
                            <b>Material Details</b>
                        </span>
                        <br />
                        <span>{fetchedOrderData.quantity}</span>
                    </div>
                    <div class="weight item">
                        <span>
                            <b>Weight(Kg)</b>
                        </span>
                        <br />
                        <span>{fetchedOrderData.weight}</span>
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
                            {dateFormat(fetchedLRData.lr_created_date)}
                        </span>
                    </div>
                    {fetchedLRData.status === "Final" ? (
                        <span class="fina_lr item" style={{ color: "green" }}>
                            {" "}
                            {fetchedLRData.status} LR
                        </span>
                    ) : (
                        <span
                            class="fina_lr item"
                            style={{ color: "darkorange" }}
                        >
                            {" "}
                            {fetchedLRData.status} LR
                        </span>
                    )}
                    <span class="lr_number item">
                        <b>LR Number:</b> {fetchedLRData.lr_number}
                    </span>
                    <span class="last_modified_date item">
                        <b>Last Modified Date: </b>{" "}
                        {fetchedLRData.lr_last_modified_date
                            ? dateFormat(fetchedLRData.lr_last_modified_date)
                            : dateFormat(fetchedLRData.lr_created_date)}
                    </span>
                    <div class="pickup_address item">
                        <span>
                            <b>
                                Pickup Address:{" "}
                                {fetchedPickupLocationData
                                    ? fetchedPickupLocationData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedPickupLocationData
                                ? [
                                      fetchedPickupLocationData.address1,
                                      fetchedPickupLocationData.address2,
                                      fetchedPickupLocationData.area,
                                      fetchedPickupLocationData.city,
                                      fetchedPickupLocationData.state,
                                      fetchedPickupLocationData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="from_to item">
                        <span>
                            <b>From: </b>
                            {fetchedOrderData.pickup_location}
                        </span>
                        <br />
                        <span>
                            <b>To: </b>
                            {fetchedOrderData.drop_location}
                        </span>
                    </div>
                    <div class="delivery_address item">
                        <span>
                            <b>
                                Delivery Address:{" "}
                                {fetchedDropLocationData
                                    ? fetchedDropLocationData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedDropLocationData
                                ? [
                                      fetchedDropLocationData.address1,
                                      fetchedDropLocationData.address2,
                                      fetchedDropLocationData.area,
                                      fetchedDropLocationData.city,
                                      fetchedDropLocationData.state,
                                      fetchedDropLocationData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="consignor item">
                        <span>
                            <b>
                                Consignor:{" "}
                                {fetchedConsignorClientsData
                                    ? fetchedConsignorClientsData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedConsignorClientsData
                                ? [
                                      fetchedConsignorClientsData.address1,
                                      fetchedConsignorClientsData.address2,
                                      fetchedConsignorClientsData.area,
                                      fetchedConsignorClientsData.city,
                                      fetchedConsignorClientsData.state,
                                      fetchedConsignorClientsData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="vehicle item">
                        <span>
                            <b>Vehical No: </b>
                            {fetchedLRData.vehical_number}
                        </span>
                        <br />
                        <span>
                            <b>Driver: </b>
                            {fetchedLRData.driver_details}
                        </span>
                        <br /> {/* ask what to show here */}
                    </div>
                    <div class="consignee item">
                        <span>
                            <b>
                                Consignee:{" "}
                                {fetchedConsigneeClientsData
                                    ? fetchedConsigneeClientsData.client_name
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedConsigneeClientsData
                                ? [
                                      fetchedConsigneeClientsData.address1,
                                      fetchedConsigneeClientsData.address2,
                                      fetchedConsigneeClientsData.area,
                                      fetchedConsigneeClientsData.city,
                                      fetchedConsigneeClientsData.state,
                                      fetchedConsigneeClientsData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>{" "}
                        <br />
                        <span>
                            <b>GST No: </b>
                            {fetchedConsigneeClientsData
                                ? fetchedConsigneeClientsData.client_gst
                                : ""}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {fetchedConsigneeClientsData
                                ? fetchedConsigneeClientsData.client_phone
                                : ""}
                        </span>
                    </div>
                    <div class="material_detail item">
                        <span>
                            <b>Material Details</b>
                        </span>
                        <br />
                        <span>{fetchedOrderData.quantity}</span>
                    </div>
                    <div class="weight item">
                        <span>
                            <b>Weight(Kg)</b>
                        </span>
                        <br />
                        <span>{fetchedOrderData.weight}</span>
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
                            {dateFormat(fetchedLRData.lr_created_date)}
                        </span>
                    </div>
                    {fetchedLRData.status === "Final" ? (
                        <span class="fina_lr item" style={{ color: "green" }}>
                            {" "}
                            {fetchedLRData.status} LR
                        </span>
                    ) : (
                        <span
                            class="fina_lr item"
                            style={{ color: "darkorange" }}
                        >
                            {" "}
                            {fetchedLRData.status} LR
                        </span>
                    )}
                    <span class="lr_number item">
                        <b>LR Number:</b> {fetchedLRData.lr_number}
                    </span>
                    <span class="last_modified_date item">
                        <b>Last Modified Date: </b>{" "}
                        {fetchedLRData.lr_last_modified_date
                            ? dateFormat(fetchedLRData.lr_last_modified_date)
                            : dateFormat(fetchedLRData.lr_created_date)}
                    </span>
                    <div class="pickup_address item">
                        <span>
                            <b>
                                Pickup Address:{" "}
                                {fetchedPickupLocationData
                                    ? fetchedPickupLocationData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedPickupLocationData
                                ? [
                                      fetchedPickupLocationData.address1,
                                      fetchedPickupLocationData.address2,
                                      fetchedPickupLocationData.area,
                                      fetchedPickupLocationData.city,
                                      fetchedPickupLocationData.state,
                                      fetchedPickupLocationData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="from_to item">
                        <span>
                            <b>From: </b>
                            {fetchedOrderData.pickup_location}
                        </span>
                        <br />
                        <span>
                            <b>To: </b>
                            {fetchedOrderData.drop_location}
                        </span>
                    </div>
                    <div class="delivery_address item">
                        <span>
                            <b>
                                Delivery Address:{" "}
                                {fetchedDropLocationData
                                    ? fetchedDropLocationData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedDropLocationData
                                ? [
                                      fetchedDropLocationData.address1,
                                      fetchedDropLocationData.address2,
                                      fetchedDropLocationData.area,
                                      fetchedDropLocationData.city,
                                      fetchedDropLocationData.state,
                                      fetchedDropLocationData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="consignor item">
                        <span>
                            <b>
                                Consignor:{" "}
                                {fetchedConsignorClientsData
                                    ? fetchedConsignorClientsData.name_of_pickup_point
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedConsignorClientsData
                                ? [
                                      fetchedConsignorClientsData.address1,
                                      fetchedConsignorClientsData.address2,
                                      fetchedConsignorClientsData.area,
                                      fetchedConsignorClientsData.city,
                                      fetchedConsignorClientsData.state,
                                      fetchedConsignorClientsData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>
                    </div>
                    <div class="vehicle item">
                        <span>
                            <b>Vehical No: </b>
                            {fetchedLRData.vehical_number}
                        </span>
                        <br />
                        <span>
                            <b>Driver: </b>
                            {fetchedLRData.driver_details}
                        </span>
                        <br /> {/* ask what to show here */}
                    </div>
                    <div class="consignee item">
                        <span>
                            <b>
                                Consignee:{" "}
                                {fetchedConsigneeClientsData
                                    ? fetchedConsigneeClientsData.client_name
                                    : ""}
                            </b>
                        </span>
                        <br />
                        <span>
                            {fetchedConsigneeClientsData
                                ? [
                                      fetchedConsigneeClientsData.address1,
                                      fetchedConsigneeClientsData.address2,
                                      fetchedConsigneeClientsData.area,
                                      fetchedConsigneeClientsData.city,
                                      fetchedConsigneeClientsData.state,
                                      fetchedConsigneeClientsData.pin,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")
                                : ""}
                        </span>{" "}
                        <br />
                        <span>
                            <b>GST No: </b>
                            {fetchedConsigneeClientsData
                                ? fetchedConsigneeClientsData.client_gst
                                : ""}
                        </span>
                        <span>
                            <b> | Ph No: </b>
                            {fetchedConsigneeClientsData
                                ? fetchedConsigneeClientsData.client_phone
                                : ""}
                        </span>
                    </div>
                    <div class="material_detail item">
                        <span>
                            <b>Material Details</b>
                        </span>
                        <br />
                        <span>{fetchedOrderData.quantity}</span>
                    </div>
                    <div class="weight item">
                        <span>
                            <b>Weight(Kg)</b>
                        </span>
                        <br />
                        <span>{fetchedOrderData.weight}</span>
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

export default ViewLR;
