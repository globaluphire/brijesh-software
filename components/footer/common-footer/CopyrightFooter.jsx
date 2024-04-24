const CopyrightFooter = () => {
    return (
        <div className="footer-bottom">
            <div className="auto-container">
                <div className="outer-box">
                    <div className="logo">
                        <a href="#">
                            <img
                                src="/images/logo-white.svg"
                                alt="brand"
                                width={154}
                                height={50}
                            />
                        </a>
                    </div>
                    <div className="copyright-text">
                        <p style={{ color: "#f5f5f5" }}>
                            © {new Date().getFullYear()} Volare Health. All
                            Rights Reserved.
                        </p>
                    </div>
                    <div className="contact-info">
                        {/* <span className="phone-num">
              <span>Call us</span>
              <a href="tel:1234567890">123 456 7890</a>
            </span> */}
                        {/* <span className="address">
              329 Queensberry Street, North Melbourne VIC <br />
              3051, Australia.
            </span> */}
                        <span style={{ color: "#f5f5f5" }}>Email us:</span>
                        <br />
                        <a
                            href="mailto:support@globaluphire.com"
                            className="email"
                            style={{ color: "#f5f5f5", fontFamily: "console" }}
                        >
                            <i>
                                <b>support@globaluphire.com</b>
                            </i>
                        </a>
                    </div>
                    {/* <div className="social-links">
            <Social />
          </div> */}
                </div>
            </div>
        </div>
    );
};

export default CopyrightFooter;
