import express, { Application, NextFunction, Request, Response } from "express";
import { TodoInterface } from "./interfaces/Todo";
import mongoose from "mongoose";
import { config } from "dotenv";

async function connectToDB() {
  await mongoose.connect(process.env.MONGODB_URL || "");
}

config();
connectToDB().catch((err) => console.log(err));

const todoSchema = new mongoose.Schema<TodoInterface>(
  {
    title: String,
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TodoModel = mongoose.model<TodoInterface>("Todo", todoSchema);
const app: Application = express();
app.use(express.json()); // parse json body content

app.get("/", (req: Request, res: Response) => {
  res.status(201).json("Hello there general kenobi " + process.env.FOO);
});

app.get(
  "/api/todos/:todoId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //req.params.todoId
      const todo: Partial<TodoInterface> | null = await TodoModel.findById(
        req.params.todoId
      );
      if (!todo) {
        throw new Error("no todo found");
      }
      res.status(201).json(todo);
    } catch (e) {
      next(e);
    }
  }
);

app.get(
  "/api/todos",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todos: Partial<TodoInterface>[] = await TodoModel.find({});
      res.status(201).json(todos);
    } catch (e) {
      next(e);
    }
  }
);

app.post(
  "/api/todos",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let todo = new TodoModel({
        title: req.body.title,
      });
      await todo.save();
      res.status(201).json(todo.toObject());
    } catch (e) {
      next(e);
    }
  }
);

app.put(
  "/api/todos/:todoId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("req body", req.body);
      let todo: Partial<TodoInterface> | null =
        await TodoModel.findOneAndUpdate(
          { _id: req.params.todoId },
          {
            ...req.body,
          }
        );
      res.status(201).json("todo updated");
    } catch (e) {
      next(e);
    }
  }
);

app.delete(
  "/api/todos/:todoId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //req.params.todoId
      await TodoModel.deleteOne({ _id: req.params.todoId });
      res.status(201).json("todo deleted");
    } catch (e) {
      next(e);
    }
  }
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("error !", err);
  res.status(500).json("Something broke!");
});
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
