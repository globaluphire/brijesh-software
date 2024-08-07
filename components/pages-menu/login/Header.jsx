// eslint-disable-next-line no-unused-vars
import Link from "next/link";
import { useEffect, useState } from "react";

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
        <header
            className={`main-header ${
                navbar ? "fixed-header animated slideInDown" : ""
            }`}
        >
            <div className="container-fluid">
                {/* <!-- Main box --> */}
                <div className="main-box">
                    {/* <!--Nav Outer --> */}
                    <div className="nav-outer">
                        <div className="logo-box">
                            <div className="logo">
                                <img
                                    src="images/logo-white.svg"
                                    alt="logo"
                                    title="brand"
                                />
                                <img
                                    src="images/logo-1.svg"
                                    alt="logo"
                                    title="brand"
                                />
                            </div>
                        </div>
                    </div>
                    {/* End nav-outer */}

                    <div className="outer-box">
                        {/* <!-- Login/Register --> */}
                        <div className="btn-box">
                            <Link
                                href="/employers-dashboard/post-jobs"
                                className="theme-btn btn-style-one"
                            >
                                <span className="btn-title">Job Post</span>
                            </Link>
                        </div>
                    </div>
                    {/* End outer-box */}
                </div>
            </div>
        </header>
    );
};

export default Header;
