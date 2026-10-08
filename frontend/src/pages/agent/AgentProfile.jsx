import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { profileApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Save } from "lucide-react";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";

export default function AgentProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", contactNo: "", experience_years: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileApi.getMe()
      .then((res) => {
        const d = res.data;
        setForm({
          name: d.agent_name ?? d.name ?? user?.name ?? "",
          email: d.email ?? user?.email ?? "",
          contactNo: d.contact_no ?? d.contactNo ?? "",
          experience_years: d.experience_years ?? "",
          bio: d.bio ?? "",
        });
      })
      .catch(() => setForm((f) => ({ ...f, name: user?.name || "", email: user?.email || "" })))
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.updateMe({
        name: form.name,
        email: form.email,
        phone: form.contactNo,
        bio: form.bio,
        experience: form.experience_years,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div
          className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div className="space-y-8 max-w-2xl" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your agent profile information.</p>
      </motion.div>

      <motion.div variants={fadeUp} custom={1} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border/50">
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <User className="h-8 w-8" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{form.name || "Agent"}</h3>
            <p className="text-sm text-muted-foreground">{form.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact Number</Label>
              <Input id="contactNo" name="contactNo" value={form.contactNo} onChange={handleChange} className="rounded-xl" placeholder="+91XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_years">Experience (Years)</Label>
              <Input id="experience_years" name="experience_years" type="number" min="0" value={form.experience_years} onChange={handleChange} className="rounded-xl" placeholder="0" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" name="bio" value={form.bio} onChange={handleChange} className="rounded-xl" placeholder="Short description about yourself" />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" disabled={saving} className="rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
