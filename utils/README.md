Commonly used functions throughout Luk.gg APIs. 

Additionally includes default route templates for the SvelteKit project. `svelte.config.js` needs to be modified to include the following:
```js
const config = {
  kit: {
    ...
    // Overrides default routes directory to utils/routes. Comment this out if you have a project that needs to handle routes differently from the templates provided.
    files: {
      routes: "utils/routes",
      appTemplate: "utils/app.html"
    },
  },
};
```
