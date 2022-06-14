const height = 720;
const weigth = 1080;
const pHeight = 15;
const pWeigth = 15;
const mainDivId = "screen";
const gameSpeed = document.getElementById('speed');
const GAMECLASSES = {
  empty: "snake-game-empty",
  apple: "snake-game-apple",
  tailA: "snake-game-tail-appled",
  tailV: "snake-game-tail-v",
  tailG: "snake-game-tail-g",
  tailTL: "snake-game-tail-tl",
  tailTR: "snake-game-tail-tr",
  tailBL: "snake-game-tail-bl",
  tailBR: "snake-game-tail-br",
  tr: "snake-game-tr",
  td: "snake-game-td",
  head: "snake-game-head"
};
const gameStartDirection = "right";
const gameStartHeadPosition = {x:4,y:2};
const gameStartSnakeLen = 4;
const GAMECONTROL = {
  ArrowUp: 'top',
  ArrowDown: 'bottom',
  ArrowLeft: 'left',
  ArrowRight: 'right'
};
const GAMESCOREBOARD = "score";
const GAMEAUTOCHECKBOX = document.getElementById('autocheck');
const SPEEDVALUE = document.getElementById('speedvalue');

const game = {
  scoreboard: document.getElementById(GAMESCOREBOARD),
  snakeLen: gameStartSnakeLen,
  headPosition: gameStartHeadPosition,
  speed: gameSpeed.value,
  div: document.getElementById(mainDivId),
  x: weigth/pWeigth, // ширина в игровых пикселях
  y: height/pHeight, // высота
  direction: gameStartDirection,
  directionOld: gameStartDirection,
  directionCh: false,
  eventSaved: {code:""},
  classes: GAMECLASSES,
  control: GAMECONTROL,


  tails:[],
  directionTransform: {
    right: {x:1,y:0},
    left: {x:-1,y:0},
    top: {x:0,y:-1},
    bottom: {x:0,y:1}
  },
  nextStates: {
      lost:0,
      apple:2,
      free:1
  },



  initial: function gameLoad () {
    for (let i = 0; i<this.y; ++i) {
      tr = document.createElement("div");
      tr.classList += this.classes.tr;
      for (let j = 0; j<this.x; ++j) {
        td = document.createElement("div");
        td.classList += this.classes.td + " " + this.classes.empty;
        tr[j] = td;
        tr.appendChild(td);
      };
      this[i] = tr;
      this.div.appendChild(tr);
    };

    window.addEventListener("keydown", (event) => {this.chengeDirection(event)});

    this.spawnRandomApple();
    document.getElementById('spapbtn').onclick = () => game.spawnRandomApple();

    this.gameRun = true;

    this.div.onclick = null;
    this.update();
  },


  update: function gameUpdate () {
    this.chengeDirection(this.eventSaved);
    this.directionCh = false;
    if (GAMEAUTOCHECKBOX.checked) gameAuto.update();
    if (this.checkNextPos() == this.nextStates.lost) return this.lost();
    if (this.checkNextPos() == this.nextStates.apple) {
      this.snakeLen += 1;
      this.spawnRandomApple();
      this.next().item.classList.replace(this.classes.apple, this.classes.empty);
      this.next().item.appled = true;
    };
    this.scoreboard.innerText = (this.snakeLen - gameStartSnakeLen).toString();
    this.snakeForward();
    this.directionOld = this.direction;
    this.speed = gameSpeed.value;
    SPEEDVALUE.innerText = " " + this.speed + " ";
    if (this.gameRun) setTimeout(() => this.update(), 1024/(2**this.speed));

  },


  spawnRandomApple: function gameSpawnRandomApple () {
    try {
      let emptyCells = document.getElementsByClassName(GAMECLASSES.empty);
    if (!emptyCells.length) {
      return this.win();
    };
    let r = Math.round(Math.random() * emptyCells.length);
    emptyCells[r].classList.replace(this.classes.empty, this.classes.apple);
  } catch (e) {
    console.log(e);
    this.spawnRandomApple();
  }
  },


  checkNextPos: function gameCheckNextPos () {
    next = this.next().item;
    if (!next || next.classList.contains(this.classes.tailV) || next.classList.contains(this.classes.tailG) || next.classList.contains(this.classes.tailTL) || next.classList.contains(this.classes.tailTR) || next.classList.contains(this.classes.tailBL) || next.classList.contains(this.classes.tailBR) || next.classList.contains(this.classes.tailA)) return this.nextStates.lost;
    if (next.classList.contains(this.classes.apple)) return this.nextStates.apple;
    return this.nextStates.free;
  },


  next: function gameGetNextPos () {
    let posNext = {
      x:(this.headPosition.x + this.directionTransform[this.direction].x + this.x) % this.x,
      y:(this.headPosition.y + this.directionTransform[this.direction].y + this.y) % this.y
    };
    return {
      item:this[posNext.y] && this[posNext.y][posNext.x],
      cords:posNext
    };
  },


  snakeForward: function gameSnakeForward () {
    for (let i in this.tails) {
      this.tails[i].life -= 1;
      if (this.tails[i].life <= 0) {
        this.tails[i].classList.replace(this.classes.tailA, this.classes.empty);
        this.tails[i].classList.replace(this.classes.tailV, this.classes.empty);
        this.tails[i].classList.replace(this.classes.tailG, this.classes.empty);
        this.tails[i].classList.replace(this.classes.tailTL, this.classes.empty);
        this.tails[i].classList.replace(this.classes.tailTR, this.classes.empty);
        this.tails[i].classList.replace(this.classes.tailBL, this.classes.empty);
        this.tails[i].classList.replace(this.classes.tailBR, this.classes.empty);
      }
    };

    this.addHead();
    this.tails = this.tails.filter((x) => {return x.life >= 0});
  },


  lost: function gameSnakeLost () {
    this.gameRun = false;
    this.scoreboard.innerText += " lost";
  },

  win: function gameSnakeWin () {

  },


  addHead: function gameAddHead () {
    let oldHead = this[this.headPosition.y][this.headPosition.x];
    if (oldHead) {
      if (oldHead.appled) {
        oldHead.appled = false;
        oldHead.classList.replace(this.classes.head, this.classes.tailA);
      } else if (this.direction == this.directionOld) {
        if (this.direction == 'left' || this.direction == 'right') {
          oldHead.classList.replace(this.classes.head, this.classes.tailG);
        } else {
          oldHead.classList.replace(this.classes.head, this.classes.tailV);
        }
      } else {
        if ((this.direction == 'bottom' && this.directionOld == 'right') || (this.direction == 'left' && this.directionOld == 'top')) {
          oldHead.classList.replace(this.classes.head, this.classes.tailBL);
        } else if ((this.direction == 'bottom' && this.directionOld == 'left') || (this.direction == 'right' && this.directionOld == 'top')) {
          oldHead.classList.replace(this.classes.head, this.classes.tailBR);
        } else if ((this.direction == 'top' && this.directionOld == 'left') || (this.direction == 'right' && this.directionOld == 'bottom')) {
          oldHead.classList.replace(this.classes.head, this.classes.tailTR);
        } else {
          oldHead.classList.replace(this.classes.head, this.classes.tailTL);
        }
      };
      oldHead.life -= 1;
      this.tails.push(oldHead);
    }
    let next = this.next();
    next.item.classList.replace(this.classes.empty, this.classes.head);
    next.item.life = this.snakeLen;
    this.headPosition = next.cords;
  },


  chengeDirection: function controlEventListener (event) {
    if (!this.directionCh && this.control[event.code]) {
      this.directionCh = true;
      let oldDir = this.direction;
      this.direction = this.control[event.code];
      if (this.checkNextPos() == this.nextStates.lost) {this.direction = oldDir; this.directionCh = false;};
    };
    this.eventSaved = event;
  }
}


const gameAuto = {
  speed: gameSpeed/2,
  part: 1,

  update: function autoUpdate () {
    if (this.part == 1) {
      if (game.headPosition.x == game.x-1 && game.headPosition.y == game.y-1) {
        if (game.snakeLen >= game.x*2) {
          this.part = 2
        };
        game.chengeDirection({code: 'ArrowUp'});
      } else if (game.headPosition.x == 0 && game.headPosition.y == game.y-1) {
        game.chengeDirection({code: 'ArrowRight'});
      } else if (game.headPosition.x == 0) {
        game.chengeDirection({code: 'ArrowDown'});
      } else if (game.headPosition.x == game.x-1 && game.headPosition.y == 0) {
        game.chengeDirection({code: 'ArrowLeft'});
      } else if (game.headPosition.x == game.x-1) {
        let e = game[game.headPosition.y];

        let a = false;
        for (let i = 0; i<game.x; ++i) {
          if (e[i].classList.contains(GAMECLASSES.apple)) {
            a = true
          };
        };
        if (a) {
          game.chengeDirection({code: 'ArrowLeft'});
        }

      }
    } else if (this.part == 2) {
      if (game.headPosition.x == game.x-1 && game.headPosition.y == game.y-1) {
        game.chengeDirection({code: 'ArrowUp'});
      } else if (game.headPosition.x == 0 && game.headPosition.y == game.y-1) {
        game.chengeDirection({code: 'ArrowRight'});
      } else if (game.headPosition.y == 0) {
        if (game.headPosition.x % 2 == 0) {
          game.chengeDirection({code: 'ArrowDown'});
        } else {
          game.chengeDirection({code: 'ArrowLeft'});
        }
      } else if (game.headPosition.y == game.y-2) {
        if ((game.headPosition.x % 2 == 0) && game.headPosition.x) {
          game.chengeDirection({code: 'ArrowLeft'});
        } else {
          game.chengeDirection({code: 'ArrowUp'});
        }
      }
    }
  }
}


game.div.onclick = () => {game.initial(); };
