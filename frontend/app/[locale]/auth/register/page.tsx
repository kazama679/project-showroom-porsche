"use client";

import { useState } from "react";
import { useRouter, Link } from '@/i18n/navigation';
import { Info, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { authService, getErrorMessage } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await authService.register({ fullName, username, email, password });
      setSuccess("Registration successful! Redirecting to verify your email...");
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-400 rounded-sm text-base focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block w-2/3 bg-cover bg-center relative" style={{ backgroundImage: `url('https://assets.identity.porsche.com/acul-screens/assets/images/bg.webp')`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="w-full lg:w-1/3 bg-white flex flex-col">
        <div className="flex items-center justify-between px-8 lg:px-12 py-6 border-b border-gray-200">
          <div className="text-base font-medium tracking-[0.15em]">PORSCHE</div>
          <button className="text-gray-400 hover:text-black transition-colors"><Info size={20} /></button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 lg:px-12 py-12 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <h1 className="text-4xl font-light leading-tight mb-2">Register with your Porsche ID</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-sm text-sm flex items-center gap-2">
                <CheckCircle size={16} />{success}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-3">Full Name <span className="text-red-600">*</span></label>
                <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} className={inputClass} />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-3">Username <span className="text-red-600">*</span></label>
                <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-3">Porsche ID (email) <span className="text-red-600">*</span></label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={inputClass} />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-3">Password <span className="text-red-600">*</span></label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className={inputClass + " pr-12"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || !fullName || !username || !email || !password}
                className="cursor-pointer w-full bg-black text-white py-3 font-medium text-sm tracking-[1.28px] rounded-sm hover:bg-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (<><Loader2 size={18} className="animate-spin" />Registering...</>) : "Continue"}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm">Already have a Porsche ID?{" "}<Link href="/auth/login" className="underline hover:no-underline transition-all">Log in now</Link></p>
            </div>
          </div>
        </div>

        <footer className="bg-black text-white px-8 lg:px-12 py-6 text-center text-xs space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <span>&copy; 2026 Porsche Sales &amp; Marketplace, Inc.</span>
            <a href="#" className="underline hover:no-underline">Legal Notice</a>
            <a href="#" className="underline hover:no-underline">Privacy Notice</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
