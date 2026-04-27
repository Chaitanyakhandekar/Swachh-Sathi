import connectDB from "./db/db.js"
import {httpServer} from "./server.js";
import { initializeSocket } from "./sockets/index.js";
import { redis } from "./redis/config.js";

connectDB().then(async () => {
  // initializeSocket();  Initialize socket handlers
  
  httpServer.listen(3000, async () => {
    console.log("Server is running on port 3000");
  });
});
