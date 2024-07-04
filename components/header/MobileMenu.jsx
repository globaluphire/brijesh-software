/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { useSelector } from "react-redux";
import MobileSidebar from "./mobile-sidebar";
import { supabase } from "../../config/supabaseClient";
import Router, { useRouter } from "next/router";

const MobileMenu = () => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);

    return (
        // <!-- Main Header-->
        <header className="main-header main-header-mobile">
            <div className="auto-container">
                {/* <!-- Main box --> */}
                <div className="inner-box">
                    <div className="nav-outer">
                        <div className="logo-box">
                            <div className="logo">
                                {/* <img src="/images/logo-1.svg" alt="brand" /> */}
                            </div>
                        </div>
                        {/* End .logo-box */}

                        <MobileSidebar />
                        {/* <!-- Main Menu End--> */}
                    </div>
                    {/* End .nav-outer */}

                    <div className="outer-box">
                        {showLoginButton ? (
                            <div className="login-box">
                                <a
                                    href="#"
                                    className="call-modal"
                                    data-bs-toggle="modal"
                                    data-bs-target="#loginPopupModal"
                                >
                                    <span className="icon icon-user"></span>
                                </a>
                            </div>
                        ) : (
                            // <a
                            //     href="#"
                            //     className="mobile-nav-toggler"
                            //     data-bs-toggle="offcanvas"
                            //     data-bs-target="#offcanvasMenu"
                            // >
                            //     <span className="flaticon-menu-1"></span>
                            // </a>
                            <div
                                style={{ display: "inline-flex" }}
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvasMenu"
                            >
                                <Image
                                    alt="avatar"
                                    className="thumb"
                                    src="/images/icons/user.svg"
                                    width={15}
                                    height={15}
                                    style={{ marginTop: "-5px" }}
                                />
                                <span
                                    style={{ marginLeft: "10px" }}
                                    className="name dropdown-toggle1"
                                ></span>
                                <span
                                    style={{ padding: "12px 0px" }}
                                >{user.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default MobileMenu;
