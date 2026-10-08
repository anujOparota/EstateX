import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { adminApi } from "../../services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getProperties()
      .then((res) => setProperties(res.data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast.success("Property deleted");
    } catch {
      toast.error("Failed to delete property");
    }
  };

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground">All Properties</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage every property listed across the platform.</p>
      </motion.div>

      <motion.div className="glass-card rounded-2xl p-6" variants={fadeUp} custom={1}>
        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div
              className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : properties.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No properties found.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-white/5">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">City</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Owner</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Price</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    className="border-white/5 hover:bg-secondary/30 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TableCell className="font-medium text-foreground">{p.title || p.address}</TableCell>
                    <TableCell className="text-muted-foreground">{p.city}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-lg ${p.type === "sale" ? "bg-primary/90 text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        {p.type === "sale" ? "Sale" : "Rent"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.ownerName || "—"}</TableCell>
                    <TableCell className="text-foreground font-semibold">₹{p.price?.toLocaleString() ?? "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                        <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </motion.div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
