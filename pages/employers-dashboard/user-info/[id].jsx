/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Seo from "../../../components/common/Seo";
import UserInfo from "../../../components/dashboard-pages/employers-dashboard/user-info";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../config/supabaseClient";
import { authenticate } from "../../../utils/authenticate";

const UserInformation = () => {

    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);
    const userKeyID = router.query.id;

    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    const [fetchedUserData, setFetchedUserData] = useState({});

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

    async function fetchUser() {
        const { data, error } = await supabase
            .from("users")
            .select("name")
            .eq("user_key_id", userKeyID);

        if (data) {
            setFetchedUserData(data[0]);
        }
    };

    useEffect(() => {
        if (userKeyID) {
            fetchUser();
        }
    }, [userKeyID]);

    return (
        <>
            {" "}
            {authenticated ? (
                <>
                    {" "}
                    <Seo pageTitle="User Info" />
                    <UserInfo fetchedUserData={fetchedUserData}/>
                </>
            ) : (
                ""
            )}
        </>
    );
};

export default dynamic(() => Promise.resolve(UserInformation), {
    ssr: false,
});
