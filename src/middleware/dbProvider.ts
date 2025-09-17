import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";

// Match the binding name from wrangler.toml
export const dbProvider = createMiddleware<{
  Bindings: {
    josephmyoung_back: D1Database;
  };
  Variables: {
    db: DrizzleD1Database;
  };
}>(async (c, next) => {
  // Use the correct binding
  const db = drizzle(c.env.josephmyoung_back, {
    casing: "snake_case",
  });

  c.set("db", db);
  await next();
});
