/* eslint-disable no-unused-vars */
import Aos from "aos";
import "aos/dist/aos.css";
import "../styles/index.scss";
import { useEffect } from "react";
import ScrollToTop from "../components/common/ScrollTop";
import { Provider } from "react-redux";
import { store } from "../app/store";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { getDecryptedItem } from "../utils/encryptedStorage";
import { setUserData } from "../features/candidate/candidateSlice";
import "react-tooltip/dist/react-tooltip.css";
import ErrorBoundary from "../components/error-boundry/errorBoundry";

if (typeof window !== "undefined") {
    require("bootstrap/dist/js/bootstrap");
}

function MyApp({ Component, pageProps }) {
    // aos animation activation

    useEffect(() => {
        Aos.init({
            duration: 1400,
            once: true,
        });
        try {
            const user = JSON.parse(getDecryptedItem("user"));
            if (user.id) {
                store.dispatch(setUserData(user));
            }
        } catch (e) {
            console.warn(e);
        }
    }, []);

    return (
        <Provider store={store}>
            <div className="page-wrapper">
                <ErrorBoundary>
                    <Component {...pageProps} />
                </ErrorBoundary>

                {/* Toastify */}
                <ToastContainer
                    position="bottom-right"
                    autoClose={500}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
                {/* <!-- Scroll To Top --> */}
                <ScrollToTop />
            </div>
        </Provider>
    );
}

export default MyApp;
