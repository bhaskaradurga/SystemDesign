const express = require("express");
const cors = require("cors"); // Install using: npm install cors
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const appServer = http.createServer(app);
const io = new Server(appServer, {
  cors: {
    origin: "*",
  },
});
let waitingQueue = [];
let data = {
  timestamp: Date.now(),
  message: "New data available",
};

//sockets
// io.on("connection", (Socket) => {
//   console.log("New Connection");
//   Socket.on("chat message", (msg) => {
//     console.log(
//       "message: " +
//         JSON.parse(msg).message +
//         " " +
//         typeof JSON.parse(msg).roomId
//     );
//     io.emit("chat message", JSON.stringify(JSON.parse(msg).message)); // trying to create rooms for the websockets
//     // message: {"message":"heelo ","roomId":"1234"}
//   });
//   // Handle room joining
//   Socket.on("join_room", (room) => {
//     Socket.join(room);
//     console.log(`Socket ${Socket.id} joined room ${room}`);
//   });
//   // When receiving a chat message
//   Socket.on("room chat", (msg) => {
//     try {
//       const parsedMsg = JSON.parse(msg);
//       console.log(`Message: ${parsedMsg.message} | Room: ${parsedMsg.roomId}`);

//       // Join the room
//       // Socket.join(parsedMsg.roomId);

//       // Broadcast to room members (excluding sender)
//       Socket.to(parsedMsg.roomId).emit(
//         "new_message",
//         JSON.stringify({
//           message: parsedMsg.message,
//           roomId: parsedMsg.roomId,
//         })
//       );
//     } catch (error) {
//       console.error("Error processing message:", error);
//     }
//   });

//   Socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });
io.on("connection", (socket) => {
  console.log("New Connection");

  // Handle room joining
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // Handle message sending within rooms
  socket.on("room chat", (msg) => {
    try {
      const parsedMsg = JSON.parse(msg);
      console.log(`Message: ${parsedMsg.message} | Room: ${parsedMsg.roomId}`);

      // Broadcast message to all members in the room except sender
      socket.to(parsedMsg.roomId).emit(
        "new_message",
        JSON.stringify({
          message: parsedMsg.message,
          roomId: parsedMsg.roomId,
        })
      );
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

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
appServer.listen(3001, () => {
  console.log("Server is running on port 3001"); // Correct port number
});
