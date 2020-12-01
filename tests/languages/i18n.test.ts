import { client } from '@mocks/MockInstances';
import { createLanguageStore } from '@mocks/MockLanguageStore';
import English from '@root/languages/en-US';

describe('i18n tests', () => {
	const englishLanguageStore = createLanguageStore(client, 'english-store', English);

	const english = new English(englishLanguageStore, ['en-US.ts'], '');

	describe('English language testing', () => {
		test('GIVEN English Language THEN should parse all ordinals', () => {
			expect(english.ordinal(0)).toBe('0th');
			expect(english.ordinal(1)).toBe('1st');
			expect(english.ordinal(2)).toBe('2nd');
			expect(english.ordinal(3)).toBe('3rd');
			expect(english.ordinal(4)).toBe('4th');
			expect(english.ordinal(5)).toBe('5th');
			expect(english.ordinal(10)).toBe('10th');
		});

		test('GIVEN English language THEN should have noop init', async () => {
			const spy = jest.spyOn(english, 'init');

			await english.init();

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith();

			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			expect(english.init()).resolves.toBe(undefined);

			expect(spy).toHaveBeenCalledTimes(2);
		});
	});
});
