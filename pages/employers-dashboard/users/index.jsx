/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Seo from "../../../components/common/Seo";
import Users from "../../../components/dashboard-pages/employers-dashboard/users";
import { useDispatch, useSelector } from "react-redux";
import { authenticate } from "../../../utils/authenticate";

const ClientInformation = () => {

    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);
    const dispatch = useDispatch();

    const [authenticated, setAuthenticated] = useState(false);
    const isEmployer = ["SUPER_ADMIN"].includes(user.role);

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
