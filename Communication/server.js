const express = require("express");
const cors = require("cors"); // Install using: npm install cors
const app = express();
let waitingQueue = [];
let data = {
  timestamp: Date.now(),
  message: "New data available",
};
// 1. CORS Fix (Proper configuration)
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// 2. Short Polling Endpoint Fix
app.post("/shortPolling", async (req, res) => {
  // Changed to app.get
  console.log("Short polling request received", req.query); // Use req.query for GET params

  // 3. Immediate response demonstration
  const responseData = {
    timestamp: Date.now(),
    message: "New data available",
  };

  res.json(responseData); // Send JSON response
});

//3.long polling endpoint fix
app.post("/longPolling", async (req, res) => {
  console.log("Longpolling");
  const requestData = req.body;
  if (requestData.message !== data.message) {
    res.json(data);
  } else {
    waitingQueue.push(res);
    setTimeout(() => {
      res.json({
        timestamp: Date.now(),
        message: "No new data available",
      });
    }, 30000);
    console.log("Waiting Queue", waitingQueue.length);
  }
});
//4.ServerSentEvents endpoint fix
// Server-Sent Events (SSE) endpoint
app.get("/sse", async (req, res) => {
  // Set proper SSE headers
  res.setHeader("Content-Type", "text/event-stream"); // Fixed typo and correct content type
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // res.setHeader("Access-Control-Allow-Origin", "*"); // Add CORS if needed
  console.log("SSE");
  let counter = 0;

  // Send data every second
  const interval = setInterval(() => {
    console.log("data sent", counter);
    const data = {
      timestamp: Date.now(),
      message: `Update ${counter++}`,
    };

    // Proper SSE format: "data: " + JSON string + "\n\n"
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 1000);
  // Handle client disconnect
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});
app.post("/newData", async (req, res) => {
  console.log("New data received", req.body);
  data = req.body;
  while (waitingQueue.length > 0) {
    waitingQueue.pop().send(data);
  }
  res.send("Data updated");
});

// 4. Port consistency fix
app.listen(3001, () => {
  console.log("Server is running on port 3001"); // Correct port number
});
