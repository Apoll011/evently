import { randomInt } from "crypto";

const ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const ticketCodeSize = 8;

export function generateCode() {
    let code = '';

    for (let i = 0; i < ticketCodeSize; i++) {
        code += ALPHABET[randomInt(ALPHABET.length)];
    }

    return code;
}
