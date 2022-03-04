import crypto from 'crypto';

const randomCharacters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateRandomString(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += randomCharacters[crypto.randomInt(0, randomCharacters.length - 1)];
  }
  return out;
}
