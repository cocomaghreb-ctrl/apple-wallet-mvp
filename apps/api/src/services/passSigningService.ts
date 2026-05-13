import { logger } from '../utils/logger';
import { PASS_GENERATION_MODES } from '@apple-wallet/shared';

export interface PassSigningOptions {
  teamIdentifier: string;
  passTypeIdentifier: string;
  organizationName: string;
  serialNumber: string;
  description: string;
}

export interface PassSigningResult {
  pkpassData: Buffer;
  manifest: Record<string, string>;
}

/**
 * Interface for pass signing implementations.
 * Abstracts the actual signing process to support both development (stub) and production modes.
 */
export interface IPassSigningService {
  sign(passJson: any, options: PassSigningOptions): Promise<PassSigningResult>;
}

/**
 * Development stub implementation - generates unsigned pass for testing.
 * Used when PASS_GENERATION_MODE=development
 */
class DevelopmentPassSigningService implements IPassSigningService {
  async sign(passJson: any, _options: PassSigningOptions): Promise<PassSigningResult> {
    logger.info('🔓 [DEV MODE] Generating unsigned pass (not cryptographically signed)');

    // Create a simple manifest for the pass
    const manifest: Record<string, string> = {
      'pass.json': 'sha1hash',
    };

    // In development, return the pass JSON as-is (not actually signed)
    // Real implementation would sign this with Apple certificates
    const passBuffer = Buffer.from(JSON.stringify(passJson));

    return {
      pkpassData: passBuffer,
      manifest,
    };
  }
}

/**
 * Production implementation - requires real Apple certificates.
 * Used when PASS_GENERATION_MODE=production
 *
 * To implement this:
 * 1. Install node-pkpass or similar library
 * 2. Load your Apple certificate (certificate.p8)
 * 3. Sign the pass properly
 * 4. Return the signed .pkpass file
 */
class ProductionPassSigningService implements IPassSigningService {
  async sign(passJson: any, options: PassSigningOptions): Promise<PassSigningResult> {
    logger.error('❌ Production signing not yet implemented');
    logger.error('To implement:');
    logger.error('1. Obtain Apple certificate from Apple Developer Portal');
    logger.error('2. Install a signing library (e.g., node-pkpass)');
    logger.error('3. Implement proper certificate loading and signing');
    logger.error('4. Return the signed .pkpass file as Buffer');

    throw new Error(
      'Production pass signing not implemented. Set PASS_GENERATION_MODE=development to use stub mode.'
    );
  }
}

/**
 * Factory function to get the appropriate signing service based on environment
 */
export const createPassSigningService = (): IPassSigningService => {
  const mode = process.env.PASS_GENERATION_MODE || 'development';

  if (mode === PASS_GENERATION_MODES.PRODUCTION) {
    logger.info('🔐 Production pass signing service initialized');
    return new ProductionPassSigningService();
  }

  logger.info('🔓 Development pass signing service initialized (unsigned passes)');
  return new DevelopmentPassSigningService();
};
