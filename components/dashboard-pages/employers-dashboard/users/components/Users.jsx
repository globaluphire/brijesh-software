/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

import { FilterMatchMode, FilterOperator } from 'primereact/api';
import candidatesData from "../../../../../data/candidates";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../../config/supabaseClient";
import { toast } from "react-toastify";
import { Typeahead } from "react-bootstrap-typeahead";

import { useSelector } from "react-redux";
import Spinner from "../../../../spinner/spinner";

const addSearchFilters = {
    consignorName: "",
    consigneeName: "",
    fromCity: "",
    toCity: "",
    driverName: "",
    status: ""
};

const Users = () => {
    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);

    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Users Data are loading...");

    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [fetchedUsersData, setFetchedUsersData] = useState({});

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
        fetchedUsers(JSON.parse(JSON.stringify(addSearchFilters)));
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
            setFetchedUsersData(data);
        }
    }

    async function fetchedUsers() {
        setIsLoading(true);
        // fetch users data
        try {
            let query = supabase
                .from("users")
                .select("*");

            // if (user.drop_branch && user.pickup_branch) {
            //     query.in("city", [user.drop_branch, user.pickup_branch]);
            // } else if (user.drop_branch) {
            //     query.eq("city", user.drop_branch);
            // } else if (user.pickup_branch) {
            //     query.eq("city", user.pickup_branch);
            // }

            // setTotalRecords((await query).data.length);

            let { data: usersData, error } = await query.order(
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

            if (usersData) {
                usersData.forEach(
                    (i) => (i.created_at = dateTimeFormat(i.created_at))
                );
                setFetchedUsersData(usersData);

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
        fetchedUsers(searchFilters);
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
            } else if (locationSeqNbr < 100) {
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

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        representative: { value: null, matchMode: FilterMatchMode.IN },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
        verified: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    const actionButtonRender = (rowData) => {
        return <Button icon="pi pi-pen-to-square" rounded size="small"/>
            // <div className="action-btns">
            //      <Button>
            //         {/* <a onClick={() => router.push(`/employers-dashboard/user-details/${user.user_key_id}`)}>
            //             <span className="la la-edit" title="Edit User"></span>
            //         </a> */}
            //          { rowData.name }
            //     </Button>
            // </div>
    }
   
    return (
        <>
            <div>
                <div
                    className="widget-title"
                    style={{ fontSize: "1.5rem", fontWeight: "500" }}
                >
                    <b>All Users!</b>
                </div>

                <Spinner isLoading={isLoading} loadingText={loadingText} />

                <div
                    className="optional"
                    style={{
                        textAlign: "right",
                        marginRight: "50px",
                        marginBottom: "10px",
                    }}
                >
                    Showing ({fetchedUsersData.length}) Users
                    {/* Out of ({totalRecords}) <br /> Page: {currentPage} */}
                </div>

            </div>
            {/* Start table widget content */}
            <div className="widget-content">
                <div className="table-outer">
                    {/* <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>Created On</th>
                                <th>User Name</th>
                                <th>Role</th>
                                <th>Email ID</th>
                            </tr>
                        </thead>
                        {fetchedUsersData.length === 0 ? (
                            <tbody
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "500",
                                }}
                            >
                                <tr style={{ border: "1px solid #333" }}>
                                    <td colSpan={4} style={{ border: "none" }}>
                                        <span><b>No Users found!</b></span>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {Array.from(fetchedUsersData).map(
                                    (user) => (
                                        <tr key={user.uer_key_id}>
                                            <td>
                                                <ui className="option-list" style={{ border: "none" }}>
                                                    <li>
                                                        <button>
                                                            <a onClick={() => router.push(`/employers-dashboard/user-details/${user.user_key_id}`)}>
                                                                <span className="la la-edit" title="Edit User"></span>
                                                            </a>
                                                        </button>
                                                    </li>
                                                </ui>
                                            </td>
                                            <td>
                                                <span>{user.created_at}</span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/employers-dashboard/user-info/${user.user_key_id}`}
                                                    style={{ textDecoration: "underline" }}
                                                >
                                                    {user.name}
                                                </Link>
                                            </td>
                                            <td>
                                                <span>{user.role}</span>
                                            </td>
                                            <td>
                                                <span>{user.email}</span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        )}
                    </Table> */}
                    <DataTable 
                        value={fetchedUsersData} 
                        size="normal"
                        showGridlines 
                        stripedRows 
                        removableSort 
                        sortMode="multiple" 
                        tableStyle={{ minWidth: '50rem' }}
                        filters={filters} 
                        filterDisplay="row"
                        emptyMessage="No Users found!"
                    >
                        <Column field="uer_key_id" sortable header="Action" body={actionButtonRender} />
                        <Column field="created_at" sortable header="Created at"></Column>
                        <Column filter filterPlaceholder="Search by name" field="name" sortable header="Name"></Column>
                        <Column field="role" sortable header="Role"></Column>
                        <Column field="email" sortable header="Email"></Column>
                    </DataTable>
                    
                </div>
            </div>
            {/* End table widget content */}
        </>
    );
};

export default Users;
