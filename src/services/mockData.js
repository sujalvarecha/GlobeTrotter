/**
 * GlobeTrotter — Mock Data
 *
 * Seeded dataset matching the real backend schema exactly.
 * All costs in ₹ (Indian Rupees). Real-sounding names, no lorem ipsum.
 *
 * Schema:
 *   User        { id, name, email, profileImage }
 *   Trip        { id, userId, name, description, startDate, endDate, coverImage, isPublic, shareToken, budget }
 *   City        { id, name, country, region, costIndex, popularity, imageUrl }
 *   Activity    { id, cityId, name, description, category, duration, estimatedCost, imageUrl }
 *   TripStop    { id, tripId, cityId, startDate, endDate, stopOrder }
 *   TripActivity{ id, tripStopId, activityId, date, startTime, endTime, notes }
 */

// ─── Users ───────────────────────────────────────────────
export const users = [
  {
    id: 'user-1',
    name: 'Arjun Mehta',
    email: 'arjun@globetrotter.dev',
    password: 'password123',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    email: 'priya@globetrotter.dev',
    password: 'password123',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
  },
];

// ─── Cities (10 across continents) ──────────────────────
export const cities = [
  {
    id: 'city-1',
    name: 'Tokyo',
    country: 'Japan',
    region: 'East Asia',
    costIndex: 8,
    popularity: 95,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  },
  {
    id: 'city-2',
    name: 'Paris',
    country: 'France',
    region: 'Western Europe',
    costIndex: 9,
    popularity: 98,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  },
  {
    id: 'city-3',
    name: 'Istanbul',
    country: 'Turkey',
    region: 'Eurasia',
    costIndex: 5,
    popularity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  },
  {
    id: 'city-4',
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Southern Africa',
    costIndex: 6,
    popularity: 80,
    imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
  },
  {
    id: 'city-5',
    name: 'Marrakech',
    country: 'Morocco',
    region: 'North Africa',
    costIndex: 4,
    popularity: 78,
    imageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
  },
  {
    id: 'city-6',
    name: 'Lisbon',
    country: 'Portugal',
    region: 'Southern Europe',
    costIndex: 6,
    popularity: 88,
    imageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80',
  },
  {
    id: 'city-7',
    name: 'Buenos Aires',
    country: 'Argentina',
    region: 'South America',
    costIndex: 5,
    popularity: 82,
    imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80',
  },
  {
    id: 'city-8',
    name: 'Jaipur',
    country: 'India',
    region: 'South Asia',
    costIndex: 3,
    popularity: 75,
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
  },
  {
    id: 'city-9',
    name: 'Seoul',
    country: 'South Korea',
    region: 'East Asia',
    costIndex: 7,
    popularity: 90,
    imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80',
  },
  {
    id: 'city-10',
    name: 'Reykjavik',
    country: 'Iceland',
    region: 'Northern Europe',
    costIndex: 10,
    popularity: 72,
    imageUrl: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80',
  },
];

// ─── Activities (4-6 per city, varied categories) ───────
export const activities = [
  // TOKYO
  { id: 'act-1',  cityId: 'city-1', name: 'Tsukiji Outer Market Food Tour',           description: 'Guided tasting tour through Tokyo\'s legendary fish market streets.',          category: 'food',          duration: 180, estimatedCost: 4500,  imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
  { id: 'act-2',  cityId: 'city-1', name: 'Senso-ji Temple & Asakusa Walk',            description: 'Visit Tokyo\'s oldest temple and explore the traditional Nakamise shopping street.', category: 'sightseeing',   duration: 120, estimatedCost: 0,     imageUrl: 'https://images.unsplash.com/photo-1583766395091-2eb9994ed094?w=400&q=80' },
  { id: 'act-3',  cityId: 'city-1', name: 'Shibuya Crossing & Harajuku',               description: 'Experience the world\'s busiest crossing and Harajuku\'s quirky fashion scene.',    category: 'sightseeing',   duration: 150, estimatedCost: 2000,  imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&q=80' },
  { id: 'act-4',  cityId: 'city-1', name: 'TeamLab Borderless Digital Art Museum',      description: 'Immersive digital art installation where you walk through flowing projections.',   category: 'culture',       duration: 120, estimatedCost: 2800,  imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80' },
  { id: 'act-5',  cityId: 'city-1', name: 'Shinkansen Day Trip to Hakone',             description: 'Bullet train ride to Hakone for hot springs and Mt. Fuji views.',                   category: 'adventure',     duration: 480, estimatedCost: 8500,  imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80' },
  { id: 'act-6',  cityId: 'city-1', name: 'Akihabara Electronics & Anime District',    description: 'Browse multi-floor electronics shops and anime mega-stores.',                       category: 'shopping',      duration: 180, estimatedCost: 5000,  imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80' },

  // PARIS
  { id: 'act-7',  cityId: 'city-2', name: 'Eiffel Tower Summit Access',                description: 'Skip-the-line tickets to the summit with panoramic views of Paris.',                category: 'sightseeing',   duration: 150, estimatedCost: 3200,  imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400&q=80' },
  { id: 'act-8',  cityId: 'city-2', name: 'Louvre Museum Guided Tour',                 description: 'Three-hour curated walk through the world\'s largest art museum.',                   category: 'culture',       duration: 180, estimatedCost: 4000,  imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80' },
  { id: 'act-9',  cityId: 'city-2', name: 'Montmartre Walking Tour & Crêpes',          description: 'Stroll cobbled streets of the artists\' quarter with crêpe stops.',                  category: 'food',          duration: 150, estimatedCost: 2500,  imageUrl: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400&q=80' },
  { id: 'act-10', cityId: 'city-2', name: 'Seine River Evening Cruise',                description: 'Sunset cruise past illuminated landmarks with wine service.',                       category: 'entertainment', duration: 90,  estimatedCost: 3800,  imageUrl: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=400&q=80' },
  { id: 'act-11', cityId: 'city-2', name: 'Le Marais Vintage Shopping',                description: 'Browse curated vintage boutiques and designer concept stores.',                     category: 'shopping',      duration: 120, estimatedCost: 6000,  imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80' },

  // ISTANBUL
  { id: 'act-12', cityId: 'city-3', name: 'Hagia Sophia & Blue Mosque',                description: 'Visit two of the world\'s most iconic religious buildings, side by side.',          category: 'sightseeing',   duration: 180, estimatedCost: 1500,  imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&q=80' },
  { id: 'act-13', cityId: 'city-3', name: 'Grand Bazaar Exploration',                  description: 'Navigate 4,000+ shops in one of the world\'s oldest covered markets.',               category: 'shopping',      duration: 150, estimatedCost: 3000,  imageUrl: 'https://images.unsplash.com/photo-1558383331-f520f2888351?w=400&q=80' },
  { id: 'act-14', cityId: 'city-3', name: 'Bosphorus Strait Cruise',                   description: 'Ferry ride between Europe and Asia with tea and simit.',                             category: 'adventure',     duration: 120, estimatedCost: 800,   imageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=400&q=80' },
  { id: 'act-15', cityId: 'city-3', name: 'Turkish Cooking Class',                     description: 'Hands-on class making kebabs, mezes, and baklava with a local chef.',                category: 'food',          duration: 210, estimatedCost: 2200,  imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
  { id: 'act-16', cityId: 'city-3', name: 'Topkapi Palace & Harem',                    description: 'Explore the Ottoman sultans\' residence and its famed treasury.',                     category: 'culture',       duration: 150, estimatedCost: 1800,  imageUrl: 'https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=400&q=80' },

  // CAPE TOWN
  { id: 'act-17', cityId: 'city-4', name: 'Table Mountain Cable Car',                  description: 'Ride the rotating cable car to the flat summit for 360° views.',                     category: 'nature',        duration: 180, estimatedCost: 2400,  imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80' },
  { id: 'act-18', cityId: 'city-4', name: 'Cape Peninsula & Cape of Good Hope',        description: 'Full-day drive along Chapman\'s Peak to the southern tip of Africa.',                 category: 'adventure',     duration: 480, estimatedCost: 5500,  imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80' },
  { id: 'act-19', cityId: 'city-4', name: 'V&A Waterfront Food Market',                description: 'Graze through 40+ artisan food stalls on the working harbour.',                      category: 'food',          duration: 120, estimatedCost: 1500,  imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
  { id: 'act-20', cityId: 'city-4', name: 'Robben Island Museum Tour',                 description: 'Ferry to the island prison where Nelson Mandela was held for 18 years.',              category: 'culture',       duration: 240, estimatedCost: 3500,  imageUrl: 'https://images.unsplash.com/photo-1552751753-0fc84ae5b6c8?w=400&q=80' },
  { id: 'act-21', cityId: 'city-4', name: 'Shark Cage Diving',                         description: 'Get face-to-face with great white sharks off Gansbaai coast.',                       category: 'adventure',     duration: 360, estimatedCost: 12000, imageUrl: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&q=80' },

  // MARRAKECH
  { id: 'act-22', cityId: 'city-5', name: 'Jemaa el-Fnaa Night Market',                description: 'Wander the chaotic square of snake charmers, musicians, and food stalls at dusk.',   category: 'food',          duration: 150, estimatedCost: 800,   imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&q=80' },
  { id: 'act-23', cityId: 'city-5', name: 'Majorelle Garden & YSL Museum',             description: 'Cobalt-blue botanical garden and the adjacent Yves Saint Laurent museum.',            category: 'culture',       duration: 120, estimatedCost: 1200,  imageUrl: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=400&q=80' },
  { id: 'act-24', cityId: 'city-5', name: 'Atlas Mountains Day Hike',                  description: 'Guided trek through Berber villages in the High Atlas foothills.',                    category: 'nature',        duration: 420, estimatedCost: 3500,  imageUrl: 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=400&q=80' },
  { id: 'act-25', cityId: 'city-5', name: 'Traditional Hammam Experience',             description: 'Full-body scrub and steam in a centuries-old Moroccan bathhouse.',                    category: 'entertainment', duration: 90,  estimatedCost: 1800,  imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80' },
  { id: 'act-26', cityId: 'city-5', name: 'Souk Shopping & Bargaining Tour',           description: 'Navigate the labyrinthine souks with a local guide who teaches bargaining tactics.',  category: 'shopping',      duration: 180, estimatedCost: 2500,  imageUrl: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400&q=80' },

  // LISBON
  { id: 'act-27', cityId: 'city-6', name: 'Tram 28 Ride Through Alfama',               description: 'Rattle through Lisbon\'s oldest neighbourhood on the iconic yellow tram.',            category: 'sightseeing',   duration: 60,  estimatedCost: 400,   imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&q=80' },
  { id: 'act-28', cityId: 'city-6', name: 'Pastéis de Belém & Jerónimos Monastery',    description: 'Taste the original custard tarts then explore the Gothic-Manueline monastery.',       category: 'food',          duration: 150, estimatedCost: 1200,  imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&q=80' },
  { id: 'act-29', cityId: 'city-6', name: 'Sintra Palaces Day Trip',                   description: 'Visit the colourful Pena Palace and mystical Quinta da Regaleira.',                   category: 'culture',       duration: 420, estimatedCost: 4500,  imageUrl: 'https://images.unsplash.com/photo-1575373047833-ff2a415cbbb2?w=400&q=80' },
  { id: 'act-30', cityId: 'city-6', name: 'Sunset at Miradouro da Graça',              description: 'Watch the golden hour paint Lisbon\'s rooftops from this panoramic viewpoint.',       category: 'nature',        duration: 60,  estimatedCost: 0,     imageUrl: 'https://images.unsplash.com/photo-1548707309-dcebeab426c8?w=400&q=80' },

  // BUENOS AIRES
  { id: 'act-31', cityId: 'city-7', name: 'Tango Show at Café de los Angelitos',       description: 'Dinner and professional tango performance in a historic 1890s café.',                 category: 'entertainment', duration: 180, estimatedCost: 5500,  imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&q=80' },
  { id: 'act-32', cityId: 'city-7', name: 'La Boca & Caminito Street Art Walk',        description: 'Wander the rainbow-coloured tin houses and open-air art galleries.',                  category: 'sightseeing',   duration: 120, estimatedCost: 0,     imageUrl: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=400&q=80' },
  { id: 'act-33', cityId: 'city-7', name: 'Parrilla Steak Experience',                 description: 'Multi-course Argentine asado at a top-rated parrilla in Palermo.',                    category: 'food',          duration: 150, estimatedCost: 3000,  imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80' },
  { id: 'act-34', cityId: 'city-7', name: 'Recoleta Cemetery & Cultural Centre',       description: 'Explore ornate mausoleums including Evita\'s tomb, then browse the weekend art fair.', category: 'culture',       duration: 120, estimatedCost: 0,     imageUrl: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=400&q=80' },
  { id: 'act-35', cityId: 'city-7', name: 'San Telmo Sunday Antique Market',           description: 'Buenos Aires\' biggest flea market with tango dancers on every corner.',               category: 'shopping',      duration: 180, estimatedCost: 2000,  imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&q=80' },

  // JAIPUR
  { id: 'act-36', cityId: 'city-8', name: 'Amber Fort & Elephant Ride',                description: 'Ascend to the hilltop fortress with views across Maota Lake.',                        category: 'sightseeing',   duration: 180, estimatedCost: 1500,  imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80' },
  { id: 'act-37', cityId: 'city-8', name: 'Hawa Mahal & City Palace',                  description: 'See the Palace of Winds\' 953 windows and the royal family\'s residence.',             category: 'culture',       duration: 150, estimatedCost: 1000,  imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80' },
  { id: 'act-38', cityId: 'city-8', name: 'Rajasthani Thali Dinner',                   description: 'All-you-can-eat traditional thali with 25+ dishes at Chokhi Dhani.',                  category: 'food',          duration: 120, estimatedCost: 800,   imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
  { id: 'act-39', cityId: 'city-8', name: 'Johari Bazaar Gem Shopping',                description: 'Browse Jaipur\'s famed jewellery bazaar and watch artisans cut precious stones.',      category: 'shopping',      duration: 120, estimatedCost: 3000,  imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d7d1d5fa?w=400&q=80' },
  { id: 'act-40', cityId: 'city-8', name: 'Hot Air Balloon Over Jaipur',               description: 'Sunrise balloon flight over the Pink City\'s forts and palaces.',                      category: 'adventure',     duration: 90,  estimatedCost: 8000,  imageUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&q=80' },

  // SEOUL
  { id: 'act-41', cityId: 'city-9', name: 'Gyeongbokgung Palace & Hanbok Rental',      description: 'Tour the grand Joseon dynasty palace in traditional Korean dress.',                    category: 'culture',       duration: 180, estimatedCost: 2000,  imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&q=80' },
  { id: 'act-42', cityId: 'city-9', name: 'Myeongdong Street Food Crawl',              description: 'Sample Korean street food — tteokbokki, hotteok, egg bread, tornado potato.',         category: 'food',          duration: 120, estimatedCost: 1200,  imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&q=80' },
  { id: 'act-43', cityId: 'city-9', name: 'DMZ & JSA Border Tour',                     description: 'Visit the Demilitarized Zone and step into North Korea at the Joint Security Area.',   category: 'sightseeing',   duration: 480, estimatedCost: 7000,  imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&q=80' },
  { id: 'act-44', cityId: 'city-9', name: 'Bukchon Hanok Village Walk',                description: 'Wander 600-year-old traditional Korean houses between two palaces.',                   category: 'sightseeing',   duration: 90,  estimatedCost: 0,     imageUrl: 'https://images.unsplash.com/photo-1546874177-9e664107314e?w=400&q=80' },
  { id: 'act-45', cityId: 'city-9', name: 'Hongdae K-Pop & Nightlife',                 description: 'Live indie music, K-pop dance buskers, and neon-lit bars in the university district.', category: 'entertainment', duration: 240, estimatedCost: 3500,  imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80' },

  // REYKJAVIK
  { id: 'act-46', cityId: 'city-10', name: 'Golden Circle Day Tour',                   description: 'Visit Þingvellir, Geysir geothermal area, and Gullfoss waterfall.',                   category: 'nature',        duration: 480, estimatedCost: 9000,  imageUrl: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&q=80' },
  { id: 'act-47', cityId: 'city-10', name: 'Blue Lagoon Geothermal Spa',               description: 'Soak in milky-blue 38°C waters surrounded by black lava fields.',                      category: 'entertainment', duration: 180, estimatedCost: 7500,  imageUrl: 'https://images.unsplash.com/photo-1515238152791-8216bfcf7e0e?w=400&q=80' },
  { id: 'act-48', cityId: 'city-10', name: 'Northern Lights Hunt',                     description: 'Chase the aurora borealis by super jeep with hot cocoa stops.',                        category: 'adventure',     duration: 300, estimatedCost: 11000, imageUrl: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400&q=80' },
  { id: 'act-49', cityId: 'city-10', name: 'Glacier Hiking on Sólheimajökull',         description: 'Guided ice walk with crampons on a tongue of the Mýrdalsjökull glacier.',               category: 'adventure',     duration: 240, estimatedCost: 8500,  imageUrl: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=400&q=80' },
  { id: 'act-50', cityId: 'city-10', name: 'Reykjavik Food Walk',                      description: 'Sample fermented shark, lamb soup, and craft beer across the city centre.',             category: 'food',          duration: 150, estimatedCost: 6000,  imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
];

// ─── Trips (seeded for user-1) ──────────────────────────
export const trips = [
  {
    id: 'trip-1',
    userId: 'user-1',
    name: 'East Asia Explorer',
    description: 'Two weeks through Tokyo and Seoul — temples, street food, and neon-lit nights.',
    startDate: '2026-10-05',
    endDate: '2026-10-19',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    isPublic: true,
    shareToken: 'share-east-asia-2026',
    budget: 150000,
  },
  {
    id: 'trip-2',
    userId: 'user-1',
    name: 'Mediterranean & Bazaars',
    description: 'Lisbon\'s trams to Istanbul\'s spice markets — a journey through old-world charm.',
    startDate: '2026-12-01',
    endDate: '2026-12-14',
    coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    isPublic: false,
    shareToken: 'share-med-bazaar-2026',
    budget: 120000,
  },
  {
    id: 'trip-3',
    userId: 'user-1',
    name: 'African Contrasts',
    description: 'Cape Town\'s coastline to Marrakech\'s medina — adventure across the continent.',
    startDate: '2027-02-10',
    endDate: '2027-02-24',
    coverImage: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
    isPublic: true,
    shareToken: 'share-african-2027',
    budget: 180000,
  },
];

// ─── Trip Stops ─────────────────────────────────────────
export const tripStops = [
  // Trip 1: East Asia Explorer
  { id: 'stop-1', tripId: 'trip-1', cityId: 'city-1', startDate: '2026-10-05', endDate: '2026-10-12', stopOrder: 1 },
  { id: 'stop-2', tripId: 'trip-1', cityId: 'city-9', startDate: '2026-10-12', endDate: '2026-10-19', stopOrder: 2 },

  // Trip 2: Mediterranean & Bazaars
  { id: 'stop-3', tripId: 'trip-2', cityId: 'city-6', startDate: '2026-12-01', endDate: '2026-12-07', stopOrder: 1 },
  { id: 'stop-4', tripId: 'trip-2', cityId: 'city-3', startDate: '2026-12-07', endDate: '2026-12-14', stopOrder: 2 },

  // Trip 3: African Contrasts
  { id: 'stop-5', tripId: 'trip-3', cityId: 'city-4', startDate: '2027-02-10', endDate: '2027-02-17', stopOrder: 1 },
  { id: 'stop-6', tripId: 'trip-3', cityId: 'city-5', startDate: '2027-02-17', endDate: '2027-02-24', stopOrder: 2 },
];

// ─── Trip Activities ────────────────────────────────────
export const tripActivities = [
  // Trip 1 — Tokyo stops
  { id: 'ta-1',  tripStopId: 'stop-1', activityId: 'act-1',  date: '2026-10-06', startTime: '09:00', endTime: '12:00', notes: 'Book the morning slot — less crowded' },
  { id: 'ta-2',  tripStopId: 'stop-1', activityId: 'act-2',  date: '2026-10-06', startTime: '14:00', endTime: '16:00', notes: '' },
  { id: 'ta-3',  tripStopId: 'stop-1', activityId: 'act-3',  date: '2026-10-07', startTime: '10:00', endTime: '12:30', notes: 'Visit the Meiji Shrine nearby too' },
  { id: 'ta-4',  tripStopId: 'stop-1', activityId: 'act-4',  date: '2026-10-08', startTime: '11:00', endTime: '13:00', notes: '' },
  { id: 'ta-5',  tripStopId: 'stop-1', activityId: 'act-5',  date: '2026-10-09', startTime: '07:00', endTime: '15:00', notes: 'Check weather forecast for Fuji visibility' },
  { id: 'ta-6',  tripStopId: 'stop-1', activityId: 'act-6',  date: '2026-10-10', startTime: '13:00', endTime: '16:00', notes: '' },

  // Trip 1 — Seoul stops
  { id: 'ta-7',  tripStopId: 'stop-2', activityId: 'act-41', date: '2026-10-13', startTime: '09:00', endTime: '12:00', notes: 'Hanbok rental shop opens at 08:30' },
  { id: 'ta-8',  tripStopId: 'stop-2', activityId: 'act-42', date: '2026-10-13', startTime: '18:00', endTime: '20:00', notes: '' },
  { id: 'ta-9',  tripStopId: 'stop-2', activityId: 'act-43', date: '2026-10-14', startTime: '07:00', endTime: '15:00', notes: 'Passport required — bring original' },
  { id: 'ta-10', tripStopId: 'stop-2', activityId: 'act-44', date: '2026-10-15', startTime: '10:00', endTime: '11:30', notes: '' },
  { id: 'ta-11', tripStopId: 'stop-2', activityId: 'act-45', date: '2026-10-16', startTime: '20:00', endTime: '00:00', notes: 'Friday night is best' },

  // Trip 2 — Lisbon stops
  { id: 'ta-12', tripStopId: 'stop-3', activityId: 'act-27', date: '2026-12-02', startTime: '09:00', endTime: '10:00', notes: '' },
  { id: 'ta-13', tripStopId: 'stop-3', activityId: 'act-28', date: '2026-12-02', startTime: '11:00', endTime: '13:30', notes: 'Go early — the line for pastéis gets insane' },
  { id: 'ta-14', tripStopId: 'stop-3', activityId: 'act-29', date: '2026-12-03', startTime: '08:00', endTime: '15:00', notes: '' },
  { id: 'ta-15', tripStopId: 'stop-3', activityId: 'act-30', date: '2026-12-04', startTime: '16:30', endTime: '17:30', notes: 'Sunset is around 17:10 in December' },

  // Trip 2 — Istanbul stops
  { id: 'ta-16', tripStopId: 'stop-4', activityId: 'act-12', date: '2026-12-08', startTime: '09:00', endTime: '12:00', notes: '' },
  { id: 'ta-17', tripStopId: 'stop-4', activityId: 'act-13', date: '2026-12-08', startTime: '14:00', endTime: '16:30', notes: 'Keep cash for bargaining' },
  { id: 'ta-18', tripStopId: 'stop-4', activityId: 'act-14', date: '2026-12-09', startTime: '10:00', endTime: '12:00', notes: '' },
  { id: 'ta-19', tripStopId: 'stop-4', activityId: 'act-15', date: '2026-12-10', startTime: '10:00', endTime: '13:30', notes: '' },
  { id: 'ta-20', tripStopId: 'stop-4', activityId: 'act-16', date: '2026-12-11', startTime: '09:00', endTime: '11:30', notes: '' },

  // Trip 3 — Cape Town stops
  { id: 'ta-21', tripStopId: 'stop-5', activityId: 'act-17', date: '2027-02-11', startTime: '08:00', endTime: '11:00', notes: 'Go early before clouds roll in' },
  { id: 'ta-22', tripStopId: 'stop-5', activityId: 'act-18', date: '2027-02-12', startTime: '07:00', endTime: '15:00', notes: '' },
  { id: 'ta-23', tripStopId: 'stop-5', activityId: 'act-19', date: '2027-02-13', startTime: '12:00', endTime: '14:00', notes: '' },
  { id: 'ta-24', tripStopId: 'stop-5', activityId: 'act-20', date: '2027-02-14', startTime: '09:00', endTime: '13:00', notes: 'Book online in advance — sells out' },

  // Trip 3 — Marrakech stops
  { id: 'ta-25', tripStopId: 'stop-6', activityId: 'act-22', date: '2027-02-18', startTime: '18:00', endTime: '20:30', notes: '' },
  { id: 'ta-26', tripStopId: 'stop-6', activityId: 'act-23', date: '2027-02-19', startTime: '09:00', endTime: '11:00', notes: '' },
  { id: 'ta-27', tripStopId: 'stop-6', activityId: 'act-24', date: '2027-02-20', startTime: '07:00', endTime: '14:00', notes: 'Wear sturdy shoes' },
  { id: 'ta-28', tripStopId: 'stop-6', activityId: 'act-25', date: '2027-02-21', startTime: '15:00', endTime: '16:30', notes: '' },
];
