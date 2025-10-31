// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');

// const lightCodeTheme = require('prism-react-renderer/themes/github');
// const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PivotHead',
  tagline: 'Documentation for the PivotHead',
  favicon: 'img/logo.png',

  // Set the production url of your site here
  url: 'https://mindfiredigital.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/PivotHead',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mindfiredigital', // Usually your GitHub org/user name.
  projectName: 'PivotHead', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/mindfiredigital/PivotHead/tree/main/documentation/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/mindfiredigital/PivotHead/tree/main/documentation/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    async function docusaurusTailwindcss(context, options) {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          // Appends Tailwind CSS and AutoPrefixer.
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
      };
    },
  ],

  scripts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/vanta@0.5.21/dist/vanta.net.min.js',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/pivothead.webp',

      navbar: {
        title: 'PivotHead',
        logo: {
          alt: 'PivotHead Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://www.npmjs.com/package/@mindfiredigital/pivothead',
            position: 'right',
            html: `
              <a href="https://www.npmjs.com/package/@mindfiredigital/pivothead" style="display: flex; align-items: center;">
                <img src="https://img.shields.io/npm/v/@mindfiredigital/pivothead.svg" alt="npm version" style="vertical-align: middle; margin-right: 5px;" />
                <img src="https://img.shields.io/npm/dt/@mindfiredigital/pivothead.svg" alt="total downloads" style="vertical-align: middle;" />
              </a>
            `,
          },
          {
            href: 'https://github.com/mindfiredigital/PivotHead',
            label: 'GitHub',
            position: 'right',
          },
          // {
          //   type: 'html',
          //   position: 'right',
          //   value: '<div class="navbar__item dropdown dropdown--hoverable dropdown--right"><a class="navbar__link" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false">Theme</a><ul class="dropdown__menu"><li><a class="dropdown__link" href="#!" onclick="window.setTheme(\'light\')">Light</a></li><li><a class="dropdown__link" href="#!" onclick="window.setTheme(\'dark\')">Dark</a></li></ul></div>',
          // },
        ],
      },
      footer: {
        // style: 'dark',

        copyright: `© ${new Date().getFullYear()} Mindfire FOSS`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

module.exports = config;
