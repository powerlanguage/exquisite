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
[ ] batch messages per stroke
[ ] login page
[ ] display names
[ ] try/catch for various socket states
[ ] pass handle functions directly to canvas instead of binding via ref
[ ] support different size screens
[ ] session-ization
[ ] canvas clears on resize
[ ] touch controls
[ ] color picker
[ ] brush size
[ ] eraser?
[ ] normalization
[ ] investigate canvas zooming
[ ] need to think about people joining after things are underway - they only see ink drawn after they joined
