var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var SYNC_RATE = 24;

var usedIds = [];

const NUM_PLATFORMS = 5;
const  MIN_SETS = 20;
const MAX_SETS = 30;

var level = generate_level(NUM_PLATFORMS, MIN_SETS, MAX_SETS);
var checkpoints = generate_checkpoints(level);
var goldenIndex = Math.floor(Math.random() * (level.length - 1));

var worlds = {"1": {"level": level, "checkpoints": checkpoints, "goldenIndex": goldenIndex}};

var players = {};

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/client.js", (req, res) => {
    res.sendFile(__dirname + "/client.js");
});

app.get("/main.js", (req, res) => {
    res.sendFile(__dirname + "/main.js");
});

app.get("/Images/RespawnAncor.png", (req, res) => {
    res.sendFile(__dirname + "/Images/RespawnAncor.png")
});

app.get("/Images/Player.png", (req, res) => {
    res.sendFile(__dirname + "/Images/Player.png")
});

app.get("/Images/Oponent.png", (req, res) => {
    res.sendFile(__dirname + "/Images/Oponent.png")
});

io.on("connection", (socket) => {
    players[socket.id] = {"x": 0, "y": 0, "name": "guest", "score": 0, "world": "1", "gid": generate_game_id()};
    socket.emit("map", worlds["1"]["level"], worlds["1"]["checkpoints"], worlds["1"]["goldenIndex"]);
    socket.on("sync", (x, y, name, score) => {
        players[socket.id]["x"] = x;
        players[socket.id]["y"] = y;
        players[socket.id]["name"] = name;
        players[socket.id]["score"] = score;
    });
    socket.on("disconnect", () => {
        delete players[socket.id];
    });
    socket.on("win", () => {
        level = generate_level(NUM_PLATFORMS, MIN_SETS, MAX_SETS);
        checkpoints = generate_checkpoints(level);
        goldenIndex = Math.floor(Math.random() * (level.length - 1));
        let world = players[socket.id]["world"];
        worlds[world] = {"level": level, "checkpoints": checkpoints, "goldenIndex": goldenIndex};
        for(let player of Object.keys(players)){
            if(players[socket.id]["world"] == players[player]["world"]){
                players[player]["x"] = 10;
                players[player]["y"] = 10;
                io.to(player).emit("map",worlds[world]["level"], worlds[world]["checkpoints"], worlds[world]["goldenIndex"]);
            }
        }
    });
    socket.on("join", (gid) => {
        if(gid == players[socket.id]["gid"] && !Object.keys(worlds).includes(gid)){
            let level_ = generate_level(NUM_PLATFORMS, MIN_SETS, MAX_SETS);
            let checkpoints_ = generate_checkpoints(level);
            let goldenIndex_ = Math.floor(Math.random() * (level.length - 1));
            worlds[gid] = {"level": level, "checkpoints": checkpoints, "goldenIndex": goldenIndex};
        }
        if(Object.keys(worlds).includes(gid)){
            players[socket.id]["world"] = gid;
            socket.emit("map", worlds[gid]["level"], worlds[gid]["checkpoints"], worlds[gid]["goldenIndex"]);
        }
    });
    socket.on("particles", (x, y) => {
        var worldFrom = players[socket.id]["world"];
        for(var player of Object.keys(players)){
            let world = players[player]["world"];
            if(world == worldFrom){
                io.to(player).emit("particles", x, y);
            }
        }
    });
    socket.on("chat", (message) => {
        var worldFrom = players[socket.id]["world"];
        for(var player of Object.keys(players)){
            let world = players[player]["world"];
            if(world == worldFrom){
                io.to(player).emit("chat", [players[socket.id]["name"], message]);
            }
        }        
    });
});

http.listen(process.env.PORT || 8080, () => {
    console.log(`Port ${process.env.PORT || 8080}`);
});

setInterval(update, 1000 / SYNC_RATE);

function get_players_in_world(world_){
    var worldPlayers = {};
    for(var player of Object.keys(players)){
        let world = players[player]["world"];
        worldPlayers[world][player] = players[player];
    }
    return worldPlayers;
}

function generate_game_id(){
    var result = generate_unchecked_game_id();
    while(usedIds.includes(result)){
        result = generate_unchecked_game_id();
    }
    return result;
}
function generate_unchecked_game_id(){
    var chars = "abcdefghijklmnopqrstuvwxyz123456789".split("");
    var l1 = chars[Math.floor(Math.random() * chars.length)];
    var l2 = chars[Math.floor(Math.random() * chars.length)];
    var l3 = chars[Math.floor(Math.random() * chars.length)];
    var l4 = chars[Math.floor(Math.random() * chars.length)];
    var result = `${l1}${l2}${l3}${l4}`;
    return result;
}

function update(){
    //io.emit("sync", players);
    var worldPlayers = {};
    for(var player of Object.keys(players)){
        let world = players[player]["world"];
        if(!worldPlayers[world])
            worldPlayers[world] = {};
        worldPlayers[world][player] = players[player];
    }
    for(var player of Object.keys(players)){
        let world = players[player]["world"];
        io.to(player).emit("sync", worldPlayers[world]);
    }
}

function generate_checkpoints(level_){
    var checkpoints_ = [];
    for(let platform of level_){
        if(Math.random() > 0.6){
            let x = platform[0] + 10;
            let y = platform[1] - 35;
            checkpoints_.push([x, y]);
        }
    }
    return checkpoints_;
}

function generate_level(num_platforms, min_sets, max_sets){
    var num_platforms = num_platforms;
    var sets = random_range(min_sets, max_sets);
    level = [[0, 550, 400, 40]];
    
    for(var j = 0; j < sets; j++){
        var x = 0;
        var y = 550;
        
        var biasXAmount = 320 + random_range(-80, 80);
        var biasYAmount = 243 + random_range(-40, 40);
        var angle = Math.random() * Math.PI * 2;
        var biasX = biasXAmount * Math.cos(angle);
        var biasY = biasYAmount * Math.sin(angle);
        
        var distanceMultiplier = 1.75;
        startingDistanceMultiplier = 1.75;
        var targetDistanceMultiplier = .6;
        for(var i = 0; i < num_platforms; i++){
            distanceMultiplier -= (startingDistanceMultiplier - targetDistanceMultiplier) /  num_platforms;
            
            x += random_range(-100, 100) + biasX * distanceMultiplier;
            y +=  random_range(-30, 30) + biasY * distanceMultiplier;
            
            let width = random_range(20, 160);
            let height = random_range( 15, 50);
            
            level.push([x, y, width, height]);
        }
    }
    return level;
}

function random_range(min, max){
    return Math.random() * (1 + max - min) + min;
}

function plus_minus() {return Math.random() > 0.5 ? -1 : 1};