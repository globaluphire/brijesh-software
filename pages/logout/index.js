import Router, { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logoutUtils } from "../../utils/logout";
import dynamic from "next/dynamic";

const logout = dynamic(
    () => {
        const router = useRouter();
        const dispatch = useDispatch();

        logoutUtils(dispatch);

        Router.push("/");
    },
    { ssr: false }
);
export default logout;
