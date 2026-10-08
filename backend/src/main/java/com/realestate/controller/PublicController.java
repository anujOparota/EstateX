package com.realestate.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final JdbcTemplate jdbc;

    public PublicController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * GET /api/public/stats
     * No authentication required — used by the login page to show live counts.
     */
    @GetMapping("/stats")
    public ResponseEntity<?> publicStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total active properties visible to buyers
        stats.put("totalProperties",
            q("SELECT COUNT(*) FROM property_details WHERE status = 'ACTIVE'"));

        // Total agents
        stats.put("totalAgents",
            q("SELECT COUNT(*) FROM agent"));

        // Total buyers registered
        stats.put("totalBuyers",
            q("SELECT COUNT(*) FROM buyer"));

        // Total owners registered
        stats.put("totalOwners",
            q("SELECT COUNT(*) FROM owner"));

        // Properties for sale (active)
        stats.put("forSale",
            q("SELECT COUNT(*) FROM property_details pd " +
              "JOIN property_for_sale ps ON pd.property_id = ps.property_id " +
              "WHERE pd.status = 'ACTIVE'"));

        // Properties for rent (active, not currently rented)
        stats.put("forRent",
            q("SELECT COUNT(*) FROM property_details pd " +
              "JOIN property_for_rent pr ON pd.property_id = pr.property_id " +
              "WHERE pd.status = 'ACTIVE' AND pr.end_date IS NULL AND pr.buyer_id IS NULL"));

        // Average agent rating (rounded to 1 decimal)
        Double avgRating = jdbc.queryForObject(
            "SELECT ROUND(AVG(rating), 1) FROM agent WHERE total_ratings > 0",
            Double.class);
        stats.put("avgAgentRating", avgRating != null ? avgRating : 0.0);

        // Total deals closed (sold + currently rented)
        stats.put("dealsClosed",
            q("SELECT COUNT(*) FROM property_for_sale WHERE sale_date IS NOT NULL") +
            q("SELECT COUNT(*) FROM property_for_rent WHERE start_date IS NOT NULL AND end_date IS NULL"));

        return ResponseEntity.ok(stats);
    }

    private int q(String sql) {
        Integer r = jdbc.queryForObject(sql, Integer.class);
        return r == null ? 0 : r;
    }
}
