import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/PivotHead/__docusaurus/debug',
    component: ComponentCreator('/PivotHead/__docusaurus/debug', 'aa4'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/config',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/config', '251'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/content',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/content', '0aa'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/globalData',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/globalData',
      '6ba'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/metadata',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/metadata',
      'a8d'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/registry',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/registry',
      'f54'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/routes',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/routes', '9ce'),
    exact: true,
  },
  {
    path: '/PivotHead/markdown-page',
    component: ComponentCreator('/PivotHead/markdown-page', '9e2'),
    exact: true,
  },
  {
    path: '/PivotHead/docs',
    component: ComponentCreator('/PivotHead/docs', '901'),
    routes: [
      {
        path: '/PivotHead/docs',
        component: ComponentCreator('/PivotHead/docs', '3c0'),
        routes: [
          {
            path: '/PivotHead/docs',
            component: ComponentCreator('/PivotHead/docs', '4f9'),
            routes: [
              {
                path: '/PivotHead/docs/category/contribution-guide',
                component: ComponentCreator(
                  '/PivotHead/docs/category/contribution-guide',
                  '2e1'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/category/tutorials',
                component: ComponentCreator(
                  '/PivotHead/docs/category/tutorials',
                  'ceb'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
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
                path: '/PivotHead/docs/Installation',
                component: ComponentCreator(
                  '/PivotHead/docs/Installation',
                  '15e'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
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
                path: '/PivotHead/docs/tutorial-basics/core/api-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/core/api-reference',
                  '23f'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorial-basics/core/core-concepts',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/core/core-concepts',
                  '52f'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorial-basics/core/examples',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/core/examples',
                  '906'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
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
                  '9dc'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorial-basics/wrappers/react',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/wrappers/react',
                  'af3'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorial-basics/wrappers/vue',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/wrappers/vue',
                  '877'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/Why-we-use-pivothead',
                component: ComponentCreator(
                  '/PivotHead/docs/Why-we-use-pivothead',
                  '71b'
                ),
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
