const express = require('express');
const path = require('path');
const axios = require('axios');


// FOR DATABASE SETUP
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const nodemailer = require("nodemailer");
const {MongoStore} = require('connect-mongo');
console.log(MongoStore)

// FOR GOOGLE LOGIN SETUP
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

require('dotenv').config();

const {GoogleGenAI} = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD
    }
});

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days, pick whatever you want
    }
}));

app.use(passport.initialize());
app.use(passport.session());

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    GoogleID: {type: String},
    AnonymousUsername: {
        type: String
    }
});

const User = mongoose.model('User', UserSchema);


const ActivitySchema = new mongoose.Schema({
    AnonymousUsername: {type: String, required: true},
    Username: {type: String},
    Destination: {type: String, required: true},
    Date: {type: Date, required: true},
    Weather: {type: String, required: true},
    A_Bunch: {type: Array, required: true}
});

const ITINERARY = mongoose.model('ITINERARY', ActivitySchema);




passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://roamio-trip.vercel.app/auth/google/callback',
    passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
    try{
        await connectDB();

        console.log("Google username:", profile.displayName);

        // Now req exists
        const anonymousUsername = req.cookies.username;

        console.log("Anonymous username:", anonymousUsername);


        const email = profile.emails[0].value;
        let user = await User.findOne({
            username: email
        });

        if(!user || (user && user.AnonymousUsername !== anonymousUsername)){
            user = new User({
                username: email,
                password: 'Google Account',
                GoogleID: profile.id, 
                AnonymousUsername: req.cookies.username
            });

            await user.save();
        }

        done(null, user);

    } catch(error){
        done(error, null);
    }
}
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try{
        await connectDB();
        const user = await User.findById(id)
        done(null, user);
    }catch(error){
        done(error, null);
    }
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/home', failWithError: true }),
    (req, res) => {
        console.log("LOGGED IN USER:", req.user);
        res.redirect('/home');
    },
    (err, req, res, next) => {
        console.error("GOOGLE AUTH FAILED:", err); // ← this will show the real reason
        res.redirect('/home');
    }
);


app.get('/api/current-user', (req, res) => {
    if (req.user) {
        res.json({
            username: req.user.username
        });
    } else {
        res.json({
            username: null
        });
    }
});


app.get('/logout', (req, res) => {

    req.logout((err) => {

        if (err) {
            return res.status(500).json({
                success: false
            });
        }

        req.session.destroy((err) => {

            if (err) {
                return res.status(500).json({
                    success: false
                });
            }

            res.clearCookie('connect.sid');

            res.redirect('/home');
        });

    });

});


app.get('/api/check_DBUSER', async (req, res) => {

    const {username} = req.query;
    try{
        await connectDB();
        const existingUser = await User.findOne({ username });
        if(existingUser){
            return res.json({
                available: true
            });
        }

        return res.json({
            available:false
        });

    } catch(error){
        console.log("THE ERROR COMING FROM CHECKING DUPLICACY ", error);
        res.status(500).json({
            available: false,
            message: "Server error"
        });
    }

});



app.get('/api/crypto_id', (req, res) => {
    console.log("reached crypto_id");
    let username = req.cookies.username;


    if(!username){
        username = generateCryptoname();
        res.cookie('username', username, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365 // Calculating Milliseconds for 1 Year as maxAge
        });
    }

    res.json({
        username: username
    });
});


app.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const mailOptions = {
            from: process.env.CONTACT_EMAIL,
            to: process.env.CONTACT_EMAIL,
            replyTo: email,
            subject: `Roamio Contact Message from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}

                Message:
                ${message}
            `
        };

        await transporter.sendMail(mailOptions);

        console.log("Contact message sent successfully");

        res.send(`
            <script>
                alert("Your message has been sent successfully!");
                window.location.href = "/contact";
            </script>
        `);

    } catch (error) {
        console.error("Contact email error:", error);

        res.status(500).send(`
            <script>
                alert("Sorry, there was a problem sending your message.");
                window.location.href = "/contact";
            </script>
        `);
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        await connectDB();

        const { username, password } = req.body;

        const cleanUsername = username ? username.trim() : "";

        if (!cleanUsername) {
            return res.status(400).json({ success: false, message: "Username cannot be empty!" });
        }

        const existingUser = await User.findOne({ username: cleanUsername });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username is already taken!" });
        } 

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username: cleanUsername,
            password: hashedPassword,
            AnonymousUsername: req.cookies.username
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error processing registration' });
    }
});


app.post('/api/credentials', async (req, res) => {
    try{

        await connectDB();

        const { username, password } = req.body;

        const existingUser = await User.findOne({username});

        if(!existingUser){
            return res.status(401).json({success: false, message: "USERNAME DOESN'T EXISTS !"});
        }

        const Match_Pass = await bcrypt.compare(password, existingUser.password);
        if(!Match_Pass){
            return res.status(401).json({success: false, message: "PASSWORD INCORRECT !"});
        }


        // latest change

        const result = await ITINERARY.updateMany(
          { Username: "-1", AnonymousUsername: req.cookies.username},             // 1. Filter: Find documents where Username is "-1"
          { $set: { Username: username } } // 2. Update: Change the Username to your new variable
        );

        res.status(200).json({success: true, message: "LOGIN SUCCESSFULLY :)) "});

    } catch(error){
        console.error("LOGIN ERROR:", error);
        res.status(401).json({success: false, message: "Server Error Processing Login !!"});
    }
});



app.get('/home', (req, res) => {
    res.render('index', {title: 'Roamio', username: req.user ? req.user.username : null});
});

app.get('/contact', (req, res) => {
    res.render('contact', {title: 'contact us'});
});




// app.get('/blogs/hidden-gems-japan', (req, res) => {
//     res.render('hidden_gems_japan', {title:'10 HIDDEN GEMS IN JAPAN'});
// });

// app.get('/blogs/pack-2-weeks-europe', (req, res) => {
//     res.render('pack_2_weeks_europe', {title:'pack 2 weeks europe'});
// });

// app.get('/blogs/bora-bore', (req, res) => {
//     res.render('bora_bora', {title:'Bora Bora'});
// });



app.get('/api/search-place', async (req, res) => {

    try{

        const query = req.query.query;

        if(!query){
            return res.json({ results : [] });
        }

        const response = await axios.get(
            'https://geocoding-api.open-meteo.com/v1/search',
            {
                params : {
                    name: query,
                    count: 10,
                    language: 'en',
                    format: 'json'
                }
            }
        );

        const results = response.data.results || [];

        res.json({
            results : results.map(place => ({
                name: place.name,
                admin1: place.admin1,
                country: place.country,
                latitude: place.latitude,
                longitude: place.longitude
            }))
        })

    } catch(error){

        console.error(error.message);

        res.status(500).json({
            error: "Could Not Search Places"
        });

    }

});


app.get('/api/get_itineraries', async (req, res) => {
    console.log("Reached itinerary");
    try {

        await connectDB();

        console.log("REQ.COOKIES =", req.cookies);

        if (!req.cookies?.username && !req.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                message: "No user identity found"
            });
        }

        let users;

        console.log("DATA");
        console.log(req);
        console.log(req.isAuthenticated());

        if(req.isAuthenticated()){

            users = await User.find({
                GoogleID: req.user.GoogleID
            });

            console.log("HELLOW WORLD :- ", users);
        }
        else{
            const Username = req.query.username;

            console.log("USERNAME =", Username);
            users = await User.find({
                username: Username
            });
        }

        if (!users) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const Usernames = users.map(
            users => users.username
        );

        const itineraries = await ITINERARY.find({
            Username: { $in : Usernames }
        });

        return res.status(200).json({
            success: true,
            itineraries: itineraries
        });


    } catch (error) {
        console.error("GET ITINERARIES ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/activity/:name', async (req, res) => {

    try {

        const activityName = req.params.name;
        const activityImage = req.query.image_url || '/images/default.jpg';

        console.log("Activity requested:", activityName);

        const prompt = `
        You are a travel information assistant.

        Give detailed information about this tourist attraction:

        Activity:
        ${activityName}

        Return ONLY JSON.

        Include:

        - name
        - category
        - type
        - description
        - history
        - why_visit
        - tips

        Keep the information useful for a tourist.
        Do not invent facts.
        `;

        const response = await ai.models.generateContent({

            model: "gemini-3.1-flash-lite-preview",

            contents: prompt,

            config: {
                responseMimeType: "application/json",

                responseSchema: {
                    type: "object",

                    properties: {

                        name: {
                            type: "string"
                        },

                        category: {
                            type: "string"
                        },

                        type: {
                            type: "string"
                        },

                        description: {
                            type: "string"
                        },

                        history: {
                            type: "string"
                        },

                        why_visit: {
                            type: "string"
                        },

                        tips: {
                            type: "string"
                        }

                    },

                    required: [
                        "name",
                        "category",
                        "type",
                        "description",
                        "history",
                        "why_visit",
                        "tips"
                    ]
                }
            }
        });

        const activity = JSON.parse(response.text);

        res.render('activity', {
            activity,
            activityImage
        });

    } catch (error) {

        console.error(error);

        res.status(500).send("Could not load activity.");

    }

});


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function GenerateBlogImages(subtopics){

    const ImagesArr = [];

    for(const subtopic of subtopics){

        try{
            const ImageResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-image",
                contents: `Generate a High Quality Image related to the subtopic : ${subtopic}`
            });

            const ImagePart = ImageResponse.candidates?.[0]?.content?.parts?.find(
                (p) => p.inlineData?.mimeType?.startsWith('image/')
            );

            if(ImagePart && ImagePart.inlineData?.data){
                const dataUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                ImagesArr.push(dataUrl);
            }
            else{
                ImagesArr.push("/images/default.jpg");
            }

            await delay(4000);
        } catch(error){
            console.error("GOT ERROR IN GENERATING THE IMAGE :- ", error);
            ImagesArr.push("/images/default.jpg");
        }

    }

    return ImagesArr;

}


app.get('/blog/:name', async (req, res) => {

    try {

        const blogName = req.params.name;
        const blogImage = req.query.image_url || '/images/default.jpg';

        console.log("Blog requested:", blogName);

        const prompt = `
        You are a travel information assistant.

        Give detailed information about this blog title:

        Blog:
        ${blogName}

        Return ONLY JSON.

        Include:

        - Blog_Title
        - Subtopics
        - Contents
        - Overall_Description
        - History
        - Why_to_Visit
        - Tips

        While returning the JSON, make sure few points 
        1. Subtopics should be an Array. You must create a Subtopics array and all Subtopics in it.
        2. Contents should also be an Array. Each index of Contents Array must have content corresponding to the Subtopics index.
        3. Overall_Description is simply the summary of the whole blog.
        4. The Content of Each Subtopics Must Include 3-4 Paras / 100 words each. In depth Content.
        5. Overall_Description must summarize the whole blog post.
        6. History must provide the History of All Countries in breif
        7. Why_to_Visit must take some exciting hook to go there. 
        8. Tips must include all Tips needed to avoid hurdles.

        Keep the information useful for a tourist.
        Do not invent facts.
        `;

        const response = await ai.models.generateContent({

            model: "gemini-3.1-flash-lite-preview",

            contents: prompt,

            config: {
                responseMimeType: "application/json",

                responseSchema: {
                    type: "object",

                    properties: {

                        Blog_Title: {
                            type: "string"
                        },

                        Subtopics: {
                            type: "array",

                            items: {
                                type: "array",
                                items:{
                                    type:"string"
                                }
                            }
                        },

                        Contents: {
                            type: "array",

                            items: {
                                type: "string"
                            }
                        },

                        Overall_Description: {
                            type: "string"
                        },

                        History: {
                            type: "string"
                        },

                        Why_to_Visit: {
                            type: "string"
                        },

                        Tips: {
                            type: "string"
                        }

                    },

                    required: [
                        "Blog_Title",
                        "Subtopics",
                        "Contents",
                        "Overall_Description",
                        "History",
                        "Why_to_Visit",
                        "Tips"
                    ]
                }
            }
        });

        const Blog = JSON.parse(response.text);


        // const ImageResponseArray = await GenerateBlogImages(Blog.Subtopics);

        res.render('blog', {
            Blog,
            blogImage
        });

    } catch (error) {

        console.error(error);

        res.status(500).send("Could not load Blog.");

    }

});




app.post('/api/generate-itinerary', async (req, res) => {

    try {

        await connectDB();

        console.log("Request received:", req.body);

        const { username_available, current_location, destination, persona, duration } = req.body;


        // if required info not being filled, give an alert 
        if (!current_location || !destination || !persona || !duration) {
            return res.status(400).json({
                error: 'Current location, destination, persona and duration are all required.'
            });
        }

        // geocodePlace provides the coordinates of the destination
        const destinationPoint = await geocodePlace(destination);

        console.log("Destination:", destinationPoint);


        // getWeather api will use the coordinates of destination to get weather condition 
        const weather = await getWeather(
            destinationPoint.lat,
            destinationPoint.lon
        );

        console.log("Weather:", weather);


        // getGeminiActivities will use the gemini model 3.1 flash to generate travel Itineraries 
        const activities = await getGeminiActivities(
            destinationPoint,
            persona,
            weather,
            duration
        );

        // console.log("Activities:", activities);



        /// PUSHING ITINERARY INTO THE MONGODB 
        const now = new Date(); // [1]
        console.log(username_available);

        const newItinerary = new ITINERARY({
            AnonymousUsername: req.cookies.username,
            Username: username_available,
            Destination: destinationPoint.name,
            Date: now,
            Weather: weather.label,
            A_Bunch: activities
        });



        await newItinerary.save();


        // server will send the response with all the data we collected using functions.
        res.json({
            username_available,
            current_location,
            destination: destinationPoint.name,
            persona,
            weather: weather.label,
            itinerary: activities
        });

    } catch(error) {

        // if try doesn't work, we will catch the error and display it
        console.error(error.message);

        res.status(500).json({
            error: 'Could Not create trip Plan'
        });
    }
});


let cached = global._mongooseConn;
if (!cached) {
    cached = global._mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URL, {
            maxPoolSize: 10,
            bufferCommands: false,
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}



// Here is the getWeather function, which will take latitute and longitude to return weather

async function getWeather(lat, lon) {

    // axios will help us send network request to api, params will generate url 
    // the weather API is open-meteo that we are using 
    const response = await axios.get(
        'https://api.open-meteo.com/v1/forecast',
        {
            params: {
                latitude: lat,
                longitude: lon,
                current_weather: true
            }
        }
    );


    // the below code will provide us with codes of weather 
    const current = response.data.current_weather;
    const code = current?.weathercode;

    let weatherDescription = 'Unknown';

    // code refers to different type of weather conditions as written on the api website 
    if (code === 0) weatherDescription = 'Clear Sky';
    else if (code >= 1 && code <= 3) weatherDescription = 'Cloudy';
    else if (code >= 45 && code <= 48) weatherDescription = 'Foggy';
    else if (code >= 51 && code <= 67) weatherDescription = 'Rainy';
    else if (code >= 71 && code <= 77) weatherDescription = 'Snowy';
    else if (code >= 80 && code <= 82) weatherDescription = 'Rain Showers';
    else if (code >= 85 && code <= 86) weatherDescription = 'Snow Showers';
    else if (code >= 95 && code <= 99) weatherDescription = 'Thunderstorm';

    // using code, will decide whether rainy or cloudy
    const isRainy =
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82);

    return {
        isRainy,
        label: `${weatherDescription}, ${current?.temperature}C`
    };
}


// geocodePlace will take destination name and give us with latitude and longitude coors.
async function geocodePlace(name) {

    // again a network request to api open-meteo
    const response = await axios.get(
        'https://geocoding-api.open-meteo.com/v1/search',
        {
            params: {
                name,
                count: 1,
                language: 'en',
                format: 'json'
            }
        }
    );

    // extracting details 
    const place = response.data.results?.[0];

    if (!place) {
        throw new Error('Destination not found.');
    }

    // returning values
    return {
        name: `${place.name}, ${place.country}`,
        lat: place.latitude,
        lon: place.longitude
    };
}

// the Main Itinerary Handling Gemini Function
async function getGeminiActivities(destination, persona, weather, duration){

    // checking if GEMINI_API_KEY exists on .env file
    if(!GEMINI_API_KEY){
        throw new Error('Missing Gemini API Key in .env');
    }

    // the Prompt which we will gonna send to our Gemini api model 
    const prompt = `

        You are an intelligent travel itinerary planner.

        Destination:
        ${destination.name}

        Coordinates:
        Latitude: ${destination.lat}
        Longitude: ${destination.lon}

        Traveler persona:
        ${persona}

        Trip duration:
        ${duration} days

        Current weather:
        ${weather.label}

        Rain expected:
        ${weather.isRainy ? 'Yes' : 'No'}


        Create a complete ${duration}-day travel itinerary for this destination.


        Rules:

        1. Create exactly ${duration} days.
        2. Each day should contain up to 3 suitable activities:
            - Morning
            - Afternoon
            - Evening

            Use fewer than 3 activities if adding another activity would make
            the day unrealistic or require excessive travel.

        3. Recommend genuinely famous and worthwhile tourist attractions.
        4. Prefer major landmarks, famous tourist attractions, popular viewpoints,
           famous museums, parks, markets and culturally important places.
        5. Do NOT recommend random or obscure places just because they exist.
        6. All attractions must actually be in or very close to the destination.
        7. Consider the traveler's persona.
        8. Consider the current weather.
        9. If rain is expected, prefer indoor activities.
        10. If there is no rain, prefer suitable outdoor activities.
        11. Group geographically close attractions on the same day where possible.
        12. Do not repeat the same attraction.
        13. Do not invent attractions.
        14. Do not include restaurants unless they are themselves a famous attraction.
        15. Give a short reason explaining why each activity is recommended.
        16. Return ONLY the JSON structure requested.
        17. Group activities geographically.
        18. Prefer activities that are close to each other on the same day.
        19. Minimize unnecessary travel between activities.
        20. Consider a realistic travel schedule between activities.
        21. Do not schedule two attractions that are far apart on the same day
            unless they are exceptionally important.
        22. Prefer creating a logical geographic route for each day.
        
        Return the itinerary as an array of arrays.
        Each inner array represents one day.
        Do not include day numbers or day objects.

        `;


    // now we will gonna provide model with the above prompt
    // Also tell gemini to send response in a particular way of json

    const response = await ai.models.generateContent({

        // model name 
        model: "gemini-3.1-flash-lite-preview",
        
        contents: prompt,

        config: {
            responseMimeType: "application/json",


            // this is the Schema of gemini response to our prompt 
            // we want array of arrays and inside those arrays, we will be having activities
            responseSchema: {
                type: 'array', 

                // The each Inner Array will define the Day 1, 2, 3,.. 
                items: {
                    type: 'array', 

                    items:{
                        // inside arrays of array, we will be having activities
                        type: 'object',

                        properties: {
                            // the below are the properties we want 
                            time: {
                                type: 'string'
                            },

                            name: {
                                type: 'string'
                            },

                            category: {
                                type: 'string'
                            },

                            type: {
                                type: 'string'
                            }, 

                            reason: {
                                type: 'string'
                            }
                        },

                        // required forces gemini model to respond in this way only.
                        required: [
                            "time",
                            "name",
                            "category",
                            "type",
                            "reason"
                        ]
                    }
                }
            }
        }
    });


    // we will parse the json reply so that we can access info using square brackets 
    const result = JSON.parse(response.text);

    // console.log("GEMINI ITINERARY:", result);

    const days = [];

    // double for loops for accessing and pushing details into days variable 
    for (const day of result) {

        const dayActivities = [];

        for (const activity of day) {

            console.log("Getting Image for:", activity.name);

            // Here we are gonna call getImageForActivity function to get the image 
            const image = await getImageForActivity(
                activity.name,
                destination.name
            );

            // pushing the required details as one activity into dayActivities
            // Each index will represent the activity of a particular day 
            dayActivities.push({
                time: activity.time,
                name: activity.name,
                category: activity.category,
                type: activity.type,
                reason: activity.reason,
                image
            });
        }

        // now pushing dayActivities into days which means we are pushing everyday into days combined
        days.push(dayActivities);
    }

    // Here we are returning the whole Travel Itinerary Data 
    return days;

}



// This is the Function which will provide us with the Activity Image 
async function getImageForActivity(activityName, destinationName) {

    // we are gonna try getting image from WikiData
    try {

        // we are sending network request using axios to wikidata API
        const response = await axios.get(
            'https://www.wikidata.org/w/api.php',
            {
                params: {
                    action: 'wbsearchentities',
                    search: activityName,
                    language: 'en',
                    format: 'json',
                    limit: 10
                },

                // we need to add User-Agent otherwise wikidata api would consider us unauthentic 
                headers: {
                    'User-Agent':
                        'TravelItineraryMVP/1.0 (chandoshiashish@gmail.com)'
                }
            }
        );

        // accessing those 10 results we got from response 
        const results = response.data.search || [];

        console.log(
            `Wikidata results for ${activityName}:`,
            results.map(r => r.id)
        );


        // now accessing each index of results 
        for (const result of results) {

            // Here we are sending result.id 
            // which is basically wikidataid to get the image 

            const image = await getWikidataImage(result.id);

            // if Image found, we are gonna return it.
            if (image) {

                console.log(
                    `Wikidata image found for ${activityName}`
                );

                return image;
            }
        }

    } catch (error) {

        console.error(
            `Wikidata search failed for ${activityName}:`,
            error.message
        );
    }




    // If the above try catch doesn't return the image, then we are gonna apply another try catch
    // Here,  we try method-2 using function searchCommonsImage (Wikimedia Commons)
    try {

        // Another Function for getting Image
        const image = await searchCommonsImage(
            activityName,
            destinationName
        );

        if (image) {

            console.log(
                `Commons image found for ${activityName}`
            );

            return image;
        }

    } catch (error) {

        console.error(
            `Commons search failed for ${activityName}:`,
            error.message
        );
    }



    // Finally after 2 methods, if Image not found, we are gonna return null.
    console.log(
        `NO IMAGE FOUND FOR: ${activityName}`
    );

    return null;
}


// This Function takes wikidataid as input and tries to find the image URL 
async function getWikidataImage(wikidataId) {

    // if not found, return null
    if (!wikidataId) {
        return null;
    }

    // throwing network request to get response 
    const response = await axios.get(
        `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`,
        {
            // proof that we are authentic 
            headers: {
                'User-Agent':
                    'TravelItineraryMVP/1.0 (chandoshiashish@gmail.com)'
            }
        }
    );

    // Here Image URL is inside a property called P18
    const entity = response.data.entities[wikidataId];
    // console.log("ENTITY:", entity);
    const imageClaim = entity.claims?.P18?.[0];

    // if there doesn't exists a property P18, that means no image
    if(!imageClaim) {
        return null;
    }

    // console.log(imageClaim);
    // P18 means image available so fileName is a variable where we store data value 
    const fileName =
        imageClaim.mainsnak.datavalue.value;

    console.log("Wikimedia file:", fileName);

    // we are passing a fileName with huge data inside it to extract Image URL 
    const imageUrl = await getCommonsImage(fileName);

    console.log("FINAL IMAGE URL:", imageUrl);

    return imageUrl;
}


// sending fileName to get URL from the File we will be getting 
async function getCommonsImage(fileName) {

    // Throwing network request on another API commons.wikimedia with a SINGLE FILE NAME 
    const response = await axios.get(
        'https://commons.wikimedia.org/w/api.php',
        {
            params: {
                action: 'query',
                format: 'json',
                prop: 'imageinfo',
                titles: `File:${fileName}`,
                iiprop: 'url|size',
                iiurlwidth: 500
            },
            headers: {
                'User-Agent':
                    'TravelItineraryMVP/1.0 (chandoshiashish@gmail.com)'
            }
        }
    );


    // accessing page from file with name fileName
    // console.log(response.data);
    const pages = response.data.query.pages;
    // console.log("Here are the pages data :- /n",pages);
    const page = Object.values(pages)[0];
    // console.log(page)

    // if not found image information from the page, then return null
    if (!page.imageinfo) {
        return null;
    }

    // if found, then access it 
    const imageInfo = page.imageinfo[0];

    // console logs 
    console.log("Original:", imageInfo.url);
    console.log("Thumbnail:", imageInfo.thumburl);
    console.log("Thumbnail width:", imageInfo.thumbwidth);

    return imageInfo.thumburl || imageInfo.url || null;
}



// Our Second Method to Get Image URLs
async function searchCommonsImage(activityName, destinationName) {

    // Throwing a network request to commons.wikimedia API again with destination name
    const response = await axios.get(
        'https://commons.wikimedia.org/w/api.php',
        {
            params: {
                action: 'query',
                format: 'json',

                generator: 'search',

                gsrsearch:
                    `${activityName} ${destinationName}`,

                gsrnamespace: 6,

                gsrlimit: 10,

                prop: 'imageinfo',

                iiprop: 'url|size',

                iiurlwidth: 500
            },

            headers: {
                'User-Agent':
                    'TravelItineraryMVP/1.0 (chandoshiashish@gmail.com)'
            }
        }
    );


    // This will provide us with huge data or PAGES 
    const pages =
        response.data.query?.pages;

    if (!pages) {
        return null;
    }


    const pageList =
        Object.values(pages);


    // We are gonna go through every single page to check for imageInfo 
    for (const page of pageList) {

        // If a current page doesn't have imageinfo, then continue to next iteration
        if (!page.imageinfo) {
            continue;
        }

        // if found then check for its zeroth index
        const imageInfo =
            page.imageinfo[0];



        // if imagefound return it,otherwise null

        if (imageInfo.thumburl) {

            console.log(
                "Commons thumbnail:",
                imageInfo.thumburl
            );

            return imageInfo.thumburl;
        }


        if (imageInfo.url) {

            console.log(
                "Commons original:",
                imageInfo.url
            );

            return imageInfo.url;
        }
    }


    return null;
}

function generateCryptoname(){
    return "user_" + crypto.randomUUID();
}



if (require.main === module) {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`Server running at port ${port}`);
    });
}

module.exports = app;
