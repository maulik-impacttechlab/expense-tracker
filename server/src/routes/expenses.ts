import { Router } from "express";

import {prisma} from "../lib/prisma.js";

import type { Expense } from "../generated/prisma/client.js";
import { error } from "node:console";

export const expensesRouter = Router();

function toExpenseResponse(expense: Expense) {
  return { ...expense, amount: Number(expense.amount) };
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/expenses → list all expenses
expensesRouter.get("/", async (_req, res) => {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" } });
  res.json(expenses.map(toExpenseResponse));
});

// GET /api/expenses/:id → one expense
expensesRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json(toExpenseResponse(expense));
});

// POST /api/expenses → create a new expense
expensesRouter.post("/", async (req, res) => {
  const { title, amount, category, date, note } = req.body ?? {};

  if (typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: "title is required" });
    return;
  }
  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "amount must be a positive number" });
    return;
  }
  if (typeof category !== "string" || category.trim() === "") {
    res.status(400).json({ error: "category is required" });
    return;
  }

  const expense = await prisma.expense.create({
    data: {
      title: title.trim(),
      amount,
      category: category.trim(),
      date: date ? new Date(date) : undefined,
      note: note ?? null,
    },
  });

  res.status(201).json(toExpenseResponse(expense));
});

// PATCH /api/expenses/:id → update some fields
expensesRouter.patch("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if(id === null) {
        res.status(400).json({error : "invalid id"});
        return;
    }

    const existing = await prisma.expense.findUnique({where : {id}});

    if(!existing) {
        res.status(404).json({error : "ID not found"});
        return;
    }

    const {title, amount,category, date, note} = req.body ?? {};

    const updated = await prisma.expense.update({
        where : {id},
        data : {
            title: title,
            amount: amount,
            category : category,
            date : date ? new date(date) : undefined,
            note
        }
    });

    res.json(toExpenseResponse(updated));
});

// DELETE /api/expenses/:id → delete an expense
expensesRouter.delete("/:id", async (req, res) => {
    const id = parseId(req.params.id);

    if(id === null) {
        res.status(400).json({error : "invalid id"});
        return;
    }

    const existing = await prisma.expense.findUnique({ where : {id}});
    if(!existing) {
         res.status(404).json({error : "not found id"});
        return;
    }

    await prisma.expense.delete({where : {id}});

    res.status(204).send();
});