import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import itemRoutes from "./routes/itemRoutes.js";
import { authRoutes, userRoutes, itemRoutes } from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";


connectDB();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

app.use(notFound);
app.use(errorHandler);
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
