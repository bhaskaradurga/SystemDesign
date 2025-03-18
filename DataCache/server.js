const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Adjust this to your frontend URL
    credentials: true,
  })
);
app.use((req, res, next) => {
  //   console.log("InSetHeader");
  //   res.removeHeader("X-Powered-By");
  //   res.setHeader("x-Content-Type-Options", "nosniff");
  //   res.setHeader("x-Frame-Options", "DENY");
  //   res.setHeader("x-XSS-Protection", "1; mode=block");
  //   res.setHeader("Referrer-Policy", "same-origin"); not worked with these please use below

  res.removeHeader("X-Powered-By");
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "same-origin",
    "cache-control": true,
  });
  next();
  next();
});
app.use(bodyParser.json());
app.use(cookieParser());
app.get("/getCookie", (req, res) => {
  console.log("request cookies", req.cookies);
  //get etag from request
  console.log("etag", req.headers["if-none-match"]);
  //set cookies
  res.cookie("cookie1", "value1", {
    httpOnly: false, // Set to false if you need access in JavaScript
    secure: false, // Only needed for HTTPS
    // sameSite: "None", // "None" requires `secure: true`
    expires: new Date(Date.now() + 60 * 60 * 100000),
  });
  res.json({ message: "Cookie set" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
