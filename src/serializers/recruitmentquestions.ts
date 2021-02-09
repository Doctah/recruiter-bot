import type { RecruitmentQuestions } from '@lib/types/settings/GuildSettings';
import { Serializer } from 'klasa';

export default class extends Serializer {
	public validate(data: RecruitmentQuestions) {
		if (typeof data.id === 'number' && typeof data.content === 'string') {
			return data;
		}
	}
}
