const utils = require('./Utils');
const { Queue } = require('./Queue');
const { Movement } = require('./Movement');
const move = new Movement();
const frontier = new Queue();
const came_from = {};
const cost_so_far = {};
let piority;
let i = 0;

class Pathfinding{
  constructor(game){
    this.game = game;
    this.done = false;
    this.path = [];
  }
  reconstructPath = (came_from, start, goal) => {
    let current = goal;
    while(JSON.stringify(current) !== JSON.stringify(start)){
      this.path.push(current);
      current = came_from[`[${current}]`];
    }
    this.path.push(start);
    this.path.reverse();
    for(let i = 0; i < this.path.length; i++){
      move.move(this.game, this.path[i], true);
    }
    return true;
  }
  cost = (from_node, to_node) => {
    return this.game.weights[to_node];
  }
  heuristic = (a, b) => {
    let [x1, y1] = a;
    let [x2, y2] = b;
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
  isGoal = current => {
    if((current[0] === this.game.goal_x) && (current[1] === this.game.goal_y)){
      return this.reconstructPath(came_from, [this.game.curr_x, this.game.curr_y], [this.game.goal_x, this.game.goal_y]);
    } else {
      return false;
    }
  }
  bfs = () => {
    frontier.put([this.game.curr_x, this.game.curr_y]);
    came_from[`[${this.game.curr_x},${this.game.curr_y}]`] = null;
    
    while(!frontier.empty()){
      let current = frontier.get();


      if(this.isGoal(current)){
        break;
      }

      let neighbors = utils.neighborIndex(this.game, current, `${this.game.env.bombs}|${this.game.env.walls}`);
      for(let next of neighbors){
        if(came_from[`[${next}]`] === undefined){
          frontier.put(next);
          came_from[`[${next}]`] = current;
          // this.game.stage[next[0]][next[1]] = i;
          // i++;
        }
      }
    }
    this.done = true;
  }
  greedy_bfs = () => {
    frontier.put([this.game.curr_x, this.game.curr_y]);
    came_from[`[${this.game.curr_x},${this.game.curr_y}]`] = null;

    while(!frontier.empty()){
      let current = frontier.get();

      if(this.isGoal(current)){
        break;
      }

      let neighbors = utils.neighborIndex(this.game, current, `${this.game.env.bombs}|${this.game.env.walls}`);
      for(let next of neighbors){
        if(came_from[`[${next}]`] === undefined){
          piority = this.heuristic([this.goal_x, this.goal_y], next)
          frontier.insert(piority, next);
          came_from[`[${next}]`] = current;
          // this.game.stage[next[0]][next[1]] = i;
          // i++;
        }
      }
    }
    this.done = true;
  }

  // dfs = () => {}

  dijkstra = () => {
    frontier.insert(0, [this.game.curr_x, this.game.curr_y]);
    came_from[`[${this.game.curr_x},${this.game.curr_y}]`] = null;
    cost_so_far[`[${this.game.curr_x},${this.game.curr_y}]`] = 0;

    while(!frontier.empty()){
      let current = frontier.get();

      if(this.isGoal(current)){
        break;
      }

      let neighbors = utils.neighborIndex(this.game, current, `${this.game.env.bombs}|${this.game.env.walls}`);
      for(let next of neighbors){
        let new_cost = cost_so_far[JSON.stringify(current)] + this.cost(JSON.stringify(current), JSON.stringify(next));
        if((came_from[`[${next}]`] === undefined) || (new_cost < cost_so_far[JSON.stringify(next)])){
          cost_so_far[JSON.stringify(next)] = new_cost;
          piority = new_cost;
          frontier.insert(piority, next);
          came_from[`[${next}]`] = current;
          // this.game.stage[next[0]][next[1]] = i;
          // i++;
        }
      }
    }
    this.done = true;
  }
  aStar = () => {
    frontier.insert(0, [this.game.curr_x, this.game.curr_y]);
    came_from[`[${this.game.curr_x},${this.game.curr_y}]`] = null;
    cost_so_far[`[${this.game.curr_x},${this.game.curr_y}]`] = 0;

    while(!frontier.empty()){
      let current = frontier.get();

      if(this.isGoal(current)){
        break;
      }

      let neighbors = utils.neighborIndex(this.game, current, `${this.game.env.bombs}|${this.game.env.walls}`);
      for(let next of neighbors){
        let new_cost = cost_so_far[JSON.stringify(current)] + this.cost(JSON.stringify(current), JSON.stringify(next));
        if((came_from[`[${next}]`] === undefined) || (new_cost < cost_so_far[JSON.stringify(next)])){
          cost_so_far[JSON.stringify(next)] = new_cost;
          piority = new_cost + this.heuristic([this.game.goal_x, this.game.goal_y], next);
          frontier.insert(piority, next);
          came_from[`[${next}]`] = current;
          // this.game.stage[next[0]][next[1]] = i;
          // i++;
        }
      }
    }
    this.done = true;
  }
}

module.exports = { Pathfinding };