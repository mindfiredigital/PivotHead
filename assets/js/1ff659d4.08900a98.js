"use strict";(self.webpackChunkdocument=self.webpackChunkdocument||[]).push([[500],{5680:(e,n,t)=>{t.d(n,{xA:()=>c,yg:()=>m});var a=t(6540);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var d=a.createContext({}),s=function(e){var n=a.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},c=function(e){var n=s(e.components);return a.createElement(d.Provider,{value:n},e.children)},u="mdxType",p={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},g=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=s(t),g=i,m=u["".concat(d,".").concat(g)]||u[g]||p[g]||r;return t?a.createElement(m,o(o({ref:n},c),{},{components:t})):a.createElement(m,o({ref:n},c))}));function m(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var r=t.length,o=new Array(r);o[0]=g;var l={};for(var d in n)hasOwnProperty.call(n,d)&&(l[d]=n[d]);l.originalType=e,l[u]="string"==typeof e?e:i,o[1]=l;for(var s=2;s<r;s++)o[s]=t[s];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}g.displayName="MDXCreateElement"},2560:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>o,default:()=>p,frontMatter:()=>r,metadata:()=>l,toc:()=>s});var a=t(8168),i=(t(6540),t(5680));const r={sidebar_position:2,title:"Getting Started",description:"Learn how to install and set up PivotHead in your project"},o="Getting Started with PivotHead",l={unversionedId:"Installation",id:"Installation",title:"Getting Started",description:"Learn how to install and set up PivotHead in your project",source:"@site/docs/Installation.md",sourceDirName:".",slug:"/Installation",permalink:"/pivothead/docs/Installation",draft:!1,editUrl:"https://github.com/mindfiredigital/PivotHead/tree/main/documentation/docs/Installation.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2,title:"Getting Started",description:"Learn how to install and set up PivotHead in your project"},sidebar:"tutorialSidebar",previous:{title:"What is PivotHead",permalink:"/pivothead/docs/what-is-pivothead"},next:{title:"Why Use PivotHead",permalink:"/pivothead/docs/Why-we-use-pivothead"}},d={},s=[{value:"Installation",id:"installation",level:2},{value:"Basic Setup",id:"basic-setup",level:2},{value:"Understanding the Configuration",id:"understanding-the-configuration",level:2},{value:"Data",id:"data",level:3},{value:"Rows and Columns",id:"rows-and-columns",level:3},{value:"Measures",id:"measures",level:3},{value:"Dimensions",id:"dimensions",level:3},{value:"Rendering Your First Pivot Table",id:"rendering-your-first-pivot-table",level:2},{value:"Complete Example",id:"complete-example",level:2}],c={toc:s},u="wrapper";function p(e){let{components:n,...t}=e;return(0,i.yg)(u,(0,a.A)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,i.yg)("h1",{id:"getting-started-with-pivothead"},"Getting Started with PivotHead"),(0,i.yg)("p",null,"This guide will walk you through the process of installing PivotHead, setting up a basic configuration, and creating your first pivot table."),(0,i.yg)("h2",{id:"installation"},"Installation"),(0,i.yg)("p",null,"To install PivotHead in your project, use your preferred package manager:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-bash"},"# Using npm\nnpm install @mindfiredigital/pivothead\n\n# Using yarn\nyarn add @mindfiredigital/pivothead\n\n# Using pnpm\npnpm install @mindfiredigital/pivothead\n")),(0,i.yg)("h2",{id:"basic-setup"},"Basic Setup"),(0,i.yg)("p",null,"Here's how to set up a basic pivot table using PivotHead:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-javascript"},"import { PivotEngine } from '@mindfiredigital/pivothead';\n\n// Step 1: Prepare your data\nconst data = [\n  {\n    date: '2024-01-01',\n    product: 'Widget A',\n    region: 'North',\n    sales: 1000,\n    quantity: 50,\n  },\n  {\n    date: '2024-01-01',\n    product: 'Widget B',\n    region: 'South',\n    sales: 1500,\n    quantity: 60,\n  },\n  {\n    date: '2024-01-02',\n    product: 'Widget A',\n    region: 'East',\n    sales: 1200,\n    quantity: 55,\n  },\n  {\n    date: '2024-01-02',\n    product: 'Widget B',\n    region: 'West',\n    sales: 1800,\n    quantity: 70,\n  },\n  // ... more data\n];\n\n// Step 2: Create your configuration\nconst config = {\n  data: data,\n  rows: [{ uniqueName: 'product', caption: 'Product' }],\n  columns: [{ uniqueName: 'region', caption: 'Region' }],\n  measures: [\n    {\n      uniqueName: 'sales',\n      caption: 'Total Sales',\n      aggregation: 'sum',\n      format: {\n        type: 'currency',\n        currency: 'USD',\n        locale: 'en-US',\n        decimals: 2,\n      },\n    },\n  ],\n  dimensions: [\n    { field: 'product', label: 'Product', type: 'string' },\n    { field: 'region', label: 'Region', type: 'string' },\n    { field: 'date', label: 'Date', type: 'date' },\n    { field: 'sales', label: 'Sales', type: 'number' },\n    { field: 'quantity', label: 'Quantity', type: 'number' },\n  ],\n};\n\n// Step 3: Initialize the pivot engine\nconst engine = new PivotEngine(config);\n\n// Step 4: Use the engine to render your pivot table\n// (Actual rendering will depend on your UI framework)\n")),(0,i.yg)("h2",{id:"understanding-the-configuration"},"Understanding the Configuration"),(0,i.yg)("p",null,"Let's break down the key parts of the configuration:"),(0,i.yg)("h3",{id:"data"},"Data"),(0,i.yg)("p",null,"This is your raw dataset, typically an array of objects."),(0,i.yg)("h3",{id:"rows-and-columns"},"Rows and Columns"),(0,i.yg)("p",null,"These define the structure of your pivot table:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-javascript"},"rows: [{ uniqueName: 'product', caption: 'Product' }],\ncolumns: [{ uniqueName: 'region', caption: 'Region' }],\n")),(0,i.yg)("p",null,"This configuration will create a table with products as rows and regions as columns."),(0,i.yg)("h3",{id:"measures"},"Measures"),(0,i.yg)("p",null,"Measures are the values that will be calculated and displayed in the cells:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-javascript"},"measures: [\n  {\n    uniqueName: 'sales',       // Field name in your data\n    caption: 'Total Sales',    // Display name\n    aggregation: 'sum',        // How to aggregate values\n    format: {                  // How to format the display\n      type: 'currency',\n      currency: 'USD',\n      locale: 'en-US',\n      decimals: 2,\n    },\n  },\n],\n")),(0,i.yg)("h3",{id:"dimensions"},"Dimensions"),(0,i.yg)("p",null,"Dimensions define the fields available for use in rows, columns, or filters:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-javascript"},"dimensions: [\n  { field: 'product', label: 'Product', type: 'string' },\n  { field: 'region', label: 'Region', type: 'string' },\n  { field: 'date', label: 'Date', type: 'date' },\n  { field: 'sales', label: 'Sales', type: 'number' },\n  { field: 'quantity', label: 'Quantity', type: 'number' },\n],\n")),(0,i.yg)("h2",{id:"rendering-your-first-pivot-table"},"Rendering Your First Pivot Table"),(0,i.yg)("p",null,"After creating the PivotEngine, you'll need to render the results. Here's a simple example using vanilla JavaScript:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-javascript"},"// Get a reference to your container element\nconst container = document.getElementById('pivot-container');\n\n// Function to render the pivot table\nfunction renderPivotTable() {\n  // Get the current state from the engine\n  const state = engine.getState();\n\n  // Clear the container\n  container.innerHTML = '';\n\n  // Create table element\n  const table = document.createElement('table');\n  table.className = 'pivot-table';\n\n  // Create header row\n  const thead = document.createElement('thead');\n  const headerRow = document.createElement('tr');\n\n  // Add empty cell for top-left corner\n  headerRow.appendChild(document.createElement('th'));\n\n  // Add column headers\n  state.columnHeaders.forEach(column => {\n    const th = document.createElement('th');\n    th.textContent = column.caption;\n    headerRow.appendChild(th);\n  });\n\n  thead.appendChild(headerRow);\n  table.appendChild(thead);\n\n  // Create table body\n  const tbody = document.createElement('tbody');\n\n  // Add rows\n  state.data.forEach(row => {\n    const tr = document.createElement('tr');\n\n    // Add row header\n    const th = document.createElement('th');\n    th.textContent = row.rowHeader;\n    tr.appendChild(th);\n\n    // Add cells\n    state.columnHeaders.forEach(column => {\n      const td = document.createElement('td');\n      const value = row[column.uniqueName] || 0;\n      td.textContent = engine.formatValue(value, 'sales');\n      tr.appendChild(td);\n    });\n\n    tbody.appendChild(tr);\n  });\n\n  table.appendChild(tbody);\n  container.appendChild(table);\n}\n\n// Initial render\nrenderPivotTable();\n")),(0,i.yg)("h2",{id:"complete-example"},"Complete Example"),(0,i.yg)("p",null,"Here's a complete example that you can copy and paste into an HTML file to get started:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-html"},"<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>PivotHead Example</title>\n    <style>\n      .pivot-table {\n        border-collapse: collapse;\n        width: 100%;\n        margin: 20px 0;\n      }\n      .pivot-table th,\n      .pivot-table td {\n        border: 1px solid #ddd;\n        padding: 8px;\n        text-align: right;\n      }\n      .pivot-table th {\n        background-color: #f2f2f2;\n        text-align: left;\n      }\n    </style>\n  </head>\n  <body>\n    <h1>PivotHead Example</h1>\n    <div id=\"pivot-container\"></div>\n\n    <script type=\"module\">\n      import { PivotEngine } from 'https://cdn.jsdelivr.net/npm/@mindfiredigital/pivothead/dist/index.js';\n\n      // Sample data\n      const data = [\n        {\n          date: '2024-01-01',\n          product: 'Widget A',\n          region: 'North',\n          sales: 1000,\n          quantity: 50,\n        },\n        {\n          date: '2024-01-01',\n          product: 'Widget B',\n          region: 'South',\n          sales: 1500,\n          quantity: 60,\n        },\n        {\n          date: '2024-01-02',\n          product: 'Widget A',\n          region: 'East',\n          sales: 1200,\n          quantity: 55,\n        },\n        {\n          date: '2024-01-02',\n          product: 'Widget B',\n          region: 'West',\n          sales: 1800,\n          quantity: 70,\n        },\n      ];\n\n      // Configuration\n      const config = {\n        data: data,\n        rows: [{ uniqueName: 'product', caption: 'Product' }],\n        columns: [{ uniqueName: 'region', caption: 'Region' }],\n        measures: [\n          {\n            uniqueName: 'sales',\n            caption: 'Total Sales',\n            aggregation: 'sum',\n            format: {\n              type: 'currency',\n              currency: 'USD',\n              locale: 'en-US',\n              decimals: 2,\n            },\n          },\n        ],\n        dimensions: [\n          { field: 'product', label: 'Product', type: 'string' },\n          { field: 'region', label: 'Region', type: 'string' },\n          { field: 'date', label: 'Date', type: 'date' },\n          { field: 'sales', label: 'Sales', type: 'number' },\n          { field: 'quantity', label: 'Quantity', type: 'number' },\n        ],\n      };\n\n      // Initialize the engine\n      const engine = new PivotEngine(config);\n\n      // Render function (simplified for demo)\n      function renderPivotTable() {\n        const container = document.getElementById('pivot-container');\n        container.innerHTML =\n          '<pre>' + JSON.stringify(engine.getState(), null, 2) + '</pre>';\n      }\n\n      // Initial render\n      renderPivotTable();\n    <\/script>\n  </body>\n</html>\n")),(0,i.yg)("p",null,"With these basics in place, you're ready to start building powerful data visualization tools with PivotHead!"))}p.isMDXComponent=!0}}]);