import LoginForm from "@/layouts/LoginForm.jsx";
import Loading from "@/layouts/Loading.jsx";
import MainLayout from "@/layouts/MainLayout.jsx";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "@/slices/authSlice.js";
import { useEffect } from "react";

function App() {
  const loading = useSelector((state) => state.auth.loading);
  const email = useSelector((state) => state.auth.email);
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(checkAuth);
    }, 500);

    const interval = setInterval(() => {
      dispatch(checkAuth);
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  } else if (email === null) {
    return <LoginForm />;
  } else {
    return <MainLayout />;
  }
}

export default App;
