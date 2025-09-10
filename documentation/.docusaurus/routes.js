import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/PivotHead/__docusaurus/debug',
    component: ComponentCreator('/PivotHead/__docusaurus/debug', '39b'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/config',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/config', '4a7'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/content',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/content', '6a0'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/globalData',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/globalData',
      '2ef'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/metadata',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/metadata',
      '306'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/registry',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/registry',
      'f91'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/routes',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/routes', 'd2b'),
    exact: true,
  },
  {
    path: '/PivotHead/markdown-page',
    component: ComponentCreator('/PivotHead/markdown-page', '616'),
    exact: true,
  },
  {
    path: '/PivotHead/docs',
    component: ComponentCreator('/PivotHead/docs', '297'),
    routes: [
      {
        path: '/PivotHead/docs/category/contribution-guide',
        component: ComponentCreator(
          '/PivotHead/docs/category/contribution-guide',
          '9c0'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/category/tutorials',
        component: ComponentCreator(
          '/PivotHead/docs/category/tutorials',
          '061'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/category/wrapper',
        component: ComponentCreator('/PivotHead/docs/category/wrapper', '27e'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/contributors/',
        component: ComponentCreator('/PivotHead/docs/contributors/', 'da1'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/contributors/code-of-conduct',
        component: ComponentCreator(
          '/PivotHead/docs/contributors/code-of-conduct',
          'ea0'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/contributors/how-to-contribute',
        component: ComponentCreator(
          '/PivotHead/docs/contributors/how-to-contribute',
          '3df'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/contributors/monorepo-setup',
        component: ComponentCreator(
          '/PivotHead/docs/contributors/monorepo-setup',
          '3e5'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/contributors/quick-start',
        component: ComponentCreator(
          '/PivotHead/docs/contributors/quick-start',
          '566'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/Installation',
        component: ComponentCreator('/PivotHead/docs/Installation', '05f'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/tutorial-basics/api-reference',
        component: ComponentCreator(
          '/PivotHead/docs/tutorial-basics/api-reference',
          'e89'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/tutorial-basics/core-concepts',
        component: ComponentCreator(
          '/PivotHead/docs/tutorial-basics/core-concepts',
          '3c8'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/tutorial-basics/examples',
        component: ComponentCreator(
          '/PivotHead/docs/tutorial-basics/examples',
          '0e5'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/tutorial-basics/troubleshooting',
        component: ComponentCreator(
          '/PivotHead/docs/tutorial-basics/troubleshooting',
          '29e'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/tutorial-basics/web-component',
        component: ComponentCreator(
          '/PivotHead/docs/tutorial-basics/web-component',
          'af8'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/what-is-pivothead',
        component: ComponentCreator('/PivotHead/docs/what-is-pivothead', '00a'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/Why-we-use-pivothead',
        component: ComponentCreator(
          '/PivotHead/docs/Why-we-use-pivothead',
          '40b'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/PivotHead/docs/wrapper/react-lib',
        component: ComponentCreator('/PivotHead/docs/wrapper/react-lib', '8ba'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
    ],
  },
  {
    path: '/PivotHead/',
    component: ComponentCreator('/PivotHead/', 'f8d'),
    exact: true,
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
