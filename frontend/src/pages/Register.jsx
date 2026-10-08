import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Mail, Lock, Phone, ArrowRight, Star, Shield, TrendingUp } from "lucide-react";
import authImg1 from "../assets/auth-building-1.jpg";
import authImg2 from "../assets/auth-building-2.jpg";
import authImg3 from "../assets/auth-building-3.jpg";

const roleRedirects = { admin: "/admin", owner: "/owner", buyer: "/buyer", agent: "/agent" };

const floatAnim = (delay = 0) => ({
  y: [0, -10, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
});

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", contactNo: "", role: "", category: "buy" });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) return;
    setSubmitting(true);
    try {
      const userData = await register(form);
      navigate(roleRedirects[userData.role] || "/");
    } catch {
      // toast handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Half */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/8 blur-[100px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-primary/5 blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />

        <div className="relative w-full h-full max-w-lg max-h-[600px]">
          <motion.div
            className="absolute top-4 right-0 w-72 h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 z-10"
            initial={{ opacity: 0, x: 50, rotate: 3 }}
            animate={{ opacity: 1, x: 0, rotate: 0, ...floatAnim(0) }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.04, rotate: -1 }}
          >
            <img src={authImg1} alt="Luxury building" className="w-full h-full object-cover" width={640} height={800} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white/90 text-sm font-semibold">Premium Properties</p>
              <p className="text-white/50 text-xs mt-0.5">Curated luxury estates</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-12 left-0 w-56 h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 z-20"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div animate={floatAnim(0.5)} className="w-full h-full">
              <img src={authImg2} alt="Modern interior" className="w-full h-full object-cover" loading="lazy" width={640} height={640} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white/90 text-xs font-semibold">Smart Living</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-4 right-8 w-64 h-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.04 }}
          >
            <motion.div animate={floatAnim(1)} className="w-full h-full">
              <img src={authImg3} alt="Aerial community" className="w-full h-full object-cover" loading="lazy" width={640} height={512} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white/90 text-xs font-semibold">Dream Communities</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating badges */}
          <motion.div
            className="absolute top-0 left-4 glass-card rounded-xl px-4 py-3 z-30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.6 }}
            whileHover={{ scale: 1.08 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">500+</p>
                <p className="text-[10px] text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-20 left-0 glass-card rounded-xl px-4 py-3 z-30"
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
                <p className="text-xs font-bold text-foreground">98%</p>
                <p className="text-[10px] text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-44 right-[-8px] glass-card rounded-xl px-4 py-3 z-30"
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
                <p className="text-xs font-bold text-foreground">Secure</p>
                <p className="text-[10px] text-muted-foreground">End-to-End</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Half - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-primary/5 blur-3xl" />
        </motion.div>

        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="glass-card rounded-2xl p-8 md:p-10">
            <div className="mb-8 text-center">
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 glow-accent"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                <Building2 className="h-7 w-7 text-primary" />
              </motion.div>
              <motion.h1 className="text-2xl font-bold text-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                Create Account
              </motion.h1>
              <motion.p className="mt-1 text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                Join as an owner or buyer
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: "Full Name",       icon: User,  type: "text",     placeholder: "John Doe",          field: "name",      delay: 0.2 },
                { label: "Email Address",   icon: Mail,  type: "email",    placeholder: "you@example.com",   field: "email",     delay: 0.3 },
                { label: "Contact Number",  icon: Phone, type: "tel",      placeholder: "+91XXXXXXXXXX",     field: "contactNo", delay: 0.4 },
                { label: "Password",        icon: Lock,  type: "password", placeholder: "••••••••",          field: "password",  delay: 0.5 },
              ].map((item) => (
                <motion.div key={item.field} className="space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }}>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</label>
                  <div className="relative">
                    <item.icon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="h-12 rounded-xl border-white/10 bg-secondary/50 pl-11 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      type={item.type}
                      placeholder={item.placeholder}
                      value={form[item.field]}
                      onChange={(e) => update(item.field, e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
              ))}

              <motion.div className="space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</label>
                <Select value={form.role} onValueChange={(v) => update("role", v)}>
                  <SelectTrigger className="h-12 rounded-xl border-white/10 bg-secondary/50 text-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="glass-card rounded-xl border-white/10">
                    <SelectItem value="owner">Property Owner</SelectItem>
                    <SelectItem value="buyer">Buyer / Renter</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {form.role === "buyer" && (
                <motion.div className="space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Buyer Type</label>
                  <Select value={form.category} onValueChange={(v) => update("category", v)}>
                    <SelectTrigger className="h-12 rounded-xl border-white/10 bg-secondary/50 text-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-card rounded-xl border-white/10">
                      <SelectItem value="buy">Want to Buy</SelectItem>
                      <SelectItem value="rent">Want to Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 group"
                    disabled={submitting || !form.role}
                  >
                    {submitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>

            <motion.p className="mt-6 text-center text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign In
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
