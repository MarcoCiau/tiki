# Getting Started 
- Clone the repository via SSH `git clone git@github.com:MarcoCiau/tiki.git`
- Run `npm install` to install dependencies
- Specify the enviroment variables in a .env file. see ``.env.example``

## Development
Runs the server with nodemon. The server will reload when you make the changes.
```
npm run dev
```

To build and compile Typescript, run the following command:
```
tsc --watch
```

The code will be recompiled when you make changes.
# Development
Runs the app in the development mode. The page will reload when you make changes.
```bash
npm start
```


## Production

-  log in to your Heroku account and follow the prompts to create a new SSH public key.
``` bash
heroku login
```

- For existing repositories, add the heroku remote
``` bash
heroku git:remote -a tiki-iot
```


- Deploy `production` branch

``` bash
git push heroku production:main
```