var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var SYNC_RATE = 48;

const NUM_PLATFORMS = 5;
const  MIN_SETS = 20;
const MAX_SETS = 30;

var level = generate_level(NUM_PLATFORMS, MIN_SETS, MAX_SETS);
var checkpoints = generate_checkpoints(level);
var goldenIndex = Math.floor(Math.random() * (level.length - 1));

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

io.on("connection", (socket) => {
    players[socket.id] = {"x": 0, "y": 0, "name": "guest", "score": 0};
    socket.emit("map", level, checkpoints, goldenIndex);
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
        for(let player of Object.keys(players)){
            players[player]["x"] = 10;
            players[player]["y"] = 10;
            level = generate_level(NUM_PLATFORMS, MIN_SETS, MAX_SETS);
            checkpoints = generate_checkpoints(level);
            goldenIndex = Math.floor(Math.random() * (level.length - 1));
            io.emit("map", level, checkpoints, goldenIndex);
        }
    });
});

http.listen(8080, () => {
    console.log("10.0.0.108:8080");
});

setInterval(update, 1000 / SYNC_RATE);

function update(){
    io.emit("sync", players);
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
        
        for(var i = 0; i < num_platforms; i++){
            x += random_range(-100, 100) + biasX;
            y +=  random_range(-30, 30) + biasY;
            
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