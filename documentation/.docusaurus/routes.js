import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/pivothead/__docusaurus/debug',
    component: ComponentCreator('/pivothead/__docusaurus/debug', 'da8'),
    exact: true,
  },
  {
    path: '/pivothead/__docusaurus/debug/config',
    component: ComponentCreator('/pivothead/__docusaurus/debug/config', '4e9'),
    exact: true,
  },
  {
    path: '/pivothead/__docusaurus/debug/content',
    component: ComponentCreator('/pivothead/__docusaurus/debug/content', '98b'),
    exact: true,
  },
  {
    path: '/pivothead/__docusaurus/debug/globalData',
    component: ComponentCreator(
      '/pivothead/__docusaurus/debug/globalData',
      'b55'
    ),
    exact: true,
  },
  {
    path: '/pivothead/__docusaurus/debug/metadata',
    component: ComponentCreator(
      '/pivothead/__docusaurus/debug/metadata',
      '21f'
    ),
    exact: true,
  },
  {
    path: '/pivothead/__docusaurus/debug/registry',
    component: ComponentCreator(
      '/pivothead/__docusaurus/debug/registry',
      '448'
    ),
    exact: true,
  },
  {
    path: '/pivothead/__docusaurus/debug/routes',
    component: ComponentCreator('/pivothead/__docusaurus/debug/routes', '4c8'),
    exact: true,
  },
  {
    path: '/pivothead/markdown-page',
    component: ComponentCreator('/pivothead/markdown-page', 'fc2'),
    exact: true,
  },
  {
    path: '/pivothead/docs',
    component: ComponentCreator('/pivothead/docs', '035'),
    routes: [
      {
        path: '/pivothead/docs/category/contribution-guide',
        component: ComponentCreator(
          '/pivothead/docs/category/contribution-guide',
          '991'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/category/tutorials',
        component: ComponentCreator(
          '/pivothead/docs/category/tutorials',
          '087'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/contributors/',
        component: ComponentCreator('/pivothead/docs/contributors/', 'd08'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/contributors/code-of-conduct',
        component: ComponentCreator(
          '/pivothead/docs/contributors/code-of-conduct',
          '3c8'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/contributors/how-to-contribute',
        component: ComponentCreator(
          '/pivothead/docs/contributors/how-to-contribute',
          'dab'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/Installation',
        component: ComponentCreator('/pivothead/docs/Installation', '2e8'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/tutorial-basics/api-reference',
        component: ComponentCreator(
          '/pivothead/docs/tutorial-basics/api-reference',
          '37c'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/tutorial-basics/core-concepts',
        component: ComponentCreator(
          '/pivothead/docs/tutorial-basics/core-concepts',
          '7af'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/tutorial-basics/examples',
        component: ComponentCreator(
          '/pivothead/docs/tutorial-basics/examples',
          '858'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/tutorial-basics/troubleshooting',
        component: ComponentCreator(
          '/pivothead/docs/tutorial-basics/troubleshooting',
          '3c6'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/what-is-pivothead',
        component: ComponentCreator('/pivothead/docs/what-is-pivothead', '746'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/pivothead/docs/Why-we-use-pivothead',
        component: ComponentCreator(
          '/pivothead/docs/Why-we-use-pivothead',
          '861'
        ),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
    ],
  },
  {
    path: '/pivothead/',
    component: ComponentCreator('/pivothead/', '504'),
    exact: true,
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
