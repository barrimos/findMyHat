class Movement{
  constructor(game){
    this.rows = game.rows;
    this.cols = game.cols;
    this.env = game.env;
    this.pacman = game.pacman;
  }
  isWinOrDie = (stage, current) => {
    if(JSON.stringify(stage.bombs).includes(JSON.stringify(current))){
      stage.is_over = true;
      return;
    }
    if(current[0] === stage.goal_x && current[1] === stage.goal_y){
      stage.is_win = true;
      return;
    }
  }
  passable = (next, walls, bombs) => {
    // if next is walls do nothing and return.
    if(JSON.stringify(walls).includes(JSON.stringify(next)) || next[0] > this.rows - 1 || next[0] < 0 || next[1] > this.cols - 1 || next[1] < 0){
      return false;
    } else {
      return true;
    }
  }

  // check walls first then move then check isWinOrDie
  move = (game, stage, bombs, walls, current, dir) => {
    if(dir === 'r'){
      if(this.passable([current[0], current[1] + 1], walls, bombs)){
        stage[current[0]][current[1]] = this.env.pathway;
        stage[current[0]][current[1] + 1] = this.pacman.r;
        game.curr_y += 1;
      }
      this.isWinOrDie(game, [current[0], current[1] + 1]);
    }
    if(dir === 'l'){
      if(this.passable([current[0], current[1] - 1], walls, bombs)){
        stage[current[0]][current[1]] = this.env.pathway;
        stage[current[0]][current[1] - 1] = this.pacman.r;
        game.curr_y -= 1;
      }
      this.isWinOrDie(game, [current[0], current[1] - 1]);
    }
    if(dir === 'u'){
      if(this.passable([current[0] - 1, current[1]], walls, bombs)){
        stage[current[0]][current[1]] = this.env.pathway;
        stage[current[0] - 1][current[1]] = this.pacman.r;
        game.curr_x -= 1;
      }
      this.isWinOrDie(game, [current[0] - 1, current[1]]);
    }
    if(dir === 'd'){
      if(this.passable([current[0] + 1, current[1]], walls, bombs)){
        stage[current[0]][current[1]] = this.env.pathway;
        stage[current[0] + 1][current[1]] = this.pacman.r;
        game.curr_x += 1;
      }
      this.isWinOrDie(game, [current[0] + 1, current[1]]);
    }
  }
}

module.exports = { Movement }