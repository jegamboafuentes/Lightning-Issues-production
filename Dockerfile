# Stage 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json* ./
RUN npm install

# --- START: Add Build Arguments ---
# 1. Declare the argument (passed from Cloud Build)
ARG GEMINI_API_KEY

# 2. Map it to an Environment Variable (so Vite can see it during build)
ENV GEMINI_API_KEY=$GEMINI_API_KEY
# --- END: Add Build Arguments ---

# Copy the rest of the source code
COPY . .

# Build the app (Vite will see the ENV var and replace process.env.GEMINI_API_KEY with the actual key)
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy built static files from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]