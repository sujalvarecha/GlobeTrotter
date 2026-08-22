package com.globetrotter.service;

import com.globetrotter.dto.RouteLegDTO;
import com.globetrotter.dto.TripRouteDTO;
import com.globetrotter.dto.WaypointDTO;
import com.globetrotter.model.City;
import com.globetrotter.model.Trip;
import com.globetrotter.model.TripStop;
import com.globetrotter.model.User;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class RouteService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    private static final double EARTH_RADIUS_KM = 6371.0;

    @Autowired
    public RouteService(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public TripRouteDTO calculateTripRoute(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        if (trip.getUser() == null || !trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: trip belongs to another user");
        }

        List<TripStop> stops = trip.getStops() != null ? trip.getStops() : new ArrayList<>();
        // Ensure sorted by stopOrder
        stops.sort(Comparator.comparingInt(TripStop::getStopOrder));

        TripRouteDTO routeDTO = new TripRouteDTO();
        routeDTO.setTripId(trip.getId());
        routeDTO.setTripName(trip.getName());
        routeDTO.setTotalStops(stops.size());

        List<WaypointDTO> waypoints = new ArrayList<>();
        List<RouteLegDTO> legs = new ArrayList<>();
        double totalDistanceKm = 0.0;

        for (int i = 0; i < stops.size(); i++) {
            TripStop stop = stops.get(i);
            City city = stop.getCity();
            Double lat = city != null ? city.getLatitude() : null;
            Double lng = city != null ? city.getLongitude() : null;

            waypoints.add(new WaypointDTO(
                    stop.getId(),
                    stop.getStopOrder(),
                    city != null ? city.getName() : "Unknown",
                    city != null ? city.getCountry() : "Unknown",
                    lat,
                    lng,
                    stop.getStartDate(),
                    stop.getEndDate(),
                    city != null ? city.getImageUrl() : null
            ));

            if (i > 0) {
                TripStop prevStop = stops.get(i - 1);
                City prevCity = prevStop.getCity();

                Double prevLat = prevCity != null ? prevCity.getLatitude() : null;
                Double prevLng = prevCity != null ? prevCity.getLongitude() : null;

                if (prevLat != null && prevLng != null && lat != null && lng != null) {
                    double distKm = haversineDistance(prevLat, prevLng, lat, lng);
                    double distMiles = distKm * 0.621371;
                    totalDistanceKm += distKm;

                    RouteLegDTO leg = new RouteLegDTO();
                    leg.setLegIndex(i);
                    leg.setFromStopId(prevStop.getId());
                    leg.setFromCity(prevCity.getName());
                    leg.setFromCountry(prevCity.getCountry());
                    leg.setFromLatitude(prevLat);
                    leg.setFromLongitude(prevLng);

                    leg.setToStopId(stop.getId());
                    leg.setToCity(city.getName());
                    leg.setToCountry(city.getCountry());
                    leg.setToLatitude(lat);
                    leg.setToLongitude(lng);

                    leg.setDistanceKm(round(distKm));
                    leg.setDistanceMiles(round(distMiles));

                    // Estimate transport & travel time
                    estimateTransportAndTransit(leg, distKm);

                    // Polyline points
                    leg.setPolylineCoordinates(generateArcPoints(prevLat, prevLng, lat, lng, 10));

                    legs.add(leg);
                }
            }
        }

        routeDTO.setWaypoints(waypoints);
        routeDTO.setLegs(legs);
        routeDTO.setTotalDistanceKm(round(totalDistanceKm));
        routeDTO.setTotalDistanceMiles(round(totalDistanceKm * 0.621371));

        return routeDTO;
    }

    private void estimateTransportAndTransit(RouteLegDTO leg, double distKm) {
        if (distKm < 150) {
            leg.setRecommendedTransport("Car / Bus");
            int hours = (int) (distKm / 70.0);
            int minutes = (int) ((distKm % 70.0) / 70.0 * 60);
            leg.setEstimatedTransitTime(formatTime(hours, minutes));
            leg.setEstimatedTransitCostUsd(25.0);
        } else if (distKm <= 800) {
            leg.setRecommendedTransport("High-Speed Rail");
            int hours = (int) (distKm / 220.0);
            int minutes = (int) ((distKm % 220.0) / 220.0 * 60);
            leg.setEstimatedTransitTime(formatTime(Math.max(1, hours), Math.max(15, minutes)));
            leg.setEstimatedTransitCostUsd(round(30 + distKm * 0.1));
        } else {
            leg.setRecommendedTransport("Flight");
            int flightMinutes = (int) ((distKm / 750.0) * 60) + 90; // flight + airport buffer
            int hours = flightMinutes / 60;
            int minutes = flightMinutes % 60;
            leg.setEstimatedTransitTime(formatTime(hours, minutes));
            leg.setEstimatedTransitCostUsd(round(80 + distKm * 0.08));
        }
    }

    private String formatTime(int hours, int minutes) {
        if (hours == 0) return minutes + " mins";
        return hours + "h " + minutes + "m";
    }

    public static double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rLat1) * Math.cos(rLat2) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    // Generates curved intermediate coordinates for great-circle / map curved line rendering
    private List<List<Double>> generateArcPoints(double lat1, double lng1, double lat2, double lng2, int points) {
        List<List<Double>> coords = new ArrayList<>();
        for (int i = 0; i <= points; i++) {
            double f = (double) i / points;
            double lat = lat1 + (lat2 - lat1) * f;
            double lng = lng1 + (lng2 - lng1) * f;
            coords.add(List.of(round(lat), round(lng)));
        }
        return coords;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
