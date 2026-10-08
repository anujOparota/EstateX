package com.realestate.service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class OwnerService {
    private final JdbcTemplate jdbc;
    public OwnerService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Map<String,Object> profile(int ownerId) {
        return jdbc.queryForMap("SELECT owner_id, owner_name, contact_no, email FROM owner WHERE owner_id=?", ownerId);
    }

    public List<Map<String,Object>> myProperties(int ownerId) {
        return jdbc.queryForList(
            "SELECT pd.property_id, pd.address, pd.city, pd.date_listed, pd.year_of_construction, " +
            "pd.no_of_bedrooms, pd.size, pd.image_url, pd.status, " +
            "a.agent_id, a.agent_name, a.rating as agent_rating, " +
            "COALESCE(ps.sale_price, pr.rental_price) as price, " +
            "CASE WHEN ps.property_id IS NOT NULL THEN 'sale' ELSE 'rent' END as type, " +
            "CASE WHEN ps.property_id IS NOT NULL THEN (ps.buyer_id IS NOT NULL) " +
            "     ELSE (pr.buyer_id IS NOT NULL AND pr.end_date IS NULL) END as is_taken " +
            "FROM property_details pd " +
            "LEFT JOIN property_for_sale ps ON pd.property_id=ps.property_id " +
            "LEFT JOIN property_for_rent pr ON pd.property_id=pr.property_id AND pr.end_date IS NULL " +
            "LEFT JOIN agent a ON COALESCE(ps.agent_id,pr.agent_id)=a.agent_id " +
            "WHERE pd.owner_id=? ORDER BY pd.date_listed DESC", ownerId);
    }

    public List<Map<String,Object>> agents() {
        return jdbc.queryForList(
            "SELECT agent_id, agent_name, contact_no, email, rating, total_ratings, experience_years, bio FROM agent ORDER BY rating DESC");
    }

    public void addProperty(Map<String,Object> b, int ownerId) {
        String type    = (String) b.get("type");
        double price   = Double.parseDouble(b.get("price").toString());
        int agentId    = Integer.parseInt(b.get("agentId").toString());
        String address = (String) b.get("address");
        String city    = (String) b.get("city");
        String date    = (String) b.get("dateListed");
        int year       = Integer.parseInt(b.get("yearOfConstruction").toString());
        int beds       = Integer.parseInt(b.get("bedrooms").toString());
        double size    = Double.parseDouble(b.get("size").toString());
        String img     = (String) b.getOrDefault("imageUrl", null);

        jdbc.update("CALL add_property(?,?,?,?,?,?,?,?,?,?)",
            address, city, java.sql.Date.valueOf(date), year, beds, size, ownerId, type, price, agentId);

        if (img != null && !img.isBlank()) {
            int propId = jdbc.queryForObject(
                "SELECT property_id FROM property_details WHERE owner_id=? ORDER BY property_id DESC LIMIT 1",
                Integer.class, ownerId);
            jdbc.update("UPDATE property_details SET image_url=? WHERE property_id=?", img, propId);
        }
    }

    public void deleteProperty(int propertyId, int ownerId) {
        Integer c = jdbc.queryForObject(
            "SELECT COUNT(*) FROM property_details WHERE property_id=? AND owner_id=?", Integer.class, propertyId, ownerId);
        if (c == null || c == 0) throw new RuntimeException("Property not found or access denied");
        jdbc.update("DELETE FROM property_details WHERE property_id=?", propertyId);
    }
}
