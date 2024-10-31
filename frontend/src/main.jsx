import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import Loading from "./layouts/Loading.jsx";
import Error from "./layouts/Error.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import "@fontsource/inter";
import "./index.css";
import store from "./store.js";
import { Provider } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import "./i18n.js";

// eslint-disable-next-line react-refresh/only-export-components
const App = lazy(() => import("./App.jsx"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary fallback={<Error />}>
      <ThemeProvider>
        <ToastProvider>
          <Provider store={store}>
            <Suspense fallback={<Loading />}>
              <App />
            </Suspense>
          </Provider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
