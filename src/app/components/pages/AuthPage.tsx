import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, Check, Mail, Lock, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import authHeroImage from "../../assets/maeven-auth-hero.jpeg";

type AuthMode = "login" | "register" | "forgot" | "otp";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

export function AuthPage() {
  const { login, loginWithGoogle, register, navigate, toast, pageParams } = useApp();
  const [mode, setMode] = useState<AuthMode>((pageParams.mode as AuthMode) || "login");
  const [showPassword, setShowPassword] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      toast("Google login was cancelled", "info");
      return;
    }

    setLoading(true);
    try {
      const role = await loginWithGoogle(response.credential);
      if (role === "admin") {
        toast("Welcome to Admin Dashboard");
        navigate("admin");
      } else {
        toast("Welcome back!");
        navigate("home");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "login" || !googleClientId || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 400,
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", renderGoogleButton);
    return () => script?.removeEventListener("load", renderGoogleButton);
  }, [mode, googleClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const role = await login(form.email, form.password);
        if (role === "admin") {
          toast("Welcome to Admin Dashboard 🛠️");
          navigate("admin");
        } else {
          toast("Welcome back! ✨");
          navigate("home");
        }
      } else if (mode === "register") {
        await register(form.name, form.email, form.password);
        toast("Account created! Welcome to MAEVEN ✨");
        navigate("home");
      } else if (mode === "forgot") {
        await new Promise((r) => setTimeout(r, 800));
        setMode("otp");
        toast("Verification code sent to your email");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async () => {
    if (otpValues.join("").length === 6) {
      setLoading(true);
      try {
        if (mode === "otp" && !form.password) {
          await new Promise((r) => setTimeout(r, 800));
          toast("Password reset successful! Please login.");
          setMode("login");
        } else {
          await register(form.name, form.email, form.password);
          toast("Account created! Welcome to MAEVEN ✨");
          navigate("home");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const heroImage = authHeroImage;

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Left — Image */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img src={heroImage} alt="MAEVEN" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute bottom-12 left-12 text-white">
          <button onClick={() => navigate("home")} className="text-3xl font-black tracking-tighter mb-4 block">MAEVEN</button>
          <p className="text-lg font-light opacity-80 max-w-xs leading-relaxed">
            Dress for the life you want to live.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <button onClick={() => navigate("home")} className="lg:hidden text-2xl font-black tracking-tighter mb-8 block">
            MAEVEN
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* OTP */}
              {mode === "otp" && (
                <div>
                  <h1 className="text-3xl font-black mb-2">Verify Email</h1>
                  <p className="text-[var(--muted-foreground)] text-sm mb-8">
                    We sent a 6-digit code to <strong>{form.email || "your email"}</strong>
                  </p>
                  <div className="flex gap-3 justify-center mb-8">
                    {otpValues.map((v, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={v}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newVals = [...otpValues];
                          newVals[i] = val;
                          setOtpValues(newVals);
                          if (val && i < 5) {
                            document.getElementById(`otp-${i + 1}`)?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !v && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus();
                          }
                        }}
                        id={`otp-${i}`}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors"
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleOtp}
                    disabled={otpValues.join("").length < 6}
                    className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Verify & Continue
                  </button>
                  <p className="text-center text-sm text-[var(--muted-foreground)] mt-4">
                    Didn't receive it? <button className="text-[var(--foreground)] font-semibold hover:underline">Resend</button>
                  </p>
                </div>
              )}

              {/* Login */}
              {mode === "login" && (
                <div>
                  <h1 className="text-3xl font-black mb-2">Welcome back</h1>
                  <p className="text-[var(--muted-foreground)] text-sm mb-8">Sign in to your MAEVEN account. (Hint: Use <strong>admin@maeven.com</strong> for Admin Access)</p>

                  {googleClientId && (
                    <>
                      <div ref={googleButtonRef} className="mb-6 min-h-[44px] flex justify-center" />
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-[var(--border)]" />
                        <span className="text-xs text-[var(--muted-foreground)]">or continue with email</span>
                        <div className="flex-1 h-px bg-[var(--border)]" />
                      </div>
                    </>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="alex@email.com"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-medium">Password</label>
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={form.password}
                          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-12 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Sign In <ArrowRight size={16} /></>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
                    Don't have an account?{" "}
                    <button onClick={() => setMode("register")} className="text-[var(--foreground)] font-semibold hover:underline">
                      Create one
                    </button>
                  </p>
                </div>
              )}

              {/* Register */}
              {mode === "register" && (
                <div>
                  <h1 className="text-3xl font-black mb-2">Join MAEVEN</h1>
                  <p className="text-[var(--muted-foreground)] text-sm mb-8">Create your account to unlock exclusive benefits</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                      { key: "name", label: "Full Name", placeholder: "Alexandra Rivera", type: "text", icon: User },
                      { key: "email", label: "Email", placeholder: "alex@email.com", type: "email", icon: Mail },
                      { key: "password", label: "Password", placeholder: "Min. 8 characters", type: "password", icon: Lock },
                    ].map(({ key, label, placeholder, type, icon: Icon }) => (
                      <div key={key}>
                        <label className="text-sm font-medium mb-1.5 block">{label}</label>
                        <div className="relative">
                          <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                          <input
                            type={key === "password" && showPassword ? "text" : type}
                            required={true}
                            value={form[key as keyof typeof form]}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors text-sm"
                          />
                          {key === "password" && (
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border-2 border-[var(--border)] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[var(--muted-foreground)]">
                        I agree to MAEVEN's <a href="#" className="text-[var(--foreground)] hover:underline">Terms of Service</a> and <a href="#" className="text-[var(--foreground)] hover:underline">Privacy Policy</a>
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Create Account <ArrowRight size={16} /></>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-[var(--foreground)] font-semibold hover:underline">Sign in</button>
                  </p>
                </div>
              )}

              {/* Forgot Password */}
              {mode === "forgot" && (
                <div>
                  <h1 className="text-3xl font-black mb-2">Reset Password</h1>
                  <p className="text-[var(--muted-foreground)] text-sm mb-8">Enter your email to receive a reset code</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="alex@email.com"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin" /> : <>Send Reset Code <ArrowRight size={16} /></>}
                    </button>
                  </form>
                  <button onClick={() => setMode("login")} className="text-center w-full text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mt-4">
                    ← Back to sign in
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
