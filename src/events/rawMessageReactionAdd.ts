import Collection from '@discordjs/collection';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { LLRCData } from '@utils/LongLivingReactionCollector';
import { api } from '@utils/Models/Api';
import { floatPromise, isTextBasedChannel, resolveEmoji, twemoji } from '@utils/util';
import { APIUser, GatewayMessageReactionAddDispatch } from 'discord-api-types/v6';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { Event, EventStore } from 'klasa';
// import messageDelete from './messageDelete';

export default class extends Event {
	private readonly kCountCache = new Collection<string, InternalCacheEntry>();
	private readonly kSyncCache = new Collection<string, Promise<InternalCacheEntry>>();
	private kTimerSweeper: NodeJS.Timer | null = null;

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.MessageReactionAdd, emitter: store.client.ws });
	}

	public run(raw: GatewayMessageReactionAddDispatch['d']) {
		const channel = this.client.channels.cache.get(raw.channel_id) as TextChannel | undefined;
		if (!channel || !isTextBasedChannel(channel) || !channel.readable) return;

		const data: LLRCData = {
			channel,
			emoji: {
				animated: raw.emoji.animated ?? false,
				id: raw.emoji.id,
				managed: 'managed' in raw.emoji ? raw.emoji.managed! : null,
				name: raw.emoji.name,
				requireColons: 'require_colons' in raw.emoji ? raw.emoji.require_colons! : null,
				roles: raw.emoji.roles || null,
				user: (raw.emoji.user && this.client.users.add(raw.emoji.user)) || { id: raw.user_id }
			},
			guild: channel.guild,
			messageID: raw.message_id,
			userID: raw.user_id
		};

		for (const llrc of this.client.llrCollectors) {
			llrc.send(data);
		}

		this.client.emit(Events.RoleReactionAdd, data);

		const emoji = resolveEmoji(data.emoji);
		if (emoji === null) return;

		floatPromise(this, this.handleReactionLogs(data, emoji));
		floatPromise(this, this.handleStarboard(data, emoji));
		floatPromise(this, this.handleRecruitment(data, emoji));
	}

	private async handleReactionLogs(data: LLRCData, emoji: string) {
		if (data.guild.settings.get(GuildSettings.Selfmod.Reactions.WhiteList).includes(emoji)) return;

		this.client.emit(Events.ReactionBlacklist, data, emoji);
		if (
			!data.guild.settings.get(GuildSettings.Channels.ReactionLogs) ||
			(!data.guild.settings.get(GuildSettings.Events.Twemoji) && data.emoji.id === null)
		)
			return;

		const ignoreChannels = data.guild.settings.get(GuildSettings.Messages.IgnoreChannels);
		const ignoreReactionAdd = data
			.guild!.settings.get(GuildSettings.Channels.Ignore.ReactionAdd)
			.some((id) => data.channel.id === id || (data.channel as TextChannel).parent?.id === id);
		const ignoreAllEvents = data
			.guild!.settings.get(GuildSettings.Channels.Ignore.All)
			.some((id) => data.channel.id === id || (data.channel as TextChannel).parent?.id === id);
		if (ignoreChannels.includes(data.channel.id) || ignoreReactionAdd || ignoreAllEvents) return;

		if ((await this.retrieveCount(data, emoji)) > 1) return;

		const user = await this.client.users.fetch(data.userID);
		if (user.bot) return;

		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Reaction, data.guild, () =>
			new MessageEmbed()
				.setColor(Colors.Green)
				.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setThumbnail(
					data.emoji.id === null
						? `https://twemoji.maxcdn.com/72x72/${twemoji(data.emoji.name!)}.png`
						: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}?size=64`
				)
				.setDescription(
					[
						`**Emoji**: ${data.emoji.name}${data.emoji.id === null ? '' : ` [${data.emoji.id}]`}`,
						`**Channel**: ${data.channel}`,
						`**Message**: [${data.guild.language.get('jumpTo')}](https://discord.com/channels/${data.guild.id}/${data.channel.id}/${
							data.messageID
						})`
					].join('\n')
				)
				.setFooter(`${data.guild.language.get('eventsReaction')} • ${data.channel.name}`)
				.setTimestamp()
		);
	}

	private async handleRecruitment(data: LLRCData, emoji: string) {
		if (
			data.channel.id !== data.guild.settings.get(GuildSettings.Recruitment.Channel) ||
			emoji !== data.guild.settings.get(GuildSettings.Recruitment.Emoji) ||
			data.guild.settings.get(GuildSettings.Recruitment.Enabled)
		)
			return;

		try {
			const member = await data.guild.members.fetch(data.userID);
			const botMember = await data.guild.members.fetch(this.client.user!.id);
			const channelName = member.user.username.toLowerCase() + member.user.discriminator;

			if (data.guild.channels.cache.find((channel) => channel.name === channelName)) {
				return member.send(`It appears we already have an active application for you!`);
			}

			const officerRoleSetting = data.guild.settings.get(GuildSettings.Recruitment.OfficerRole);
			const officerRole = data.guild.roles.cache.get(officerRoleSetting) as Role;

			const viewerRoleSetting = data.guild.settings.get(GuildSettings.Recruitment.ViewerRole);
			const viewerRole = data.guild.roles.cache.get(viewerRoleSetting) as Role;

			if (!officerRole) {
				data.guild.owner?.send('[RECRUITMENT]: The officer role has not been configured.');
				return this.client.emit(Events.Error, 'Missing officer role! Notified server owner.');
			}

			const parentChannel = data.guild.channels.cache.find((channel) => channel.name === 'Recruitment');

			if (!parentChannel) {
				data.guild.owner?.send('[RECRUITMENT]: You need to create a channel category named `Recruitment` so I can place the channels.');
				return this.client.emit(Events.Error, 'There is no "Recruitment" category! Notified server owner.');
			}

			const officerChannelSetting = data.guild.settings.get(GuildSettings.Recruitment.OfficerChannel);
			const officerChannel = data.guild.channels.cache.get(officerChannelSetting) as TextChannel;

			if (!officerChannel || !officerChannel.permissionsFor(botMember)?.has('SEND_MESSAGES')) {
				data.guild.owner?.send('[RECRUITMENT]: No officer channel is configured or I am unable to post in the officer channel.');
				return this.client.emit(Events.Error, 'Missing officer channel! Notified owner.');
			}

			if (!botMember.permissions.has(['SEND_MESSAGES', 'MANAGE_CHANNELS'])) {
				data.guild.owner?.send('[RECRUITMENT]: I need permissions to send messages and create/manage channels.');
			}
			data.guild.channels
				.create(`${member?.user.tag}`, {
					type: 'text',
					parent: parentChannel
				})
				.then((userChannel) => {
					return userChannel.overwritePermissions([
						{ id: member, allow: ['VIEW_CHANNEL'] },
						{ id: this.client.user!.id, allow: ['VIEW_CHANNEL'] },
						{ id: data.guild.roles.everyone, deny: ['VIEW_CHANNEL'] },
						{ id: officerRole?.id as string, allow: ['VIEW_CHANNEL'] },
						{ id: viewerRole?.id, allow: ['VIEW_CHANNEL'], deny: ['SEND_MESSAGES'] }
					]);
				})
				.then(async (userChannel) => {
					const filter = (m: any) => m.author.id === member.user.id;

					// this is for later
					let questions = [
						`${member} Thank you for beginning this application! Go ahead and let us know what you'd like for us to call you during raid`,
						'What class/spec do you plan to mostly raid on?',
						'Please provide a link to your Warcraft Logs page',
						'Tell us a little bit about your raiding experience in the current expansion, as well as in past expansions',
						'Please provide a screenshot of your UI in combat.',
						'Do you currently or plan on maintaining alts?',
						'If we are preparing to progress on a difficult boss, such as the last in a tier, what would be your method of preparing yourself for this boss? What specific mechanics would you study for your class specifically, and how much time would this take you?',
					    'In a competitive raid environment, we try to keep a roster of 23 people. This means 3 people will likely be sat at any given point during mythic progression. Are you comfortable with being sat for reasons such as performance or not needing loot?',
						'We will currently be raiding on Tuesday and Wednesday from 9:00pm to 12:00am EST. Will you be able to make these times consistently, barring unforeseen circumstances?',
						'What are your goals for Shadowlands?',
						'Tell us a little bit about yourself outside the game',
						'Do you have any references from past guilds, M+, or our guild? If yes, please provide their Discord or Battletag'
					];

					for (let question of questions) {
						await userChannel.send(question);
						await userChannel.awaitMessages(filter, { max: 1 });
					}

					await userChannel.send('Thanks for applying! Please wait for an officer to come by and speak with you.');
					await officerChannel.send(`${officerRole} ${viewerRole}, there is an applicant waiting in ${userChannel}!`, {
						allowedMentions: { users: [], roles: [officerRole.id, viewerRole.id] }
					});
				});
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}

	private async handleStarboard(data: LLRCData, emoji: string) {
		if (
			data.channel.nsfw ||
			data.channel.id === data.guild.settings.get(GuildSettings.Starboard.Channel) ||
			emoji !== data.guild.settings.get(GuildSettings.Starboard.Emoji)
		)
			return;

		try {
			const channel = data.guild.settings.get(GuildSettings.Starboard.Channel);
			const ignoreChannels = data.guild.settings.get(GuildSettings.Starboard.IgnoreChannels);
			if (!channel || ignoreChannels.includes(data.channel.id)) return;

			const starboardChannel = data.guild.channels.cache.get(channel) as TextChannel | undefined;
			if (typeof starboardChannel === 'undefined' || !starboardChannel.postable) {
				await data.guild.settings.reset(GuildSettings.Starboard.Channel);
				return;
			}

			// Process the starboard
			const { starboard } = data.guild;
			const sMessage = await starboard.fetch(data.channel, data.messageID);
			if (sMessage) await sMessage.increment(data.userID, data.guild.settings.get(GuildSettings.Starboard.SelfStar));
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}

	private async retrieveCount(data: LLRCData, emoji: string) {
		const id = `${data.messageID}.${emoji}`;

		// Pull from sync queue, and if it exists, await
		const sync = this.kSyncCache.get(id);
		if (typeof sync !== 'undefined') await sync;

		// Retrieve the reaction count
		const previousCount = this.kCountCache.get(id);
		if (typeof previousCount !== 'undefined') {
			previousCount.count++;
			previousCount.sweepAt = Date.now() + 120000;
			return previousCount.count;
		}

		// Pull the reactions from the API
		const promise = this.fetchCount(data, emoji, id);
		this.kSyncCache.set(id, promise);
		return (await promise).count;
	}

	private async fetchCount(data: LLRCData, emoji: string, id: string) {
		const users = (await api(this.client).channels(data.channel.id).messages(data.messageID).reactions(emoji).get()) as APIUser[];
		const count: InternalCacheEntry = { count: users.length, sweepAt: Date.now() + 120000 };
		this.kCountCache.set(id, count);
		this.kSyncCache.delete(id);

		if (this.kTimerSweeper === null) {
			this.kTimerSweeper = this.client.setInterval(() => {
				const now = Date.now();
				this.kCountCache.sweep((entry) => entry.sweepAt < now);
				if (this.kTimerSweeper !== null && this.kCountCache.size === 0) {
					this.client.clearInterval(this.kTimerSweeper);
					this.kTimerSweeper = null;
				}
			}, 5000);
		}

		return count;
	}
}

interface InternalCacheEntry {
	sweepAt: number;
	count: number;
}
