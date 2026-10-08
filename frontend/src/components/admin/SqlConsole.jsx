import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Terminal, Play, Loader2, History, Trash2, Database,
  CheckCircle2, XCircle, Sparkles, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../services/api";
import { fadeUp } from "../MotionWrappers";

const SAMPLE_QUERIES = [
  { label: "All Owners", sql: "SELECT owner_id,owner_name, contact_no,email FROM owner LIMIT 20;" },
  { label: "All Buyers", sql: "SELECT buyer_id,buyer_name,contact_no,email FROM buyer LIMIT 20;" },
  { label: "All Agents", sql: "SELECT agent_id,agent_name,contact_no,email FROM agent LIMIT 20;" },
  { label: "Properties For Sale", sql: "SELECT * FROM property_for_sale LIMIT 20;" },
  { label: "Properties For Rent", sql: "SELECT * FROM property_for_rent LIMIT 20;" },
  { label: "e.i", sql: "SELECT a.agent_id, a.agent_name, AVG(pfs.sale_price) AS avg_selling_price, AVG(DATEDIFF( pd.date_listed,pfs.sale_date)) AS avg_days_on_market FROM agent a JOIN property_for_sale pfs ON a.agent_id = pfs.agent_id JOIN property_details pd ON pfs.property_id = pd.property_id WHERE YEAR(pfs.sale_date) = 2018 GROUP BY a.agent_id, a.agent_name;" },
  { label: "Pending Requests", sql: "SELECT * FROM buyer_requests WHERE status = 'pending';" },
  { label: "Count by Role", sql: "SELECT 'owner' AS role, COUNT(*) AS total FROM owner\nUNION ALL SELECT 'buyer', COUNT(*) FROM buyer\nUNION ALL SELECT 'agent', COUNT(*) FROM agent;" },
];

export default function SqlConsole() {
  const [sql, setSql] = useState("SELECT * FROM owner LIMIT 10;");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null); // { columns, rows, rowCount, type, durationMs }
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const textareaRef = useRef(null);

  const isWriteQuery = (q) =>
    /^\s*(insert|update|delete|drop|alter|create|truncate)\b/i.test(q);

  const execute = async () => {
    const trimmed = sql.trim();
    if (!trimmed) {
      toast.error("Query is empty");
      return;
    }
    if (isWriteQuery(trimmed)) {
      const ok = window.confirm(
        "This is a write/DDL query that will modify the database. Continue?"
      );
      if (!ok) return;
    }

    setRunning(true);
    setError(null);
    setResult(null);
    const startedAt = performance.now();

    try {
      const res = await adminApi.runSql(trimmed);
      const durationMs = Math.round(performance.now() - startedAt);
      const data = res.data || {};
      const normalized = {
        columns: data.columns || (data.rows?.[0] ? Object.keys(data.rows[0]) : []),
        rows: data.rows || [],
        rowCount: data.rowCount ?? data.rows?.length ?? 0,
        type: data.type || (isWriteQuery(trimmed) ? "write" : "read"),
        durationMs,
        message: data.message,
      };
      setResult(normalized);
      setHistory((prev) => [
        { sql: trimmed, status: "success", at: new Date(), rowCount: normalized.rowCount },
        ...prev,
      ].slice(0, 20));
      toast.success(`Query OK • ${normalized.rowCount} row(s) • ${durationMs}ms`);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to execute query (backend not connected yet).";
      setError(msg);
      setHistory((prev) => [
        { sql: trimmed, status: "error", at: new Date(), error: msg },
        ...prev,
      ].slice(0, 20));
      toast.error("Query failed");
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      execute();
    }
  };

  const insertSample = (q) => {
    setSql(q);
    textareaRef.current?.focus();
  };

  const copyResult = () => {
    if (!result?.rows?.length) return;
    const csv = [
      result.columns.join(","),
      ...result.rows.map((r) =>
        result.columns.map((c) => JSON.stringify(r[c] ?? "")).join(",")
      ),
    ].join("\n");
    navigator.clipboard.writeText(csv);
    toast.success("Copied as CSV");
  };

  return (
    <motion.div
      className="glass-card rounded-2xl p-6 relative overflow-hidden"
      variants={fadeUp}
      custom={8}
    >
      {/* Animated glow accent */}
      <motion.div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20"
            whileHover={{ rotate: 8, scale: 1.05 }}
          >
            <Terminal className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              SQL Console
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Admin
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Run raw SQL against the connected MySQL database
            </p>
          </div>
        </div>
      </div>

      {/* Sample chips */}
      <div className="flex flex-wrap gap-2 mb-3 relative">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3" /> Quick:
        </span>
        {SAMPLE_QUERIES.map((s, i) => (
          <motion.button
            key={s.label}
            onClick={() => insertSample(s.sql)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-white/5 transition-colors"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            {s.label}
          </motion.button>
        ))}
      </div>

      {/* Editor */}
      <div className="relative rounded-xl border border-white/10 bg-[hsl(228,15%,8%)] overflow-hidden mb-3">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2">
              query.sql
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground hidden sm:block">
            ⌘/Ctrl + Enter to run
          </span>
        </div>
        <Textarea
          ref={textareaRef}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="min-h-[160px] font-mono text-[13px] leading-relaxed bg-transparent border-0 resize-y rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/50"
          placeholder="SELECT * FROM property_details LIMIT 10;"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={execute}
              disabled={running}
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Execute
                </>
              )}
            </Button>
          </motion.div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSql("");
              setResult(null);
              setError(null);
            }}
            className="rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Clear
          </Button>
        </div>
        {isWriteQuery(sql) && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[11px] px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20"
          >
            ⚠ Write/DDL — confirmation required
          </motion.span>
        )}
      </div>

      {/* Output */}
      <Tabs defaultValue="result">
        <TabsList className="bg-secondary/50 rounded-xl p-1">
          <TabsTrigger
            value="result"
            className="rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Database className="w-3.5 h-3.5 mr-1.5" /> Result
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <History className="w-3.5 h-3.5 mr-1.5" /> History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="result" className="mt-3">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex gap-3"
              >
                <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-destructive">Execution failed</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1 break-words">
                    {error}
                  </p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {result.rowCount} row(s) • {result.durationMs}ms
                    {result.message && <span className="ml-1">• {result.message}</span>}
                  </span>
                  {result.rows?.length > 0 && (
                    <button
                      onClick={copyResult}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy CSV
                    </button>
                  )}
                </div>
                {result.rows?.length > 0 ? (
                  <div className="rounded-xl overflow-hidden border border-white/5 max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur z-10">
                        <TableRow className="border-white/5 hover:bg-transparent">
                          {result.columns.map((c) => (
                            <TableHead
                              key={c}
                              className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono"
                            >
                              {c}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.rows.map((row, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.4) }}
                            className="border-white/5 hover:bg-secondary/30 transition-colors"
                          >
                            {result.columns.map((c) => (
                              <TableCell
                                key={c}
                                className="text-xs font-mono text-foreground/90 max-w-[260px] truncate"
                                title={String(row[c] ?? "")}
                              >
                                {row[c] === null || row[c] === undefined ? (
                                  <span className="text-muted-foreground italic">NULL</span>
                                ) : typeof row[c] === "object" ? (
                                  JSON.stringify(row[c])
                                ) : (
                                  String(row[c])
                                )}
                              </TableCell>
                            ))}
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/5 p-6 text-center text-sm text-muted-foreground">
                    Query executed successfully. No rows returned.
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-dashed border-white/10 p-8 text-center"
              >
                <Terminal className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Write a query above and hit{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px]">
                    Execute
                  </kbd>{" "}
                  to see results.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="mt-3">
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
              No queries yet. History is kept for this session only.
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {history.map((h, i) => (
                <motion.button
                  key={i}
                  onClick={() => setSql(h.sql)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="w-full text-left rounded-xl border border-white/5 bg-secondary/30 hover:bg-secondary/60 p-3 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      {h.status === "success" ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-destructive" />
                      )}
                      <span className="text-muted-foreground">
                        {h.at.toLocaleTimeString()}
                      </span>
                      {h.status === "success" && (
                        <span className="text-muted-foreground">• {h.rowCount} row(s)</span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to reuse
                    </span>
                  </div>
                  <code className="text-[11px] font-mono text-foreground/80 line-clamp-2 break-all">
                    {h.sql}
                  </code>
                  {h.error && (
                    <p className="text-[11px] text-destructive/80 mt-1 line-clamp-1">
                      {h.error}
                    </p>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
