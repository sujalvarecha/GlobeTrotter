import urllib.request
import json
import time

BASE_URL = "http://localhost:8080"

def request(method, path, data=None, token=None):
    url = BASE_URL + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            try:
                res_json = json.loads(content)
                return status, res_json
            except:
                return status, content
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_content)
        except:
            return e.code, err_content

print("==================================================")
print("🧪 MUTATION & EDGE CASE TEST SUITE")
print("==================================================")

email = f"edge.tester.{int(time.time())}@globetrotter.io"
status, res = request("POST", "/api/auth/signup", {
    "name": "Edge Tester",
    "email": email,
    "password": "Password123!"
})
if status == 201:
    token = res["accessToken"]
    print(f"✅ Signed up user: {email}")
else:
    status, res = request("POST", "/api/auth/login", {
        "email": email,
        "password": "Password123!"
    })
    token = res["accessToken"]
    print(f"✅ Logged in user: {email}")

# 2. Create trip
status, trip = request("POST", "/api/trips", {
    "name": "Mutation Test Trip",
    "description": "Testing stops and activity removals",
    "startDate": "2026-10-01",
    "endDate": "2026-10-10"
}, token=token)
trip_id = trip["id"]

# 3. Add 3 stops
status, s1 = request("POST", f"/api/trips/{trip_id}/stops", {"cityId": 1, "startDate": "2026-10-01", "endDate": "2026-10-03"}, token=token)
status, s2 = request("POST", f"/api/trips/{trip_id}/stops", {"cityId": 2, "startDate": "2026-10-04", "endDate": "2026-10-06"}, token=token)
status, s3 = request("POST", f"/api/trips/{trip_id}/stops", {"cityId": 3, "startDate": "2026-10-07", "endDate": "2026-10-10"}, token=token)

print(f"✅ Created 3 stops: ID {s1['id']}, {s2['id']}, {s3['id']}")

# 4. Reorder stops (3, 1, 2)
status, reordered = request("PUT", f"/api/trips/{trip_id}/stops/reorder", {
    "stopIds": [s3["id"], s1["id"], s2["id"]]
}, token=token)
assert status == 200 and reordered[0]["id"] == s3["id"], f"Reorder failed: {reordered}"
print(f"✅ Reordered stops: Sequence = {[s['city']['name'] for s in reordered]}")

# 5. Add and remove activity
status, act = request("POST", f"/api/trips/{trip_id}/stops/{s1['id']}/activities", {
    "activityId": 1,
    "activityDate": "2026-10-02",
    "startTime": "11:00 AM"
}, token=token)
act_id = act["id"]
print(f"✅ Activity added: ID {act_id}")

status, del_act = request("DELETE", f"/api/trips/{trip_id}/stops/{s1['id']}/activities/{act_id}", token=token)
assert status == 204, f"Activity delete failed: {status}"
print(f"✅ Activity deleted cleanly (HTTP 204)")

# 6. Update stop (date change only)
status, updated_stop = request("PUT", f"/api/trips/{trip_id}/stops/{s1['id']}", {
    "startDate": "2026-10-01",
    "endDate": "2026-10-04"
}, token=token)
assert status == 200 and updated_stop["endDate"] == "2026-10-04", f"Update stop failed: {updated_stop}"
print(f"✅ Stop updated: New EndDate = {updated_stop['endDate']}")

# 7. Delete stop
status, del_stop = request("DELETE", f"/api/trips/{trip_id}/stops/{s2['id']}", token=token)
assert status == 204, f"Stop delete failed: {status}"
print(f"✅ Stop deleted cleanly (HTTP 204)")

# 8. Delete trip
status, del_trip = request("DELETE", f"/api/trips/{trip_id}", token=token)
assert status == 204, f"Trip delete failed: {status}"
print(f"✅ Trip deleted cleanly (HTTP 204)")

# 9. Delete user account
status, del_user = request("DELETE", "/api/users/me", token=token)
assert status == 200, f"User delete failed: {del_user}"
print(f"✅ User account deleted cleanly: {del_user['message']}")

print("\n==================================================")
print("🎉 ALL MUTATION & EDGE CASE TESTS PASSED 100%!")
print("==================================================")
