const gameStart = document.querySelector(".game-start");
const gameArea = document.querySelector(".game-area");
const gameOver = document.querySelector(".game-over");
const gameScore = document.querySelector(".game-score");
const gamePoints = gameScore.querySelector(".points");
let keys = new Set();
let utils = {
    valueFromPx: function (string) {
        return Number(Array.prototype.slice.call(string, 0, string.length - 2));
    },
    valueToPixels: function (number) {
        return number + "px";
    }

}
let player = {
    x: 150,
    y: 150,
    width: 0,
    height: 0,
    lastTimeFired: 0
};
let game = {
    speed: 2,
    movingMultiplier: 4,
    fireballMultiplier: 5,
    fireInterval: 650,
    cloudSpawnInterval: 3000,
    bugSpawnInterval: 1000,
    bugMultiplier: 2.5,
    bugKillBonus: 2000
};
let scene = {
    score: 0,
    lastCloudSpawn: 0,
    lastBugSpawn: 0,
    isActiveGame:true
};

gameStart.addEventListener("click", onGameStart);
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

function isCollision(firstElement, secondElement) {
    let firstRect = firstElement.getBoundingClientRect();
    let secondRect = secondElement.getBoundingClientRect();

    return !(firstRect.top > secondRect.bottom ||
        firstRect.bottom < secondRect.top ||
        firstRect.right < secondRect.left ||
        firstRect.left > secondRect.right);
}

function onGameStart(evt) {
    evt.currentTarget.classList.add("hide");
    let wizard = document.createElement("div");
    wizard.classList.add("wizard");
    wizard.style.top = utils.valueToPixels(player.x);
    wizard.style.left = utils.valueToPixels(player.y);
    gameArea.appendChild(wizard);
    player.width = wizard.offsetWidth;
    player.height = wizard.offsetHeight;


    //game infinite loop
    window.requestAnimationFrame(gameAction);
}

function onKeyDown(e) {
    keys.add(e.code);
    // console.log(keys);
}

function onKeyUp(e) {
    keys.delete(e.code);
    // console.log(keys);
}

function addFireball(player) {
    let fireball = document.createElement("div");
    fireball.classList.add("fire-ball");
    fireball.style.top = utils.valueToPixels((parseInt(player.y + player.height / 3)));
    fireball.x = parseInt(player.x + player.width);
    fireball.style.left = utils.valueToPixels(parseInt(player.x + player.width));

    gameArea.appendChild(fireball);

}

function gameOverAction(){
    scene.isActiveGame = false;
    gameOver.classList.remove("hide");
    gameOver.addEventListener("click",init);
}
function init(){
    player = {
        x: 150,
        y: 150,
        width: 0,
        height: 0,
        lastTimeFired: 0
    };
    game = {
        speed: 2,
        movingMultiplier: 4,
        fireballMultiplier: 5,
        fireInterval: 650,
        cloudSpawnInterval: 3000,
        bugSpawnInterval: 500,
        bugMultiplier: 3,
        bugKillBonus: 2000
    };
    scene = {
        score: 0,
        lastCloudSpawn: 0,
        lastBugSpawn: 0,
        isActiveGame:true
    };
    gameArea.querySelectorAll(".bug").forEach(b => {
        b.parentElement.removeChild(b);
    });
    gameArea.querySelectorAll(".cloud").forEach(c => {
        c.parentElement.removeChild(c);
    });
    gameArea.querySelectorAll(".fire-ball").forEach(f => {
        f.parentElement.removeChild(f);
    });
    gameOver.classList.add("hide");
     gameAction();

}
function gameAction(timestamp) {

    //select the created Wizard
    const wizard = document.querySelector(".wizard");
    //increment game score
    //set default wizard picture
    wizard.classList.remove("wizard-fire");

    scene.score++;

    // add bugs
    if (timestamp - scene.lastBugSpawn > game.bugSpawnInterval + 5000 * Math.random()) {
        let bug = document.createElement("div");
        bug.classList.add("bug");
        bug.x = (gameArea.offsetWidth - 60);
        bug.style.left = utils.valueToPixels(bug.x);
        bug.style.top = utils.valueToPixels((gameArea.offsetHeight - 60) * Math.random());
        gameArea.appendChild(bug);
        scene.lastBugSpawn = timestamp;
    }
    //modify bugs position
    let bugs = document.querySelectorAll(".bug");
    bugs.forEach(b => {
        b.x -= game.speed * game.bugMultiplier;
        b.style.left = utils.valueToPixels(b.x);
        if (b.x + b.offsetWidth <= 0) {
            b.parentElement.removeChild(b);
        }
    });




    //create fireball
    let fireballs = document.querySelectorAll(".fire-ball");
    //add cloud
    if (timestamp - scene.lastCloudSpawn > game.cloudSpawnInterval + 20000 * Math.random()) {
        let cloud = document.createElement("div");
        cloud.x = gameArea.offsetWidth;
        cloud.style.left = utils.valueToPixels(cloud.x);
        cloud.style.top = utils.valueToPixels((gameArea.offsetHeight - 200) * Math.random());
        cloud.classList.add("cloud");
        gameArea.appendChild(cloud); //append cloud to game area
        scene.lastCloudSpawn = timestamp;
    }
    //move clouds 
    let cloudsOnScreen = document.querySelectorAll(".cloud");
    cloudsOnScreen.forEach(c => {
        c.x -= game.speed;
        c.style.left = utils.valueToPixels(c.x);

        if (c.x + c.offsetWidth <= 0) {
            c.parentElement.removeChild(c);
        }
    });

    //check bugs collision
    bugs.forEach( b => {
        if(isCollision(wizard,b)){
            gameOverAction();
        }
        //check fireball collision
        fireballs.forEach(f => {
            if(isCollision(f,b)){
                scene.score += game.bugKillBonus;
                b.parentElement.removeChild(b);
                f.parentElement.removeChild(f);

                console.log("bug smashed!")
            }
        });
    });



    // register user input
    let userActions = {
        "ArrowUp": function () {
            if (player.y - 3 >= 0) {
                player.y -= game.speed * game.movingMultiplier;
            }
        },
        "ArrowDown": function () {
            if (player.y + player.height <= gameArea.offsetHeight - 2) {
                player.y += game.speed * game.movingMultiplier;
            }
        },
        "ArrowLeft": function () {
            if (player.x - 2 >= 0) {
                player.x -= game.speed * game.movingMultiplier;
            }
        },
        "ArrowRight": function () {
            if (player.x + player.width <= gameArea.offsetWidth - 2) {
                player.x += game.speed * game.movingMultiplier;
            }
        },
        "Space": function () {
            //set wizard fire picture
            wizard.classList.add("wizard-fire");
            if (timestamp - player.lastTimeFired > game.fireInterval) {
                player.lastTimeFired = timestamp;
                addFireball(player);
            }

        }


    }
    //apply fireballs movement
    fireballs.forEach(f => {
        if (f.x + f.offsetWidth * 0.8 > gameArea.offsetWidth) {
            f.parentElement.removeChild(f);
        } else {
            f.x += game.speed * game.fireballMultiplier;
            f.style.left = utils.valueToPixels(f.x);
        }
    });
    //apply score to span element
    gamePoints.textContent = scene.score;
    //apply gravity
    let isInAir = (player.y + player.height) <= gameArea.offsetHeight;
    if (isInAir && !keys.has("ArrowUp")) {
        player.y += game.speed;
    }

    //apply movement

    keys.forEach(key => {
        if (userActions[key]) {
            userActions[key]();
        }
    });

    //apply new coordinates
    wizard.style.top = utils.valueToPixels(player.y);
    wizard.style.left = utils.valueToPixels(player.x);

    if(scene.isActiveGame){
        window.requestAnimationFrame(gameAction);
    }

}