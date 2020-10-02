import { BotCommand, BotCommandOptions } from '@lib/structures/BotCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<BotCommandOptions>({
	cooldown: 10,
	description: (language) => language.get('commandInviteDescription'),
	extendedHelp: (language) => language.get('commandInviteExtended'),
	usage: '[noperms]',
	flagSupport: true,
	guarded: true,
	requiredPermissions: ['EMBED_LINKS']
})
export default class extends BotCommand {
	public async run(message: KlasaMessage, [noperms]: ['noperms' | undefined]) {
		if (noperms === 'noperms' || Reflect.has(message.flagArgs, 'nopermissions')) {
			// return message.sendEmbed(this.getEmbed(message, { permissions: false }));
		}
		return message.sendEmbed(this.getEmbed(message, { permissions: true }));
	}

	public async init() {
		if (this.client.application && !this.client.application.botPublic) this.permissionLevel = PermissionLevels.BotOwner;
	}

	private getEmbed(message: KlasaMessage, { permissions }: { permissions: boolean }): MessageEmbed {
		return new MessageEmbed() //
			.setColor(BrandingColors.Primary)
			.setDescription(
				[
					`[${message.language.get('commandInvitePermissionInviteText')}](${this.client.invite})`,
					permissions ? message.language.get('commandInvitePermissionsDescription') : undefined
				]
					.filter(Boolean)
					.join('\n')
			);
	}
}
