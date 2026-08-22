import os
import sys

# Read environment variables from .env or .env.local or .env.example
env_files = [".env", ".env.local", ".env.example", "../.env", "../.env.local", "../.env.example"]
config = {}
for ef in env_files:
    if os.path.exists(ef):
        with open(ef, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k.strip() not in config:
                        config[k.strip()] = v.strip()

print("Testing Supabase PostgreSQL Connection...")
db_url = config.get("SPRING_DATASOURCE_URL", "")
user = config.get("SPRING_DATASOURCE_USERNAME", "postgres")
password = config.get("SPRING_DATASOURCE_PASSWORD", "")

print(f"URL: {db_url}")
print(f"User: {user}")
print(f"Password provided: {'YES (len=' + str(len(password)) + ')' if password else 'NO'}")

clean_url = db_url.replace("jdbc:postgresql://", "").split("?")[0]
if "/" in clean_url:
    host_port, dbname = clean_url.split("/", 1)
else:
    host_port, dbname = clean_url, "postgres"

if ":" in host_port:
    host, port = host_port.split(":", 1)
    port = int(port)
else:
    host, port = host_port, 5432

import socket

print(f"\n1. Testing Network Socket Connection to {host}:{port}...")
try:
    s = socket.create_connection((host, port), timeout=10)
    print(f"✅ Successfully established TCP network connection to {host}:{port}!")
    s.close()
except Exception as e:
    print(f"❌ Failed to reach {host}:{port}: {e}")
    sys.exit(1)
