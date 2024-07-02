import "firebase/compat/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUserData } from "../../../../features/candidate/candidateSlice";
import { supabase } from "../../../../config/supabaseClient";

// const userRegistration = async (name, email, password) => {
//   try {
//     const res = await auth.createUserWithEmailAndPassword(email, password);
//     const user = res.user;
//     const db = getFirestore();
//     await addDoc(collection(db, "users"), {
//       uid: user.uid,
//       name,
//       email,
//       authProvider: "local",
//     });

//     console.log(user, "Register successfully");
//   } catch (err) {
//     alert(err.message);
//     // console.warn(err);
//   }
// };

const FormContent = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const dispatch = useDispatch();

    const validateForm = () => {
        let isValid = true;
        if (!name) {
            setNameError("Please enter your name");
            isValid = false;
        }
        if (!email) {
            setEmailError("Please enter your email address");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError("Please enter a valid email address");
            isValid = false;
        }
        if (!password) {
            setPasswordError("Please enter your password");
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters long");
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async () => {
        // e.preventDefault();
        if (validateForm()) {
            try {
                const res = await auth.createUserWithEmailAndPassword(
                    email,
                    password
                );
                const user = res.user;
                const fetchUser = await supabase
                    .from("users")
                    .select()
                    .ilike("user_id", user.uid);
                let userData = {};
                if (fetchUser.data.length === 0) {
                    userData = {
                        user_id: user.uid,
                        name,
                        photo_url: user.photoURL,
                        email,
                        auth_provider: "local",
                        role: "CANDIDATE",
                    };
                    await supabase.from("users").insert([userData]);
                    await supabase
                        .from("users_dtl")
                        .insert([{ user_id: user.uid }]);
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

                // TODO: close register popup
            } catch (err) {
                if (err.toString().includes("email-already-in-use")) {
                    // open toast
                    toast.error(
                        "Account already registered! Please try to log in",
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
                } else {
                    // open toast
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
        }
    };

    return (
        <>
            <div className="form-group">
                <label>Your Name</label>
                <input
                    type="text"
                    name="Global-UpHire-name"
                    placeholder="Enter first and last name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setNameError("");
                    }}
                    required
                />
                {nameError && <div className="error">{nameError}</div>}
            </div>
            <div className="form-group">
                <label>Email Address</label>
                <input
                    type="email"
                    name="Global-UpHire-email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                    }}
                    placeholder="Your Email"
                    required
                />
                {emailError && <div className="error">{emailError}</div>}
            </div>
            {/* name */}

            <div className="form-group">
                <label>Password</label>
                <input
                    id="password-field"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                    }}
                    placeholder="Password"
                />
                {passwordError && <div className="error">{passwordError}</div>}
            </div>
            {/* password */}

            <div className="form-group">
                <button
                    className="theme-btn btn-style-one"
                    type="submit"
                    onClick={handleSubmit}
                >
                    Register
                </button>
            </div>
            {/* login */}
        </>
    );
};

export default FormContent;
