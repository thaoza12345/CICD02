const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
// Helper: Load Data
const loadData = (file) =>
  JSON.parse(fs.readFileSync(`./data/${file}`, "utf8"));
// 1. API: Total electricity usage for each year
// 1. total usage
app.get("/api/usages/totalyear", (req, res) => {
  const data = loadData("electricity_usages_en.json");

  const totals = data.reduce((acc, curr) => {
    const year = curr.year;
    const totalUsage = Object.keys(curr)
      .filter((key) => key.endsWith("_kwh"))
      .reduce((sum, key) => sum + (curr[key] || 0), 0);

    acc[year] = (acc[year] || 0) + totalUsage;
    return acc;
  }, {});

  res.status(200).json(totals);
});
// 2. total users
app.get("/api/users/totalyear", (req, res) => {
  const data = loadData("electricity_users_en.json");

  const totals = data.reduce((acc, curr) => {
    const year = curr.year;
    const totalUsers = Object.keys(curr)
      .filter((key) => key.endsWith("_count"))
      .reduce((sum, key) => sum + (curr[key] || 0), 0);

    acc[year] = (acc[year] || 0) + totalUsers;
    return acc;
  }, {});

  res.status(200).json(totals);
});
// 3. usage province/year + validate year
app.get("/api/usage/:province/:year", (req, res) => {
  const { province, year } = req.params;

  if (isNaN(year)) {
    return res.status(400).json({ message: "Invalid year" });
  }

  const data = loadData("electricity_usages_en.json");

  const result = data.find(
    (d) =>
      d.province_name.toLowerCase() === province.toLowerCase() &&
      d.year == year
  );

  if (!result) {
    return res.status(404).json({ message: "Data not found" });
  }

  res.status(200).json(result);
});
// 4. users province/year
app.get("/api/user/:province/:year", (req, res) => {
  const { province, year } = req.params;

  const data = loadData("electricity_users_en.json");

  const result = data.find(
    (d) =>
      d.province_name.toLowerCase() === province.toLowerCase() &&
      d.year == year
  );

  if (!result) {
    return res.status(404).json({ message: "Data not found" });
  }

  res.status(200).json({
    province,
    year,
    users: result,
  });
});
// 5. past users (rename route ให้ตรง test)
app.get("/api/pastusers/:province", (req, res) => {
  const { province } = req.params;

  const data = loadData("electricity_users_en.json");

  const result = data.filter(
    (d) => d.province_name.toLowerCase() === province.toLowerCase()
  );

  if (result.length === 0) {
    return res.status(404).json({ message: "Province not found" });
  }

  res.status(200).json(result);
});
// 6. API: User history for a specific province
app.get("/api/part_users/history/:province", (req, res) => {
  const { province } = req.params;
  const data = loadData("electricity_users_en.json");
  const result = data.filter(
    (d) => d.province_name.toLowerCase() === province.toLowerCase()
  );
  res.json(result);
});
// Change the bottom of index.js from app.listen(...) to this:
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port
   ${PORT}`));
   }
   module.exports = app; // Export for testing