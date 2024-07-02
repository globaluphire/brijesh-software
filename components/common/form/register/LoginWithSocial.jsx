import { auth } from "../firebase";
import firebase from "firebase/compat/app";
import { setUserData } from "../../../../features/candidate/candidateSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { supabase } from "../../../../config/supabaseClient";

const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const signInWithGoogle = async (dispatch) => {
    try {
        const res = await auth.signInWithPopup(provider);
        const user = res.user;
        // const userRef = collection(db, "users");
        // const result = await getDocs(query(userRef, where("googleUid", "==", user.uid)));
        // if (result.empty) {
        //   await addDoc(collection(db, "users"), {
        //     googleUid: user.uid,
        //     name: user.displayName,
        //     photo: user.photoURL,
        //     email: user.email,
        //     authProvider: "google",
        //   });
        // }

        const fetchUser = await supabase
            .from("users")
            .select()
            .ilike("user_id", user.uid);
        let userData = {};
        if (fetchUser.data.length === 0) {
            userData = {
                user_id: user.uid,
                name: user.displayName,
                photo_url: user.photoURL,
                email: user.email,
                auth_provider: "google",
                role: "CANDIDATE",
            };
            await supabase.from("users").insert([userData]);
            await supabase.from("users_dtl").insert([{ user_id: user.uid }]);
        } else {
            userData = fetchUser.data[0];
        }

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
        document.getElementById("close-button-2").click();

        // open toast
        toast.success("Account Created Successfully", {
            position: "bottom-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
    } catch (err) {
        if (err.message.includes("found in field date in document users/")) {
            // open toast
            toast.error("Account already registered! Please try to log in", {
                position: "bottom-right",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        } else {
            // open toast
            console.error(err);
            toast.error(
                "System is unavailable. Please try again later or contact tech support!",
                {
                    position: "bottom-right",
                    autoClose: 8000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                }
            );
        }
    }
};
const LoginWithSocial = () => {
    const dispatch = useDispatch();

    return (
        <div className="btn-box row">
            {/* <div className="col-lg-6 col-md-12">
        <a href="#" className="theme-btn social-btn-two facebook-btn">
          <i className="fab fa-facebook-f"></i> Log In via Facebook
        </a>
      </div> */}
            <div className="col-lg-12 col-md-24">
                <a
                    href="#"
                    className="theme-btn social-btn-two google-btn"
                    onClick={() => signInWithGoogle(dispatch)}
                >
                    <i className="fab fa-google"></i> Log In via Gmail
                </a>
            </div>
        </div>
    );
};

export default LoginWithSocial;
