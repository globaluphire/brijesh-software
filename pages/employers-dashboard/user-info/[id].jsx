/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Seo from "../../../components/common/Seo";
import UserInfo from "../../../components/dashboard-pages/employers-dashboard/user-info";
import { useSelector } from "react-redux";
import { supabase } from "../../../config/supabaseClient";

const UserInformation = () => {

    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);
    const userKeyID = router.query.id;

    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    const [fetchedUserData, setFetchedUserData] = useState({});

    const isEmployer = ["SUPER_ADMIN"].includes(user.role);

    useEffect(() => {
        if (!isEmployer) {
            Router.push("/404");
        }
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
            {isEmployer ? (
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
