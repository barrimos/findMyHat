const prompt = require("prompt-sync")();
const { Pacman } = require('./Pacman');
const { Stage } = require('./Stage');

const game = new Pacman();

for(let [...stage] of game.stage){
  console.log([...stage].join(' '));
}

console.log('Start pacman', [game.curr_x, game.curr_y]);
console.log('Finish goal', [game.goal_x, game.goal_y]);
console.log(game.getEnvironment().envCount);


(function start(condition){
  if(condition === 'exit'){
    return;
  }
  const game = new Pacman();

  for(let [...stage] of game.stage){
    console.log([...stage].join(' '));
  }

  console.log('Start pacman', [game.curr_x, game.curr_y]);
  console.log('Finish goal', [game.goal_x, game.goal_y]);
  console.log(Pacman.envCount);

  while(!game.is_over){
    // Input direction
    // r = right
    // l = left
    // d = down
    // u = up
    // ur = upRight
    // ul = upLeft
    // dr = downRight
    // dl = downLeft
    
    // command
    // e, exit = exit game
    // restart = restart game
    // auto = automatic path finding


    const dir = prompt('Which way are you going: ');
    if(dir === 'exit'){
      break;
    }
    if(dir === 'restart'){
      start();
      return;
    };
    if(dir === 'auto'){
      const method = prompt('Which Algorithm do you want to use: \n'+
      '1. Dijkstra\n'+
      '2. Breath first search\n'+
      '3. Depth first search\n'+
      '4. Greedy breath first search\n'+
      '5. A star');
      switch(method){
        case '1': 'Dijkstra';
        break;
        case '2': 'Breath first search';
        break;
        case '3': 'Depth first search';
        break;
        case '4': 'Greedy breath first search';
        break;
        case '5': 'A star';
        break
        default: return;
      }
    };
    
    const move = new Movement(dir);
    move.move(dir)
    // Update stage and all position

    // Render stage
    for(let [...stage] of game.stage){
      console.log([...stage].join(' '));
    };

    // If over
    if(game.is_over){
      console.log('TOOOOOOM!!! YOU\'RE DEAD');
      break;
    };

    //if win
    if(game.is_win){
      console.log('CONGRATULATION!!!');
      break;
    };
  }
})();