/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Seo from "../../../components/common/Seo";
import ClientInfo from "../../../components/dashboard-pages/employers-dashboard/client-info";
import { useSelector } from "react-redux";
import { supabase } from "../../../config/supabaseClient";

const ClientInformation = () => {

    const router = useRouter();
    const user = useSelector((state) => state.candidate.user);
    const clientNumber = router.query.id;

    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    const [fetchedClientData, setFetchedClientData] = useState({});

    const isEmployer = ["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role);

    useEffect(() => {
        if (!isEmployer) {
            Router.push("/404");
        }
    }, []);

    async function fetchClientOrders() {
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
            fetchClientOrders();
        }
    }, [clientNumber]);

    return (
        <>
            {" "}
            {isEmployer ? (
                <>
                    {" "}
                    <Seo pageTitle="Client Info" />
                    <ClientInfo fetchedClientData={fetchedClientData}/>
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
