import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.nbulfiypyhnyswawsrbm:CVlG5AavUJozszM2@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

async function main() {
  const client = await pool.connect()
  try {
    const sql = readFileSync(join(__dirname, '..', 'trading-schema.sql'), 'utf-8')
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        if (!s.length) return false
        // Remove comment lines; if only comments remain, skip
        const withoutComments = s.replace(/^--.*$/gm, '').trim()
        return withoutComments.length > 0
      })

    console.log(`Executing ${statements.length} SQL statements...`)

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      console.log(`\n[${i+1}] Executing: ${stmt.slice(0, 80)}...`)
      try {
        await client.query(stmt)
        console.log(`✅ OK`)
      } catch (err) {
        const msg = err.message || ''
        if (msg.includes('already exists')) {
          console.log(`↩️ Already exists`)
        } else {
          console.log(`❌ ${msg}`)
        }
      }
    }

    // Verify
    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'current_balance'`
    )
    if (rows.length > 0) {
      console.log('\n✅ Challenges table has trading columns')
    }

    const { rows: tradesCheck } = await client.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trades')`
    )
    if (tradesCheck[0]?.exists) {
      console.log('✅ trades table exists')
    }

  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
