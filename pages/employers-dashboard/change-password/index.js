/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Seo from "../../../components/common/Seo";
import ChangePassword from "../../../components/dashboard-pages/employers-dashboard/change-password";
import { useSelector } from "react-redux";
import Router from "next/router";
import { useEffect } from "react";

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
                    <Seo pageTitle="Change Password" />
                    <ChangePassword />
                </>
            ) : (
                ""
            )}
        </>
    );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
