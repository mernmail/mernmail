import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

export const ToastContext = createContext();

const ToastProvider = ({ children }) => {
  const [toastContent, setToastContent] = useState("");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShown(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [toastContent]);

  const toast = (content) => {
    setToastContent(content);
    setShown(true);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <p
        className={`${shown ? "block" : "hidden"} fixed top-16 left-5 right-5 md:top-auto md:bottom-5 bg-primary text-primary-foreground border-border border rounded-xl max-w-lg mx-auto p-2 text-center z-20`}
      >
        {toastContent}
      </p>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { ToastProvider };
