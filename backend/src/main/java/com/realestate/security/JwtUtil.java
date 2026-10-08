package com.realestate.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret}") private String secret;
    @Value("${app.jwt.expiration}") private long expiration;

    private Key key() { return Keys.hmacShaKeyFor(secret.getBytes()); }

    public String generateToken(String email, String role, int refId) {
        return Jwts.builder()
            .setSubject(email)
            .claim("role", role)
            .claim("refId", refId)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(key(), SignatureAlgorithm.HS256).compact();
    }

    public Claims claims(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody();
    }
    public String getEmail(String token)  { return claims(token).getSubject(); }
    public String getRole(String token)   { return claims(token).get("role", String.class); }
    public int    getRefId(String token)  { return claims(token).get("refId", Integer.class); }
    public boolean isValid(String token)  { try { claims(token); return true; } catch (JwtException e) { return false; } }
}
