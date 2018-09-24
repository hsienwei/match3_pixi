'use strict';

import './pixi.js'
import {Match3} from './match3'


const WAIT_UPDATE_TIME_UNIT = 500;
const WAIT_UPDATE_TIME_UNIT2 = 300;
const WAIT_CLEAR_TIME_UNIT = 300;

const GEM_SIZE = 70;

class TweenMgr{
  private tweening :any[] = [];
  tweenTo(object: any, property:any, target:any, time:any, easing: any, onchange: any, oncomplete: any) {
    var tween = {
      object: object,
      property: property,
      propertyBeginValue: object[property],
      target: target,
      easing: easing,
      time: time,
      change: onchange,
      complete: oncomplete,
      start: Date.now()
    };

    this.tweening.push(tween);
    return tween;
  }

  //Basic lerp funtion.
  lerp(a1: any, a2: any, t: any) {
    return a1 * (1 - t) + a2 * t;
  };

  //Backout function from tweenjs.
  //https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
  backout(amount: any) {
    return function (t :any) {
      return (--t * t * ((amount + 1) * t + amount) + 1);
    };
  };

  tick(delta :number)
  {
    var now = Date.now();
    var remove = [];
    for (var i = 0; i < this.tweening.length; i++) {
      var t = this.tweening[i];
      var phase = Math.min(1, (now - t.start) / t.time);
  
      t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
      if (t.change) t.change(t);
      if (phase == 1) {
        t.object[t.property] = t.target;
        if (t.complete)
          t.complete(t);
        remove.push(t);
      }
    }
    for (var i = 0; i < remove.length; i++) {
      this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
    }
  }
}

// Listen for animate update.
/*app.ticker.add(function (delta) {
  var now = Date.now();
  var remove = [];
  for (var i = 0; i < tweening.length; i++) {
    var t = tweening[i];
    var phase = Math.min(1, (now - t.start) / t.time);

    t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
    if (t.change) t.change(t);
    if (phase == 1) {
      t.object[t.property] = t.target;
      if (t.complete)
        t.complete(t);
      remove.push(t);
    }
  }
  for (var i = 0; i < remove.length; i++) {
    tweening.splice(tweening.indexOf(remove[i]), 1);
  }
});*/






class Demo
{
  private GEM_SIZE : number = 70;  
  private app = new PIXI.Application(600, 800, { backgroundColor: 0x1099bb });
  private tweenMgr = new TweenMgr();

  private match3 : Match3.Match3Main = new Match3.Match3Main(8, 8, 6);

  private tempTouchPos : { x: number, y: number} = {x:0, y:0};
  //private match3 = match3.init(8, 8, 6);

  onDragStart(event: PIXI.interaction.InteractionEvent) {
    this.tempTouchPos.x = event.data.global.x;
    this.tempTouchPos.y = event.data.global.y;
  }

  onDragEnd(event: PIXI.interaction.InteractionEvent) {
    console.log(this.tempTouchPos);

    console.log(event.data.global);

    var SwipeDeltaX = event.data.global.x - this.tempTouchPos.x;
    var SwipeDeltaY = event.data.global.y - this.tempTouchPos.y;

    if (Math.abs(SwipeDeltaX) < Math.abs(SwipeDeltaY)) {
      if (SwipeDeltaY < 0) {
        this.match3.swipe(Math.floor(this.tempTouchPos.x / GEM_SIZE), Math.floor(this.tempTouchPos.y / GEM_SIZE), Match3.Direction.UP);
      }
      if (SwipeDeltaY > 0) {
        this.match3.swipe(Math.floor(this.tempTouchPos.x / GEM_SIZE), Math.floor(this.tempTouchPos.y / GEM_SIZE), Match3.Direction.DOWN);
      }
    }

    else //if( Math.abs( SwipeDeltaX ) > Math.abs( SwipeDeltaY ) )
    {
      if (SwipeDeltaX > 0) {
        this.match3.swipe(Math.floor(this.tempTouchPos.x / GEM_SIZE), Math.floor(this.tempTouchPos.y / GEM_SIZE), Match3.Direction.RIGHT);
      }
      if (SwipeDeltaX < 0) {
        this.match3.swipe(Math.floor(this.tempTouchPos.x / GEM_SIZE), Math.floor(this.tempTouchPos.y / GEM_SIZE), Match3.Direction.LEFT);
      }
    }

  }


  public main()
  {
    document.body.appendChild(this.app.view);

    PIXI.loader
    .add("res/candy1_blue_01.png", "res/candy1_blue_01.png")
    .add("res/candy1_green_01.png", "res/candy1_green_01.png")
    .add("res/candy1_orange_01.png", "res/candy1_orange_01.png")
    .add("res/candy1_purple_01.png", "res/candy1_purple_01.png")
    .add("res/candy1_red_01.png", "res/candy1_red_01.png")
    .add("res/candy1_yellow_01.png", "res/candy1_yellow_01.png")
    .load(()=>{this.onAssetsLoaded()});

  }

  private onAssetsLoaded() {
    var match3Textures = [
      PIXI.Texture.fromImage("res/candy1_blue_01.png"),
      PIXI.Texture.fromImage("res/candy1_green_01.png"),
      PIXI.Texture.fromImage("res/candy1_orange_01.png"),
      PIXI.Texture.fromImage("res/candy1_purple_01.png"),
      PIXI.Texture.fromImage("res/candy1_red_01.png"),
      PIXI.Texture.fromImage("res/candy1_yellow_01.png"),
    ];

    let Grid : any[] = [];
    var gemContainer = new PIXI.Container();
  
    

    this.match3.m_CBGenerate = (x: number, y: number, color: number, type: number, time: number) => {
  
      var gem = new PIXI.Sprite(match3Textures[color]);
      gem.y = y * this.GEM_SIZE;
      gem.scale.x = gem.scale.y = 0.5;
      gem.alpha = 0;
      gem.x = x * this.GEM_SIZE;
      gem.interactive = true;
      gem.addListener("touchstart", (event) => {this.onDragStart(event) });
      gem.addListener("mousedown", (event) => {this.onDragStart(event) });
      gem.addListener("touchend", (event) => {this.onDragEnd(event) });
      gem.addListener("mouseup",(event) => {this.onDragEnd(event) });
  
      gemContainer.addChild(gem);
  
      this.tweenMgr.tweenTo(gem, "alpha", 1, time, this.tweenMgr.backout(0.6), null, null);
  
      let idx = this.match3.GridPosToIdx2(x, y);
      Grid[idx] = gem;
    }
  
    this.match3.m_CBMove = (Col: number, Row: number, TargetCol: number, TargetRow: number, MoveType: number) => {
      let idxA = this.match3.GridPosToIdx2(Col, Row);
      let idxB = this.match3.GridPosToIdx2(TargetCol, TargetRow);
  
      var GemA = Grid[idxA];
      var GemB = Grid[idxB];
  
      if (MoveType == 1) {
        if (GemB != null) {
          this.tweenMgr.tweenTo(GemB, "x", Col * GEM_SIZE, WAIT_UPDATE_TIME_UNIT, this.tweenMgr.backout(0.6), null, null);
          this.tweenMgr.tweenTo(GemB, "y", Row * GEM_SIZE, WAIT_UPDATE_TIME_UNIT, this.tweenMgr.backout(0.6), null, null);
        }
  
        if (GemA != null) {
          this.tweenMgr.tweenTo(GemA, "x", TargetCol * GEM_SIZE, WAIT_UPDATE_TIME_UNIT, this.tweenMgr.backout(0.6), null, null);
          this.tweenMgr.tweenTo(GemA, "y", TargetRow * GEM_SIZE, WAIT_UPDATE_TIME_UNIT, this.tweenMgr.backout(0.6), null, null);
        }
  
        Grid[idxA] = GemB;
        Grid[idxB] = GemA;
      }
    }
  
    this.match3.m_CBClear = (x: number, y: number) => {
      let idx = this.match3.GridPosToIdx2(x, y);
      if (Grid[idx] == null) {
        console.log("error", x, y);
        return;
      }
  
      var Gem = Grid[idx];
      Grid[idx] = null;
  
      this.tweenMgr.tweenTo(Gem, "alpha", 0, WAIT_CLEAR_TIME_UNIT, this.tweenMgr.backout(0.6), null, function () { gemContainer.removeChild(Gem); });
    }
  
    this.app.stage.addChild(gemContainer);
    this.match3.generate(true);
  
    

    // Listen for animate update.
    this.app.ticker.add( (delta) => {
      this.match3.update(delta * this.app.ticker.elapsedMS);
      this.tweenMgr.tick(delta);
    });
  }
}

new Demo().main();

/*
var gameState = gameState || {
  tempTouchPos: { x: 0, y: 0 }
};

var app = new PIXI.Application(600, 800, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

PIXI.loader
  .add("res/candy1_blue_01.png", "res/candy1_blue_01.png")
  .add("res/candy1_green_01.png", "res/candy1_green_01.png")
  .add("res/candy1_orange_01.png", "res/candy1_orange_01.png")
  .add("res/candy1_purple_01.png", "res/candy1_purple_01.png")
  .add("res/candy1_red_01.png", "res/candy1_red_01.png")
  .add("res/candy1_yellow_01.png", "res/candy1_yellow_01.png")
  .load(onAssetsLoaded);

match3.init(8, 8, 6);


//onAssetsLoaded handler builds the example.
function onAssetsLoaded() {
  var match3Textures = [
    PIXI.Texture.fromImage("res/candy1_blue_01.png"),
    PIXI.Texture.fromImage("res/candy1_green_01.png"),
    PIXI.Texture.fromImage("res/candy1_orange_01.png"),
    PIXI.Texture.fromImage("res/candy1_purple_01.png"),
    PIXI.Texture.fromImage("res/candy1_red_01.png"),
    PIXI.Texture.fromImage("res/candy1_yellow_01.png"),
  ];

  var Grid = [];
  var gemContainer = new PIXI.Container();

  match3.m_CBGenerate = function (x, y, color, type, time) {

    var gem = new PIXI.Sprite(match3Textures[color]);
    gem.y = y * GEM_SIZE;
    gem.scale.x = gem.scale.y = 0.5;
    gem.alpha = 0;
    gem.x = x * GEM_SIZE;
    gem.interactive = true;
    gem.touchstart = gem.mousedown = onDragStart;
    gem.touchend = gem.mouseup = onDragEnd;
    //GemInst.transform.DOScale(1.3f, TimeUnit * 0.001f);

    gemContainer.addChild(gem);

    tweenTo(gem, "alpha", 1, match3.WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);

    let idx = match3.GridPosToIdx2(x, y);
    Grid[idx] = gem;
  }

  match3.m_CBMove = function (Col, Row, TargetCol, TargetRow, MoveType) {
    let idxA = match3.GridPosToIdx2(Col, Row);
    let idxB = match3.GridPosToIdx2(TargetCol, TargetRow);

    var GemA = Grid[idxA];
    var GemB = Grid[idxB];

    if (MoveType == 1) {
      if (GemB != null) {
        tweenTo(GemB, "x", Col * GEM_SIZE, match3.WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);
        tweenTo(GemB, "y", Row * GEM_SIZE, match3.WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);
      }

      if (GemA != null) {
        tweenTo(GemA, "x", TargetCol * GEM_SIZE, match3.WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);
        tweenTo(GemA, "y", TargetRow * GEM_SIZE, match3.WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);
      }

      Grid[idxA] = GemB;
      Grid[idxB] = GemA;
    }
  }

  match3.m_CBClear = function (x, y) {
    let idx = match3.GridPosToIdx2(x, y);
    if (Grid[idx] == null) {
      console.log("error", x, y);
      return;
    }

    var Gem = Grid[idx];
    Grid[idx] = null;

    tweenTo(Gem, "alpha", 0, match3.WAIT_CLEAR_TIME_UNIT, backout(0.6), null, function () { gemContainer.removeChild(Gem); });
  }

  app.stage.addChild(gemContainer);
  match3.generate(true);

  function onDragStart(event) {
    gameState.tempTouchPos.x = event.data.global.x;
    gameState.tempTouchPos.y = event.data.global.y;
  }

  function onDragEnd(event) {
    console.log(gameState.tempTouchPos);

    console.log(event.data.global);

    var SwipeDeltaX = event.data.global.x - gameState.tempTouchPos.x;
    var SwipeDeltaY = event.data.global.y - gameState.tempTouchPos.y;

    if (Math.abs(SwipeDeltaX) < Math.abs(SwipeDeltaY)) {
      if (SwipeDeltaY < 0) {
        match3.swipe(Math.floor(gameState.tempTouchPos.x / GEM_SIZE), Math.floor(gameState.tempTouchPos.y / GEM_SIZE), match3.Direction.UP);
      }
      if (SwipeDeltaY > 0) {
        match3.swipe(Math.floor(gameState.tempTouchPos.x / GEM_SIZE), Math.floor(gameState.tempTouchPos.y / GEM_SIZE), match3.Direction.DOWN);
      }
    }

    else //if( Math.abs( SwipeDeltaX ) > Math.abs( SwipeDeltaY ) )
    {
      if (SwipeDeltaX > 0) {
        match3.swipe(Math.floor(gameState.tempTouchPos.x / GEM_SIZE), Math.floor(gameState.tempTouchPos.y / GEM_SIZE), match3.Direction.RIGHT);
      }
      if (SwipeDeltaX < 0) {
        match3.swipe(Math.floor(gameState.tempTouchPos.x / GEM_SIZE), Math.floor(gameState.tempTouchPos.y / GEM_SIZE), match3.Direction.LEFT);
      }
    }

  }

  // Listen for animate update.
  app.ticker.add(function (delta) {
    match3.update(delta * app.ticker.elapsedMS);
  });
}
*/
//Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.

