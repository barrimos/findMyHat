class Movement{
  constructor(dir, current, next, cost){
    this.dir = dir;
    this.current = current;
    this.next = next;
  }
  move = (dir)=>{
    if(dir === 'l'){
      if(this.getCurPos.pacman[1] - 1 < 0 || this.wallsIndex.some(wall=>{return wall[0] === this.getCurPos.pacman[0] && wall[1] === this.getCurPos.pacman[1] - 1})){
        return;
      } else if(this.bombIndex.some(bomb=>{return bomb[0] === this.getCurPos.pacman[0] && bomb[1] === this.getCurPos.pacman[1] - 1})){
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] -= 1] = pacman.dead;
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] + 1] = env[3];
        this.isOver = true;
        return this.isOver;
      } else if(this.getCurPos.hatRewards[0] === this.getCurPos.pacman[0] && this.getCurPos.hatRewards[1] === this.getCurPos.pacman[1] - 1) {
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] -= 1] = pacman.win;
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] + 1] = env[3];
        this.isWin = true;
        return this.isWin;
      } else {
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] -= 1] = pacman.l;
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] + 1] = env[3];
      }
    }
    if(dir === 'r'){
      if(this.getCurPos.pacman[1] + 1 > this.board_cols - 1 || this.wallsIndex.some(wall=>{return wall[0] === this.getCurPos.pacman[0] && wall[1] === this.getCurPos.pacman[1] + 1})){
        return;
      } else if(this.bombIndex.some(bomb=>{return bomb[0] === this.getCurPos.pacman[0] && bomb[1] === this.getCurPos.pacman[1] + 1})){
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] += 1] = pacman.dead;
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] - 1] = env[3];
        this.isOver = true;
        return this.isOver;
      } else if(this.getCurPos.hatRewards[0] === this.getCurPos.pacman[0] && this.getCurPos.hatRewards[1] === this.getCurPos.pacman[1] + 1) {
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] += 1] = pacman.win;
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] - 1] = env[3];
        this.isWin = true;
        return this.isWin;
      } else {
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] += 1] = pacman.r;
        this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] - 1] = env[3];
      }
    }
    if(dir === 'd'){
      if(this.getCurPos.pacman[0] + 1 > this.board_rows - 1 || this.wallsIndex.some(wall=>{return wall[0] === this.getCurPos.pacman[0] + 1 && wall[1] === this.getCurPos.pacman[1]})){
        return;
      } else if(this.bombIndex.some(bomb=>{return bomb[0] === this.getCurPos.pacman[0] + 1 && bomb[1] === this.getCurPos.pacman[1]})){
        this.stage[this.getCurPos.pacman[0] += 1][this.getCurPos.pacman[1]] = pacman.dead;
        this.stage[this.getCurPos.pacman[0] - 1][this.getCurPos.pacman[1]] = env[3];
        this.isOver = true;
        return this.isOver;
      } else if(this.getCurPos.hatRewards[0] === this.getCurPos.pacman[0] + 1 && this.getCurPos.hatRewards[1] === this.getCurPos.pacman[1]) {
        this.stage[this.getCurPos.pacman[0] += 1][this.getCurPos.pacman[1]] = pacman.win;
        this.stage[this.getCurPos.pacman[0] - 1][this.getCurPos.pacman[1]] = env[3];
        this.isWin = true;
        return this.isWin;
      } else {
        this.stage[this.getCurPos.pacman[0] += 1][this.getCurPos.pacman[1]] = pacman.d;
        this.stage[this.getCurPos.pacman[0] - 1][this.getCurPos.pacman[1]] = env[3];
      }
    }
    if(dir === 'u'){
      if(this.getCurPos.pacman[0] - 1 < 0 || this.wallsIndex.some(wall=>{return wall[0] === this.getCurPos.pacman[0] - 1 && wall[1] === this.getCurPos.pacman[1]})){
        return;
      } else if(this.bombIndex.some(bomb=>{return bomb[0] === this.getCurPos.pacman[0] - 1 && bomb[1] === this.getCurPos.pacman[1]})){
        this.stage[this.getCurPos.pacman[0] -= 1][this.getCurPos.pacman[1]] = pacman.dead;
        this.stage[this.getCurPos.pacman[0] + 1][this.getCurPos.pacman[1]] = env[3];
        this.isOver = true;
        return this.isOver;
      } else if(this.getCurPos.hatRewards[0] === this.getCurPos.pacman[0] - 1 && this.getCurPos.hatRewards[1] === this.getCurPos.pacman[1]) {
        this.stage[this.getCurPos.pacman[0] -= 1][this.getCurPos.pacman[1]] = pacman.win;
        this.stage[this.getCurPos.pacman[0] + 1][this.getCurPos.pacman[1]] = env[3];
        this.isWin = true;
        return this.isWin;
      } else {
        this.stage[this.getCurPos.pacman[0] -= 1][this.getCurPos.pacman[1]] = pacman.u;
        this.stage[this.getCurPos.pacman[0] + 1][this.getCurPos.pacman[1]] = env[3];
      }
    }
  }
}

module.exports = { Movement }