const SYNC_RATE = 48;

setInterval(update, 1000 / SYNC_RATE);

var players = {};
var name = "guest";
var score = 0;

function update(){
    socket.emit("sync", player.x, player.y, name, score);
}

var socket = io();

socket.on("sync", (players_) => {
    players = players_;
});

socket.on("map", (level, checkpoints, gi) => {
    player.x = 10;
    player.y = 10;
    player.startX = 10;
    player.startY = 10;
    player.won = false;
    lv1 = level;
    checkpointslv1 = checkpoints;
    goldenIndex = gi;
});

function win(){
    socket.emit("win");
    score ++;
}

function changeName(e){
    name = document.getElementById("name").value;
}

function next(e){
    e.preventDefault();
    socket.emit("win");
}