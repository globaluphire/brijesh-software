/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import candidatesData from "../../../../../data/candidates";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../../config/supabaseClient";
import { toast } from "react-toastify";
import { Typeahead } from "react-bootstrap-typeahead";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useSelector } from "react-redux";
import Pagination from "../../../../common/Pagination";
import Table from "react-bootstrap/Table";
import { InputGroup } from "react-bootstrap";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const addSearchFilters = {
    consignorName: "",
    consigneeName: "",
    fromCity: "",
    toCity: "",
    driverName: "",
    status: ""
};

const OpenOrderProcess = () => {
    const router = useRouter();

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedOpenOrderdata, setFetchedOpenOrderdata] = useState({});

    const [applicationStatus, setApplicationStatus] = useState("");
    const [
        applicationStatusReferenceOptions,
        setApplicationStatusReferenceOptions,
    ] = useState(null);
    const [
        lRStatusReferenceOptions,
        setLRStatusReferenceOptions,
    ] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [applicationId, setApplicationId] = useState("");

    // For Pagination
    // const [totalRecords, setTotalRecords] = useState(0);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [hidePagination, setHidePagination] = useState(false);
    // const [pageSize, setPageSize] = useState(10);

    // for search filters
    const [searchFilters, setSearchFilters] = useState(
        JSON.parse(JSON.stringify(addSearchFilters))
    );
    const {
        consignorName,
        consigneeName,
        fromCity,
        toCity,
        driverName,
        status } = useMemo(
        () => searchFilters,
        [searchFilters]
    );

    // global states
    const facility = useSelector((state) => state.employer.facility.payload);

    const dateFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                }) +
                ", " +
                date.getFullYear()
            );
        }
    };

    // clear all filters
    const clearAll = () => {
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        fetchedLR(JSON.parse(JSON.stringify(addSearchFilters)));
    };

    async function findLR() {
        // call reference to get applicantStatus options
        // setCurrentPage(1);
        // const { data: refData, error: e } = await supabase
        //     .from("reference")
        //     .select("*")
        //     .eq("ref_nm", "applicantStatus");

        // if (refData) {
        //     setApplicationStatusReferenceOptions(refData);
        // }

        let query = supabase
            .from("lr")
            .select("*");

        if (consignorName) {
            query.ilike("consignor", "%" + consignorName + "%");
        }
        if (consigneeName) {
            query.ilike("consignee", "%" + consigneeName + "%");
        }
        if (fromCity) {
            query.ilike("from_city", "%" + fromCity + "%");
        }
        if (toCity) {
            query.ilike("to_city", "%" + toCity + "%");
        }
        if (driverName) {
            query.ilike("driver_name", "%" + driverName + "%");
        }
        if (status) {
            query.ilike("status", "%" + status + "%");
        }

        // if (facility) {
        //     query.ilike("facility_name", "%" + facility + "%");
        // }

        // setTotalRecords((await query).data.length);

        let { data, error } = await query.order("lr_created_date", {
            ascending: false,
            nullsFirst: false,
        });
        // .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        // if (facility) {
        //     data = data.filter((i) => i.facility_name === facility);
        // }

        if (data) {
            data.forEach(
                (lr) =>
                    (lr.lr_created_date = dateFormat(lr.lr_created_date))
            );
            setFetchedOpenOrderdata(data);
        }
    }

    async function fetchOpenOrder({
        consignorName,
        consigneeName,
        fromCity,
        toCity,
        driverName,
        status
    }) {
        try {
            // call reference to get lrStatus options
            const { data, error: e } = await supabase
                .from("reference")
                .select("*")
                .eq("ref_nm", "orderStatus");

            if (data) {
                setLRStatusReferenceOptions(data);
            }

            let query = supabase
                .from("orders")
                .select("*")
                .eq("status", "Under pickup process");

            let { data: orderData, error } = await query.order(
                "created_at",
                { ascending: false, nullsFirst: false }
            );
            // .range(
            //     (currentPage - 1) * pageSize,
            //     currentPage * pageSize - 1
            // );

            // if (facility) {
            //     allApplicantsView = allApplicantsView.filter(
            //         (i) => i.facility_name === facility
            //     );
            // }

            if (orderData) {
                orderData.forEach(
                    (i) => (i.created_at = dateFormat(i.created_at))
                );
            }

            setFetchedOpenOrderdata(orderData);
        } catch (e) {
            toast.error(
                "System is unavailable.  Please try again later or contact tech support!",
                {
                    position: "bottom-right",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                }
            );
            console.warn(e);
        }
    }
    // const handlePageChange = (newPage) => {
    //     setCurrentPage(newPage);
    // };

    // function perPageHandler(event) {
    //     setCurrentPage(1);
    //     const selectedValue = JSON.parse(event.target.value);
    //     const end = selectedValue.end;

    //     setPageSize(end);
    // }

    useEffect(() => {
        fetchOpenOrder(searchFilters);
        // if (facility) {
        //     localStorage.setItem("facility", facility);
        // } else {
        //     localStorage.setItem("facility", "");
        // }
    }, [
        // facility,
        // pageSize,
        // currentPage
    ]);

    const determineBadgeColor = (status) => {
        switch (status?.toLowerCase()) {
            case "sent":
                return { color: "orange", tag: "Sent" };
            case "read":
                return { color: "#87CEEB", tag: "Read" };
            case "completed":
                return { color: "green", tag: "Signed" };
            case "signed":
                return { color: "green", tag: "Signed" };
            default:
                return { color: "red", tag: "Not Sent" };
        }
    };

    const CSVSmartLinx = async (applicant) => {
        fetch("/api/csv", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(applicant),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                toast.success("Sent to SmartLinx!");
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                toast.error(
                    "Error while sending CSV to SmartLinx.  Please try again later or contact tech support!"
                );
                // Handle errors here, such as displaying an error message to the user
            });
    };

    return (
        <>
            <div>
                { lRStatusReferenceOptions != null ? (
                    <Form>
                        <Form.Label
                            className="optional"
                            style={{
                                marginLeft: "32px",
                                letterSpacing: "2px",
                                fontSize: "12px",
                            }}
                        >
                            SEARCH BY
                        </Form.Label>
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                            <Row className="mb-1 mx-3">
                                <Form.Group as={Col} md="2" controlId="validationCustom01">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Consignor</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={consignorName}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                consignorName: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findLR(searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Consignee</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={consigneeName}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                consigneeName: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findLR(searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>From</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={fromCity}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                fromCity: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findLR(searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>To</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        value={toCity}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                toCity: e.target.value,
                                            }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                findLR(searchFilters);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom01">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Driver Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        // placeholder="Consignor"
                                        // defaultValue="Mark"
                                        value={driverName}
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                driverName: e.target.value,
                                            }));
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>Status</Form.Label>
                                    <Form.Select
                                        className="chosen-single form-select"
                                        size="sm"
                                        onChange={(e) => {
                                            setSearchFilters((previousState) => ({
                                                ...previousState,
                                                status: e.target.value,
                                            }));
                                        }}
                                        value={status}
                                    >
                                        <option value=""></option>
                                        {lRStatusReferenceOptions.map(
                                            (option) => (
                                                <option value={option.ref_dspl}>
                                                    {option.ref_dspl}
                                                </option>
                                            )
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </Row>
                            {/* <Row className="mb-3 mx-3">
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>From Date</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        // placeholder="GST number"
                                        // defaultValue="Otto"
                                        // value={consignorGST}
                                        // onChange={(e) => {
                                        //     setLrFormData((previousState) => ({
                                        //         ...previousState,
                                        //         consignorGST: e.target.value,
                                        //     }));
                                        // }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="2" controlId="validationCustom02">
                                    <Form.Label style={{ marginBottom: "-5px" }}>To Date</Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        // placeholder="GST number"
                                        // defaultValue="Otto"
                                        // value={consignorGST}
                                        // onChange={(e) => {
                                        //     setLrFormData((previousState) => ({
                                        //         ...previousState,
                                        //         consignorGST: e.target.value,
                                        //     }));
                                        // }}
                                    />
                                </Form.Group>
                            </Row> */}
                            <Row className="mx-3">
                                <Col>
                                    <Form.Group className="chosen-single form-input chosen-container mb-3">
                                        <Button
                                            variant="primary"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                findLR(searchFilters);
                                            }}
                                            className="btn btn-submit btn-sm text-nowrap m-1"
                                        >
                                            Filter
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={clearAll}
                                            className="btn btn-secondary btn-sm text-nowrap mx-2"
                                            style={{
                                                minHeight: "40px",
                                                padding: "0 20px"
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </Form.Group>
                                </Col>
                                <Col style={{ display: "relative", textAlign: "right" }}>
                                    <Form.Group className="chosen-single form-input chosen-container mb-3">
                                        <Button
                                            variant="success"
                                            onClick={() => Router.push("/employers-dashboard/add-order")}
                                            className="btn btn-add-lr btn-sm text-nowrap m-1"
                                        >
                                            Add Order
                                        </Button>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                ) : ( "" 
                )}
                {/* End filter top bar */}

                <div
                    className="optional"
                    style={{
                        textAlign: "right",
                        marginRight: "50px",
                        marginBottom: "10px",
                    }}
                >
                    Showing ({fetchedOpenOrderdata.length}) LR(s)
                    {/* Out of ({totalRecords}) <br /> Page: {currentPage} */}
                </div>

            </div>
            <div className="widget-content">
                <div className="table-outer">
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>LR No</th>
                                <th>LR Date</th>
                                <th>Order No</th>
                                <th>Consignor</th>
                                <th>Consignee</th>
                                <th>Pickup Point</th>
                                <th>Drop Point</th>
                                <th>Item</th>
                                <th>Weight(Kg)</th>
                                <th>Truck No</th>
                                <th>Driver Details</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        {fetchedOpenOrderdata.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr>
                                    <td>
                                        <b>No LR found!</b>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedOpenOrderdata).map(
                                    (lr) => (
                                        <tr key={lr.id}>
                                            <td>
                                            <td>
                                                <ui>
                                                    <li>
                                                        <a onClick={() => router.push(`/employers-dashboard/view-lr/${lr.id}`)}>
                                                            <i className="la la-print" title="Print LR"></i>
                                                        </a>
                                                    </li>
                                                </ui>
                                            </td>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.lr_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.lr_created_date}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.order_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>{lr.consignor}</span><br />
                                                <span className="optional">{lr.consignor_phone}</span><br />
                                                <span className="optional">{lr.consignor_email}</span>
                                            </td>
                                            <td>
                                                <span>{lr.consignee}</span><br />
                                                <span className="optional">{lr.consignee_phone}</span><br />
                                                <span className="optional">{lr.consignee_email}</span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.pickup_address}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.drop_address}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.material_details}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.weight}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {lr.vehical_number}
                                                </span>
                                            </td>
                                            <td>
                                                <span>{lr.driver_name}</span><br />
                                                <span className="optional">{lr.driver_phone}</span>
                                            </td>
                                            <td>
                                                {
                                                    lr.status === "Final" ? (
                                                        <span style={{ color: "green" }}>
                                                            {lr.status}
                                                        </span>
                                                    ) : lr.status === "Performa" ? (
                                                            <span style={{ color: "darkorange" }}>
                                                                {lr.status}
                                                            </span>
                                                    ) : <span>-</span>
                                                }
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        )}
                    </Table>
                </div>
            </div>
            {/* End table widget content */}
        </>
    );
};

export default OpenOrderProcess;
