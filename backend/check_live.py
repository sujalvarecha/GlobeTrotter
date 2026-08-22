import urllib.request
import json

# Check the running Spring Boot backend API to see what cities it is returning
try:
    with urllib.request.urlopen("http://localhost:8080/api/cities") as resp:
        data = json.loads(resp.read().decode())
        print(f"Backend API is responding with {len(data)} cities:")
        for c in data[:5]:
            print(f" - {c['name']}, {c['country']} (Lat: {c['latitude']}, Lng: {c['longitude']})")
except Exception as e:
    print("Backend check failed:", e)
