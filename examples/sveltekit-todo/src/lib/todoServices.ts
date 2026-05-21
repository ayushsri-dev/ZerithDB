/**
 * Centralized CRUD service layer for the todo app.
 *
 * Keeps database logic separated from UI components 
 * by wrapping ZerithDB collection operations
 * into reusable async functions.
 */

import { getTodosCollection } from "./db";

export async function fetchTodos() {
  const todosCollection =
    await getTodosCollection();
  return await todosCollection.find();
}

export async function createTodo(todo: any) {
  const todosCollection =
    await getTodosCollection();
  return await todosCollection.insert(todo);
}

export async function updateTodo(
  id: string,
  updates: any
) 
  {
  const todosCollection =
    await getTodosCollection();
  return await todosCollection.update(
    { _id: id },
    {$set: updates}
  );
}

/**
 *  Since ZerithDB uses MongoDB styled update operators like $set.
 *  So it updates a todo document by its _id.
*/

export async function deleteTodo(id: string) {
  const todosCollection =
    await getTodosCollection();
  return await todosCollection.delete({_id: id});
}