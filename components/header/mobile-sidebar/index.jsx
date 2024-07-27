/* eslint-disable no-unused-vars */
"use client";
import Link from "next/link";
import {
    ProSidebarProvider,
    Sidebar,
    Menu,
    MenuItem,
    SubMenu,
} from "react-pro-sidebar";

import mobileMenuData from "../../../data/mobileMenuData";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import {
    isActiveLink,
    isActiveParentChaild,
} from "../../../utils/linkActiveChecker";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import employerMenuData from "../../../data/employerMenuData";
import candidatesMenuData from "../../../data/candidatesMenuData";
import { logout } from "../../../utils/logout";
import { Typeahead } from "react-bootstrap-typeahead";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { setFacility } from "../../../features/employer/employerSlice";
import { Tooltip } from "react-tooltip";
import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabaseClient";

const Index = () => {
    // global states
    const facility = useSelector((state) => state.employer.facility.payload);

    // set initial facility value
    const localStorageFacilityArray = [];
    if (facility) {
        localStorageFacilityArray.push(facility);
    }

    const [facilityNames, setFacilityNames] = useState([]);
    const [facilitySingleSelections, setFacilitySingleSelections] = useState(
        localStorageFacilityArray
    );

    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.candidate.user);
    const menuOptions =
        user.role !== "CANDIDATE" ? employerMenuData : candidatesMenuData;

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

    // useEffect(() => {
    //     getFacilityNames();
    //     if (facility) {
    //         const facilityArray = [];
    //         facilityArray.push(facility);
    //         setFacilitySingleSelections(facilityArray);
    //     }
    // }, []);

    // useEffect(() => {
    //     if (facilitySingleSelections) {
    //         dispatch(setFacility(facilitySingleSelections[0]));
    //     } else {
    //         dispatch(setFacility(""));
    //     }
    // }, [facilitySingleSelections]);

    return (
        <div
            className="offcanvas offcanvas-start mobile_menu-contnet"
            tabIndex="-1"
            id="offcanvasMenu"
            data-bs-scroll="true"
            style={{ backgroundColor: "#E9EFFB" }}
        >
            <SidebarHeader />
            {/* End pro-header */}

            <ProSidebarProvider>
                {/* <div className="outer-box">
                    {user.role !== "CANDIDATE" ? (
                        <Form>
                            <Col>
                                <Form.Group>
                                    <Typeahead
                                        id="facilityNames"
                                        onChange={setFacilitySingleSelections}
                                        className="chosen-single form-input chosen-container"
                                        placeholder="Select Facility"
                                        options={facilityNames}
                                        selected={facilitySingleSelections}
                                        style={{ minWidth: "300px" }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Form>
                    ) : (
                        ""
                    )}
                </div> */}
                {/* {user.role !== "CANDIDATE" ? (
                    <div className="option-box">
                        <a
                            data-tooltip-id="facility-tooltip"
                            data-tooltip-content="This is applicable to all admin pages, if you want to show data for all facilities then don't select any!"
                        >
                            <span
                                className="lar la-question-circle"
                                style={{ fontSize: "24px", margin: "5px 10px" }}
                            ></span>
                        </a>
                        <Tooltip id="facility-tooltip" />
                    </div>
                ) : (
                    ""
                )} */}
                {/* <Sidebar> */}
                {user ? (
                    <Menu>
                        {menuOptions.map((menuItem, i) => {
                            const isUserAllowed = menuItem.access?.includes(
                                user.role
                            );
                            if (!isUserAllowed) {
                                return null;
                            }
                            return (
                                <MenuItem
                                    className={
                                        isActiveLink(
                                            menuItem.routePath,
                                            router.asPath
                                        )
                                            ? "menu-active-link"
                                            : ""
                                    }
                                    key={i}
                                    routerLink={
                                        <Link
                                            href={menuItem.routePath}
                                            onClick={(e) => {
                                                if (
                                                    menuItem.name === "Logout"
                                                ) {
                                                    logout(dispatch);
                                                }
                                            }}
                                        />
                                    }
                                >
                                    {menuItem.name}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                ) : (
                    ""
                )}
                {/* </Sidebar> */}
            </ProSidebarProvider>

            <SidebarFooter />
        </div>
    );
};

export default Index;
