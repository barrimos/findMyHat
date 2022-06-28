const prompt = require("prompt-sync")();

// Pacman set
const pacman = {
    r: '►',
    l: '◄',
    d: '▼',
    u: '▲',
    win: '⚑',
    dead: '✝',
    length: 6,
};

// Environments
const env = {
    1: '×', // bombs
    2: '□', // walls
    3: '·', // pathway
    4: '♦', // hat rewards
    length: 4,
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
    constructor(board_rows = 3, board_cols = 3, isAuto = false){
        this.stage = new Array;
        this.isAutoPos = isAuto;
        this.randomPosX = this.isAutoPos ? Math.floor(Math.random() * board_rows) : 0;
        this.randomPosY = this.isAutoPos ? Math.floor(Math.random() * board_cols) : 0;
        this.pacman_posX = this.randomPosX;
        this.pacman_posY = this.randomPosY;
        this.hatRewards_posX = Math.floor(Math.random() * board_rows);
        this.hatRewards_posY = Math.floor(Math.random() * board_cols);

        this.isWin = false;
        this.isOver = false;
        this.board_rows = board_rows;
        this.board_cols = board_cols;

        this.nearFriednsIndex = new Array;

        this.selfIndex = new Array;
        this.current = [this.pacman_posX, this.pacman_posY];
        this.goal = [this.hatRewards_posX, this.hatRewards_posY];
        this.heuristic = 0;
        this.queue = new Array;
        this.cameFrom = new Array;
        this.pathFinder = new Array;

        this.bombIndex = new Array;
        this.wallsIndex = new Array;
        this.pathwayIndex = new Array;

        // For global
        this.getCurPos = {
            pacman: [this.pacman_posX,this.pacman_posY],
            hatRewards: [this.hatRewards_posX,this.hatRewards_posY],
            bombs: this.bombIndex,
            walls: this.wallsIndex,
            pathway: this.pathwayIndex,
            selfIndex: this.selfIndex,
        };
        this.level = {
            // base on percentage
            // pacman 4
            // hatReWards 4
            easy: [16, 16, 60],
            medium: [20, 20, 52],
            hard: [25, 25, 42],
            length: 3,
        };
    }

    createStage = ()=>{
        // Generate Map and random position to push environments
        for(let i = 0; i < this.board_rows; i++){
            this.stage.push([]);
            for(let j = 0; j < this.board_cols; j++){

                // Check if i,j equal pacman's index push pacman
                if(i === this.pacman_posX && j === this.pacman_posY){
                    this.stage[i][j] = pacman.r;
                    continue;
                };
                // Check if i,j equal hatRewards's index push hatRewards
                if(i === this.hatRewards_posX && j === this.hatRewards_posY){
                    this.stage[i][j] = env[4];
                    continue;
                };


                // 2. Then random environments to stage
                // If condition above is false random environment put into the stage
                let randPos = Math.floor(Math.random() * 3) + 1;
                this.stage[i].push(env[randPos]);
            };
        };


        // Store index of bombs walls pathway to their array and replace some position to pathway to avoid dead position
        for(let i = 0; i < this.board_rows; i++){
            for(let j = 0; j < this.board_cols; j++){
                if(this.stage[0][1] !== this.stage[this.pacman_posX][this.pacman_posY] && this.stage[0][1] !== this.stage[this.hatRewards_posX][this.hatRewards_posY]){;
                    this.stage[0][1] = env[3];
                };
                if(this.stage[0][this.board_cols - 2] !== this.stage[this.pacman_posX][this.pacman_posY] && this.stage[0][this.board_cols - 2] !== this.stage[this.hatRewards_posX][this.hatRewards_posY]){
                    this.stage[0][this.board_cols - 2] = env[3];
                };
                if(this.stage[1][0] !== this.stage[this.pacman_posX][this.pacman_posY] && this.stage[1][0] !== this.stage[this.hatRewards_posX][this.hatRewards_posY]){
                    this.stage[1][0] = env[3];
                };
                if(this.stage[1][this.board_cols - 1] !== this.stage[this.pacman_posX][this.pacman_posY] && this.stage[1][this.board_cols - 1] !== this.stage[this.hatRewards_posX][this.hatRewards_posY]){
                    this.stage[1][this.board_cols - 1] = env[3];
                };
                if(this.stage[this.board_rows - 2][0] !== this.stage[this.pacman_posX][this.pacman_posY] && this.stage[this.board_rows - 2][0] !== this.stage[this.hatRewards_posX][this.hatRewards_posY]){
                    this.stage[this.board_rows - 2][0] = env[3];
                };
                if(this.stage[this.board_rows - 2][this.board_cols - 1] !== this.stage[this.pacman_posX][this.pacman_posY] && this.stage[this.board_rows - 2][this.board_cols - 1] !== this.stage[this.hatRewards_posX][this.hatRewards_posY]){
                    this.stage[this.board_rows - 2][this.board_cols - 1] = env[3];
                };
                if(this.stage[this.board_rows - 1][1] !== this.stage[this.pacman_posX][this.pacman_posY] && this.stage[this.board_rows - 1][1] !== this.stage[this.hatRewards_posX][this.hatRewards_posY]){
                    this.stage[this.board_rows - 1][1] = env[3];
                };
                if(this.stage[this.board_rows - 1][this.board_cols - 2] !== this.stage[this.pacman_posX][this.pacman_posY] && this.stage[this.board_rows - 1][this.board_cols - 2] !== this.stage[this.hatRewards_posX][this.hatRewards_posY]){
                    this.stage[this.board_rows - 1][this.board_cols - 2] = env[3];
                };
                
                if(this.stage[i][j] === env[1]){
                    if(this.stage.length <= 1){
                        this.stage[i][j] = env[3];
                    } else {
                        this.bombIndex.push([i,j]);
                    };
                };
                if(this.stage[i][j] === env[2]){
                    if(this.stage.length <= 1){
                        this.stage[i][j] = env[3];
                    } else {
                        this.wallsIndex.push([i,j]);
                    }
                };
                if(this.stage[i][j] === env[3]){
                    this.pathwayIndex.push([i,j]);
                };
            };
        };
        

        // If position of pacman is last column pacman's display will inverted horizontal !!! for start game only and isAuto true
        if(this.stage[this.pacman_posX][this.pacman_posY] === this.stage[this.pacman_posX][this.stage[this.pacman_posX].length - 1]){
            this.stage[this.pacman_posX][this.pacman_posY] = pacman.l;
        };

        // Random position of hat rewards if random position index equal to pacman index random again
        if(this.hatRewards_posX === this.pacman_posX && this.hatRewards_posY === this.pacman_posY){
            let [temp_hatRewards_PosX, temp_hatRewards_PosY] = this.genNewIndex([this.hatRewards_posX, this.hatRewards_posY], [this.pacman_posX, this.pacman_posY]);
            this.hatRewards_posX = temp_hatRewards_PosX;
            this.hatRewards_posY = temp_hatRewards_PosY;
            this.stage[this.hatRewards_posX][this.hatRewards_posY] = env[4];
        } else {
            this.stage[this.hatRewards_posX][this.hatRewards_posY] = env[4];
        };
        // Return start map
        return this.stage;
    };


    // Pathfinder to goal
    // Came from === check self index before update
    searchAlgorithm = (curStart, curGoal)=>{
        let [curStrartX, curStartY] = curStart;
        let [curSGoalX, curGoalY] = curGoal;

        this.queue;
        this.cameFrom;
        this.current = this.checkSelfIndex([curStrartX, curStartY]);
        this.goal = this.checkSelfIndex([curSGoalX, curGoalY]);



        // 1. Set path pacman to goal first by DFS before at least one path way
        // Get current position pacman and goal
        console.log(curStart);
        console.log(curGoal);

        // Check how far x and y position from pacman to goal store array in pathFinder
        // for(let i = curStrartX; i < curSGoalX; i++){
        //     for(let j = curStartY; j < curGoalY; j++){

        //     }
        // }
        console.log('pathfinder is', this.pathFinder);
        // Push every index that after know how far index between pacman to goal



        this.pathFinder;
        return [this.pathFinder];
    };


    checkStepHowFar(){
        return this.heuristic = Math.abs([this.pacman_posX + this.pacman_posY] - [this.hatRewards_posX + this.hatRewards_posY]);
    };


    // Check how many bombs, walls, pathway, rewards are in stage
    checkTotalEnvironemnts = ()=>{
        for(let envPosRows = 0; envPosRows < this.stage.length; envPosRows++){
            for(let envPosCols = 0; envPosCols < this.stage[envPosRows].length; envPosCols++){
                // bombs
                if(this.stage[envPosRows][envPosCols] === env[1]){
                    objectTotal.bombs += 1;
                };
            };
            for(let envPosCols = 0; envPosCols < this.stage[envPosRows].length; envPosCols++){
                // walls
                if(this.stage[envPosRows][envPosCols] === env[2]){
                    objectTotal.walls += 1;
                };
            };
            for(let envPosCols = 0; envPosCols < this.stage[envPosRows].length; envPosCols++){
                // pathway
                if(this.stage[envPosRows][envPosCols] === env[3]){
                    objectTotal.pathway += 1;
                };
            };
            for(let envPosCols = 0; envPosCols < this.stage[envPosRows].length; envPosCols++){
                // rewards
                if(this.stage[envPosRows][envPosCols] === env[4]){
                    objectTotal.rewards += 1;
                };
            };
        };
        return objectTotal;
    };



    checkEnvironemntEachRrows = (selectRows)=>{
        // Calc how many a bombs and walls there are on stage
        // If bombs and walls on stage sum of total too much replace some its to be pathway
        for(let i = selectRows; i <= selectRows; i++){
            objectEachRows.bombs = 0;
            objectEachRows.walls = 0;
            objectEachRows.pathway = 0;
            objectEachRows.rewards = 0;
            for(let j = 0; j < this.board_cols; j++){
                if(this.stage[i][j] === env[1]){
                    objectEachRows.bombs++;
                };
            };
            for(let j = 0; j < this.board_cols; j++){
                if(this.stage[i][j] === env[2]){
                    objectEachRows.walls++;
                };
            };
            for(let j = 0; j < this.board_cols; j++){
                if(this.stage[i][j] === env[3]){
                    objectEachRows.pathway++;
                };
            };
            for(let j = 0; j < this.board_cols; j++){
                if(this.stage[i][j] === env[4]){
                    objectEachRows.rewards++;
                };
            };
            return objectEachRows;
        };
    };



    // Check index of near friends all direction 1 step
    checkIndexNearFriend = (curIndex, curStage)=>{
        this.nearFriednsIndex = [];
        let txt = new Array;
        let [curRows, curCols] = curIndex;
        // console.log(`stageRowsLen: ${curStage.length}`);
        // console.log(`stageColsLen: ${curStage[0].length}`);
        for(let i = 0; i < curStage.length; i++){
            for(let j = 0; j < curStage[0].length; j++){
                if(i === curRows && j === curCols || j < curCols - 1 || i < curRows - 1 || j > curCols + 1 || i > curRows + 1){
                    continue;
                };
                txt.push(`friends Of ${curStage[curRows][curCols]} index ${curRows},${curCols} is: ${curStage[i][j]} ${i},${j}`);
                this.nearFriednsIndex.push([i,j]);
            };
        };
        return this.nearFriednsIndex, txt;
    };

    // Check self index of environments
    checkSelfIndex = (selfEnvIdx)=>{
        this.selfIndex = [];
        let [x, y] = selfEnvIdx;
        for(let i = 0; i < this.board_rows; i++){
            for(let j = 0; j < this.board_cols; j++){
                if(i === x && j === y){
                    this.selfIndex.push(i,j);
                };
            };
        };
        return this.selfIndex;
    };

    // If hatRewards have same index with pacman index then random again and again
    genNewIndex = (curIdxPos, refIdxPos)=>{
        let [curX, curY] = curIdxPos;
        let [refX, refY] = refIdxPos;
        if(curX === refX && curY === refY){
            return this.genNewIndex([Math.floor(Math.random() * this.board_rows),Math.floor(Math.random() * this.board_cols)], refIdxPos);
        } else {
            this.hatRewards_posX = curX;
            this.hatRewards_posY = curY;
            this.getCurPos.hatRewards[0] = curX;
            this.getCurPos.hatRewards[1] = curY;
            return [curX, curY];
        };
    };



    move = (dir)=>{
        if(dir === 'l'){
            if(this.getCurPos.pacman[1] - 1 < 0 || this.wallsIndex.some(wall=>{return wall[0] === this.getCurPos.pacman[0] && wall[1] === this.getCurPos.pacman[1] - 1})){
                return;
            } else if(this.bombIndex.some(bomb=>{return bomb[0] === this.getCurPos.pacman[0] && bomb[1] === this.getCurPos.pacman[1] - 1})){
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] -= 1] = pacman.dead;
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] + 1] = env[3];
                this.isOver = true;
                return this.isOver;
            } else if(this.getCurPos.hatRewards[0] === this.getCurPos.pacman[0] && this.getCurPos.hatRewards[1] === this.getCurPos.pacman[1] - 1) {
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] -= 1] = pacman.win;
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] + 1] = env[3];
                this.isWin = true;
                return this.isWin;
            } else {
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] -= 1] = pacman.l;
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] + 1] = env[3];
            };
        };
        if(dir === 'r'){
            if(this.getCurPos.pacman[1] + 1 > this.board_cols - 1 || this.wallsIndex.some(wall=>{return wall[0] === this.getCurPos.pacman[0] && wall[1] === this.getCurPos.pacman[1] + 1})){
                return;
            } else if(this.bombIndex.some(bomb=>{return bomb[0] === this.getCurPos.pacman[0] && bomb[1] === this.getCurPos.pacman[1] + 1})){
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] += 1] = pacman.dead;
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] - 1] = env[3];
                this.isOver = true;
                return this.isOver;
            } else if(this.getCurPos.hatRewards[0] === this.getCurPos.pacman[0] && this.getCurPos.hatRewards[1] === this.getCurPos.pacman[1] + 1) {
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] += 1] = pacman.win;
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] - 1] = env[3];
                this.isWin = true;
                return this.isWin;
            } else {
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] += 1] = pacman.r;
                this.stage[this.getCurPos.pacman[0]][this.getCurPos.pacman[1] - 1] = env[3];
            };
        };
        if(dir === 'd'){
            if(this.getCurPos.pacman[0] + 1 > this.board_rows - 1 || this.wallsIndex.some(wall=>{return wall[0] === this.getCurPos.pacman[0] + 1 && wall[1] === this.getCurPos.pacman[1]})){
                return;
            } else if(this.bombIndex.some(bomb=>{return bomb[0] === this.getCurPos.pacman[0] + 1 && bomb[1] === this.getCurPos.pacman[1]})){
                this.stage[this.getCurPos.pacman[0] += 1][this.getCurPos.pacman[1]] = pacman.dead;
                this.stage[this.getCurPos.pacman[0] - 1][this.getCurPos.pacman[1]] = env[3];
                this.isOver = true;
                return this.isOver;
            } else if(this.getCurPos.hatRewards[0] === this.getCurPos.pacman[0] + 1 && this.getCurPos.hatRewards[1] === this.getCurPos.pacman[1]) {
                this.stage[this.getCurPos.pacman[0] += 1][this.getCurPos.pacman[1]] = pacman.win;
                this.stage[this.getCurPos.pacman[0] - 1][this.getCurPos.pacman[1]] = env[3];
                this.isWin = true;
                return this.isWin;
            } else {
                this.stage[this.getCurPos.pacman[0] += 1][this.getCurPos.pacman[1]] = pacman.d;
                this.stage[this.getCurPos.pacman[0] - 1][this.getCurPos.pacman[1]] = env[3];
            };
        };
        if(dir === 'u'){
            if(this.getCurPos.pacman[0] - 1 < 0 || this.wallsIndex.some(wall=>{return wall[0] === this.getCurPos.pacman[0] - 1 && wall[1] === this.getCurPos.pacman[1]})){
                return;
            } else if(this.bombIndex.some(bomb=>{return bomb[0] === this.getCurPos.pacman[0] - 1 && bomb[1] === this.getCurPos.pacman[1]})){
                this.stage[this.getCurPos.pacman[0] -= 1][this.getCurPos.pacman[1]] = pacman.dead;
                this.stage[this.getCurPos.pacman[0] + 1][this.getCurPos.pacman[1]] = env[3];
                this.isOver = true;
                return this.isOver;
            } else if(this.getCurPos.hatRewards[0] === this.getCurPos.pacman[0] - 1 && this.getCurPos.hatRewards[1] === this.getCurPos.pacman[1]) {
                this.stage[this.getCurPos.pacman[0] -= 1][this.getCurPos.pacman[1]] = pacman.win;
                this.stage[this.getCurPos.pacman[0] + 1][this.getCurPos.pacman[1]] = env[3];
                this.isWin = true;
                return this.isWin;
            } else {
                this.stage[this.getCurPos.pacman[0] -= 1][this.getCurPos.pacman[1]] = pacman.u;
                this.stage[this.getCurPos.pacman[0] + 1][this.getCurPos.pacman[1]] = env[3];
            };
        };
    };
};





// TEST AT OUTPUT TAB --------------------
// Render at first time only
const game = new Pacman(4,4,true);
game.createStage();
game.checkIndexNearFriend(game.getCurPos.pacman, game.stage);
console.log(game.nearFriednsIndex);
// Get current position

for(let [...stage] of game.stage){
    console.log([...stage].join(' '));
};

game.searchAlgorithm(game.getCurPos.pacman, game.getCurPos.hatRewards);

console.log(game.checkStepHowFar());

// setTimeout(()=>{
//     game.move('r');
//     for(let [...stage] of game.stage){
//         console.log([...stage].join(' '));
//     };
//     // game.checkIndexNearFriend(game.getCurPos.pacman, game.stage);
//     // console.log(game.nearFriednsIndex);
// },2000)

// setTimeout(()=>{
//     game.move('l');
//     for(let [...stage] of game.stage){
//         console.log([...stage].join(' '));
//     };
//     // game.checkIndexNearFriend(game.getCurPos.pacman, game.stage);
//     // console.log(game.nearFriednsIndex);
// },4000)

// setTimeout(()=>{
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