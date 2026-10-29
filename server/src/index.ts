import express from "express";

const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({status : "okay", message : "typescript object is running and working and good"});
});

app.listen(PORT, () => {
     console.log(`Server running at http://localhost:${PORT}`);
});