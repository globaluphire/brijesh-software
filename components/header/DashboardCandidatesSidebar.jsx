/* eslint-disable no-unused-vars */
import Link from "next/link";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import candidatesuData from "../../data/candidatesMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { menuToggle } from "../../features/toggle/toggleSlice";
import { logout } from "../../utils/logout";

const DashboardCandidatesSidebar = () => {
    const { menu } = useSelector((state) => state.toggle);
    const user = useSelector((state) => state.candidate.user);

    const percentage = 30;
    const router = useRouter();

    const dispatch = useDispatch();
    // menu togggle handler
    const menuToggleHandler = () => {
        dispatch(menuToggle());
    };

    return (
        <div className={`user-sidebar ${menu ? "sidebar_open" : ""}`}>
            {/* Start sidebar close icon */}
            <div className="pro-header text-end pb-0 mb-0 show-1023">
                <div className="fix-icon" onClick={menuToggleHandler}>
                    <span className="flaticon-close"></span>
                </div>
            </div>
            {/* End sidebar close icon */}

            <div className="sidebar-inner">
                <ul className="navigation">
                    {candidatesuData.map((item) => {
                        const isUserAllowed = item.access.includes(user.role);
                        if (!isUserAllowed) {
                            return null;
                        }
                        return (
                            <li
                                className={`${
                                    isActiveLink(item.routePath, router.asPath)
                                        ? "active"
                                        : ""
                                }`}
                                key={item.id}
                                onClick={menuToggleHandler}
                            >
                                <Link
                                    href={item.routePath}
                                    onClick={(e) => {
                                        if (item.name === "Logout") {
                                            logout(dispatch);
                                        }
                                    }}
                                >
                                    <i className={`la ${item.icon}`}></i>{" "}
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                {/* End navigation */}

                {/* <div className="skills-percentage">
                    <h4>Skills Percentage</h4>
                    <p>
                        `Put value for <strong>Cover Image</strong> field to
                        increase your skill up to <strong>85%</strong>`
                    </p>
                    <div style={{ width: 200, height: 200, margin: "auto" }}>
                        <CircularProgressbar
                            background
                            backgroundPadding={6}
                            styles={buildStyles({
                                backgroundColor: "#7367F0",
                                textColor: "#fff",
                                pathColor: "#fff",
                                trailColor: "transparent",
                            })}
                            value={percentage}
                            text={`${percentage}%`}
                        />
                    </div>{" "} */}
                {/* <!-- Pie Graph --> */}
                {/* </div> */}
            </div>
        </div>
    );
};

export default DashboardCandidatesSidebar;
