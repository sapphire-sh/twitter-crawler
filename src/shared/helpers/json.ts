import {
	promises as fsPromises,
} from 'fs';

export async function readJSON<T = any>(path: string): Promise<T> {
	const data = await fsPromises.readFile(path);
	return JSON.parse(data.toString()) as T;
}
