export function convertToBase64(data: string): string {
	return Buffer.from(data).toString('base64');
}

export function convertFromBase64(data: string): string {
	return Buffer.from(data, 'base64').toString();
}
