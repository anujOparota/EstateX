import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { propertyApi } from "../../services/api";
import PropertyCard from "../../components/PropertyCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Home } from "lucide-react";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";

export default function OwnerDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyApi.getByOwner()
      .then((res) => setProperties(res.data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

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
    <motion.div className="space-y-8" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div className="flex items-center justify-between" variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground">My Properties</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild className="rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Link to="/owner/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Property</Link>
          </Button>
        </motion.div>
      </motion.div>

      {properties.length === 0 ? (
        <motion.div className="glass-card rounded-2xl p-16 text-center" variants={fadeUp} custom={1}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Home className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          </motion.div>
          <p className="text-muted-foreground text-lg">No properties yet.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Add your first property to get started!</p>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
