const { Movement } = require('./Movement');
const { Queue } = require('./Queue');
const { bfs } = require('./pathfinding/bfs');
const { greedybfs } = require('./pathfinding/greedybfs');
const { dfs } = require('./pathfinding/dfs');
const { dijkstra } = require('./pathfinding/dijkstra');
const { aStar } = require('./pathfinding/aStar');

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

// Environments
const env = {
  pathway: '.',
  walls: '■',
  bombs: 'x',
  goal: '♦️',
};

// Amount total of objects
const envCount = {
  pathway: 0,
  walls: 0,
  bombs: 0,
};

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
  constructor(rows, cols, pacman_x, pacman_y, goal_x, goal_y){
    this.is_win = false;
    this.is_over = false;
    this.rows = rows || 9;
    this.cols = cols || 9;

    this.pacman = new Pacman();
    this.stage = new Array;
    this.bombs = new Array;
    this.walls = new Array;
    this.pathway = new Array;
    
    this.curr_x = pacman_x || 0;
    this.curr_y = pacman_y || 0;
    this.goal_x = goal_x || this.rows - 1;
    this.goal_y = goal_y || this.cols - 1;

    this.neighbors = new Array;
    this.queue = new Array;
    this.visited = new Array;
    this.stack = new Array;

    this.came_from = new Array;
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
      throw new Error('One of stage\'s size can not be less than 3.');
    }
    if(this.rows > 20 || this.cols > 20){
      throw new Error('One of stage\'s size can not be over than 20.');
    }
  }

  getEnvironment = () => {
    return { env, envCount, envLimit };
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
    Object.keys(env).forEach((_key) => {
      if(this.stage[x][y] === env[_key]){
        envKey = _key;
      }
    });
    return envKey;
  }

  createStage = () => {
    this.minSize();
    
    // create 0 map
    for(let i = 0; i < this.rows; i++){
      this.stage.push([]);
      // this.manhattan_distance.push([]);
      for(let j = 0; j < this.cols; j++){
        // Display stage
        this.stage[i].push(env.pathway);
        // this.manhattan_distance[i].push(Math.abs(this.curr_x - i) + Math.abs(this.curr_y - j));
      }
    }
    // travel the map and change '·' to 1 when visited
    this.traveller('1');

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


        this.neighborIndex([this.curr_x, this.curr_y], notLookingFor);

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
        envCount.pathway++;
        this.pathway.push([this.curr_x, this.curr_y]);
        // add position to visited
        this.visited.push([this.curr_x, this.curr_y]);
  
        // at current position check neighbors's index
        this.neighborIndex([this.curr_x, this.curr_y], notLookingFor);

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
          this.stage[this.curr_x][this.curr_y] = env[r];
          this.pathway = this.pathway.filter(index => {
            return JSON.stringify(index) !== JSON.stringify([this.curr_x, this.curr_y]);
          });
          envCount.pathway--;
  
          if(r === 'walls'){
            envCount.walls++;
            this.walls.push([this.curr_x, this.curr_y]);
          }
          if(r === 'bombs'){
            envCount.bombs++;
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
    let clone = Object.assign(this.visited);
    clone.shift();
    this.visited = [];
    // by random select from visited position. visited store all cell that founded from traveller step.
    // why not use pathway because in this step map chance to decrease obstacle for 1 cell.
    while(true){
      // random new goal's position.
      let rand = Math.floor(Math.random() * clone.length);
      let new_value = clone[rand];

      [this.goal_x, this.goal_y] = new_value;

      // check neighbors's goal
      this.neighborIndex([this.goal_x, this.goal_y], env.pathway);

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
    this.stage[this.goal_x][this.goal_y] = env.goal;

    // filter out if key is pathway do not filter out.
    if(key !== 'pathway'){
      this[key] = this[key].filter(index => {
        return JSON.stringify(index) !== JSON.stringify([this.goal_x, this.goal_y]);
      });
      envCount.pathway++;
      envCount[key]--;
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
      while(envCount[obj] > Math.ceil((this.rows * this.cols) * rate)){
        // change walls or bombs to pathway
        let rand = Math.floor(Math.random() * envCount[obj]);
        this.stage[this[obj][rand][0]][this[obj][rand][1]] = env.pathway;
  
        // push index into pathway before filter out from that array.
        this.pathway.push([this[obj][rand][0], this[obj][rand][1]]);
  
        // filter walls and bombs out from that array
        this[obj] = this[obj].filter(index => {
          return JSON.stringify(index) !== JSON.stringify([this[obj][rand][0], this[obj][rand][1]]);
        });
  
        // update count
        envCount[obj]--;
        envCount.pathway++;
      }
    });
  }

  /**
   * 
   * @param {*} axis                  position want to check the neighbors parameter take an array [x, y].
   * @param {*} notLooking            `Default is 1` find the neighbors that `NOT` equal to argument
   * @param {*} is_all_dir            `true` check all cell around itself. `Default is false` check only "up right down left".
   */
  // eg. current position is [1, 1]
  // you want to check the neighbors only up, side, down,
  // and not looking for pathway.
  // 
  //  □ □ ×
  //  · · ·
  //  × □ ×
  // 
  // neighborIndex([1, 1], '·');
  // return [[0, 1], [2, 1]]
  // 
  // neighborIndex([1, 1], '·', true);
  // return [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]]
  //
  // not looking for walls or bombs.
  // neighborIndex([1, 1], '×|□');
  // return [[1, 0], [1, 2]]
  //
  // not looking for pathway.
  // neighborIndex([1, 1], '·');
  // return [[0, 1], [2, 1]]
  neighborIndex = (axis, notLooking, is_all_dir = false) => {
    this.neighbors = [];
    let [curr_x, curr_y] = axis;

    // start - start loop at rows 0 if curr_x is top of stage, otherwise start at row position - 1 if not.
    // loop - if rows is top rows and bottom rows that mean just 2 loops is enough. and other 3 loops.
    let start = curr_x === 0 ? 0 : curr_x - 1;
    let loop = curr_x === 0 ? 2 : curr_x === this.rows - 1 ? 2 : 3;

    for(let i = 0; i < loop; i++){
      let all_directions = is_all_dir ? true : start + i === curr_x;

      // delete all space and change to string for check if that item includes in visited, queue or not.
      let q = JSON.stringify(this.queue);
      let v = JSON.stringify(this.visited);
      let up = JSON.stringify([start + i, curr_y - 1]);
      let side = JSON.stringify([start + i, curr_y]);
      let down = JSON.stringify([start + i, curr_y + 1]);
      let stage;

      
      if(curr_y - 1 >= 0 && all_directions){
        stage = this.isSolution ? this.solution_stage[start + i][curr_y - 1] : this.stage[start + i][curr_y - 1];
        if(!notLooking.includes(stage) && (!this.isSolution ? !q.includes(up) && !v.includes(up) : true)){
          this.neighbors.push([start + i, curr_y - 1]);
        }
      }
      if(start + i !== curr_x){
        stage = this.isSolution ? this.solution_stage[start + i][curr_y] : this.stage[start + i][curr_y];
        if(!notLooking.includes(stage) && (!this.isSolution ? !q.includes(side) && !v.includes(side) : true)){
          this.neighbors.push([start + i, curr_y]);
        }
      }
      if(curr_y + 1 < this.cols && all_directions){
        stage = this.isSolution ? this.solution_stage[start + i][curr_y + 1] : this.stage[start + i][curr_y + 1];
        if(!notLooking.includes(stage) && (!this.isSolution ? !q.includes(down) && !v.includes(down) : true)){
          this.neighbors.push([start + i, curr_y + 1]);
        }
      }
    }
  }
}

const game = new Stage();
for(let [...stage] of game.stage){
  console.log([...stage].join(' '));
}
// console.log(game.pathway);

// // automatic random travelling to goal
// game.traveller(`1|${env.bombs}|${env.walls}`, true);
// for(let [...stage] of game.solution_stage){
//   console.log([...stage].join(' '));
// }

module.exports = { Stage, Pacman };