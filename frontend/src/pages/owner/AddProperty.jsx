import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { propertyApi, agentApi } from "../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

export default function AddProperty() {
  const [form, setForm] = useState({
    address: "",
    city: "",
    dateListed: today,
    yearOfConstruction: "",
    bedrooms: "",
    size: "",
    price: "",
    type: "sale",
    agentId: "",
    imageUrl: "",
  });
  const [agents, setAgents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    agentApi.getAll()
      .then((res) => setAgents(res.data))
      .catch(() => setAgents([]));
  }, []);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const inputClass = "h-12 rounded-xl border-white/10 bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agentId) {
      toast.error("Please select an agent");
      return;
    }
    setSubmitting(true);
    try {
      await propertyApi.create({
        address: form.address,
        city: form.city,
        dateListed: form.dateListed,
        yearOfConstruction: Number(form.yearOfConstruction),
        bedrooms: Number(form.bedrooms),
        size: Number(form.size),
        price: Number(form.price),
        type: form.type,
        agentId: form.agentId,
        imageUrl: form.imageUrl || null,
      });
      toast.success("Property added successfully");
      navigate("/owner");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Failed to add property";
      toast.error(typeof msg === "string" ? msg : "Failed to add property");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="mx-auto max-w-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card rounded-2xl p-8">
        <div className="mb-8">
          <motion.div whileHover={{ x: -3 }} className="inline-block">
            <Button variant="ghost" size="sm" className="mb-4 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => navigate("/owner")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </motion.div>
          <motion.h2 className="text-2xl font-bold text-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Add New Property
          </motion.h2>
          <motion.p className="mt-1 text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Fill in the details to list a new property
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Address */}
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address *</label>
            <Input className={inputClass} placeholder="123 Main Street" value={form.address} onChange={(e) => update("address", e.target.value)} required />
          </motion.div>

          {/* City */}
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">City *</label>
            <Input className={inputClass} placeholder="Mumbai" value={form.city} onChange={(e) => update("city", e.target.value)} required />
          </motion.div>

          {/* Date Listed & Year of Construction */}
          <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date Listed *</label>
              <Input type="date" className={inputClass} value={form.dateListed} onChange={(e) => update("dateListed", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year of Construction *</label>
              <Input type="number" className={inputClass} placeholder="2010" min="1800" max={new Date().getFullYear()} value={form.yearOfConstruction} onChange={(e) => update("yearOfConstruction", e.target.value)} required />
            </div>
          </motion.div>

          {/* Bedrooms & Size */}
          <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bedrooms</label>
              <Input type="number" className={inputClass} placeholder="3" min="0" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size (sqft) *</label>
              <Input type="number" className={inputClass} placeholder="1500" min="1" value={form.size} onChange={(e) => update("size", e.target.value)} required />
            </div>
          </motion.div>

          {/* Price */}
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (₹) *</label>
            <Input type="number" className={inputClass} placeholder="2500000" min="1" value={form.price} onChange={(e) => update("price", e.target.value)} required />
          </motion.div>

          {/* Listing Type */}
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Listing Type *</label>
            <Select value={form.type} onValueChange={(v) => update("type", v)}>
              <SelectTrigger className="h-12 rounded-xl border-white/10 bg-secondary/50 text-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card rounded-xl border-white/10">
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Assign Agent */}
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.64 }}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assign Agent *</label>
            <Select value={form.agentId} onValueChange={(v) => update("agentId", v)}>
              <SelectTrigger className="h-12 rounded-xl border-white/10 bg-secondary/50 text-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent className="glass-card rounded-xl border-white/10">
                {agents.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name} {a.rating ? `⭐ ${a.rating}` : ""}
                  </SelectItem>
                ))}
                {agents.length === 0 && (
                  <SelectItem value="none" disabled>No agents available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Image URL (optional) */}
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image URL (optional)</label>
            <Input className={inputClass} placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} />
          </motion.div>

          <motion.div className="flex gap-3 pt-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.76 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  "Add Property"
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="button" variant="outline" className="rounded-xl border-white/10 hover:bg-secondary/50 h-12" onClick={() => navigate("/owner")}>
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
