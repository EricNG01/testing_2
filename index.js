const express = require('express');
const responseTime = require('response-time') 
const axios = require('axios');
const redis = require('redis');

const app = express();

// This section will change for Cloud Services
// Redis setup
const redisClient = redis.createClient({
    host: 'redis://asm2-tesing-elasticache-for-redis.km2jzi.ng.0001.apse2.cache.amazonaws.com:6379'
});
redisClient.connect()
    .catch((err) => { 
        console.log(err);
    });

 // Used to display response time in HTTP header
app.use(responseTime());

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