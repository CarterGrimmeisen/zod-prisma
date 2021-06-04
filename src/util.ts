import type { CodeBlockWriter } from 'ts-morph'

export const writeArray = (
  writer: CodeBlockWriter,
  array: string[],
  newLine = true
) => array.forEach((line) => writer.write(line).conditionalNewLine(newLine))
