"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import TodoPresentation from "@/components/todo/TodoPresentation";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function TodoContainer() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => subscription.unsubscribe();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <TodoPresentation
      todos={todos}
      onCreate={createTodo}
      onDelete={deleteTodo}
    ></TodoPresentation>
  );
}
