Weird hybrid where I am trying to have a client/server set up without a ton of boilerplate. However, in order to acheive this I am running a bastardized version of `create-react-app` via `react-scripts`.

- Express server is set up to serve the backend.
- CRA's webpack server serves the client with hot reloading in dev
- `package.json` has a "proxy" set up to allow the client to make API requests in dev

For dev:

```
yarn start-client

yarn start-serve
```

For prod:

Run `yarn build` to get the client prepped to be served by the server.

Upload the repo to a server and run `yarn start-server`. The react app from `/build/` should be served to any request.

Currently `rsync`ing the required files to an ec2 instance:

```
rsync -av —progress -e "ssh -i ~/.ssh/aws-key-pair.pem" --exclude '.git' --exclude 'node_modules' ~/code/exquisite/ ubuntu@3.134.173.90:~/exquisite-prototype/
```

Then `ssh` and start the node server

```
ssh -i ~/.ssh/aws-key-pair.pem ubuntu@3.134.173.90 -v
cd exquisite-prototype/
node server.js
```

Have to make sure the server port is one supported by aws (normally `8000`).

Have to figure out what I should send up/what can be excluded.

TODO:

- Better definition of how to structure messages
- Some sort of client id/persistence?
- typscript support?
- disconnections / reconnections
- error handling

```
line = [x1, y1, x2, y2 ]


// whiteboardId is also required somewhere
drawOperation = { lines: [line, line], color, brushSize }

drawOperations = [drawOperation]

history: [whiteboardId]: drawOperations;

drawOperations are independent of lines.

for the most part, a whiteboard should only receive a single draw operation at a time.

the exception to this is when receiving history.

lines are used to draw to the local canvas

when lines hits a certain limit, we package them into a draw operation and send them off


right now we have:

emit draw:

{
    whiteboardId
    color
    brushSize
    lineBatch[{x1,y1,x2,y2}, {x1,y1,x2,y2}]
}

```
