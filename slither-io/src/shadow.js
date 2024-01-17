Shadow = function(game, sections, scale) {
    this.game = game;
    this.sections = sections;
    this.scale = scale;
    this.shadowGroup = this.game.add.group();
    this.shadows = [];
    this.isLightingUp = false;

    this.lightStep = 0;
    this.maxLightStep = 3;

    this.lightUpdateCount = 0;
    this.updateLights = 3;

    //задаем цвет теням под змейкой
    this.darkTint = 0xaaaaaa;
    this.lightTintBright = 0xaa3333;
    this.lightTintDim = 0xdd3333;
}

Shadow.prototype = {
    add: function(x, y) {
        var shadow = this.game.add.sprite(x, y, "shadow");
        shadow.scale.setTo(this.scale);
        shadow.anchor.set(0.5);
        this.shadowGroup.add(shadow);
        this.shadows.push(shadow);
    },

    update: function() {
        var lastPos = null;
        for (var i = 0 ; i < this.sections.length ; i++) {
            var shadow = this.shadows[i];
            var pos = {
                x: this.sections[i].body.x,
                y: this.sections[i].body.y
            };

            //когда змея растет, тогда тень под прошлой жопой удаляем
            if (lastPos && pos.x == lastPos.x && pos.y == lastPos.y) {
                shadow.alpha = 0;
                shadow.naturalAlpha = 0;
            }
            else {
                shadow.alpha = 1;
                shadow.naturalAlpha = 1;
            }
            //размещение тени под змеей
            shadow.position.x = pos.x;
            shadow.position.y = pos.y;

            lastPos = pos;
        }

        //чтоб тень была ярче
        if (this.isLightingUp) {
            this.lightUpdateCount++;
            if (this.lightUpdateCount >= this.updateLights) {
                this.lightUp();
            }
        }
        //чтоб тень была темнее, но если здесь все сломать, то фон будет полностью черный
        else {
            for (var i = 0 ; i < this.shadows.length ; i++) {
                var shadow = this.shadows[i];
                shadow.tint = this.darkTint;
            }
        }
    },
    setScale: function(scale) {
        this.scale = scale;
        for (var i = 0 ; i < this.shadows.length ; i++) {
            this.shadows[i].scale.setTo(scale);
        }
    },
    //осветление тени
    lightUp: function() {
        this.lightUpdateCount = 0;
        for (var i = 0 ; i < this.shadows.length ; i++) {
            var shadow = this.shadows[i];
            if (shadow.naturalAlpha > 0) {
                //чередование цветов теней, чтоб было пиздато
                if ((i - this.lightStep) % this.maxLightStep === 0 ) {
                    shadow.tint = this.lightTintBright;
                }
                else {
                    shadow.tint = this.lightTintDim;
                }
            }
        }
        //тут можно покрутить значения и у теней будет танец цветов
        this.lightStep++;
        if (this.lightStep == this.maxLightStep) {
            this.lightStep = 0;
        }
    },
    //если сдохла змея, то сдохнут и тени
    destroy: function() {
        for (var i = this.shadows.length - 1 ; i >= 0 ; i--) {
            this.shadows[i].destroy();
        }
    }
};
