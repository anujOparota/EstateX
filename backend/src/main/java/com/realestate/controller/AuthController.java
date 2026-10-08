package com.realestate.controller;
import com.realestate.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService svc;
    public AuthController(AuthService svc) { this.svc = svc; }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,Object> body) {
        try {
            return ResponseEntity.ok(svc.login(
                (String) body.get("email"),
                (String) body.get("password"),
                (String) body.get("role")));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/register/owner")
    public ResponseEntity<?> registerOwner(@RequestBody Map<String,Object> body) {
        try { return ResponseEntity.ok(svc.registerOwner(body)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/register/buyer")
    public ResponseEntity<?> registerBuyer(@RequestBody Map<String,Object> body) {
        try { return ResponseEntity.ok(svc.registerBuyer(body)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}
