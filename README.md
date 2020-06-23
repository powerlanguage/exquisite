Weird hybrid where I am trying to have a client/server set up without a ton of boilerplate. However, in order to acheive this I am running a bastardized version of `create-react-app` via `react-scripts`.

- Express server is set up to serve the backend.
- CRA's webpack server serves the client with hot reloading in dev
- `package.json` has a "proxy" set up to allow the client to make API requests in dev
- For production, see below.

For

```
yarn start-client

yarn start-serve
```

Not quite sure about production.

Think running `yarn build` will get the client prepped to be served by the server.

Currently `rsync`ing the required files to an ec2 instance:

```
rsync -av — progress -e "ssh -i ~/.ssh/aws-key-pair.pem" --exclude '.git' --exclude 'node_modules' ~/code/exquisite/ ubuntu@18.219.208.138:~/exquisite-prototype/
```

Have to make sure the server port is one supported by aws (normally `8000`).

Have to figure out what I should send up/what can be excluded.
