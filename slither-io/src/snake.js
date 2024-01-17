Snake = function(game, spriteKey, x, y) {
    this.game = game;
    //массив для змеи 
    if (!this.game.snakes) {
        this.game.snakes = [];
    }
    this.game.snakes.push(this);
    this.debug = false;
    this.snakeLength = 0;
    this.spriteKey = spriteKey;

    this.scale = 0.5;
    this.fastSpeed = 500;
    this.slowSpeed = 200;
    this.speed = this.slowSpeed;
    this.rotationSpeed = 80;

    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.sections = [];
    //путь головы - массив точек, через которая прошла башка змеи
    this.headPath = [];
    this.food = [];

    this.preferredDistance = 17 * this.scale;
    this.queuedSections = 0;

    this.shadow = new Shadow(this.game, this.sections, this.scale);
    this.sectionGroup = this.game.add.group();
    //добавление головы змеи
    this.head = this.addSectionAtPosition(x,y);
    this.head.name = "head";
    this.head.snake = this;

    this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
    //тут можно сделать очень длинного питона
    this.initSections(30);

    this.eyes = new EyePair(this.game, this.head, this.scale);

    //эдге это передняя часть тела, которая будет отвечать за столкновения с другими змеями
    this.edgeOffset = 4;
    this.edge = this.game.add.sprite(x, y - this.edgeOffset, this.spriteKey);
    this.edge.name = "edge";
    this.edge.alpha = 0;
    this.game.physics.p2.enable(this.edge, this.debug);
    this.edge.body.setCircle(this.edgeOffset);

    this.edgeLock = this.game.physics.p2.createLockConstraint(
        this.edge.body, this.head.body, [0, -this.head.width*0.5-this.edgeOffset]
    );

    this.edge.body.onBeginContact.add(this.edgeContact, this);

    this.onDestroyedCallbacks = [];
    this.onDestroyedContexts = [];
}

Snake.prototype = {

    initSections: function(num) {
        //создание самого тела заа башкой змеи
        for (var i = 1 ; i <= num ; i++) {
            var x = this.head.body.x;
            var y = this.head.body.y + i * this.preferredDistance;
            this.addSectionAtPosition(x, y);
            this.headPath.push(new Phaser.Point(x,y));
        }

    },
    //чтоб тело не вылезло в рамках разумного
    addSectionAtPosition: function(x, y) {
        var sec = this.game.add.sprite(x, y, this.spriteKey);
        this.game.physics.p2.enable(sec, this.debug);
        sec.body.setCollisionGroup(this.collisionGroup);
        sec.body.collides([]);
        sec.body.kinematic = true;

        this.snakeLength++;
        this.sectionGroup.add(sec);
        sec.sendToBack();
        sec.scale.setTo(this.scale);

        this.sections.push(sec);

        this.shadow.add(x,y);
        sec.body.clearShapes();
        sec.body.addCircle(sec.width*0.5);

        return sec;
    },

    addSectionsAfterLast: function(amount) {
        this.queuedSections += amount;
    },

    update: function() {
        var speed = this.speed;
        this.head.body.moveForward(speed);

        //тело растет не из хвоста, а из головы во время трапезы
        var point = this.headPath.pop();
        point.setTo(this.head.body.x, this.head.body.y);
        this.headPath.unshift(point);

        //следование тела по траектории головы
        var index = 0;
        var lastIndex = null;
        for (var i = 0 ; i < this.snakeLength ; i++) {

            this.sections[i].body.x = this.headPath[index].x;
            this.sections[i].body.y = this.headPath[index].y;

            if (lastIndex && index == lastIndex) {
                this.sections[i].alpha = 0;
            }
            else {
                this.sections[i].alpha = 1;
            }

            lastIndex = index;
            index = this.findNextPointIndex(index);
        }

        if (index >= this.headPath.length - 1) {
            var lastPos = this.headPath[this.headPath.length - 1];
            this.headPath.push(new Phaser.Point(lastPos.x, lastPos.y));
        }
        else {
            this.headPath.pop();
        }

        //змея двигается за счет цикла, и тело идет за башкой тоже за счет цикла
        var i = 0;
        var found = false;
        while (this.headPath[i].x != this.sections[1].body.x &&
        this.headPath[i].y != this.sections[1].body.y) {
            if (this.headPath[i].x == this.lastHeadPosition.x &&
            this.headPath[i].y == this.lastHeadPosition.y) {
                found = true;
                break;
            }
            i++;
        }
        if (!found) {
            this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
            this.onCycleComplete();
        }

        //обновление положения глаз и теней
        this.eyes.update();
        this.shadow.update();
    },

    findNextPointIndex: function(currentIndex) {
        var pt = this.headPath[currentIndex];
        //какая-то хрень с точками
        var prefDist = this.preferredDistance;
        var len = 0;
        var dif = len - prefDist;
        var i = currentIndex;
        var prevDif = null;
        while (i+1 < this.headPath.length && (dif === null || dif < 0)) {
            var dist = Util.distanceFormula(
                this.headPath[i].x, this.headPath[i].y,
                this.headPath[i+1].x, this.headPath[i+1].y
            );
            len += dist;
            prevDif = dif;
            dif = len - prefDist;
            i++;
        }

        if (prevDif === null || Math.abs(prevDif) > Math.abs(dif)) {
            return i;
        }
        else {
            return i-1;
        }
    },

    //функция вызвается каждый раз, когда 2 тело достигло места 1 тела
    onCycleComplete: function() {
        if (this.queuedSections > 0) {
            var lastSec = this.sections[this.sections.length - 1];
            this.addSectionAtPosition(lastSec.body.x, lastSec.body.y);
            this.queuedSections--;
        }
    },

    //масштаб змейки
    setScale: function(scale) {
        this.scale = scale;
        this.preferredDistance = 17 * this.scale; //расстояние между телами змейки

        //В ЧЕМ СУТЬ ФИЗИКИ???????
        this.edgeLock.localOffsetB = [
            0, this.game.physics.p2.pxmi(this.head.width*0.5+this.edgeOffset)
        ];

        //масштаб тел
        for (var i = 0 ; i < this.sections.length ; i++) {
            var sec = this.sections[i];
            sec.scale.setTo(this.scale);
            sec.body.data.shapes[0].radius = this.game.physics.p2.pxm(sec.width*0.5);
        }

        //масщтаб теней а глаз
        this.eyes.setScale(scale);
        this.shadow.setScale(scale);
    },

    //кастомизация змейки 
    incrementSize: function() {
        this.addSectionsAfterLast(1);
        this.setScale(this.scale * 1.01);
    },

    //когда умирает змейка, то умриает змека
    destroy: function() {
        this.game.snakes.splice(this.game.snakes.indexOf(this), 1);
        this.game.physics.p2.removeConstraint(this.edgeLock);
        this.edge.destroy();
        //умирает змея, умирает и еда внутри нее
        for (var i = this.food.length - 1 ; i >= 0 ; i--) {
            this.food[i].destroy();
        }
        this.sections.forEach(function(sec, index) {
            sec.destroy();
        });
        this.eyes.destroy();
        this.shadow.destroy();

        for (var i = 0 ; i < this.onDestroyedCallbacks.length ; i++) {
            if (typeof this.onDestroyedCallbacks[i] == "function") {
                this.onDestroyedCallbacks[i].apply(
                    this.onDestroyedContexts[i], [this]);
            }
        }
    },

    //вызывается, когда башка змеи натыкается на дргую змею
    edgeContact: function(phaserBody) {
        if (phaserBody && this.sections.indexOf(phaserBody.sprite) == -1) {
            this.destroy();
        }
        //змея не умрет при натыкании с собой
        else if (phaserBody) {
            this.edge.body.x = this.head.body.x;
            this.edge.body.y = this.head.body.y;
        }
    },

    addDestroyedCallback: function(callback, context) {
        this.onDestroyedCallbacks.push(callback);
        this.onDestroyedContexts.push(context);
    }
};
