import app from "./app.js";
import { createServer } from "http";



const httpserver=createServer(app);



const PORT = process.env.PORT || 5000;

httpserver.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
