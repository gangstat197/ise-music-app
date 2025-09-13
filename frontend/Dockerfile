# Use nginx alpine image
FROM nginx:alpine

# Copy frontend files to nginx html directory
COPY . /usr/share/nginx/html/

# Create nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
