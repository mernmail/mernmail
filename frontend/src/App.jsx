import LoginForm from "@/layouts/LoginForm.jsx";
import Loading from "@/layouts/Loading.jsx";
import { useSelector, useDispatch } from "react-redux";
import { load, checkAuth } from "@/slices/authSlice.js";
import { useEffect } from "react";

function App() {
  const loading = useSelector((state) => state.auth.loading);
  const auth = useSelector((state) => state.auth.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(load);
    }, 500);

    const interval = setInterval(() => {
      dispatch(checkAuth);
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  } else if (auth === null) {
    return <LoginForm />;
  } else {
    return "Logged in";
  }
}

export default App;
