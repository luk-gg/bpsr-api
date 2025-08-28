import adapter from '@sveltejs/adapter-auto';
import path from 'path'

const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$client: path.resolve('.', 'game/client'),
		},
		files: {
			routes: "utils/routes",
			appTemplate: "utils/app.html"
		},
	}
};

export default config;
