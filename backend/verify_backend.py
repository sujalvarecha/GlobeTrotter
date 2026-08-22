import urllib.request
import json
import sys

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
print("🚀 GLOBETROTTER BACKEND VERIFICATION TEST SUITE")
print("==================================================")

# 1. Signup & Auth
print("\n[Phase 3] 1. User Signup...")
signup_data = {
    "name": "Sarah Explorer",
    "email": "sarah.jenkins@globetrotter.io",
    "password": "Password123!"
}
status, res = request("POST", "/api/auth/signup", signup_data)
if status == 201:
    token = res["accessToken"]
    print(f"✅ Signup successful! User ID: {res['user']['id']}, Token generated.")
else:
    print(f"Login existing...")
    login_data = {"email": signup_data["email"], "password": signup_data["password"]}
    status, res = request("POST", "/api/auth/login", login_data)
    token = res["accessToken"]
    print(f"✅ Logged in successfully!")

# 2. User Profile & Settings
print("\n[Phase 3] 2. User Profile & Settings...")
status, profile = request("GET", "/api/users/me", token=token)
assert status == 200, f"Failed profile get: {profile}"
print(f"✅ Profile fetched: {profile['name']} ({profile['email']}) - Member since: {profile['memberSince']}")

status, updated_prof = request("PUT", "/api/users/me", {"name": "Sarah Jenkins", "language": "es"}, token=token)
assert status == 200 and updated_prof["name"] == "Sarah Jenkins", f"Profile update failed: {updated_prof}"
print(f"✅ Profile updated: Name={updated_prof['name']}, Lang={updated_prof['language']}")

status, forgot_res = request("POST", "/api/auth/forgot-password", {"email": signup_data["email"]})
assert status == 200, f"Forgot password failed: {forgot_res}"
print(f"✅ Forgot password simulated: {forgot_res['message']}")

# 3. Create Trip
print("\n[Phase 4] 3. Create Trip with Target Budget...")
trip_req = {
    "name": "Grand European Journey",
    "description": "Paris to Rome cultural immersion",
    "startDate": "2026-09-01",
    "endDate": "2026-09-10",
    "coverImage": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    "targetBudget": 2200.0
}
status, created_trip = request("POST", "/api/trips", trip_req, token=token)
assert status == 201, f"Trip creation failed: {created_trip}"
trip_id = created_trip["id"]
print(f"✅ Trip created! ID: {trip_id}, Name: {created_trip['name']}, Target Budget: ${created_trip['targetBudget']}")

# 4. Add Stops
print("\n[Phase 5] 4. Add Stops to Trip...")
stop1_req = {"cityId": 1, "startDate": "2026-09-01", "endDate": "2026-09-05", "stopOrder": 1}
status, stop1 = request("POST", f"/api/trips/{trip_id}/stops", stop1_req, token=token)
assert status == 201, f"Add stop 1 failed: {stop1}"
stop1_id = stop1["id"]
print(f"✅ Stop 1 added: {stop1['city']['name']} (ID: {stop1_id})")

stop2_req = {"cityId": 2, "startDate": "2026-09-05", "endDate": "2026-09-10", "stopOrder": 2}
status, stop2 = request("POST", f"/api/trips/{trip_id}/stops", stop2_req, token=token)
assert status == 201, f"Add stop 2 failed: {stop2}"
stop2_id = stop2["id"]
print(f"✅ Stop 2 added: {stop2['city']['name']} (ID: {stop2_id})")

# 5. Add Activities to Stops
print("\n[Phase 5] 5. Add Activities to Stops...")
act1_req = {
    "activityId": 1,
    "activityDate": "2026-09-02",
    "startTime": "10:00 AM",
    "endTime": "12:30 PM",
    "notes": "Book summit tickets in advance"
}
status, ta1 = request("POST", f"/api/trips/{trip_id}/stops/{stop1_id}/activities", act1_req, token=token)
assert status == 201, f"Add activity 1 failed: {ta1}"
print(f"✅ Activity scheduled in Stop 1: {ta1['activity']['name']} on {ta1['activityDate']}")

act2_req = {
    "activityId": 5,
    "activityDate": "2026-09-06",
    "startTime": "09:30 AM",
    "endTime": "12:00 PM",
    "notes": "Guided tour of Colosseum"
}
status, ta2 = request("POST", f"/api/trips/{trip_id}/stops/{stop2_id}/activities", act2_req, token=token)
assert status == 201, f"Add activity 2 failed: {ta2}"
print(f"✅ Activity scheduled in Stop 2: {ta2['activity']['name']} on {ta2['activityDate']}")

# 6. Structured Itinerary Breakdown
print("\n[Phase 5] 6. Retrieve Day-by-Day Structured Itinerary...")
status, itinerary = request("GET", f"/api/trips/{trip_id}/itinerary", token=token)
assert status == 200, f"Itinerary failed: {itinerary}"
print(f"✅ Structured Itinerary returned {len(itinerary['days'])} days across {itinerary['totalStops']} stops!")
for d in itinerary["days"][:3]:
    print(f"   • Day {d['dayNumber']} ({d['date']}) in {d['cityName']}: {len(d['activities'])} activity(ies), Daily Total: ${d['totalDayCostUsd']}")

# 7. Timeline Events
print("\n[Phase 8] 7. Retrieve Timeline Events...")
status, timeline = request("GET", f"/api/trips/{trip_id}/timeline", token=token)
assert status == 200, f"Timeline failed: {timeline}"
print(f"✅ Timeline generated {len(timeline)} events across the journey.")

# 8. Budget Engine & Variance
print("\n[Phase 7] 8. Budget Calculations & Over-budget Check...")
status, budget_usd = request("GET", f"/api/trips/{trip_id}/budget?tier=standard&currency=USD", token=token)
assert status == 200, f"Budget failed: {budget_usd}"
print(f"✅ USD Standard Budget: Total=${budget_usd['totalEstimatedCost']}, DailyAvg=${budget_usd['averageCostPerDay']}, Target=${budget_usd['targetBudget']}, OverBudget={budget_usd['isOverBudget']}, Variance=${budget_usd['budgetDifference']}")

status, budget_eur = request("GET", f"/api/trips/{trip_id}/budget?tier=luxury&currency=EUR", token=token)
assert status == 200, f"EUR Luxury Budget failed: {budget_eur}"
print(f"✅ EUR Luxury Budget: Total=€{budget_eur['totalEstimatedCost']}, Currency={budget_eur['currency']}")

# 9. Geo Route & Transit
print("\n[Phase 8] 9. Great-Circle Transit Route Engine...")
status, route = request("GET", f"/api/trips/{trip_id}/route", token=token)
assert status == 200, f"Route failed: {route}"
print(f"✅ Transit Route: Total Distance = {route['totalDistanceKm']} km ({route['totalDistanceMiles']} miles) across {len(route['legs'])} transit leg(s).")
for leg in route["legs"]:
    print(f"   • {leg['fromCity']} → {leg['toCity']}: {leg['distanceKm']} km via {leg['recommendedTransport']} ({leg['estimatedTransitTime']}, Est. ${leg['estimatedTransitCostUsd']})")

# 10. Public Sharing & Forking
print("\n[Phase 9] 10. Public Sharing & Forking...")
status, share_info = request("POST", f"/api/trips/{trip_id}/share", token=token)
assert status == 200, f"Share enable failed: {share_info}"
share_token = share_info["shareToken"]
print(f"✅ Trip shared! Share Token: {share_token}, URL: {share_info['shareUrl']}")

status, public_view = request("GET", f"/api/public/trips/{share_token}")
assert status == 200, f"Public view failed: {public_view}"
print(f"✅ Public view accessible without authentication! Trip: '{public_view['name']}' by {public_view['creatorName']}")

status, forked_trip = request("POST", f"/api/public/trips/{share_token}/fork", token=token)
assert status == 201, f"Fork failed: {forked_trip}"
print(f"✅ Trip forked successfully! New Trip ID: {forked_trip['id']}, Name: '{forked_trip['name']}'")

# 11. Smart AI Recommendation Engine
print("\n[Phase 10] 11. AI Contextual Recommendations...")
status, rec_cities = request("GET", f"/api/trips/{trip_id}/recommendations/cities", token=token)
assert status == 200, f"City recommendations failed: {rec_cities}"
print(f"✅ Recommended next destinations: {len(rec_cities)} candidate(s). Top match: {rec_cities[0]['city']['name']} (Score: {rec_cities[0]['matchScore']}%) - {rec_cities[0]['matchReason']}")

status, rec_acts = request("GET", f"/api/trips/{trip_id}/recommendations/activities?stopId={stop1_id}&category=Culture", token=token)
assert status == 200, f"Activity recommendations failed: {rec_acts}"
print(f"✅ Recommended unadded activities: {len(rec_acts)} suggestion(s). Top: {rec_acts[0]['activity']['name']} ({rec_acts[0]['matchReason']})")

# 12. AI Travel Assistant & Generator
print("\n[Phase 10] 12. AI Travel Planner Itinerary Generation...")
ai_req = {
    "destination": "Japan",
    "durationDays": 6,
    "tier": "standard",
    "targetBudget": 3000.0,
    "interests": ["Food", "Culture", "Sightseeing"],
    "saveToAccount": True
}
status, ai_res = request("POST", "/api/ai/generate-itinerary", ai_req, token=token)
assert status == 200, f"AI generation failed: {ai_res}"
print(f"✅ AI synthesized '{ai_res['tripName']}'! Planned Cities: {ai_res['plannedCities']}, Days: {len(ai_res['days'])}, Est Total: ${ai_res['totalEstimatedCostUsd']}, Saved Trip ID: {ai_res['tripId']}")

# 13. Search & Filter Exploration
print("\n[Phase 6] 13. Search & Discovery Filters...")
status, filtered_cities = request("GET", "/api/cities/search?region=Europe&maxCostIndex=4.0")
assert status == 200, f"Cities search failed: {filtered_cities}"
print(f"✅ Filtered Cities in Europe (max cost 4.0): {[c['name'] for c in filtered_cities]}")

status, filtered_acts = request("GET", "/api/activities/search?category=Food&maxCost=30")
assert status == 200, f"Activities search failed: {filtered_acts}"
print(f"✅ Filtered Food Activities under $30: {[a['name'] for a in filtered_acts]}")

# 14. Dashboard Summary
print("\n[Phase 4] 14. Traveler Dashboard Summary...")
status, dashboard = request("GET", "/api/dashboard/summary", token=token)
assert status == 200, f"Dashboard failed: {dashboard}"
print(f"✅ Dashboard summary returned: {dashboard['welcomeMessage']}")
print(f"   • Total Trips: {dashboard['totalTrips']}, Total Destinations Visited: {dashboard['totalDestinations']}, Total Est. Spend: ${dashboard['totalEstimatedSpendUsd']}")
print(f"   • Upcoming Trips Count: {len(dashboard['upcomingTrips'])}, Recent Trips Count: {len(dashboard['recentTrips'])}, Popular Destinations Count: {len(dashboard['popularDestinations'])}")

# 15. Admin Statistics
print("\n[Admin] 15. Platform Analytics & Statistics...")
status, admin_stats = request("GET", "/api/admin/stats", token=token)
assert status == 200, f"Admin stats failed: {admin_stats}"
print(f"✅ Admin Metrics: Total Users={admin_stats['totalUsers']}, Total Trips={admin_stats['totalTrips']}, Total Stops={admin_stats['totalStops']}, Total Activities={admin_stats['totalScheduledActivities']}")
print(f"   • Top Destinations: {admin_stats['topDestinations']}")

# 16. Export Itinerary
print("\n[Export] 16. Markdown Itinerary Guide Export...")
status, md_export = request("GET", f"/api/trips/{trip_id}/export/markdown", token=token)
assert status == 200 and "# 🌍 Trip Itinerary" in md_export, f"Markdown export failed"
print(f"✅ Markdown Guide Export generated successfully ({len(md_export)} characters).")

print("\n==================================================")
print("🎉 ALL 16 INTEGRATION TEST PHASES PASSED 100%!")
print("==================================================")
