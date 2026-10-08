package com.realestate.controller;
import com.realestate.security.JwtUtil;
import com.realestate.service.BuyerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/buyer")
public class BuyerController {
    private final BuyerService svc; private final JwtUtil jwt;
    public BuyerController(BuyerService svc, JwtUtil jwt) { this.svc = svc; this.jwt = jwt; }
    private int id(HttpServletRequest r) { return jwt.getRefId(r.getHeader("Authorization").substring(7)); }

    @GetMapping("/profile")     public ResponseEntity<?> profile(HttpServletRequest r)                    { return ResponseEntity.ok(svc.profile(id(r))); }
    @GetMapping("/browse")      public ResponseEntity<?> browse(@RequestParam(required=false) String type) { return ResponseEntity.ok(svc.browse(type)); }
    @GetMapping("/requests")    public ResponseEntity<?> myRequests(HttpServletRequest r)                  { return ResponseEntity.ok(svc.myRequests(id(r))); }

    // Returns purchased properties (buy category) or active+past rentals (rent category)
    @GetMapping("/my-properties")
    public ResponseEntity<?> myProperties(HttpServletRequest r) {
        try { return ResponseEntity.ok(svc.myProperties(id(r))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/request")
    public ResponseEntity<?> send(@RequestBody Map<String,Object> body, HttpServletRequest r) {
        try { svc.sendRequest(id(r), body); return ResponseEntity.ok(Map.of("message","Request sent to agent.")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}
