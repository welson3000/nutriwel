import { neon } from "@neondatabase/serverless";

const DATABASE_URL = "postgresql://neondb_owner:npg_RAl48mfsWQKg@ep-late-art-acxidtbt-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function check() {
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'pacientes';
  `;
  console.log(JSON.stringify(columns, null, 2));
}

check();
