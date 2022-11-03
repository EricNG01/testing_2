const express = require('express');
const responseTime = require('response-time') 
const axios = require('axios');
const redis = require('redis');

const app = express();

// This section will change for Cloud Services
// Redis setup
const redisClient = redis.createClient({
    host: 'asm2-tesing-elasticache-for-redis.km2jzi.ng.0001.apse2.cache.amazonaws.com'
});
redisClient.connect()
    .catch((err) => { 
        console.log(err);
    });

 // Used to display response time in HTTP header
app.use(responseTime());
app.get("/api/search", (req, res) => { 
    const query = req.query.query.trim();
    // Construct the wiki URL and redis key (reduced font size for clarity)
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${query}`;
    const redisKey = `wikipedia:${query}`; 
    redisClient.setEx( 
        redisKey, 
        3600, 
        JSON.stringify(`wikipedia:${query}`)
    );
    redisClient.get(redisKey).then((result) => { 
    if (result) {
        // Serve from redis
        const resultJSON = JSON.parse(result);
        res.json(resultJSON);
    } else { 
        // Serve from Wikipedia and store in redis
        axios
        .get(searchUrl) 
        .then((response) => { 
        const responseJSON = response.data; 
        redisClient.setEx( 
            redisKey, 
            3600, 
            JSON.stringify({ source: "Redis Cache", ...responseJSON })
        );
        res.json({ source: "Wikipedia API", ...responseJSON });
        })
        .catch((err) => res.json(err));
    } 
    });
});
app.get("/app", (req, res) => {
    const redisKey = `ASM2`
    redisClient.get(redisKey).then((result) => {
      if (result) {
        console.log(result);
      } else {
        redisClient.setEx(
          redisKey,
          3600,
          JSON.stringify("testingString")
        );
        console.log("Storing");
      }
    })
    res.json("testingString");
})
app.listen(3000, () => { 
    console.log('Server listening on port: ', 3000);
})