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
[ ] {x1,y1,x2,y2} -> [0,0,0,0],
[ ] handle larger canvas
[ ] should server handle the null clients?
[ ] pass handle functions directly to canvas instead of binding via ref
[ ] support different size screens
[ ] touch controls
[ ] eraser?
[ ] normalization / dynamically fit to screen
[ ] investigate canvas zooming
[ ] add some sort of production/dev check for console logs?
[ ] rename line to drawOperation
[ ] sample cursor position of others to show presence
[ ] show brush size preview below cursor (look)
[ ] reduce canvas resolution and then scale up (experiment with this)
[ ] remote canvas components have a bunch of logic that is only used by the local ones. worth refactoring?
[ ] test page for seeing all components quickly
[ ] need a loading state while checking if reconnection is working
[ ] split color palette into flex rows
[ ] undo
[ ] confirm before clear
[ ] ~canvas clears on resize~
[ ] ~assign different color to each player, use for cursor~
