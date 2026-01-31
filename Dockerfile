# Stage 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./
RUN npm install

# --- IMPORTANT: Build Arguments for Vite ---
# This allows Cloud Build to pass the key into the build process
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Copy the rest of the source code
COPY . .

# Build the app (Vite will now see the VITE_ variable)
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy built static files from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]