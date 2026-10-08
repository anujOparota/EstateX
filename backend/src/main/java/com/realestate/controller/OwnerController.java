package com.realestate.controller;
import com.realestate.security.JwtUtil;
import com.realestate.service.OwnerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/owner")
public class OwnerController {
    private final OwnerService svc; private final JwtUtil jwt;
    public OwnerController(OwnerService svc, JwtUtil jwt) { this.svc = svc; this.jwt = jwt; }

    private int id(HttpServletRequest r) { return jwt.getRefId(r.getHeader("Authorization").substring(7)); }

    @GetMapping("/profile")      public ResponseEntity<?> profile(HttpServletRequest r)    { return ResponseEntity.ok(svc.profile(id(r))); }
    @GetMapping("/properties")   public ResponseEntity<?> myProps(HttpServletRequest r)    { return ResponseEntity.ok(svc.myProperties(id(r))); }
    @GetMapping("/agents")       public ResponseEntity<?> agents()                          { return ResponseEntity.ok(svc.agents()); }

    @PostMapping("/properties")
    public ResponseEntity<?> add(@RequestBody Map<String,Object> body, HttpServletRequest r) {
        try { svc.addProperty(body, id(r)); return ResponseEntity.ok(Map.of("message","Property listed. Awaiting admin approval.")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @DeleteMapping("/properties/{id}")
    public ResponseEntity<?> del(@PathVariable int id, HttpServletRequest r) {
        try { svc.deleteProperty(id, id(r)); return ResponseEntity.ok(Map.of("message","Deleted")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}
