/* eslint-disable no-unused-vars */
import dynamic from "next/dynamic";
import Seo from "../../../components/common/Seo";
import ShortListedJobs from "../../../components/dashboard-pages/candidates-dashboard/short-listed-jobs";

const index = () => {
    return (
        <>
            <Seo pageTitle="Short Listed Jobs" />
            <ShortListedJobs />
        </>
    );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
