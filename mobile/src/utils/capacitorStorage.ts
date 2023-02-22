import { Preferences } from '@capacitor/preferences';

/*
inputs:
values (Record<string, string>) Key-value pairs to set in Capacitor Storage
*/
export async function set(values: Record<string, any>): Promise<void> {
    function stringify(data: string): string {
        return (typeof data === 'string') ? data : JSON.stringify(data)
    }

    for(const key in values) {
        Preferences.set({
            key: stringify(key),
            value: stringify(values[key])
        });
    }
} 

/*
Should not expect all values to be returned even if return is defined. Optimistically gets all values.

inputs:
keys (Array<string> | string) Keys to get from Capacitor Storage

outputs:
results (Promise<Record<string, string> | string>) Either a single value or Record of keys and values
*/
export async function get(keys: Array<string> | string): Promise<Record<string, string>> {
    if(keys instanceof Array) {
        const results: Record<string, string> = {}

        for(let i = 0; i < keys.length; i++) {
            const { value } = (await Preferences.get({key: keys[i]}))

            // optimistically gets all values
            if(value) {
                results[keys[i]] = value
            }
        }

        return results
    }
    else {
        const { value } = await Preferences.get({key: keys})
        return value ? JSON.parse(value) : {}
    }
}


/*
inputs:
keys (Array<string> | string) Array of keys or single string key to remove
*/
export async function remove(keys: Array<string> | string): Promise<void> {
    if(keys instanceof Array) {
        for(let i=0; i < keys.length; i++) {
            Preferences.remove({ key: keys[i] })
        }
    }
    else {
        Preferences.remove({ key: keys})
    }
}


/*
Clear Capacitor Storage
 */
export async function clear(): Promise<void> {
    Preferences.clear()
}