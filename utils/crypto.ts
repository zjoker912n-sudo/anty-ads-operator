import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret';

export class CryptoUtils {
  static encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  }

  static decrypt(cipherText: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
