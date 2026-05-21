/**
 * This is the key file.
 * SvelteKit SSR + ZerithDB browser initialization happens here
 * 
 * Initializes the ZerithDB client for the SvelteKit app.
 * ZerithDB depends on browser-only APIs and networking utilities
 * so initialization must happen only on the client side to avoid SSR runtime errors.
 * The database client is initialized lazily and
 * only in the browser to maintain SvelteKit SSR compatibility.
 */

import { browser } from "$app/environment";

// to avoid reinitializing the database client
let app: any = null;

export async function getTodosCollection() {
  // Prevent ZerithDB from initializing during SSR.
 // ZerithDB relies on browser APIs like window and IndexedDB.
  if (!browser) {
    throw new Error(
      "ZerithDB must run in browser."
    );
  }

  // ZerithDB networking dependencies expect Node.js globals like `global` and `process`
  // so lightweight browser polyfills are added before importing the SDK.
  (window as any).global = window;
  (window as any).process = {
    env: {}
  };

  // Importing SDK dynamically after polyfills ensures that
  // browser globals exist before module execution.
  const { createApp } = await import("zerithdb-sdk");

  if (!app) {
    app = createApp({
    appId: "sveltekit-todo-example"
    });
  }
  return app.db("todos");
}

