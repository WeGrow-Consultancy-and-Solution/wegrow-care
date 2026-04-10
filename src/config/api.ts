/**
 * Centralized API & App Configuration
 * This file handles switching between development and production URLs
 * based on environment variables.
 */

const isProd = import.meta.env.PROD;

// In Development, we default to localhost. 
// In Production, Vite will pull from process.env or the hosting provider's env config.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

// Helper for API endpoints to ensure consistent formatting
export const apiPath = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
