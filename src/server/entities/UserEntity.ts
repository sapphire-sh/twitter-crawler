import {
	Entity,
	PrimaryColumn,
	Column,
} from 'typeorm';

@Entity({
	'name': 'users',
})
export class UserEntity {
	@PrimaryColumn({
		'type': 'bigint',
	})
	public id: string;

	@Column()
	public alias: string;

	@Column()
	public name: string;

	@Column()
	public screen_name: string;

	@Column()
	public crawled_at: number;

	constructor(id: string) {
		this.id = id;
		this.alias = '';
		this.name = '';
		this.screen_name = '';
		this.crawled_at = 0;
	}
}
