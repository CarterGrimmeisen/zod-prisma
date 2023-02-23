import { DocumentModel } from "./document"
import { PresentationModel } from "./presentation"
import { SpreadsheetModel } from "./spreadsheet"

export * from "./document"
export * from "./presentation"
export * from "./spreadsheet"

export const db: Record<string, any> = {
  Document: DocumentModel,
  Presentation: PresentationModel,
  Spreadsheet: SpreadsheetModel,
}
