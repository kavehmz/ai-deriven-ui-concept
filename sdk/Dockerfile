FROM nginx:alpine

COPY . /usr/share/nginx/html/

# Add CORS headers for SDK
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    \
    location / { \
        add_header Access-Control-Allow-Origin *; \
        add_header Access-Control-Allow-Methods "GET, OPTIONS"; \
        add_header Access-Control-Allow-Headers "Content-Type"; \
        try_files $uri $uri/ =404; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

