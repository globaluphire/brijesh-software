/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import Seo from "../../../components/common/Seo";
import Router from "next/router";
import { useEffect } from "react";
import Billing from "../../../components/dashboard-pages/employers-dashboard/billing";

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
            {" "}
            {isEmployer ? (
                <>
                    {" "}
                    <Seo pageTitle="Billing" />
                    <Billing />
                </>
            ) : (
                ""
            )}
        </>
    );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
