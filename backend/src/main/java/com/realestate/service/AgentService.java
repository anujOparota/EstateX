package com.realestate.service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class AgentService {
    private final JdbcTemplate jdbc;
    public AgentService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Map<String,Object> profile(int agentId) {
        return jdbc.queryForMap("SELECT agent_id, agent_name, contact_no, email, rating, total_ratings, experience_years, bio FROM agent WHERE agent_id=?", agentId);
    }


    public Map<String,Object> updateProfile(int agentId, Map<String,Object> body) {
        jdbc.update("UPDATE agent SET agent_name=?, email=?, contact_no=?, bio=? WHERE agent_id=?",
            body.getOrDefault("name", ""),
            body.getOrDefault("email", ""),
            body.getOrDefault("phone", body.getOrDefault("contactNo", "")),
            body.getOrDefault("bio", body.getOrDefault("address", "")),
            agentId);
        return profile(agentId);
    }

    public List<Map<String,Object>> myRequests(int agentId) {
        return jdbc.queryForList(
            "SELECT br.request_id, br.status, br.request_type, br.message, br.created_at, " +
            "pd.property_id, pd.address, pd.city, pd.no_of_bedrooms, pd.size, pd.image_url, " +
            "b.buyer_id, b.buyer_name, b.contact_no as buyer_contact, b.email as buyer_email, b.category, " +
            "COALESCE(ps.sale_price, pr.rental_price) as price, " +
            "COALESCE(ps.sale_id, pr.rental_id) as listing_id, " +
            "CASE WHEN ps.property_id IS NOT NULL THEN 'sale' ELSE 'rent' END as prop_type " +
            "FROM buyer_requests br " +
            "JOIN property_details pd ON br.property_id=pd.property_id " +
            "JOIN buyer b ON br.buyer_id=b.buyer_id " +
            "LEFT JOIN property_for_sale ps ON pd.property_id=ps.property_id " +
            "LEFT JOIN property_for_rent pr ON pd.property_id=pr.property_id AND pr.end_date IS NULL " +
            "WHERE br.agent_id=? ORDER BY br.created_at DESC", agentId);
    }

    public List<Map<String,Object>> myProperties(int agentId) {
        return jdbc.queryForList(
            "SELECT pd.property_id, pd.address, pd.city, pd.date_listed, pd.no_of_bedrooms, pd.size, pd.image_url, pd.status, " +
            "o.owner_name, " +
            "COALESCE(ps.sale_price, pr.rental_price) as price, " +
            "CASE WHEN ps.property_id IS NOT NULL THEN 'sale' ELSE 'rent' END as type, " +
            "COALESCE(ps.buyer_id, pr.buyer_id) as current_buyer_id " +
            "FROM property_details pd " +
            "JOIN owner o ON pd.owner_id=o.owner_id " +
            "LEFT JOIN property_for_sale ps ON pd.property_id=ps.property_id AND ps.agent_id=? " +
            "LEFT JOIN property_for_rent pr ON pd.property_id=pr.property_id AND pr.agent_id=? AND pr.end_date IS NULL " +
            "WHERE (ps.agent_id=? OR pr.agent_id=?) ORDER BY pd.date_listed DESC",
            agentId, agentId, agentId, agentId);
    }

    @Transactional
    public void handleRequest(int requestId, String action, int agentId) {
        var rows = jdbc.queryForList("SELECT * FROM buyer_requests WHERE request_id=? AND agent_id=?", requestId, agentId);
        if (rows.isEmpty()) throw new RuntimeException("Request not found");
        Map<String,Object> req = rows.get(0);
        int buyerId    = ((Number) req.get("buyer_id")).intValue();
        int propertyId = ((Number) req.get("property_id")).intValue();
        String type    = (String) req.get("request_type");

        switch (action.toUpperCase()) {
            case "ACCEPT" -> {
                if (type.equals("buy")) {
                    jdbc.update("CALL buy_property(?,?)", propertyId, buyerId);
                } else {
                    Integer rentalId = jdbc.queryForObject(
                        "SELECT rental_id FROM property_for_rent WHERE property_id=? AND buyer_id IS NULL AND end_date IS NULL LIMIT 1",
                        Integer.class, propertyId);
                    if (rentalId == null) throw new RuntimeException("No available rental listing found for this property.");
                    jdbc.update("CALL rent_property(?,?)", rentalId, buyerId);
                }
                jdbc.update("UPDATE buyer_requests SET status='ACCEPTED' WHERE request_id=?", requestId);
                jdbc.update("UPDATE buyer_requests SET status='REJECTED' WHERE property_id=? AND request_id!=? AND status='PENDING'", propertyId, requestId);
            }
            case "REJECT"           -> jdbc.update("UPDATE buyer_requests SET status='REJECTED' WHERE request_id=?", requestId);
            case "VISIT_SCHEDULED"  -> jdbc.update("UPDATE buyer_requests SET status='VISIT_SCHEDULED' WHERE request_id=?", requestId);
            default -> throw new RuntimeException("Invalid action: " + action);
        }
    }

    @Transactional
    public void endRental(int rentalId, int agentId) {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM property_for_rent WHERE rental_id=? AND agent_id=?", Integer.class, rentalId, agentId);
        if (c == null || c == 0) throw new RuntimeException("Rental not found or not yours");
        jdbc.update("CALL end_rent(?)", rentalId);
    }
}
