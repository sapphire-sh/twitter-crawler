import {
	Entity,
	PrimaryColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({
	'name': 'tweets',
})
export class TweetEntity {
	@PrimaryColumn({
		'type': 'bigint',
	})
	// @ts-ignore
	public id: string;

	@Column()
	// @ts-ignore
	public user_id: string;

	@Column({
		'type': 'text',
	})
	// @ts-ignore
	public data: string;

	@CreateDateColumn()
	// @ts-ignore
	public created_at: Date;

	@UpdateDateColumn()
	// @ts-ignore
	public updated_at: Date;
}
