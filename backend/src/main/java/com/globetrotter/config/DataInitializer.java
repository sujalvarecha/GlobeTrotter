package com.globetrotter.config;

import com.globetrotter.model.Activity;
import com.globetrotter.model.City;
import com.globetrotter.model.User;
import com.globetrotter.repository.ActivityRepository;
import com.globetrotter.repository.CityRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CityRepository cityRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DataInitializer(CityRepository cityRepository,
                           ActivityRepository activityRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.cityRepository = cityRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final Map<String, double[]> CITY_COORDS = Map.ofEntries(
            Map.entry("Paris", new double[]{48.8566, 2.3522}),
            Map.entry("Rome", new double[]{41.9028, 12.4964}),
            Map.entry("Venice", new double[]{45.4408, 12.3155}),
            Map.entry("Tokyo", new double[]{35.6762, 139.6503}),
            Map.entry("Kyoto", new double[]{35.0116, 135.7681}),
            Map.entry("Barcelona", new double[]{41.3879, 2.1699}),
            Map.entry("London", new double[]{51.5074, -0.1278}),
            Map.entry("New York", new double[]{40.7128, -74.0060}),
            Map.entry("Bali", new double[]{-8.4095, 115.1889}),
            Map.entry("Mumbai", new double[]{19.0760, 72.8777}),
            Map.entry("Delhi", new double[]{28.6139, 77.2090}),
            Map.entry("Jaipur", new double[]{26.9124, 75.7873}),
            Map.entry("Goa", new double[]{15.2993, 74.1240}),
            Map.entry("Varanasi", new double[]{25.3176, 82.9739}),
            Map.entry("Bengaluru", new double[]{12.9716, 77.5946}),
            Map.entry("Kochi", new double[]{9.9312, 76.2673}),
            Map.entry("Agra", new double[]{27.1767, 78.0081}),
            Map.entry("Hyderabad", new double[]{17.3850, 78.4867}),
            Map.entry("Chennai", new double[]{13.0827, 80.2707}),
            Map.entry("Kolkata", new double[]{22.5726, 88.3639}),
            Map.entry("Udaipur", new double[]{24.5854, 73.7125}),
            Map.entry("Amritsar", new double[]{31.6340, 74.8723}),
            Map.entry("Shimla", new double[]{31.1048, 77.1734}),
            Map.entry("Manali", new double[]{32.2432, 77.1892}),
            Map.entry("Rishikesh", new double[]{30.0869, 78.2676}),
            Map.entry("Ladakh", new double[]{34.1526, 77.5771}),
            Map.entry("Ooty", new double[]{11.4102, 76.6950}),
            Map.entry("Pune", new double[]{18.5204, 73.8567}),
            Map.entry("Dubai", new double[]{25.2048, 55.2708}),
            Map.entry("Singapore", new double[]{1.3521, 103.8198}),
            Map.entry("Bangkok", new double[]{13.7563, 100.5018}),
            Map.entry("Amsterdam", new double[]{52.3676, 4.9041}),
            Map.entry("Sydney", new double[]{-33.8688, 151.2093}),
            Map.entry("Cairo", new double[]{30.0444, 31.2357}),
            Map.entry("Rio de Janeiro", new double[]{-22.9068, -43.1729}),
            Map.entry("Santorini", new double[]{36.3932, 25.4615}),
            Map.entry("Zurich", new double[]{47.3769, 8.5417}),
            Map.entry("Istanbul", new double[]{41.0082, 28.9784}),
            Map.entry("Seoul", new double[]{37.5665, 126.9780}),
            Map.entry("Cape Town", new double[]{-33.9249, 18.4241}),
            Map.entry("Queenstown", new double[]{-45.0312, 168.6626})
    );

    @Override
    public void run(String... args) throws Exception {
        // 1. Direct DB Schema Upgrade (Fix VARCHAR(255) image limitations in Supabase)
        try {
            jdbcTemplate.execute("ALTER TABLE trips ALTER COLUMN cover_image TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE trips ALTER COLUMN description TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN profile_image TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE cities ALTER COLUMN image_url TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE activities ALTER COLUMN image_url TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE activities ALTER COLUMN description TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'ROLE_USER';");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;");
            jdbcTemplate.execute("UPDATE users SET role = 'ROLE_USER' WHERE role IS NULL;");
        } catch (Exception e) {
            // Table or column already adjusted
        }

        // 2. Seed Default Demo Admin Account
        if (userRepository.findByEmail("admin@globetrotter.io").isEmpty()) {
            User admin = new User("GlobeTrotter Admin", "admin@globetrotter.io", passwordEncoder.encode("AdminPass123!"));
            admin.setRole("ROLE_ADMIN");
            admin.setProfileImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300");
            userRepository.save(admin);
            System.out.println("✅ Seeded default Admin user: admin@globetrotter.io (Password: AdminPass123!)");
        } else {
            User admin = userRepository.findByEmail("admin@globetrotter.io").get();
            if (!"ROLE_ADMIN".equals(admin.getRole())) {
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);
            }
        }

        // 3. Update any existing cities with missing coordinates
        List<City> existing = cityRepository.findAll();
        for (City c : existing) {
            if ((c.getLatitude() == null || c.getLongitude() == null) && CITY_COORDS.containsKey(c.getName())) {
                double[] coords = CITY_COORDS.get(c.getName());
                c.setLatitude(coords[0]);
                c.setLongitude(coords[1]);
                cityRepository.save(c);
            }
        }

        // 4. Seed Global & Indian Destinations & Curated Activities
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

        // ─── India Destinations ──────────────────────────────────────────────
        seedCityIfNotExists("Hyderabad", "India", "Asia", 2.4, 96, "https://images.unsplash.com/photo-1605379399642-870262d3d051", 17.3850, 78.4867, List.of(
                new Activity("Charminar & Laad Bazaar Pearl Walk", "16th-century iconic monument and bustling bazaar for lacquer bangles", "Sightseeing", 120, 3.00, "https://images.unsplash.com/photo-1605379399642-870262d3d051"),
                new Activity("Golconda Fort Sound & Light Show", "Acoustic medieval hill fortress and royal diamond vaults", "Culture", 180, 5.00, "https://images.unsplash.com/photo-1589308078059-be1415eab4c3"),
                new Activity("Authentic Hyderabadi Dum Biryani & Irani Chai", "Savoring world-famous aromatic biryani and Osmania biscuits", "Food", 90, 10.00, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8"),
                new Activity("Ramoji Film City Day Tour", "World's largest film studio complex with interactive sets", "Entertainment", 300, 20.00, "https://images.unsplash.com/photo-1518173946687-a4c8a383392e")
        ));

        seedCityIfNotExists("Chennai", "India", "Asia", 2.3, 93, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220", 13.0827, 80.2707, List.of(
                new Activity("Kapaleeshwarar Temple & Mylapore Heritage", "Dravidian architecture with towering sculptured gopuram", "Culture", 120, 0.00, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220"),
                new Activity("Marina Beach Promenade Sunset", "Second longest natural urban beach in the world with street sundal", "Sightseeing", 120, 0.00, "https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8"),
                new Activity("Mahabalipuram Shore Temple Day Excursion", "7th-century UNESCO rock-cut monoliths and Five Rathas", "Culture", 240, 8.00, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1")
        ));

        seedCityIfNotExists("Kolkata", "India", "Asia", 2.2, 94, "https://images.unsplash.com/photo-1558431382-27e303142255", 22.5726, 88.3639, List.of(
                new Activity("Victoria Memorial & Maidan Gardens", "Grand white marble palace from the British Raj era", "Culture", 150, 6.00, "https://images.unsplash.com/photo-1558431382-27e303142255"),
                new Activity("Howrah Bridge & Flower Market Walk", "Historic cantilever bridge and vibrant riverside blooms", "Sightseeing", 90, 0.00, "https://images.unsplash.com/photo-1534447677768-be436bb09401"),
                new Activity("Park Street & College Street Kathi Roll Trail", "Tasting Nizam rolls, rasgullas, and mishti doi", "Food", 120, 8.00, "https://images.unsplash.com/photo-1601050690597-df0568f70950")
        ));

        seedCityIfNotExists("Udaipur", "India", "Asia", 2.6, 96, "https://images.unsplash.com/photo-1615836245337-f5b9b230dd6b", 24.5854, 73.7125, List.of(
                new Activity("City Palace & Lake Pichola Boat Cruise", "Majestic palace complex overlooking the floating Lake Palace", "Sightseeing", 180, 15.00, "https://images.unsplash.com/photo-1615836245337-f5b9b230dd6b"),
                new Activity("Bagore Ki Haveli Folk Dance & Puppet Show", "Evening Rajasthani cultural performance at Gangaur Ghat", "Entertainment", 90, 4.00, "https://images.unsplash.com/photo-1603201667141-5a2d4c673378"),
                new Activity("Monsoon Palace Sajjangarh Sunset", "Hilltop fortress with panoramic views over Udaipur's lakes", "Nature", 120, 5.00, "https://images.unsplash.com/photo-1599661046289-e31897846e41")
        ));

        seedCityIfNotExists("Amritsar", "India", "Asia", 2.1, 95, "https://images.unsplash.com/photo-1609137144813-7d9921338f24", 31.6340, 74.8723, List.of(
                new Activity("Golden Temple (Harmandir Sahib) & Langar", "Spiritual center of Sikhism with 24/7 communal community feast", "Culture", 180, 0.00, "https://images.unsplash.com/photo-1609137144813-7d9921338f24"),
                new Activity("Wagah Border Beating Retreat Ceremony", "Electric patriotic military ceremony at India-Pakistan border", "Entertainment", 180, 0.00, "https://images.unsplash.com/photo-1587474260584-136574528ed5"),
                new Activity("Amritsari Kulcha & Lassi Food Trail", "Crisp tandoori stuffed kulchas with fresh churned sweet lassi", "Food", 90, 6.00, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8")
        ));

        seedCityIfNotExists("Manali", "India", "Asia", 2.3, 95, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", 32.2432, 77.1892, List.of(
                new Activity("Solang Valley Paragliding & Zorbing", "High-altitude adventure sports surrounded by snow peaks", "Adventure", 240, 35.00, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23"),
                new Activity("Hadimba Temple & Cedar Forest Walk", "16th-century wooden pagoda temple nestled in giant deodars", "Culture", 90, 2.00, "https://images.unsplash.com/photo-1505069190533-da1c9af13346"),
                new Activity("Old Manali Bohemian Cafes & River Walk", "Relaxed river-side cafes with mountain trout and apple pies", "Food", 120, 12.00, "https://images.unsplash.com/photo-1514933651103-005eec06c04b")
        ));

        seedCityIfNotExists("Ladakh", "India", "Asia", 2.8, 97, "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2", 34.1526, 77.5771, List.of(
                new Activity("Pangong Tso High Altitude Lake Safari", "Vibrant turquoise lake framed by stark Himalayan peaks", "Nature", 360, 50.00, "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2"),
                new Activity("Nubra Valley & Double-Humped Camel Ride", "White sand dunes and scenic high-altitude cold desert", "Adventure", 300, 40.00, "https://images.unsplash.com/photo-1563298723-dcfebaa392e3"),
                new Activity("Thiksey & Hemis Monastery Tour", "Tibetan Buddhist monasteries with giant Maitreya Buddha statues", "Culture", 180, 5.00, "https://images.unsplash.com/photo-1590766940554-634a7ed41450")
        ));

        seedCityIfNotExists("Mumbai", "India", "Asia", 2.8, 98, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f", 19.0760, 72.8777, List.of(
                new Activity("Gateway of India & Marine Drive", "Colonial waterfront monument & Queen's Necklace promenade", "Sightseeing", 120, 0.00, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f"),
                new Activity("Elephanta Caves Ferry & Tour", "Ancient rock-cut cave temples dedicated to Shiva on Gharapuri Island", "Culture", 240, 8.00, "https://images.unsplash.com/photo-1566552881560-0be86c53e414"),
                new Activity("Chowpatty & Fort Street Food Trail", "Savoring authentic Vada Pav, Pav Bhaji, and Pani Puri", "Food", 120, 10.00, "https://images.unsplash.com/photo-1601050690597-df0568f70950")
        ));

        seedCityIfNotExists("Delhi", "India", "Asia", 2.6, 97, "https://images.unsplash.com/photo-1587474260584-136574528ed5", 28.6139, 77.2090, List.of(
                new Activity("Qutub Minar & Mehrauli Heritage", "UNESCO-listed soaring minaret and ancient iron pillar", "Culture", 150, 7.00, "https://images.unsplash.com/photo-1587474260584-136574528ed5"),
                new Activity("Red Fort & Chandni Chowk Rickshaw Ride", "Historic Mughal fortress and vibrant spiced bazaar alleys", "Sightseeing", 180, 8.00, "https://images.unsplash.com/photo-1598324789736-4861f89564a0"),
                new Activity("Humayun's Tomb Mughal Gardens", "Magnificent garden tomb that inspired the Taj Mahal", "Culture", 120, 6.00, "https://images.unsplash.com/photo-1564507592333-c60657eea523")
        ));

        seedCityIfNotExists("Jaipur", "India", "Asia", 2.4, 96, "https://images.unsplash.com/photo-1599661046289-e31897846e41", 26.9124, 75.7873, List.of(
                new Activity("Amber Fort & Palace Tour", "Grand hilltop fortress with mirror palace (Sheesh Mahal)", "Culture", 180, 8.00, "https://images.unsplash.com/photo-1599661046289-e31897846e41"),
                new Activity("Hawa Mahal & City Palace Walk", "Iconic honeycomb pink facade and royal courtyards", "Sightseeing", 120, 6.00, "https://images.unsplash.com/photo-1603201667141-5a2d4c673378"),
                new Activity("Chokhi Dhani Rajasthani Village Feast", "Traditional folk dance, camel rides, and royal thali", "Food", 180, 18.00, "https://images.unsplash.com/photo-1617653202545-931490e8d7e7")
        ));

        seedCityIfNotExists("Goa", "India", "Asia", 2.5, 97, "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", 15.2993, 74.1240, List.of(
                new Activity("Calangute & Baga Water Sports", "Jet skiing, parasailing, and beach shack relaxation", "Adventure", 180, 25.00, "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2"),
                new Activity("Old Goa Basilica of Bom Jesus", "16th-century Portuguese cathedral & UNESCO world heritage", "Culture", 120, 2.00, "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272"),
                new Activity("Dudhsagar Waterfalls Jeep Safari", "Four-tiered majestic cascade in Bhagwan Mahaveer Sanctuary", "Nature", 240, 20.00, "https://images.unsplash.com/photo-1563298723-dcfebaa392e3")
        ));

        seedCityIfNotExists("Varanasi", "India", "Asia", 2.0, 95, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc", 25.3176, 82.9739, List.of(
                new Activity("Dashashwamedh Ghat Grand Evening Aarti", "Spectacular spiritual fire ritual on the banks of River Ganga", "Culture", 90, 0.00, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc"),
                new Activity("Sunrise Boat Ride on Ganges", "Serene dawn cruise witnessing ancient ghat rituals", "Sightseeing", 90, 8.00, "https://images.unsplash.com/photo-1627894483216-2138af692e32"),
                new Activity("Sarnath Deer Park & Stupa", "Sacred site where Lord Buddha gave his first sermon", "Culture", 120, 4.00, "https://images.unsplash.com/photo-1590766940554-634a7ed41450")
        ));

        seedCityIfNotExists("Bengaluru", "India", "Asia", 2.7, 91, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2", 12.9716, 77.5946, List.of(
                new Activity("Lalbagh Botanical Garden Glass House", "Historic 240-acre garden with tropical flora & lake", "Nature", 120, 2.00, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2"),
                new Activity("Bangalore Palace Royal Tour", "Tudor-style royal palace with stained glass and battlements", "Culture", 120, 6.00, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220"),
                new Activity("Indiranagar Craft Brewery & Pub Trail", "Exploring South Asia's vibrant craft beer and dining hub", "Food", 180, 25.00, "https://images.unsplash.com/photo-1514933651103-005eec06c04b")
        ));

        seedCityIfNotExists("Kochi", "India", "Asia", 2.3, 93, "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944", 9.9312, 76.2673, List.of(
                new Activity("Alleppey Backwaters Houseboat Day Cruise", "Cruising through tranquil palm-fringed Kerala canals", "Nature", 300, 45.00, "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944"),
                new Activity("Fort Kochi Chinese Fishing Nets & Jew Town", "Historic port walk, spice markets, and colonial churches", "Culture", 150, 0.00, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1"),
                new Activity("Authentic Kathakali Dance Drama", "Traditional classical Kerala drama with vivid makeup", "Entertainment", 90, 7.00, "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a")
        ));

        seedCityIfNotExists("Agra", "India", "Asia", 2.5, 99, "https://images.unsplash.com/photo-1564507592333-c60657eea523", 27.1767, 78.0081, List.of(
                new Activity("Taj Mahal Sunrise Tour", "Wonder of the World white marble mausoleum bathed in morning light", "Sightseeing", 180, 15.00, "https://images.unsplash.com/photo-1564507592333-c60657eea523"),
                new Activity("Agra Fort Mughal Citadel", "Red sandstone imperial residence of Mughal emperors", "Culture", 120, 8.00, "https://images.unsplash.com/photo-1585136917109-7561f77d3325"),
                new Activity("Mehtab Bagh Sunset Reflection", "Botanical garden offering river reflections of Taj Mahal", "Sightseeing", 90, 4.00, "https://images.unsplash.com/photo-1524492412937-b28074a5d7da")
        ));

        // ─── Global Destinations ─────────────────────────────────────────────
        seedCityIfNotExists("Dubai", "United Arab Emirates", "Middle East", 4.6, 99, "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", 25.2048, 55.2708, List.of(
                new Activity("Burj Khalifa Top Observatory", "Panoramic skyline views from the world's tallest skyscraper", "Sightseeing", 120, 48.00, "https://images.unsplash.com/photo-1512453979798-5ea266f8880c"),
                new Activity("Arabian Desert Safari with BBQ Dinner", "Dune bashing, camel riding, and starlit Bedouin camp", "Adventure", 300, 60.00, "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3"),
                new Activity("Dubai Mall & Fountain Show", "Spectacular dancing fountains and world-class luxury shopping", "Entertainment", 120, 0.00, "https://images.unsplash.com/photo-1580674684081-7617fbf3d745")
        ));

        seedCityIfNotExists("Singapore", "Singapore", "Asia", 4.3, 98, "https://images.unsplash.com/photo-1525625293386-3f8f99389edd", 1.3521, 103.8198, List.of(
                new Activity("Gardens by the Bay & Cloud Forest", "Futuristic Supertree Grove and cooled mist conservatory", "Nature", 180, 22.00, "https://images.unsplash.com/photo-1525625293386-3f8f99389edd"),
                new Activity("Marina Bay Sands SkyPark", "Breathtaking observation deck over Marina Bay", "Sightseeing", 90, 25.00, "https://images.unsplash.com/photo-1506351421178-63b52a2d2562"),
                new Activity("Chinatown & Maxwell Hawker Feast", "Tasting Michelin-recommended Hainanese chicken rice", "Food", 90, 8.00, "https://images.unsplash.com/photo-1555396273-367ea4eb4db5")
        ));

        seedCityIfNotExists("Bangkok", "Thailand", "Asia", 2.6, 98, "https://images.unsplash.com/photo-1508009603885-50cf7c579365", 13.7563, 100.5018, List.of(
                new Activity("Grand Palace & Emerald Buddha", "Splendid royal ceremonial compound and Wat Phra Kaew", "Culture", 150, 15.00, "https://images.unsplash.com/photo-1508009603885-50cf7c579365"),
                new Activity("Wat Arun (Temple of Dawn)", "Riverside porcelain-mosaic spire on the Chao Phraya River", "Sightseeing", 90, 3.00, "https://images.unsplash.com/photo-1563492065599-3520f775eeed"),
                new Activity("Chao Phraya River Cruise Dinner", "Traditional Thai cuisine with illuminated temple views", "Entertainment", 150, 38.00, "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3")
        ));

        seedCityIfNotExists("Amsterdam", "Netherlands", "Europe", 4.1, 96, "https://images.unsplash.com/photo-1534351590666-13e3e96b5017", 52.3676, 4.9041, List.of(
                new Activity("Rijksmuseum Masterpieces Tour", "Rembrandt's Night Watch & Dutch Golden Age treasures", "Culture", 180, 24.00, "https://images.unsplash.com/photo-1534351590666-13e3e96b5017"),
                new Activity("UNESCO Canal Ring Boat Tour", "Scenic glass-topped boat cruise through 17th-century canals", "Sightseeing", 75, 18.00, "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4"),
                new Activity("Jordaan Walking & Apple Pie Tasting", "Picturesque courtyard gardens and world-famous Dutch bakery", "Food", 120, 12.00, "https://images.unsplash.com/photo-1583200445679-05d60064cb90")
        ));

        seedCityIfNotExists("Sydney", "Australia", "Oceania", 4.4, 97, "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9", -33.8688, 151.2093, List.of(
                new Activity("Sydney Opera House Guided Tour", "Explore the world-famous architectural wonder & concert halls", "Sightseeing", 90, 30.00, "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9"),
                new Activity("Bondi to Coogee Coastal Walk", "Breathtaking clifftop ocean walk past Tamarama and Bronte", "Nature", 150, 0.00, "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f"),
                new Activity("Sydney Harbour Bridge Climb", "Scale the summit of the bridge for unmatched 360° harbor views", "Adventure", 180, 160.00, "https://images.unsplash.com/photo-1524293581917-878a6d017cba")
        ));

        seedCityIfNotExists("Cairo", "Egypt", "Africa", 2.5, 96, "https://images.unsplash.com/photo-1572252009286-268acec5ca0a", 30.0444, 31.2357, List.of(
                new Activity("Giza Pyramids & Great Sphinx Camel Tour", "Ancient Wonder of the World and limestone colossus", "Sightseeing", 240, 35.00, "https://images.unsplash.com/photo-1572252009286-268acec5ca0a"),
                new Activity("Grand Egyptian Museum Treasures", "King Tutankhamun's golden mask and pharaonic antiquities", "Culture", 180, 20.00, "https://images.unsplash.com/photo-1568322445389-f64ac2515020"),
                new Activity("Khan el-Khalili Spiced Bazaar Walk", "Historic 14th-century marketplace with lamps and mint tea", "Shopping", 120, 5.00, "https://images.unsplash.com/photo-1539650116574-8efeb43e2750")
        ));

        seedCityIfNotExists("Rio de Janeiro", "Brazil", "South America", 3.0, 95, "https://images.unsplash.com/photo-1483729558449-99ef09a8c325", -22.9068, -43.1729, List.of(
                new Activity("Christ the Redeemer Train to Corcovado", "Panoramic statue atop Corcovado mountain overlooking the bay", "Sightseeing", 150, 24.00, "https://images.unsplash.com/photo-1483729558449-99ef09a8c325"),
                new Activity("Sugarloaf Mountain Cable Car Sunset", "Glass-walled cable car with golden hour views of Rio", "Sightseeing", 120, 28.00, "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f"),
                new Activity("Copacabana Caipirinha & Beach Walk", "Vibrant promenade culture, beach volleyball, and fresh coconut", "Food", 120, 8.00, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e")
        ));

        seedCityIfNotExists("Santorini", "Greece", "Europe", 4.3, 98, "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff", 36.3932, 25.4615, List.of(
                new Activity("Oia Sunset & Blue Domed Churches Walk", "World-famous whitewashed caldera cliffs and Aegean sunset", "Sightseeing", 120, 0.00, "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff"),
                new Activity("Caldera Catamaran Cruise & Hot Springs", "Sailing past volcanic islands with Greek BBQ and snorkeling", "Adventure", 300, 95.00, "https://images.unsplash.com/photo-1533105079780-92b9be482077"),
                new Activity("Assyrtiko Wine Tasting & Estate Tour", "Volcanic vineyard wine pairing with fresh local cheeses", "Food", 120, 45.00, "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3")
        ));

        seedCityIfNotExists("Zurich", "Switzerland", "Europe", 5.0, 96, "https://images.unsplash.com/photo-1515488764276-beab7607c1e6", 47.3769, 8.5417, List.of(
                new Activity("Lake Zurich Steamboat Cruise", "Scenic alpine lake panorama and Lindt Home of Chocolate", "Sightseeing", 150, 32.00, "https://images.unsplash.com/photo-1515488764276-beab7607c1e6"),
                new Activity("Uetliberg Mountain Hike & Alpine Views", "Panoramic views over Zurich city, lake, and snowy Alps", "Nature", 180, 10.00, "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99"),
                new Activity("Old Town (Altstadt) Swiss Fondue Feast", "Cobblestone alleys, guild houses, and authentic Gruyère fondue", "Food", 120, 45.00, "https://images.unsplash.com/photo-1578985545062-69928b1d9587")
        ));

        seedCityIfNotExists("Seoul", "South Korea", "Asia", 3.4, 98, "https://images.unsplash.com/photo-1538485399081-7191377e8241", 37.5665, 126.9780, List.of(
                new Activity("Gyeongbokgung Palace & Hanbok Experience", "Grand Joseon royal palace with changing of the royal guard", "Culture", 180, 15.00, "https://images.unsplash.com/photo-1538485399081-7191377e8241"),
                new Activity("Myeongdong Street Food & K-Beauty Tour", "Tasting tteokbokki, hotteok, and exploring cosmetic hubs", "Food", 150, 18.00, "https://images.unsplash.com/photo-1578632767115-351597cf2477"),
                new Activity("N Seoul Tower & Namsan Cable Car", "Iconic transmission tower with locks of love and night skyline", "Sightseeing", 120, 12.00, "https://images.unsplash.com/photo-1534447677768-be436bb09401")
        ));

        seedCityIfNotExists("Cape Town", "South Africa", "Africa", 3.0, 97, "https://images.unsplash.com/photo-1580618672591-eb180b1a973f", -33.9249, 18.4241, List.of(
                new Activity("Table Mountain Aerial Cableway", "Revolving cable car summit with views of Atlantic ocean", "Nature", 150, 25.00, "https://images.unsplash.com/photo-1580618672591-eb180b1a973f"),
                new Activity("Boulders Beach African Penguin Colony", "Walk boardwalks surrounded by wild African penguins", "Nature", 120, 12.00, "https://images.unsplash.com/photo-1544551763-46a013bb70d5"),
                new Activity("Cape Point & Cape of Good Hope Excursion", "Dramatic southwesternmost point of the African continent", "Adventure", 300, 35.00, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e")
        ));
    }

    private void seedCityIfNotExists(String name, String country, String region, Double costIndex, Integer popularity, String imageUrl, Double lat, Double lng, List<Activity> activities) {
        if (cityRepository.findByNameIgnoreCase(name).isEmpty()) {
            City city = new City(name, country, region, costIndex, popularity, imageUrl, lat, lng);
            for (Activity a : activities) {
                city.addActivity(a);
            }
            cityRepository.save(city);
            System.out.println("✨ Seeded city & activities: " + name + ", " + country);
        }
    }
}
