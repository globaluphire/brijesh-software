// eslint-disable-next-line no-unused-vars
import Link from "next/link";
import employerMenuData from "../../data/employerMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { menuToggle } from "../../features/toggle/toggleSlice";
import { logout } from "../../utils/logout";

const DashboardEmployerSidebar = () => {
    const router = useRouter();
    const { menu } = useSelector((state) => state.toggle);
    const user = useSelector((state) => state.candidate.user);

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
                    {employerMenuData.map((item) => {
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
            </div>
        </div>
    );
};

export default DashboardEmployerSidebar;
