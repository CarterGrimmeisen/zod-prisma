import { DocumentModel } from "./document"

export * from "./document"

export const db: Record<string, any> = {
  Document: DocumentModel,
}
