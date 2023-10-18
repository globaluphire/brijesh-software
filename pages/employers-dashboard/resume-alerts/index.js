import dynamic from "next/dynamic";
import Seo from "../../../components/common/Seo";
import ResumeAlerts from "../../../components/dashboard-pages/employers-dashboard/resume-alerts";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Router from "next/router";

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
      {isEmployer ? (
        <>
          {" "}
          <Seo pageTitle="Resume Alerts" />
          <ResumeAlerts />
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
