import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { propertyApi } from "../../services/api";
import PropertyCard from "../../components/PropertyCard";
import { Building2 } from "lucide-react";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";

export default function AgentProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyApi.getByAgent()
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
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground">My Properties</h2>
        <p className="text-sm text-muted-foreground mt-1">Properties listed under your agency.</p>
      </motion.div>

      {properties.length === 0 ? (
        <motion.div className="glass-card rounded-2xl p-16 text-center" variants={fadeUp} custom={1}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          </motion.div>
          <p className="text-muted-foreground text-lg">No properties assigned.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Properties listed under you will appear here.</p>
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
