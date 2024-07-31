/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../../components/common/Seo";
import Router from "next/router";
import { useEffect, useState } from "react";
import Orders from "../../../components/dashboard-pages/employers-dashboard/orders";
import { authenticate } from "../../../utils/authenticate";

const index = () => {
    const user = useSelector((state) => state.candidate.user);
    const dispatch = useDispatch();

    const [authenticated, setAuthenticated] = useState(false);
    const isEmployer = ["SUPER_ADMIN", "ADMIN"].includes(user.role);

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
                <>
                    {" "}
                    <Seo pageTitle="Orders" />
                    <Orders />
                </>
            ) : (
                ""
            )}
        </>
    );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
