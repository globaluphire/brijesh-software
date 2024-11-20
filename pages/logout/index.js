import Router, { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logoutUtils } from "../../utils/logout";

const logout = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  logoutUtils(dispatch);

  Router.push("/");
};

export default logout;

