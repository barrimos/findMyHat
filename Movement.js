class Movement{
  constructor(game){
    this.rows = game.rows;
    this.cols = game.cols;
    this.env = game.env;
    this.pacman = game.pacman;
    this.current = [game.curr_x, game.curr_y];
    this.goal = [game.goal_x, game.goal_y];
    this.walls = game.walls;
    this.bombs = game.bombs;
  }
  isWinOrDie = (game, next) => {
    if(JSON.stringify(this.bombs).includes(JSON.stringify(next)) && game.pacman.hp === 0){
      game.is_over = true;
      return;
    }
    if(next[0] === this.goal[0] && next[1] === this.goal[1]){
      game.is_win = true;
      return;
    }
  }
  passable = (game, next) => {
    // if next is walls do nothing and return.
    if(JSON.stringify(this.walls).includes(JSON.stringify(next)) || next[0] > this.rows - 1 || next[0] < 0 || next[1] > this.cols - 1 || next[1] < 0){
      return false;
    } else {
      if(JSON.stringify(this.bombs).includes(JSON.stringify(next))){
        this.isWinOrDie(game, next);
        game.pacman.hp -= 5;
      }
      return true;
    }
  }

  // check walls first then move then check isWinOrDie
  move = (game, dir) => {
    const stage = game.stage;

    // for check next
    let current = [game.curr_x, game.curr_y];
    let next;
    switch(dir){
      case 'r': next = [current[0], current[1] + 1];
        break;
      case 'l': next = [current[0], current[1] - 1];
        break;
      case 'u': next = [current[0] - 1, current[1]];
        break;
      case 'd': next = [current[0] + 1, current[1]];
        break;
      default: return;
    }

    let isPassable = this.passable(game, next);
    if(isPassable){
      stage[current[0]][current[1]] = this.env.pathway;
      stage[next[0]][next[1]] = this.pacman.r;
    }
    if(dir === 'r' && isPassable){
      game.curr_y += 1;
    }
    if(dir === 'l' && isPassable){
      game.curr_y -= 1;
    }
    if(dir === 'u' && isPassable){
      game.curr_x -= 1;
    }
    if(dir === 'd' && isPassable){
      game.curr_x += 1;
    }
    this.isWinOrDie(game, next);
  }
}

module.exports = { Movement }