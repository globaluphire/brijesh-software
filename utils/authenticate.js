import { toast } from "react-toastify";
import { supabase } from "../config/supabaseClient";
import { setUserData } from "../features/candidate/candidateSlice";

const authenticate = async (userID, dispatch) => {

    try {
        const fetchUser = await supabase
            .from("users")
            .select("role, user_id, name, email, drop_branch, pickup_branch")
            .ilike("user_id", userID);

        let userData = {};
        userData = fetchUser.data[0];

        if (Object.keys(userData).length !== 0 && userData.role !== "NO ACCESS") {
            dispatch(
                setUserData({
                    name: userData.name,
                    id: userData.user_id,
                    email: userData.email,
                    role: userData.role,
                    pickup_branch: userData.pickup_branch,
                    drop_branch: userData.drop_branch
                })
            );

            return userData.role;
        } else {
            toast.error(
                "Oops!!! You are restricted. Try to Re-Login or contact tech support to recover your access...",
                {
                    position: "bottom-right",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                }
            );
            dispatch(
                setUserData({
                    name: "",
                    id: "",
                    email: "",
                    role: "",
                    pickup_branch: "",
                    drop_branch: ""
                })
            );
            localStorage.clear();
            return userData.role;
        }

        // return userData.role;

    } catch (err) {
        console.log(err);
    }

};

export { authenticate };
