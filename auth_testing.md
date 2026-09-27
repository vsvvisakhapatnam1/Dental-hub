# Auth Testing Playbook (Dental Opportunity Hub)

This app uses opaque session-token auth (stored in `user_sessions`) for BOTH email/password login and Emergent Google OAuth. Token is sent via httpOnly cookie `session_token` OR `Authorization: Bearer <token>`.

## Admin
- Email: vsv.visakhapatnam@gmail.com
- Password: (see /app/memory/test_credentials.md)
- Role: admin

## Backend API checks
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
# Register seeker
curl -s -c c.txt -X POST "$API/api/auth/register" -H "Content-Type: application/json" \
  -d '{"email":"seek@test.com","password":"pass1234","name":"Dr Test","role":"seeker","profile_type":"BDS Dentist"}'
# Login
curl -s -c c.txt -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"seek@test.com","password":"pass1234"}'
# Me
curl -s -b c.txt "$API/api/auth/me"
```

## Google OAuth
- Frontend redirects to https://auth.emergentagent.com/?redirect=<origin>/auth/callback
- Lands at /auth/callback#session_id=... -> POST /api/auth/google/session with X header handled backend-side.

## Browser session injection for protected pages
Create a user + session in mongo, set cookie `session_token`, then navigate.
