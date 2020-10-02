import { BotCommand } from '@lib/structures/BotCommand';
import { Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public async run(message: KlasaMessage, command: BotCommand) {
		if ('inhibit' in command && (await command.inhibit(message))) throw true;
	}
}
