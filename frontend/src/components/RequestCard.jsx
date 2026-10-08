import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check, X, Clock, User, Home } from "lucide-react";
import { scaleIn } from "./MotionWrappers";

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function RequestCard({ request, onApprove, onReject, index = 0 }) {
  const status = request.status || "pending";

  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Request #{request.id}</h3>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
          >
            <Clock className="h-3 w-3" />
            {status}
          </motion.span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-xl bg-secondary/30 px-3 py-2.5">
            <User className="h-4 w-4 text-primary/60 shrink-0" />
            <span className="text-muted-foreground">Buyer: <span className="font-semibold text-foreground">{request.buyerName || request.buyerEmail || "N/A"}</span></span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/30 px-3 py-2.5">
            <Home className="h-4 w-4 text-primary/60 shrink-0" />
            <span className="text-muted-foreground">Property: <span className="font-semibold text-foreground">{request.propertyTitle || request.propertyAddress || "N/A"}</span></span>
          </div>
          {request.type && (
            <Badge variant="outline" className="mt-1 rounded-lg border-white/10 text-muted-foreground">
              {request.type === "sale" ? "Purchase" : "Rental"}
            </Badge>
          )}
        </div>

        {status === "pending" && (
          <motion.div
            className="mt-4 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
              <Button
                size="sm"
                className="w-full rounded-xl bg-success hover:bg-success/90 text-success-foreground font-semibold"
                onClick={() => onApprove?.(request.id)}
              >
                <Check className="mr-1 h-4 w-4" /> Approve
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
              <Button
                size="sm"
                variant="destructive"
                className="w-full rounded-xl font-semibold"
                onClick={() => onReject?.(request.id)}
              >
                <X className="mr-1 h-4 w-4" /> Reject
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
