class Movement{
  constructor(){
    this.temp = undefined;
  }
  isWinOrDie = (game, next) => {
    if(JSON.stringify(game.bombs).includes(JSON.stringify(next)) && game.pacman.hp === 0){
      game.is_over = true;
      game.stage[next[0]][next[1]] = game.pacman.dead;
      return;
    }
    if(next[0] === game.goal_x && next[1] === game.goal_y){
      game.is_win = true;
      game.stage[next[0]][next[1]] = game.pacman.win;
      return;
    }
  }
  passable = (game, next) => {
    // if next is walls do nothing and return false.
    if(JSON.stringify(game.walls).includes(JSON.stringify(next)) || next[0] > game.rows - 1 || next[0] < 0 || next[1] > game.cols - 1 || next[1] < 0){
      return false;
    } else {
      // if next is bombs it's passable but damage to hp.
      if(JSON.stringify(game.bombs).includes(JSON.stringify(next))){
        this.isWinOrDie(game, next);
        game.pacman.hp -= 5;
      }
      return true;
    }
  }

  // check walls first then move then check isWinOrDie
  move = (game, dir, show_path = false) => {
    const stage = game.stage;
    let d;

    // check next
    let current = [game.curr_x, game.curr_y];
    let next;
    if((Array.isArray(dir) && dir.length === 2)){
      if((dir[0] > game.curr_x) && (dir[1] === game.curr_y)){
        d = 'd';
      }
      if((dir[0] === game.curr_x) && (dir[1] > game.curr_y)){
        d = 'r';
      }
      if((dir[0] < game.curr_x) && (dir[1] === game.curr_y)){
        d = 'u';
      }
      if((dir[0] === game.curr_x) && (dir[1] < game.curr_y)){
        d = 'l';
      }
    } else {
      d = dir.toLowerCase();
    }
    switch(d){
      case 'r': next = [current[0], current[1] + 1];
      break;
      case 'l': next = [current[0], current[1] - 1];
      break;
      case 'u': next = [current[0] - 1, current[1]];
      break;
      case 'd': next = [current[0] + 1, current[1]];
      break;
      default: return 'You select wrong direction.';
    }

    let isPassable = this.passable(game, next);

    if(isPassable && !show_path){
      if(this.temp === undefined){
        this.temp = game.env.pathway;
      }
      stage[current[0]][current[1]] = this.temp;
    }

    if(isPassable){
      this.temp = stage[next[0]][next[1]];
    }

    if(d === 'r' && isPassable){
      game.curr_y += 1;
      stage[next[0]][next[1]] = game.pacman.r;
    }
    if(d === 'l' && isPassable){
      game.curr_y -= 1;
      stage[next[0]][next[1]] = game.pacman.l;
    }
    if(d === 'u' && isPassable){
      game.curr_x -= 1;
      stage[next[0]][next[1]] = game.pacman.u;
    }
    if(d === 'd' && isPassable){
      game.curr_x += 1;
      stage[next[0]][next[1]] = game.pacman.d;
    }
    this.isWinOrDie(game, next);
  }
}

module.exports = { Movement }