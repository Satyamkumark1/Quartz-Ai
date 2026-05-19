import { PrismaClient } from '../prisma/generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { withAccelerate } from '@prisma/extension-accelerate'

import { parse } from 'pg-connection-string'

const connectionString = `${process.env.DATABASE_URL}`

const prismaClientSingleton = () => {
  const baseClient = (() => {
    if (connectionString.startsWith("prisma+postgres://")) {
      return new PrismaClient({ accelerateUrl: connectionString })
    }
    
    const config = parse(connectionString)
    
    const pool = new Pool({
      user: config.user ?? undefined,
      password: config.password ?? undefined,
      host: config.host ?? undefined,
      port: config.port ? parseInt(config.port, 10) : undefined,
      database: config.database ?? undefined,
      ssl: { rejectUnauthorized: true }
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  })()
  
  return baseClient.$extends(withAccelerate())
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
