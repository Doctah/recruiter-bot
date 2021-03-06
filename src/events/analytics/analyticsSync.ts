import { Point } from '@influxdata/influxdb-client';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import { AnalyticsEvent } from '@utils/Tracking/Analytics/structures/AnalyticsEvent';
import { EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({
	event: Events.AnalyticsSync
})
export default class extends AnalyticsEvent {
	// eslint-disable-next-line @typescript-eslint/require-await
	public async run(guilds: number, users: number) {
		this.writePoints([this.syncGuilds(guilds), this.syncUsers(users), this.syncVoiceConnections()]);

		return this.analytics.flush();
	}

	private syncGuilds(value: number) {
		return (
			new Point(AnalyticsSchema.Points.Guilds)
				.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
				// TODO: Adjust for traditional sharding
				.intField('value', value)
		);
	}

	private syncUsers(value: number) {
		return (
			new Point(AnalyticsSchema.Points.Users)
				.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
				// TODO: Adjust for traditional sharding
				.intField('value', value)
		);
	}

	private syncVoiceConnections() {
		return (
			new Point(AnalyticsSchema.Points.VoiceConnections)
				.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
				// TODO: Adjust for traditional sharding
				.intField('value', this.client.lavalink.players.size)
		);
	}
}
