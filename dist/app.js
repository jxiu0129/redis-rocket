"use strict";

var _express = _interopRequireDefault(require("express"));

var _redis = _interopRequireDefault(require("redis"));

var _responseTime = _interopRequireDefault(require("response-time"));

var _axios = _interopRequireDefault(require("axios"));

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
app.use((0, _responseTime.default)());

const redisClient = _redis.default.createClient({
  host: "107.0.0.1",
  port: 6379
});

const GET_ASYNC = (0, _util.promisify)(redisClient.get).bind(redisClient);
const SET_ASYNC = (0, _util.promisify)(redisClient.set).bind(redisClient);
redisClient.get();
app.route("/rockets").get(async (_, res) => {
  try {
    const reply = await GET_ASYNC("rockets");

    if (reply) {
      console.log("using cached data");
      res.send(JSON.parse(reply));
    }

    const {
      data
    } = await _axios.default.get("https://api.spacexdata.com/v3/rockets");
    const saveResult = await SET_ASYNC("rockets", JSON.stringify(data), "EX", 5); // 5 here means 5sec

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