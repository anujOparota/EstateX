import { motion } from "framer-motion";
import { fadeUp } from "./MotionWrappers";

export default function StatsCard({ title, value, icon: Icon, className = "", index = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-primary/5 hover:shadow-xl group ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <motion.p
            className="mt-2 text-3xl font-bold tabular-nums text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3, type: "spring", stiffness: 100 }}
          >
            {value ?? "—"}
          </motion.p>
        </div>
        {Icon && (
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon className="h-6 w-6 text-primary" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
