import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Mail, Lock, ArrowRight, Star, Shield, TrendingUp, UserCog, Home, ShoppingBag, Briefcase } from "lucide-react";
import authImg1 from "../assets/auth-building-1.jpg";
import authImg2 from "../assets/auth-building-2.jpg";
import authImg3 from "../assets/auth-building-3.jpg";

const roleRedirects = { admin: "/admin", owner: "/owner", buyer: "/buyer", agent: "/agent" };

const roleOptions = [
  { value: "admin", label: "Admin", icon: UserCog, color: "from-red-500/20 to-red-500/5", border: "border-red-500/30", text: "text-red-400", glow: "shadow-red-500/10" },
  { value: "owner", label: "Owner", icon: Home, color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", text: "text-amber-400", glow: "shadow-amber-500/10" },
  { value: "buyer", label: "Buyer", icon: ShoppingBag, color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-emerald-500/10" },
  { value: "agent", label: "Agent", icon: Briefcase, color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-blue-500/10" },
];

const floatAnimation = {
  y: [0, -12, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a login category");
      return;
    }
    setSubmitting(true);
    try {
      const userData = await login(email, password, selectedRole);
      navigate(roleRedirects[userData.role || selectedRole] || "/");
    } catch {
      // toast handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Half - Floating Images */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/8 blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary/5 blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />

        <div className="relative w-full h-full max-w-lg max-h-[600px]">
          {/* Main large image */}
          <motion.div
            className="absolute top-0 left-0 w-72 h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 z-10"
            initial={{ opacity: 0, x: -60, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: 0, ...floatAnimation }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.04, rotate: 1 }}
          >
            <img src={authImg1} alt="Luxury building" className="w-full h-full object-cover" width={640} height={800} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white/90 text-sm font-semibold">Premium Properties</p>
              <p className="text-white/50 text-xs mt-0.5">Curated luxury estates</p>
            </div>
          </motion.div>

          {/* Second floating image */}
          <motion.div
            className="absolute top-16 right-0 w-56 h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 z-20"
            initial={{ opacity: 0, y: -40, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05, rotate: -1 }}
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="w-full h-full">
              <img src={authImg2} alt="Modern interior" className="w-full h-full object-cover" loading="lazy" width={640} height={640} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white/90 text-xs font-semibold">Smart Living</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Third floating image */}
          <motion.div
            className="absolute bottom-0 left-12 w-64 h-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.04 }}
          >
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="w-full h-full">
              <img src={authImg3} alt="Aerial community" className="w-full h-full object-cover" loading="lazy" width={640} height={512} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white/90 text-xs font-semibold">Dream Communities</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating stat badges */}
          <motion.div
            className="absolute top-4 right-4 glass-card rounded-xl px-4 py-3 z-30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.6 }}
            whileHover={{ scale: 1.08 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <TrendingUp className="w-4 h-4 text-primary" />
              </motion.div>
              <div>
                <p className="text-xs font-bold text-foreground">2,500+</p>
                <p className="text-[10px] text-muted-foreground">Properties Listed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-12 right-8 glass-card rounded-xl px-4 py-3 z-30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.8 }}
            whileHover={{ scale: 1.08 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                <Star className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">4.9/5</p>
                <p className="text-[10px] text-muted-foreground">Trust Rating</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-48 left-[-16px] glass-card rounded-xl px-4 py-3 z-30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, delay: 1 }}
            whileHover={{ scale: 1.08 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">100%</p>
                <p className="text-[10px] text-muted-foreground">Verified Agents</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Half - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-primary/5 blur-3xl" />
        </motion.div>

        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="glass-card rounded-2xl p-8 md:p-10">
            {/* Logo */}
            <div className="mb-8 text-center">
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 glow-accent"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                <Building2 className="h-7 w-7 text-primary" />
              </motion.div>
              <motion.h1
                className="text-2xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome Back
              </motion.h1>
              <motion.p
                className="mt-1 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Sign in to your command center
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selector */}
              <motion.div
                className="space-y-2.5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Login As</label>
                <div className="grid grid-cols-4 gap-2">
                  {roleOptions.map((role, idx) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.value;
                    return (
                      <motion.button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.08 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all duration-300 cursor-pointer group
                          ${isSelected
                            ? `bg-gradient-to-b ${role.color} ${role.border} shadow-lg ${role.glow} scale-[1.02]`
                            : "bg-secondary/30 border-white/5 hover:border-white/15 hover:bg-secondary/50"
                          }`}
                      >
                        {isSelected && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-background"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          />
                        )}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300
                          ${isSelected ? `${role.text} bg-white/10` : "text-muted-foreground bg-white/5 group-hover:bg-white/10"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-semibold transition-colors duration-300 ${isSelected ? role.text : "text-muted-foreground"}`}>
                          {role.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div className="space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="h-12 rounded-xl border-white/10 bg-secondary/50 pl-11 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              <motion.div className="space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="h-12 rounded-xl border-white/10 bg-secondary/50 pl-11 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 group"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>

            <motion.p
              className="mt-6 text-center text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Register
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
