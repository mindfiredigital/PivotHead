// import type { StorybookConfig } from '@storybook/angular';
// import path from 'path';

// const config: StorybookConfig = {
//   stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
//   addons: [
//     '@storybook/addon-links',
//     '@storybook/addon-essentials',
//     '@storybook/addon-interactions',
//   ],
//   framework: {
//     name: '@storybook/angular',
//     options: {},
//   },
//   docs: {
//     autodocs: 'tag',
//   },
//   // Add the webpackFinal configuration here
//   webpackFinal: async (config, { configType }) => {
//     if (config.resolve) {
//       config.resolve.alias = {
//         ...config.resolve.alias,
//         '@mindfiredigital/pivothead-web-component': path.resolve(
//           __dirname,
//           '../../../packages/web-component/dist'
//         ),
//         '@mindfiredigital/pivothead': path.resolve(
//           __dirname,
//           '../../../packages/core/dist'
//         ),
//       };
//     }
//     return config;
//   },
// };

// export default config;

// examples/pivot-head-angular-demo/.storybook/main.ts

import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async config => {
    // Add TypeScript paths
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@mindfiredigital/pivothead-web-component': require.resolve(
          '../../../packages/web-component/src'
        ),
        '@mindfiredigital/pivothead-angular': require.resolve(
          '../../../packages/angular/src'
        ),
        '@mindfiredigital/pivothead': require.resolve(
          '../../../packages/core/src'
        ),
      };
    }
    return config;
  },
};

export default config;
