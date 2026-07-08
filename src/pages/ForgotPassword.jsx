import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Mail, ArrowLeft, ShieldCheck, KeyRound, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/useSettingsStore";
export default function ForgotPasswordPage() {
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword, verifyOtp, updatePassword } = useAuthStore();
    const navigate = useNavigate();
    const settings = useSettingsStore();
    // Auto-verify OTP when 6 digits are entered
    useEffect(() => {
        if (otp.length === 6 && step === 'otp' && !isLoading) {
            const autoSubmit = async () => {
                setIsLoading(true);
                setError("");
                const result = await verifyOtp(email, otp, 'recovery');
                if (result.success) {
                    setStep('reset');
                }
                else {
                    setError("INVALID OR EXPIRED CODE");
                }
                setIsLoading(false);
            };
            autoSubmit();
        }
    }, [otp, step, email, verifyOtp, isLoading]);
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email)
            return setError("Email is required");
        setIsLoading(true);
        setError("");
        const result = await resetPassword(email);
        if (result.success) {
            setStep('otp');
        }
        else {
            setError(result.error?.toUpperCase() || "REQUEST FAILED");
        }
        setIsLoading(false);
    };
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp)
            return setError("Verification code is required");
        setIsLoading(true);
        setError("");
        const result = await verifyOtp(email, otp, 'recovery');
        if (result.success) {
            setStep('reset');
        }
        else {
            setError("INVALID OR EXPIRED CODE");
        }
        setIsLoading(false);
    };
    const handleSetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword)
            return setError("PASSWORDS DO NOT MATCH");
        if (newPassword.length < 8)
            return setError("PASSWORD TOO SHORT");
        setIsLoading(true);
        setError("");
        const result = await updatePassword(newPassword);
        if (result.success) {
            navigate("/login?reset=success");
        }
        else {
            setError(result.error?.toUpperCase() || "UPDATE FAILED");
        }
        setIsLoading(false);
    };
    return (<div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f4ebe0] px-4 py-20 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Subtle Texture Layer */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}/>
      
      {/* Soft Ambient Shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none"/>

      <div className="w-full max-w-[500px] relative z-10 animate-fade-in group text-center">
        {/* The Traditional Card */}
        <div className="bg-[#fffdfa] rounded-[48px] p-8 md:p-16 border border-[#e2d6c5] shadow-[0_20px_50px_-12px_rgba(74,63,53,0.08)] relative overflow-hidden">
          
          <div className="space-y-4 mb-14">
            <h1 className="text-4xl md:text-5xl font-serif text-[#4a3f35] italic tracking-tighter">{settings.storeName}</h1>
            {/* Traditional Progressledger */}
            <div className="flex justify-center items-center gap-4">
               <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-700", step === 'email' ? "bg-amber-800 scale-150 shadow-[0_0_8px_rgba(180,83,9,0.3)]" : "bg-amber-100")}/>
               <div className="w-10 h-[1px] bg-amber-100"/>
               <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-700", step === 'otp' ? "bg-amber-800 scale-150 shadow-[0_0_8px_rgba(180,83,9,0.3)]" : "bg-amber-100")}/>
               <div className="w-10 h-[1px] bg-amber-100"/>
               <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-700", step === 'reset' ? "bg-amber-800 scale-150 shadow-[0_0_8px_rgba(180,83,9,0.3)]" : "bg-amber-100")}/>
            </div>
            <p className="text-[10px] md:text-[11px] font-black text-amber-800/60 uppercase tracking-[0.4em]">
              {step === 'email' && "Reset Password"}
              {step === 'otp' && "Verify Identity"}
              {step === 'reset' && "Setup New Password"}
            </p>
          </div>

          {error && (<div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
              {error}
            </div>)}

          {step === 'email' && (<form onSubmit={handleRequestOtp} className="space-y-10">
              <div className="relative group/field text-left">
                <div className={cn("relative h-16 rounded-2xl border transition-all duration-500 flex items-center px-4 bg-white/40 backdrop-blur-sm", email ? "border-amber-800 shadow-[0_8px_30px_rgba(180,83,9,0.05)]" : "border-[#e2d6c5] group-focus-within/field:border-amber-800 group-focus-within/field:shadow-[0_8px_30px_rgba(180,83,9,0.08)]")}>
                  <Mail className={cn("w-4 h-4 transition-all duration-500 shrink-0 relative z-10", email ? "text-amber-800" : "text-[#bfb3a0]")}/>
                  <div className="relative flex-1 ml-4 h-full">
                    <label className={cn("absolute left-0 transition-all duration-500 pointer-events-none font-black uppercase tracking-[0.2em] text-[10px] z-20", email ? "-translate-y-8 opacity-100 text-amber-900 bg-[#fffdfa] px-2 -ml-2" : "translate-y-0 opacity-40 text-[#8c7e6c] group-focus-within/field:-translate-y-8 group-focus-within/field:opacity-100 group-focus-within/field:text-amber-900 group-focus-within/field:bg-[#fffdfa] group-focus-within/field:px-2 group-focus-within/field:-ml-2")} style={{ top: '50%' }}>
                      Email Address
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-full bg-transparent pt-2 text-[#4a3f35] text-sm outline-none font-medium placeholder:opacity-0 transition-all autofill:bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#fffdfa_inset] [&:-webkit-autofill]:text-[#4a3f35]" placeholder="alexander@noble.com" required/>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl bg-[#4a3f35] text-[#f4ebe0] font-black text-[12px] uppercase tracking-[0.3em] shadow-lg hover:bg-amber-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]">
                {isLoading ? "SENDING..." : (<>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4"/>
                  </>)}
              </button>
            </form>)}

          {step === 'otp' && (<form onSubmit={handleVerifyOtp} className="space-y-10">
              <div className="space-y-8">
                <p className="text-[10px] text-[#bfb3a0] font-bold uppercase tracking-widest leading-relaxed">Code sent to <br /> <span className="text-amber-800 underline decoration-amber-100 underline-offset-4">{email}</span></p>
                <div className="relative group/field max-w-md mx-auto">
                  {/* Visual 6-Box Grid */}
                  <div className="flex justify-between gap-2 sm:gap-3">
                    {[...Array(6)].map((_, i) => (<div key={i} className={cn("w-10 h-14 sm:w-14 sm:h-20 bg-[#fffdfa] border-2 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-black text-[#4a3f35] transition-all duration-300", otp[i]
                    ? "border-amber-800 shadow-[0_10px_25px_-5px_rgba(180,83,9,0.15)] bg-white"
                    : "border-[#e2d6c5] opacity-40 group-focus-within/field:opacity-60 shadow-inner")}>
                        {otp[i] || <span className="text-amber-200 opacity-50">0</span>}
                      </div>))}
                  </div>

                  {/* Operational Input (Hidden but Functional) */}
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer caret-transparent" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus/>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl bg-[#4a3f35] text-[#f4ebe0] font-black text-[12px] uppercase tracking-[0.3em] shadow-lg hover:bg-amber-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]">
                {isLoading ? "VERIFYING..." : (<>
                    Verify Code
                    <ShieldCheck className="w-4 h-4"/>
                  </>)}
              </button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-[10px] font-black text-[#bfb3a0] hover:text-amber-800 transition-colors uppercase tracking-[0.25em]">
                Change Email
              </button>
            </form>)}

          {step === 'reset' && (<form onSubmit={handleSetPassword} className="space-y-8">
              <div className="space-y-6 text-left">
                 {/* New Password Field */}
                 <div className="relative group/field">
                    <div className={cn("relative h-16 rounded-2xl border transition-all duration-500 flex items-center px-4 bg-white/40 backdrop-blur-sm", newPassword ? "border-amber-800 shadow-[0_8px_30px_rgba(180,83,9,0.05)]" : "border-[#e2d6c5] group-focus-within/field:border-amber-800 group-focus-within/field:shadow-[0_8px_30px_rgba(180,83,9,0.08)]")}>
                      <KeyRound className={cn("w-4 h-4 transition-all duration-500 shrink-0 relative z-10", newPassword ? "text-amber-800" : "text-[#bfb3a0]")}/>
                      <div className="relative flex-1 ml-4 h-full">
                        <label className={cn("absolute left-0 transition-all duration-500 pointer-events-none font-black uppercase tracking-[0.2em] text-[10px] z-20", newPassword ? "-translate-y-8 opacity-100 text-amber-900 bg-[#fffdfa] px-2 -ml-2" : "translate-y-0 opacity-40 text-[#8c7e6c] group-focus-within/field:-translate-y-8 group-focus-within/field:opacity-100 group-focus-within/field:text-amber-900 group-focus-within/field:bg-[#fffdfa] group-focus-within/field:px-2 group-focus-within/field:-ml-2")} style={{ top: '50%' }}>
                          New Password
                        </label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-full bg-transparent pt-2 text-[#4a3f35] text-sm outline-none font-medium placeholder:opacity-0 transition-all autofill:bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#fffdfa_inset] [&:-webkit-autofill]:text-[#4a3f35]" required/>
                      </div>
                    </div>
                 </div>

                 {/* Confirm Password Field */}
                 <div className="relative group/field">
                    <div className={cn("relative h-16 rounded-2xl border transition-all duration-500 flex items-center px-4 bg-white/40 backdrop-blur-sm", confirmPassword ? "border-amber-800 shadow-[0_8px_30px_rgba(180,83,9,0.05)]" : "border-[#e2d6c5] group-focus-within/field:border-amber-800 group-focus-within/field:shadow-[0_8px_30px_rgba(180,83,9,0.08)]")}>
                      <Lock className={cn("w-4 h-4 transition-all duration-500 shrink-0 relative z-10", confirmPassword ? "text-amber-800" : "text-[#bfb3a0]")}/>
                      <div className="relative flex-1 ml-4 h-full">
                        <label className={cn("absolute left-0 transition-all duration-500 pointer-events-none font-black uppercase tracking-[0.2em] text-[10px] z-20", confirmPassword ? "-translate-y-8 opacity-100 text-amber-900 bg-[#fffdfa] px-2 -ml-2" : "translate-y-0 opacity-40 text-[#8c7e6c] group-focus-within/field:-translate-y-8 group-focus-within/field:opacity-100 group-focus-within/field:text-amber-900 group-focus-within/field:bg-[#fffdfa] group-focus-within/field:px-2 group-focus-within/field:-ml-2")} style={{ top: '50%' }}>
                          Confirm Password
                        </label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-full bg-transparent pt-2 text-[#4a3f35] text-sm outline-none font-medium placeholder:opacity-0 transition-all autofill:bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#fffdfa_inset] [&:-webkit-autofill]:text-[#4a3f35]" required/>
                      </div>
                    </div>
                 </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl bg-[#4a3f35] text-[#f4ebe0] font-black text-[12px] uppercase tracking-[0.3em] shadow-lg hover:bg-amber-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]">
                {isLoading ? "UPDATING..." : (<>
                    Reset Password
                    <ArrowRight className="w-4 h-4"/>
                  </>)}
              </button>
            </form>)}

          <div className="mt-16 pt-10 border-t border-[#e2d6c5]/40 text-center">
            <Link to="/login" className="text-[10px] font-black text-[#bfb3a0] hover:text-amber-800 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.3em]">
              <ArrowLeft className="w-4 h-4"/> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
