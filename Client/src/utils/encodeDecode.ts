import CryptoJS from 'crypto-js';

// Get the secret key from environment variables with a fallback
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "fallback_secret_key";

export function encodeData(data: any): string {
  try {
    if (!data) throw new Error("Cannot encode empty data");
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error('Error encoding data:', error);
    throw error; // Re-throw to allow handling in calling code
  }
}

export function decodeData(encoded: string): any {
  try {
    if (!encoded) return null;
    
    const decrypted = CryptoJS.AES.decrypt(encoded, SECRET_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      console.warn('Decryption resulted in empty string');
      return null;
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decoding data:', error);
    return null; // Return null on decoding errors
  }
}