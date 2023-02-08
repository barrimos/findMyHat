const utils = require('./Utils');
const { Queue } = require('./Queue');
const queue = new Queue();

class Pathfinding{
  constructor(game, move){
    this.game = game;

  }
  bfs = () => {
    console.log(queue);
  }
  dfs = () => {

  }
  dijkstra = () => {

  }
  greedybfs = () => {

  }
  aStar = () => {

  }
}

module.exports = { Pathfinding };