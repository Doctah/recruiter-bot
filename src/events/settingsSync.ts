import { BotGuild } from '@lib/extensions/BotGuild';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Event, Settings } from 'klasa';

export default class extends Event {
	public async run(settings: Settings) {
		// If the synchronized settings isn't from the guilds gateway, return early.
		if (settings.gateway.name !== 'guilds') return;

		const guild = settings.target as BotGuild;
		this.updateFilter(guild, settings);
		await this.updatePermissionNodes(guild);
	}

	private updateFilter(guild: BotGuild, settings: Settings) {
		const blockedWords = settings.get(GuildSettings.Selfmod.Filter.Raw);

		if (blockedWords.length) guild.security.updateRegExp(blockedWords);
		else guild.security.regexp = null;
	}

	private updatePermissionNodes(guild: BotGuild) {
		return guild.permissionsManager.update();
	}
}
