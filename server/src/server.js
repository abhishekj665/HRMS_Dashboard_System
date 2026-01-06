import app from "./app.js";
import { connectDB } from "./db/connectDB.js";
import { env } from "./config/env.js";

import { syncDB } from "./db/syncDB.js";

const startServer = async () => {
  await connectDB();
  // await syncDB();

  app.listen(env.port, () => {
    console.log(`Server is listining on port ${env.port}`);
  });
};

startServer();
