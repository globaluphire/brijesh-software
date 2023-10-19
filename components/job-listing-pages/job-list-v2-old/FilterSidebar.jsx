/* eslint-disable no-unused-vars */
import DatePosted from "../components/DatePosted";
import JobType from "../components/JobType";
import { useDispatch, useSelector } from "react-redux";

const FilterSidebar = () => {
    const { jobList } = useSelector((state) => state.filter);
    const { jobTypeList, datePost, experienceLavel } = useSelector(
        (state) => state.job
    );
    const dispatch = useDispatch();

    return (
        <div className="inner-column">
            <div className="filters-outer">
                <button
                    type="button"
                    className="btn-close text-reset close-filters show-1023"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
                {/* End .close filter */}

                <div className="switchbox-outer">
                    <h4>Job type</h4>
                    <JobType />
                </div>
                {/* <!-- Switchbox Outer --> */}

                <div className="checkbox-outer">
                    <h4>Date Posted</h4>
                    <DatePosted />
                </div>
                {/* <!-- Checkboxes Ouer --> */}

                {/* <div className="checkbox-outer">
                    <h4>Experience Level</h4>
                    <ExperienceLevel />
                </div> */}
                {/* <!-- Checkboxes Ouer --> */}

                {/* <div className="filter-block">
                    <h4>Salary</h4>

                    <SalaryRangeSlider />
                </div> */}
                {/* <!-- Filter Block --> */}

                {/* <div className="filter-block">
                    <h4>Tags</h4>
                    <Tag />
                </div> */}
                {/* <!-- Filter Block --> */}
            </div>
            {/* Filter Outer */}

            {/* <CallToActions /> */}
            {/* <!-- End Call To Action --> */}
        </div>
    );
};

export default FilterSidebar;
