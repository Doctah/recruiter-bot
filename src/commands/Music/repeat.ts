import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireMusicPlaying, requireSameVoiceChannel, requireBotInVoiceChannel, requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['replay'],
	description: (language) => language.get('commandRepeatDescription')
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireBotInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public run(message: KlasaMessage) {
		// Toggle the repeat option with its opposite value
		message.guild!.music.setReplay(!message.guild!.music.replay, this.getContext(message));
	}
}
