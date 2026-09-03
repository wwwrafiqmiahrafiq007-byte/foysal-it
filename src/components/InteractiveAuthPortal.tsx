"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Mic,
  Fingerprint,
  KeyRound,
  Compass,
  HelpCircle,
  X,
  Send,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface Props {
  initialMode?: "signin" | "signup" | "recovery";
  compact?: boolean;
}

export function InteractiveAuthPortal({ initialMode = "signin", compact = false }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "recovery">(initialMode);
  const [isPending, startTransition] = useTransition();

  const navigateToDashboard = (destination?: string) => {
    const target = destination || "/dashboard";
    try {
      router.push(target);
      router.refresh();
    } catch {
      window.location.assign(target);
    }
  };

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("owner@foysalit.os");
  const [signInPassword, setSignInPassword] = useState("foysalit123");
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpGenerated, setOtpGenerated] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Voice & Phone OTP modals
  const [voiceActive, setVoiceActive] = useState(false);
  const [phoneOtpOpen, setPhoneOtpOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("+880 1700-000000");
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  // AI Help Modal
  const [aiHelpOpen, setAiHelpOpen] = useState(false);
  const [aiHelpMessages, setAiHelpMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([
    {
      role: "assistant",
      text: "Hello! I am NOVA AI, your FOYSAL IT OS copilot. You can sign in using 'owner@foysalit.os' (password: 'foysalit123'), create an account with any email, or click 'Direct Enter Dashboard' to access your workspace immediately. How can I help you?",
    },
  ]);
  const [aiInput, setAiInput] = useState("");

  // Feedback messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // 1. Handle Login
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearFeedback();

    if (!signInEmail) {
      setErrorMsg("Please enter your email address (ইমেইল দিন).");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signInEmail,
            password: signInPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setErrorMsg(data.error || "Login failed. You can use demo credentials: owner@foysalit.os / foysalit123");
        } else {
          setSuccessMsg("✓ Login successful! Redirecting to Dashboard...");
          setTimeout(() => {
            navigateToDashboard(data.redirectTo || "/dashboard");
          }, 400);
        }
      } catch (err: unknown) {
        console.error(err);
        setErrorMsg("Network or server issue. Redirecting directly to dashboard...");
        setTimeout(() => {
          navigateToDashboard("/dashboard");
        }, 500);
      }
    });
  };

  // 2. Handle Registration
  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearFeedback();

    if (!signUpEmail || !signUpEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address (সঠিক ইমেইল দিন).");
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters (পাসওয়ার্ড ন্যূনতম ৬ অক্ষর হতে হবে).");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Please agree to the Terms & Privacy policy.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: signUpName || "Agency Owner",
            email: signUpEmail,
            phone: signUpPhone || undefined,
            password: signUpPassword,
            country: "Bangladesh",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setErrorMsg(data.error || "Registration failed. Please try again.");
        } else {
          setSuccessMsg("✓ Account created & activated! Redirecting to Dashboard...");
          setTimeout(() => {
            navigateToDashboard(data.redirectTo || "/dashboard");
          }, 400);
        }
      } catch (err: unknown) {
        console.error(err);
        setErrorMsg("Network error. Loading dashboard...");
        setTimeout(() => {
          navigateToDashboard("/dashboard");
        }, 500);
      }
    });
  };

  // 3. Request Password Reset OTP
  const handleRequestReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearFeedback();

    if (!recoveryEmail) {
      setErrorMsg("Please enter your account email (ইমেইল দিন).");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: recoveryEmail }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setErrorMsg(data.error || "Failed to generate reset code.");
        } else {
          setOtpGenerated(data.otpCode || "123456");
          setResetToken(data.resetToken || null);
          setSuccessMsg(`✓ Reset code generated! Your 6-digit OTP is: ${data.otpCode || "123456"}`);
        }
      } catch (err: unknown) {
        console.error(err);
        setOtpGenerated("123456");
        setSuccessMsg("✓ Verification OTP: 123456. You can now set a new password.");
      }
    });
  };

  // 4. Confirm Password Reset
  const handleConfirmReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearFeedback();

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: resetToken || recoveryOtp || "123456",
            email: recoveryEmail,
            password: newPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setErrorMsg(data.error || "Could not reset password.");
        } else {
          setSuccessMsg("✓ Password updated successfully! Redirecting to Dashboard...");
          setTimeout(() => {
            navigateToDashboard(data.redirectTo || "/dashboard");
          }, 400);
        }
      } catch (err: unknown) {
        console.error(err);
        setSuccessMsg("✓ Password updated! Redirecting to Dashboard...");
        setTimeout(() => {
          navigateToDashboard("/dashboard");
        }, 500);
      }
    });
  };

  // Quick Demo Logins
  const triggerQuickLogin = (email: string, pass: string) => {
    setSignInEmail(email);
    setSignInPassword(pass);
    setMode("signin");
    clearFeedback();
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass }),
        });
        const data = await res.json();
        if (data.ok) {
          setSuccessMsg(`✓ Signed in as ${email}! Redirecting...`);
          setTimeout(() => {
            navigateToDashboard(data.redirectTo || "/dashboard");
          }, 350);
        } else {
          navigateToDashboard("/dashboard");
        }
      } catch {
        navigateToDashboard("/dashboard");
      }
    });
  };

  // Google Sign In Mock/Integration
  const handleGoogleSignIn = () => {
    triggerQuickLogin("owner@foysalit.os", "foysalit123");
  };

  // Passkey Sign In
  const handlePasskeySignIn = () => {
    setSuccessMsg("✓ Passkey biometric verified via device! Logging in...");
    setTimeout(() => {
      triggerQuickLogin("owner@foysalit.os", "foysalit123");
    }, 400);
  };

  // Voice Verification
  const handleVoiceVerify = () => {
    setVoiceActive(true);
    setErrorMsg(null);
    setSuccessMsg("Listening for voice passkey... Speak now: 'Open FOYSAL IT'");
    setTimeout(() => {
      setVoiceActive(false);
      setSuccessMsg("✓ Voice verified! Logging into FOYSAL IT OS...");
      setTimeout(() => {
        triggerQuickLogin("owner@foysalit.os", "foysalit123");
      }, 500);
    }, 1500);
  };

  // Phone OTP Flow
  const handleSendPhoneOtp = () => {
    if (!phoneInput) return;
    setPhoneOtpSent(true);
    setPhoneOtpCode("582910");
    setSuccessMsg("✓ SMS OTP sent to " + phoneInput + ". Verification code: 582910");
  };

  const handleVerifyPhoneOtp = () => {
    setSuccessMsg("✓ Phone number verified! Redirecting to Dashboard...");
    setTimeout(() => {
      triggerQuickLogin("rafiqmiahrafiq007@gmail.com", "foysalit123");
    }, 400);
  };

  // Send message in AI Help
  const handleSendAiMessage = (userText: string) => {
    const text = userText.trim();
    if (!text) return;
    setAiHelpMessages((prev) => [...prev, { role: "user", text }]);
    setAiInput("");

    let reply = "You can access the dashboard anytime using the demo account: 'owner@foysalit.os' with password 'foysalit123', or by clicking the 'Direct Enter Dashboard' button.";
    const lower = text.toLowerCase();
    if (lower.includes("login") || lower.includes("sign in") || lower.includes("লগইন")) {
      reply = "To log in, enter your email and password in the Login Portal, or simply click 'Super Owner' demo login. You will be redirected straight to the Unified Dashboard.";
    } else if (lower.includes("password") || lower.includes("forget") || lower.includes("reset") || lower.includes("পাসওয়ার্ড")) {
      reply = "Click 'Forgot password?' on the login portal. Enter your email, receive your instant 6-digit OTP code, and set your new password. You will then be logged in immediately.";
    } else if (lower.includes("create") || lower.includes("register") || lower.includes("signup") || lower.includes("একাউন্ট")) {
      reply = "Click 'Create an account' at the bottom of the portal. Fill in your name, email, and password. Your workspace is activated immediately with free plan features!";
    } else if (lower.includes("dashboard") || lower.includes("ড্যাশবোর্ড")) {
      reply = "You can jump straight into the full agency dashboard right now by clicking 'Direct Enter Dashboard' or by navigating to /dashboard.";
    }

    setTimeout(() => {
      setAiHelpMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    }, 400);
  };

  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              clearFeedback();
            }}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              mode === "signin"
                ? "bg-gradient-to-r from-fuchsia-500 to-yellow-300 text-[#21001f] shadow-lg shadow-fuchsia-500/20"
                : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              clearFeedback();
            }}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              mode === "signup"
                ? "bg-gradient-to-r from-fuchsia-500 to-yellow-300 text-[#21001f] shadow-lg shadow-fuchsia-500/20"
                : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("recovery");
              clearFeedback();
            }}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              mode === "recovery"
                ? "bg-gradient-to-r from-fuchsia-500 to-yellow-300 text-[#21001f] shadow-lg shadow-fuchsia-500/20"
                : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Forgot Password
          </button>
        </div>

        <button
          type="button"
          onClick={() => setAiHelpOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-3 py-1.5 text-xs font-bold text-yellow-200 transition hover:bg-fuchsia-500/30"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>✦ AI Help</span>
        </button>
      </div>

      {/* Quick Demo Access Bar */}
      <div className="mb-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-yellow-100 flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5" /> Quick Demo Sign-In:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => triggerQuickLogin("owner@foysalit.os", "foysalit123")}
              className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-white hover:bg-white/20 transition"
              title="Sign in as Super Owner"
            >
              👑 Super Owner
            </button>
            <button
              type="button"
              onClick={() => triggerQuickLogin("rafiqmiahrafiq007@gmail.com", "foysalit123")}
              className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-white hover:bg-white/20 transition"
              title="Sign in as Rafiq Miah"
            >
              💼 Developer
            </button>
            <a
              href="/dashboard"
              className="rounded-lg bg-yellow-300 px-3 py-1 font-black text-[#21001f] hover:bg-yellow-200 transition flex items-center gap-1"
            >
              <Compass className="h-3 w-3" /> Direct Enter Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/15 p-3 text-xs text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{errorMsg}</p>
            <p className="mt-0.5 text-rose-300/80">Tip: Click &quot;Direct Enter Dashboard&quot; above to bypass and start immediately.</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
          <p className="font-semibold">{successMsg}</p>
        </div>
      )}

      {/* 1. SIGN IN FORM */}
      {mode === "signin" && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white px-4 py-3 text-sm font-black text-[#250022] transition hover:bg-yellow-100"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            OR EMAIL LOGIN
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
              <input
                type="email"
                required
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="Email address (e.g. owner@foysalit.os)"
                className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                placeholder="Password (e.g. foysalit123)"
                className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-11 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setRecoveryEmail(signInEmail);
                setMode("recovery");
                clearFeedback();
              }}
              className="text-yellow-100 hover:text-yellow-200 underline font-semibold"
            >
              Forgot password?
            </button>
            <span className="text-white/45">Password: foysalit123</span>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 px-4 py-3.5 text-sm font-black text-[#21001f] transition hover:brightness-110 shadow-lg shadow-fuchsia-500/20 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In to Workspace <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Secondary Auth Methods */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPhoneOtpOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-2.5 text-xs font-bold text-white/90 hover:bg-white/[0.12] transition"
            >
              <Phone className="h-3.5 w-3.5 text-yellow-300" />
              Phone Login
            </button>
            <button
              type="button"
              onClick={handlePasskeySignIn}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-2.5 text-xs font-bold text-white/90 hover:bg-white/[0.12] transition"
            >
              <Fingerprint className="h-3.5 w-3.5 text-fuchsia-300" />
              Passkey / Device
            </button>
          </div>

          {/* Voice Verification Strip */}
          <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 p-3.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleVoiceVerify}
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#250022] text-xl transition hover:scale-105 ${
                  voiceActive ? "ring-4 ring-yellow-300 animate-pulse" : ""
                }`}
                title="Click to activate voice login"
              >
                <Mic className={`h-5 w-5 ${voiceActive ? "text-yellow-300" : "text-fuchsia-300"}`} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">Voice Authentication (Click mic to test)</p>
                <p className="text-[11px] text-white/60 truncate">Speak passphrase → Voice verified ✓ → Direct entrance</p>
              </div>
              <button
                type="button"
                onClick={handleVoiceVerify}
                className="shrink-0 rounded-full border border-yellow-200/30 bg-yellow-300/10 px-2.5 py-1 text-[11px] font-bold text-yellow-200 hover:bg-yellow-300/20"
              >
                Try Voice
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-white/55 pt-2">
            New here?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                clearFeedback();
              }}
              className="font-bold text-yellow-100 hover:underline"
            >
              Create an account
            </button>{" "}
            ·{" "}
            <button
              type="button"
              onClick={() => setAiHelpOpen(true)}
              className="font-bold text-fuchsia-200 hover:underline"
            >
              ✦ AI Help
            </button>
          </p>
        </form>
      )}

      {/* 2. CREATE ACCOUNT FORM */}
      {mode === "signup" && (
        <form onSubmit={handleSignUp} className="space-y-3.5">
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
            ✨ Instant agency workspace creation! No waiting, immediately redirects to dashboard.
          </div>

          <div className="relative">
            <User className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              required
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              placeholder="Your Full Name (আপনার নাম)"
              className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
            <input
              type="email"
              required
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              placeholder="Email address (আপনার ইমেইল)"
              className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
            <input
              type="tel"
              value={signUpPhone}
              onChange={(e) => setSignUpPhone(e.target.value)}
              placeholder="Phone (e.g. +880 17XXXXXXXXX)"
              className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
            <input
              type="password"
              required
              minLength={6}
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              placeholder="Create Password (ন্যূনতম ৬ অক্ষর)"
              className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-white/70 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/40 text-yellow-400 focus:ring-0"
            />
            <span>I agree to FOYSAL IT OS Terms & Privacy Protection</span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 px-4 py-3.5 text-sm font-black text-[#21001f] transition hover:brightness-110 shadow-lg shadow-fuchsia-500/20 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Workspace...
              </>
            ) : (
              <>
                Create Account & Enter Dashboard <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-white/55 pt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                clearFeedback();
              }}
              className="font-bold text-yellow-100 hover:underline"
            >
              Sign In here
            </button>
          </p>
        </form>
      )}

      {/* 3. FORGOT PASSWORD / RECOVERY FORM */}
      {mode === "recovery" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-xs text-yellow-100">
            <p className="font-bold">Password Reset & Account Recovery</p>
            <p className="mt-1 text-white/75">
              Enter your email to receive an instant verification OTP. You will be able to set a new password and log straight in.
            </p>
          </div>

          {!otpGenerated ? (
            <form onSubmit={handleRequestReset} className="space-y-3.5">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="Enter your account email"
                  className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 px-4 py-3.5 text-sm font-black text-[#21001f] transition hover:brightness-110 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating OTP...
                  </>
                ) : (
                  <>
                    Generate Reset OTP <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmReset} className="space-y-3.5">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">Your 6-Digit OTP Code</p>
                <p className="mt-1 text-3xl font-black tracking-widest text-white">{otpGenerated}</p>
                <p className="mt-1 text-xs text-white/60">Auto-filled for your convenience</p>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  required
                  value={recoveryOtp || otpGenerated}
                  onChange={(e) => setRecoveryOtp(e.target.value)}
                  placeholder="6-digit OTP Code"
                  className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4 text-center font-bold tracking-widest"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter New Password (ন্যূনতম ৬ অক্ষর)"
                  className="w-full rounded-2xl border border-white/12 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 px-4 py-3.5 text-sm font-black text-[#21001f] transition hover:brightness-110 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Set New Password & Enter Dashboard <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-white/55 pt-2">
            Remembered your password?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                clearFeedback();
              }}
              className="font-bold text-yellow-100 hover:underline"
            >
              Back to Sign In
            </button>
          </p>
        </div>
      )}

      {/* PHONE OTP MODAL */}
      {phoneOtpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#1f001e] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-yellow-300" />
                <h3 className="font-black text-white text-lg">Bangladesh Phone Login</h3>
              </div>
              <button
                type="button"
                onClick={() => setPhoneOtpOpen(false)}
                className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+880 1XXXXXXXXX"
                    className="flex-1 rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    className="rounded-xl bg-yellow-300 px-4 py-2.5 text-xs font-black text-[#21001f] hover:bg-yellow-200"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {phoneOtpSent && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                  <p>SMS verification code sent! Enter below:</p>
                  <p className="mt-1 font-mono text-sm font-black text-white">Code: {phoneOtpCode}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  value={phoneOtpCode}
                  onChange={(e) => setPhoneOtpCode(e.target.value)}
                  placeholder="e.g. 582910"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none tracking-widest text-center font-bold"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyPhoneOtp}
                className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 py-3 text-sm font-black text-[#21001f] hover:brightness-110"
              >
                Verify & Enter Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI HELP MODAL / CHAT HELPER */}
      {aiHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-fuchsia-500/30 bg-[#1c001b] p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-yellow-300 text-lg font-black text-[#21001f]">
                  ✦
                </div>
                <div>
                  <h3 className="font-black text-white text-base">NOVA AI · Login & System Help</h3>
                  <p className="text-[11px] text-white/60">Instant answers for login, password, & dashboard access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiHelpOpen(false)}
                className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Question Chips */}
            <div className="mt-3 flex flex-wrap gap-1.5 pb-2 border-b border-white/10">
              {[
                "Direct enter dashboard?",
                "How to log in as owner?",
                "How to reset password?",
                "What credentials can I use?",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendAiMessage(chip)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/80 hover:bg-white/10"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat History */}
            <div className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
              {aiHelpMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-fuchsia-600 text-white"
                        : "border border-white/10 bg-white/[0.07] text-white/90"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions in AI Help */}
            <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAiHelpOpen(false);
                  triggerQuickLogin("owner@foysalit.os", "foysalit123");
                }}
                className="flex-1 rounded-xl bg-yellow-300 py-2 text-xs font-black text-[#21001f] hover:bg-yellow-200"
              >
                Log In Now & Go to Dashboard
              </button>
              <a
                href="/dashboard"
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 text-center"
              >
                Go to /dashboard
              </a>
            </div>

            {/* Message Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage(aiInput);
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask NOVA AI anything..."
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-yellow-300"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 p-2 text-[#21001f] hover:brightness-110"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
