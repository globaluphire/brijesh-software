/* eslint-disable no-unused-vars */
import Link from "next/link";
// import jobs from "../../../data/job-featured";
import JobSelect from "../components/JobSelect";
import { useDispatch, useSelector } from "react-redux";
import {
    addCategory,
    addDatePosted,
    addDestination,
    addKeyword,
    addLocation,
    addFacility,
    addPerPage,
    addSalary,
    addSort,
    addTag,
    clearExperience,
    clearJobType,
} from "../../../features/filter/filterSlice";
import {
    clearDatePostToggle,
    clearExperienceToggle,
    clearJobTypeToggle,
} from "../../../features/job/jobSlice";
import { db } from "../../common/form/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../config/supabaseClient";
import { setSearchFields } from "../../../features/search/searchSlice";

const FilterJobsBox = () => {
    // console.log(useSelector((state) => state.filter))
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const searchTerm = useSelector((state) => state.search.searchTerm);
    // const searchAddress = useSelector((state) => state.search.searchAddress)
    const searchFacility = useSelector((state) => state.search.searchFacility);
    const pageSize = useSelector((state) => state.filter.jobSort.perPage.end);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const handlePageChange = (currentPage) => {
        setCurrentPage(currentPage);
    };

    // const searchJobsWithTermAndAddress = async () => {
    //     await supabase.from('jobs').select('*', { count: 'exact', head: true })
    //     .eq('status', 'Published')
    //     .ilike('job_title', '%'+searchTerm+'%')
    //     .ilike('job_address', '%'+searchAddress+'%')
    //     .then((res) => {
    //       setJobs(res.data)
    //     })
    //   };

    //   const searchJobsWithTerm = async () => {
    //     await supabase.from('jobs').select('*', { count: 'exact', head: true })
    //     .eq('status', 'Published')
    //     .ilike('job_title', '%'+searchTerm+'%')
    //     .then((res) => {
    //       setJobs(res.data)
    //     })
    //   };

    //   const searchJobsWithAddress = async () => {
    //     await supabase.from('jobs').select('*', { count: 'exact', head: true })
    //     .eq('status', 'Published')
    //     .ilike('job_address', '%'+searchAddress+'%')
    //     .then((res) => {
    //       setJobs(res.data)
    //     })
    //   };

    const searchJobs = async () => {
        let query = supabase.from("jobs").select("*", { count: "exact" });
        console.log("query:", query);
        // if(searchAddress) query = query.ilike('job_address', '%'+searchAddress+'%')
        if (searchFacility) query = query.eq("facility_name", searchFacility);
        if (searchTerm)
            query = query.ilike("job_title", "%" + searchTerm + "%");
        query = query.eq("status", "Published");
        query = query.order("created_at", { ascending: sort === "des" });
        if (pageSize <= totalRecords) {
            // 1
            query = query.range(
                (currentPage - 1) * pageSize,
                currentPage * pageSize - 1
            );
        }

        query.then((res) => {
            console.log(currentPage);
            console.log(res);
            // setJobs(res.data)
            if (jobs.length + res?.data?.length > totalRecords)
                setJobs(res.data);
            else setJobs([...jobs, ...res?.data]);
            setTotalRecords(res.count);
        });
    };

    //   const searchJobs = async () => {
    //     await supabase.from('jobs').select('*', { count: 'exact', head: true })
    //     .eq('status', 'Published')
    //     .then((res) => {
    //       setJobs(res.data)
    //       setTotalRecords(res.count)
    //     })
    //   };

    useEffect(() => {
        // if(searchAddress == "" && searchTerm == '')
        searchJobs();
        // else if(searchAddress == "")
        //   searchJobsWithTerm()
        // else if(searchTerm == "")
        //   searchJobsWithAddress()
        // else
        //   searchJobsWithTermAndAddress()
    }, [searchFacility, searchTerm, pageSize, currentPage]); // searchAddress

    const { jobList, jobSort } = useSelector((state) => state.filter);
    const {
        keyword,
        location,
        facility,
        destination,
        category,
        jobType,
        datePosted,
        experience,
        salary,
        tag,
        jobTypeSelect,
        experienceSelect,
    } = jobList || {};

    const { sort, perPage } = jobSort;

    const dispatch = useDispatch();

    // keyword filter on title
    const keywordFilter = (item) =>
        keyword !== ""
            ? item.jobTitle
                  .toLocaleLowerCase()
                  .includes(keyword.toLocaleLowerCase())
            : item;

    // location filter
    const locationFilter = (item) =>
        location !== ""
            ? item?.location
                  ?.toLocaleLowerCase()
                  .includes(location?.toLocaleLowerCase())
            : item;

    // location filter
    const destinationFilter = (item) =>
        item?.destination?.min >= destination?.min &&
        item?.destination?.max <= destination?.max;

    // category filter
    const categoryFilter = (item) =>
        category !== ""
            ? item?.category?.toLocaleLowerCase() ===
              category?.toLocaleLowerCase()
            : item;

    // job-type filter
    const jobTypeFilter = (item) =>
        jobType?.length !== 0 && item?.jobType !== undefined
            ? jobType?.includes(
                  item?.jobType[0]?.type
                      .toLocaleLowerCase()
                      .split(" ")
                      .join("-")
              )
            : item;

    // date-posted filter
    const datePostedFilter = (item) =>
        datePosted !== "all" && datePosted !== ""
            ? item?.created_at
                  ?.toLocaleLowerCase()
                  .split(" ")
                  .join("-")
                  .includes(datePosted)
            : item;

    // experience level filter
    const experienceFilter = (item) =>
        experience?.length !== 0
            ? experience?.includes(
                  item?.experience?.split(" ").join("-").toLocaleLowerCase()
              )
            : item;

    // salary filter
    const salaryFilter = (item) =>
        item?.totalSalary?.min >= salary?.min &&
        item?.totalSalary?.max <= salary?.max;

    // tag filter
    const tagFilter = (item) => (tag !== "" ? item?.tag === tag : item);

    // sort filter
    const sortFilter = (a, b) =>
        sort === "des" ? a.id > b.id && -1 : a.id < b.id && -1;

    const content = jobs
        // ?.filter(keywordFilter)
        // ?.filter(locationFilter)
        // ?.filter(destinationFilter)
        // ?.filter(categoryFilter)
        // ?.filter(jobTypeFilter)
        // ?.filter(datePostedFilter)
        // ?.filter(experienceFilter)
        // ?.filter(salaryFilter)
        // ?.filter(tagFilter)
        // ?.sort(sortFilter)
        // .slice(perPage.start, perPage.end !== 0 ? perPage.end : 11)
        ?.map((item) => (
            <div className="job-block" key={item.job_id}>
                <div className="inner-box">
                    <div className="content">
                        {/* <span className="company-logo">
                            <img src={item.logo} alt="item brand" />
                        </span> */}
                        <h4>
                            <Link href={`/job/${item.job_id}`}>
                                {item.job_title}
                            </Link>
                        </h4>

                        <ul className="job-info">
                            {/* <li>
                                <span className="icon flaticon-briefcase"></span>
                                {item.company}
                            </li> */}

                            {item?.job_comp_add ? (
                                <li className="mb-2">
                                    <i className="flaticon-map-locator"></i>{" "}
                                    {item?.job_comp_add}
                                </li>
                            ) : (
                                ""
                            )}
                            {/* compnay info */}
                            {item?.job_type ? (
                                <li className="time">
                                    <span className="flaticon-clock-3"></span>{" "}
                                    {item?.job_type}
                                </li>
                            ) : (
                                ""
                            )}
                            {/* location info */}
                            {/* <li>
                                <span className="icon flaticon-clock-3"></span>{" "}
                                {item.time}
                            </li> */}
                            {/* time info */}
                            {item?.salary ? (
                                <li className="privacy">
                                    <i className="flaticon-money"></i> $
                                    {item?.salary} {item?.salary_rate}
                                </li>
                            ) : (
                                ""
                            )}
                            {/* salary info */}
                        </ul>
                        {/* End .job-info */}

                        {/* <ul className="job-other-info">
                            {item?.jobType?.map((val, i) => (
                                <li key={i} className={`${val.styleClass}`}>
                                    {val.type}
                                </li>
                            ))}
                        </ul> */}
                        {/* End .job-other-info */}
                    </div>
                </div>
            </div>
            // End all jobs
        ));

    // sort handler
    const sortHandler = (e) => {
        dispatch(addSort(e.target.value));
    };

    // per page handler
    const perPageHandler = (e) => {
        const pageData = JSON.parse(e.target.value);
        dispatch(addPerPage(pageData));
    };

    // clear all filters
    const clearAll = () => {
        dispatch(addKeyword(""));
        dispatch(addLocation(""));
        dispatch(addFacility(""));
        dispatch(addDestination({ min: 0, max: 100 }));
        dispatch(addCategory(""));
        dispatch(clearJobType());
        dispatch(clearJobTypeToggle());
        dispatch(addDatePosted(""));
        dispatch(clearDatePostToggle());
        dispatch(clearExperience());
        dispatch(clearExperienceToggle());
        dispatch(addSalary({ min: 0, max: 20000 }));
        dispatch(addTag(""));
        dispatch(addSort(""));
        dispatch(addPerPage({ start: 0, end: 10 }));
        dispatch(setSearchFields({ searchTerm: "", searchFacility: "" })); // searchAddress: ""
    };

    const fnCall = async () => {
        let searchDate = null;
        const d = new Date();
        switch (datePosted) {
            case "last-24-hour":
                d.setDate(d.getDate() - 1);
                searchDate = d.toISOString();
                break;
            case "last-7-days":
                d.setDate(d.getDate() - 7);
                searchDate = d.toISOString();
                break;
            case "last-14-days":
                d.setDate(d.getDate() - 14);
                searchDate = d.toISOString();
                break;
            case "last-30-days":
                d.setDate(d.getDate() - 30);
                searchDate = d.toISOString();
                break;
        }
        let query = supabase.from("jobs").select().eq("status", "Published");
        if (jobTypeSelect) query = query.eq("job_type", jobTypeSelect);
        if (searchDate) query = query.gte("created_at", searchDate);
        query = query.eq("status", "Published");
        query = query.order("created_at", { ascending: sort === "des" });
        if (pageSize <= totalRecords || totalRecords === 0)
            query = query.range(
                (currentPage - 1) * pageSize,
                currentPage * pageSize - 1
            );

        const { data, error } = await query;
        if (data) {
            if (jobs.length + data.length > totalRecords)
                setJobs([...jobs, ...data]);
            else setJobs(data);
        }
    };
    useEffect(() => {
        fnCall();
    }, [jobTypeSelect, sort, datePosted]);

    //
    const showMoreJobs = () => {
        handlePageChange(currentPage + 1);
    };

    return (
        <>
            <div className="ls-switcher">
                <div className="show-result">
                    <div className="show-1023">
                        <button
                            type="button"
                            className="theme-btn toggle-filters "
                            data-bs-toggle="offcanvas"
                            data-bs-target="#filter-sidebar"
                        >
                            <span className="icon icon-filter"></span> Filter
                        </button>
                    </div>
                    {/* Collapsible sidebar button */}

                    <div className="text">
                        Showing <strong>{content?.length}</strong> jobs of{" "}
                        <strong>{totalRecords}</strong>
                    </div>
                </div>
                {/* End show-result */}

                <div className="sort-by">
                    {keyword !== "" ||
                    location !== "" ||
                    facility !== "" ||
                    destination?.min !== 0 ||
                    destination?.max !== 100 ||
                    category !== "" ||
                    jobType?.length !== 0 ||
                    datePosted !== "" ||
                    experience?.length !== 0 ||
                    salary?.min !== 0 ||
                    salary?.max !== 20000 ||
                    tag !== "" ||
                    sort !== "" ||
                    perPage.start !== 0 ||
                    perPage.end !== 10 ? (
                        <button
                            onClick={clearAll}
                            className="btn btn-danger text-nowrap me-2"
                            style={{ minHeight: "45px", marginBottom: "15px" }}
                        >
                            Clear All
                        </button>
                    ) : undefined}

                    <select
                        value={sort}
                        className="chosen-single form-select"
                        onChange={sortHandler}
                    >
                        <option value="">Sort by (default)</option>
                        <option value="asc">Newest</option>
                        <option value="des">Oldest</option>
                    </select>
                    {/* End select */}

                    <select
                        onChange={perPageHandler}
                        className="chosen-single form-select ms-3 "
                        value={JSON.stringify(perPage)}
                    >
                        <option
                            value={JSON.stringify({
                                start: 0,
                                end: 10,
                            })}
                        >
                            10 per page
                        </option>
                        <option
                            value={JSON.stringify({
                                start: 0,
                                end: 20,
                            })}
                        >
                            20 per page
                        </option>
                        <option
                            value={JSON.stringify({
                                start: 0,
                                end: 30,
                            })}
                        >
                            30 per page
                        </option>
                    </select>
                    {/* End select */}
                </div>
            </div>
            {/* End top filter bar box */}
            {content}
            {/* <!-- List Show More --> */}
            {/* <div className="ls-show-more">
                <p>Show {content?.length} of {totalRecords} Jobs</p>
                <div className="bar">
                    <span className="bar-inner" style={{ width: `${content?.length * 100 / totalRecords}%` }}></span>
                </div>
                {
                    content?.length == totalRecords ? '' : <button className="show-more" onClick={showMoreJobs}>Show More</button>
                }
            </div> */}
        </>
    );
};

export default FilterJobsBox;
