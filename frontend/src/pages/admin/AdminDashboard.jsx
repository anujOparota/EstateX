import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { adminApi } from "../../services/api";
import StatsCard from "../../components/StatsCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, ShoppingCart, UserCheck, Trash2, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";
import { fadeUp, staggerContainer } from "../../components/MotionWrappers";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend, RadialBarChart, RadialBar
} from "recharts";

const topOwners = [
  { name: "Rahul S.", properties: 14 },
  { name: "Priya M.", properties: 11 },
  { name: "Amit K.", properties: 9 },
  { name: "Sneha R.", properties: 7 },
  { name: "Vikram P.", properties: 5 },
];

const topBuyers = [
  { name: "Arjun D.", purchases: 6 },
  { name: "Meera T.", purchases: 5 },
  { name: "Kiran L.", purchases: 4 },
  { name: "Neha G.", purchases: 3 },
  { name: "Rohan V.", purchases: 2 },
];

const topAgents = [
  { name: "Agent Raj", deals: 18, fill: "hsl(38, 90%, 55%)" },
  { name: "Agent Sara", deals: 14, fill: "hsl(38, 70%, 45%)" },
  { name: "Agent Dev", deals: 11, fill: "hsl(228, 15%, 35%)" },
  { name: "Agent Neha", deals: 8, fill: "hsl(228, 15%, 28%)" },
];

const propertyDistribution = [
  { name: "Sale", value: 45, color: "hsl(38, 90%, 55%)" },
  { name: "Rent", value: 30, color: "hsl(200, 70%, 50%)" },
  { name: "Commercial", value: 15, color: "hsl(142, 76%, 36%)" },
  { name: "Land", value: 10, color: "hsl(280, 60%, 50%)" },
];

const monthlyActivity = [
  { month: "Jan", listings: 12, requests: 28, deals: 5 },
  { month: "Feb", listings: 18, requests: 35, deals: 8 },
  { month: "Mar", listings: 22, requests: 42, deals: 12 },
  { month: "Apr", listings: 15, requests: 38, deals: 10 },
  { month: "May", listings: 28, requests: 55, deals: 15 },
  { month: "Jun", listings: 32, requests: 62, deals: 18 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl px-4 py-3 border border-white/10 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl px-4 py-3 border border-white/10 shadow-xl">
        <p className="text-xs font-semibold text-foreground">
          {payload[0].name}: <span className="text-primary">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("agent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

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
      {/* Stats */}
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Properties" value={stats?.totalProperties ?? 92} icon={Building2} index={0} />
          <StatsCard title="Total Agents" value={stats?.totalAgents ?? 24} icon={UserCheck} index={1} />
          <StatsCard title="Total Buyers" value={stats?.totalBuyers ?? 156} icon={ShoppingCart} index={2} />
          <StatsCard title="Total Owners" value={stats?.totalOwners ?? 38} icon={Users} index={3} />
        </div>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2 glass-card rounded-2xl p-6"
          variants={fadeUp}
          custom={2}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center gap-2 mb-6">
            <motion.div
              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Activity className="w-4 h-4 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Monthly Activity</h3>
              <p className="text-[10px] text-muted-foreground">Listings, requests & deals over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyActivity}>
              <defs>
                <linearGradient id="gradListings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 90%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 90%, 55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDeals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 18%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(220, 10%, 55%)" }} />
              <Area type="monotone" dataKey="listings" stroke="hsl(38, 90%, 55%)" fill="url(#gradListings)" strokeWidth={2} name="Listings" />
              <Area type="monotone" dataKey="requests" stroke="hsl(200, 70%, 50%)" fill="url(#gradRequests)" strokeWidth={2} name="Requests" />
              <Area type="monotone" dataKey="deals" stroke="hsl(142, 76%, 36%)" fill="url(#gradDeals)" strokeWidth={2} name="Deals" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="glass-card rounded-2xl p-6"
          variants={fadeUp}
          custom={3}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-1">Property Types</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Distribution by category</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={propertyDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                {propertyDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {propertyDistribution.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-muted-foreground">{item.name}</span>
                <span className="text-[11px] font-semibold text-foreground ml-auto">{item.value}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div className="glass-card rounded-2xl p-6" variants={fadeUp} custom={4} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
          <h3 className="text-sm font-semibold text-foreground mb-1">Top Property Owners</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Most properties held</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topOwners} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 18%)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="properties" fill="hsl(38, 90%, 55%)" radius={[0, 6, 6, 0]} name="Properties" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card rounded-2xl p-6" variants={fadeUp} custom={5} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
          <h3 className="text-sm font-semibold text-foreground mb-1">Top Buyers</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Most properties purchased</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topBuyers} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 18%)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="purchases" fill="hsl(200, 70%, 50%)" radius={[0, 6, 6, 0]} name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card rounded-2xl p-6" variants={fadeUp} custom={6} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
          <h3 className="text-sm font-semibold text-foreground mb-1">Top Agents</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Most deals closed</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={topAgents} startAngle={180} endAngle={0}>
              <RadialBar dataKey="deals" cornerRadius={6} background={{ fill: "hsl(228, 15%, 14%)" }} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {topAgents.map((a, i) => (
              <motion.div
                key={i}
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.fill }} />
                  <span className="text-[11px] text-muted-foreground">{a.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-foreground">{a.deals} deals</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Manage Users Table */}
      <motion.div className="glass-card rounded-2xl p-6" variants={fadeUp} custom={7}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Manage Users</h3>
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
