import "@/styles/globals.css";
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { StyleClass } from 'primereact/styleclass';
import { getDecryptedItem } from "@/utils/encryptedStorage";
import { setUserData } from "@/features/slice/initialStatesSlice";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/app/store";

export default function App({ Component, pageProps }) {
  const primereactConfig = {
    ripple: true,
  };

  useEffect(() => {
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
    <PrimeReactProvider value={primereactConfig}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </PrimeReactProvider>
  );
}
