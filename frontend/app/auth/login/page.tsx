"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Loader2, Eye, EyeOff } from "lucide-react";
import { authService, getErrorMessage } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login({ email, password });
      // Redirect based on role
      if (result.roles.includes("ROLE_ADMIN")) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      const message = getErrorMessage(err);
      // If account not verified, redirect to verify page
      if (message.toLowerCase().includes("not verified") || message.toLowerCase().includes("otp")) {
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div
        className="hidden lg:block w-2/3 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('https://assets.identity.porsche.com/acul-screens/assets/images/bg.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/3 bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 lg:px-12 py-6 border-b border-gray-200">
          <div className="text-base font-medium tracking-[0.15em]">PORSCHE</div>
          <button className="text-gray-400 hover:text-black transition-colors">
            <Info size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-12 py-12">
          <div className="max-w-md mx-auto w-full space-y-8">
            {/* Heading */}
            <div>
              <h1 className="text-4xl font-light leading-tight mb-2">
                Log in with your Porsche ID
              </h1>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[2px] text-sm animate-in fade-in slide-in-from-top-1 duration-300">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-3"
                >
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder=""
                  className="w-full px-4 py-3 border border-gray-400 rounded-[2px] text-base focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-3"
                >
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder=""
                    className="w-full px-4 py-3 pr-12 border border-gray-400 rounded-[2px] text-base focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="cursor-pointer w-full bg-black text-white py-3 font-medium text-sm tracking-[1.28px] rounded-[2px] hover:bg-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm">
                Don&apos;t have a Porsche ID?{" "}
                <a
                  href="/auth/register"
                  className="underline hover:no-underline transition-all"
                >
                  Register now
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black text-white px-8 lg:px-12 py-6 text-center text-xs space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <span>© 2026 Porsche Sales & Marketplace, Inc.</span>
            <a href="#" className="underline hover:no-underline">
              Legal Notice
            </a>
            <a href="#" className="underline hover:no-underline">
              Business and Human Rights
            </a>
            <a href="#" className="underline hover:no-underline">
              Privacy Notice
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="underline hover:no-underline">
              California Privacy
            </a>
            <a href="#" className="underline hover:no-underline">
              Do Not Sell or Share My Personal Information
            </a>
            <a href="#" className="underline hover:no-underline">
              Cookie Policy
            </a>
            <a href="#" className="underline hover:no-underline">
              Accessibility Statement
            </a>
          </div>
          <div>
            <a href="#" className="underline hover:no-underline">
              Open Source Software Notice
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
