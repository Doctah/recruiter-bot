/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { BotClient } from '@lib/BotClient';
import { Events } from '@lib/types/Enums';
import { kBigIntTransformer } from '@utils/util';
import { container } from 'tsyringe';
import {
	AfterInsert,
	AfterLoad,
	AfterRemove,
	AfterUpdate,
	BaseEntity,
	Check,
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToOne,
	PrimaryColumn
} from 'typeorm';
import { UserCooldownEntity } from './UserCooldownEntity';

@Check(/* sql */ `money >= 0`)
@Check(/* sql */ `points >= 0`)
@Check(/* sql */ `reputations >= 0`)
@Entity('user', { schema: 'public' })
export class UserEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19 })
	public id!: string;

	@Column('integer', { default: 0 })
	public points = 0;

	@Column('integer', { default: 0 })
	public reputations = 0;

	@Column('boolean', { default: true })
	public moderationDM = true;

	@Column('bigint', { default: 0, transformer: kBigIntTransformer })
	public money = 0;

	@OneToOne(() => UserCooldownEntity, (cooldown) => cooldown.user, { cascade: true })
	public cooldowns?: UserCooldownEntity;

	@ManyToMany(() => UserEntity, { cascade: true })
	@JoinTable()
	public spouses?: UserEntity[];

	#money: number | null;

	public constructor() {
		super();
		this.#money = null;
	}

	public get level() {
		return Math.floor(0.2 * Math.sqrt(this.points));
	}

	private get client() {
		return container.resolve(BotClient);
	}

	@AfterLoad()
	protected entityLoad() {
		this.#money = this.money;
	}

	@AfterInsert()
	@AfterUpdate()
	protected entityUpdate() {
		if (this.#money !== null && this.money !== this.#money) {
			this.client.emit(Events.MoneyTransaction, this, this.money - this.#money, this.#money);
			this.#money = this.money;
		}
	}

	@AfterRemove()
	protected entityRemove() {
		this.#money = null;
	}
}
