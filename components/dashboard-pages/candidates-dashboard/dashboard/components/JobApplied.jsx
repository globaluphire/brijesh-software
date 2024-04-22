/* eslint-disable no-unused-vars */
import Link from "next/link";
import { supabase } from "../../../../../config/supabaseClient";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BallTriangle } from "react-loader-spinner";

const JobApplied = () => {
    const [applications, setApplications] = useState([]);
    const [searchField, setSearchField] = useState("");
    const [rpp, setRpp] = useState(20);
    const [arrPages, setArrPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const user = useSelector((state) => state.candidate.user);

    const dateFormat = (val) => {
        const date = new Date(val);
        return (
            date.toLocaleDateString("en-IN", {
                month: "long",
                day: "numeric",
            }) +
            ", " +
            date.getFullYear()
        );
    };

    async function findAppliedJob() {
        const { data, error } = await supabase
            .from("applicants_view")
            .select()
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(0, 10);

        if (data) {
            console.log("Data", data);
            data.forEach(
                (job) => (job.created_at = dateFormat(job.created_at))
            );
            setApplications(
                data.filter((job) =>
                    job.job_title
                        .toLowerCase()
                        .includes(searchField.toLowerCase())
                )
            );
        }
        setIsLoading(false);
    }

    useEffect(() => {
        setIsLoading(true);
        findAppliedJob(currentPage);
    }, []);

    return (
        <>
            {isLoading && (
                <div style={{ width: "20%", margin: "auto" }}>
                    <BallTriangle
                        height={100}
                        width={100}
                        radius={5}
                        color="#000"
                        ariaLabel="ball-triangle-loading"
                        wrapperClass={{}}
                        wrapperStyle=""
                        visible={true}
                    />
                </div>
            )}

            {isLoading === false && applications.length === 0 ? (
                <p style={{ fontSize: "1rem", fontWeight: "500" }}>
                    <center>You have not applied to any jobs yet!</center>
                </p>
            ) : (
                <div className="widget-content">
                    <div className="table-outer">
                        <div className="table-outer">
                            <table className="default-table manage-job-table">
                                <thead>
                                    <tr>
                                        <th>Job Title</th>
                                        <th>Date Applied</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {applications.slice(0, 4).map((item) => (
                                        <tr key={item.application_id}>
                                            <td>
                                                <div className="job-block">
                                                    <div className="inner-box">
                                                        <div>
                                                            <h4>
                                                                <Link
                                                                    href={`/job/${item.job_id}`}
                                                                >
                                                                    {
                                                                        item.job_title
                                                                    }
                                                                </Link>
                                                            </h4>
                                                            <ul className="job-info">
                                                                {item?.job_type ? (
                                                                    <li>
                                                                        <span className="icon flaticon-clock-3"></span>
                                                                        {
                                                                            item?.job_type
                                                                        }
                                                                    </li>
                                                                ) : (
                                                                    ""
                                                                )}
                                                                {item?.job_address ? (
                                                                    <li>
                                                                        <span className="icon flaticon-map-locator"></span>
                                                                        {
                                                                            item?.job_address
                                                                        }
                                                                    </li>
                                                                ) : (
                                                                    ""
                                                                )}
                                                                {item?.salary ? (
                                                                    <li>
                                                                        <span className="icon flaticon-money"></span>{" "}
                                                                        $
                                                                        {
                                                                            item?.salary
                                                                        }{" "}
                                                                        {
                                                                            item?.salary_rate
                                                                        }
                                                                    </li>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.created_at}</td>
                                            {item.status === "Qualified" ? (
                                                <td className="status">
                                                    {item.status}
                                                </td>
                                            ) : item.status ===
                                              "Not Qualified" ? (
                                                    <td
                                                        className="status"
                                                        style={{ color: "red" }}
                                                    >
                                                        {item.status}
                                                    </td>
                                                ) : item.status == null ? (
                                                    <td className="pending">
                                                    Pending
                                                    </td>
                                                ) : (
                                                    <td className="pending">
                                                        {item.status}
                                                    </td>
                                                )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* {recentJobApplied.slice(0, 6).map((item) => (
        <div className="job-block col-lg-6 col-md-12 col-sm-12" key={item.id}>
          <div className="inner-box">
            <div className="content">
              <span className="company-logo">
                <img src={item.logo} alt="item brand" />
              </span>
              <h4>
                <Link href={`/job-single-v1/${item.id}`}>{item.jobTitle}</Link>
              </h4>

              <ul className="job-info">
                <li>
                  <span className="icon flaticon-briefcase"></span>
                  {item.company}
                </li>
                <li>
                  <span className="icon flaticon-map-locator"></span>
                  {item.location}
                </li>
                <li>
                  <span className="icon flaticon-clock-3"></span> {item.time}
                </li>
                <li>
                  <span className="icon flaticon-money"></span> {item.salary}
                </li>
              </ul>
              <ul className="job-other-info">
                {item.jobType.map((val, i) => (
                  <li key={i} className={`${val.styleClass}`}>
                    {val.type}
                  </li>
                ))}
              </ul>
              <button className="bookmark-btn">
                <span className="flaticon-bookmark"></span>
              </button>
            </div>
          </div>
        </div>
      ))} */}
        </>
    );
};

export default JobApplied;
