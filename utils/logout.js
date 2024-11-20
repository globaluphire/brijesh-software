import { setUserData } from "../features/slice/initialStatesSlice";
const logoutUtils = (dispatch) => {
  dispatch(
    setUserData({
      name: "",
      id: "",
      email: "",
      role: "",
      pickup_branch: "",
      drop_branch: "",
    })
  );

  localStorage.clear();

  // useRouter().push("/")
};

export { logoutUtils };
