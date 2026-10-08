import { useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";

const initialForm = { name: "", email: "", password: "", contactNo: "", experience: "", bio: "" };

export default function AdminAddAgent() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.addAgent(form);
      toast.success("Agent created successfully");
      setForm(initialForm);
    } catch {
      toast.error("Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="space-y-6 max-w-2xl" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground">Add Agent</h2>
        <p className="text-sm text-muted-foreground mt-1">Create a new agent account on the platform.</p>
      </motion.div>

      <motion.div className="glass-card rounded-2xl p-6" variants={fadeUp} custom={1}>
        <div className="flex items-center gap-3 pb-6 border-b border-border/50">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <UserPlus className="h-6 w-6" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">New Agent Details</h3>
            <p className="text-xs text-muted-foreground">Fill in the credentials and contact info.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact Number *</Label>
              <Input id="contactNo" name="contactNo" value={form.contactNo} onChange={handleChange} required className="rounded-xl" placeholder="+91XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input id="experience" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} className="rounded-xl" placeholder="0" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" name="bio" value={form.bio} onChange={handleChange} className="rounded-xl" placeholder="Short description about the agent" />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" disabled={saving} className="rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20">
              <UserPlus className="mr-2 h-4 w-4" />
              {saving ? "Creating..." : "Create Agent"}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
