import SecureStorage from '@/lib/secureStorage';

const secretKey = process.env.NEXT_PUBLIC_STORAGE_KEY || 'your-default-secret-key';
export const secureStorage = new SecureStorage(secretKey);