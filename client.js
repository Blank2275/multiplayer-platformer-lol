const SYNC_RATE = 24;
const STEPS = 5;
var step = 1;

var showmenu = false;

setInterval(update, 1000 / SYNC_RATE);

var playersLast = {};
var players = {};
var playersCurrent = {};

var name = "guest";
var score = 0;

function update(){
    socket.emit("sync", player.x, player.y, name, score);
}

var socket = io();

socket.on("sync", (players_) => {
    playersLast = playersCurrent;
    playersCurrent = players_;
    players = playersLast;
    step = 1;
});

socket.on("map", (level, checkpoints, gi) => {
    player.x = 10;
    player.y = 10;
    player.startX = 10;
    player.startY = 10;
    player.yv = 0;
    player.won = false;
    lv1 = level;
    checkpointslv1 = checkpoints;
    goldenIndex = gi;
});

socket.on("jump", (x, y) => {
    jumpParticles(x, y, player.width, player.height);
});

function win(){
    socket.emit("win");
    player.yv = 0;
    score ++;
}

function changeName(e){
    name = document.getElementById("name").value;
}

function next(e){
    e.preventDefault();
    socket.emit("win");
}

function startOver(e){
    e.preventDefault();
    player.startX = 10;
    player.startY = 10;
    player.x = 10;
    player.y = 10;
    player.yv = 0;
}

setInterval(lerpPlayers, 1000 / SYNC_RATE / STEPS);

function lerpPlayers(){
    for(var key of Object.keys(playersLast)){
        if(Object.keys(playersCurrent).includes(key)){
            //x
            var lastX = playersLast[key]["x"];
            var currentX = playersCurrent[key]["x"];
            players[key]["x"] = lerp(lastX, currentX, step * (1 / STEPS));

            //y
            var lastY = playersLast[key]["y"];
            var currentY = playersCurrent[key]["y"];
            players[key]["y"] = lerp(lastY, currentY, step * (1 / STEPS));
        }
    }
    step += 1;
}

/*
function lerp(a, b, x){
    return a + (b - a) * x;
}
*/

function toggleMenu(e){
    e.preventDefault();

    document.getElementById("gid").innerHTML = players[socket.id]["gid"];
    showmenu = !showmenu;

    if(showmenu){
        document.getElementById("ui").style.display = "block";
        document.getElementById("ui").style.pointerEvents = "all";
        return;
    }
    document.getElementById("ui").style.display = "none";
    document.getElementById("ui").style.pointerEvents = "none";
}

function joinWorld(e){
    e.preventDefault();
    let value = document.getElementById("joinCode").value;
    let gid = players[socket.id]["gid"];

    socket.emit("join", value);
}