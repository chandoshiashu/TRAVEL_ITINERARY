const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();
const TravelApiKey = process.env.TRAVEL_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/message', (req, res) => {
	res.join({message: "Hello from the Express backend!"});
});






const mockTransitRoutes = {
    "Tokyo": {
        hasFlightOption: true,
        isFlightAvailableLive: true, // Try changing this to false later!
        alternativeMode: "Ferry via Osaka",
        typicalDuration: "6 hours",
        priceEstimate: "$450"
    },
    "London": {
        hasFlightOption: true,
        isFlightAvailableLive: false, // Simulated unavailable/canceled route
        alternativeMode: "Eurostar Train via Paris",
        typicalDuration: "8 hours",
        priceEstimate: "$180"
    }
};

// 2. MOCK WEATHER DATA (Simulating Weather API)
const mockWeather = {
    "Tokyo": "Sunny",
    "London": "Rainy"
};

// 3. MOCK DESTINATION ATTRACTIONS (Simulating OpenTripMap)
const mockAttractions = [
    { name: "Shibuya Sky Observatory", city: "Tokyo", tags: ["Luxury", "Sightseeing"], weatherSuitable: "all" },
    { name: "Mount Takao Forest Trail", city: "Tokyo", tags: ["Adventure"], weatherSuitable: "sunny" },
    { name: "Go-Kart Street Racing", city: "Tokyo", tags: ["Adventure"], weatherSuitable: "sunny" },
    { name: "British Museum Tour", city: "London", tags: ["Sightseeing"], weatherSuitable: "all" },
    { name: "Indoor Rock Climbing London", city: "London", tags: ["Adventure"], weatherSuitable: "all" },
    { name: "Thames Speedboat Adventure", city: "London", tags: ["Adventure"], weatherSuitable: "sunny" }
];





app.post('/api/generate-itinerary', (req, res) => {
    const {city, duration, persona} = req.body;

    if(!city || !duration || !persona){
    	return res.status(400).json({ error : "Missing required preferences" });
    }

    const currentWeather = mockWeather[city];
    const transitInfo = mockTransitRoutes[city];

    let transitStatusMessage = "";
    if (transitInfo) {
        if (transitInfo.isFlightAvailableLive) {
            transitStatusMessage = `🟢 Direct flights available! Travel time: ${transitInfo.typicalDuration}. Est: ${transitInfo.priceEstimate}.`;
        } else {
            transitStatusMessage = `⚠️ Direct flights currently unavailable. Recommended alternative: Take the ${transitInfo.alternativeMode}.`;
        }
    } else {
        transitStatusMessage = "No transit data found for this location.";
    }

    // B. Filtering Attractions Loop
    const matchingAttractions = mockAttractions.filter(place => {
        // Condition 1: Check City
        if (place.city !== city) return false;

        // Condition 2: Filter out outdoor activities if it's raining
        if (currentWeather === "Rainy" && place.weatherSuitable === "sunny") return false;

        // Condition 3: Match the Travel Persona tag
        if (!place.tags.includes(persona)) return false;

        return true;
    });

    // C. Divide Activities into Days based on Duration
    let itinerarySchedule = {};
    for (let i = 1; i <= duration; i++) {
        itinerarySchedule[`Day ${i}`] = [];
    }

    // Distribute matches into day slots evenly
    matchingAttractions.forEach((activity, index) => {
        const dayNumber = (index % duration) + 1;
        itinerarySchedule[`Day ${dayNumber}`].push(activity.name);
    });

    // D. Return the engineered payload
    res.json({
        city: city,
        weather: currentWeather,
        transitStatus: transitStatusMessage,
        schedule: itinerarySchedule
    });


});


app.listen(PORT, () => {
	console.log(`Travel Engine active at http://localhost:${PORT}`);
});
