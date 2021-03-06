import { BotCommand } from '@lib/structures/BotCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { cast } from '@utils/util';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('commandMutesDescription'),
			extendedHelp: (language) => language.get('commandMutesExtended'),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	public run(message: KlasaMessage, [target]: [User?]) {
		const moderations = cast<Moderations | undefined>(this.store.get('moderations'));
		if (typeof moderations === 'undefined') throw new Error('Moderations command not loaded yet.');
		return moderations.run(message, ['mutes', target]);
	}
}

interface Moderations extends BotCommand {
	run(message: KlasaMessage, args: ['mutes' | 'warnings' | 'all', User | undefined]): Promise<KlasaMessage>;
}
