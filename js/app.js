// User customizable properties, initialized
var numEnemies = 5;
var speedMultiple = 200;

// Options the user can change dynamically
// Create form fields for user input and add to pop-up dialog

// Number of Enemies
var option1 = document.createElement('P');
var optionlabel1 = document.createTextNode('Enter the number of enemies to display:');
var optioninput1 = document.createElement('INPUT');
optioninput1.setAttribute('id', 'countEnemies');
optioninput1.setAttribute('type', 'number');
optioninput1.setAttribute('min', 1);
optioninput1.setAttribute('max', 20);
optioninput1.setAttribute('value', numEnemies);
option1.appendChild(optionlabel1);
option1.appendChild(optioninput1);

// Speed of Enemies
var option2= document.createElement('P');
var optionlabel2= document.createTextNode('Select desired speed:');
var optioninput2= document.createElement('INPUT');
optioninput2.setAttribute('id', 'newSpeed');
optioninput2.setAttribute('type', 'range');
optioninput2.setAttribute('min', 100);
optioninput2.setAttribute('max', 1000);
optioninput2.setAttribute('step', 50);
optioninput2.setAttribute('value', speedMultiple);
option2.appendChild(optionlabel2);
option2.appendChild(optioninput2);

// Put options in an array for easier processing.
var options = [];
options.push(option1);
options.push(option2);

// changeOptions handles user changes to the game options
var changeOptions = function(){
    numEnemies = document.getElementById("countEnemies").value;
    speedMultiple = document.getElementById("newSpeed").value;
    Init();
}

// lastRow keeps track of which row the last bug was released on
// in order to round robin them. This still allows for variability
// in how many bugs there are in a row due to differences in speed.
var lastRow = 3;

// Enemies our player must avoid
var Enemy = function() {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    // The widest width of the non-transparent part of the enemy image
    this.width = 96;
    // Amount of transparent padding on each side of enemy image
    this.padding = Math.floor((101-this.width)/2);
    // startLoc is assigned to a random width off the screen so the enemy will
    // appear to crawl onto the screen. It is also stored for reuse when the
    // enemy reaches the right end and must be restarted.
    this.startLoc = - (101*(1 + Math.random()));
    // Set initial horizontal location
    this.x = this.startLoc;
    // current row is maintained for ease of collision checking.
    this.row = 0;
    // setRow is called to assign the new enemy to the
    // next row after lastRow.
    this.y = 0;
    this.setRow();
    // speed is set to a random multiple of the global speedMultiple.
    this.speed = Math.random() * speedMultiple;
}

// Assign the next row for the enemy, based on lastRow
// and update lastRow.
Enemy.prototype.setRow = function(){
    if (lastRow == 3){
        this.row = 1;
    } else {
        this.row = lastRow + 1;
    }
    // The y coordinate is calculated for the assigned row.
    // Each row is 83 pixels high. 60 is added to center
    // the enemy in the row.
    this.y = 60 + (83 * (this.row - 1));
    lastRow = this.row;
}

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // If the enemy is completely off the screen to the right,
    // restart it from the left at it's original x location
    // and on the next row after lastRow.
    if (this.x >= 505){
        this.x = this.startLoc;
        this.setRow();
    // Otherwise, set the enemy's new x location at it's stored speed.
    } else {
        this.x = this.x + this.speed*dt;
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Player class
var Player = function() {
    // Assign player's image
    this.sprite = 'images/char-boy.png';
    // The width of the non-transparent part of the player image
    // where it might touch an enemy.
    this.width = 60;
    // Amount of transparent padding on each side of player image
    this.padding = Math.floor((101-this.width)/2);
    // Assign starting number of lives
    this.lives = 5;
    // Assign player's starting location
    this.row = 5;
    this.col = 2;
    // Compute x and y locations for the assigned row and col.
    this.update();
}

// Process the user's key presses
Player.prototype.handleInput = function(keyPressed){
    switch (keyPressed){
        case "left":
            if(this.col != 0){ //Can't move left if you're in col 0.
                this.col--;
            }
            break;
        case "right":
            if(this.col != 4){ //Can't move right if you're in col 4.
                this.col++;
            }
            break;
        case "down":
            if(this.row != 5){ //Can't move down if you're in row 5.
                this.row++;
            }
            break;
        case "up":
            if(this.row != 0){ // Can't move up if you're in row 0.
                this.row--;
            }
            break;
    }
}

// *** player.update() is not passed the dt variable when called from the
// *** engine.js updateEntities function, so I have ignored it here.
Player.prototype.update = function(dt) {
    this.x = this.col * 101;
    // The y coordinate is adjusted to make the bottom of the player
    // appear closer to the middle of the cell.
    this.y = (this.row * 83) - 33;
    // Check for win
    if (this.row == 0) {
        this.reset("You Win!");
        // Add a life, if not at the maximum.
        if (this.lives < 11){this.lives++;}
    }
}

Player.prototype.reset = function(message){
    // Note that the player returns to it's starting position
    // but enemies do not reset. I felt this was a good choice
    // since it means there are enemies in places other than
    // the extreme left when play resumes.
    alert(message);
    this.row = 5;
    this.col = 2;
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    // Draw the images that represent the player's lives.
    for (life = 1; life < this.lives; life++){
        ctx.drawImage(Resources.get(this.sprite), 50*(life-1), 515, 50, 80);
    }
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
var player = new Player;

var Init = function(){
    // Empty the allEnemies array, in case the user changed the desired number.
    allEnemies.length = 0;
    for (i=0; i<numEnemies; i++){
        allEnemies[i] = new Enemy();
    }
};

Init();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});


