HTMLCanvasElement.prototype.fitWindow = function() {
  var resize = function() {
    var rateWidth = this.width / window.innerWidth;
    var rateHeight = this.height / window.innerHeight;
    var rate = this.height / this.width;
    if (rateWidth > rateHeight) {
      this.style.width = innerWidth + "px";
      this.style.height = innerWidth * rate + "px";
    } else {
      this.style.width = innerHeight / rate + "px";
      this.style.height = innerHeight + "px";
    }
  }.bind(this);
  window.addEventListener("resize", resize, false);
  resize();
};

// requestAnim shim layer by Paul Irish
//http://paulirish.com/2011/requestanimationframe-for-smart-animating
window.requestAnimFrame = (function(){
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback, element){
    window.setTimeout(callback, 1000 / 60);
  };
})();

var keyboard = {
  up: false,
  down: false,
  left: false,
  right: false,
  shift: false,
};
window.addEventListener("keydown", function(e) {
  switch (e.keyCode) {
    case 37:
      keyboard.left = true;
      break;
    case 38:
      keyboard.up = true;
      break;
    case 39:
      keyboard.right = true;
      break;
    case 40:
      keyboard.down = true;
      break;
    case 16:
      keyboard.shift = true;
      break;
  }
}, false);
window.addEventListener("keyup", function(e) {
  switch (e.keyCode) {
    case 37:
      keyboard.left = false;
      break;
    case 38:
      keyboard.up = false;
      break;
    case 39:
      keyboard.right = false;
      break;
    case 40:
      keyboard.down = false;
      break;
    case 16:
      keyboard.shift = false;
      break;
  }
}, false);
window.addEventListener('keydown', function(e) {
  switch (e.keyCode) {
    case 37:
    case 38:
    case 39:
    case 40:
    case 16:
      e.preventDefault();
    break;
  }
}, false);

var consAng = Math.sin(Math.PI / 4);

var scene = {x: 384 * 1.5, y: 448* 1.5};

function isSlow(speed) {
  /*if (keyboard.shift) {
    return player.slow;
  } else {
    return 1;
  }*/
  var slowSpeed;
  if (keyboard.shift) {
    slowSpeed = player.slow;
  } else {
    slowSpeed = speed;
  }
  if ((keyboard.up && keyboard.left) || (keyboard.up && keyboard.right) || (keyboard.down && keyboard.left) || (keyboard.down && keyboard.right)) {
    return slowSpeed * consAng;//* Math.sqrt(2) * 0.5;
  } else {
    return slowSpeed;
  }
}

//Pre-processing
var renderer = new PIXI.autoDetectRenderer(
  scene.x, scene.y,
  {antialias: false, transparent: false, resolution: 1}
);
renderer.autoResize = true;
document.body.appendChild(renderer.view);
//renderer.view.fitWindow();
renderer.backgroundColor = 0x000000;

var stage = new PIXI.Container(); //https://github.com/kittykatattack/learningPixi
var stageBullet = new PIXI.particles.ParticleContainer(10000 , {
  rotation: true,
  alpha: false,
  scale: false,
  uvs: true,
});
var container = new PIXI.Container();

var spritesheet;

var shot = [];

var debugText = new PIXI.Text("", {
  fontSize: 15,
  fill: ["#ffffff"]
});
debugText.x = 5;
debugText.y = 5;

Shmup.configs({
  maxProjectile: {
    bullet: 10000,
    laser: 1,
    curveA: 1,
    curveB: 1,
    curveNode: 1,
  },
});

Shmup.advanced.performance.configs({
  smoothing: 10,
  maxMs: 0,
});

//Player
var player = {
  x: scene.x / 2,
  y: scene.y - 50,
  speed: 5,
  slow: 1.2,
  graphic: undefined,
};

PIXI.loader
  .add("player", "https://cdn.rawgit.com/Trung0246/Shmup/0ca7ea5477e406ae02a690e74bb37cab05578e44/img/thHitbox.png")//https://cdn.rawgit.com/Trung0246/Shmup/a1eaa269512b4c1b198dffb58b9fd3023171a701/img/11669-16x16x32.png")
  .add("bullet", "https://cdn.rawgit.com/Trung0246/Shmup/d934859990aa886a021a40377891845dd4185d77/img/down_arrow_icon.png")
  .add("shotSheet", "https://cdn.rawgit.com/Trung0246/Shmup/f8054fbd2f2fb25482076149c9d81e2b8041e408/img/Shot.png")//"https://i.sli.mg/bPRrPW.png")
  .load(setup);

//Main process
function setup() {
  spritesheet = PIXI.utils.TextureCache["shotSheet"];
  
  /*for (let i = 0; i < 10; i ++) {
    var bulletSprite = new PIXI.Rectangle(16 * i, 16 * 1, 16, 16);
    var tempTest = PIXI.utils.TextureCache["shotSheet"];
    tempTest.frame = bulletSprite;
    shot.push(tempTest);
  }*/
  //var bulletSprite = new PIXI.Rectangle(16 * 0, 16 * 1, 16, 16);
  //spritesheet.frame = bulletSprite;
  //spritesheet = PIXI.loader.resources["bullet"].texture;
  
  player.graphic = new PIXI.Sprite(PIXI.loader.resources["player"].texture);
  player.graphic.anchor.set(0.5, 0.5);
  //player.graphic.width = 6;
  //player.graphic.height = 6;
  player.graphic.position.set(player.x, player.y);
  container.addChild(player.graphic);
  container.addChild(stageBullet);
  container.addChild(stage);
  container.addChild(debugText);
  
  console.log("Done Loading... Now entering main loop...");
  loop();
}

function loop() {
  Shmup.advanced.performance.start();
  if (keyboard.left) {
    player.x -= isSlow(player.speed);
  } else if (keyboard.right) {
    player.x += isSlow(player.speed);
  };
  if (keyboard.up) {
    player.y -= isSlow(player.speed);
  } else if (keyboard.down) {
    player.y += isSlow(player.speed);
  };
  player.x = Math.max(0, Math.min(player.x, scene.x));
  player.y = Math.max(0, Math.min(player.y, scene.y));
  player.graphic.position.set(player.x, player.y);
  player.graphic.rotation += 0.05;
  //Shmup.update();
  Shmup.update();
  renderer.render(container);
  debugMeasure();
  Shmup.advanced.performance.end();
  requestAnimFrame(loop);
}

Shmup.advanced.performance.ms = 0;
Shmup.advanced.performance.fps = 0;

//setInterval(
function debugMeasure() {
  /*document.getElementById("fpsCount").innerHTML =  Shmup.advanced.performance.fps.toFixed(3);
  document.getElementById("msCount").innerHTML = Shmup.advanced.performance.ms.toFixed(3);
  document.getElementById("frameCount").innerHTML = Shmup.advanced.data.frame; 
  document.getElementById("pCount").innerHTML = Shmup.advanced.process.active.length;
  document.getElementById("tCount").innerHTML = Shmup.advanced.temp.routine.length;*/
  debugText.text =
`FPS: ${Shmup.advanced.performance.fps.toFixed(3)}
MS: ${Shmup.advanced.performance.ms.toFixed(3)}
Frame: ${Shmup.advanced.data.frame}
PCount: ${Shmup.advanced.process.active.length}
TCount: ${Shmup.advanced.temp.routine.length}`;
}//, 1000);

var editor = ace.edit("textInput");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");
editor.focus();
editor.setShowInvisibles(true);
editor.setFontSize(10.75);
editor.session.setTabSize(2);
editor.setValue(`function* main(
  x = scene.x / 2,
  y = scene.y / 3.75
) {
  var angle = 0;
  while (true) {
    CreateShot01(x, y, 2, angle, Math.floor(angle / 2) % 4 + 1);
    angle += 11;
    yield* Shmup.utils.wait(1);
  }
}
Shmup.utils.task({update: true}, [], main);

var size = 1.5, bC = 4, tC = 13, sC = 10;
function CreateShot01(x, y, radial, angle, texture = 0) {
  var obj = Shmup.projectile.bullet.add({
    position: {
      x: x,
      y: y,
    },
    angle: Shmup.angle.deg.rad(angle),
    radial: radial,
    data: {
      dR: Math.random() < 0.5 ? -1 : 1,
    },
    update: function(projectile) {
      projectile.data.graphic.position.set(projectile.position.x, projectile.position.y);
      projectile.data.graphic.rotation = projectile.angle + Math.PI / 2;
      //projectile.data.graphic.rotation += (Math.random() * 0.05 + 0.075) * projectile.data.dR;
      if (Shmup.utils.out(0, projectile.position, scene.x, scene.y) || deleteProjectile === true) {
        if (Shmup.advanced.process.active.length <= 1) {
          deleteProjectile = false;
        }
        stage.removeChild(projectile.data.graphic);
        stageBullet.removeChild(projectile.data.graphic);
        Shmup.projectile.bullet.remove(projectile);
      }
    },
  });
  var bulletImg = new PIXI.Sprite(new PIXI.Texture(spritesheet, new PIXI.Rectangle(16 * texture, 16 * 5, 16, 16))); //10: star, 7: card
  bulletImg.anchor.set(0.5, 0.5);
  /*bulletImg.width *= size;
  bulletImg.height *= size;
  obj.data.blur = new PIXI.filters.BlurFilter();
  obj.data.blur.blur = bC;
  bulletImg.filters = [obj.data.blur];*/
  stageBullet.addChild(bulletImg);
  obj.data.graphic = bulletImg;
  //Shmup.utils.task({update: true}, [obj], changeGraphic);
  return obj;
}
function* changeGraphic(obj) {
  for (let i = 0; i < tC; i ++) {
    obj.data.blur.blur -= bC / tC;
    obj.data.graphic.width -= (16 * (size - 1)) / tC;
    obj.data.graphic.height -= (16 * (size - 1)) / tC;
    yield;
  }
  obj.data.graphic.filters = undefined;
  stage.removeChild(obj.data.graphic);
  stageBullet.addChild(obj.data.graphic);
}
`);

document.getElementById("evalScript").onclick = function() {
  eval(editor.getValue());
};

document.getElementById("clearTask").onclick = function() {
  Shmup.advanced.temp.routine = [];
};

var deleteProjectile = false;

document.getElementById("clearProjectile").onclick = function() {
  if (deleteProjectile === false) {
    deleteProjectile = true;
  } else {
    deleteProjectile = false;
  }
};

function resetAll() {
  Shmup.advanced.temp.routine = [];
  if (deleteProjectile === false) {
    deleteProjectile = true;
  } else {
    deleteProjectile = false;
  }
  eval(editor.getValue());
}

/*
/*function* example(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 3.75;
  var angle = 0, texture = 0, count = 4;
  while (true) {
    for (let i = 1; i <= count; i ++) {
      CreateShot01(x, y, 2, angle, texture);
      texture += 3;
      if (texture > 9) {
        texture -= 9;
      }
      angle += 360 / count + 1;
    }
    yield* Shmup.utils.wait(1);
  }
}**
var waitTime = 100, d1 = document.getElementById("d1"), d2 = document.getElementById("d2");
function* example(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 3.75;
  var angle = 0, count = 5, dist = 150, flip = false, texture = 0, obj,
  angleX = 0, angleY = 0, angleZ = 0, spd = 1;
  while (true) {
    for (let i = 1; i <= count; i ++) {
      obj = CreateShot01(
        (Math.cos(angleY) * Math.cos(angleZ) * Math.cos(Shmup.angle.degree.radian(angle)) - Math.cos(angleX) * Math.sin(angleZ) * Math.sin(Shmup.angle.degree.radian(angle))) * dist + x,
        (Math.cos(angleY) * Math.sin(angleZ) * Math.cos(Shmup.angle.degree.radian(angle)) + Math.cos(angleX) * Math.cos(angleZ) * Math.sin(Shmup.angle.degree.radian(angle))) * dist + y,
      spd, angle + spd * 10 + dist, texture);
      angle -= 360 / count + Math.SQRT2 * 5 / count;
      texture += 7;
      if (texture > 9) {
        texture -= 10;
      }
    }
    angleX += Shmup.angle.degree.radian(0.25);
    angleY += Shmup.angle.degree.radian(0.6);
    //angleY *= 1.01;
    angleZ += Shmup.angle.degree.radian(1);
    //angleZ *= 1.01;
    angle = Shmup.angle.degree.normalize(angle);
    spd += 0.03;
    if (flip === true) {
      dist -= 1;
      if (dist <= 50) {
        flip = false;
      }
    } else {
      dist += 1;
      if (dist > 150) {
        flip = true;
      }
    }
    if (spd > 3) {
      spd = 1;
      angleX = Shmup.math.random({
        min: -180,
        max: 180,
      });
      angleY = Shmup.math.random({
        min: -180,
        max: 180,
      });
      angleZ = Shmup.math.random({
        min: -180,
        max: 180,
      });
      //yield* Shmup.utils.wait(waitTime);
      waitTime --;
      if (waitTime < 0) {
        waitTime = 0;
      }
    }
    yield* Shmup.utils.wait(2);
  }
}
Shmup.utils.task({update: true, reset: false}, [], example);

var size = 1.5, bC = 4, tC = 13, sC = 10;
function CreateShot01(x, y, radial, angle, texture = 0) {
  var obj = Shmup.projectile.bullet.add({
    position: {
      x: x,
      y: y,
    },
    angle: Shmup.angle.degree.radian(angle),
    radial: radial,
    data: {
      dR: Math.random() < 0.5 ? -1 : 1,
    },
    update: function(projectile) {
      projectile.data.graphic.position.set(projectile.position.x, projectile.position.y);
      projectile.data.graphic.rotation = projectile.angle + Math.PI / 2;
      //projectile.data.graphic.rotation += (Math.random() * 0.05 + 0.075) * projectile.data.dR;
      if (Shmup.utils.out(0, projectile.position) || deleteProjectile === true) {
        if (Shmup.advanced.process.active.length <= 1) {
          deleteProjectile = false;
        }
        stage.removeChild(projectile.data.graphic);
        stageBullet.removeChild(projectile.data.graphic);
        Shmup.projectile.bullet.remove(projectile);
      }
    },
  });
  var bulletImg = new PIXI.Sprite(new PIXI.Texture(spritesheet, new PIXI.Rectangle(16 * texture + 16 * 10, 16 * 4, 16, 16))); //10: star, 7: card
  bulletImg.anchor.set(0.5, 0.5);
  /*bulletImg.width *= size;
  bulletImg.height *= size;
  obj.data.blur = new PIXI.filters.BlurFilter();
  obj.data.blur.blur = bC;
  bulletImg.filters = [obj.data.blur];**
  stage.addChild(bulletImg);
  obj.data.graphic = bulletImg;
  //Shmup.utils.task({update: true}, [obj], changeGraphic);
  return obj;
}
function* changeGraphic(obj) {
  for (let i = 0; i < tC; i ++) {
    obj.data.blur.blur -= bC / tC;
    obj.data.graphic.width -= (16 * (size - 1)) / tC;
    obj.data.graphic.height -= (16 * (size - 1)) / tC;
    yield;
  }
  obj.data.graphic.filters = undefined;
  stage.removeChild(obj.data.graphic);
  stageBullet.addChild(obj.data.graphic);
}


big +100%
large +200%
huge +300%
jumbo +400%
mega +500%

giant +600%
titanic +700%
colossal +800%
monumental +900%
gargantuan +1000%

var waitTime = 100, d1 = document.getElementById("d1"), d2 = document.getElementById("d2");
function* example(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 3.75;
  var angle = 0, count = 6, dist = 200, flip = false, texture = 0, obj,
  angleX = 0, angleY = 1, angleZ = 0, spd = 1;
  while (true) {
    for (let i = 1; i <= count; i ++) {
      obj = CreateShot01(
        (Math.cos(angleY) * Math.cos(angleZ) * Math.cos(Shmup.angle.degree.radian(angle)) - Math.cos(angleX) * Math.sin(angleZ) * Math.sin(Shmup.angle.degree.radian(angle))) * dist + x,
        (Math.cos(angleY) * Math.sin(angleZ) * Math.cos(Shmup.angle.degree.radian(angle)) + Math.cos(angleX) * Math.cos(angleZ) * Math.sin(Shmup.angle.degree.radian(angle))) * dist + y,
      spd, angle + spd * 10 + dist, texture);
      angle -= 360 / count + Math.SQRT2 * 5 / count;
    }
    texture += 4;
    if (texture > 9) {
      texture -= 10;
    }
    angleX += Shmup.angle.degree.radian(0.25);
    angleY += Shmup.angle.degree.radian(0.6);
    //angleY *= 1.01;
    angleZ += Shmup.angle.degree.radian(1);
    //angleZ *= 1.01;
    angle = Shmup.angle.degree.normalize(angle);
    spd += 0.03;
    if (flip === true) {
      dist -= 1;
      if (dist <= 100) {
        flip = false;
      }
    } else {
      dist += 1;
      if (dist > 200) {
        flip = true;
      }
    }
    if (spd > 3) {
      spd = 1;
      angleX = Shmup.math.random({
        min: -180,
        max: 180,
      });
      angleY = Shmup.math.random({
        min: -180,
        max: 180,
      });
      angleZ = Shmup.math.random({
        min: -180,
        max: 180,
      });
      //yield* Shmup.utils.wait(waitTime);
      waitTime --;
      if (waitTime < 0) {
        waitTime = 0;
      }
    }
    yield* Shmup.utils.wait(2);
  }
}
Shmup.utils.task({update: true, reset: false}, [], example);


var size = 2.25, bC = 6, tC = 10, sC = 10;
function CreateShot01(x, y, radial, angle, texture = 0) {
  var obj = Shmup.projectile.bullet.add({
    position: {
      x: x,
      y: y,
    },
    angle: Shmup.angle.degree.radian(angle),
    radial: radial,
    data: {
      dR: Math.random() < 0.5 ? -1 : 1,
    },
    update: function(projectile) {
      projectile.data.graphic.position.set(projectile.position.x, projectile.position.y);
      //projectile.data.graphic.rotation = projectile.angle + Math.PI / 2;
      projectile.data.graphic.rotation += (Math.random() * 0.05 + 0.075) * projectile.data.dR;
      if (Shmup.utils.out(0, projectile.position) || deleteProjectile === true) {
        if (Shmup.advanced.process.active.length <= 1) {
          deleteProjectile = false;
        }
        stage.removeChild(projectile.data.graphic);
        stageBullet.removeChild(projectile.data.graphic);
        Shmup.projectile.bullet.remove(projectile);
      }
    },
  });
  var bulletImg = new PIXI.Sprite(new PIXI.Texture(spritesheet, new PIXI.Rectangle(16 * texture, 16 * 10, 16, 16))); //10: star, 7: card
  bulletImg.anchor.set(0.5, 0.5);
  /*bulletImg.width *= size;
  bulletImg.height *= size;
  obj.data.blur = new PIXI.filters.BlurFilter();
  obj.data.blur.blur = bC;
  bulletImg.filters = [obj.data.blur];**
  stageBullet.addChild(bulletImg);
  obj.data.graphic = bulletImg;
  //Shmup.utils.task({update: true}, [obj], changeGraphic);
  return obj;
}
function* changeGraphic(obj) {
  for (let i = 0; i < tC; i ++) {
    obj.data.blur.blur -= bC / tC;
    obj.data.graphic.width -= (16 * (size - 1)) / tC;
    obj.data.graphic.height -= (16 * (size - 1)) / tC;
    yield;
  }
  obj.data.graphic.filters = undefined;
  stage.removeChild(obj.data.graphic);
  stageBullet.addChild(obj.data.graphic);
}
*/

/*
function* example(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 3.75;
  var angle = 0, count = 8, dist = 100,
  angleX = 0, angleY = 0, angleZ = 0, spd = 1;
  while (true) {
    for (let i = 1; i <= count; i ++) {
      CreateShot01(
        (Math.cos(angleY) * Math.cos(angleZ) * Math.cos(Shmup.angle.degree.radian(angle)) - Math.cos(angleX) * Math.sin(angleZ) * Math.sin(Shmup.angle.degree.radian(angle))) * dist + x,
        (Math.cos(angleY) * Math.sin(angleZ) * Math.cos(Shmup.angle.degree.radian(angle)) + Math.cos(angleX) * Math.cos(angleZ) * Math.sin(Shmup.angle.degree.radian(angle))) * dist + y,
      spd, angle);
      angle += 360 / count + 5.6;
    }
    angleX += Shmup.angle.degree.radian(0.5);
    angleY += Shmup.angle.degree.radian(0.75);
    angleZ += Shmup.angle.degree.radian(1);
    angle = Shmup.angle.degree.normalize(angle);
    spd += 0.03;
    if (spd > 3) {
      spd = 1;
      yield* Shmup.utils.wait(65);
    }
    yield* Shmup.utils.wait(2);
  }
}
var waitTime = 100;
function* example(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 3.75;
  var angle = 0, count = 6, dist = 0, flip = false,
  angleX = 0, angleY = 0, angleZ = 0, spd = 1;
  while (true) {
    for (let i = 1; i <= count; i ++) {
      CreateShot01(
        (Math.cos(angleY) * Math.cos(angleZ) * Math.cos(Shmup.angle.degree.radian(angle)) - Math.cos(angleX) * Math.sin(angleZ) * Math.sin(Shmup.angle.degree.radian(angle))) * dist + x,
        (Math.cos(angleY) * Math.sin(angleZ) * Math.cos(Shmup.angle.degree.radian(angle)) + Math.cos(angleX) * Math.cos(angleZ) * Math.sin(Shmup.angle.degree.radian(angle))) * dist + y,
      spd, angle + spd * 10 + dist);
      angle += 360 / count + 1;
    }
    angleX += Shmup.angle.degree.radian(0.25);
    //angleY += Shmup.angle.degree.radian(2);
    //angleY *= 1.01;
    angleZ += Shmup.angle.degree.radian(1);
    //angleZ *= 1.01;
    angle = Shmup.angle.degree.normalize(angle);
    spd += 0.03;
    if (flip === true) {
      dist -= 1;
      if (dist <= 0) {
        flip = false;
      }
    } else {
      dist += 1;
      if (dist > 200) {
        flip = true;
      }
    }
    if (spd > 3) {
      spd = 1;
      yield* Shmup.utils.wait(waitTime);
      waitTime --;
      if (waitTime < 0) {
        waitTime = 0;
      }
    }
    yield* Shmup.utils.wait(1);
  }
}
function* example(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 2;
  var angle = 0, count = 4, dist = 200;
  while (true) {
    for (let i = 1; i <= count; i ++) {
      var obj = CreateShot01(
        dist * Math.cos(Shmup.angle.degree.radian(angle)) + x,
        dist * Math.sin(Shmup.angle.degree.radian(angle)) + y,
      0, -angle);
      Shmup.utils.task({update: true}, [obj], turn1);
      angle += 360 / count + 47;
    }
    yield* Shmup.utils.wait(1);
  }
}
Shmup.utils.task({update: true, reset: false}, [], example);

var iMax = 300, iAngle = 0;
function* turn1(obj) {
  obj.angle += Shmup.angle.degree.radian(iAngle);
  iAngle += 49;
  for (let i = 0; i < iMax && !Shmup.utils.removed(obj); i ++) {
    obj.speed += 3 / iMax;
    yield;
  }
}

4 100

var d1 = document.getElementById("d1");
function* mainShot(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 2;
  var angle = -180, count = 4, dist = 200;
  for (let j = 0; j < 180; j ++) {
    for (let i = 1; i <= count; i ++) {
      var obj = CreateShot01(
        dist * Math.cos(Shmup.angle.degree.radian(angle)) + x,
        dist * Math.sin(Shmup.angle.degree.radian(angle)) + y,
      0, angle);
      Shmup.utils.task({update: true}, [obj], turn1);
    }
    angle += Number(d1.value);
    yield* Shmup.utils.wait(1);
  }
}
function* lockShot(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 2;
  var angle = 0, count = 4, dist = 200;
  for (let j = 0; j < 180; j ++) {
    for (let i = 1; i <= count; i ++) {
      var obj = CreateShot01(
        dist * Math.cos(Shmup.angle.degree.radian(angle)) + x,
        dist * Math.sin(Shmup.angle.degree.radian(angle)) + y,
      0, angle);
      Shmup.utils.task({update: true}, [obj], turn2);
    }
    angle += Number(d1.value);
    yield* Shmup.utils.wait(1);
  }
}
Shmup.utils.task({update: true, reset: false}, [], mainShot);
Shmup.utils.task({update: true, reset: false}, [], lockShot);

var iMax = 200, iAngle = 0;
function* turn1(obj) {
  yield* Shmup.utils.wait(20);
  obj.angle += Shmup.angle.degree.radian(iAngle);
  iAngle += 100;
  for (let i = 0; i < iMax && !Shmup.utils.removed(obj); i ++) {
    obj.radial += 2 / iMax;
    yield;
  }
}
var iMax2 = 200, iAngle2 = 0;
function* turn2(obj) {
  yield* Shmup.utils.wait(20);
  obj.angle += Shmup.angle.degree.radian(iAngle2);
  iAngle2 += 80;
  for (let i = 0; i < iMax2 && !Shmup.utils.removed(obj); i ++) {
    obj.radial += 2 / iMax2;
    yield;
  }
}

var waitTime = 200;
function* main(x, y) {
  x = x || Shmup.advanced.data.scene.x / 2;
  y = y || Shmup.advanced.data.scene.y / 3.75;
  var angle = 0, dist = 50, count = 75, tempA, obj, tempB = 70;
  while (true) {
    for (let i = 0; i < 1; i ++) {
      for (let j = 1; j <= count; j ++) {
        tempA = Shmup.angle.degree.radian(j * 360 / count);
        obj = CreateShot01(
          Math.cos(tempA) * dist + x,
          Math.sin(tempA) * dist + y,
          2,
          Shmup.angle.radian.degree(tempA) - 170 + angle
        );
        Shmup.utils.task({update: true}, [obj, -tempB], turn);
      }
      for (let j = 1; j <= count; j ++) {
        tempA = Shmup.angle.degree.radian(j * 360 / count);
        obj = CreateShot01(
          Math.cos(tempA) * dist + x,
          Math.sin(tempA) * dist + y,
          2,
          Shmup.angle.radian.degree(tempA) + 170 - angle
        );
        Shmup.utils.task({update: true}, [obj, tempB], turn);
      }
    }
    angle += 1;
    yield* Shmup.utils.wait(waitTime);
  }
}
function* changeWait() {
  yield* Shmup.utils.wait(20 * 60);
  waitTime = 150;
  yield* Shmup.utils.wait(20 * 60);
  waitTime = 100;
  yield* Shmup.utils.wait(20 * 60);
  waitTime = 50;
}
Shmup.utils.task({update: true, reset: false}, [], main);
Shmup.utils.task({update: true, reset: false}, [], changeWait);

var tC = 100;
function* turn(obj, angle) {
  yield* Shmup.utils.wait(50);
  for (let i = 1; i <= tC; i ++) {
    obj.angle += Shmup.angle.degree.radian(angle / tC);
    yield;
  }
}
*/
