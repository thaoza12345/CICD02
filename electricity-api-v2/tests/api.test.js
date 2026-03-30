const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// helper
const loadData = (file) =>
  JSON.parse(fs.readFileSync(`./data/${file}`, "utf8"));

/* =========================
   1. TOTAL USAGE
========================= */
app.get("/api/usages/totalyear", (req, res) => {
  const data = loadData("electricity_usages_en.json");

  const totals = data.reduce((acc, curr) => {
    const year = curr.year;
    const total = Object.keys(curr)
      .filter((k) => k.endsWith("_kwh"))
      .reduce((sum, k) => sum + (curr[k] || 0), 0);

    acc[year] = (acc[year] || 0) + total;
    return acc;
  }, {});

  res.status(200).json(totals);
});

/* =========================
   2. TOTAL USERS
========================= */
app.get("/api/users/totalyear", (req, res) => {
  const data = loadData("electricity_users_en.json");

  const totals = data.reduce((acc, curr) => {
    const year = curr.year;
    const total = Object.keys(curr)
      .filter((k) => k.endsWith("_count"))
      .reduce((sum, k) => sum + (curr[k] || 0), 0);

    acc[year] = (acc[year] || 0) + total;
    return acc;
  }, {});

  res.status(200).json(totals);
});

/* =========================
   3. USAGE BY PROVINCE + YEAR
========================= */
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

/* =========================
   4. USERS BY PROVINCE + YEAR
========================= */
app.get("/api/user/:province/:year", (req, res) => {
  const { province, year } = req.params;

  if (isNaN(year)) {
    return res.status(400).json({ message: "Invalid year" });
  }

  const data = loadData("electricity_users_en.json");

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

/* =========================
   5. USAGE HISTORY
========================= */
app.get("/api/pastusage/:province", (req, res) => {
  const { province } = req.params;

  const data = loadData("electricity_usages_en.json");

  const result = data.filter(
    (d) => d.province_name.toLowerCase() === province.toLowerCase()
  );

  if (result.length === 0) {
    return res.status(404).json({ message: "Province not found" });
  }

  res.status(200).json(result);
});

/* =========================
   6. USER HISTORY
========================= */
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

/* =========================
   🔥 EXTRA APIs (ให้ครบ 12)
========================= */

// 7. list provinces (usage)
app.get("/api/provinces/usage", (req, res) => {
  const data = loadData("electricity_usages_en.json");
  const provinces = [...new Set(data.map((d) => d.province_name))];
  res.status(200).json(provinces);
});

// 8. list provinces (users)
app.get("/api/provinces/users", (req, res) => {
  const data = loadData("electricity_users_en.json");
  const provinces = [...new Set(data.map((d) => d.province_name))];
  res.status(200).json(provinces);
});

// 9. latest usage year
app.get("/api/usage/latest", (req, res) => {
  const data = loadData("electricity_usages_en.json");
  const latest = Math.max(...data.map((d) => d.year));
  res.status(200).json({ latest });
});

// 10. latest users year
app.get("/api/users/latest", (req, res) => {
  const data = loadData("electricity_users_en.json");
  const latest = Math.max(...data.map((d) => d.year));
  res.status(200).json({ latest });
});

// 11. check health
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// 12. root api info
app.get("/api", (req, res) => {
  res.status(200).json({ message: "Electricity API running" });
});

/* ========================= */

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;