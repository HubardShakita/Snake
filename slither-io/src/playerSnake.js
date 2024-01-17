PlayerSnake = function(game, spriteKey, x, y) {
    Snake.call(this, game, spriteKey, x, y);
    this.cursors = game.input.keyboard.createCursorKeys();

    //тут есть ускорение
    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    var self = this;
    spaceKey.onDown.add(this.spaceKeyDown, this);
    spaceKey.onUp.add(this.spaceKeyUp, this);
    this.addDestroyedCallback(function() {
        spaceKey.onDown.remove(this.spaceKeyDown, this);
        spaceKey.onUp.remove(this.spaceKeyUp, this);
    }, this);
}

PlayerSnake.prototype = Object.create(Snake.prototype);
PlayerSnake.prototype.constructor = PlayerSnake;

//змейка загорается при ускорении 
PlayerSnake.prototype.spaceKeyDown = function() {
    this.speed = this.fastSpeed;
    this.shadow.isLightingUp = true;
}
//замедление змейки при отжатии пробела
PlayerSnake.prototype.spaceKeyUp = function() {
    this.speed = this.slowSpeed;
    this.shadow.isLightingUp = false;
}


PlayerSnake.prototype.tempUpdate = PlayerSnake.prototype.update;
PlayerSnake.prototype.update = function() {
    // добавляем переменную для отслеживания режима управления
    this.controlMode = this.controlMode || 'mouse'; // по умолчанию используем управление мышью

    var mousePosX = this.game.input.activePointer.worldX;
    var mousePosY = this.game.input.activePointer.worldY;
    var headX = this.head.body.x;
    var headY = this.head.body.y;
    var angle = (180*Math.atan2(mousePosX-headX,mousePosY-headY)/Math.PI);
    if (angle > 0) {
        angle = 180-angle;
    }
    else {
        angle = -180-angle;
    }
    var dif = this.head.body.angle - angle;
    this.head.body.setZeroRotation();

    // проверяем режим управления
    if (this.controlMode === 'mouse') {
        if (dif < 0 && dif > -180 || dif > 180) {
            this.head.body.rotateRight(this.rotationSpeed);
        }
        else if (dif > 0 && dif < 180 || dif < -180) {
            this.head.body.rotateLeft(this.rotationSpeed);
        }
    } else if (this.controlMode === 'arrows') {
        if (this.cursors.left.isDown) {
            this.head.body.rotateLeft(this.rotationSpeed);
        }
        else if (this.cursors.right.isDown) {
            this.head.body.rotateRight(this.rotationSpeed);
        }
    }

    // меняем режим управления при нажатии на стрелки или движении мыши
    if (this.game.input.activePointer.isDown) {
        this.controlMode = 'mouse';
    }
    else if (this.cursors.left.isDown || this.cursors.right.isDown) {
        this.controlMode = 'arrows';
    }

    this.tempUpdate();
}