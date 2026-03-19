import multiprocessing

# Gunicorn configuration for high concurrency (5000+ users)
bind = "0.0.0.0:5000"

# Number of workers (2 * cores + 1 is a good rule of thumb)
workers = multiprocessing.cpu_count() * 2 + 1

# Use 'sync' for Windows compatibility or 'gevent' for Linux
worker_class = 'sync'
threads = 4

# Each worker handles 1000 concurrent connections
worker_connections = 1000

# Timeout to prevent hanging connections
timeout = 120

# Keep-alive for better performance
keepalive = 5

loglevel = 'info'
accesslog = '-'
errorlog = '-'
