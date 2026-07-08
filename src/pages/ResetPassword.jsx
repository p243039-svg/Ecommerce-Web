import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettingsStore } from "@/stores/useSettingsStore";
export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const { updatePassword, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const settings = useSettingsStore();
    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        const result = await updatePassword(password);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        }
        else {
            setError(result.error || "Failed to update password");
        }
    };
    if (success) {
        return (<div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary animate-bounce-short"/>
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Password Updated</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Your credentials have been successfully restored. 
            Redirecting you to the safe haven...
          </p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-gold/5 opacity-50"/>
      
      <div className="w-full max-w-xl relative z-10 py-12">
        <div className="text-center mb-10">
           <Link to="/" className="inline-block mb-8">
              <span className="text-4xl font-black italic tracking-tighter text-foreground uppercase">{settings.storeName}</span>
           </Link>
           <h1 className="text-3xl font-black tracking-tighter uppercase">Set New Password</h1>
           <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase mt-4">
             Re-establishing Control of Your Profile
           </p>
        </div>

        <div className="bg-surface/60 backdrop-blur-3xl rounded-[3rem] border border-border/50 p-10 shadow-2xl">
          {error && (<div className="mb-6 p-4 bg-error/5 border border-error/20 rounded-2xl text-[10px] font-black text-error flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-error"/>
              {error.toUpperCase()}
            </div>)}

          <form onSubmit={handleReset} className="space-y-6">
            <div className="relative">
              <Input label="NEW PASSWORD" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" icon={<Lock className="w-4 h-4"/>} className="rounded-2xl pr-12" required/>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[3.2rem] text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>

            <Input label="CONFIRM PASSWORD" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" icon={<Lock className="w-4 h-4"/>} className="rounded-2xl" required/>

            <Button type="submit" variant="primary" className="w-full py-8 font-black tracking-widest text-xs" isLoading={isLoading}>
              UPDATE PASSWORD
            </Button>
          </form>
        </div>
      </div>
    </div>);
}
