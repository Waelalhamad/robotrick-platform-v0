/**
 * Environment Variable Validation Module
 *
 * This module validates that all required environment variables are present
 * and properly configured before the application starts.
 *
 * Best Practices:
 * - Fail fast: Exit immediately if critical config is missing
 * - Provide clear error messages for developers
 * - Validate format and security requirements
 * - Log successful validation for debugging
 */

const crypto = require('crypto');

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_ORIGIN'
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  PORT: '4889',
  NODE_ENV: 'development',
  JWT_EXPIRES_IN: '7d',
  COOKIE_DOMAIN: '',
  COOKIE_SECURE: 'false',
  COOKIE_SAMESITE: 'lax'
};

/**
 * Validates MongoDB URI format
 * @param {string} uri - MongoDB connection string
 * @returns {boolean} - True if valid
 */
function isValidMongoURI(uri) {
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

/**
 * Validates JWT secret strength
 * @param {string} secret - JWT secret key
 * @returns {Object} - { valid: boolean, message: string }
 */
function validateJWTSecret(secret) {
  if (!secret) {
    return { valid: false, message: 'JWT_SECRET is required' };
  }

  if (secret.length < 32) {
    return {
      valid: false,
      message: 'JWT_SECRET must be at least 32 characters for security'
    };
  }

  // Check for common weak secrets
  const weakSecrets = [
    'secret',
    'mysecret',
    'jwt_secret',
    'change_me',
    'replace_me',
    'robotrick',
    'robotrick_is_the_best'
  ];

  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    return {
      valid: false,
      message: 'JWT_SECRET appears to be a weak/default value. Use a cryptographically secure random string.'
    };
  }

  return { valid: true, message: 'JWT_SECRET is valid' };
}

/**
 * Generates a cryptographically secure JWT secret
 * @returns {string} - Random secret (64 characters)
 */
function generateSecureJWTSecret() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validates all environment variables
 * @throws {Error} - If validation fails
 */
function validateEnv() {
  console.log('🔍 Validating environment configuration...\n');

  const errors = [];
  const warnings = [];

  // Check for missing required variables
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    errors.push('Missing required environment variables:');
    missing.forEach(key => {
      errors.push(`  ❌ ${key}`);
    });
  }

  // Validate MONGO_URI format
  if (process.env.MONGO_URI && !isValidMongoURI(process.env.MONGO_URI)) {
    errors.push('  ❌ MONGO_URI has invalid format. Must start with mongodb:// or mongodb+srv://');
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET) {
    const jwtValidation = validateJWTSecret(process.env.JWT_SECRET);
    if (!jwtValidation.valid) {
      errors.push(`  ❌ ${jwtValidation.message}`);
      console.log('\n💡 Generate a secure secret with:');
      console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      console.log('\n   Or use the generated one below:');
      console.log(`   JWT_SECRET=${generateSecureJWTSecret()}\n`);
    }
  }

  // Check for development mode in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.CLIENT_ORIGIN === 'http://localhost:5173') {
      warnings.push('  ⚠️  CLIENT_ORIGIN is set to localhost in production mode');
    }
    if (process.env.COOKIE_SECURE !== 'true') {
      warnings.push('  ⚠️  COOKIE_SECURE should be "true" in production');
    }
  }

  // Set defaults for optional variables
  Object.entries(OPTIONAL_ENV_VARS).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`  ℹ️  ${key} not set, using default: "${defaultValue}"`);
    }
  });

  // Display errors
  if (errors.length > 0) {
    console.error('\n❌ Environment Validation Failed:\n');
    errors.forEach(err => console.error(err));
    console.error('\n💡 Create a .env file in the server directory with the required variables.');
    console.error('   See .env.example for reference.\n');
    process.exit(1);
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:\n');
    warnings.forEach(warn => console.warn(warn));
    console.warn('');
  }

  // Success message
  console.log('\n✅ Environment validation passed');
  console.log(`   Mode: ${process.env.NODE_ENV}`);
  console.log(`   Port: ${process.env.PORT}`);
  console.log(`   Client Origin: ${process.env.CLIENT_ORIGIN}`);
  console.log(`   MongoDB: ${maskMongoURI(process.env.MONGO_URI)}`);
  console.log('');
}

/**
 * Masks sensitive parts of MongoDB URI for logging
 * @param {string} uri - MongoDB connection string
 * @returns {string} - Masked URI
 */
function maskMongoURI(uri) {
  if (!uri) return 'Not configured';

  try {
    // Replace password with asterisks
    return uri.replace(/:([^@:]+)@/, ':****@');
  } catch (error) {
    return 'Connected (URI format invalid for masking)';
  }
}

module.exports = {
  validateEnv,
  generateSecureJWTSecret,
  validateJWTSecret,
  isValidMongoURI
};
