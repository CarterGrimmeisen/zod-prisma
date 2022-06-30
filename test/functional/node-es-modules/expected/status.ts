import * as z from "zod"

export const statusSchema = z.enum(["UNSAVED", "SAVED", "DELETED"])
