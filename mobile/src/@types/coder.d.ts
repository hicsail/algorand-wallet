import BigNumber from 'bignumber.js'

declare module 'coder' {
    export function padBinary(bin): string;
    export function BigIntToBinary(bigint): string;
    export function str2bin(string): string;
    export function bin2str(bin): string;
    export function splitBinary(binary): string;
    export function convertToUTF8(substrings): string;
    export function encode(str): BigNumber;
    export function decode(int): string;
}