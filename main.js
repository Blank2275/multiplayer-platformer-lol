const GRAVITY = .5;
const MOVEMENT_SPEED = 5;
const JUMP_FORCE =  10;

var CHECKPOINT_SIZE = 50;

var lv1 = [
    [0, 550, 400, 40]
];
var checkpointslv1 = [
    [1100, -100],
    [1200, 250],
    [2210, 450]
];

var goldenIndex = 0;

class Player{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.cameraX = x;
        this.cameraY = y;
        this.cameraSpeed = 0.1;
        this.startX = x;
        this.startY = y;
        this.width = 15;
        this.height = 15;
        this.yv = 0;
        this.grounded = false;
        this.jumps = 0;
        this.won = false;
    }
    restart(){
        this.x = this.startX;
        this.y = this.startY;
        this.yv = 0;
        this.grounded = false;
        this.jumps = 0;
    }
    update(level, checkpoints){
        this.grounded = false;
        this.yv += GRAVITY;

        var index = 1;
        for(var platform of level){
            index++;
            //rect for all collisions
            let rx = this.x;
            let ry = this.y;
            let rw = this.width;
            let rh = this.height + this.yv;

            //top
            let x1 = platform[0];
            let y1 = platform[1];
            let x2 = platform[0] + platform[2];
            let y2 = platform[1];

            var topCollision = lineRect(x1, y1, x2, y2, rx, ry, rw, rh);

            //left
            x1 = platform[0];
            y1 = platform[1] + 1;
            x2 = platform[0];
            y2 = platform[1] + platform[3] - 1;

            var leftCollision = lineRect(x1, y1, x2, y2, rx, ry, rw, rh);

            //right
            x1 = platform[0] + platform[2];
            y1 = platform[1] + 1;
            x2 = platform[0] + platform[2];
            y2 = platform[1] + platform[3] - 1;

            var rightCollision = lineRect(x1, y1, x2, y2, rx, ry, rw, rh);

            //bottom
            x1 = platform[0];
            y1 = platform[1] + platform[3];
            x2 = platform[0] + platform[2];
            y2 = platform[1] + platform[3];

            var bottomCollision = lineRect(x1, y1, x2, y2, rx, ry, rw, rh);
            //resolve collisions
            if(topCollision){
                this.y = platform[1] - this.height + 0.01;
                this.yv = 0;
                this.grounded = index;
                this.jumps = 2;
            }

            if(leftCollision){
                this.x = platform[0] - this.width;
                this.grounded = index;
            }

            if(rightCollision){
                this.x = platform[0] + platform[2];
                this.grounded = index;
            }

            if(bottomCollision){
                this.y = platform[1] + platform[3] + 1;
                this.yv = 0;
                this.grounded = index;
            }
            
            //win?
            if(this.grounded == goldenIndex && !this.won){
                win();
                this.won = true;
            }
            
            if(this.y > screenHeight + 2000){
                this.restart();
            }
        }
        for(var checkpoint of checkpoints){
            if(dist(this.x, this.y, checkpoint[0], checkpoint[1]) < this.height + CHECKPOINT_SIZE){
                this.startX = checkpoint[0];
                this.startY = checkpoint[1];
            }
        }
        this.y += this.yv;
        this.cameraX = lerp(this.cameraX, this.x, this.cameraSpeed);
        this.cameraY = lerp(this.cameraY, this.y, this.cameraSpeed);
        this.display();
    }
    display(){
        fill("green");
        image(playerImg, screenWidth/ 2 - this.width / 2 + (this.x - this.cameraX), screenHeight / 2 + (this.y - this.cameraY), this.width, this.height);
    }
    move(amount){
        this.x += amount;
    }
    jump(force){
        if(this.jumps > 0){
            this.yv = -force;
            this.y += this.yv;
            this.y -= 1;
            this.jumps -= 1;
        }
    }
}

var player = new Player(10, 10);
var screenWidth = 800;
var screenHeight = 600;

var respawnAncor;
var playerImg;
var oponentImg;
function preload(){
    respawnAncor = loadImage("Images/RespawnAncor.png");
    playerImg = loadImage("Images/Player.png");
    oponentImg = loadImage("Images/Oponent.png");
}

function setup(){
    createCanvas(windowWidth / 1.15, windowHeight / 1.15);
    screenWidth = windowWidth / 1.15;
    screenHeight = windowHeight / 1.15;
    noStroke();
}

function draw(){
    background(67, 85, 147);
    drawMap(lv1);
    drawCheckpoints(checkpointslv1);
    drawPlayers();
    drawScore();
    player.update(lv1, checkpointslv1);

    if(keyIsDown(LEFT_ARROW)){
        player.move(-MOVEMENT_SPEED);
    }
    if(keyIsDown(RIGHT_ARROW)){
        player.move(MOVEMENT_SPEED);
    }
    /*
    if(keyIsDown(UP_ARROW)){
        player.jump(JUMP_FORCE);
    }
    */
}

function keyPressed(){
    if(keyCode == UP_ARROW){
        player.jump(JUMP_FORCE);
    }
}

function drawScore(){
    x = 30;
    y = 30;
    fill("black");
    for(let player of Object.keys(players)){
        let name = players[player]["name"];
        let score = players[player]["score"];
        text(`${name} has a score of ${score}`, x, y);
        y += 15; 
    }
}

function drawMap(m){
    var index = 1;

    var minX = 0;
    var minY = 0;
    var maxX = 0;
    var maxY = 0;
    for(var p of m){
        if(p[0] < minX){
            minX = p[0];
        }
        if(p[1] < minY){
            minX = p[1];
        }
        if(p[0] > maxX){
            maxX = p[0];
        }
        if(p[1] > maxY){
            maxX = p[1];
        }
    }

    for(var platform of m){
        var base = 40;
        var x = platform[0];
        var y = platform[1];
        /*
        let r = (255 - base - 30) * percent_through(x, minX - 1, maxX + 1);
        let g = (255 - base - 90) * percent_through(y, minY - 1, maxY + 1);
        let b = (255 - base) * percent_through((maxX - x), minX - 1, maxX + 1);

        fill(r + base, g + base, b + base);
        */
        if(x > 0 && y < 550){
            fill(210, 31, 219);
        } else if (x > 0 && y > 550){
            fill(25, 80, 230);
        } else if(x < 0 && y > 550){
            fill(213, 219, 31);
        } else if(x < 0 && y < 550){
            fill(232, 58, 58);
        } else{
            fill(230);
        }
        index += 1;
        if(index == goldenIndex){
            fill("yellow");
            stroke("green");
            strokeWeight(4);
        }
        rect(platform[0] - player.cameraX + screenWidth / 2, platform[1] - player.cameraY + screenHeight / 2, platform[2], platform[3]);
        noStroke();
    }
}

function drawPlayers(){
    for(var player_ of Object.keys(players)){
        if(player_ != socket.id){
            var x = players[player_].x;
            var y = players[player_].y;
            fill("red");
            image(oponentImg, screenWidth/ 2 - player.width / 2 + (x - player.cameraX), screenHeight / 2 + (y - player.cameraY), player.width, player.height);

            //draw nametag

            x = screenWidth / 2 + (x - player.cameraX);
            y = screenHeight / 2 + (y - player.cameraY);

            let name = players[player_]["name"];
            let gid = players[player_]["gid"];
            let score = players[player_]["score"];
            fill(0);
            textSize(12);
            let nameWidth = textWidth(name);
            text(name, x - nameWidth / 2, y - 35);
            textSize(12);
            let idWidth = textWidth(gid);
            text(gid, x - idWidth / 2, y - 20);
            textSize(12);
            let scoreWidth = textWidth(score);
            text(score, x - scoreWidth / 2, y - 5);
        }
    }
}

function drawCheckpoints(checkpoints){
    for(let checkpoint of checkpoints){
        fill(130, 20, 190);
        image(respawnAncor ,checkpoint[0] - CHECKPOINT_SIZE / 2 - player.cameraX + screenWidth / 2, checkpoint[1] - CHECKPOINT_SIZE / 2  - player.cameraY + screenHeight / 2, CHECKPOINT_SIZE, CHECKPOINT_SIZE);
    }
}

function  lineRect(x1, y1, x2, y2, rx, ry, rw, rh){
    var left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
    var right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
    var top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
    var bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

    if(left || right || top || bottom)
        return true;
    return false;
}

function lineLine(x1, y1, x2, y2, x3, y3, x4, y4){
    var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    if(uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1)
        return true;
    return false;
}

function lerp(a, b, x){
    return a + (b - a) * x;
}

function percent_through(v, min, max){
    return (v - min) / (max - min);
}