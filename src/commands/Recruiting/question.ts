/* eslint-disable */
import { BotCommand } from '@lib/structures/BotCommand';
import { ApplyOptions } from '@skyra/decorators';
import { CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
	runIn: ['text'],
	subcommands: true,
	flagSupport: true,
	usage: '<add|remove|move|list|edit> [id:string] [content:...string]',
	usageDelim: ' '
})
export default class extends BotCommand {
	public async add(message: KlasaMessage, [id, content]: [number, string]) {}

	public async remove(message: KlasaMessage, id: number) {}

	public async move(message: KlasaMessage, [idFrom, idTo]: [number, number]) {}

	public async list(message: KlasaMessage) {}

	public async edit(message: KlasaMessage, [id, content]: [number, string]) {
		if (!content) throw 'Missing question content!';
	}
}
