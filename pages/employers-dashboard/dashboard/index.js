/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Seo from "../../../components/common/Seo";
import DashboadHome from "../../../components/dashboard-pages/employers-dashboard/dashboard";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Router from "next/router";

const index = () => {
    const user = useSelector((state) => state.candidate.user);
    const isEmployer = ["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role);

    useEffect(() => {
        if (!isEmployer) {
            Router.push("/");
        }
    }, []);
    return (
        <>
            {isEmployer ? (
                <>
                    <Seo pageTitle="Employeers Dashboard" />
                    <DashboadHome />
                </>
            ) : (
                ""
            )}
        </>
    );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
