import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireMusicPaused, requireSameVoiceChannel, requireBotInVoiceChannel, requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get('commandResumeDescription')
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireBotInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPaused()
	public async run(message: KlasaMessage) {
		await message.guild!.music.resume(this.getContext(message));
	}
}
