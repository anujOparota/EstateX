import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Bed, Maximize, Home, Key } from "lucide-react";
import { scaleIn } from "./MotionWrappers";

export default function PropertyCard({ property, onRequest, showRequestButton = false, index = 0, user, alreadyRequested = false }) {
  
  const categoryMismatch =
    user &&
    (
      (user.category === "buy" && property.type === "rent") ||
      (user.category === "rent" && property.type === "sale")
    );

  const isTaken = property.is_taken === true || property.is_taken === 1;
  const isDisabled = categoryMismatch || isTaken || alreadyRequested;

  let buttonLabel = property.type === "sale" ? "Request to Buy" : "Request to Rent";
  if (categoryMismatch) {
    buttonLabel = user.category === "buy" ? "Rent Not Available" : "Buy Not Available";
  } else if (isTaken) {
    buttonLabel = property.type === "sale" ? "Already Sold" : "Already Rented";
  } else if (alreadyRequested) {
    buttonLabel = "Request Sent";
  }

  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 group"
    >
      <div className="h-48 relative overflow-hidden">
        <img
          src={property.image_url || "https://via.placeholder.com/400x250?text=No+Image"}
          alt="property"
          className="w-full h-full object-cover"
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        <div className="absolute top-3 left-3">
          <Badge className={`rounded-lg text-xs font-semibold ${
            property.type === "sale"
              ? "bg-primary/90 text-primary-foreground"
              : "bg-secondary text-secondary-foreground border border-white/10"
          }`}>
            {property.type === "sale" ? "For Sale" : "For Rent"}
          </Badge>
        </div>

        {isTaken && (
          <div className="absolute top-3 right-10">
            <Badge className="rounded-lg text-xs font-semibold bg-destructive/80 text-white">
              {property.type === "sale" ? "Sold" : "Rented"}
            </Badge>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className="text-lg font-bold text-black bg-white/70 backdrop-blur-sm px-2 py-1 rounded-lg shadow">
            ₹{property.price?.toLocaleString() ?? "N/A"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="mb-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
          {property.title || property.address}
        </h3>
        <p className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary/60" /> {property.city}
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-primary/50" /> {property.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-primary/50" /> {property.size} sqft
          </span>
        </div>
        {property.agentName && (
          <p className="mt-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
            Agent: <span className="font-semibold text-foreground">{property.agentName}</span>
          </p>
        )}
      </div>

      {showRequestButton && (
        <div className="px-5 pb-5">
          <motion.div whileHover={{ scale: isDisabled ? 1 : 1.02 }} whileTap={{ scale: isDisabled ? 1 : 0.98 }}>
            <Button
              disabled={isDisabled}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onRequest?.(property)}
            >
              {property.type === "sale" ? (
                <Home className="mr-1 h-4 w-4" />
              ) : (
                <Key className="mr-1 h-4 w-4" />
              )}
              {buttonLabel}
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
