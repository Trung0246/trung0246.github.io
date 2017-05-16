//Configs and stuff
var editor = ace.edit("script");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");
//editor.focus();
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
}`);

function Var(css) {
  var that = this;
  this.id = Number(String(Math.random()).replace("0.", "")).toString(36);
  var tempVal;
  if (css.type === "log") {
    tempVal = css.value;
    this.dom = $(`<div id="${this.id}" class="variables-input log">
  <span class="variables-name">${css.name}: </span>
  <span class="variables-value">${tempVal}</span>
</div>`);
  } else {
    tempVal = typeof css.value === "number" ? css.value : ((css.min + css.max) / 2);
    this.dom = $(`<div id="${this.id}" class="variables-input ${css.type}">
  <span class="variables-name">${css.name}: </span>
  <input class="variables-type" value="${tempVal}" min="${css.min}" max="${css.max}" step="${css.step}" type="${css.type}"/>
  <span class="variables-min">${css.min} ≤ </span>
  <span class="variables-value">${tempVal}</span>
  <span class="variables-max"> ≤ ${css.max}</span>
  <span class="variables-step">${css.step}</span>
</div>${css.down ? "<br/>" : ""}`);
    this.dom.children(".variables-type").on("input", function() {
      that.dom.children(".variables-value").html(that.dom.children(".variables-type").val());
    });
  }
  $("#variables").append(this.dom);
  return function(val) {
    if (css.type === "log") {
      tempVal = typeof val === "number" ? val : tempVal;
      that.dom.children(".variables-value").html(tempVal);
    } else {    
      if (typeof val === "number") {
        that.dom.children(".variables-type").val(val);
        tempVal = val;
      } else {
        tempVal = Number(that.dom.children(".variables-type").val());
      }
    }
    return tempVal;
  };
};

$("#run").click(function() {
  try {
    eval(editor.getValue());
  } catch (error) {
    alert(error);
  }
});

$("#clear-task").click(function() {
  Shmup.advanced.temp.routine = [];
  $("#variables").empty();
});

var deleteProjectile = false;

$("#clear-projectiles").click(function() {
  if (deleteProjectile === false) {
    deleteProjectile = true;
  } else {
    deleteProjectile = false;
  }
});

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

var scene = {x: 384 * 1.5, y: 448 * 1.5};

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
    laser: 1000,
    curveA: 1,
    curveB: 1000,
    curveNode: 100000,
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
  slow: 2,
  graphic: undefined,
};

PIXI.loader
  .add("player", "http://trung0246.com/touhou/hitbox.png")//https://cdn.rawgit.com/Trung0246/Shmup/0ca7ea5477e406ae02a690e74bb37cab05578e44/img/thHitbox.png")//https://cdn.rawgit.com/Trung0246/Shmup/a1eaa269512b4c1b198dffb58b9fd3023171a701/img/11669-16x16x32.png")
  //.add("bullet", "https://cdn.rawgit.com/Trung0246/Shmup/d934859990aa886a021a40377891845dd4185d77/img/down_arrow_icon.png")
  .add("shotSheet", "https://cdn.rawgit.com/Trung0246/Shmup/f8054fbd2f2fb25482076149c9d81e2b8041e408/img/Shot.png")//"https://i.sli.mg/bPRrPW.png")
  .add("shotSheet2", "https://raw.githubusercontent.com/Trung0246/trung0246.github.io/master/touhou/th128_BulletAll.png")
  .add("laserSheet", "https://raw.githubusercontent.com/Trung0246/trung0246.github.io/master/touhou/th128_LaserRotated.png")
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
  player.graphic.rotation += 0.075;
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

window.onbeforeunload = function (e) {
  e = e || window.event;

  // For IE and Firefox prior to version 4
  if (e) {
    e.returnValue = 'Sure?';
  }

  // For Safari
  return 'Sure?';
};
