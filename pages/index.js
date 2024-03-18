/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import Login from "./login";

const index = () => {
    return (
        <>
            <Seo pageTitle="Home" />
            <Login />
        </>
    );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
