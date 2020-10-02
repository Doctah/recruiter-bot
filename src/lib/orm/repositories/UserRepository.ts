/* eslint-disable @typescript-eslint/explicit-member-accessibility, @typescript-eslint/unified-signatures */
import Ccollection from '@discordjs/collection';
import { AsyncQueue } from '@klasa/async-queue';
import { TimerManager } from '@klasa/timer-manager';
import { UserEntity } from '@orm/entities/UserEntity';
import { EntityRepository, FindOneOptions, Repository } from 'typeorm';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
	public async ensure(id: string, options?: FindOneOptions<UserEntity>) {
		const previous = await this.findOne(id, options);
		if (previous) return previous;

		const data = new UserEntity();
		data.id = id;
		return data;
	}

	public async lock<T>(targets: readonly string[], cb: (...targets: readonly string[]) => Promise<T>): Promise<T> {
		if (targets.length !== new Set(targets).size) {
			throw new Error(`Duplicated targets detected: '${targets.join("', '")}'`);
		}

		const queues = targets.map((target) => {
			const existing = UserRepository.queues.get(target);
			if (existing) return existing;

			const created = new AsyncQueue();
			UserRepository.queues.set(target, created);
			return created;
		});

		await Promise.all(queues.map((queue) => queue.wait()));

		try {
			return await cb(...targets);
		} finally {
			for (const queue of queues) queue.shift();
		}
	}

	private static queues = new Ccollection<string, AsyncQueue>();
}

TimerManager.setInterval(() => {
	UserRepository['queues'].sweep((value) => value.remaining === 0);
}, 60000);
