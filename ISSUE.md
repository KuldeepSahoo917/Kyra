
Project Issues (Identified Problems)

Weaknesses identified after reviewing the project:
## Backend
###  User Model:
- [ ] Need to add Regex validation for email.
- [ ] Ensure security in Mongoose middleware.

## Frontend
###  Auth Store & API:
- [ ] Should use SPA navigation instead of window.location.href.
- [ ] Recommended to consider HttpOnly cookies instead of localStorage (if security is critical).
- [ ] Use Zustand persist middleware.

## General
- [ ] Database passwords in Docker configuration must be managed via .env.
