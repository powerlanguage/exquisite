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

broadcast my lines
receive lines

lines are associated with a canvas
canvasId

There will be many canvases
There will be many users

A user is assigned a canvas

Send them updates from their neighbors

Send their updates to their neighbors

don't worry about reconnections for now

how to convert between screen sizes on different clients

server should broadcast to specific canvases

that way each canvas can be listening for updates it should receive

For tictactoo I am sending the entire gamestate down to every client.

Set up generic action parsing/method calling on both client and server.

<!-- prettier-ignore -->
When connection is established, does it have an id?
    if not:
        create one and return to client
        store in clients list
    if does:
        if in client list
            would this be the point we catch them up?
        if not in client list
            add to client list

# Scenarios

- Human sends set username who has never played before

  - no deviceId sent with request // Will there ever be an id sent with req?
  - no existing username found

  - user is created

    - deviceId
    - username
    - canvasId

  - link socket to deviceId

  - username and canvasId stored in app state
  - deviceId stored in localStorage

  - Every subsequent request must include deviceId and is checked if matches socket.

- Human refreshes page mid-game

  - device found in localStorage
  - no username or canvasId
  - sends request with deviceId
  - returns username and canvasId

  - remaps socket to deviceId

- Human enters name of existing user

  - receive set username

  -

- Human returns to play 1 day later

<!-- prettier-ignore -->
server
    user connects
        assign canvas - this is required to be able to associate a socket with a canvas.
    receives update
        broadcast to neighbors
client
    on draw
        send line data

[x] concept of different canvases
[x] 9 canvases, same view for every user
[x] move css to modules
[x] cursor when hovering on other canvases
[x] color picker
[x] brush size
[x] batch messages per stroke
[x] login page
[x] display names
[x] refactor sockets out of server
[x] timeout for drawing batch
[x] clear canvas button
[x] style controls better
[x] try/catch for various socket states
[x] add a div to wrap canvas overlay elements and set inner padding
[x] better fonts/colors
[x] figure out how to animate menu in and out
[x] toggle control display
[x] add splash screen with basic instructions
[x] rename onEmit
[x] memoize doesn't appear to actually be memoizing
[x] setusername trims zeros?
[x] start button for first user?
[x] cap batch size. send and reset
[x] center each player within the global canvas (wrap the canvases)
[x] color / brush size in draw operation
[x] update from range to button brush size picker
[x] pack in stroke color/size at the same time as id
[x] swatch color picker
[x] update id to canvasId
[x] reset button styling and add my own
[x] refactor socket to global context and hook
[x] experiment with removing delay on draw now that we are batching small strokes as chunks
[x] figure out better way for client to handle ws messages. it shouldn't be saying "emit draw" it should be saying "i drew a line"
[x] server-side duplicate name protection
[x] refactor game logic out of sockets lib
[x] store history
[x] session-ization
[x] update server because right now it assumes every connection is also a player
[x] only send history to clients who have just joined
[x] don't end drawing on mouseleave
[x] allow people to directly join a game in progress
[x] don't require start if game is in progress
[x] tapping mouse doesn't result in paint.
[x] allow people to reconnect
[x] prune clients that disconnect?
[x] show brush size preview below cursor (look)
[x] {x1,y1,x2,y2} -> [0,0,0,0],
[x] players that reconnect when app is waiting for others are not reconnected with their account
[x] could we just set a game state obj?
[x] handle what should happen when others attempt to join and game is full
[x] confirm before clear
[x] single tap dot
[x] handle larger canvas
[x] should server handle the null clients?
[x] need a loading state while checking if reconnection is working
[x] touch controls
[x] loading state
[ ] pass handle functions directly to canvas instead of binding via ref
[ ] support different size screens
[ ] eraser?
[ ] normalization / dynamically fit to screen
[ ] investigate canvas zooming
[ ] add some sort of production/dev check for console logs?
[ ] rename line to drawOperation
[ ] sample cursor position of others to show presence
[ ] reduce canvas resolution and then scale up (experiment with this)
[ ] remote canvas components have a bunch of logic that is only used by the local ones. worth refactoring?
[ ] test page for seeing all components quickly
[ ] split color palette into flex rows
[ ] undo
[ ] we are duplicating user information in a lot of places in react state. this comes from the server so it is not the end of the world but feels like everything should be playerIds with one spot to do lookups.
[ ] put people in the 2d players array based on the max number of neighbors possible

When to show loading state?
When user has a whiteboardId (we check to see if they should re-enter)
User joins during end state
There is no gameState obj

<!-- OLD -->

[ ] ~canvas clears on resize~
[ ] ~assign different color to each player, use for cursor~
