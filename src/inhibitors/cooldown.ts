import { BotCommand } from '@lib/structures/BotCommand';
import { Finalizer, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			spamProtection: true
		});
	}

	public run(message: KlasaMessage, command: BotCommand) {
		if (this.client.owners.has(message.author) || command.cooldown <= 0) return;

		let existing: Cooldown | undefined = undefined;

		try {
			const finalizer = this.client.finalizers.get('commandCooldown') as CommandCooldown;
			existing = finalizer.getCooldown(message, command);
		} catch (err) {
			return;
		}

		if (existing && existing.limited)
			throw message.language.get('inhibitorCooldown', { remaining: message.language.duration(existing.remainingTime) });
	}
}

interface CommandCooldown extends Finalizer {
	getCooldown(message: KlasaMessage, command: BotCommand): Cooldown;
}

interface Cooldown {
	limited: boolean;
	remainingTime: number;
}
