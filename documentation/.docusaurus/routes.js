import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/PivotHead/markdown-page',
    component: ComponentCreator('/PivotHead/markdown-page', '9e2'),
    exact: true,
  },
  {
    path: '/PivotHead/docs',
    component: ComponentCreator('/PivotHead/docs', '841'),
    routes: [
      {
        path: '/PivotHead/docs',
        component: ComponentCreator('/PivotHead/docs', '898'),
        routes: [
          {
            path: '/PivotHead/docs',
            component: ComponentCreator('/PivotHead/docs', '1c4'),
            routes: [
              {
                path: '/PivotHead/docs/contributors/',
                component: ComponentCreator(
                  '/PivotHead/docs/contributors/',
                  'f21'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/contributors/code-of-conduct',
                component: ComponentCreator(
                  '/PivotHead/docs/contributors/code-of-conduct',
                  'e61'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/contributors/how-to-contribute',
                component: ComponentCreator(
                  '/PivotHead/docs/contributors/how-to-contribute',
                  'ca9'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/contributors/monorepo-setup',
                component: ComponentCreator(
                  '/PivotHead/docs/contributors/monorepo-setup',
                  'c2e'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/contributors/quick-start',
                component: ComponentCreator(
                  '/PivotHead/docs/contributors/quick-start',
                  '384'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/getting-started/basic-setup',
                component: ComponentCreator(
                  '/PivotHead/docs/getting-started/basic-setup',
                  '2b9'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/getting-started/headless-quick-start',
                component: ComponentCreator(
                  '/PivotHead/docs/getting-started/headless-quick-start',
                  '271'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/getting-started/installation',
                component: ComponentCreator(
                  '/PivotHead/docs/getting-started/installation',
                  '30f'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/getting-started/Why-we-use-pivothead',
                component: ComponentCreator(
                  '/PivotHead/docs/getting-started/Why-we-use-pivothead',
                  'e9b'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/headless-architecture',
                component: ComponentCreator(
                  '/PivotHead/docs/headless-architecture',
                  '0ca'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/Installation',
                component: ComponentCreator(
                  '/PivotHead/docs/Installation',
                  'e1c'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/introduction',
                component: ComponentCreator(
                  '/PivotHead/docs/introduction',
                  'db5'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/api-reference/analytics-api-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/api-reference/analytics-api-reference',
                  'a73'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/api-reference/angular-api-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/api-reference/angular-api-reference',
                  '618'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/api-reference/core-webcomponent-api-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/api-reference/core-webcomponent-api-reference',
                  '312'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/api-reference/react-api-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/api-reference/react-api-reference',
                  '46a'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/api-reference/vue-api-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/api-reference/vue-api-reference',
                  'cc0'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/conceptual-reference/angular-conceptual-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/conceptual-reference/angular-conceptual-reference',
                  '3c6'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/conceptual-reference/core-webcomponent-conceptual-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/conceptual-reference/core-webcomponent-conceptual-reference',
                  'c2b'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/conceptual-reference/react-conceptual-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/conceptual-reference/react-conceptual-reference',
                  '9ee'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/conceptual-reference/vue-conceptual-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/conceptual-reference/vue-conceptual-reference',
                  '08d'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/reference/conceptual-reference/webassembly-conceptual-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/reference/conceptual-reference/webassembly-conceptual-reference',
                  '493'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/server-side/overview',
                component: ComponentCreator(
                  '/PivotHead/docs/server-side/overview',
                  '2ed'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorial-basics/core/api-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/core/api-reference',
                  '0be'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorial-basics/core/core-concepts',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/core/core-concepts',
                  '496'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorial-basics/core/examples',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/core/examples',
                  '85b'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorial-basics/troubleshooting',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/troubleshooting',
                  '988'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorial-basics/web-component',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/web-component',
                  'f28'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorial-basics/wrappers/react',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/wrappers/react',
                  '2a0'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorial-basics/wrappers/vue',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/wrappers/vue',
                  '69f'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorials/angular/angular-sample-project',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/angular/angular-sample-project',
                  '7a0'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorials/angular/angular-setup-for-user-project',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/angular/angular-setup-for-user-project',
                  '87f'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorials/core-webcomponent/core-webcomponent-sample-project',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/core-webcomponent/core-webcomponent-sample-project',
                  'c32'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorials/core-webcomponent/setup-for-user-project',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/core-webcomponent/setup-for-user-project',
                  '83d'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorials/pivot-charts',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/pivot-charts',
                  '4f8'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorials/react/react-sample-project',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/react/react-sample-project',
                  '1f6'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorials/react/setup-for-user-project',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/react/setup-for-user-project',
                  '953'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorials/virtual-scrolling',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/virtual-scrolling',
                  '1cf'
                ),
                exact: true,
              },
              {
                path: '/PivotHead/docs/tutorials/vue/setup-for-user-project',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/vue/setup-for-user-project',
                  'd76'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorials/vue/vue-sample-project',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorials/vue/vue-sample-project',
                  '041'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/upcoming/',
                component: ComponentCreator('/PivotHead/docs/upcoming/', '249'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/PivotHead/',
    component: ComponentCreator('/PivotHead/', '409'),
    exact: true,
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
