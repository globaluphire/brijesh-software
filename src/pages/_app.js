import "@/styles/globals.css";
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { StyleClass } from 'primereact/styleclass';

export default function App({ Component, pageProps }) {
  const primereactConfig = {
    ripple: true,
  };
  return (
    <PrimeReactProvider value={primereactConfig}>
      <Component {...pageProps} />
    </PrimeReactProvider>
  );
}
