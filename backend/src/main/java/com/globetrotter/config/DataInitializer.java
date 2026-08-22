package com.globetrotter.config;

import com.globetrotter.model.Activity;
import com.globetrotter.model.City;
import com.globetrotter.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CityRepository cityRepository;

    @Autowired
    public DataInitializer(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    private static final Map<String, double[]> CITY_COORDS = Map.of(
            "Paris", new double[]{48.8566, 2.3522},
            "Rome", new double[]{41.9028, 12.4964},
            "Venice", new double[]{45.4408, 12.3155},
            "Tokyo", new double[]{35.6762, 139.6503},
            "Kyoto", new double[]{35.0116, 135.7681},
            "Barcelona", new double[]{41.3879, 2.1699},
            "London", new double[]{51.5074, -0.1278},
            "New York", new double[]{40.7128, -74.0060},
            "Bali", new double[]{-8.4095, 115.1889}
    );

    @Override
    public void run(String... args) throws Exception {
        // 1. Update any existing cities with missing coordinates
        List<City> existing = cityRepository.findAll();
        for (City c : existing) {
            if (c.getLatitude() == null && CITY_COORDS.containsKey(c.getName())) {
                double[] coords = CITY_COORDS.get(c.getName());
                c.setLatitude(coords[0]);
                c.setLongitude(coords[1]);
                cityRepository.save(c);
            }
        }

        // 2. Seed additional cities if catalogue has fewer than 9 cities
        if (cityRepository.count() >= 9) {
            return;
        }

        seedCityIfNotExists("Paris", "France", "Europe", 4.2, 98, "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", 48.8566, 2.3522, List.of(
                new Activity("Eiffel Tower Summit", "Iconic iron lattice tower on the Champ de Mars", "Sightseeing", 120, 28.00, "https://images.unsplash.com/photo-1543349689-9a4d426bee8e"),
                new Activity("Louvre Museum", "World's largest art museum housing Mona Lisa", "Culture", 240, 22.00, "https://images.unsplash.com/photo-1499856871958-5b9627545d1a"),
                new Activity("Seine River Sunset Cruise", "Romantic boat tour past Notre-Dame & Musée d'Orsay", "Entertainment", 90, 18.00, "https://images.unsplash.com/photo-1509299349698-dd22323b5963"),
                new Activity("Montmartre Bakery Crawl", "Tasting fresh croissants and pain au chocolat", "Food", 90, 15.00, "https://images.unsplash.com/photo-1509440159596-0249088772ff")
        ));

        seedCityIfNotExists("Rome", "Italy", "Europe", 3.8, 95, "https://images.unsplash.com/photo-1552832230-c0197dd311b5", 41.9028, 12.4964, List.of(
                new Activity("Colosseum & Roman Forum", "Ancient amphitheater and ruins of Roman republic", "Sightseeing", 180, 24.00, "https://images.unsplash.com/photo-1552832230-c0197dd311b5"),
                new Activity("Vatican Museums & Sistine Chapel", "Michelangelo's masterpiece ceiling and papal art", "Culture", 210, 27.00, "https://images.unsplash.com/photo-1548625361-18dae6b986ee"),
                new Activity("Trevi Fountain & Gelato Walking Tour", "Throw a coin in Trevi and taste authentic gelato", "Food", 60, 8.00, "https://images.unsplash.com/photo-1531572753322-ad063cecc140")
        ));

        seedCityIfNotExists("Venice", "Italy", "Europe", 4.0, 92, "https://images.unsplash.com/photo-1514890547357-a9ee288728e0", 45.4408, 12.3155, List.of(
                new Activity("Grand Canal Gondola Ride", "Traditional Venetian waterways experience", "Adventure", 45, 80.00, "https://images.unsplash.com/photo-1514890547357-a9ee288728e0"),
                new Activity("Murano Island Glassblowing", "Witness world-famous glass artisans at work", "Culture", 120, 15.00, "https://images.unsplash.com/photo-1527631746610-bca00a040d60"),
                new Activity("St. Mark's Basilica", "Byzantine cathedral overlooking Piazza San Marco", "Sightseeing", 90, 12.00, "https://images.unsplash.com/photo-1516483638261-f4dbaf036963")
        ));

        seedCityIfNotExists("Tokyo", "Japan", "Asia", 4.1, 99, "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf", 35.6762, 139.6503, List.of(
                new Activity("Senso-ji Temple & Asakusa Street Food", "Tokyo's oldest Buddhist temple and traditional snacks", "Culture", 150, 10.00, "https://images.unsplash.com/photo-1503899036084-c55cdd92da26"),
                new Activity("Shibuya Crossing & Skytree Views", "World's busiest pedestrian crossing & panoramic observation", "Sightseeing", 120, 20.00, "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"),
                new Activity("Tsukiji Outer Market Food Tour", "Fresh sushi, wagyu skewers, and tamagoyaki tasting", "Food", 120, 35.00, "https://images.unsplash.com/photo-1535141192574-5d4897c13136"),
                new Activity("Akihabara Tech & Anime Exploration", "Explore multi-level retro arcade games and anime shops", "Shopping", 180, 25.00, "https://images.unsplash.com/photo-1563245372-f21724e3856d")
        ));

        seedCityIfNotExists("Kyoto", "Japan", "Asia", 3.7, 94, "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e", 35.0116, 135.7681, List.of(
                new Activity("Fushimi Inari Shrine Hike", "Thousands of vermilion torii gates winding up Mt Inari", "Nature", 150, 0.00, "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"),
                new Activity("Arashiyama Bamboo Grove", "Serene bamboo forest path and monkey park", "Nature", 90, 5.00, "https://images.unsplash.com/photo-1505069190533-da1c9af13346"),
                new Activity("Traditional Tea Ceremony", "Authentic matcha preparation in a historic machiya", "Culture", 60, 30.00, "https://images.unsplash.com/photo-1576092768241-dec231879fc3")
        ));

        seedCityIfNotExists("Barcelona", "Spain", "Europe", 3.6, 96, "https://images.unsplash.com/photo-1583422409516-2895a77efded", 41.3879, 2.1699, List.of(
                new Activity("Sagrada Familia Tour", "Gaudí's iconic soaring basilica", "Sightseeing", 120, 26.00, "https://images.unsplash.com/photo-1583422409516-2895a77efded"),
                new Activity("Park Güell Mosaic Garden", "Whimsical park overlooking Barcelona coastline", "Sightseeing", 90, 10.00, "https://images.unsplash.com/photo-1539037116277-4db20889f2d4"),
                new Activity("Tapas & Wine Crawl in El Born", "Authentic patatas bravas, jamón ibérico, and sangria", "Food", 150, 40.00, "https://images.unsplash.com/photo-1515443961218-a51367888e4b")
        ));

        seedCityIfNotExists("London", "United Kingdom", "Europe", 4.5, 99, "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad", 51.5074, -0.1278, List.of(
                new Activity("Tower of London & Crown Jewels", "Historic fortress with centuries of royal history", "Culture", 180, 33.00, "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad"),
                new Activity("British Museum Highlights", "Rosetta Stone, Egyptian mummies, and Parthenon sculptures", "Culture", 180, 0.00, "https://images.unsplash.com/photo-1574610758891-5b809b6e6e2e"),
                new Activity("Borough Market Food Experience", "Artisan cheeses, pastries, and street food stalls", "Food", 120, 20.00, "https://images.unsplash.com/photo-1534447677768-be436bb09401")
        ));

        seedCityIfNotExists("New York", "United States", "North America", 4.8, 100, "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9", 40.7128, -74.0060, List.of(
                new Activity("Central Park Bike Tour", "Scenic ride through Sheep Meadow, Bow Bridge, and Bethesda Fountain", "Nature", 120, 25.00, "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7"),
                new Activity("Broadway Musical Show", "World-class musical theater performance in Times Square", "Entertainment", 150, 110.00, "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"),
                new Activity("Summit One Vanderbilt Observatory", "Immersive glass art and skyline views", "Sightseeing", 90, 45.00, "https://images.unsplash.com/photo-1541336032412-2048a678540d")
        ));

        seedCityIfNotExists("Bali", "Indonesia", "Asia", 2.2, 97, "https://images.unsplash.com/photo-1537996194471-e657df975ab4", -8.4095, 115.1889, List.of(
                new Activity("Ubud Monkey Forest Sanctuary", "Sacred temple complex with hundreds of wild macaques", "Nature", 90, 6.00, "https://images.unsplash.com/photo-1537996194471-e657df975ab4"),
                new Activity("Tegallalang Rice Terraces & Jungle Swing", "Dramatic tiered landscape and high swing photos", "Adventure", 120, 15.00, "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2"),
                new Activity("Uluwatu Sunset Kecak Fire Dance", "Cliffside amphitheater performance during ocean sunset", "Culture", 90, 12.00, "https://images.unsplash.com/photo-1544644181-1484b3fdfc62")
        ));
    }

    private void seedCityIfNotExists(String name, String country, String region, Double costIndex, Integer popularity, String imageUrl, Double lat, Double lng, List<Activity> activities) {
        if (cityRepository.findByNameIgnoreCase(name).isEmpty()) {
            City city = new City(name, country, region, costIndex, popularity, imageUrl, lat, lng);
            for (Activity a : activities) {
                city.addActivity(a);
            }
            cityRepository.save(city);
        }
    }
}
