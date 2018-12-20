import {
	sheets_v4,
} from 'googleapis';

export interface Coordinates {
	x: string;
	y: number;
}

export type Cell = {
	value: string;
} & Coordinates;

export class Sheet<T> {
	private readonly sheet: Cell[][];
	public readonly data: Array<T & Coordinates>;

	constructor(schema: sheets_v4.Schema$ValueRange, data: sheets_v4.Schema$ValueRange) {
		const schemaValues = schema.values;

		const {
			range,
			values,
		} = data;

		if(schemaValues === undefined || schemaValues.length !== 1) {
			throw new Error('invalid schema');
		}
		if(range === undefined || values === undefined) {
			this.sheet = [
				[],
			];
			this.data = [];
			return;
		}

		const [
			keys,
		] = schemaValues;

		const match = range.match(/\!(\w+)(\d+)\:/)!;
		const x = match[1];
		const y = parseInt(match[2], 10);

		this.sheet = values.map((value, i) => {
			return value.map((cell, j): Cell => {
				return {
					'x': this.getCellX(x, j),
					'y': this.getCellY(y, i),
					'value': cell,
				};
			});
		});
		this.data = this.sheet.map((row) => {
			return {
				...row.reduce((a, b, i) => {
					return {
						...a,
						[keys[i]]: b.value,
					};
				}, {} as any),
				'x': row[0].x,
				'y': row[0].y,
			};
		});
	}

	private getCellX(x: string, i: number): string {
		const a = 'A'.charCodeAt(0);
		let b = x.charCodeAt(0) - a + i;
		let c = '';
		do {
			c += String.fromCharCode(b % 26 + a);
			b = Math.floor(b / 26);
		}
		while(b > 0);

		return c;
	}

	private getCellY(y: number, j: number): number {
		return y + j;
	}

	public find(comparer: (t: T) => boolean): T | null {
		let data: T | null = null;

		this.data.some((e) => {
			if(comparer(e)) {
				data = e;
				return true;
			}
			return false;
		});

		return data;
	}
}
