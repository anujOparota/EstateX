package com.realestate.controller;
import com.realestate.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/admin")
public class AdminController {
    private final AdminService svc;
    public AdminController(AdminService svc) { this.svc = svc; }

    @GetMapping("/stats")          public ResponseEntity<?> stats()            { return ResponseEntity.ok(svc.stats()); }
    @GetMapping("/properties")     public ResponseEntity<?> properties()       { return ResponseEntity.ok(svc.allProperties()); }
    @GetMapping("/owners")         public ResponseEntity<?> owners()           { return ResponseEntity.ok(svc.allOwners()); }
    @GetMapping("/buyers")         public ResponseEntity<?> buyers()           { return ResponseEntity.ok(svc.allBuyers()); }
    @GetMapping("/agents")         public ResponseEntity<?> agents()           { return ResponseEntity.ok(svc.allAgents()); }

    @PutMapping("/properties/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable int id) { svc.approveProperty(id); return ok("Property approved"); }
    @PutMapping("/properties/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable int id)  { svc.rejectProperty(id);  return ok("Property rejected"); }
    @DeleteMapping("/properties/{id}")
    public ResponseEntity<?> delProp(@PathVariable int id) { svc.deleteProperty(id);  return ok("Deleted"); }

    @PostMapping("/agents")
    public ResponseEntity<?> addAgent(@RequestBody Map<String,Object> body) {
        try { svc.addAgent(body); return ok("Agent added"); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
    @DeleteMapping("/owners/{id}") public ResponseEntity<?> delOwner(@PathVariable int id) { svc.deleteOwner(id); return ok("Deleted"); }
    @DeleteMapping("/buyers/{id}") public ResponseEntity<?> delBuyer(@PathVariable int id) { svc.deleteBuyer(id); return ok("Deleted"); }
    @DeleteMapping("/agents/{id}") public ResponseEntity<?> delAgent(@PathVariable int id) { svc.deleteAgent(id); return ok("Deleted"); }

    // ── Raw SQL endpoint (ADMIN only) ──
    @PostMapping("/query")
    public ResponseEntity<?> runQuery(@RequestBody Map<String,Object> body) {
        String sql = (String) body.get("sql");
        Map<String,Object> result = svc.runQuery(sql);
        // Return 400 if query failed
        if (Boolean.FALSE.equals(result.get("success"))) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    private ResponseEntity<?> ok(String msg) { return ResponseEntity.ok(Map.of("message", msg)); }
}
