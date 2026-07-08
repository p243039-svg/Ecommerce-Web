import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToastStore } from "@/stores/useToastStore";
import { mockAddresses } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { User, Mail, MapPin, Shield, Lock, Save, ChevronRight, Package, LogOut } from "lucide-react";
export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const addToast = useToastStore((s) => s.addToast);
    const [firstName, setFirstName] = useState(user?.first_name || "");
    const [lastName, setLastName] = useState(user?.last_name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [isSaving, setIsSaving] = useState(false);
    const handleSave = async () => {
        if (!user)
            return;
        setIsSaving(true);
        // Update Supabase
        const { error } = await supabase
            .from("users")
            .update({ first_name: firstName, last_name: lastName })
            .eq("id", user.id);
        if (error) {
            addToast({ type: "error", title: "Update failed", description: error.message });
        }
        else {
            // Update local store
            useAuthStore.setState((state) => ({
                user: state.user ? { ...state.user, first_name: firstName, last_name: lastName } : null
            }));
            addToast({ type: "success", title: "Profile updated successfully" });
        }
        setIsSaving(false);
    };
    if (!user) {
        return (<div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center animate-fade-in">
          <Lock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sign in Required
          </h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your profile.
          </p>
          <Link to="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-[#f4ebe0] relative overflow-hidden font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Subtle Texture Layer */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}/>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 animate-fade-in">
        <h1 className="text-4xl font-serif text-[#4a3f35] italic mb-10 text-center lg:text-left tracking-tighter">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#fffdfa] rounded-[32px] border border-[#e2d6c5] p-8 text-center shadow-sm">
              <div className="w-24 h-24 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-3xl font-serif italic text-amber-900">
                  {(user.first_name || "?").charAt(0)}{(user.last_name || "").charAt(0)}
                </span>
              </div>
              <h2 className="text-xl font-serif italic text-[#4a3f35]">
                {user.first_name || "Guest"} {user.last_name || ""}
              </h2>
              <p className="text-[11px] font-black text-[#8c7e6c] uppercase tracking-[0.2em] mt-2">{user.email}</p>
              <Badge variant="gold" className="mt-4 px-4 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-900 border-amber-200">
                {user.role === "admin" ? "Admin" : "Member"}
              </Badge>

              {user.role === "admin" && (<Link to="/admin" className="block mt-6">
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-[#e2d6c5] text-[#4a3f35] font-black uppercase tracking-widest text-[10px] hover:bg-amber-50 hover:border-amber-800 transition-all">
                    SWITCH TO ADMIN
                  </Button>
                </Link>)}
            </div>

            <nav className="bg-[#fffdfa] rounded-[32px] border border-[#e2d6c5] overflow-hidden shadow-sm">
              {[
            { href: "/profile", icon: User, label: "Account Details", active: true },
            { href: "/profile/orders", icon: Package, label: "Order History", active: false },
        ].map((item) => (<Link key={item.href} href={item.href} className={`flex items-center justify-between px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b border-[#e2d6c5]/30 last:border-0 ${item.active
                ? "bg-amber-50/50 text-amber-900"
                : "text-[#8c7e6c] hover:bg-amber-50/20 hover:text-amber-700"}`}>
                  <span className="flex items-center gap-4">
                    <item.icon className="w-4 h-4"/>
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-30"/>
                </Link>))}
            </nav>

            <button onClick={async () => {
            await useAuthStore.getState().logout();
            window.location.href = "/";
        }} className="w-full mt-2 flex items-center justify-center gap-3 px-6 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-amber-900 bg-[#fffdfa] rounded-[32px] hover:bg-red-50 hover:text-red-700 transition-all border border-[#e2d6c5] shadow-sm active:scale-[0.98]">
              <LogOut className="w-4 h-4"/>
              Logout
            </button>
          </div>

          {/* Account Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Details */}
            <div className="bg-[#fffdfa] rounded-[40px] border border-[#e2d6c5] p-8 md:p-12 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"/>
              
              <h3 className="text-xl font-serif italic text-[#4a3f35] mb-8 flex items-center gap-3">
                <User className="w-5 h-5 text-amber-800/40"/>
                Account Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group/field">
                   <label className="block text-[10px] font-black text-[#8c7e6c] uppercase tracking-widest pl-2 mb-2 italic">First Name</label>
                   <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-transparent border-b border-[#e2d6c5] py-3 px-2 text-[#4a3f35] text-sm outline-none focus:border-amber-800 transition-all font-medium placeholder:text-[#bfb3a0]/30"/>
                </div>
                <div className="group/field">
                   <label className="block text-[10px] font-black text-[#8c7e6c] uppercase tracking-widest pl-2 mb-2 italic">Last Name</label>
                   <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-transparent border-b border-[#e2d6c5] py-3 px-2 text-[#4a3f35] text-sm outline-none focus:border-amber-800 transition-all font-medium placeholder:text-[#bfb3a0]/30"/>
                </div>
                <div className="md:col-span-2 group/field">
                   <label className="block text-[10px] font-black text-[#8c7e6c] uppercase tracking-widest pl-2 mb-2 italic">Email Address</label>
                   <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bfb3a0]/40"/>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-[#e2d6c5] py-3 pl-8 pr-2 text-[#4a3f35] text-sm outline-none focus:border-amber-800 transition-all font-medium"/>
                   </div>
                </div>
              </div>
              
              <Button className="mt-10 w-full md:w-auto px-10 h-14 rounded-2xl bg-[#4a3f35] text-[#f4ebe0] font-black uppercase tracking-widest text-[11px] hover:bg-amber-900 transition-all shadow-lg active:scale-95" onClick={handleSave} isLoading={isSaving}>
                <Save className="w-4 h-4"/>
                Save Changes
              </Button>
            </div>

            {/* Saved Addresses */}
            <div className="bg-[#fffdfa] rounded-[40px] border border-[#e2d6c5] p-8 md:p-12 shadow-sm">
              <h3 className="text-xl font-serif italic text-[#4a3f35] mb-8 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-amber-800/40"/>
                Saved Addresses
              </h3>
              <div className="space-y-4">
                {mockAddresses.map((addr) => (<div key={addr.id} className="p-6 rounded-[24px] border border-[#e2d6c5]/50 bg-amber-50/10 hover:border-amber-800 transition-all cursor-default group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                        {addr.label}
                      </span>
                      {addr.is_default && <Badge variant="gold" className="bg-amber-100 text-amber-900 border-none text-[8px] uppercase font-black tracking-tighter">Primary</Badge>}
                    </div>
                    <p className="text-sm font-medium text-[#4a3f35] leading-relaxed">
                      {addr.full_name} <br />
                      <span className="text-[#8c7e6c] text-xs">
                        {addr.street}, {addr.city}, {addr.state} {addr.zip_code}
                      </span>
                    </p>
                  </div>))}
              </div>
            </div>

            {/* Security Vault */}
            <PasswordVault />
          </div>
        </div>
      </div>
    </div>);
}
function PasswordVault() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const updatePassword = useAuthStore((s) => s.updatePassword);
    const addToast = useToastStore((s) => s.addToast);
    const handleUpdate = async () => {
        if (!password)
            return addToast({ type: "error", title: "Password required" });
        if (password !== confirmPassword)
            return addToast({ type: "error", title: "Passwords match" });
        setIsUpdating(true);
        const result = await updatePassword(password);
        if (result.success) {
            addToast({ type: "success", title: "Success", description: "Your password has been updated." });
            setPassword("");
            setConfirmPassword("");
            setIsOpen(false);
        }
        else {
            addToast({ type: "error", title: "Error", description: result.error });
        }
        setIsUpdating(false);
    };
    return (<div className="bg-[#fffdfa] rounded-[48px] border border-[#e2d6c5] p-10 md:p-14 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-serif italic text-amber-900 flex items-center justify-center md:justify-start gap-4">
            <Shield className="w-6 h-6 text-amber-800/40"/>
            Security Settings
          </h3>
          <p className="text-[10px] font-black text-[#8c7e6c] uppercase tracking-[0.25em] mt-2 italic opacity-60">Vault Protected — Secure Encryption</p>
        </div>
        {!isOpen && (<Button variant="secondary" onClick={() => setIsOpen(true)} className="rounded-[20px] px-10 h-14 font-black uppercase tracking-widest text-[10px] bg-amber-50 text-amber-900 border-[#e2d6c5] hover:bg-amber-100 transition-all shadow-sm">
            Change Password
          </Button>)}
      </div>

      {isOpen ? (<div className="space-y-10 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group/field">
               <label className="block text-[10px] font-black text-[#8c7e6c] uppercase tracking-widest pl-2 mb-3 italic">New Password</label>
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-[#e2d6c5] py-3 px-2 text-[#4a3f35] text-sm outline-none focus:border-amber-800 transition-all font-medium placeholder:text-[#bfb3a0]/30" placeholder="••••••••"/>
            </div>
            <div className="group/field">
               <label className="block text-[10px] font-black text-[#8c7e6c] uppercase tracking-widest pl-2 mb-3 italic">Confirm Password</label>
               <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-transparent border-b border-[#e2d6c5] py-3 px-2 text-[#4a3f35] text-sm outline-none focus:border-amber-800 transition-all font-medium placeholder:text-[#bfb3a0]/30" placeholder="••••••••"/>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1 rounded-2xl h-16 bg-[#4a3f35] text-[#f4ebe0] font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-amber-900 transition-all" onClick={handleUpdate} isLoading={isUpdating}>
              Update Password
            </Button>
            <Button variant="secondary" className="rounded-2xl h-16 px-10 bg-transparent border border-[#e2d6c5] text-[#8c7e6c] font-black uppercase tracking-widest text-[11px] hover:bg-amber-50" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>) : (<div className="flex items-center gap-4 py-4 px-6 bg-amber-50/20 rounded-2xl border border-dashed border-amber-100 italic">
          <Lock className="w-4 h-4 text-amber-800/30"/>
          <p className="text-[11px] text-[#8c7e6c] font-medium uppercase tracking-[0.1em]">
            Your security details are stored safely.
          </p>
        </div>)}
    </div>);
}
