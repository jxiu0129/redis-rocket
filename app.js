import express from "express";
import { createClient } from "redis";
import responseTime from "response-time";
import axios from "axios";

const app = express();
app.use(responseTime());

const redisClient = createClient({
    host: "127.0.0.1",
    port: 6379,
});

(async () => {
    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    await redisClient.connect();
})();

app.route("/rockets").get(async (_, res) => {
    try {
        const reply = await redisClient.get("rockets");
        if (reply) {
            console.log("using cached data");
            res.send(JSON.parse(reply));
            return;
        }
        const { data } = await axios.get(
            "https://api.spacexdata.com/v3/rockets"
        );
        const saveResult = await redisClient.set(
            "rockets",
            JSON.stringify(data),
            { EX: 5 }
        ); // 5 here means 5sec
        console.log(`data cached ${saveResult}`);
        res.send(data);
    } catch (err) {
        res.send(err);
    }
});

const port = 3000;
app.listen(port, () => {
    console.log("listening on port " + port);
});
