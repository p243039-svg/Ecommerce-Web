import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/useSettingsStore";
// --- Classic Traditional Icons ---
const XIcon = () => (<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>);
const FacebookIcon = () => (<svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>);
const GoogleIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.63l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>);
export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [marketing, setMarketing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { signup, signInWithOAuth, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const settings = useSettingsStore();
    const validateForm = () => {
        if (!email || !username || !password)
            return "All fields are required";
        if (!/\S+@\S+\.\S+/.test(email))
            return "Enter a valid email address";
        if (password.length < 8)
            return "Password must be 8+ characters";
        return null;
    };
    const handleSignup = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError("");
        setSuccess("");
        const result = await signup(email, password, username, "");
        if (result.success) {
            setSuccess(`Account created. Welcome to ${settings.storeName}!`);
            setTimeout(() => navigate("/"), 2000);
        }
        else {
            setError(result.error || "Signup failed");
        }
    };
    const handleSocialLogin = async (provider) => {
        try {
            await signInWithOAuth(provider);
        }
        catch (err) {
            setError(err.message || "Social signup failed");
        }
    };
    return (<div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f4ebe0] px-4 py-20 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Subtle Texture Layer */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}/>
      
      {/* Soft Ambient Shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none"/>

      <div className="w-full max-w-[520px] relative z-10 animate-fade-in">
        <div className="bg-[#fffdfa] rounded-[32px] sm:rounded-[48px] p-8 md:p-16 border border-[#e2d6c5] shadow-[0_20px_50px_-12px_rgba(74,63,53,0.08)] relative overflow-hidden">
          
          <div className="text-center space-y-4 mb-14">
            <h1 className="text-4xl md:text-5xl font-serif text-[#4a3f35] italic tracking-tighter">{settings.storeName}</h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-6 bg-amber-300"/>
              <p className="text-[10px] md:text-[11px] font-black text-amber-800/60 uppercase tracking-[0.4em]">Create Account</p>
              <div className="h-[1px] w-6 bg-amber-300"/>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6 md:space-y-8">
            {error && (<div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                {error}
              </div>)}
            {success && (<div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-[10px] font-black uppercase tracking-widest text-center">
                {success}
              </div>)}

            <div className="space-y-6">
              {/* Name Field */}
              <div className="relative group/field text-left">
                <div className={cn("relative h-16 rounded-2xl border transition-all duration-500 flex items-center px-4 bg-white/40 backdrop-blur-sm", username ? "border-amber-800 shadow-[0_8px_30px_rgba(180,83,9,0.05)]" : "border-[#e2d6c5] group-focus-within/field:border-amber-800 group-focus-within/field:shadow-[0_8px_30px_rgba(180,83,9,0.08)]")}>
                  <User className={cn("w-4 h-4 transition-all duration-500 shrink-0 relative z-10", username ? "text-amber-800" : "text-[#bfb3a0]")}/>
                  <div className="relative flex-1 ml-4 h-full">
                    <label className={cn("absolute left-0 transition-all duration-500 pointer-events-none font-black uppercase tracking-[0.2em] text-[10px] z-20", username ? "-translate-y-8 opacity-100 text-amber-900 bg-[#fffdfa] px-2 -ml-2" : "translate-y-0 opacity-40 text-[#8c7e6c] group-focus-within/field:-translate-y-8 group-focus-within/field:opacity-100 group-focus-within/field:text-amber-900 group-focus-within/field:bg-[#fffdfa] group-focus-within/field:px-2 group-focus-within/field:-ml-2")} style={{ top: '50%' }}>
                      Full Name
                    </label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-full bg-transparent pt-2 text-[#4a3f35] text-sm outline-none font-medium placeholder:opacity-0 transition-all autofill:bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#fffdfa_inset] [&:-webkit-autofill]:text-[#4a3f35]" placeholder="Alexander Noble" required/>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="relative group/field text-left">
                <div className={cn("relative h-16 rounded-2xl border transition-all duration-500 flex items-center px-4 bg-white/40 backdrop-blur-sm", email ? "border-amber-800 shadow-[0_8px_30px_rgba(180,83,9,0.05)]" : "border-[#e2d6c5] group-focus-within/field:border-amber-800 group-focus-within/field:shadow-[0_8px_30px_rgba(180,83,9,0.08)]")}>
                  <Mail className={cn("w-4 h-4 transition-all duration-500 shrink-0 relative z-10", email ? "text-amber-800" : "text-[#bfb3a0]")}/>
                  <div className="relative flex-1 ml-4 h-full">
                    <label className={cn("absolute left-0 transition-all duration-500 pointer-events-none font-black uppercase tracking-[0.2em] text-[10px] z-20", email ? "-translate-y-8 opacity-100 text-amber-900 bg-[#fffdfa] px-2 -ml-2" : "translate-y-0 opacity-40 text-[#8c7e6c] group-focus-within/field:-translate-y-8 group-focus-within/field:opacity-100 group-focus-within/field:text-amber-900 group-focus-within/field:bg-[#fffdfa] group-focus-within/field:px-2 group-focus-within/field:-ml-2")} style={{ top: '50%' }}>
                      Email Address
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-full bg-transparent pt-2 text-[#4a3f35] text-sm outline-none font-medium placeholder:opacity-0 transition-all autofill:bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#fffdfa_inset] [&:-webkit-autofill]:text-[#4a3f35]" placeholder="name@example.com" required/>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="relative group/field text-left">
                <div className={cn("relative h-16 rounded-2xl border transition-all duration-500 flex items-center px-4 bg-white/40 backdrop-blur-sm", password ? "border-amber-800 shadow-[0_8px_30px_rgba(180,83,9,0.05)]" : "border-[#e2d6c5] group-focus-within/field:border-amber-800 group-focus-within/field:shadow-[0_8px_30px_rgba(180,83,9,0.08)]")}>
                  <Lock className={cn("w-4 h-4 transition-all duration-500 shrink-0 relative z-10", password ? "text-amber-800" : "text-[#bfb3a0]")}/>
                  <div className="relative flex-1 ml-4 h-full pr-10">
                    <label className={cn("absolute left-0 transition-all duration-500 pointer-events-none font-black uppercase tracking-[0.2em] text-[10px] z-20", password ? "-translate-y-8 opacity-100 text-amber-900 bg-[#fffdfa] px-2 -ml-2" : "translate-y-0 opacity-40 text-[#8c7e6c] group-focus-within/field:-translate-y-8 group-focus-within/field:opacity-100 group-focus-within/field:text-amber-900 group-focus-within/field:bg-[#fffdfa] group-focus-within/field:px-2 group-focus-within/field:-ml-2")} style={{ top: '50%' }}>
                      Password
                    </label>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-full bg-transparent pt-2 text-[#4a3f35] text-sm outline-none font-medium placeholder:opacity-0 transition-all autofill:bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#fffdfa_inset] [&:-webkit-autofill]:text-[#4a3f35]" required/>
                  </div>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bfb3a0] hover:text-amber-800 transition-colors z-20">
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>

                {/* 📜 Password Strength Meter */}
                <div className="grid grid-cols-2 gap-3 mt-6 px-1">
                  {[
            { label: "8+ Characters", met: password.length >= 8 },
            { label: "Uppercase", met: /[A-Z]/.test(password) },
            { label: "Numbers", met: /[0-9]/.test(password) },
            { label: "Symbols", met: /[^A-Za-z0-9]/.test(password) },
        ].map((req, i) => (<div key={i} className="flex items-center gap-2">
                       <div className={cn("w-1 h-1 rounded-full transition-all duration-700", req.met ? "bg-amber-800 scale-125" : "bg-amber-100")}/>
                       <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500", req.met ? "text-amber-900" : "text-[#bfb3a0]")}>{req.label}</span>
                    </div>))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-amber-50/30 border border-amber-100 rounded-2xl group/term cursor-pointer" onClick={() => setMarketing(!marketing)}>
              <div className={cn("mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0", marketing ? "bg-amber-800 border-amber-800" : "border-[#e2d6c5] group-hover/term:border-amber-400")}>
                {marketing && <ShieldCheck className="w-3 h-3 text-[#f4ebe0]"/>}
              </div>
              <label className="text-[10px] text-[#8c7e6c] font-black leading-relaxed uppercase tracking-[0.1em] cursor-pointer select-none">
                Receive marketing emails and exclusive updates
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl bg-[#4a3f35] text-[#f4ebe0] font-black text-[12px] uppercase tracking-[0.3em] shadow-lg hover:bg-amber-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]">
              {isLoading ? (<div className="w-4 h-4 border-2 border-[#f4ebe0]/20 border-t-[#f4ebe0] rounded-full animate-spin"/>) : (<>
                  Create Account
                  <ArrowRight className="w-4 h-4"/>
                </>)}
            </button>
          </form>

          {/* Social Synchronicity */}
          <div className="mt-14 space-y-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e2d6c5]/60"></div></div>
              <span className="relative px-6 bg-[#fffdfa] text-[9px] font-black text-[#bfb3a0] uppercase tracking-[0.4em]">Or sign up with</span>
            </div>

            <div className="flex justify-center gap-8">
              {[
            { provider: "google", icon: <GoogleIcon /> },
            { provider: "facebook", icon: <FacebookIcon /> },
            { provider: "twitter", icon: <XIcon /> },
        ].map((social) => (<button key={social.provider} onClick={() => handleSocialLogin(social.provider)} className="w-12 h-12 rounded-full border border-[#e2d6c5] flex items-center justify-center text-[#4a3f35] transition-all hover:border-amber-800 hover:text-amber-800 hover:scale-110">
                  {social.icon}
                </button>))}
            </div>
          </div>

          <div className="mt-16 text-center border-t border-[#e2d6c5]/40 pt-10">
            <p className="text-[10px] font-bold text-[#8c7e6c] uppercase tracking-widest leading-relaxed">
              Already have an account? <br className="sm:hidden"/>
              <Link to="/login" className="text-amber-900 hover:text-amber-700 transition-colors font-black decoration-amber-900/10 underline underline-offset-8 ml-1">Login</Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[9px] text-[#8c7e6c]/60 font-black uppercase tracking-[0.25em] max-w-[320px] mx-auto leading-relaxed">
          By signing up, you agree to our <Link to="/terms" className="text-[#8c7e6c] underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#8c7e6c] underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>);
}
