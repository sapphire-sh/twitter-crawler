import {
	Entity,
	PrimaryColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({
	'name': 'users',
})
export class UserEntity {
	@PrimaryColumn({
		'type': 'bigint',
	})
	// @ts-ignore
	public id: string;

	@Column({
		'default': '',
	})
	// @ts-ignore
	public alias: string;

	@Column({
		'default': '',
	})
	// @ts-ignore
	public name: string;

	@Column({
		'default': '',
	})
	// @ts-ignore
	public screen_name: string;

	@Column({
		'type': 'bigint',
		'default': '0',
	})
	// @ts-ignore
	public crawled_at: number;

	@CreateDateColumn()
	// @ts-ignore
	public created_at: Date;

	@UpdateDateColumn()
	// @ts-ignore
	public updated_at: Date;
}
