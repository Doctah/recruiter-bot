import { connect } from '@orm/dbConfig';
import { GuildEntity } from '@orm/entities/GuildEntity';
import { ModerationEntity } from '@orm/entities/ModerationEntity';
import { ScheduleEntity } from '@orm/entities/ScheduleEntity';
import { StarboardEntity } from '@orm/entities/StarboardEntity';
import { UserCooldownEntity } from '@orm/entities/UserCooldownEntity';
import { ClientRepository } from '@orm/repositories/ClientRepository';
import { MemberRepository } from '@orm/repositories/MemberRepository';
import { UserRepository } from '@orm/repositories/UserRepository';
import type { ColorResolvable, Message } from 'discord.js';
import type { Connection, FindConditions, FindManyOptions } from 'typeorm';

export class DbSet {
	public connection: Connection;
	private constructor(connection: Connection) {
		this.connection = connection;
	}

	public get clients() {
		return this.connection.getCustomRepository(ClientRepository);
	}

	public get guilds() {
		return this.connection.getRepository(GuildEntity);
	}

	public get members() {
		return this.connection.getCustomRepository(MemberRepository);
	}

	public get moderations() {
		return this.connection.getRepository(ModerationEntity);
	}

	public get schedules() {
		return this.connection.getRepository(ScheduleEntity);
	}

	public get starboards() {
		return this.connection.getRepository(StarboardEntity);
	}

	public get users() {
		return this.connection.getCustomRepository(UserRepository);
	}

	public get userCooldowns() {
		return this.connection.getRepository(UserCooldownEntity);
	}

	public static async connect() {
		return new DbSet(await connect());
	}

	public static async fetchModerationDirectMessageEnabled(id: string) {
		const { users } = await DbSet.connect();
		const entry = await users.findOne(id);
		return entry?.moderationDM ?? true;
	}

	/**
	 * Finds entities that match given options.
	 */
	public static fetchModerationEntry(options?: FindManyOptions<ModerationEntity>): Promise<ModerationEntity>;

	/**
	 * Finds entities that match given conditions.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public static fetchModerationEntry(conditions?: FindConditions<ModerationEntity>): Promise<ModerationEntity>;
	public static async fetchModerationEntry(optionsOrConditions?: FindConditions<ModerationEntity> | FindManyOptions<ModerationEntity>) {
		const { moderations } = await DbSet.connect();
		return moderations.findOne(optionsOrConditions as any);
	}

	/**
	 * Finds entities that match given options.
	 */
	public static fetchModerationEntries(options?: FindManyOptions<ModerationEntity>): Promise<ModerationEntity[]>;

	/**
	 * Finds entities that match given conditions.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public static fetchModerationEntries(conditions?: FindConditions<ModerationEntity>): Promise<ModerationEntity[]>;
	public static async fetchModerationEntries(optionsOrConditions?: FindConditions<ModerationEntity> | FindManyOptions<ModerationEntity>) {
		const { moderations } = await DbSet.connect();
		return moderations.find(optionsOrConditions as any);
	}

	public static fetchColor(message: Message) {
		return message.member?.displayColor as ColorResolvable;
	}
}
