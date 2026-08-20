const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const artistRoutes = require("./routes/artistRoutes");
const venueRoutes = require("./routes/venueRoutes");
const concertRoutes = require("./routes/concertRoutes");
const ticketTypeRoutes = require("./routes/ticketTypeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/concerts", concertRoutes);
app.use("/api/ticket-types", ticketTypeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎵 Welcome to Concertix API",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});