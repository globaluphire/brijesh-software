/* eslint-disable no-unused-vars */
import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderNavContent from "../header/HeaderNavContent";
import Image from "next/image";

const Header = () => {
    const [navbar, setNavbar] = useState(false);

    const changeBackground = () => {
        if (window.scrollY >= 10) {
            setNavbar(true);
        } else {
            setNavbar(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", changeBackground);
    }, []);

    return (
        // <!-- Main Header-->
        <header
            className={`main-header header-style-two alternate2 ${
                navbar ? "fixed-header animated slideInDown" : ""
            }`}
        >
            <div className="auto-container">
                {/* <!-- Main box --> */}
                <div className="main-box">
                    {/* <!--Nav Outer --> */}
                    <div className="nav-outer">
                        <div className="logo-box">
                            <div className="logo">
                                <Image
                                    src="/images/logo.svg"
                                    alt="brand"
                                    width={174}
                                    height={70}
                                    priority
                                />
                            </div>
                        </div>
                        {/* End .logo-box */}

                        {/* <HeaderNavContent /> */}
                        {/* <!-- Main Menu End--> */}
                    </div>
                    {/* End .nav-outer */}

                    <div className="outer-box">
                        <div className="btn-box">
                            <a
                                href="#"
                                className="theme-btn btn-style-one call-modal"
                                data-bs-toggle="modal"
                                data-bs-target="#loginPopupModal"
                            >
                                Login / Register
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
