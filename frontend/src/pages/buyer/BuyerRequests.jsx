import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { requestApi } from "../../services/api";
import { ClipboardList, Clock } from "lucide-react";
import { fadeUp, scaleIn, staggerContainer } from "../../components/MotionWrappers";

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function BuyerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestApi.getForBuyer()
      .then((res) => setRequests(res.data))
      .catch(() => setRequests([]))
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
      <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeUp}>My Requests</motion.h2>
      {requests.length === 0 ? (
        <motion.div className="glass-card rounded-2xl p-16 text-center" variants={fadeUp} custom={1}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          </motion.div>
          <p className="text-muted-foreground text-lg">No requests yet.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Browse properties and make a request!</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r, i) => (
            <motion.div
              key={r.id}
              variants={scaleIn}
              custom={i}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-5 space-y-3 transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{r.propertyTitle || r.propertyAddress || `Property #${r.propertyId}`}</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 + i * 0.05 }}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[r.status] || ""}`}
                >
                  <Clock className="h-3 w-3" />
                  {r.status}
                </motion.span>
              </div>
              <p className="text-sm text-muted-foreground">Type: {r.type === "sale" ? "Purchase" : "Rental"}</p>
              {r.agentName && <p className="text-sm text-muted-foreground">Agent: <span className="font-semibold text-foreground">{r.agentName}</span></p>}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
