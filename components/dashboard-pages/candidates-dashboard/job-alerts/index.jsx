/* eslint-disable no-unused-vars */
import MobileMenu from "../../../header/MobileMenu";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import JobAlertsTable from "./components/JobAlertsTable";
import MenuToggler from "../../MenuToggler";
import DashboardHeader from "../../../header/DashboardHeader";

const index = () => {
    return (
        <div className="page-wrapper dashboard">
            <span className="header-span"></span>
            {/* <!-- Header Span for hight --> */}

            <LoginPopup />
            {/* End Login Popup Modal */}

            <DashboardHeader />
            {/* <DashboardCandidatesHeader /> */}
            {/* End Header */}

            <MobileMenu />
            {/* End MobileMenu */}

            <DashboardCandidatesSidebar />
            {/* <!-- End Candidates Sidebar Menu --> */}

            {/* <!-- Dashboard --> */}
            <section className="user-dashboard">
                <div className="dashboard-outer">
                    <BreadCrumb title="Job Alerts!" />
                    {/* breadCrumb */}

                    <MenuToggler />
                    {/* Collapsible sidebar button */}

                    <div className="row">
                        <div className="col-lg-12">
                            {/* <!-- Ls widget --> */}
                            <div className="ls-widget">
                                <JobAlertsTable />
                            </div>
                        </div>
                    </div>
                    {/* End .row */}
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

export default index;
