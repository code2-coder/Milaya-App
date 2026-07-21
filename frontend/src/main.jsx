import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import App from "./App.jsx";
import "./styles/index.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <Provider store={store}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Provider>
  </ErrorBoundary>
);
