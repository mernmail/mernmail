import Logo from "@/components/Logo.jsx";

function LoginLayout() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="block w-full max-w-lg">
        <Logo width={500} height={100} />
      </div>
    </div>
  );
}

export default LoginLayout;
