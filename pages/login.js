/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Seo from "../components/common/Seo";
import LogIn from "../components/pages-menu/login";
import Router from "next/router";

const index = () => {

    const user = useSelector((state) => state.candidate.user);
    const isEmployer = ["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role);

    useEffect(() => {
        if (isEmployer) {
            Router.push("/employers-dashboard/dashboard");
        }
    }, []);

    return (
        <>
            <Seo pageTitle="Login" />
            <LogIn />
        </>
    );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
