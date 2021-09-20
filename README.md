# Exquisite

## What is it?

Exquisite is a prototype collaborative drawing tool inspired by [The Exquiste Corpse](https://en.wikipedia.org/wiki/Exquisite_corpse). Each participant is assigned a tile and has access to a rudimentary set of drawing tools. Participants can only see what their immediate neighbors are drawing but each participant has a unique set of neighbors. How do themes and styles propogate across the entire canvas?

## Screenshots

![exquisite-1](/screenshots/2020-06-28-external-1.png)

---

![exquisite-2](/screenshots/2020-07-14-external-2.png)

## Technical Details

Weird hybrid where I am trying to have a client/server set up without a ton of boilerplate. However, in order to acheive this I am running a bastardized version of `create-react-app` via `react-scripts`.

- Express server is set up to serve the backend.
- CRA's webpack server serves the client with hot reloading in dev
- `package.json` has a "proxy" set up to allow the client to make API requests in dev

### For dev:

```
yarn start-client

yarn start-serve
```

### For prod:

Prod deployment is very manual at the moment.

Run `yarn build` to get the client prepped to be served by the server.

Upload the repo to a server and run `yarn start-server`. The react app from `/build/` should be served to any request.

Currently `rsync`ing the required files to an ec2 instance:

```
rsync -av —progress -e "ssh -i ~/.ssh/aws-key-pair.pem" --exclude '.git' --exclude 'node_modules' ~/code/exquisite/ ubuntu@YOUR_EC2_ADDRESS:~/exquisite-prototype/
```

Then `ssh` and start the node server

```
ssh -i ~/.ssh/aws-key-pair.pem ubuntu@YOUR_EC2_ADDRESS -v
cd exquisite-prototype/
node server.js
```

Make sure the server port is one supported by aws (normally `8000`).
