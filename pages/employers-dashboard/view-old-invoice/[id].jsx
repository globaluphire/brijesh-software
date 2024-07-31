/* eslint-disable no-unused-vars */
// import Map from "../../../../Map";
import Select from "react-select";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPopup from "../../../components/common/form/login/LoginPopup";
import DashboardHeader from "../../../components/header/DashboardHeader";
import MobileMenu from "../../../components/header/MobileMenu";
import DashboardEmployerSidebar from "../../../components/header/DashboardEmployerSidebar";
import BreadCrumb from "../../../components/dashboard-pages/BreadCrumb";
import MenuToggler from "../../../components/dashboard-pages/MenuToggler";
import CopyrightFooter from "../../../components/dashboard-pages/CopyrightFooter";
import Router, { useRouter } from "next/router";
import DefaulHeader2 from "../../../components/header/DefaulHeader2";
import Index from "../../../components/dashboard-pages/employers-dashboard/view-old-invoice/index";
import { supabase } from "../../../config/supabaseClient";
import { authenticate } from "../../../utils/authenticate";

const ViewLR = () => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [fetchedJobData, setFetchedJobData] = useState({});
    const router = useRouter();
    const id = router.query.id;
    const dispatch = useDispatch();

    const [authenticated, setAuthenticated] = useState(false);
    const isEmployer = ["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role);

    useEffect(() => {
        authenticate(user.id, dispatch)
            .then((res) => {
                if (!isEmployer || res === "NO ACCESS") {
                    Router.push("/404");
                } else {
                    setAuthenticated(true);
                }
            });
    }, []);

    return (
        <>
            {" "}
            {authenticated ? (
                <div className="page-wrapper dashboard">
                    <span className="header-span"></span>
                    {/* <!-- Header Span for hight --> */}

                    <LoginPopup />
                    {/* End Login Popup Modal */}

                    {showLoginButton ? <DefaulHeader2 /> : <DashboardHeader />}
                    {/* <!--End Main Header --> */}

                    <MobileMenu />
                    {/* End MobileMenu */}

                    <DashboardEmployerSidebar />
                    {/* <!-- End User Sidebar Menu --> */}

                    {/* <!-- Dashboard --> */}
                    <section className="user-dashboard">
                        <div className="dashboard-outer">
                            <Index />
                        </div>
                        {/* End dashboard-outer */}
                    </section>
                    {/* <!-- End Dashboard --> */}

                    <CopyrightFooter />
                    {/* <!-- End Copyright --> */}
                </div>
            ) : (
                ""
            )};
        </>
    );
};

export default ViewLR;
