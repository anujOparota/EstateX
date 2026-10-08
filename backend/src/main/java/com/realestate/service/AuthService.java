package com.realestate.service;
import com.realestate.security.JwtUtil;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder enc;
    private final JwtUtil jwt;

    public AuthService(JdbcTemplate jdbc, PasswordEncoder enc, JwtUtil jwt) {
        this.jdbc = jdbc; this.enc = enc; this.jwt = jwt;
    }

    public Map<String,Object> login(String email, String password, String role) {
        return switch (role.toUpperCase()) {
            case "ADMIN" -> loginAdmin(email, password);
            case "OWNER" -> loginTable("owner", "owner_id", "owner_name", email, password, "OWNER");
            case "BUYER" -> loginBuyer(email, password);
            case "AGENT" -> loginTable("agent", "agent_id", "agent_name", email, password, "AGENT");
            default      -> throw new RuntimeException("Invalid role");
        };
    }

    private Map<String,Object> loginAdmin(String email, String password) {
        var rows = jdbc.queryForList(
            "SELECT admin_id, username, password_hash, email FROM admin WHERE email=?", email);
        if (rows.isEmpty()) throw new RuntimeException("Invalid credentials");
        var row = rows.get(0);
        if (!enc.matches(password, (String) row.get("password_hash")))
            throw new RuntimeException("Invalid credentials");
        int id = ((Number) row.get("admin_id")).intValue();
        Map<String,Object> resp = new HashMap<>();
        resp.put("token", jwt.generateToken(email, "ADMIN", id));
        resp.put("role",  "ADMIN");
        resp.put("refId", id);
        resp.put("name",  "Admin");
        resp.put("email", email);
        return resp;
    }

    private Map<String,Object> loginTable(String table, String idCol, String nameCol,
                                           String email, String password, String role) {
        var rows = jdbc.queryForList(
            "SELECT " + idCol + ", " + nameCol + ", password_hash FROM " + table + " WHERE email=?", email);
        if (rows.isEmpty()) throw new RuntimeException("Invalid credentials");
        var row = rows.get(0);
        if (!enc.matches(password, (String) row.get("password_hash")))
            throw new RuntimeException("Invalid credentials");
        int id      = ((Number) row.get(idCol)).intValue();
        String name = (String) row.get(nameCol);
        Map<String,Object> resp = new HashMap<>();
        resp.put("token", jwt.generateToken(email, role, id));
        resp.put("role",  role);
        resp.put("refId", id);
        resp.put("name",  name);
        resp.put("email", email);
        return resp;
    }

    // Dedicated buyer login — fetches category ("buy" or "rent") and returns it
    private Map<String,Object> loginBuyer(String email, String password) {
        var rows = jdbc.queryForList(
            "SELECT buyer_id, buyer_name, password_hash, category FROM buyer WHERE email=?", email);
        if (rows.isEmpty()) throw new RuntimeException("Invalid credentials");
        var row = rows.get(0);
        if (!enc.matches(password, (String) row.get("password_hash")))
            throw new RuntimeException("Invalid credentials");
        int id      = ((Number) row.get("buyer_id")).intValue();
        String name = (String) row.get("buyer_name");
        String cat  = (String) row.get("category");
        Map<String,Object> resp = new HashMap<>();
        resp.put("token",    jwt.generateToken(email, "BUYER", id));
        resp.put("role",     "BUYER");
        resp.put("refId",    id);
        resp.put("name",     name);
        resp.put("email",    email);
        resp.put("category", cat);
        return resp;
    }

    @Transactional
    public Map<String,Object> registerOwner(Map<String,Object> body) {
        String email = (String) body.get("email");
        checkEmailUnique("owner", email);
        jdbc.update("INSERT INTO owner (owner_name, contact_no, email, password_hash) VALUES (?,?,?,?)",
            body.get("name"), body.get("contactNo"), email, enc.encode((String) body.get("password")));
        int id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        Map<String,Object> resp = new HashMap<>();
        resp.put("token", jwt.generateToken(email, "OWNER", id));
        resp.put("role",  "OWNER");
        resp.put("refId", id);
        resp.put("name",  body.get("name"));
        resp.put("email", email);
        return resp;
    }

    @Transactional
    public Map<String,Object> registerBuyer(Map<String,Object> body) {
        String email    = (String) body.get("email");
        String category = (String) body.get("category");
        checkEmailUnique("buyer", email);
        jdbc.update("INSERT INTO buyer (buyer_name, contact_no, email, category, password_hash) VALUES (?,?,?,?,?)",
            body.get("name"), body.get("contactNo"), email, category, enc.encode((String) body.get("password")));
        int id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        Map<String,Object> resp = new HashMap<>();
        resp.put("token",    jwt.generateToken(email, "BUYER", id));
        resp.put("role",     "BUYER");
        resp.put("refId",    id);
        resp.put("name",     body.get("name"));
        resp.put("email",    email);
        resp.put("category", category);
        return resp;
    }

    private void checkEmailUnique(String table, String email) {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM " + table + " WHERE email=?", Integer.class, email);
        if (c != null && c > 0) throw new RuntimeException("Email already registered");
    }
}
