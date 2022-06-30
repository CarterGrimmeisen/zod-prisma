#!/usr/bin/env node

async function main() {
  try {
    await import("zod")
  } catch (e) {
    const RED = "\x1b[31m%s\x1b[0m"
    console.error(RED, "Please makes sure to install zod first.")
    process.exit(1)
  } finally {
    import("./index")
  }
}

main()
