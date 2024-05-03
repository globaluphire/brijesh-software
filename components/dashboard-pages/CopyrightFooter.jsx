const CopyrightFooter = () => {
    return (
        <div className="copyright-text">
            <p>
                © {new Date().getFullYear()} Raftaar Logistics{" "}
                {/* <a
          href="https://themeforest.net/user/ib-themes"
          target="_blank"
          rel="noopener noreferrer"
        >
          ib-themes
        </a> */}
                . All Rights Reserved.
            </p>
        </div>
    );
};

export default CopyrightFooter;
