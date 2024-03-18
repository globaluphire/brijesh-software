/* eslint-disable no-unused-vars */
import FormContent from "../../common/form/login/FormContent";
import LoginPopup from "../../common/form/login/LoginPopup";
import MobileMenu from "../../header/MobileMenu";
import Header from "./Header";
import DefaulHeader from "../../header/DefaulHeader";

const index = () => {
    return (
        <>
            <DefaulHeader />
            {/* <!--End Main Header -->  */}

            <LoginPopup />
            {/* End Login Popup Modal */}

            <MobileMenu />
            {/* End MobileMenu */}

            <div className="login-section">
                <div
                    className="image-layer"
                    style={{ backgroundImage: "url(images/background/12.jpg)" }}
                ></div>
                <div className="outer-box">
                    {/* <!-- Login Form --> */}
                    <div className="login-form default-form">
                        <FormContent />
                    </div>
                    {/* <!--End Login Form --> */}
                </div>
            </div>
            {/* <!-- End Info Section --> */}
        </>
    );
};

export default index;
