import * as schema from "../db/schema";

import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const ZPDFSelect = createSelectSchema(schema.pdfs, {
  id: (schema) => schema.uuid(),
});

export const ZPDFByIDParams = z.object({
  id: z.string().uuid(),
});


export const ZUserByIDParams = z.object({
  id: z.string().uuid(),
});
