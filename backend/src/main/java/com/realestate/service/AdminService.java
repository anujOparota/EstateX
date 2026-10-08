package com.realestate.service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AdminService {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder enc;
    public AdminService(JdbcTemplate jdbc, PasswordEncoder enc) { this.jdbc = jdbc; this.enc = enc; }

    public Map<String,Object> stats() {
        Map<String,Object> s = new HashMap<>();
        s.put("totalProperties",   q("SELECT COUNT(*) FROM property_details"));
        s.put("pendingProperties", q("SELECT COUNT(*) FROM property_details WHERE status='PENDING'"));
        s.put("activeProperties",  q("SELECT COUNT(*) FROM property_details WHERE status='ACTIVE'"));
        s.put("rejectedProperties",q("SELECT COUNT(*) FROM property_details WHERE status='REJECTED'"));
        s.put("totalAgents",  q("SELECT COUNT(*) FROM agent"));
        s.put("totalBuyers",  q("SELECT COUNT(*) FROM buyer"));
        s.put("totalOwners",  q("SELECT COUNT(*) FROM owner"));
        s.put("totalSales",   q("SELECT COUNT(*) FROM property_for_sale WHERE buyer_id IS NOT NULL"));
        s.put("activeRentals",q("SELECT COUNT(*) FROM property_for_rent WHERE buyer_id IS NOT NULL AND end_date IS NULL"));
        return s;
    }

    private int q(String sql) {
        Integer r = jdbc.queryForObject(sql, Integer.class);
        return r == null ? 0 : r;
    }

    public List<Map<String,Object>> allProperties() {
        return jdbc.queryForList(
            "SELECT pd.property_id, pd.address, pd.city, pd.date_listed, pd.no_of_bedrooms, " +
            "pd.size, pd.image_url, pd.status, pd.year_of_construction, " +
            "o.owner_name, o.owner_id, " +
            "a.agent_name, a.rating as agent_rating, a.agent_id, " +
            "COALESCE(ps.sale_price, pr.rental_price) as price, " +
            "CASE WHEN ps.property_id IS NOT NULL THEN 'sale' ELSE 'rent' END as type " +
            "FROM property_details pd " +
            "JOIN owner o ON pd.owner_id=o.owner_id " +
            "LEFT JOIN property_for_sale ps ON pd.property_id=ps.property_id " +
            "LEFT JOIN property_for_rent pr ON pd.property_id=pr.property_id AND pr.end_date IS NULL " +
            "LEFT JOIN agent a ON COALESCE(ps.agent_id,pr.agent_id)=a.agent_id " +
            "ORDER BY pd.date_listed DESC");
    }

    public void approveProperty(int id) { jdbc.update("UPDATE property_details SET status='ACTIVE' WHERE property_id=?", id); }
    public void rejectProperty(int id)  { jdbc.update("UPDATE property_details SET status='REJECTED' WHERE property_id=?", id); }
    public void deleteProperty(int id)  { jdbc.update("DELETE FROM property_details WHERE property_id=?", id); }

    public List<Map<String,Object>> allOwners() {
        return jdbc.queryForList("SELECT owner_id, owner_name, contact_no, email FROM owner ORDER BY owner_id DESC");
    }
    public List<Map<String,Object>> allBuyers() {
        return jdbc.queryForList("SELECT buyer_id, buyer_name, contact_no, email, category, status FROM buyer ORDER BY buyer_id DESC");
    }
    public List<Map<String,Object>> allAgents() {
        return jdbc.queryForList("SELECT agent_id, agent_name, contact_no, email, rating, total_ratings, experience_years, bio FROM agent ORDER BY agent_id DESC");
    }

    public void addAgent(Map<String,Object> b) {
        jdbc.update("INSERT INTO agent (agent_name, contact_no, email, password_hash, experience_years, bio) VALUES (?,?,?,?,?,?)",
            b.get("name"), b.get("contactNo"), b.get("email"),
            enc.encode((String) b.get("password")),
            b.getOrDefault("experience", 0), b.getOrDefault("bio", ""));
    }

    public void deleteOwner(int id)  { jdbc.update("DELETE FROM owner WHERE owner_id=?",  id); }
    public void deleteBuyer(int id)  { jdbc.update("DELETE FROM buyer WHERE buyer_id=?",  id); }
    public void deleteAgent(int id)  { jdbc.update("DELETE FROM agent WHERE agent_id=?",  id); }

    // ── Raw SQL execution ──────────────────────────────────────────────────────
    // Blocked keywords — prevent accidental destructive operations
    private static final List<String> BLOCKED = List.of("DROP", "TRUNCATE", "ALTER", "CREATE", "RENAME");

    public Map<String,Object> runQuery(String sql) {
        if (sql == null || sql.isBlank())
            return error("SQL cannot be empty.");

        String trimmed = sql.trim();
        String upper   = trimmed.toUpperCase();

        // Safety check
        for (String kw : BLOCKED) {
            if (upper.matches("(?s).*\\b" + kw + "\\b.*"))
                return error("Blocked keyword: " + kw + ". This operation is not allowed from the UI.");
        }

        long start = System.currentTimeMillis();
        try {
            if (upper.startsWith("SELECT") || upper.startsWith("SHOW") || upper.startsWith("DESCRIBE") || upper.startsWith("WITH")) {
                List<Map<String,Object>> rows = jdbc.queryForList(trimmed);
                long ms = System.currentTimeMillis() - start;
                List<String> columns = rows.isEmpty() ? List.of() : new ArrayList<>(rows.get(0).keySet());
                Map<String,Object> res = new HashMap<>();
                res.put("success", true);
                res.put("columns", columns);
                res.put("rows", rows);
                res.put("executionTimeMs", ms);
                res.put("message", rows.size() + " row(s) returned");
                return res;
            } else {
                int affected = jdbc.update(trimmed);
                long ms = System.currentTimeMillis() - start;
                Map<String,Object> res = new HashMap<>();
                res.put("success", true);
                res.put("rowsAffected", affected);
                res.put("executionTimeMs", ms);
                res.put("message", affected + " row(s) affected");
                return res;
            }
        } catch (Exception e) {
            return error("SQL Error: " + e.getMessage());
        }
    }

    private Map<String,Object> error(String msg) {
        Map<String,Object> r = new HashMap<>();
        r.put("success", false);
        r.put("message", msg);
        return r;
    }
}
