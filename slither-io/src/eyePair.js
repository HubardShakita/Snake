EyePair = function(game, head, scale) {
    this.game = game;
    this.head = head;
    this.scale = scale;
    this.eyes = [];

    this.debug = false;

    //появление глаз 
    var offset = this.getOffset();
    this.leftEye = new Eye(this.game, this.head, this.scale);
    this.leftEye.updateConstraints([-offset.x, -offset.y]);
    this.eyes.push(this.leftEye);

    this.rightEye = new Eye(this.game, this.head, this.scale);
    this.rightEye.updateConstraints([offset.x, -offset.y]);
    this.eyes.push(this.rightEye);
}

EyePair.prototype = {

    //тут если покурить, то глаза вылетят к херам
    getOffset: function() {
        var xDim = this.head.width*0.25;
        var yDim = this.head.width*.125;
        return {x: xDim, y: yDim};
    },

    setScale: function(scale) {
        this.leftEye.setScale(scale);
        this.rightEye.setScale(scale);
        //здесь стоят ограничения, чтобы эти глаза не выелетели
        var offset = this.getOffset();
        this.leftEye.updateConstraints([-offset.x, -offset.y]);
        this.rightEye.updateConstraints([offset.x, -offset.y]);
    },

    update: function() {
        for (var i = 0 ; i < this.eyes.length ; i++) {
            this.eyes[i].update();
        }
    },

    //умирает змея, умирают и глаза
    destroy: function() {
        this.leftEye.destroy();
        this.rightEye.destroy();
    }
};
