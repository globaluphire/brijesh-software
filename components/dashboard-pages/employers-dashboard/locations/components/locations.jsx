/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import candidatesData from "../../../../../data/candidates";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
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
import Spinner from "../../../../spinner/spinner";

const addSearchFilters = {
    consignorName: "",
    consigneeName: "",
    fromCity: "",
    toCity: "",
    driverName: "",
    status: ""
};

const Clients = () => {
    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);

    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Location Data are loading...");

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedLocationsData, setFetchedLocationsData] = useState({});

    const [fetchedContactData, setFetchedContactData] = useState([]);

    const [
        lRStatusReferenceOptions,
        setLRStatusReferenceOptions,
    ] = useState(null);

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
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                }) +
                ", " +
                date.getFullYear()
            );
        }
    };

    const dateTimeFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })
            );
        }
    };

    // clear all filters
    const clearAll = () => {
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        fetchedClients(JSON.parse(JSON.stringify(addSearchFilters)));
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
            setFetchedClientsData(data);
        }
    }

    async function fetchedLocations() {
        setIsLoading(true);
        // fetch client data
        try {
            let query = supabase
                .from("location")
                .select("*");

            // setTotalRecords((await query).data.length);

            let { data: locationData, error } = await query.order(
                "location_created_at",
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

            if (locationData) {
                locationData.forEach(
                    (i) => (i.location_created_at = dateTimeFormat(i.location_created_at))
                );

                var locationTypeFilteredData = [...locationData];
                var locationCityFilteredData = [...locationData];
                var filteredLocationData = [];
                if (user.drop_branch) {
                    locationTypeFilteredData = locationTypeFilteredData.filter((data) => data.location_type === "Drop" && data.location_city === user.drop_branch);
                    Array.prototype.push.apply(filteredLocationData,locationTypeFilteredData);
                }
                if (user.pickup_branch) {
                    locationCityFilteredData = locationCityFilteredData.filter((data) => data.location_type === "Pickup" && data.location_city === user.pickup_branch);
                    Array.prototype.push.apply(filteredLocationData,locationCityFilteredData);
                }

                if (filteredLocationData.length > 0) {
                    setFetchedLocationsData(filteredLocationData);
                } else {
                    setFetchedLocationsData(locationData);
                }

                setIsLoading(false);
            } else {
                setIsLoading(false);
            }

        } catch (e) {
            toast.error(
                "System is unavailable.  Unable to fetch Locations Data.  Please try again later or contact tech support!",
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
            // console.warn(e);
            setIsLoading(false);
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
        fetchedLocations(searchFilters);
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

    const setContactModalData = async (locationNumber) => {
        setIsLoading(true);
        setLoadingText("Location Contacts are loading...");
        const { data: contactData, error: e } = await supabase
            .from("location_contact")
            .select("*")

            // Filters
            .eq("location_number", locationNumber)
            .order("location_contact_created_at", { ascending: false });

            if (contactData) {
                contactData.forEach(
                    (i) => (i.location_contact_created_at = dateTimeFormat(i.location_contact_created_at))
                );
                setFetchedContactData(contactData);
                setIsLoading(false);
                setLoadingText("");
            } else {
                setIsLoading(false);
                setLoadingText("");
            }
    };

    return (
        <>
            <div>
                <div
                    className="widget-title"
                    style={{ fontSize: "1.5rem", fontWeight: "500" }}
                >
                    <b>All Locations!</b>
                </div>

                <Spinner isLoading={isLoading} loadingText={loadingText} />

                <Form>
                    {/* <Form.Label
                        className="optional"
                        style={{
                            marginLeft: "32px",
                            letterSpacing: "2px",
                            fontSize: "12px",
                        }}
                    >
                        SEARCH BY
                    </Form.Label> */}
                    <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {/* <Row className="mb-1 mx-3">
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
                        </Row> */}
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
                            {/* <Col>
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
                            </Col> */}
                            <Col style={{ display: "relative", textAlign: "right" }}>
                                <Form.Group className="chosen-single form-input chosen-container mb-3">
                                    <Button
                                        variant="success"
                                        onClick={() => Router.push("/employers-dashboard/add-location")}
                                        className="btn btn-add-lr btn-sm text-nowrap m-1"
                                    >
                                        Add Location
                                    </Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Form>

                <div
                    className="optional"
                    style={{
                        textAlign: "right",
                        marginRight: "50px",
                        marginBottom: "10px",
                    }}
                >
                    Showing ({fetchedLocationsData.length}) Location(s)
                    {/* Out of ({totalRecords}) <br /> Page: {currentPage} */}
                </div>

            </div>
            {/* Start table widget content */}
            <div className="widget-content">
                <div className="table-outer">
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>Created On</th>
                                <th>Location Type</th>
                                <th>Location City</th>
                                <th>Name Of Pickup Point</th>
                                <th>Address</th>
                                <th>Contact</th>
                            </tr>
                        </thead>
                        {fetchedLocationsData.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr style={{ border: "1px solid #333" }}>
                                    <td colSpan={4} style={{ border: "none" }}>
                                        <span><b>No Locations found!</b></span>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedLocationsData).map(
                                    (location) => (
                                        <tr key={location.location_number}>
                                            <td>
                                                <ui className="option-list" style={{ border: "none" }}>
                                                    <li>
                                                        <button>
                                                            <a onClick={() => router.push(`/employers-dashboard/location-details/${location.location_number}`)}>
                                                                <span className="la la-edit" title="Edit Location"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ui>
                                            </td>
                                            <td>
                                                <span>{location.location_created_at}</span>
                                            </td>
                                            <td>
                                                <span>{location.location_type}</span>
                                            </td>
                                            <td>
                                                <span>{location.location_city}</span>
                                            </td>
                                            <td>
                                                <span>{location.name_of_pickup_point}</span>

                                            </td>
                                            <td>
                                                <span>{location.address1 ? location.address1 + ", " : ""}</span>
                                                <span>{location.address2 ? location.address2 + ", " : ""}</span>
                                                <span>{location.area ? location.area + ", " : ""}</span>
                                                <span>{location.city ? location.city + ", " : ""}</span>
                                                <span>{location.state ? location.state + ", " : ""}</span>
                                                <span>{location.pin ? location.pin : ""}</span>
                                                <span>{location.address1 && location.area && location.city && location.state && location.pin ? "" : "-"}</span>
                                            </td>
                                            <td>
                                                <ul className="option-list">
                                                    <li>
                                                        <button>
                                                            <a
                                                                href="#"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#showContactModal"
                                                                onClick={() => {
                                                                    setContactModalData(
                                                                        location.location_number
                                                                    );
                                                                }}
                                                            >
                                                                <span className="la la-user"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        )}
                    </Table>


                    {/* Add Notes Modal Popup */}
                    <div
                        className="modal fade"
                        id="showContactModal"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="apply-modal-content modal-content">
                                <div className="text-center">
                                    <h3 className="title">Contact Lists</h3>
                                    <button
                                        type="button"
                                        id="showContactModalCloseButton"
                                        className="closed-modal"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                {/* End modal-header */}
                                <div className="widget-content">
                                    <div className="table-outer">
                                        <Table className="default-table manage-job-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ fontSize: "14px" }}>Created On</th>
                                                    <th style={{ fontSize: "14px" }}>Type</th>
                                                    <th style={{ fontSize: "14px" }}>Name</th>
                                                    <th style={{ fontSize: "14px" }}>Phone</th>
                                                    <th style={{ fontSize: "14px" }}>Email</th>
                                                </tr>
                                            </thead>
                                            {/* might need to add separate table link with order_number as one order can have 
                                                multiple comments */}
                                            {fetchedContactData.length === 0 ? (
                                                <tbody
                                                    style={{
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    <tr>
                                                        <td colSpan={3}>
                                                            <b> No contact yet!</b>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            ) : (
                                                <tbody style={{ fontSize: "14px" }}>
                                                    {Array.from(fetchedContactData).map(
                                                        (contact) => (
                                                            <tr key={contact.contact_name}>
                                                                <td>
                                                                    {contact.location_contact_created_at}
                                                                </td>
                                                                <td>
                                                                    {contact.contact_type}
                                                                </td>
                                                                <td>
                                                                    {contact.contact_name}
                                                                </td>
                                                                <td>
                                                                    {contact.contact_phone}
                                                                </td>
                                                                <td>
                                                                    {contact.contact_email}
                                                                </td>
                                                            </tr>
                                                        )
                                                        )}
                                                </tbody>
                                            )}
                                        </Table>
                                    </div>
                                </div>
                                {/* End PrivateMessageBox */}
                            </div>
                            {/* End .send-private-message-wrapper */}
                        </div>
                    </div>

                </div>
            </div>
            {/* End table widget content */}
        </>
    );
};

export default Clients;
