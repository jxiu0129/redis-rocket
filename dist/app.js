"use strict";

var _express = _interopRequireDefault(require("express"));

var _redis = _interopRequireDefault(require("redis"));

var _responseTime = _interopRequireDefault(require("response-time"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
app.use((0, _responseTime.default)());
app.route("/rocket").get(async (_, res) => {
  try {
    const response = await _axios.default.get("https://api.spacexdata.com/v3/rockets");
    res.send(response);
  } catch (err) {
    res.send("err");
  }
});
const port = 3000;
app.listen(port, () => {
  console.log("listening on port " + port);
});