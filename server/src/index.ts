import express from "express";
import { prisma } from "./lib/prisma.js";

const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({status : "okay", message : "typescript object is running and working and good"});
});

app.get("/api/expenses", async (_req,res) => {
    const expenses = await prisma.expense.findMany({
        orderBy : {date : "desc"}
    });
    res.json(expenses);
});

app.listen(PORT, () => {
     console.log(`Server running at http://localhost:${PORT}`);
});