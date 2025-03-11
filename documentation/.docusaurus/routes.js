import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/PivotHead/__docusaurus/debug',
    component: ComponentCreator('/PivotHead/__docusaurus/debug', '968'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/config',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/config', '96d'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/content',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/content', '174'),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/globalData',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/globalData',
      'a5a'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/metadata',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/metadata',
      '4c7'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/registry',
    component: ComponentCreator(
      '/PivotHead/__docusaurus/debug/registry',
      '682'
    ),
    exact: true,
  },
  {
    path: '/PivotHead/__docusaurus/debug/routes',
    component: ComponentCreator('/PivotHead/__docusaurus/debug/routes', 'bcd'),
    exact: true,
  },
  {
    path: '/PivotHead/markdown-page',
    component: ComponentCreator('/PivotHead/markdown-page', 'c5b'),
    exact: true,
  },
  {
    path: '/PivotHead/docs',
    component: ComponentCreator('/PivotHead/docs', 'a25'),
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
    ],
  },
  {
    path: '/PivotHead/',
    component: ComponentCreator('/PivotHead/', '939'),
    exact: true,
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
