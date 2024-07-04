/* eslint-disable no-unused-vars */
import Link from "next/link";
import Social from "./common-footer/Social";

const CopyrightFooter2 = () => {
    return (
        <div className="footer-bottom">
            <div className="auto-container">
                <div className="outer-box">
                    <div className="bottom-left">
                        <div className="logo">
                            <img
                                src="images/logo-1.svg"
                                alt="brand"
                                width={154}
                                height={50}
                            />
                        </div>
                        <div className="copyright-text">
                            © {new Date().getFullYear()} Volare Health{" "}
                            {/* <a
                href="https://themeforest.net/user/ib-themes"
                target="_blank"
                rel="noopener noreferrer"
              >
                ib-themes
              </a> */}
                            . All Rights Reserved.
                        </div>
                    </div>

                    <div className="social-links">
                        <Social />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CopyrightFooter2;
