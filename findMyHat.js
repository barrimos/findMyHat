const prompt = require("prompt-sync")();

// Pacman set
const pacman = {
    r: '►',
    l: '◄',
    d: '▼',
    u: '▲',
    length: 4,
};

// Environments
const env = {
    0: '·', // pathway
    1: '□', // walls
    2: '×', // bombs
    3: '♦', // hat rewards
    win: '⚑',
    dead: '✝',
    length: 6,
};

// Amount total of objects
const objectTotal = {
    bombs: 0,
    walls: 0,
    pathway: 0,
    rewards: 0,
};

// Amount total of objects each rows
const objectEachRows = {
    bombs: 0,
    walls: 0,
    pathway: 0,
    rewards: 0,
};




class Pacman{
    constructor(is_auto, board_rows, board_cols){
        this.is_auto = false || is_auto;
        this.is_win = false;
        this.is_over = false;
        this.board_rows = board_rows || 3;
        this.board_cols = board_cols || 3;

        this.stage = new Array;
        this.bomb_index = new Array;
        this.wall_index = new Array;
        this.pathway_index = new Array;

        this.pacman_posX = 4;
        this.pacman_posY = 4;
        this.goal_posX = 2;
        this.goal_posY = 2;

        this.neighbor_index = new Array;
        this.cost_so_far = 1;
        this.heuristic = 0;
        this.euclidean_distance = new Array;
        this.frontier = new Array;
        this.visited = new Array;
        this.came_from = [[this.pacman_posX, this.pacman_posY]];
        this.path_finder = new Array;
    }

    createStage = () => {        
        // Generate Map and random position to push environments
        for(let i = 0; i < this.board_rows; i++){
            this.stage.push([]);
            this.euclidean_distance.push([]);
            for(let j = 0; j < this.board_cols; j++){
                this.euclidean_distance[i].push(Math.abs(this.pacman_posX - i) + Math.abs(this.pacman_posY - j));
                this.stage[i].push(env[0]);
            };
        };

        this.heuristic = Math.abs(this.pacman_posX - this.goal_posX) + Math.abs(this.pacman_posY - this.goal_posY);
        

        // // Random position of hat rewards if random position index equal to pacman index random again
        // if(this.goal_posX === this.pacman_posX && this.goal_posY === this.pacman_posY){
        //     let [temp_goal_posX, temp_goal_posY] = this.genNewIndex([this.goal_posX, this.goal_posY], [this.pacman_posX, this.pacman_posY]);
        //     this.goal_posX = temp_goal_posX;
        //     this.goal_posY = temp_goal_posY;
        //     this.stage[this.hatRewards_posX][this.hatRewards_posY] = env[4];
        // } else {
        //     this.stage[this.goal_posX][this.goal_posY] = env[4];
        // };

        return this.stage;
    };


    // Pathfinder to goal
    // Came from === check self index before update
    searchAlgorithm = () => {
        this.path_finder.push([this.pacman_posX, this.pacman_posY]);
        // let found = false;
        // let i = 0;
        // while(!found){
        //     let last_ordered_pair = this.path_finder[i];
        //     let r = Math.ceil(Math.random() * 8);
        //     let _i = last_ordered_pair[0];
        //     let _j = last_ordered_pair[1];

        //     if(_i === this.goal_posX && _j === this.goal_posY){
        //         found = true;
        //         break;
        //     }

        //     if(r >= 4){
        //         _i++;
        //         if(_i > this.board_rows - 1 || _i > this.goal_posX){
        //             _i--;
        //             _j++;
        //         }
        //     } else {
        //         _j++;
        //         if(_j > this.board_cols - 1 || _j > this.goal_posY){
        //             _j--;
        //             _i++;
        //         }
        //     }

        //     this.path_finder.push([_i, _j]);
        //     i++;
        // }
    };


    // Check index of near friends all direction 1 step
    neighborIndex = (pacman, stage) => {
        let [pacman_posX, pacman_posY] = pacman;
        let count = 0;
        // for(let i = 0; i < stage.length; i++){
        //     for(let j = 0; j < stage[0].length; j++){
        //         if(i === pacman_posX && j === pacman_posY || j < pacman_posY - 1 || i < pacman_posX - 1 || j > pacman_posY + 1 || i > pacman_posX + 1 || i + j > pacman_posX + pacman_posY + 1 || i + j === pacman_posX + pacman_posY || pacman_posX + pacman_posY > i + j + 1){
        //             // console.log([i, j]);
        //             continue;
        //         };
        //         this.neighbor_index.push([i, j]);
        //     };
        // };


        for(let i = 0; i < 4; i++){
            let neighbor_posX = pacman_posX - (i === 0 ? 1 : -1);
            let neighbor_posY = pacman_posY - (i === 2 ? 1 : -1);
            if(i < 2){
                if(neighbor_posX + pacman_posY < 0 || neighbor_posX >= stage.length || neighbor_posX < 0){
                    continue;
                }
                this.neighbor_index.push([neighbor_posX, pacman_posY]);
            } else {
                if(pacman_posX + neighbor_posY < 0 || neighbor_posY >= stage[0].length || neighbor_posY < 0){
                    continue;
                }
                this.neighbor_index.push([pacman_posX, neighbor_posY]);
            }
        }

        // let _startX = pacman_posX === 0 ? 0 : pacman_posX - 1;
        // let _startY = pacman_posY === 0 ? 0 : pacman_posY - 1;
        // let euclidean = 0;
        // for(let i = _startX; i < this.stage.length; i++){
        //     if(i > pacman_posX + 1){
        //         continue;
        //     }
        //     for(let j = _startY; j < this.stage[0].length; j++){
        //         if(j > pacman_posY + 1){
        //             continue;
        //         }
        //         euclidean = Math.abs(pacman_posX - i) + Math.abs(pacman_posY - j);
        //         if(euclidean >= 0 && euclidean < 2){
        //             if(i === pacman_posX && j === pacman_posY){
        //                 continue;
        //             }
        //             this.neighbor_index.push([i, j]);
        //         }
        //     }
        // }
        console.log(count);
        return this.neighbor_index;
    };

    // If hatRewards have same index with pacman index then random again and again
    genNewIndex = (curIdxPos, refIdxPos) => {
        let [curX, curY] = curIdxPos;
        let [refX, refY] = refIdxPos;
        if(curX === refX && curY === refY){
            return this.genNewIndex([Math.floor(Math.random() * this.board_rows),Math.floor(Math.random() * this.board_cols)], refIdxPos);
        } else {
            this.goal_posX = curX;
            this.goal_posY = curY;
            return [curX, curY];
        };
    };



    move = (dir) => {
        if(dir === 'l'){

        };
        if(dir === 'r'){

        };
        if(dir === 'd'){

        };
        if(dir === 'u'){

        };
    };
};





// TEST AT OUTPUT TAB --------------------
// Render at first time only
const game = new Pacman(true, 5, 5);
game.createStage();
game.searchAlgorithm();
game.neighborIndex([game.pacman_posX, game.pacman_posY], game.stage);

// console.log(game.pacman_posX, game.pacman_posY);
// console.log(game.goal_posX, game.goal_posY);
// console.log(game.wall_index);
// console.log(game.bomb_index);
// console.log(game.heuristic);
console.log(game.neighbor_index);
// console.log(game.path_finder);

for(let [...stage] of game.stage){
    console.log([...stage].join(' '));
};
for(let [...ed] of game.euclidean_distance){
    console.log([...ed].join(' '));
};

// console.log(game.checkStepHowFar());

// setTimeout(() => {
//     game.move('r');
//     for(let [...stage] of game.stage){
//         console.log([...stage].join(' '));
//     };
//     // game.checkIndexNearFriend(game.getCurPos.pacman, game.stage);
//     // console.log(game.nearFriednsIndex);
// },2000)

// setTimeout(() => {
//     game.move('l');
//     for(let [...stage] of game.stage){
//         console.log([...stage].join(' '));
//     };
//     // game.checkIndexNearFriend(game.getCurPos.pacman, game.stage);
//     // console.log(game.nearFriednsIndex);
// },4000)

// setTimeout(() => {
//     game.move('l');
//     for(let [...stage] of game.stage){
//         console.log([...stage].join(' '));
//     };
//     // game.checkIndexNearFriend(game.getCurPos.pacman, game.stage);
//     // console.log(game.nearFriednsIndex);
// },6000)
// TEST AT OUTPUT TAB --------------------





// (function pacman(condition){
//     if(condition === 'exit'){
//         return;
//     }
//     // Render at first time only
//     // true === random position
//     const game = new Pacman(3,3,true);
//     // Generate stage
//     game.createStage();

//     // After generate stage log near friends of pacman and hatRewards before all move
//     game.checkIndexNearFriend(game.getCurPos.pacman, game.stage);
//     console.log('near friends\'s pacman',game.nearFriednsIndex);
//     game.checkIndexNearFriend(game.getCurPos.hatRewards, game.stage);
//     console.log('near friends\'s hatRewards',game.nearFriednsIndex);

//     // Log current position of pacman and hatRewards
//     game.checkSelfIndex(game.getCurPos.pacman);
//     console.log('pacman\'s position',game.selfIndex);
//     game.checkSelfIndex(game.getCurPos.hatRewards);
//     console.log('hatRewards\'s position',game.selfIndex);

//     // Render stage
//     for(let [...stage] of game.stage){
//         console.log([...stage].join(' '));
//     };

//     // Loop until isOver === true
//     while(!game.isOver){
//         // Input direction
//         // r = right
//         // l = left
//         // d = down
//         // u = up
//         // ur = upRight
//         // ul = upLeft
//         // dr = downRight
//         // dl = downLeft
//         const dir = prompt('Which way are you going: ');
//         if(dir === 'exit'){
//             pacman(dir);
//             break;
//         };
//         if(dir === 'restart'){
//             pacman();
//             return;
//         };
//         if(dir === 'auto'){
//             game.searchAlgorithm();
//         };

//         // Update stage and all position
//         game.move(dir);

//         // After generate stage log near friends of pacman and hatRewards before all move
//         game.checkIndexNearFriend(game.getCurPos.pacman, game.stage);
//         console.log('near friends\'s pacman',game.nearFriednsIndex);
//         game.checkIndexNearFriend(game.getCurPos.hatRewards, game.stage);
//         console.log('near friends\'s hatRewards',game.nearFriednsIndex);

//         // Log current position of pacman and hatRewards
//         game.checkSelfIndex(game.getCurPos.pacman);
//         console.log('pacman\'s position',game.selfIndex);
//         game.checkSelfIndex(game.getCurPos.hatRewards);
//         console.log('hatRewards\'s position',game.selfIndex);

//         // Render stage
//         for(let [...stage] of game.stage){
//             console.log([...stage].join(' '));
//         };

//         // If over
//         if(game.isOver){
//             console.log('TOOOOOOM!!! YOU\'RE DEAD');
//             break;
//         };

//         //if win
//         if(game.isWin){
//             console.log('CONGRATULATION!!!');
//             break;
//         };
//     };   
// })();




// const arr = [0,2]
// const arr2 = [[0,1],[1,0],[1,1]]


// console.log(arr2.some(value=>{return value[0] === arr[0]})); // false 
// console.log(arr2.some(value=>{return value[1] === arr[1]})); // true
// console.log(arr2.some(value=>{return value[0] == arr[0] && value[1] === arr[1]})); // false

// console.log(arr2.every(value=>{return value[0] === arr[0]})); // false 
// console.log(arr2.every(value=>{return value[1] === arr[1]})); // false
// console.log(arr2.every(value=>{return value[0] == arr[0] && value[1] === arr[1]})); // false


// game.checkIndexNearFriend(game.checkSelfIndex(game.getCurPos.pacman), game.stage);
// console.log(game.nearFriednsIndex);

// for(let pacmanFriends of game.nearFriednsIndex){
//     console.log('pacman friends', game.stage[pacmanFriends[0]][pacmanFriends[1]]);
// }

// console.log(game.checkTotalEnvironemnts());
// for(let i = 0; i < game.board_rows; i++){
//     console.log(game.checkEnvironemntEachRrows(i));
// }

// console.log('bomb index:', game.bombIndex, game.bombIndex.length);
// console.log('walls index:', game.wallsIndex, game.wallsIndex.length);
// console.log('pathway index:', game.pathwayIndex, game.pathwayIndex.length);


// console.log(`current position at pacman index is: ${game.stage[game.pacman_posX][game.pacman_posY]} ${game.pacman_posX},${game.pacman_posY}`);
// console.log(`current position at hatRewards index is: ${game.stage[game.hatRewards_posX][game.getCurPos.hatRewards[1]]} ${game.hatRewards_posX},${game.hatRewards_posY}`);


// let a = [[1, 1], [2, 2]];
// let b = [[1,1], [2,2]];
// a = JSON.stringify(a);
// b = JSON.stringify(b);
// let c = a.indexOf(b);
// if(c != -1){
//     console.log('element present');
// } else {
//     console.log(a, b);
// }


// 2*2 2
// 3*3 6
// 4*4 20
// 5*5 70
// 6*6 252