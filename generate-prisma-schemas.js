const { exec } = require('child_process')

const basePath = './src/test/functional'
const schemaPaths = [
  'basic/prisma/schema.prisma',
  'config/prisma/schema.prisma',
  'config-import/prisma/schema.prisma',
  'different-client-path/prisma/schema.prisma',
  'docs/prisma/schema.prisma',
  'imports/prisma/schema.prisma',
  'json/prisma/schema.prisma',
  'optional/prisma/schema.prisma',
  'recursive/prisma/schema.prisma',
  'relation-1to1/prisma/schema.prisma',
  'relation-false/prisma/schema.prisma',
]

schemaPaths.forEach((path) => {
  const schema = `${basePath}/${path}`
  exec(`prisma generate --schema=${schema}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating schema for ${schema}: ${error.message}`)
      return
    }
    if (stderr) {
      console.error(`Error output for ${schema}: ${stderr}`)
      return
    }
    console.log(`Successfully generated schema for ${schema}: ${stdout}`)
  })
})
