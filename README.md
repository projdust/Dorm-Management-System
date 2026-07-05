# Dorm Management System

An IM2 group project created by University of San Carlos BSIT Students Using (React + Node/Express + PostgreSQL/Prisma).

## Status: Functions working, need automation for payments when a new room + bed is assigned and minor UI/UX improvements needed and then should be good to go.

**WARNING**
This is **NOT** a finished product, working foundation with
one feature (Auth + Dashboard + Rooms) fully implemented end-to-end as the pattern
for the rest of the team to follow, plus all 12 remaining features scaffolded
(routes, controllers, services, pages) with `TODO` markers for implementation tutorial for groupmates to use.

See `docs/IMPLEMENTATION_GUIDE.md` for setup steps and `docs/API_DESIGN.md`
for the endpoint reference.

## Repo layout

```
dorm-management-system/
├── backend/     Node.js + Express + Prisma + PostgreSQL API
├── frontend/    React + Vite + Tailwind SPA
└── docs/        Implementation guide, API design, task breakdown
```

Each feature is fully isolated (own controller/service/routes on backend,
own folder on frontend) specifically so multiple people can work without
merge conflicts.

Thanks for taking interest in this project <3
