const express = require("express");
const cors = require("cors");
const axios = require("axios"); // optional, for fetching data
const fs = require("fs");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // <-- GANZ wichtig für JSON-Bodies!
const PFAD = "Spanisch/Lektion_03.txt"

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

app.post("/api/speichern", async (req, res) => {
    const { lines } = req.body;
    if(!lines || ! Array.isArray(lines)){
        return res.status(400).json({error: "Keine Daten übergeben"});
    }

    const content = lines.join("\n");
    fs.writeFile(PFAD, content, (err) => {
        if (err) return res.status(500).json({ error: "Speichern fehlgeschlagen" });
        res.json({ message: "Datei erfolgreich gespeichert" });
    })
    res.status(200);
});

app.get("/api/holeDaten", async (req, res) => {
  try {
    const data = fs.readFileSync(PFAD, "utf-8");
    const lines = data.split("\n");
    console.log("Lesen der Datei hat geklappt!!!");

    res.json({ lines });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Lesen der Datei" });
  }
});

