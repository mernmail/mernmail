import Logo from "@/components/Logo.jsx";
import { Mail, Lock, LogIn } from "lucide-react";
import { useState } from "react";

function LoginLayout() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function loginFormSubmit() {
    const res = await fetch("/api/check", {
      method: "GET",
      headers: {
        Authorization: "Basic " + btoa(email.replace(/:/g, "") + ":" + password)
      }
    });
    const data = await res.json();
    if (res.status == 401) {
      alert("Can't authenticate! Reason: " + data.message);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="block w-full max-w-lg p-4">
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
            Email address
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
            Password
          </label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            id="login-password"
            placeholder="********"
            required
            className="w-full bg-accent text-accent-foreground px-2 py-1 mb-2 rounded-md focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline"
          />
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground p-2 mt-6 rounded-md"
          >
            <LogIn className="inline mr-2" size={24} />
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginLayout;
