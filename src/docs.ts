import { ArrayTree, parse, stringify } from "parenthesis"
import { chunk } from "./util"

export const getJSDocs = (docString?: string) => {
  const lines: string[] = []

  if (docString) {
    const docLines = docString
      .split("\n")
      .filter((dL) => !dL.trimStart().startsWith("@zod"))

    if (docLines.length) {
      lines.push("/**")
      docLines.forEach((dL) => lines.push(` * ${dL}`))
      lines.push(" */")
    }
  }

  return lines
}

export const getZodDocElements = (docString: string) =>
  docString
    .split("\n")
    .filter((line) => line.trimStart().startsWith("@zod"))
    .map((line) => line.trimStart().slice(4))
    .flatMap((line) =>
      // Array.from(line.matchAll(/\.([^().]+\(.*?\))/g), (m) => m.slice(1)).flat()
      chunk(parse(line), 2)
        .slice(0, -1)
        .map(
          ([each, contents]) =>
            (each as string).replace(/\)?\./, "") +
            `${stringify(contents as ArrayTree)})`,
        ),
    )

export const computeCustomSchema = (docString: string) => {
  return getZodDocElements(docString)
    .find((modifier) => modifier.startsWith("custom("))
    ?.slice(7)
    .slice(0, -1)
}

export const computeModifiers = (docString: string) => {
  return getZodDocElements(docString).filter(
    (each) => !each.startsWith("custom("),
  )
}
