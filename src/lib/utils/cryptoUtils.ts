import { useCallback } from 'react';

/**
 * Custom hook that provides data decryption functionality
 * @returns Object containing the decryptData function
 */

export const useCryptoUtils = () => {
  /**
   * Decrypts data that was encrypted with a symmetric XOR cipher
   * @param encryptedText - The encrypted text in format 'iv.encryptedData'
   * @returns The decrypted string or empty string if decryption fails
   */

  const decryptData = useCallback((encryptedText: string): string => {
    if (!process.env.NEXT_PUBLIC_SECRET_KEY) {
      console.warn('No secret key found in environment variables');
      return '';
    }
    const [ivBase64, encryptedBase64] = encryptedText.split('.');
    if (!ivBase64 || !encryptedBase64) {
      console.warn('Invalid encrypted text format');
      return '';
    }
    try {
      const encoder = new TextEncoder();
      const keyBytes = encoder.encode(process.env.NEXT_PUBLIC_SECRET_KEY).slice(0, 16);
      const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
      const decryptedBytes = encryptedBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
   
      return new TextDecoder().decode(decryptedBytes);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }, []);
  return { decryptData };
};
