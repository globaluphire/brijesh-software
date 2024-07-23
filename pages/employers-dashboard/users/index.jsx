/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Seo from "../../../components/common/Seo";
import Users from "../../../components/dashboard-pages/employers-dashboard/users";
import { useSelector } from "react-redux";

const ClientInformation = () => {

    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);

    const isEmployer = ["SUPER_ADMIN"].includes(user.role);

    useEffect(() => {
        if (!isEmployer) {
            Router.push("/404");
        }
    }, []);

    return (
        <>
            {" "}
            {isEmployer ? (
                <>
                    {" "}
                    <Seo pageTitle="Users Info" />
                    <Users />
                </>
            ) : (
                ""
            )}
        </>
    );
};

export default dynamic(() => Promise.resolve(ClientInformation), {
    ssr: false,
});
