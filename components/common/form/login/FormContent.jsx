/* eslint-disable no-unused-vars */
import Link from "next/link";
import LoginWithSocial from "./LoginWithSocial";
import { auth } from "../firebase";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { supabase } from "../../../../config/supabaseClient";
import { setUserData } from "../../../../features/candidate/candidateSlice";
import { Router } from "next/router";

const signInWithEmailAndPassword = async (email, password, dispatch) => {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(
            email,
            password
        );
        const user = userCredential.user;
        // localStorage.setItem("userId", userId);
        const fetchUser = await supabase
            .from("users")
            .select()
            .ilike("user_id", user.uid);
        let userData = {};
        userData = fetchUser.data[0];

        dispatch(
            setUserData({
                name: userData.name,
                id: userData.user_id,
                email: userData.email,
                role: userData.role,
            })
        );
        document.getElementById("close-button").click();
        // open toast
        toast.success("Successfully logged in!", {
            position: "bottom-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });

        Router.push("/employers-dashboard/dashboard");
    } catch (err) {
        toast.error(
            "Please check your email address and password then try again!",
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
    }
};

const resetPassword = async (email) => {
    if (email) {
        try {
            await auth.sendPasswordResetEmail(email);
            // open toast
            toast.success(
                "Password reset link has been sent to your email address. Please check your inbox!",
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
        } catch (err) {
            toast.error(
                "Error on reset password request, Please try after some time or contact tech support!",
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
        }
    } else {
        toast.error(
            "Please fill your email address mention in form before click Forgot Password button",
            {
                position: "top-center",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            }
        );
    }
};

const FormContent = () => {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const dispatch = useDispatch();
    return (
        <div className="form-inner">
            <h3>Login to RAFTAAR PVT LTD</h3>

            {/* <!--Login Form--> */}
            <form method="post">
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="Global-UpHire-email"
                        placeholder="your email address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="Global-UpHire-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="password"
                        required
                    />
                </div>
                {/* password */}

                <div className="form-group">
                    <div className="field-outer">
                        <div className="input-group checkboxes square">
                            <input
                                type="checkbox"
                                name="remember-me"
                                id="remember"
                            />
                            <label htmlFor="remember" className="remember">
                                <span className="custom-checkbox"></span>{" "}
                                Remember me
                            </label>
                        </div>
                        <a
                            // href="#"
                            className="pwd"
                            onClick={() => {
                                resetPassword(loginEmail);
                            }}
                        >
                            Forgot password?
                        </a>
                    </div>
                </div>
                {/* forgot password */}

                <div className="form-group">
                    <button
                        className="theme-btn btn-style-one"
                        type="submit"
                        name="log-in"
                        onClick={(e) => {
                            e.preventDefault();
                            signInWithEmailAndPassword(
                                loginEmail,
                                loginPassword,
                                dispatch
                            );
                        }}
                    >
                        Log In
                    </button>
                </div>
                {/* login */}
            </form>
            {/* End form */}

            <div className="bottom-box">
                <div>
                    Don&apos;t have an account?{" "}
                    <Link
                        href="#"
                        className="call-modal signup"
                        data-bs-dismiss="modal"
                        data-bs-target="#registerModal"
                        data-bs-toggle="modal"
                    >
                        Sign Up
                    </Link>
                </div>

                <div className="divider">
                    <span>or</span>
                </div>

                <LoginWithSocial />
            </div>
            {/* End bottom-box LoginWithSocial */}
        </div>
    );
};

export default FormContent;
