# Step 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Step 2: Build Backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY backend/ ./backend/

# Copy frontend build to backend/frontend/dist (as expected by src/index.js)
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 5001
CMD ["node", "backend/src/index.js"]
