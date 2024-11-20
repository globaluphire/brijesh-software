import React, { useEffect } from "react";
import { LayoutProvider } from "../layout/context/layoutcontext";
import Layout from "../layout/layout";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "../styles/layout/layout.scss";
import "../styles/demo/Demos.scss";
import { Provider } from "react-redux";
import { store } from "../app/store";
import { getDecryptedItem } from "../utils/encryptedStorage";
import { setUserData } from "../features/slice/initialStatesSlice";
import Router from "next/router";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (window.location.pathname !== "/") {
      try {
        const user = JSON.parse(getDecryptedItem("user"));
        if (user.id) {
          store.dispatch(setUserData(user));
        } else {
          console.log("Login first to access portal ", user);
          Router.push("/access");
        }
      } catch (e) {
        console.warn(e);
        console.log("Login first to access direct link ");
        Router.push("/access");
      }
    }
  }, []);

  if (Component.getLayout) {
    return (
      <LayoutProvider>
        {Component.getLayout(<Component {...pageProps} />)}
      </LayoutProvider>
    );
  } else {
    return (
      <LayoutProvider>
        <Provider store={store}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Provider>
      </LayoutProvider>
    );
  }
}
