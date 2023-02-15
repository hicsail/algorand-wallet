declare module 'capacitor-storage' {
    export async function set(values: Record<string, string>): Promise<void>;
    export async function get(keys: Array<string> | string): Promise<Record<string, string> | string>;
}