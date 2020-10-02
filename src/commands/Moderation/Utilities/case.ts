import { BotCommand } from '@lib/structures/BotCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: 'Get the information from a case by its index.',
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<Case:integer|latest>'
		});
	}

	public async run(message: KlasaMessage, [index]: [number | 'latest']) {
		const modlog = index === 'latest' ? (await message.guild!.moderation.fetch()).last() : await message.guild!.moderation.fetch(index);
		if (modlog) return message.sendEmbed(await modlog.prepareEmbed());
		throw message.language.get('commandReasonNotExists');
	}
}
