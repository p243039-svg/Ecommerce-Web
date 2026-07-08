import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
let authSubscription = null;
let initializationPromise = null;
async function syncUserProfile(authUser) {
    // 1. Try to read fresh from DB
    const { data: existing, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();
    if (existing)
        return existing;
    // 2. If not in DB yet, build from metadata (social or signup data)
    const nameParts = authUser.user_metadata?.full_name?.split(" ") || [];
    const first_name = authUser.user_metadata?.first_name || nameParts[0] || "User";
    const last_name = authUser.user_metadata?.last_name || nameParts.slice(1).join(" ") || "";
    const newProfile = {
        id: authUser.id,
        email: authUser.email ?? "",
        first_name,
        last_name,
        role: "user",
    };
    // 3. Force insert/upsert
    const { data: upserted, error: upsertError } = await supabase
        .from("users")
        .upsert([newProfile], { onConflict: "id" })
        .select()
        .maybeSingle();
    if (upsertError) {
        console.warn("Profile sync delay - returning local fallback", upsertError);
        return { ...newProfile, created_at: new Date().toISOString() };
    }
    return upserted ?? null;
}
export const useAuthStore = create(persist((set, get) => ({
    user: null,
    isLoading: false,
    initialize: async () => {
        if (initializationPromise)
            return initializationPromise;
        initializationPromise = (async () => {
            // Check session on load
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const userData = await syncUserProfile(session.user);
                set({ user: userData });
            }
            else {
                set({ user: null });
            }
            // Listen for changes
            if (authSubscription) {
                authSubscription.unsubscribe();
            }
            const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
                if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
                    const userData = await syncUserProfile(session.user);
                    set({ user: userData });
                }
                else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
                    set({ user: null });
                }
            });
            authSubscription = data.subscription;
        })();
        return initializationPromise;
    },
    login: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
        }
        if (data.user) {
            const userData = await syncUserProfile(data.user);
            set({ user: userData, isLoading: false });
            return { success: true };
        }
        set({ isLoading: false });
        return { success: false, error: "Login failed" };
    },
    signup: async (email, password, first_name, last_name) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { first_name, last_name } },
        });
        if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
        }
        if (data.user) {
            // If Supabase auto-confirms, we try to sync immediately
            const userData = await syncUserProfile({
                id: data.user.id,
                email: data.user.email,
                user_metadata: { first_name, last_name }
            });
            set({ user: userData, isLoading: false });
            return { success: true };
        }
        set({ isLoading: false });
        return { success: false, error: "Signup failed" };
    },
    logout: async () => {
        try {
            await supabase.auth.signOut();
        }
        finally {
            set({ user: null });
            initializationPromise = null;
            if (typeof window !== "undefined") {
                // Wipe everything related to auth
                Object.keys(localStorage)
                    .filter((k) => k.includes("-auth-token") || k.includes("auth"))
                    .forEach((k) => localStorage.removeItem(k));
            }
        }
    },
    signInWithOAuth: async (provider) => {
        const siteUrl = import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
        await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: siteUrl },
        });
    },
    resetPassword: async (email) => {
        set({ isLoading: true });
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        set({ isLoading: false });
        return error ? { success: false, error: error.message } : { success: true };
    },
    verifyOtp: async (email, token, type) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type,
        });
        set({ isLoading: false });
        if (error)
            return { success: false, error: error.message };
        // Ensure session is set for password update
        if (data.session) {
            const userData = await syncUserProfile(data.session.user);
            set({ user: userData });
        }
        return { success: true };
    },
    updatePassword: async (password) => {
        set({ isLoading: true });
        const { error } = await supabase.auth.updateUser({ password });
        set({ isLoading: false });
        return error ? { success: false, error: error.message } : { success: true };
    },
    setMockAdmin: () => {
        set({
            user: {
                id: "00000000-0000-0000-0000-000000000000",
                email: "admin@antique.com",
                role: "admin",
                first_name: "Antique",
                last_name: "Admin",
            },
        });
    },
    isAdmin: () => get().user?.role === "admin",
}), { name: "antique-auth-session" }));
