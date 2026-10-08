import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { propertyApi, requestApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: "", type: "", maxPrice: "" });
  // Track property IDs for which a pending request already exists
  const [requestedIds, setRequestedIds] = useState(new Set());

  const fetchProperties = () => {
    setLoading(true);
    const params = {};
    if (filters.city) params.city = filters.city;
    if (filters.type) params.type = filters.type;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    propertyApi.getAll(params)
      .then((res) => setProperties(res.data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  // Load existing pending requests so we can disable those buttons
  useEffect(() => {
    requestApi.getForBuyer()
      .then((res) => {
        const pending = (res.data || [])
          .filter((r) => r.status === "pending")
          .map((r) => String(r.propertyId ?? r.property_id));
        setRequestedIds(new Set(pending));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchProperties(); }, []);

  const handleFilter = () => fetchProperties();

  const handleRequest = async (property) => {
    // Category mismatch check: buy buyer cannot rent, rent buyer cannot buy
    if (
      (user.category === "buy" && property.type === "rent") ||
      (user.category === "rent" && property.type === "sale")
    ) {
      toast.error(`You are registered for ${user.category} only`);
      return;
    }

    // Already requested
    if (requestedIds.has(String(property.id))) {
      toast.error("You already have a pending request for this property.");
      return;
    }

    // Property already taken
    if (property.is_taken) {
      toast.error("This property is no longer available.");
      return;
    }

    // agentId is required by the backend
    const agentId = property.agentId ?? property.agent_id;
    if (!agentId) {
      toast.error("No agent assigned to this property.");
      return;
    }

    try {
      await requestApi.send({
        propertyId: property.id,
        agentId: agentId,
        type: property.type,
        message: "",
      });
      toast.success(`Request sent for "${property.title || property.address}"`);
      // Mark this property as requested so button disables immediately
      setRequestedIds((prev) => new Set([...prev, String(property.id)]));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Failed to send request";
      toast.error(typeof msg === "string" ? msg : "Failed to send request");
    }
  };

  return (
    <motion.div className="space-y-8" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeUp}>Available Properties</motion.h2>

      <motion.div className="glass-card rounded-2xl p-5" variants={fadeUp} custom={1} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-12 rounded-xl border-white/10 bg-secondary/50 pl-11 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              placeholder="Search by city…"
              value={filters.city}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}>
            <SelectTrigger className="w-[160px] h-12 rounded-xl border-white/10 bg-secondary/50 text-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="glass-card rounded-xl border-white/10">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="w-[160px] h-12 rounded-xl border-white/10 bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          />
          <motion.button
            onClick={handleFilter}
            className="h-12 inline-flex items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Filter
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div
            className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : properties.length === 0 ? (
        <motion.div className="glass-card rounded-2xl p-16 text-center" variants={fadeUp} custom={2}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          </motion.div>
          <p className="text-muted-foreground text-lg">No properties found.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filters.</p>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <PropertyCard
              key={p.id}
              property={p}
              showRequestButton
              onRequest={handleRequest}
              index={i}
              user={user}
              alreadyRequested={requestedIds.has(String(p.id))}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
