/* eslint-disable no-unused-vars */
// import Map from "../../../../Map";
import Select from "react-select";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPopup from "../../../../components/common/form/login/LoginPopup";
import DashboardHeader from "../../../../components/header/DashboardHeader";
import MobileMenu from "../../../../components/header/MobileMenu";
import DashboardEmployerSidebar from "../../../../components/header/DashboardEmployerSidebar";
import BreadCrumb from "../../../../components/dashboard-pages/BreadCrumb";
import MenuToggler from "../../../../components/dashboard-pages/MenuToggler";
import CopyrightFooter from "../../../../components/dashboard-pages/CopyrightFooter";
import Router, { useRouter } from "next/router";
import DefaulHeader2 from "../../../../components/header/DefaulHeader2";
import ClientTotalBillings from "../../../../components/dashboard-pages/employers-dashboard/clients/total-billings/ClientTotalBillings";
import { supabase } from "../../../../config/supabaseClient";

const ClientBilling = () => {
    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const router = useRouter();
    const clientNumber = router.query.id;
    const isEmployer = ["SUPER_ADMIN", "ADMIN"].includes(user.role);

    const[fetchedClientData, setFetchedClientData] = useState({});

    useEffect(() => {
        if (!isEmployer) {
            Router.push("/404");
        }
    }, []);

    async function fetchClientBilling() {
        const { data, error } = await supabase
            .from("client")
            .select("client_name")
            .eq("client_number", clientNumber);

        if (data) {
            setFetchedClientData(data[0]);
        }
    };

    useEffect(() => {
        if (clientNumber) {
            fetchClientBilling();
        }
    }, [clientNumber]);

    return (
        <>
            {" "}
            { isEmployer ? (
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

                            <MenuToggler />
                            {/* Collapsible sidebar button */}

                            <div className="row">
                                <div className="col-lg-12">
                                    {/* <!-- Ls widget --> */}
                                    <div className="ls-widget">
                                        <div className="tabs-box">
                                            <div className="widget-title">
                                                <h4>Orders Billing of <b><i><u>{fetchedClientData.client_name}</u></i></b> </h4>
                                            </div>

                                            <div className="widget-content">
                                                { Object.keys(fetchedClientData).length !== 0 ? (
                                                    <ClientTotalBillings fetchedClientData={fetchedClientData}/>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        </div>
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
            ) : (
                // End page-wrapper
                ""
            )};
        </>
    );
};

export default ClientBilling;
