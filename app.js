import express from "express";
import redis from "redis";
import responseTime from "response-time";
import axios from "axios";

const app = express();
app.use(responseTime());

app.route("/rockets").get(async (_, res) => {
    try {
        const { data } = await axios.get(
            "https://api.spacexdata.com/v3/rockets"
        );
        // console.log(data);
        res.send(data);
    } catch (err) {
        res.send(err);
    }
});

const port = 3000;
app.listen(port, () => {
    console.log("listening on port " + port);
});
