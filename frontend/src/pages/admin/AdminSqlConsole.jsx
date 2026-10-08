import { motion } from "framer-motion";
import SqlConsole from "../../components/admin/SqlConsole";
import { staggerContainer, fadeUp } from "../../components/MotionWrappers";

export default function AdminSqlConsole() {
  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground">SQL Console</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Run raw SQL queries directly against the database.
        </p>
      </motion.div>
      <SqlConsole />
    </motion.div>
  );
}
