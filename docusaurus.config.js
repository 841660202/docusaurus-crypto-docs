// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const defaultSettings = {
  breadcrumbs: true,
  editUrl: 'https://github.com/dyte-io/docs/tree/main/',
  showLastUpdateTime: true,
  sidebarCollapsible: true,
  remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
  sidebarPath: require.resolve('./sidebars-default.js'),
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
};

const docs = [
  {
    id: 'crypto',
    path: 'crypto',
    routeBasePath: '/crypto',
  },
  {
    id: 'tool',
    path: 'tool',
    routeBasePath: '/tool',
  },
  {
    id: 'university',
    path: 'university',
    routeBasePath: '/university',
  },
  {
    id: 'token',
    path: 'token',
    routeBasePath: '/token',
  },
];

/**
 * Create a section
 * @param {import('@docusaurus/plugin-content-docs').Options} options
 */
function create_doc_plugin({ sidebarPath = require.resolve('./sidebars-default.js'), ...options }) {
  return [
    '@docusaurus/plugin-content-docs',
    /** @type {import('@docusaurus/plugin-content-docs').Options} */
    ({
      ...defaultSettings,
      sidebarPath,
      ...options,
    }),
  ];
}

const docs_plugins = docs.map((doc) => create_doc_plugin(doc));

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: [...docs_plugins, 'plugin-image-zoom'],
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
          // sidebarPath: './sidebars.js',
          // // Please change this to your repo.
          // // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // // Equivalent to `enableUpdateBy`.
          // showLastUpdateAuthor: true,
          // // Equivalent to `enableUpdateTime`.
          // showLastUpdateTime: true,
          ...defaultSettings,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      docs: {
        sidebar: {
          autoCollapseCategories: true,
          hideable: true,
        },
      },
      navbar: {
        title: 'My Site',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.webp',
        },
        items: [
          {
            to: '/crypto',
            label: 'Crypto',
            sidebarId: 'cryptoSidebar',
            position: 'left',
          },

          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'right',
            label: 'Tutorial',
          },

          {
            to: '/university',
            label: 'University',
            sidebarId: 'universitySidebar',
            position: 'right',
          },

          {
            label: 'Tool',
            to: '/tool',
            sidebarId: 'toolSidebar',
          },
          {
            label: 'Blog',
            to: '/blog',
          },
          {
            label: 'Token',
            to: '/token',
            sidebarId: 'tokenSidebar',
          },
          {
            label: 'docusaurus',
            to: 'https://docusaurus.io/',
            position: 'right',
          },
          {
            type: 'dropdown',
            label: 'Community',
            position: 'right',
            items: [
              {
                label: 'Facebook',
                href: 'https://www.facebook.com',
              },
              {
                type: 'doc',
                label: 'Intro',
                docId: 'intro',
              },
              // ... more items
            ],
          },
          {
            type: 'search',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },

          {
            title: 'Community',
            // items: [
            //   {
            //     label: 'Stack Overflow',
            //     href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            //   },
            //   {
            //     label: 'Discord',
            //     href: 'https://discordapp.com/invite/docusaurus',
            //   },
            //   {
            //     label: 'Twitter',
            //     href: 'https://twitter.com/docusaurus',
            //   },
            // ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['solidity'],
      },
      imageZoom: {
        // CSS selector to apply the plugin to, defaults to '.markdown img'
        selector: '.markdown img',
        // Optional medium-zoom options
        // see: https://www.npmjs.com/package/medium-zoom#options
        options: {
          // margin: 24,
          background: 'rgba(0,0,0,0.9)',
          // scrollOffset: 10,
          // container: '#zoom-container',
          // template: '#zoom-template',
        },
      },
    }),
};

export default config;
