Pull Request: Project Optimization and Security Enhancement

## Description

This PR aims to resolve identified weaknesses in the project and improve overall system stability. In accordance with the "Farhodoff" guidelines, all changes have been documented in Uzbek.

## Changes Implemented
### Backend

1. **Morgan Logger:** Integrated the morgan library to track and log all incoming requests.
2. **Error Handling:** Improved the global error handler. Now, stack-traces are hidden from users in the production environment to enhance security.
3. **Static Files:** Added a check for the existence of the uploads folder before server startup, creating it automatically if it is missing.

### Frontend
- (To be completed in subsequent steps)

## Validation

- [x]Backend started successfully.
- [x]MongoDB connection verified.
- [x]Requests are being successfully logged via morgan.

## Note
This PR `ISSUE.md` the first 3 items listed in ISSUE.md. The remaining items will be implemented step-by-step.