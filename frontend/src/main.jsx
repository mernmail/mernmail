import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Loading from "./layouts/Loading.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import "@fontsource/inter";
import "./index.css";
import store from "./store.js";
import { Provider } from "react-redux";
import "./i18n.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <Suspense fallback={<Loading />}>
          <App />
        </Suspense>
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
