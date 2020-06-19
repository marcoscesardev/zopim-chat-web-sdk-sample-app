import config from 'config';
const { ENV } = config;

export function log() {
	if (ENV === 'dev') {
		console.log.apply(console, arguments); // eslint-disable-line no-console
	}
}

export function isAgent(nick){
	return nick.startsWith('agent:');
}

export function isTrigger(nick) {
	return nick.startsWith('agent:trigger');
}

export function urlParam(key) {
  var url = new URL(window.location.href);

  return url.searchParams.get(key);
}

export * from'./PersistentStorage';
export * from'./redactor';
