package com.realestate.controller;
import com.realestate.security.JwtUtil;
import com.realestate.service.AgentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/agent")
public class AgentController {
    private final AgentService svc; private final JwtUtil jwt;
    public AgentController(AgentService svc, JwtUtil jwt) { this.svc = svc; this.jwt = jwt; }
    private int id(HttpServletRequest r) { return jwt.getRefId(r.getHeader("Authorization").substring(7)); }

    @GetMapping("/profile")    public ResponseEntity<?> profile(HttpServletRequest r)   { return ResponseEntity.ok(svc.profile(id(r))); }
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String,Object> body, HttpServletRequest r) {
        try { return ResponseEntity.ok(svc.updateProfile(id(r), body)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
    @GetMapping("/requests")   public ResponseEntity<?> requests(HttpServletRequest r)   { return ResponseEntity.ok(svc.myRequests(id(r))); }
    @GetMapping("/properties") public ResponseEntity<?> properties(HttpServletRequest r) { return ResponseEntity.ok(svc.myProperties(id(r))); }

    @PutMapping("/requests/{requestId}")
    public ResponseEntity<?> handle(@PathVariable int requestId,
                                    @RequestBody Map<String,Object> body,
                                    HttpServletRequest r) {
        try { svc.handleRequest(requestId, (String) body.get("action"), id(r)); return ResponseEntity.ok(Map.of("message","Done")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PutMapping("/rentals/{rentalId}/end")
    public ResponseEntity<?> endRent(@PathVariable int rentalId, HttpServletRequest r) {
        try { svc.endRental(rentalId, id(r)); return ResponseEntity.ok(Map.of("message","Rental ended")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}
