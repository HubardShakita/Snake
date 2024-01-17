Eye = function(game, head, scale) {
    this.game = game;
    this.head = head;
    this.scale = scale;
    this.eyeGroup = this.game.add.group();
    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.debug = false;

    //тут у нас глаза не вылетают из глазниц
    this.lock = null;
    this.dist = null;

    this.whiteCircle = this.game.add.sprite(
        this.head.body.x, this.head.body.y, "eye-white"
    );
    this.whiteCircle = this.initCircle(this.whiteCircle);

    this.blackCircle = this.game.add.sprite(
        this.whiteCircle.body.x, this.whiteCircle.body.y, "eye-black"
    );
    this.blackCircle = this.initCircle(this.blackCircle);
    this.blackCircle.body.mass = 0.01;



}

Eye.prototype = {
    initCircle: function(circle) {
        circle.scale.setTo(this.scale);
        this.game.physics.p2.enable(circle, this.debug);
        circle.body.clearShapes();
        circle.body.addCircle(circle.width*2);
        circle.body.setCollisionGroup(this.collisionGroup);
        circle.body.collides([]);
        this.eyeGroup.add(circle);
        return circle;
    },

    // а тут чтобы сами глаза из башки не выпали, но на 22 строчке можно сделать так чтобы выпали 
    updateConstraints: function(offset) {
       // а здесь что-то некой блокировки, опять же что бы глаза не лезли куда не надо
        if (this.lock) {
            this.lock.localOffsetB = [
                this.game.physics.p2.pxmi(offset[0]),
                this.game.physics.p2.pxmi(Math.abs(offset[1]))
            ];
        }
        //какое-то ограничение блкировки, для чего нужно,пока хер пойми
        else {
            this.lock = this.game.physics.p2.createLockConstraint(
                this.whiteCircle.body, this.head.body, offset, 0
            );
        }

        //покрути и глаза улетят в стратосферу
        if (this.dist) {
            this.dist.distance = this.game.physics.p2.pxm(this.whiteCircle.width*0.25);
        }
        //если сменить то при старте игры вылетят глаза, но зато потом вернуться на место
        else {
            this.dist = this.game.physics.p2.createDistanceConstraint(
                this.blackCircle.body, this.whiteCircle.body, this.whiteCircle.width*0.25
            );
        }
    },
    //глазная шкала, для чего нужна пока хер пойми
    setScale: function(scale) {
        this.scale = scale;
        for (var i = 0 ; i < this.eyeGroup.children.length ; i++) {
            var circle = this.eyeGroup.children[i];
            circle.scale.setTo(this.scale);
            //радиус окружностей, если чет поменять, то на геймплее не отобразиться
            circle.body.data.shapes[0].radius = this.game.physics.p2.pxm(circle.width*0.5);
        }

    },

    update: function() {
        var mousePosX = this.game.input.activePointer.worldX;
        var mousePosY = this.game.input.activePointer.worldY;
        var headX = this.head.body.x;
        var headY = this.head.body.y;
        var angle = Math.atan2(mousePosY-headY, mousePosX-headX);
        var force = 300;
        //тут пошло управление мышью
        this.blackCircle.body.moveRight(force*Math.cos(angle));
        this.blackCircle.body.moveDown(force*Math.sin(angle));
    },
    //умирает змея, умирают и глаза
    destroy: function() {
        this.whiteCircle.destroy();
        this.blackCircle.destroy();
        this.game.physics.p2.removeConstraint(this.lock);
        this.game.physics.p2.removeConstraint(this.dist);
    }
};
