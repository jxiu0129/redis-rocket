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
        // 檢查redis內有無資料，有的話就直接回傳
        const reply = await redisClient.get("rockets");
        if (reply) {
            console.log("using cached data");
            res.send(JSON.parse(reply));
            return;
        }
        const { data } = await axios.get(
            "https://api.spacexdata.com/v3/rockets"
        );
        // 抓完資料塞進redis
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

app.route("/rocket/:rocketId").get(async (req, res) => {
    try {
        const { rocketId } = req.params;
        const reply = await redisClient.get(rocketId);
        if (reply) {
            console.log("using cached data");
            res.send(JSON.parse(reply));
            return;
        }
        const { data } = await axios.get(
            `https://api.spacexdata.com/v3/rockets/${rocketId}`
        );
        const saveResult = await redisClient.set(
            rocketId,
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
