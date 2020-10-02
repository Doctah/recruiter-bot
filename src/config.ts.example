// Remove `.example` from the file extension to configure Skyra

import type { ClientOptions as InfluxDBClientOptions } from '@influxdata/influxdb-client';
import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import type { APIWebhook } from 'discord-api-types/v6';
import type { RedisOptions } from 'ioredis';
import type { KlasaClientOptions, PostgresOptions } from 'klasa';

export const WATCH_FILES = true;
export const DEV = 'DEV' in process.env ? process.env.DEV === 'true' : !('PM2_HOME' in process.env);
export const ENABLE_LAVALINK = 'ENABLE_LAVALINK' in process.env ? process.env.ENABLE_LAVALINK === 'true' : !DEV;
export const ENABLE_INFLUX = 'ENABLE_INFLUX' in process.env ? process.env.ENABLE_INFLUX === 'true' : !DEV;
export const WSS_PORT = 1024;

export const NAME = '';
export const PREFIX = '';
export const CLIENT_ID = '';
export const CLIENT_SECRET = '';
export const REDIRECT_URI = 'http://localhost.org:3000/oauth/callback';
export const SCOPE = 'identify guilds';
export const DOMAIN = 'http://localhost.org:3000';

export const PGSQL_DATABASE_NAME = 'postgres';
export const PGSQL_DATABASE_PASSWORD = 'changemepls';
export const PGSQL_DATABASE_USER = 'postgres';
export const PGSQL_DATABASE_PORT = 5432;
export const PGSQL_DATABASE_HOST = 'localhost';
export const PGSQL_CACHE_REDIS = false;

export const REDIS_OPTIONS: RedisOptions = {
	port: 8287,
	db: 1
};

export const LAVALINK_HOST = 'localhost';
export const LAVALINK_PORT = '2333';
export const LAVALINK_PASSWORD = 'skyra';

export const PGSQL_DATABASE_OPTIONS: PostgresOptions = {
	database: PGSQL_DATABASE_NAME,
	password: PGSQL_DATABASE_PASSWORD,
	user: PGSQL_DATABASE_USER
};

export const INFLUX_URL = 'http://localhost:8285';
export const INFLUX_TOKEN = '';
export const INFLUX_ORG = 'main';
export const INFLUX_ORG_ANALYTICS_BUCKET = 'analytics';
export const INFLUX_OPTIONS: InfluxDBClientOptions = {
	url: INFLUX_URL,
	token: INFLUX_TOKEN
};

export const VERSION = '0.0.1';

export const CLIENT_OPTIONS: KlasaClientOptions = {
	shards: 'auto',
	commandEditing: true,
	commandLogging: true,
	console: {
		colors: {
			debug: {
				message: { background: null, text: null, style: null },
				time: { background: null, text: 'magenta', style: null }
			},
			error: {
				message: { background: null, text: null, style: null },
				time: { background: 'red', text: 'white', style: null }
			},
			info: {
				message: { background: null, text: 'gray', style: null },
				time: { background: null, text: 'lightyellow', style: null }
			},
			log: {
				message: { background: null, text: null, style: null },
				time: { background: null, text: 'lightblue', style: null }
			},
			verbose: {
				message: { background: null, text: 'gray', style: null },
				time: { background: null, text: 'gray', style: null }
			},
			warn: {
				message: { background: null, text: 'lightyellow', style: null },
				time: { background: null, text: 'lightyellow', style: null }
			},
			wtf: {
				message: { background: null, text: 'red', style: null },
				time: { background: 'red', text: 'white', style: null }
			}
		},
		useColor: true,
		utc: true
	},
	consoleEvents: { verbose: true, debug: false },
	clientID: CLIENT_ID,
	clientSecret: CLIENT_SECRET,
	dev: DEV,
	ws: {
		intents: [
			'GUILDS',
			'GUILD_MEMBERS',
			'GUILD_BANS',
			'GUILD_EMOJIS',
			'GUILD_VOICE_STATES',
			'GUILD_MESSAGES',
			'GUILD_MESSAGE_REACTIONS',
			'DIRECT_MESSAGES',
			'DIRECT_MESSAGE_REACTIONS'
		]
	},
	lavalink: [
		{
			id: CLIENT_ID,
			host: LAVALINK_HOST,
			port: LAVALINK_PORT,
			password: LAVALINK_PASSWORD
		}
	],
	messageCacheLifetime: 900,
	messageCacheMaxSize: 300,
	messageSweepInterval: 180,
	pieceDefaults: {
		commands: { deletable: true, quotedStringSupport: true, flagSupport: false },
		ipcMonitors: { enabled: true },
		monitors: { ignoreOthers: false },
		rawEvents: { enabled: true }
	},
	prefix: PREFIX,
	presence: { activity: { name: `${PREFIX}help`, type: 'LISTENING' } },
	providers: {
		default: 'postgres',
		postgres: PGSQL_DATABASE_OPTIONS
	},
	readyMessage: (client) =>
		`${NAME} ${VERSION} ready! [${client.user!.tag}] [ ${client.guilds.cache.size} [G]] [ ${client.guilds.cache
			.reduce((a, b) => a + b.memberCount, 0)
			.toLocaleString()} [U]].`,
	restTimeOffset: 0,
	schedule: { interval: 5000 },
	slowmode: 750,
	slowmodeAggressive: true,
	typing: false,
	dashboardHooks: {
		apiPrefix: '/',
		port: 1234,
		serverOptions: {
			IncomingMessage: ApiRequest,
			ServerResponse: ApiResponse
		}
	}
};

export const WEBHOOK_FEEDBACK: Partial<APIWebhook> | null = null;

export const WEBHOOK_ERROR: Partial<APIWebhook> = {
	avatar: '',
	channel_id: '',
	guild_id: '',
	id: '',
	name: '',
	token: ''
};

export const WEBHOOK_DATABASE: Partial<APIWebhook> | null = null;

export const TOKENS = {
	BLIZZARD_KEY: '',
	BOT_TOKEN: '',
	DARKSKY_WEATHER_KEY: '',
	GOOGLE_API_KEY: '',
	SENTRY_URL: ''
};
