# API Design Reference

Base URL: `http://localhost:5000/api/v1`

All responses follow this shape:
```json
{ "success": true, "message": "optional", "data": {} }
{ "success": false, "message": "error message", "errors": [] }
```

## Auth (`/auth`) — fully implemented

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create a TENANT account | Public |
| POST | `/auth/login` | Log in, returns access + refresh tokens | Public |
| POST | `/auth/refresh` | Exchange refresh token for new access token | Public (needs valid refresh token) |
| POST | `/auth/logout` | Revoke a refresh token | Public (needs valid refresh token) |
| GET | `/auth/me` | Get current logged-in user | Bearer token |

**Register/Login request body:**
```json
{ "email": "user@example.com", "password": "Password123", "firstName": "Juan", "lastName": "Dela Cruz" }
```

**Error responses:** `400` validation, `401` invalid credentials, `409` email exists.

## Dashboard (`/dashboard`) — fully implemented (ADMIN/STAFF only)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/dashboard/summary` | Total residents, occupied/available beds, outstanding bills |
| GET | `/dashboard/recent-activity` | Recent bed assignments (`?limit=5`) |
| GET | `/dashboard/occupancy` | Beds occupied/available per building |

## Remaining features — scaffolded, same REST shape for each

Each of the following exposes the same 5 endpoints (adjust per feature's
actual business rules when implementing):

| Method | Endpoint pattern | Purpose |
|---|---|---|
| GET | `/{resource}` | List (supports query params for filter/pagination) |
| GET | `/{resource}/:id` | Get one |
| POST | `/{resource}` | Create (ADMIN/STAFF) |
| PATCH | `/{resource}/:id` | Update (ADMIN/STAFF) |
| DELETE | `/{resource}/:id` | Delete (ADMIN/STAFF) |

| Resource | Endpoint base | Notes |
|---|---|---|
| Tenants | `/tenants` | Linked 1:1 to a User (role TENANT) |
| Rooms | `/rooms` | `type`: SINGLE/DOUBLE/TRIPLE/QUADRUPLE |
| Bed Assignments | `/bed-assignments` | Assign/unassign tenant↔bed; should update `Bed.status` as a side effect |
| Payments | `/payments` | Rent payments; `status`: PENDING/PAID/PARTIAL/OVERDUE/REFUNDED |
| Billing | `/billing` | Utility bills; `type`: ELECTRICITY/WATER/INTERNET/OTHER |
| Maintenance Requests | `/maintenance-requests` | `status`: OPEN/IN_PROGRESS/RESOLVED/CLOSED/CANCELLED |
| Announcements | `/announcements` | Readable by all authenticated users, write restricted |
| Visitor Logs | `/visitor-logs` | Check-in creates a row; check-out updates `checkOutTime` |
| Reports | `/reports` | Read-only, aggregation endpoints (no create/update/delete) |
| Settings | `/settings` | ADMIN only, key-value store |
| Notifications | `/notifications` | Scoped to `req.user.id`; add a `/read` sub-route to mark as read |
| Users | `/users` | ADMIN only; manages Role assignment |

## Standard error responses

| Status | Meaning |
|---|---|
| 400 | Validation failed (see `errors` array for field-level messages) |
| 401 | Not authenticated / invalid or expired token |
| 403 | Authenticated but not authorized for this action |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email, unique constraint) |
| 501 | Not implemented yet (scaffolded stub — this is expected until built out) |
| 500 | Unexpected server error (check backend logs) |
