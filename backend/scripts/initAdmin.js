const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const createAdmin = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'david_sewa'
  });

  try {
    const username = 'admin';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'admin']
    );

    console.log('✅ Admin user created successfully');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('⚠️ Change this password after first login!');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  } finally {
    await connection.end();
  }
};

createAdmin();
