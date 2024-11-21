import { supabase } from "../config/supabaseClient";

const today = new Date();
let date = today.getDate();
if (date < 10) {
    date = "0" + date;
}
let month = today.getMonth() + 1;
if (month < 10) {
    month = "0" + month;
}
var year = today.getFullYear();

const getLrNumber = async () => {
    // Generate LR Number
    const { data: sysKeyLRData, error: sysKeyLRError } = await supabase
        .from("sys_key")
        .select("sys_seq_nbr")
        .eq("key_name", "lr_number");

    let lrSeqNbr = sysKeyLRData[0].sys_seq_nbr + 1;
    if (lrSeqNbr < 10) {
        lrSeqNbr = "00" + lrSeqNbr;
    } else if (lrSeqNbr < 100) {
        lrSeqNbr = "0" + lrSeqNbr;
    }
    const lrNumber =
        "RLR" +
        "" +
        date +
        "" +
        month +
        "" +
        year.toString().substring(2) +
        "" +
        lrSeqNbr;

    return lrNumber;
};

const getOrderNumber = async () => {
    // Generate Order Number
    const { data: sysKeyOrderData, error: sysKeyError } = await supabase
        .from("sys_key")
        .select("sys_seq_nbr")
        .eq("key_name", "order_number");

    let orderSeqNbr = sysKeyOrderData[0].sys_seq_nbr + 1;
    if (orderSeqNbr < 10) {
        orderSeqNbr = "00" + orderSeqNbr;
    } else if (orderSeqNbr < 100) {
        orderSeqNbr = "0" + orderSeqNbr;
    }
    const orderNumber =
        "ORD" +
        "" +
        date +
        "" +
        month +
        "" +
        year.toString().substring(2) +
        "" +
        orderSeqNbr;

    return orderNumber;
};

const getClientNumber = async () => {
    const { data: sysKeyClientData, error: sysKeyClientError } = await supabase
        .from("sys_key")
        .select("sys_seq_nbr")
        .eq("key_name", "client_number");

    let clientSeqNbr = sysKeyClientData[0].sys_seq_nbr + 1;
    if (clientSeqNbr < 10) {
        clientSeqNbr = "00" + clientSeqNbr;
    } else if (clientSeqNbr < 100) {
        clientSeqNbr = "0" + clientSeqNbr;
    }
    const clientNumber =
        "C" +
        "" +
        date +
        "" +
        month +
        "" +
        year.toString().substring(2) +
        "" +
        clientSeqNbr;

    return clientNumber;
};

const getLocationNumber = async () => {
    const { data: sysKeyLocationData, error: sysKeyLocationError } =
        await supabase
            .from("sys_key")
            .select("sys_seq_nbr")
            .eq("key_name", "location_number");

    let locationSeqNbr = sysKeyLocationData[0].sys_seq_nbr + 1;
    if (locationSeqNbr < 10) {
        locationSeqNbr = "00" + locationSeqNbr;
    } else if (locationSeqNbr < 100) {
        locationSeqNbr = "0" + locationSeqNbr;
    }
    const locationNumber =
        "LOC" +
        "" +
        date +
        "" +
        month +
        "" +
        year.toString().substring(2) +
        "" +
        locationSeqNbr;

    return locationNumber;
};

const getInvoiceNumber = async () => {
    const { data: sysKeyInvoiceData, error: sysKeyInvoiceError } =
        await supabase
            .from("sys_key")
            .select("sys_seq_nbr")
            .eq("key_name", "invoice_number");

    let invoiceSeqNbr = sysKeyInvoiceData[0].sys_seq_nbr + 1;
    if (invoiceSeqNbr < 10) {
        invoiceSeqNbr = "0000" + invoiceSeqNbr;
    } else if (invoiceSeqNbr < 100) {
        invoiceSeqNbr = "000" + invoiceSeqNbr;
    } else if (invoiceSeqNbr < 1000) {
        invoiceSeqNbr = "00" + invoiceSeqNbr;
    } else if (invoiceSeqNbr < 10000) {
        invoiceSeqNbr = "0" + invoiceSeqNbr;
    }
    const invoiceNumber = "RF" + invoiceSeqNbr;

    return invoiceNumber;
};

export {
    getLrNumber,
    getOrderNumber,
    getClientNumber,
    getLocationNumber,
    getInvoiceNumber,
};
