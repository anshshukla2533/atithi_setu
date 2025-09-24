// secure-config.js - Add environment validation
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MYSQL_HOST',
  'MYSQL_PORT', 
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'MYSQL_DATABASE'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file');
  process.exit(1);
}

// Validate environment values
if (isNaN(parseInt(process.env.MYSQL_PORT))) {
  console.error('❌ MYSQL_PORT must be a valid number');
  process.exit(1);
}

// Optional environment variables with defaults
const config = {
  // Database
  mysql: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  },
  
  // Server
  port: parseInt(process.env.PORT) || 4100,
  
  // External APIs
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || null,
  
  // Environment
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};

// Don't log sensitive info in production
if (config.isDevelopment) {
  console.log("Environment loaded:");
  console.log("Host:", config.mysql.host);
  console.log("Port:", config.mysql.port);
  console.log("User:", config.mysql.user);
  console.log("Password:", config.mysql.password ? "****" : "not set");
  console.log("Database:", config.mysql.database);
  console.log("Google Maps API:", config.googleMapsApiKey ? "****" : "not set");
}

export default config;