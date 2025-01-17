# Pivothead Vanilla JavaScript Demo

This demo showcases how to use the Pivothead library in a vanilla JavaScript project. Pivothead is a powerful library for creating interactive pivot tables and data analysis tools.

## Installation

To use Pivothead in your vanilla JavaScript project, follow these steps:

1. Download the `pivothead-core.umd.js` file from the latest release.
2. Include the script in your HTML file:

```html
<script src="path/to/pivothead-core.umd.js"></script>
```

## Deploying to Vercel

To deploy this project to Vercel using the CLI, follow these steps:

1. Install the Vercel CLI globally:

   ```bash

   pnpm i -g vercel

   ```

2. Login to you vercel account :

   ```bash

   vercel login

   ```

3. Deploy your app to your vercel account :

   ```bash

   pnpm run vercel

   ```

4. Set up and deploy `yes`
5. Which scope should contain your project? `Enter`
6. What’s your project’s name? `Enter`
7. In which directory is your code located? ./ `Enter`


## Feature 

1. Header 

    a. Contain menus 
      - Format
         - Format cells
           
         - Condition formatting
            - User can render UI condition based on greater than , less than, equal to values.
            - By setting values from this popup user can render table UI accordingly.
            ![Screenshot from 2025-01-16 16-33-21](https://github.com/user-attachments/assets/46ed72c5-ee00-4af3-a0b9-1d67656ed8ce)

      - Options 

      - Fields
         - User can drag field from `All fields` and drop on what axis they want to group and align the data either `Columns ` axis or   `Rows` axis.

         ![image](https://github.com/user-attachments/assets/fa788402-845e-4931-b0d8-f0d600267926)
 
