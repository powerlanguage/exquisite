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
[ ] ~canvas clears on resize~
[ ] server-side duplicate name protection
[ ] {x1,y1,x2,y2} -> [0,0,0,0],
[ ] refactor game logic out of sockets lib
[ ] figure out better way for client to handle ws messages. it shouldn't be saying "emit draw" it should be saying "i drew a line"
[ ] pass handle functions directly to canvas instead of binding via ref
[ ] store history? allow folks to join later in progress.
[ ] allow people to directly join a game in progress? would require state to be communicated from the server
[ ] support different size screens
[ ] session-ization
[ ] touch controls
[ ] eraser?
[ ] normalization / dynamically fit to screen
[ ] investigate canvas zooming
[ ] need to think about people joining after things are underway - they only see ink drawn after they joined
[ ] add some sort of production/dev check for console logs?
[ ] prune clients that disconnect?
[ ] experiment with removing delay on draw now that we are batching small strokes as chunks
[ ] rename line to drawOperation
[ ] sample cursor position of others to show presence
[ ] assign different color to each player, use for cursor
[ ] show brush size preview below cursor (look)
[ ] reduce canvas resolution and then scale up (experiment with this)
[ ] remote canvas components have a bunch of logic that is only used by the local ones. worth refactoring?
[ ] test page for seeing all components quickly
[ ] tapping mouse doesn't result in paint.
[ ] split color palette into flex rows
[ ] need to update server because right now it assumes every connection is also a player
