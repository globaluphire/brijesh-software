/* eslint-disable no-unused-vars */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import employerMenuData from "../../data/employerMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../../features/candidate/candidateSlice";
import { logout } from "../../utils/logout";
import candidatesMenuData from "../../data/candidatesMenuData";
import { supabase } from "../../config/supabaseClient";
import { Typeahead } from "react-bootstrap-typeahead";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { setFacility } from "../../features/employer/employerSlice";
import { Tooltip } from "react-tooltip";

const DashboardHeader = () => {
    // global states
    const facility = useSelector((state) => state.employer.facility.payload);

    // set initial facility value
    const localStorageFacilityArray = [];
    if (facility) {
        localStorageFacilityArray.push(facility);
    }

    const [navbar, setNavbar] = useState(false);
    const [facilityNames, setFacilityNames] = useState([]);
    const [facilitySingleSelections, setFacilitySingleSelections] = useState(
        localStorageFacilityArray
    );

    const router = useRouter();
    const dispatch = useDispatch();

    const changeBackground = () => {
        if (window.scrollY >= 0) {
            setNavbar(true);
        } else {
            setNavbar(false);
        }
    };

    async function getFacilityNames() {
        // call reference to get applicantStatus options
        const { data: refData, error: e } = await supabase
            .from("reference")
            .select("*")
            .eq("ref_nm", "facilityName");

        if (refData) {
            // setFacilityNames(refData)
            const facilities = [];
            for (let i = 0; i < refData.length; i++) {
                facilities.push(refData[i].ref_dspl);
            }
            facilities.sort();
            setFacilityNames(facilities);
        }
    }

    useEffect(() => {
        window.addEventListener("scroll", changeBackground);
        // getFacilityNames();
        // if (facility) {
        //     const facilityArray = [];
        //     facilityArray.push(facility);
        //     setFacilitySingleSelections(facilityArray);
        // }
    }, []);

    // useEffect(() => {
    //     if (facilitySingleSelections) {
    //         dispatch(setFacility(facilitySingleSelections[0]));
    //     } else {
    //         dispatch(setFacility(""));
    //     }
    // }, [facilitySingleSelections]);

    const user = useSelector((state) => state.candidate.user);
    const menuOptions =
        user.role !== "CANDIDATE" ? employerMenuData : candidatesMenuData;

    return (
        // <!-- Main Header-->
        <header
            className={`main-header header-shaddow  ${
                navbar ? "fixed-header " : ""
            }`}
        >
            <div className="container-fluid">
                {/* <!-- Main box --> */}
                <div className="main-box">
                    {/* <!--Nav Outer --> */}
                    <div className="nav-outer">
                        <div className="logo-box">
                            <div className="logo">
                                <Image
                                    alt="brand"
                                    src="/images/logo.svg"
                                    width={154}
                                    height={50}
                                    priority
                                />
                            </div>
                        </div>
                        {/* End .logo-box */}

                        {/* {user.role !== "CANDIDATE" ? (
                            <div
                                className="vr"
                                style={{
                                    height: "60px",
                                    marginRight: "50px",
                                    marginTop: "15px",
                                }}
                            ></div>
                        ) : (
                            ""
                        )} */}

                        {/* <div className="outer-box">
                            {user.role !== "CANDIDATE" ? (
                                <Form>
                                    <Col>
                                        <Form.Group>
                                            <Typeahead
                                                id="facilityNames"
                                                onChange={
                                                    setFacilitySingleSelections
                                                }
                                                className="chosen-single form-input chosen-container"
                                                placeholder="Select Facility"
                                                options={facilityNames}
                                                selected={
                                                    facilitySingleSelections
                                                }
                                                style={{ minWidth: "300px" }}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Form>
                            ) : (
                                ""
                            )}
                        </div>
                        {user.role !== "CANDIDATE" ? (
                            <div className="option-box">
                                <a
                                    data-tooltip-id="facility-tooltip"
                                    data-tooltip-content="This is applicable to all admin pages, if you want to show data for all facilities then don't select any!"
                                >
                                    <span
                                        className="lar la-question-circle"
                                        style={{
                                            fontSize: "24px",
                                            margin: "5px",
                                        }}
                                    ></span>
                                </a>
                                <Tooltip id="facility-tooltip" />
                            </div>
                        ) : (
                            ""
                        )} */}
                        {/* End outer-box */}
                        {/* <HeaderNavContent /> */}
                        {/* <!-- Main Menu End--> */}
                    </div>
                    {/* End .nav-outer */}

                    <div className="outer-box">
                        {/* <button className="menu-btn">
              <span className="count">1</span>
              <span className="icon la la-heart-o"></span>
            </button> */}
                        {/* wishlisted menu */}

                        {/* <button className="menu-btn">
              <span className="icon la la-bell"></span>
            </button> */}
                        {/* End notification-icon */}

                        {/* <!-- Dashboard Option --> */}
                        <div className="dropdown dashboard-option">
                            <a
                                className="dropdown-toggle"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <Image
                                    alt="avatar"
                                    src="/images/icons/user.svg"
                                    width={20}
                                    height={20}
                                />
                                <span className="name">Hello, {user.name}</span>
                            </a>

                            <ul className="dropdown-menu">
                                {menuOptions.map((item) => {
                                    const isUserAllowed = item.access.includes(
                                        user.role
                                    );
                                    if (!isUserAllowed) {
                                        return null;
                                    }
                                    return (
                                        <li
                                            className={`${
                                                isActiveLink(
                                                    item.routePath,
                                                    router.asPath
                                                )
                                                    ? "active"
                                                    : ""
                                            } mb-1`}
                                            key={item.id}
                                        >
                                            <Link
                                                href={item.routePath}
                                                onClick={(e) => {
                                                    if (
                                                        item.name === "Logout"
                                                    ) {
                                                        logout(dispatch);
                                                    }
                                                }}
                                            >
                                                <i
                                                    className={`la ${item.icon}`}
                                                ></i>{" "}
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        {/* End dropdown */}
                    </div>
                    {/* End outer-box */}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
