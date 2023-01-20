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

const renderStage = (game) => {
  for(let [...stage] of game){
    console.log([...stage].join(' '));
  }
}


(function start(){

  const game = new Stage();
  const move = new Movement(game);
  const queue = new Queue();
  let command, method, done = false;

  renderStage(game.stage);

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
                    '5. A star\n'+
                    '6. Random walk'
                  );
                  method = prompt('>>>> ');
                  switch(method){
                    case '1': dijkstra(game, move, queue);
                              done = true;
                    break;
                    case '2': bfs(game, move, queue);
                              done = true;
                    break;
                    case '3': dfs(game, move, queue);
                              done = true;
                    break;
                    case '4': greedybfs(game, move, queue);
                              done = true;
                    break;
                    case '5': aStar(game, move, queue);
                              done = true;
                    break
                    case '6': game.traveller(`1|${game.env.bombs}|${game.env.walls}`, true);
                              done = true;
                    break;
                    default: break;
                  };
        break;
        case '3': start();
        return;
        default: return;
      }
    }

    if(done){
      renderStage(game.stage);
      break;
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
    renderStage(game.stage);

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