import { DbSet } from '@lib/structures/DbSet';
import { BotCommand, BotCommandOptions } from '@lib/structures/BotCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<BotCommandOptions>({
	aliases: ['togglemdm', 'togglemoddm', 'tmdm'],
	cooldown: 10,
	description: (language) => language.get('commandToggleModerationDmDescription'),
	extendedHelp: (language) => language.get('commandToggleModerationDmExtended')
})
export default class extends BotCommand {
	public async run(message: KlasaMessage) {
		const { users } = await DbSet.connect();
		const updated = await users.lock([message.author.id], async (id) => {
			const user = await users.ensure(id);

			user.moderationDM = !user.moderationDM;
			return user.save();
		});

		return message.sendLocale(updated.moderationDM ? 'commandToggleModerationDmToggledEnabled' : 'commandToggleModerationDmToggledDisabled');
	}
}
