import {
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";

const currentTimestamp = () => {
  return sql`(CURRENT_TIMESTAMP)`;
};

export type NewPDF = typeof pdfs.$inferInsert;

export const pdfs = sqliteTable(
  "pdfs",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    filename: text("filename").notNull(),    // original filename
    storageKey: text("storage_key").notNull() // key in R2
  }
);
