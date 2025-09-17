import { z } from "zod";

export const ZPDFByIDParams = z.object({
    id: z.string().uuid(),
});

export type PDFByIDParams = z.infer<typeof ZPDFByIDParams>;
