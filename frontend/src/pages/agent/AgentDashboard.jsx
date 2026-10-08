import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { requestApi } from "../../services/api";
import RequestCard from "../../components/RequestCard";
import { toast } from "sonner";
import { ClipboardList } from "lucide-react";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";

export default function AgentDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestApi.getForAgent()
      .then((res) => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await requestApi.updateStatus(id, "approved");
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
      toast.success("Request approved");
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      await requestApi.updateStatus(id, "rejected");
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
      toast.success("Request rejected");
    } catch {
      toast.error("Failed to reject request");
    }
  };

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
      <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeUp}>Property Requests</motion.h2>
      {requests.length === 0 ? (
        <motion.div className="glass-card rounded-2xl p-16 text-center" variants={fadeUp} custom={1}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          </motion.div>
          <p className="text-muted-foreground text-lg">No incoming requests.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Requests from buyers will appear here.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r, i) => (
            <RequestCard key={r.id} request={r} onApprove={handleApprove} onReject={handleReject} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
