/**
 * Utilitários de Criptografia para dados sensíveis
 * Implementa criptografia AES-256-GCM para proteger dados no banco de dados
 */

import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor() {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) {
      throw new Error('ENCRYPTION_KEY não configurada nas variáveis de ambiente');
    }
    
    // Garantir que a chave tem 32 bytes (256 bits)
    this.key = Buffer.from(keyHex, 'hex');
    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY deve ter exatamente 32 bytes (64 caracteres hex)');
    }
  }
  
  /**
   * Criptografa um texto
   */
  encrypt(text: string): { encrypted: string; iv: string; authTag: string } {
    try {
      // Gerar IV (Initialization Vector) aleatório
      const iv = crypto.randomBytes(16);
      
      // Criar cipher
      const cipher = crypto.createCipher(this.algorithm, this.key);
      
      // Criptografar o texto
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Obter tag de autenticação
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Erro ao criptografar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Descriptografa um texto
   */
  decrypt(encryptedData: { encrypted: string; iv: string; authTag: string }): string {
    try {
      const { encrypted, iv, authTag } = encryptedData;
      
      // Converter strings hex para buffers
      const ivBuffer = Buffer.from(iv, 'hex');
      const authTagBuffer = Buffer.from(authTag, 'hex');
      
      // Criar decipher
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      
      // Definir tag de autenticação
      decipher.setAuthTag(authTagBuffer);
      
      // Descriptografar
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Erro ao descriptografar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Criptografa um objeto JavaScript
   */
  encryptObject(obj: any): { encrypted: string; iv: string; authTag: string } {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      throw new Error(`Erro ao criptografar objeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Descriptografa um objeto JavaScript
   */
  decryptObject(encryptedData: { encrypted: string; iv: string; authTag: string }): any {
    try {
      const decryptedString = this.decrypt(encryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      throw new Error(`Erro ao descriptografar objeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Hash de senha seguro
   */
  async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(32).toString('hex');
      const iterations = 100000; // 100k iterações
      const keylen = 64; // 512 bits
      const digest = 'sha512';
      
      crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
        if (err) {
          reject(new Error(`Erro ao gerar hash da senha: ${err.message}`));
          return;
        }
        
        // Retornar salt + hash para validação futura
        const hash = derivedKey.toString('hex');
        resolve(`${salt}:${hash}`);
      });
    });
  }
  
  /**
   * Verifica uma senha contra um hash
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const [salt, hash] = storedHash.split(':');
        
        if (!salt || !hash) {
          reject(new Error('Formato de hash inválido'));
          return;
        }
        
        const iterations = 100000;
        const keylen = 64;
        const digest = 'sha512';
        
        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
          if (err) {
            reject(new Error(`Erro ao verificar senha: ${err.message}`));
            return;
          }
          
          const providedHash = derivedKey.toString('hex');
          resolve(providedHash === hash);
        });
      } catch (error) {
        reject(new Error(`Erro ao verificar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
      }
    });
  }
  
  /**
   * Gera um token seguro para recuperação de senha
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  /**
   * Cria um hash SHA-256 de um texto
   */
  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
  
  /**
   * Cria um HMAC para verificação de integridade
   */
  hmac(data: string, secret?: string): string {
    const key = secret || process.env.JWT_SECRET || 'fallback-secret';
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }
}

// Singleton instance
let instance: EncryptionService | null = null;

export const getEncryptionService = (): EncryptionService => {
  if (!instance) {
    instance = new EncryptionService();
  }
  return instance;
};

// Funções utilitárias exportadas
export const encrypt = (text: string) => getEncryptionService().encrypt(text);
export const decrypt = (encryptedData: { encrypted: string; iv: string; authTag: string }) => 
  getEncryptionService().decrypt(encryptedData);
export const encryptObject = (obj: any) => getEncryptionService().encryptObject(obj);
export const decryptObject = (encryptedData: { encrypted: string; iv: string; authTag: string }) => 
  getEncryptionService().decryptObject(encryptedData);
export const hashPassword = (password: string) => getEncryptionService().hashPassword(password);
export const verifyPassword = (password: string, storedHash: string) => 
  getEncryptionService().verifyPassword(password, storedHash);
export const generateSecureToken = (length?: number) => getEncryptionService().generateSecureToken(length);
export const hash = (text: string) => getEncryptionService().hash(text);
export const hmac = (data: string, secret?: string) => getEncryptionService().hmac(data, secret);

export default EncryptionService;