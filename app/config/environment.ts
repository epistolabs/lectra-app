/**
 * Environment configuration for API endpoints
 * Automatically selects the appropriate environment based on __DEV__ flag
 */

interface Environment {
  apiUrl: string;
}

const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000/api',
  } as Environment,
  prod: {
    apiUrl: 'https://your-production-backend.com/api', // Update with your production URL
  } as Environment,
};

// Use dev environment in development mode, prod in production
const currentEnv = __DEV__ ? ENV.dev : ENV.prod;

console.log('Environment:', __DEV__ ? 'development' : 'production');
console.log('API URL:', currentEnv.apiUrl);

export default currentEnv;
