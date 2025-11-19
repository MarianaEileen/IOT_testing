import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('🔍 Diagnóstico de conexión PostgreSQL\n');
console.log('Configuración actual:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Host:     ${process.env.DB_HOST}`);
console.log(`Port:     ${process.env.DB_PORT}`);
console.log(`User:     ${process.env.DB_USER}`);
console.log(`Password: ${'*'.repeat(process.env.DB_PASSWORD?.length || 0)}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`SSL:      ${process.env.DB_SSL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Sin SSL
console.log('Test 1: Intentando conectar SIN SSL...');
const poolNoSSL = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false
});

try {
  const client = await poolNoSSL.connect();
  console.log('✅ ¡Conexión exitosa SIN SSL!');
  console.log('   Tu DB_SSL debería ser "false"\n');

  const result = await client.query('SELECT version()');
  console.log('Versión de PostgreSQL:', result.rows[0].version);

  client.release();
  await poolNoSSL.end();
  process.exit(0);
} catch (error) {
  console.log('❌ Falló conexión sin SSL');
  console.log('   Error:', error.message);
  console.log('   Código:', error.code);
  await poolNoSSL.end();
}

// Test 2: Con SSL
console.log('\nTest 2: Intentando conectar CON SSL...');
const poolSSL = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

try {
  const client = await poolSSL.connect();
  console.log('✅ ¡Conexión exitosa CON SSL!');
  console.log('   Tu DB_SSL debería ser "true"\n');

  const result = await client.query('SELECT version()');
  console.log('Versión de PostgreSQL:', result.rows[0].version);

  client.release();
  await poolSSL.end();
  process.exit(0);
} catch (error) {
  console.log('❌ Falló conexión con SSL');
  console.log('   Error:', error.message);
  console.log('   Código:', error.code);
  await poolSSL.end();
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚨 PROBLEMA DETECTADO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Posibles causas:\n');
console.log('1. ❌ Credenciales incorrectas');
console.log('   → Verifica usuario/contraseña en AWS');
console.log('   → Verifica que el nombre de la base de datos sea correcto\n');

console.log('2. ❌ Host incorrecto');
console.log('   → 78.12.149.93 no es un host de AWS RDS típico');
console.log('   → Los hosts de RDS suelen ser: xxx.yyy.rds.amazonaws.com\n');

console.log('3. ❌ Puerto bloqueado');
console.log('   → Verifica Security Groups en AWS');
console.log('   → Permite puerto 5432 desde tu IP\n');

console.log('4. ❌ No es PostgreSQL');
console.log('   → ¿Tal vez es MySQL en ese host?\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n💡 Solución recomendada:');
console.log('   1. Ve a AWS Console → RDS');
console.log('   2. Busca tu instancia de base de datos');
console.log('   3. Copia el "Endpoint" correcto');
console.log('   4. Actualiza tu archivo .env\n');

process.exit(1);
