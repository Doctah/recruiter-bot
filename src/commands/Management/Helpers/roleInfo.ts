import { BotCommand } from '@lib/structures/BotCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { BrandingColors } from '@utils/constants';
import { cast } from '@utils/util';
import { MessageEmbed, Permissions, Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: (language) => language.get('commandRoleInfoDescription'),
			extendedHelp: (language) => language.get('commandRoleInfoExtended'),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '[role:rolename]'
		});
	}

	public run(message: KlasaMessage, [role = message.member!.roles.highest]: [Role?]) {
		const roleInfoTitles = cast<RoleInfoTitles>(message.language.get('commandRoleInfoTitles'));

		const permissions = role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
			? message.language.get('commandRoleInfoAll')
			: role.permissions.toArray().length > 0
			? role.permissions
					.toArray()
					.map((key) => `+ **${message.language.PERMISSIONS[key]}**`)
					.join('\n')
			: message.language.get('commandRoleInfoNoPermissions');

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(role.color || BrandingColors.Secondary)
				.setTitle(`${role.name} [${role.id}]`)
				.setDescription(
					message.language
						.get('commandRoleInfoData', {
							role,
							hoisted: message.language.get(role.hoist ? 'globalYes' : 'globalNo'),
							mentionable: message.language.get(role.mentionable ? 'globalYes' : 'globalNo')
						})
						.join('\n')
				)
				.addField(roleInfoTitles.PERMISSIONS, permissions)
		);
	}
}

interface RoleInfoTitles {
	PERMISSIONS: string;
}
