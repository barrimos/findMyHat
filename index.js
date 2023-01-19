const prompt = require("prompt-sync")();
const { bfs } = require('./pathfinding/bfs');
const { greedybfs } = require('./pathfinding/greedybfs');
const { dfs } = require('./pathfinding/dfs');
const { dijkstra } = require('./pathfinding/dijkstra');
const { aStar } = require('./pathfinding/aStar');
const { Movement } = require('./Movement');
const { Stage, Pacman } = require('./Stage');
const { Queue } = require('./Queue');

let menu = true;

(function start(){

  const game = new Stage();
  const move = new Movement(game);
  let command, method;

  for(let [...stage] of game.stage){
    console.log([...stage].join(' '));
  }

  console.log('Start pacman', [game.curr_x, game.curr_y]);
  console.log('Finish goal', [game.goal_x, game.goal_y]);
  console.log(game.envCount);

  while(!game.is_over){
    // Input direction
    // r => right
    // l => left
    // d => down
    // u => up
    // ur => upRight
    // ul => upLeft
    // dr => downRight
    // dl => downLeft
    
    // menu
    // command
    // 1 => play
    // 2 => auto(automatic path finding)
    // 3 => restart
    // 4 => exit
    
    // menu => open menu
    // status => display your status

    if(menu){
      console.log('Select command: \n'+
      '1. play\n'+
      '2. auto\n'+
      '3. restart\n'+
      '4. exit');
      command = prompt('>>>> ');
      switch(command){
        case '1': menu = false;
        break;
        case '2': console.log('Which Algorithm do you want to use: \n'+
                    '1. Dijkstra\n'+
                    '2. Breath first search\n'+
                    '3. Depth first search\n'+
                    '4. Greedy breath first search\n'+
                    '5. A star'
                  );
                  method = prompt('>>>> ');
                  switch(method){
                    case '1': console.log('Dijkstra');
                    break;
                    case '2': console.log('Breath first search');
                    break;
                    case '3': console.log('Depth first search');
                    break;
                    case '4': console.log('Greedy breath first search');
                    break;
                    case '5': console.log('A star');
                    break
                    default: break;
                  };
        break;
        case '3': start();
        return;
        default: return;
      }
    }

    command = prompt('Select direction to move: ');

    if(command === 'menu'){
      menu = true;
      continue;
    }

    if(command === 'status'){
      console.log('pacman\'s hp: ', game.pacman.hp);
      continue;
    }

    // Game system process
    move.move(game, command);

    // Render update stage
    for(let [...stage] of game.stage){
      console.log([...stage].join(' '));
    }

    // If over
    if(game.is_over){
      console.log('TOOOOOOM!!! YOU\'RE DEAD');
      break;
    }

    //if win
    if(game.is_win){
      console.log('CONGRATULATION!!!');
      break;
    }
  }
})();