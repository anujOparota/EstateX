import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { propertyApi } from "../../services/api";
import { ShoppingBag } from "lucide-react";
import { fadeUp, staggerContainer, scaleIn } from "../../components/MotionWrappers";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Maximize } from "lucide-react";

export default function PurchasedProperties() {
  const [data, setData] = useState({ category: null, purchased: [], active_rentals: [], past_rentals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyApi.getPurchasedByBuyer()
      .then((res) => {
        const raw = res._rawData || {};
        setData({
          category: raw.category || null,
          purchased: Array.isArray(raw.purchased) ? raw.purchased : [],
          active_rentals: Array.isArray(raw.active_rentals) ? raw.active_rentals : [],
          past_rentals: Array.isArray(raw.past_rentals) ? raw.past_rentals : [],
        });
      })
      .catch(() => setData({ category: null, purchased: [], active_rentals: [], past_rentals: [] }))
      .finally(() => setLoading(false));
  }, []);

  const isBuyer = data.category === "buy";
  const isEmpty = isBuyer
    ? data.purchased.length === 0
    : data.active_rentals.length === 0 && data.past_rentals.length === 0;

  const PropertyItem = ({ p, type, status }) => (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 group"
    >
      <div className="h-48 relative overflow-hidden">
        <img
          src={p.image_url || "https://via.placeholder.com/400x250?text=No+Image"}
          alt="property"
          className="w-full h-full object-cover"
        />
        <motion.div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
        <div className="absolute top-3 left-3">
          <Badge className={`rounded-lg text-xs font-semibold ${type === "sale" ? "bg-primary/90 text-primary-foreground" : "bg-secondary text-secondary-foreground border border-white/10"}`}>
            {type === "sale" ? "Purchased" : status === "active" ? "Renting" : "Past Rental"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-lg font-bold text-black bg-white/70 backdrop-blur-sm px-2 py-1 rounded-lg shadow">
            ₹{(p.sale_price ?? p.rental_price)?.toLocaleString() ?? "N/A"}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="mb-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{p.address}</h3>
        <p className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary/60" /> {p.city}
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-primary/50" /> {p.no_of_bedrooms} Beds</span>
          <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4 text-primary/50" /> {p.size} sqft</span>
        </div>
        {type === "sale" && p.sale_date && (
          <p className="mt-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
            Purchased on: <span className="font-semibold text-foreground">{new Date(p.sale_date).toLocaleDateString()}</span>
          </p>
        )}
        {type === "rent" && p.start_date && (
          <p className="mt-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
            {p.end_date
              ? <>Rented: {new Date(p.start_date).toLocaleDateString()} – {new Date(p.end_date).toLocaleDateString()}</>
              : <>Since: {new Date(p.start_date).toLocaleDateString()}</>
            }
          </p>
        )}
        {p.agent_name && (
          <p className="mt-2 text-xs text-muted-foreground">Agent: <span className="font-semibold text-foreground">{p.agent_name}</span></p>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  return (
    <motion.div className="space-y-8" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground">{isBuyer ? "Purchased Properties" : "Rented Properties"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{isBuyer ? "Properties you have successfully bought." : "Properties you have rented."}</p>
      </motion.div>

      {isEmpty ? (
        <motion.div className="glass-card rounded-2xl p-16 text-center" variants={fadeUp} custom={1}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          </motion.div>
          <p className="text-muted-foreground text-lg">{isBuyer ? "No purchased properties yet." : "No rented properties yet."}</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Approved deals will appear here.</p>
        </motion.div>
      ) : isBuyer ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.purchased.map((p) => <PropertyItem key={p.property_id} p={p} type="sale" status="bought" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {data.active_rentals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Currently Renting</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.active_rentals.map((p) => <PropertyItem key={p.rental_id} p={p} type="rent" status="active" />)}
              </div>
            </div>
          )}
          {data.past_rentals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Past Rentals</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.past_rentals.map((p) => <PropertyItem key={p.rental_id} p={p} type="rent" status="past" />)}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
