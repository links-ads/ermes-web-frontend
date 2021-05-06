# ERMES Web Tool

Web tool (admin and secondary frontend) for the ERMES project

**First responder Advanced technologies for Safe and efficienT Emergency Response**

## App configuration

This app has most of the configuration files in the public folder, in order to minimize re-deployments.

```
⋮
└── public
    |── locales // all dictionaries
    ├── themes // theme overrides configuration
    └── icons // icons, manifest and brand logo, with the following names
        ├── favicon.ico // Classic 16x16 favicon
        ├── logo192.png // Square 192x192 png logo
        ├── logo512.png // Square 512x512 png logo
        ├── logo2048.png // Square 2048x2048 png logo
        ├── logo.svg // Optional SVG logo
        └── brand.png // Rectangular logo with text
        config.json // App configuration (endpoints, etc)
        index.html // HTML template
        manifest.json // App Manifest
        robots.txt // Crawling configuration
```

Content-Security-Policy is best set on the server [e.g. as suggested here](https://www.ryadel.com/en/nginx-conf-secure-http-response-headers-pass-securityheaders-io-scan/), for further flexibility in the deployment.

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

Required node version for this project: 12.x

In the project directory, you can run:

#### `yarn start`

or

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `yarn test`

or

#### `npm run test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn build`

or

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `yarn eject`

or

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


## Deploy

Since the code base is valid for multiple projects, in order to build the interface for each specific project we have to declare it in the build command:
#### `npm run-script build-faster`

or

#### `npm run-script build-shelter`


In case the deploy fails to build due to $1, try to change the file format from CRLF to LF on the bottom right part of VSCode