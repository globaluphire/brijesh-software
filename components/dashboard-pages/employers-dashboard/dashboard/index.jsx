/* eslint-disable no-unused-vars */
import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import TopCardBlock from "./components/TopCardBlock";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import ReportCounts from "./components/ReportCounts";
import { useSelector } from "react-redux";

const Index = () => {
    const user = useSelector((state) => state.candidate.user);

    const greetingTime = require("greeting-time");
    
    return (
        <div className="page-wrapper dashboard">
            <span className="header-span"></span>
            {/* <!-- Header Span for hight --> */}

            <LoginPopup />
            {/* End Login Popup Modal */}

            <DashboardHeader />
            {/* End Header */}

            <MobileMenu />
            {/* End MobileMenu */}

            <DashboardEmployerSidebar />
            {/* <!-- End User Sidebar Menu --> */}

            {/* <!-- Dashboard --> */}
            <section className="user-dashboard">
                <div>
                    {/* <BreadCrumb title="Dashboard!" /> */}
                    {/* breadCrumb */}

                    <MenuToggler />
                    {/* Collapsible sidebar button */}

                    <div className="row">
                        <div className="col-lg-12">
                            {/* <!-- Ls widget --> */}
                            <div className="ls-widget">
                                <div className="tabs-box">
                                    <div className="widget-title">
                                        <h3><b>{ greetingTime(new Date()) }, {user.name}!</b></h3>
                                    </div>

                                    <div className="widget-content">
                                        {/* <TopCardBlock /> */}
                                        <ReportCounts />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* End .row top card block */}

                    {/* End .row profile and notificatins */}
                </div>
                {/* End dashboard-outer */}
            </section>
            {/* <!-- End Dashboard --> */}

            <CopyrightFooter />
            {/* <!-- End Copyright --> */}
        </div>
        // End page-wrapper
    );
};

export default Index;
