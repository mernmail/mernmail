import Logo from "@/components/Logo.jsx";
import { Mail, Lock, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/slices/authSlice.js";
import { useTranslation } from "react-i18next";

function LoginLayout() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const error = useSelector((state) => state.auth.error);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("login") + " - MERNMail";
  }, [t]);

  async function loginFormSubmit() {
    dispatch(login(email, password));
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="block w-full max-w-lg p-4">
        <span className="sr-only">MERNMail logo</span>
        <Logo
          width={500}
          height={100}
          className="max-w-md w-full mx-auto box-border mb-8"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginFormSubmit(e);
          }}
        >
          <label htmlFor="login-email" className="block my-1">
            <Mail className="inline mr-2" size={24} />
            {t("emailaddress")}
          </label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            id="login-email"
            placeholder="john.smith@example.com"
            required
            className="w-full bg-accent text-accent-foreground px-2 py-1 mb-2 rounded-md focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline"
          />
          <label htmlFor="login-password" className="block my-1">
            <Lock className="inline mr-2" size={24} />
            {t("password")}
          </label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            id="login-password"
            placeholder="********"
            required
            className="w-full bg-accent text-accent-foreground px-2 py-1 mb-2 rounded-md focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline"
          />
          {error ? (
            <p className="text-red-500 block text-center">
              {t("cantlogin")} {error}
            </p>
          ) : (
            ""
          )}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground p-2 mt-6 rounded-md hover:bg-primary/75 transition-colors"
          >
            <LogIn className="inline mr-2" size={24} />
            {t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginLayout;
