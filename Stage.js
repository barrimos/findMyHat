const utils = require('./Utils');
// Pacman set
class Pacman{
  constructor(){
    this.r = '►';
    this.l = '◄';
    this.d = '▼';
    this.u = '▲';
    this.win = '⚑';
    this.dead = '✝';
    this.hp = 10;
  }
}

const envLimit = {
  // .77, .11, .12   when stage's size rows * cols more than or equals 16 to 60
  // .7, .15, .15    when stage's size rows * cols more than or equals 61 to 120
  // .6, .15, .23    when stage's size rows * cols more than or equals 121
  // less than 16 it's depend on pathway on processing create Stage.
  pathway: [.77, .7, .6],
  walls: [.11, .15, .17],
  bombs: [.12, .15, .23],
};

class Stage{
  constructor(rows, cols, start_x, start_y){
    this.is_win = false;
    this.is_over = false;
    this.rows = rows || 3;
    this.cols = cols || 3;

    this.pacman = new Pacman();
    this.stage = new Array;
    this.bombs = new Array;
    this.walls = new Array;
    this.pathway = new Array;

    this.env = {
      pathway: '.',
      walls: '■',
      bombs: 'x',
      goal: '♦️',
    };

    this.envCount = {
      pathway: 0,
      walls: 0,
      bombs: 0,
    }
    
    this.curr_x = start_x || 0;
    this.curr_y = start_y || 0;
    this.goal_x = this.rows - 1;
    this.goal_y = this.cols - 1;

    this.neighbors = new Array;
    this.queue = new Array;
    this.visited = new Array;
    this.stack = new Array;

    this.came_from = new Object;
    this.next = new Array;
    this.cost_so_far = 1;
    this.heuristic = 0;
    this.manhattan_distance = new Array;
    this.path_finder = new Array;

    this.isSolution = false;
    this.solution_stage = new Array;
    this.createStage();
  }

  minSize = () => {
    if(this.rows < 3 || this.cols < 3){
      throw new Error('One of stage size can not be less than 3.');
    }
    if(this.rows > 20 || this.cols > 20){
      throw new Error('One of stage size can not be over than 20.');
    }
  }

  checkPosition = () => {
    if(this.curr_x > this.rows - 1 || this.curr_y > this.cols - 1){
      throw new Error('Pacman\'s position out of stage size.');
    }
  }

  getEnvironment = () => {
    return this.envCount;
  }

  randomEnv = () => {
    let _ = ['walls', 'bombs'];
    let r = Math.floor(Math.random() * _.length);
    return _[r];
  }

  /**
   * 
   * @param {*} axis check what environment on this cell return object key.
   */
  checkEnvironmentKey = axis => {
    let [x, y] = axis;
    let envKey;
    Object.keys(this.env).forEach((_key) => {
      if(this.stage[x][y] === this.env[_key]){
        envKey = _key;
      }
    });
    return envKey;
  }

  createStage = () => {
    this.minSize();
    this.checkPosition();

    // create 0 map
    for(let i = 0; i < this.rows; i++){
      this.stage.push([]);
      for(let j = 0; j < this.cols; j++){
        // Display stage
        this.stage[i].push(this.env.pathway);
      }
    }
    this.traveller();

    // // change walls and bombs to pathway because the first stage that generated walls and bombs is too much,
    // // that made the only pathway reach to goal.
    // // control limit at objectLimit by 1 stand for 100%
    this.changeToPathway();

    this.settingStartGoal();
  }

  traveller = (notLookingFor, solution = false) => {
    this.isSolution = solution;
    if(this.isSolution){
      this.solution_stage = [...this.stage];
      while(true){
        if((this.curr_x === this.goal_x) && (this.curr_y === this.goal_y)){
          this.path_finder.push([this.curr_x, this.curr_y]);
          this.solution_stage[this.curr_x][this.curr_y] = this.pacman.win;
          break;
        }

        this.solution_stage[this.curr_x][this.curr_y] = this.pacman.r;

        // this.neighborIndex([this.curr_x, this.curr_y], notLookingFor);
        this.neighbors = neighborIndex(this, [this.curr_x, this.curr_y], notLookingFor);

        if(this.neighbors.length === 0){
          if(this.stack.length === 0){
            break;
          }
          [this.curr_x, this.curr_y] = this.stack.pop();
        } else {
          this.path_finder.push([this.curr_x, this.curr_y]);
          this.stack.push([this.curr_x, this.curr_y]);
          let r = Math.floor(Math.random() * this.neighbors.length);
          [this.curr_x, this.curr_y] = this.neighbors[r];
        }
      }
    } else {
      while(true){
        this.envCount.pathway++;
        this.pathway.push([this.curr_x, this.curr_y]);
        // add position to visited
        this.visited.push([this.curr_x, this.curr_y]);

        // at current position check neighbors's index
        // this.neighborIndex([this.curr_x, this.curr_y], '');
        this.neighbors = neighborIndex(this, [this.curr_x, this.curr_y], '');

        if(this.neighbors.length === 0){
          if(this.queue.length === 0){
            break;
          }
          // random evironment assign to stage
          // why inside in neighbors === 0 because
          // when current position searching neighbors its that mean you know that neighbors point too
          // and the neighbor point is stored in this.queue and the algorithm is set to ignore the point stored in the queue.
          // it's that mean when coming to use backtracking that's mean around this point all of them was found
          // so set in queue to environment instead.
          let r = this.randomEnv();
          this.stage[this.curr_x][this.curr_y] = this.env[r];
          this.pathway = this.pathway.filter(index => {
            return JSON.stringify(index) !== JSON.stringify([this.curr_x, this.curr_y]);
          });
          this.envCount.pathway--;
  
          if(r === 'walls'){
            this.envCount.walls++;
            this.walls.push([this.curr_x, this.curr_y]);
          }
          if(r === 'bombs'){
            this.envCount.bombs++;
            this.bombs.push([this.curr_x, this.curr_y]);
          }
          // use first queue to check backtracking
          [this.curr_x, this.curr_y] = this.queue.shift();
  
        } else {
          // random index from this.neighbors
          // select next move and set it to be current position
          let r = Math.floor(Math.random() * this.neighbors.length);
          [this.curr_x, this.curr_y] = this.neighbors[r];
          
          // otherwise remove selected move then add remains to queue
          this.neighbors.splice(r, 1);
          this.neighbors.forEach(item => {
            // this item that input to queue some item it may become to obstacle.
            this.queue.push(item);
          });
        }
      }
    }
  }


  settingStartGoal = () => {
    // clone and clear visited
    // reason to clear the visited is at neighborsIndex() code will not check the neighbors that have already been found.
    // in this function need to check all neighbos so that have to clear visited like a never found before.
    // but still need use the data so clone the data and clear it.
    let clone = Object.assign(this.visited);
    clone = clone.filter(index => {
      return JSON.stringify(index) !== JSON.stringify([0, 0]); // filter pacman's position out.
    });
    this.visited = [];
    while(true){
      // random new goal's position.
      let rand = Math.floor(Math.random() * clone.length);
      let new_value = clone[rand];

      [this.goal_x, this.goal_y] = new_value;

      // check neighbors's goal
      // this.neighborIndex([this.goal_x, this.goal_y], this.env.pathway);
      this.neighbors = neighborIndex(this, [this.goal_x, this.goal_y], this.env.pathway);

      let too_close;
      if(this.rows > this.cols || this.rows === this.cols){
        too_close = this.goal_x > Math.floor(this.rows * .4) && this.goal_y > Math.floor(this.cols * .4);
      } else if(this.cols > this.rows){
        too_close = this.goal_y > Math.floor(this.cols * .4) && this.goal_x > Math.floor(this.rows * .4);
      }

      // if that neighbors's position was not pathway 2 or more continue loop again
      if((this.neighbors.length <= 2) && too_close){
        break;
      }
    }

    // before setting new position for goal, check what environment on new axis cell for filter that on array and counting again.
    let key = this.checkEnvironmentKey([this.goal_x, this.goal_y]);

    // switch environment
    this.stage[this.goal_x][this.goal_y] = this.env.goal;

    // filter out if key is pathway do not filter out.
    if(key !== 'pathway'){
      this[key] = this[key].filter(index => {
        return JSON.stringify(index) !== JSON.stringify([this.goal_x, this.goal_y]);
      });
      this.envCount.pathway++;
      this.envCount[key]--;
    }

    // setting start position and [curr_x, curr_y] to [0, 0] for start game
    [this.curr_x, this.curr_y] = [0, 0];
    this.stage[this.curr_x][this.curr_y] = this.pacman.r;
  }
  
  changeToPathway = () => {
    let _env = ['walls', 'bombs'];
    _env.forEach(obj => {
      let rate = this.rows * this.cols >= 121 ? envLimit[obj][2] : this.rows * this.cols >= 61 && this.rows * this.cols <= 120 ? envLimit[obj][1] : this.rows * this.cols >= 16 && this.rows * this.cols <= 60 ? envLimit[obj][0] : 1;

      // loop until walls or bombs less than rate
      while(this.envCount[obj] > Math.ceil((this.rows * this.cols) * rate)){
        // change walls or bombs to pathway
        let rand = Math.floor(Math.random() * this.envCount[obj]);
        this.stage[this[obj][rand][0]][this[obj][rand][1]] = this.env.pathway;
  
        // push index into pathway before filter out from that array.
        this.pathway.push([this[obj][rand][0], this[obj][rand][1]]);
  
        // filter walls and bombs out from that array
        this[obj] = this[obj].filter(index => {
          return JSON.stringify(index) !== JSON.stringify([this[obj][rand][0], this[obj][rand][1]]);
        });
  
        // update count
        this.envCount[obj]--;
        this.envCount.pathway++;
      }
    });
  }
}

// const game = new Stage();
// for(let [...stage] of game.stage){
//   console.log([...stage].join(' '));
// }

// // automatic random travelling to goal
// game.traveller(`1|${game.env.bombs}|${game.env.walls}`, true);
// for(let [...stage] of game.solution_stage){
//   console.log([...stage].join(' '));
// }

module.exports = { Stage, Pacman };