import * as schema from "./db/schema";

import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";

import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { R2Bucket } from '@cloudflare/workers-types';
import { ZPDFByIDParams } from "./dtos";
import { dbProvider } from "./middleware/dbProvider";
import { eq } from "drizzle-orm";
import { zodValidator } from "./middleware/validator";

type Env = {
  josephmyoung_back: D1Database;
  R2: R2Bucket;
};


const api = new Hono<{ Bindings: Env }>()
  //const api = new Hono()
  .use("*", dbProvider)
  .get("/pdfs", async (c) => {
    const db = c.var.db;
    const pdfs = await db.select().from(schema.pdfs);

    return c.json(pdfs);
  })
api.get("/pdfs/:id/file", async (c) => {
  const { id } = c.req.param();

  // Look up DB entry
  const db = c.var.db;
  const [pdf] = await db
    .select()
    .from(schema.pdfs)
    .where(eq(schema.pdfs.id, id));

  if (!pdf) {
    return c.notFound();
  }

  // Use the storageKey saved in DB to get from R2
  const object = await c.env.R2.get(pdf.storageKey);

  if (!object) {
    return c.notFound();
  }

  // Return raw PDF
  return new Response(object.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${pdf.filename}"`,
    },
  });
});

const app = new Hono()
  .get("/", (c) => {
    return c.text("Welcome to the server for my website https://josephmyoung.com!");
  })
  .route("/api", api);

app.onError((error, c) => {
  console.error(error);
  if (error instanceof HTTPException) {
    return c.json(
      {
        message: error.message,
      },
      error.status,
    );
  }

  return c.json(
    {
      message: "Something went wrong",
    },
    500,
  );
});

/**
 * Serve a simplified api specification for your API
 * As of writing, this is just the list of routes and their methods.
 */
app.get("/openapi.json", (c) => {
  return c.json(
    createOpenAPISpec(app, {
      info: {
        title: "PDF Server API",
        version: "1.0.0",
        description: "API for serving PDF documents",
      },
    }),
  );
});

/**
 * Mount the Fiberplane api explorer to be able to make requests against your API.
 *
 * Visit the explorer at `/fp`
 */
app.use(
  "/fp/*",
  createFiberplane({
    app,
    openapi: { url: "/openapi.json" },
  }),
);



export default app;
