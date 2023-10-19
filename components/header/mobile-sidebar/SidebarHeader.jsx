// eslint-disable-next-line no-unused-vars
import Link from "next/link";

const SidebarHeader = () => {
    return (
        <div className="pro-header">
            <Link href="/">
                <img
                    src="images/logo.svg"
                    alt="brand"
                    width={154}
                    height={50}
                />
            </Link>
            {/* End logo */}

            <div
                className="fix-icon"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
            >
                <span className="flaticon-close"></span>
            </div>
            {/* icon close */}
        </div>
    );
};

export default SidebarHeader;
