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
    component: ComponentCreator('/PivotHead/docs', '97d'),
    routes: [
      {
        path: '/PivotHead/docs',
        component: ComponentCreator('/PivotHead/docs', 'a7e'),
        routes: [
          {
            path: '/PivotHead/docs',
            component: ComponentCreator('/PivotHead/docs', 'c22'),
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
                path: '/PivotHead/docs/tutorial-basics/api-reference',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/api-reference',
                  'a6a'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorial-basics/core-concepts',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/core-concepts',
                  '37a'
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/PivotHead/docs/tutorial-basics/examples',
                component: ComponentCreator(
                  '/PivotHead/docs/tutorial-basics/examples',
                  '903'
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
                path: '/PivotHead/docs/what-is-pivothead',
                component: ComponentCreator(
                  '/PivotHead/docs/what-is-pivothead',
                  '24e'
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
