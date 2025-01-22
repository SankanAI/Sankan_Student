import CryptoJS from 'crypto-js';


class SecureStorage {
  private readonly SECRET_KEY: string;

  constructor(secretKey: string) {
    // Use a strong secret key - could be from environment variables
    this.SECRET_KEY = secretKey;
  }

  reload(persistData: boolean = true): void {
    try {
      if (!persistData) {
        // Clear storage before reload if persistence is not needed
        this.clear();
      }
      
      // Use different reload methods based on the environment
      if (typeof window !== 'undefined') {
        // For client-side reloads
        window.location.reload();
      } else if (typeof location !== 'undefined') {
        // Fallback reload method
        location.reload();
      }
    } catch (error) {
      console.error('Error during reload:', error);
      // Fallback to force reload if other methods fail
      if (typeof window !== 'undefined') {
        window.location.href = window.location.href;
      }
    }
  }


  // Encrypt data before storing
  setItem(key: string, data: any): void {
    try {
      // Convert data to string if it's an object
      const stringData = JSON.stringify(data);
      
      // Encrypt the data
      const encryptedData = CryptoJS.AES.encrypt(stringData, this.SECRET_KEY).toString();
      
      // Add a checksum
      const checksum = CryptoJS.SHA256(stringData).toString();
      
      // Store both encrypted data and checksum
      const secureData = JSON.stringify({
        data: encryptedData,
        checksum,
        timestamp: new Date().getTime()
      });
      
      localStorage.setItem(key, secureData);
    } catch (error) {
      console.error('Error storing data:', error);
      throw new Error('Failed to store data securely');
    }
  }

  // Decrypt and validate data when retrieving
  getItem<T>(key: string): T | null {
    try {
      const secureData = localStorage.getItem(key);
      
      if (!secureData) return null;
      
      // Parse the secure data container
      const { data: encryptedData, checksum, timestamp } = JSON.parse(secureData);
      
      // Decrypt the data
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      // Verify checksum
      const currentChecksum = CryptoJS.SHA256(decryptedString).toString();
      if (currentChecksum !== checksum) {
        console.error('Data tampering detected');
        this.removeItem(key);
        this.reload();
        return null;
      }
      
      return JSON.parse(decryptedString) as T;
    } catch (error) {
      console.log('Error retrieving data:', error);
      this.removeItem(key);
      this.reload();
      return null;
    }
  }

  // Remove item
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all items
  clear(): void {
    localStorage.clear();
  }
}

export default SecureStorage;