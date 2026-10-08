import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { adminApi } from "../../services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("agent");

  useEffect(() => {
    setUsers([]);
    adminApi.getUsers(activeTab)
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]));
  }, [activeTab]);

  const handleRemove = async (id) => {
    try {
      await adminApi.removeUser(id, activeTab);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User removed");
    } catch {
      toast.error("Failed to remove user");
    }
  };

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeUp}>Manage Users</motion.h2>
      <motion.div className="glass-card rounded-2xl p-6" variants={fadeUp} custom={1}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 rounded-xl p-1">
            <TabsTrigger value="agent" className="rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Agents</TabsTrigger>
            <TabsTrigger value="buyer" className="rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Buyers</TabsTrigger>
            <TabsTrigger value="owner" className="rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Owners</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {users.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No {activeTab}s found.</p>
            ) : (
              <div className="rounded-xl overflow-hidden border border-white/5">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Name</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Email</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        className="border-white/5 hover:bg-secondary/30 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-right">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                            <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => handleRemove(u.id)}>
                              <Trash2 className="mr-1 h-4 w-4" /> Remove
                            </Button>
                          </motion.div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
