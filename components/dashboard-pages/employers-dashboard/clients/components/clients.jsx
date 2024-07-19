/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
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
    const [loadingText, setLoadingText] = useState("Client Data are loading...");

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedClientsData, setFetchedClientsData] = useState({});

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

    const [query, setQuery] = useState("");
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

    async function findCLient() {
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
            .from("client")
            .select("*");

        if (user.drop_branch && user.pickup_branch) {
            query.in("city", [user.drop_branch, user.pickup_branch]);
        } else if (user.drop_branch) {
            query.eq("city", user.drop_branch);
        } else if (user.pickup_branch) {
            query.eq("city", user.pickup_branch);
        }

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

    async function fetchedClients() {
        setIsLoading(true);
        // fetch client data
        try {
            let query = supabase
                .from("client_view")
                .select("*");

            if (user.drop_branch && user.pickup_branch) {
                query.in("city", [user.drop_branch, user.pickup_branch]);
            } else if (user.drop_branch) {
                query.eq("city", user.drop_branch);
            } else if (user.pickup_branch) {
                query.eq("city", user.pickup_branch);
            }

            // setTotalRecords((await query).data.length);

            let { data: clientData, error } = await query.order(
                "client_created_at",
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

            if (clientData) {
                clientData.forEach(
                    (i) => (i.client_created_at = dateTimeFormat(i.client_created_at))
                );
                setFetchedClientsData(clientData);

                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        } catch (e) {
            toast.error(
                "System is unavailable.  Unable to fetch Client Data.  Please try again later or contact tech support!",
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
        fetchedClients(searchFilters);
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

    const ViewCV = async (applicationId) => {
        const { data, error } = await supabase
            .from("applicants_view")
            .select("*")
            .eq("application_id", applicationId);

        if (data) {
            window.open(
                data[0].doc_dwnld_url.slice(14, -2),
                "_blank",
                "noreferrer"
            );
        }
        if (error) {
            toast.error(
                "Error while retrieving CV.  Please try again later or contact tech support!",
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
        }
    };

    const DownloadHandler = async (applicant) => {
        const { data, error } = await supabase
            .from("applicants_view")
            .select("*")
            .eq("application_id", applicant.application_id);

        if (data) {
            const fileName = data[0].doc_dwnld_url.slice(14, -2);
            fetch(fileName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/pdf",
                },
            })
                .then((response) => response.blob())
                .then((blob) => {
                    const url = window.URL.createObjectURL(new Blob([blob]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                });
            // window.open(data[0].doc_dwnld_url.slice(14, -2), '_blank', 'noreferrer');
        }
        if (error) {
            toast.error(
                "Error while retrieving CV.  Please try again later or contact tech support!",
                {
                    position: "bottom-right",
                    autoClose: true,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                }
            );
        }
    };

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

    const addClientToLocation = async (client) => {
        // setIsLoading(true);
            try {
                // Generate location number
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

                const { data: sysKeyLocationData, error: sysKeyLocationError } = await supabase
                    .from("sys_key")
                    .select("sys_seq_nbr")
                    .eq("key_name", "location_number");

                let locationSeqNbr = sysKeyLocationData[0].sys_seq_nbr + 1;
                if (locationSeqNbr < 10) {
                    locationSeqNbr = "00" + locationSeqNbr;
                } else if(locationSeqNbr < 100) {
                    locationSeqNbr = "0" + locationSeqNbr;
                }
                const locationNumber = "LOC" + "" + date + "" + month + "" + year.toString().substring(2) + "" + locationSeqNbr;

                // saving data
                const { data: locationData, error: locationError } = await supabase.from("location").insert([
                    {
                        // client
                        location_number: locationNumber,
                        location_type: "Pickup",
                        name_of_pickup_point: client.client_name,
                        location_city: client.city,
                        address1: client.address1,
                        address2: client.address2,
                        area: client.area,
                        city: client.city,
                        pin: client.pin,
                        state: client.state,
                        location_created_by: user.id
                    },
                ]);
                if (locationError) {
                    // open toast
                    toast.error(
                        "Error while adding Location data, Please try again later or contact tech support",
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
                    // setIsLoading(false);
                } else {
                    // open toast
                    toast.success("'" + client.client_name + "'" + " saved as Location successfully", {
                        position: "bottom-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });

                    // increment location_number key
                    await supabase.rpc("increment_sys_key", {
                        x: 1,
                        keyname: "location_number",
                    });
                    // setIsLoading(false);
                }
            } catch (err) {
                // open toast
                toast.error(
                    "Error while adding Location details, Please try again later or contact tech support",
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
                // console.warn(err);
                // setIsLoading(false);
            }
    };

    return (
        <>
            <div>
                <div
                    className="widget-title"
                    style={{ fontSize: "1.5rem", fontWeight: "500" }}
                >
                    <b>All Clients!</b>
                </div>

                <Spinner isLoading={isLoading} loadingText={loadingText} />

                <Form>
                    {/* <Form.Label
                        className="optional"
                        style={{
                            marginLeft: "24px",
                            letterSpacing: "2px",
                            fontSize: "12px",
                        }}
                    >
                        SEARCH BY
                    </Form.Label> */}
                    <div style={{ fontSize: "14px", fontWeight: "bold" }}>
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
                                        onClick={() => Router.push("/employers-dashboard/add-client")}
                                        className="btn btn-add-lr btn-sm text-nowrap m-1"
                                    >
                                        Add Client
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
                    Showing ({fetchedClientsData.length}) Client(s)
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
                                <th>Type</th>
                                <th>City</th>
                                <th>
                                    Client Name <br />
                                    <input className="searchInputBox" type="text" value={query} placeholder="search client..."
                                        onChange={(e) => { setQuery(e.target.value); }}
                                    />
                                </th>
                                <th>Address</th>
                                <th>GSTIN</th>
                                <th>PAN No</th>
                                <th>Contact</th>
                                <th>Total Orders</th>
                                <th>Total Billing</th>
                                <th>Due Payment</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        {fetchedClientsData.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr style={{ border: "1px solid #333" }}>
                                    <td colSpan={4} style={{ border: "none" }}>
                                        <span><b>No Clients found!</b></span>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedClientsData).filter((client) => client.client_name.toLowerCase().includes(query.toLowerCase())).map(
                                    (client) => (
                                        <tr key={client.client_number}>
                                            <td>
                                                <ui className="option-list" style={{ border: "none" }}>
                                                    <li>
                                                        <button>
                                                            <a onClick={() => router.push(`/employers-dashboard/client-details/${client.client_number}`)}>
                                                                <span className="la la-edit" title="Edit Client"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                    { user.role === "SUPER_ADMIN" ?
                                                        <li>
                                                            <button>
                                                                <a onClick={() => { addClientToLocation(client); }}>
                                                                    <span className="la la-map-marker-alt" title="Add same Client as Location"></span>
                                                                </a>
                                                            </button>
                                                        </li>
                                                    : "" }
                                                </ui>
                                            </td>
                                            <td>
                                                <span>{client.client_created_at}</span>
                                            </td>
                                            <td>
                                                <span>{client.client_type}</span>
                                            </td>
                                            <td>
                                                <span>{client.city}</span>
                                            </td>
                                            <td>
                                                <span>{client.client_name}</span> <br />
                                                {client.client_phone !== 0 && client.client_phone != null ? <><span className="optional">+91 {client.client_phone}</span> <br /></> : <span className="optional">-</span> }
                                                {client.client_email ? <span className="optional"></span> : "" }

                                            </td>
                                            <td>
                                                <span>{client.address1 ? client.address1 + ", " : ""}</span>
                                                <span>{client.address2 ? client.address2 + ", " : ""}</span>
                                                <span>{client.area ? client.area + ", " : ""}</span>
                                                <span>{client.city ? client.city + ", " : ""}</span>
                                                <span>{client.state ? client.state + ", " : ""}</span>
                                                <span>{client.pin ? client.pin : ""}</span>
                                                <span>{client.address1 && client.area && client.city && client.state && client.pin ? "" : "-"}</span>
                                            </td>
                                            <td>
                                                <span>{client.client_gst}</span>
                                            </td>
                                            <td>
                                                {client.client_pan ? <span>{client.client_pan}</span> : <span className="optional">-</span> }
                                            </td>
                                            <td>
                                                {client.contact_name ? <span>{client.contact_name}</span> : <span className="optional">-</span> } <br />
                                                {client.contact_phone !== 0 && client.contact_phone != null ? <><span className="optional">+91 {client.contact_phone}</span></> : <span className="optional">-</span> } <br />
                                                {client.contact_email ? <span className="optional">{client.contact_email}</span> : <span className="optional">-</span> } <br />
                                            </td>
                                            <td>
                                                {client.total_orders ?
                                                    <Link className="option-list"
                                                        href={`/employers-dashboard/client-orders/${client.client_number}`}
                                                        style={{ textDecoration: "underline", fontSize: "14px" }}
                                                    >
                                                        <span>{client.total_orders}</span>
                                                    </Link>
                                                : <span className="optional">-</span> }
                                            </td>
                                            <td>
                                                <span>{client.total_billings ? client.total_billings : <span className="optional">-</span> }</span>
                                            </td>
                                            <td>
                                                <span>{client.total_billings_due ? client.total_billings_due : <span className="optional">-</span> }</span>
                                            </td>
                                            <td>
                                                {
                                                    client.client_status ?
                                                        <span className="badge" style={{ backgroundColor: "green" }}>
                                                            Active
                                                        </span>
                                                    :   <span className="badge" style={{ backgroundColor: "red" }}>
                                                            Not Active
                                                        </span>
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

export default Clients;
