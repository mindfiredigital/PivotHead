# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

/\*\*

- Any CSS included here will be global. The classic template
- bundles Infima by default. Infima is a CSS framework designed to
- work well for content-centric websites.
  \*/

/_ You can override the default Infima variables here. _/
:root {
--ifm-color-primary: #ff0000;
--ifm-color-primary-dark: #e60000;
--ifm-color-primary-darker: #d90000;
--ifm-color-primary-darkest: #b30000;
--ifm-color-primary-light: #ff1a1a;
--ifm-color-primary-lighter: #ff2626;
--ifm-color-primary-lightest: #ff4d4d;
}

/_ For readability concerns, you should choose a lighter palette in dark mode. _/
[data-theme='dark'] {
--ifm-color-primary: #ff0000;
--ifm-color-primary-dark: #e60000;
--ifm-color-primary-darker: #d90000;
--ifm-color-primary-darkest: #b30000;
--ifm-color-primary-light: #ff1a1a;
--ifm-color-primary-lighter: #ff2626;
--ifm-color-primary-lightest: #ff4d4d;
}

.navbar\_\_title {
color: red;
}
