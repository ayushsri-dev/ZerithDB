# SvelteKit Todo — ZerithDB Example

A local-first todo application built with **SvelteKit** and **ZerithDB**, demonstrating browser-safe database initialization, IndexedDB persistence, and reactive CRUD operations.

## Features Demonstrated

| Service Function | Underlying ZerithDB API | Purpose                       |
| ---------------- | ----------------------- | ----------------------------- |
| `fetchTodos()`   | `find()`                | Load persisted todo documents |
| `createTodo()`   | `insert()`              | Create a new todo             |
| `updateTodo()`   | `update()`              | Update task completion state  |
| `deleteTodo()`   | `delete()`              | Remove a todo document        |


## Quick Start

```bash
cd examples/sveltekit-todo
pnpm install
pnpm dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```text
sveltekit-todo/
├── package.json
├── README.md
├── src/
│   ├── app.html
│   ├── lib/
│   │   ├── db.ts
│   │   ├── todoServices.ts
│   │   └── components/
│   │       └── Sidebar.svelte
|   |   └── styles/ 
|   |       └── global.css
│   │
│   ├── routes/
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   │
│   
```

## How It Works

1. **`src/lib/db.ts`** initializes ZerithDB only in the browser environment.

   Since SvelteKit supports SSR, the example uses:

   * `browser` checks
   * dynamic SDK imports
   * lightweight browser polyfills

   to prevent server-side runtime errors during initialization.

2. **`todoServices.ts`** centralizes all CRUD operations for the todos collection.

   * `fetchTodos()` — loads persisted todos
   * `createTodo()` — creates new todo documents
   * `updateTodo()` — updates task completion state
   * `deleteTodo()` — removes todo documents

3. **`+page.svelte`** manages reactive UI state, task filtering, calendar interactions, and dashboard statistics.

4. Todo data is persisted locally using **IndexedDB** through ZerithDB.

   Refreshing the page preserves all stored tasks.

## Tech Stack

* **SvelteKit** — Application framework
* **Svelte 5 Runes** — Reactive state management
* **Vite** — Development server and bundler
* **ZerithDB SDK** — Local-first database
* **IndexedDB** — Persistent browser storage

## Important Notes

ZerithDB depends on browser-specific APIs and networking utilities.

To ensure compatibility with SvelteKit SSR, this example:

* initializes the database only in the browser
* dynamically imports the SDK after applying polyfills
* avoids server-side execution during app startup
