package com.realestate.service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class BuyerService {
    private final JdbcTemplate jdbc;
    public BuyerService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Map<String,Object> profile(int buyerId) {
        return jdbc.queryForMap("SELECT buyer_id, buyer_name, contact_no, email, category, status FROM buyer WHERE buyer_id=?", buyerId);
    }

    public List<Map<String,Object>> browse(String type) {
        String filter = (type != null && (type.equals("sale") || type.equals("rent")))
            ? " AND (CASE WHEN ps.property_id IS NOT NULL THEN 'sale' ELSE 'rent' END)='" + type + "'" : "";
        return jdbc.queryForList(
            "SELECT pd.property_id, pd.address, pd.city, pd.date_listed, pd.year_of_construction, " +
            "pd.no_of_bedrooms, pd.size, pd.image_url, " +
            "o.owner_name, " +
            "a.agent_id, a.agent_name, a.rating as agent_rating, a.contact_no as agent_contact, " +
            "COALESCE(ps.sale_price, pr.rental_price) as price, " +
            "COALESCE(ps.sale_id, pr.rental_id) as listing_id, " +
            "CASE WHEN ps.property_id IS NOT NULL THEN 'sale' ELSE 'rent' END as type, " +
            "CASE WHEN ps.property_id IS NOT NULL THEN (ps.buyer_id IS NOT NULL) " +
            "     ELSE (pr.buyer_id IS NOT NULL AND pr.end_date IS NULL) END as is_taken " +
            "FROM property_details pd " +
            "JOIN owner o ON pd.owner_id=o.owner_id " +
            "LEFT JOIN property_for_sale ps ON pd.property_id=ps.property_id " +
            "LEFT JOIN property_for_rent pr ON pd.property_id=pr.property_id AND pr.end_date IS NULL " +
            "LEFT JOIN agent a ON COALESCE(ps.agent_id,pr.agent_id)=a.agent_id " +
            "WHERE pd.status='ACTIVE'" + filter + " ORDER BY pd.date_listed DESC");
    }

    public void sendRequest(int buyerId, Map<String,Object> body) {
        int propertyId = Integer.parseInt(body.get("propertyId").toString());
        int agentId    = Integer.parseInt(body.get("agentId").toString());
        String reqType = (String) body.get("requestType");
        String message = (String) body.getOrDefault("message", "");

        String cat = jdbc.queryForObject("SELECT category FROM buyer WHERE buyer_id=?", String.class, buyerId);
        if (!cat.equals(reqType))
            throw new RuntimeException("Your account is for '" + cat + "' only. You cannot " + reqType + ".");

        Integer dup = jdbc.queryForObject(
            "SELECT COUNT(*) FROM buyer_requests WHERE buyer_id=? AND property_id=? AND status='PENDING'",
            Integer.class, buyerId, propertyId);
        if (dup != null && dup > 0) throw new RuntimeException("You already have a pending request for this property.");

        jdbc.update("INSERT INTO buyer_requests (buyer_id, property_id, agent_id, request_type, message) VALUES (?,?,?,?,?)",
            buyerId, propertyId, agentId, reqType, message);
    }

    public List<Map<String,Object>> myRequests(int buyerId) {
        return jdbc.queryForList(
            "SELECT br.*, pd.address, pd.city, a.agent_name, a.contact_no as agent_contact, " +
            "COALESCE(ps.sale_price, pr.rental_price) as price " +
            "FROM buyer_requests br " +
            "JOIN property_details pd ON br.property_id=pd.property_id " +
            "JOIN agent a ON br.agent_id=a.agent_id " +
            "LEFT JOIN property_for_sale ps ON pd.property_id=ps.property_id " +
            "LEFT JOIN property_for_rent pr ON pd.property_id=pr.property_id AND pr.end_date IS NULL " +
            "WHERE br.buyer_id=? ORDER BY br.created_at DESC", buyerId);
    }

    // ── New: purchased properties (for buy category buyers) ───────────────────
    public List<Map<String,Object>> purchasedProperties(int buyerId) {
        return jdbc.queryForList(
            "SELECT pd.property_id, pd.address, pd.city, pd.year_of_construction, " +
            "pd.no_of_bedrooms, pd.size, pd.image_url, " +
            "ps.sale_price, ps.sale_date, " +
            "a.agent_name, a.contact_no as agent_contact, a.rating as agent_rating " +
            "FROM property_for_sale ps " +
            "JOIN property_details pd ON ps.property_id=pd.property_id " +
            "LEFT JOIN agent a ON ps.agent_id=a.agent_id " +
            "WHERE ps.buyer_id=? " +
            "ORDER BY ps.sale_date DESC", buyerId);
    }

    // ── New: active rentals (currently renting, end_date IS NULL) ─────────────
    public List<Map<String,Object>> activeRentals(int buyerId) {
        return jdbc.queryForList(
            "SELECT pd.property_id, pd.address, pd.city, pd.year_of_construction, " +
            "pd.no_of_bedrooms, pd.size, pd.image_url, " +
            "pr.rental_id, pr.rental_price, pr.start_date, pr.end_date, " +
            "a.agent_name, a.contact_no as agent_contact, a.rating as agent_rating " +
            "FROM property_for_rent pr " +
            "JOIN property_details pd ON pr.property_id=pd.property_id " +
            "LEFT JOIN agent a ON pr.agent_id=a.agent_id " +
            "WHERE pr.buyer_id=? AND pr.start_date IS NOT NULL AND pr.end_date IS NULL " +
            "ORDER BY pr.start_date DESC", buyerId);
    }

    // ── New: past rentals (ended, end_date IS NOT NULL) ───────────────────────
    public List<Map<String,Object>> pastRentals(int buyerId) {
        return jdbc.queryForList(
            "SELECT pd.property_id, pd.address, pd.city, pd.year_of_construction, " +
            "pd.no_of_bedrooms, pd.size, pd.image_url, " +
            "pr.rental_id, pr.rental_price, pr.start_date, pr.end_date, " +
            "a.agent_name, a.contact_no as agent_contact, a.rating as agent_rating " +
            "FROM property_for_rent pr " +
            "JOIN property_details pd ON pr.property_id=pd.property_id " +
            "LEFT JOIN agent a ON pr.agent_id=a.agent_id " +
            "WHERE pr.buyer_id=? AND pr.end_date IS NOT NULL " +
            "ORDER BY pr.end_date DESC", buyerId);
    }

    // ── New: combined endpoint — returns the right data based on buyer category
    public Map<String,Object> myProperties(int buyerId) {
        String category = jdbc.queryForObject(
            "SELECT category FROM buyer WHERE buyer_id=?", String.class, buyerId);

        Map<String,Object> result = new HashMap<>();
        result.put("category", category);

        if ("buy".equals(category)) {
            result.put("purchased", purchasedProperties(buyerId));
        } else {
            result.put("active_rentals", activeRentals(buyerId));
            result.put("past_rentals",   pastRentals(buyerId));
        }
        return result;
    }
}
