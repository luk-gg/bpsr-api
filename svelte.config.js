import adapter from '@sveltejs/adapter-auto';
import path from 'path'

const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$client: path.resolve('.', 'game/client'),
			$server: path.resolve('.', 'game/server'),
		},
		files: {
			routes: "util-routing/routes",
			appTemplate: "util-routing/app.html"
		},
	}
};

export default config;
