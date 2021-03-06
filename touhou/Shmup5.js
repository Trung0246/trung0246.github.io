(function (window) {
  'use strict';
  /*
  Shmup.js v1.2.5

  MIT License

  Copyright (c) 2016-2017 Trung0246

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  */
  
  /*var oldSin = Math.sin;
  Math.sin = function(val) {
    return -oldSin(val);
  };*/
  
  //Important variable
  var main = {},       //Main holder
      data = {
        //angleType: "degree",
        //positionType: "object",
        maxProjectile: 0,
        frame: 0,
        scene: {
          x: 0,
          y: 0,
        },
        //maxGun: 0,
        //maxProcess: 0,
      },
      process = {    //Process holder, use for bullet left in playground when gun deleted
        active: [],
        wait: {},
      },
      temp = {       //Temp holder
        repeat: {},
        routine: [],
      };

  //Define current Shmup.js version string
  Object.defineProperty(main, "VERSION", {
    value: "1.2.5",
    writable: false,
    enumerable: true,
    configurable: true,
  });
  
  //Private class
  function Runner(configs, condition, param, actions, workData) {
    this.configs = configs;
    this.condition = condition;
    this.param = param;
    this.actions = actions;
    this.workData = workData || {};
    this.workData.process = this.workData.process || [];
    this.done = false;
    this.value = undefined;
    return this;
  }
  Runner.prototype = {
    next: function() {
      var tempData;
      if (this.workData.process.length <= 0 && this.configs.reset !== true && this.workData.jump) {
        return this.stop();
      } else if ((this.configs.reset === true && this.workData.process.length <= 0) || !this.workData.jump) {
        this.workData.process.push({
          location: 0,
          condition: this.condition,
          actions: this.actions,
        });
        this.workData.jump = {};
        this.done = false;
      }
      if (this.workData.process[this.workData.process.length - 1].func === "wait") {
        if (this.workData.process[this.workData.process.length - 1].condition(this.param, this.workData)) {
          return this.stop();
        } else {
          this.workData.process.pop();
        }
      }
      tempData = runHelper(this.param,
        this.workData.process[this.workData.process.length - 1].condition(this.param, this.workData) ||
        (this.workData.process[this.workData.process.length - 1].location < this.workData.process[this.workData.process.length - 1].actions.length &&
        this.workData.process[this.workData.process.length - 1].location !== 0),
      this.workData);
      if (tempData) {
        switch(tempData.func) {
          case "repeat": {
            return this.next();
          }
          break;
          case "wait": {
            return this.stop();
          }
          break;
        }
      } else {
        this.workData.process.pop();
        if (this.workData.process.length > 0) {
          return this.next();
        } else {
          this.done = true;
          return this.stop();
        }
      }
    },
    reset: function() {
      this.workData = {};
      this.workData.process = [];
      return this.next();
    },
    stop: function() {
      return this;
    },
  };
  
  //Runner helper
  function runHelper(param, tempBool, workData) {
    var tempData, value;
    while (tempBool) {
      while (workData.process[workData.process.length - 1].location < workData.process[workData.process.length - 1].actions.length) {
        if (typeof workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location] === "object") {
          switch (workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].func) {
            case "repeat": {
              tempData = workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location];
              workData.process[workData.process.length - 1].location += 1;
              tempData.location = 0;
              workData.process.push(tempData);
              return tempData;
            }
            break;
            case "wait": {
              if (workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].condition(param, workData)) {
                tempData = workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location];
                workData.process[workData.process.length - 1].location += 1;
                workData.process.push(tempData);
                return tempData;
              } else {
                workData.process[workData.process.length - 1].location += 1;
                if (workData.process[workData.process.length - 1].location >= workData.process[workData.process.length - 1].actions.length) {
                  tempData = {
                    func: "repeat",
                  };
                  return tempData;
                }
                workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location](param, workData);
              }
            }
            break;
            case "jump": {
              switch(workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].type) {
                case 0: {
                  if (!workData.jump[workData.process.length - 1]) {
                    workData.jump[workData.process.length - 1] = {};
                  }
                  workData.jump[workData.process.length - 1][workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].value] = workData.process[workData.process.length - 1].location;
                }
                break;
                case 1: {
                  if (workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].condition(param, workData)) {
                    if (typeof workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].value === "string") {
                      workData.process[workData.process.length - 1].location = workData.jump[workData.process.length - 1][workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].value];
                    } else {
                      workData.process[workData.process.length - 1].location = workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].value;
                    }
                  }
                }
                break;
              }
            }
            break;
            case "stop": {
              if (workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].condition(param, workData)) {
                switch (workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location].type) {
                  case 0: {
                    if (workData.process.length > 1) {
                      workData.process.pop();
                      workData.process[workData.process.length - 1].location -= 1;
                    } else {
                      workData.process[0].location = workData.process[workData.process.length - 1].actions.length - 1;
                      workData.process[0].condition = function () {
                        return false;
                      };
                    }
                  }
                  break;
                  case 1: {
                    workData.process[workData.process.length - 1].location = workData.process[workData.process.length - 1].actions.length - 1;
                  }
                  break;
                  case 2: {
                    for (var deleteCount = workData.process.length - 1; deleteCount >= 1; --deleteCount) {
                      workData.process.splice(deleteCount, 1);
                    }
                    workData.process[0].location = workData.process[workData.process.length - 1].actions.length - 1;
                    workData.process[0].condition = function () {
                      return false;
                    };
                  }
                  break;
                }
              }
            }
            break;
            default: {
              throw new Error("Invalid action at " + workData.process[workData.process.length - 1].location);
            }
          }
        } else {
          workData.process[workData.process.length - 1].actions[workData.process[workData.process.length - 1].location](param, workData);
        }
        workData.process[workData.process.length - 1].location += 1;
      }
      tempBool = workData.process[workData.process.length - 1].condition(param, workData);
      workData.process[workData.process.length - 1].location = 0;
    }
    return;
  }
  
  function Tasker(configs, param, task) {
    this.task = task;
    this.param = param || [];
    this.configs = configs || {};
    this.configs.update = configs.update || false;
    this.configs.reset = configs.reset || false;
    this.configs.callback = configs.callback || function () {};
    if (!param) {
      this.tempTask = this.task();
    } else {
      this.tempTask = this.task.apply(this, param);
    }
    return this;
  }
  Tasker.prototype = {
    next: function () {
      this.returnData = this.tempTask.next();
      this.returnData.task = this.task;
      this.returnData.iterate = this.tempTask;
      this.configs.callback(this.returnData);
      return this.returnData;
    },
    reset: function () {
      this.tempTask = this.task();
      this.returnData = this.returnData || {};
      this.returnData.task = this.task;
      this.returnData.iterate = this.tempTask;
      this.returnData.value = undefined;
      this.returnData.done = false;
      this.configs.callback(this.returnData);
      return this.returnData;
    },
  };
  
  //Public class
  //Projectile classes
  main.projectile = {};

  main.configs = function (configsData) {
    data.maxProjectile = configsData.maxProjectile || (function () {
      throw new Error("Unknown maxProjectile");
    })();
    for (var key in main.projectile) {
      if (main.projectile.hasOwnProperty(key)) {
        if (!main.projectile[key].data) {
          throw new Error("Unknown data holder of projectile " + key);
        }
        if (!main.projectile[key].data.data) {
          main.projectile[key].data.data = undefined;
        }
        if (!main.projectile[key].data.type) {
          main.projectile[key].data.type = key;
        }
        if (!main.projectile[key].data.update) {
          main.projectile[key].data.update = undefined;
        }
        /*if (!main.projectile[key].data.temp) {
          main.projectile[key].data.temp = {};
        }*/
        if (!process.wait[key]) {
          if (typeof data.maxProjectile === "number") {
            process.wait[key] = new Pool(main.projectile[key].data, data.maxProjectile, true);
          } else if (data.maxProjectile[key]) {
            process.wait[key] = new Pool(main.projectile[key].data, data.maxProjectile[key], true);
          } else {
            throw new Error("Unknown pool size of " + key);
          }
        }
      }
    }
    return;
  };
  
  main.update = function () {
    data.frame += 1;
    for (var subCount = temp.routine.length - 1; subCount >= 0; --subCount) {
      var result = temp.routine[subCount].next();
      if (result.done === true || temp.routine[subCount].configs.update === false) {
        if (temp.routine[subCount].configs.reset === true) {
          temp.routine[subCount].reset();
          subCount ++;
        } else {
          temp.routine.splice(subCount, 1);
        }
      }
    }
    for (var projectileCount = process.active.length - 1; projectileCount >= 0; --projectileCount) {
      main.projectile[process.active[projectileCount].type].update(process.active[projectileCount]);
      process.active[projectileCount].update(process.active[projectileCount]);
      if (process.active[projectileCount].update === undefined) {
        process.active.splice(projectileCount, 1);
      }
    }
  };

  //DSL class
  main.dsl = {
    run: function (configs, condition, param, actions, workData) {
      var tempRun = new Runner(configs, condition, param, actions, workData);
      if (configs.update === true) {
        temp.routine.push(tempRun);
      }
      if (configs.auto === true && configs.update !== true) {
        tempRun = tempRun.next();
      }
      return tempRun;
    },
    repeat: function (condition, actions) {
      return {
        func: "repeat",
        location: 0,
        condition: condition,
        actions: actions,
      };
    },
    wait: function (condition) {
      return {
        func: "wait",
        condition: condition,
      };
    },
    stop: function (type, condition) {
      return {
        func: "stop",
        type: type,
        condition: condition,
      };
    },
    jump: function (type, value, condition) {
      return {
        func: "jump",
        type: type,
        condition: condition,
        value: value,
      };
    },
  };
  
  //Utilities class
  main.utils = {
    loop: {
      count: function (count, func) {
        var type = "";
        for (let loopCount = 0; loopCount < count; loopCount ++) {
          if (type === "continue") {
            type = "";
            continue;
          }
          type = func(loopCount);
          if (type === "break") {
            break;
          } else if (typeof type === "number") {
            count = type;
            type = "";
          }
        }
      },
      ascent: function (count1, count2, func) {
        var type;
        func = func || function() {};
        for (let loopCount = count1; loopCount < count2; loopCount ++) {
          if (type === "continue") {
            type = "";
            continue;
          }
          type = func(loopCount);
          if (type === "break") {
            break;
          } else if (typeof type === "number") {
            count = type;
            type = "";
          }
        }
      },
      descent: function (count1, count2, func) {
        var type;
        func = func || function() {};
        for (let loopCount = count2 - 1; loopCount >= count1; -- loopCount) {
          if (type === "continue") {
            type = "";
            continue;
          }
          type = func(loopCount);
          if (type === "break") {
            break;
          } else if (typeof type === "number") {
            count = type;
            type = "";
          }
        }
      },
    },
    task: function (configs, param, task) {
      if (!task) {
        throw new Error("No task to run");
      }
      var pushTask = new Tasker(configs, param, task);
      if (configs.update === true) {
        temp.routine.push(pushTask);
      }
      return pushTask;
    },
    count: function (data) {
      data = data || {};
      data.change = data.change || 1;
      if (typeof data.max !== "number" || typeof data.min !== "number") {
        throw new Error("Min or max is not number");
      }
      if (((data.change > data.max && data.max > 0) || (data.change < data.max && data.max < 0)) ||
      ((data.change < data.min && data.min > 0) || (data.change > data.min && data.min < 0))) {
        throw new Error("Change value is larger or smaller than maximum");
      }
      if (data.change === 0) {
        throw new Error("Change value must not be 0");
      }
      var current = data.min - data.change || 0;
      function checkDone() {
        if (data.keep === true) {
          current = data.min + (current - data.max);
        } else {
          current = data.min;
        }
      }
      return function (value, change) {
        current = value || current;
        data.change = change || data.change;
        if (data.change < 0) {
          if (current <= data.max && data.reset === true) {
            checkDone();
          } else if (current > data.max) {
            current += data.change;
          }
        } else {
          if (current >= data.max && data.reset === true) {
            checkDone();
          } else if (current < data.max) {
            current += data.change;
          }
        }
        return current;
      };
    },
    out: function (type, position, x, y, margin) {
      margin = margin || 0;
      switch (type) {
        case 0: {
          if (position.y < -margin) {
            return 1;
          } else if (x + margin < position.x) {
            return 2;
          } else if (y + margin < position.y) {
            return 3;
          } else if (position.x < -margin) {
            return 4;
          } else {
            return 0;
          }
        }
        break;
        case 1: {
          return position.y < -margin;
        }
        break;
        case 2: {
          return x + margin < position.x;
        }
        break;
        case 3: {
          return y + margin < position.y;
        }
        break;
        case 4: {
          return position.x < -margin;
        }
        break;
        default: {
          return position.x < -margin || x + margin < position.x || position.y < margin || y + margin < position.y;
        }
      }
    },
    teleport: function (type, position, x, y, margin) {
      var tempPos = {
        x: position.x,
        y: position.y,
      };
      if (tempPos.x < -margin) {
        tempPos.x += x;
      } else if (x + margin < tempPos.x) {
        tempPos.x -= x;
      } else if (tempPos.y < -margin) {
        tempPos.y += y;
      } else if (y + margin < tempPos.y) {
        tempPos.y -= y;
      }
      return tempPos;
    },
    wait: function* (data, func) {
      var type;
      func = func || function() {};
      if (typeof data === "number") {
        for (let waitCount = 1; waitCount <= data; waitCount ++) {
          type = func(waitCount);
          yield;
          if (type === "continue") {
            type = "";
            continue;
          } else if (type === "break") {
            break;
          } else if (typeof type === "number") {
            count = type;
            type = "";
          }
        }
      } else {
        while (data) {
          type = func(data);
          yield;
          if (type === "continue") {
            type = "";
            continue;
          } else if (type === "break") {
            break;
          }
        }
      }
    },
    removed: function(projectile) {
      return process.active.indexOf(projectile) === -1;
    },
  };
  
  //Boolean class
  main.bool = {
    nand: function (a, b) {
      return !(a && b);
    },
    nor: function (a, b) {
      return !(a || b);
    },
    xor: function (a, b) {
      return a ? !b : !!b;
    },
    xnor: function (a, b) {
      return !main.utils.bool.xor(a, b);
    },
    xand: function (a, b) {
      return (!!a && !b);
    },
    xnand: function (a, b) {
      return (!!a || !b);
    },
    all: function (x) {
      for (let loopCount = 0; loopCount < x.length; loopCount ++) {
        if (x[loopCount] != true) {
          return false;
        } else if (loopCount >= x.length - 1) {
          return true;
        }
      }
    },
    nall: function(x) {
      for (let loopCount = 0; loopCount < x.length; loopCount ++) {
        if (x[loopCount] == true) {
          return true;
        }
      }
      return false;
    },
  };
  
  //Math class
  main.constant = {
    //https://en.wikipedia.org/wiki/Golden_angle
    //https://en.wikipedia.org/wiki/Universal_parabolic_constant
    HALFPI: Math.PI / 2,
    TAU: Math.PI * 2,
    PHI: (1 + Math.sqrt(5)) / 2,
    SILVER: 1 + Math.sqrt(2),
    UPC: Math.log(1 + Math.sqrt(2)) + Math.sqrt(2),
  };
  main.math = {
    gcd: function(a, b) {
      return !b ? a : main.math.gcd(b , a % b);
    },
    lcm: function(a, b) {
      return (a * b) / main.math.gcd(a, b);
    },
    round: function (x, e) {
      e = e || 12;
      return Math.round((x) * Math.pow(10, e)) / Math.pow(10, e);
    },
    range: function (x, a, b, c, d, acc) {
      if (c === true && d === true) {
        return x >= (a * acc) && x <= (b * acc);
      } else if (c === true) {
        return x >= (a * acc) && x < (b * acc);
      } else if (d === true) {
        return x > (a * acc) && x <= (b * acc);
      } else {
        return x > (a * acc) && x < (b * acc);
      }
    },
    cmp: function (a, b, acc, equal, rev) {
      if (rev === true) {
        if (equal === true) {
          return a <= (b * acc);
        } else {
          return a < (b * acc);
        }
      } else {
        if (equal === true) {
          return a >= (b * acc);
        } else {
          return a > (b * acc);
        }
      }
    },
    clamp: function (x, a, b) {
      return Math.max(a, Math.min(b, x));
    },
    map: function (x, a, b, c, d) {
      var percent = (x - a) / (b - a);
      return c + percent * (d - c);
    },
    rem: function (a, b) {
      //http://stackoverflow.com/questions/34291760/
       var res = a % b;
       if (res < 0)
          res += b;
       return res;
    },
    fact: function (x) {
      var result = 1;
      if (x > 0) {
        for (let count = 1; count <= x; count ++) {
          result *= count;
        }
      } else if (x < 0) {
        for (let count = -1; count >= x; count --) {
          result *= count;
        }
      } else {
        result = 1;
      }
      return result;
    },
    norm: function (x, a, b) {
      return main.math.map(x, a, b, 0, 1);
    },
    binom: function (a, b) {
      var result = 1;
      for (var i = 1; i <= b; i++) {
        result *= ((a - (i - 1)) / i);
      }
      return result;
    },
    rand: (function () {
      var y2 = 0, previous = false, perlin;
      var PERLIN_YWRAPB = 4;
      var PERLIN_YWRAP = 1<<PERLIN_YWRAPB;
      var PERLIN_ZWRAPB = 8;
      var PERLIN_ZWRAP = 1<<PERLIN_ZWRAPB;
      var PERLIN_SIZE = 4095;
      var scaled_cosine = function(i) {
        return 0.5*(1.0-Math.cos(i*Math.PI));
      };
      function rand (min, max, seed, larger, equal, generate, exception) {
        var returnValue;
        /*if (options.round == true) {
          returnValue = Number(Math.floor(options.generate(options.seed) * (options.max - options.min + 1)) + options.min);
        } else {
          returnValue = Number(options.generate(options.seed) * (options.max - options.min) + options.min);
        }*/
        returnValue = generate(seed);
        if (min > max) {
          if (larger == null) {
            returnValue = 0;
          } else {
            returnValue = larger;
          }
        } else if (min == max) {
          if (equal == null) {
            returnValue = min;
          } else {
            returnValue = equal;
          }
        }
        if (min == undefined) {
          returnValue = returnValue;
        } else if (max == undefined) {
          returnValue = returnValue * min;
        } else {
          returnValue = returnValue * (max - min) + min;
        }
        if (exception.length > 0 && exception.indexOf(returnValue) < 0) {
          if (seed) {
            throw new Error("Seed rand return " + returnValue + ", but this number inside exception array.");
          } else {
            returnValue = rand(min, max, seed, larger, equal, generate, exception);
          }
        }
        return returnValue;
      }
      function gaussian (mean, sd, randValue) {
        var y1,x1,x2,w;
        if (previous) {
          y1 = y2;
          previous = false;
        } else {
          do {
            x1 = randValue - 1;
            x2 = randValue - 1;
            w = x1 * x1 + x2 * x2;
          } while (w >= 1);
          w = Math.sqrt((-2 * Math.log(w))/w);
          y1 = x1 * w;
          y2 = x2 * w;
          previous = true;
        }
        return y1 * sd + mean;
      }
      function noise (x, y, z, lod, falloff, seed) {

        perlin = new Array(PERLIN_SIZE + 1);
        perlin[0] = rand(undefined, undefined, seed);
        for (var i = 1; i < PERLIN_SIZE + 1; i++) {
          perlin[i] = rand();
        }

        if (x<0) { x=-x; }
        if (y<0) { y=-y; }
        if (z<0) { z=-z; }

        var xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
        var xf = x - xi;
        var yf = y - yi;
        var zf = z - zi;
        var rxf, ryf;

        var r=0;
        var ampl=0.5;

        var n1,n2,n3;

        for (var o=0; o<lod; o++) {
          var of=xi+(yi<<PERLIN_YWRAPB)+(zi<<PERLIN_ZWRAPB);

          rxf = scaled_cosine(xf);
          ryf = scaled_cosine(yf);

          n1  = perlin[of&PERLIN_SIZE];
          n1 += rxf*(perlin[(of+1)&PERLIN_SIZE]-n1);
          n2  = perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
          n2 += rxf*(perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n2);
          n1 += ryf*(n2-n1);

          of += PERLIN_ZWRAP;
          n2  = perlin[of&PERLIN_SIZE];
          n2 += rxf*(perlin[(of+1)&PERLIN_SIZE]-n2);
          n3  = perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
          n3 += rxf*(perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n3);
          n2 += ryf*(n3-n2);

          n1 += scaled_cosine(zf)*(n2-n1);

          r += n1*ampl;
          ampl *= falloff;
          xi<<=1;
          xf*=2;
          yi<<=1;
          yf*=2;
          zi<<=1;
          zf*=2;

          if (xf>=1.0) { xi++; xf--; }
          if (yf>=1.0) { yi++; yf--; }
          if (zf>=1.0) { zi++; zf--; }
        }
        return r;
      }
      return function (options) {
        options = options || {};
        options.generate = options.generate || function (seed) {
          Math.seedrandom(seed);
          return Math.random();
        };
        options.min = options.min || 0;
        if (options.max == undefined) {
          options.max = 1;
        }
        options.seed = options.seed || undefined;
        options.exception = options.exception || [];
        options.larger = options.larger || 0;
        options.equal = options.equal || options.min;
        if (options.gaussian) {
          options.gaussian.mean = options.gaussian.mean || 0;
          options.gaussian.sd = options.gaussian.sd || 1;
        }
        if (options.noise) {
          options.noise.x = options.noise.x || 0;
          options.noise.y = options.noise.y || 0;
          options.noise.z = options.noise.z || 0;
          options.noise.octaves = options.noise.octaves > 0 ? options.noise.octaves : 4;
          options.noise.falloff = options.noise.falloff > 0 ? options.noise.falloff : 0.5;
        }
        options.weight = options.weight || [];
        var total = 0, randValue;
        if (options.gaussian) {
          return gaussian(options.gaussian.mean, options.gaussian.sd, rand(2));
        } else if (options.noise) {
          return noise(options.noise.x, options.noise.y, options.noise.z, options.noise.octaves, options.noise.falloff, options.seed);
        } else {
          if (options.weight.length > 0) {
            for (let i = 0; i < options.weight.length; i ++) {
              total += options.weight[i].chance;
            }
            randValue = rand(0, total, options.seed, options.larger, options.equal, options.generate, options.exception);
            for (let i = 0; i < options.weight.length; i ++) {
              if (randValue < total) {
                return options.weight[i].value;
              }
              randValue -= options.weight[i].chance;
            }
          } else {
            return rand(options.min, options.max, options.seed, options.larger, options.equal, options.generate, options.exception);
          }
        }
      }
    })(),
  };
  main.angle = {
    rad: {
      norm: function (x) {
        x = x % main.constant.TAU;
        while (x <= -Math.PI) {
          x += main.constant.TAU;
        }
        while (Math.PI < x) {
          x -= main.constant.TAU;
        }
        return x;
      },
      deg: function (x) {
        return (x % main.constant.TAU) * (180 / Math.PI);
      },
      full: function (x) {
        return (main.constant.TAU + (x % main.constant.TAU)) % main.constant.TAU;
      },
    },
    deg: {
      norm: function (x) {
        x = x % 360;
        while (x <= 0) {
          x += 360;
        }
        while (180 < x) {
          x -= 360;
        }
        return x;
      },
      rad: function (x) {
        return (x % 360) * (Math.PI / 180);
      },
      full: function (x) {
        return (360 + (x % 360)) % 360;
      },
    },
    point: function (a, b) {
      return Math.atan2(b.y - a.y, b.x - a.x);
      //When rev sin: return Math.atan2(start.y - target.y, target.x - start.x);
    },
    relf: function (x, y) {
      return 2 * y - x;
    },
    diff: function (a, b) {
      //http://stackoverflow.com/questions/12234574/
      return (a - b + Math.PI * 3) % main.constant.TAU - Math.PI;
    },
    betw: function (a, b, x) {
      //www.xarg.org/2010/06/is-an-angle-betw-two-other-angles/
      x = main.angle.rad.full(x);
      a = main.angle.rad.full(a);
      b = main.angle.rad.full(b);
      if (a < b) {
        return a <= x && x <= b;
      } else {
        return a <= x || x <= b;
      }
    },
    scale: function (a, b, scale, over, base) {
      //Act like main.line.on, but with angle
      //TODO: when range (ex: -45 to 45), the 0 one make it go counter-clock instead backward, add new variable "over" to fix this, may add base to fix direction of 0 deg
      base = base || 0;
      return main.angle.rad.norm((main.angle.rad.full(b) - main.angle.rad.full(a)) * scale + main.angle.rad.full(a));
    },
  };
  main.point = {
    dist: function (type, a, b, sqd) {
      var result;
      type = type || false;
      if (type === true) {
        result = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
      } else {
        result = Math.pow(a, 2) + Math.pow(b, 2);
      }
      if (sqd === true) {
        return Math.sqrt(result);
      } else {
        return result;
      }
    },
    rot: function (a, b, x, dist) {
      var rotX, rotY, rotZ;
      if (typeof x === "number") {
        rotX = Math.cos(x),
        rotY = Math.sin(x);
        return {
          x: (rotX * (b.x - a.x)) - (rotY * (b.y - a.y)) + a.x,
          y: (rotX * (b.y - a.y)) + (rotY * (b.x - a.x)) + a.y,
        };
      } else {
        dist = dist || main.point.dist(true, a, b, true);
        rotX = Math.cos(x.x);
        rotY = Math.cos(x.y);
        rotZ = Math.cos(x.z);
        var //rotX2 = Math.sin(angle.x),
        //rotY2 = Math.sin(angle.y),
        rotZ2 = Math.sin(x.z),
        rotP = Math.cos(x.point),
        rotP2 = Math.sin(x.point);
        return {
          x: (rotY * rotZ * rotP - rotX * rotZ2 * rotP2) * dist + a.x,
          y: (rotY * rotZ2 * rotP + rotX * rotZ * rotP2) * dist + a.y,
        };
      }
    },
    dil: function (a, b, x) {
      //like laser when instant set to false
      var tempLength = main.point.dist(true, a, b, true) * x, angle = main.angle.point(a, b);
      return {
        x: Math.cos(angle) * tempLength + a.x,
        y: Math.sin(angle) * tempLength + a.y,
        radial: tempLength,
        angle: angle,
      };
    },
    angle: function (a, b, c) {
      return Math.acos((main.point.dist(true, c, a, false) + main.point.dist(true, c, b, false) - main.point.dist(true, a, b, false)) / (2 * main.point.dist(true, c, a, true) * main.point.dist(true, c, b, true)));
    },
    cntr: function (a, b, c) {
      var q, dataOne, dataTwo, dataThree;
      if (typeof c === "number") {
        //stackoverflow.com/questions/4914098
        q = main.point.dist(true, b, a, true);
        dataThree = c;
        c = {};
        c.x = (a.x + b.x) / 2;
        c.y = (a.y + b.y) / 2;
        dataOne = Math.sqrt(Math.pow(dataThree, 2) - Math.pow(q / 2, 2)) * (a.y - b.y) / q;
        dataTwo = Math.sqrt(Math.pow(dataThree, 2) - Math.pow(q / 2, 2)) * (b.x - a.x) / q;
        return {
          x1: c.x + dataOne,
          y1: c.y + dataTwo,
          x2: c.x - dataOne,
          y2: c.y - dataTwo,
        };
      } else {
        //http://stackoverflow.com/questions/4958161
        q = b.x * b.x + b.y * b.y;
        dataOne  = (a.x * a.x + a.y * a.y - q) / 2;
        dataTwo  = (q - c.x * c.x - c.y * c.y) / 2;
        dataThree = (a.x - b.x) * (b.y - c.y) - (b.x - c.x) * (a.y - b.y);
        if (Math.abs(dataThree) > 1e-10) {
          return {
            x: (dataOne * (b.y - c.y) - dataTwo * (a.y - b.y)) / dataThree,
            y: ((a.x - b.x) * dataTwo - (b.x - c.x) * dataOne) / dataThree,
          };
        }
      }
    },
  };
  main.line = {
    slope: function (a, b) {
      return (b.y - a.y) / (b.x - a.x);
    },
    intr: function (a, b, c, d) {
      //http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
      //http://stackoverflow.com/questions/39819001/
      var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false,
      };
      denominator = ((d.y - c.y) * (b.x - a.x)) - ((d.x - c.x) * (b.y - a.y));
      if (denominator === 0) {
        if ((a.x - c.x) * (a.y - d.y) - (a.x - d.x) * (a.y - c.y) === 0 ||
        (b.x - c.x) * (b.y - d.y) - (b.x - d.x) * (b.y - c.y) === 0) {
          result.onLine2 = result.onLine1 = (a.x <= d.x && b.x >= c.x && a.y <= d.y && b.y >= c.y);
        }
        return result;
      }
      a = a.y - c.y;
      b = a.x - c.x;
      numerator1 = ((d.x - c.x) * a) - ((d.y - c.y) * b);
      numerator2 = ((b.x - a.x) * a) - ((b.y - a.y) * b);
      a = numerator1 / denominator;
      b = numerator2 / denominator;
      result.x = a.x + (a * (b.x - a.x));
      result.y = a.y + (a * (b.y - a.y));
      if (a >= 0 && a <= 1) {
        result.onLine1 = true;
      }
      if (b >= 0 && b <= 1) {
        result.onLine2 = true;
      }
      return result;
    },
    dist: function (type, a, b, x, sqd) {
      //http://stackoverflow.com/questions/31346862/
      //http://stackoverflow.com/questions/849211/
      if (type === true) {
        //perpendicular dist
        return Math.abs((b.y - a.y) * x.x - (b.x - a.x) * x.y + b.x * a.y - b.y * a.x) / main.point.dist(true, a, b, true);
      } else {
        var l2 = main.point.dist(true, a, b, false);
        if (l2 === 0) {
          return main.point.dist(true, x, a, false);
        }
        var t = ((x.x - a.x) * (b.x - a.x) + (x.y - a.y) * (b.y - a.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return main.point.dist(true, x, {
          x: a.x + t * (b.x - a.x),
          y: a.y + t * (b.y - a.y)
        }, sqd);
      }
    },
    on: function (a, b, x) {
      //http://jsfiddle.net/3SY8v/
      var xlen = b.x - a.x;
      var ylen = b.y - a.y;
      var smallerXLen = xlen * x;
      var smallerYLen = ylen * x;
      return {
        x: a.x + smallerXLen,
        y: a.y + smallerYLen,
      };
    },
    betw: function(a, b, x) {
      //http://stackoverflow.com/questions/14371841
      var dist1 = main.point.dist(true, a, x, true),
          dist2 = main.point.dist(true, b, x, true),
          dist5 = main.point.dist(true, a, b, false);
      var delta = dist1 + (dist2 - dist1) / 2;
      var dist3 = dist1 * dist1 - delta * delta,
          dist4 = dist2 * dist2 - delta * delta;
      return !(dist3 > dist5 || dist4 > dist5);
    },
    getX: function (a, b, x) {
      var a_numberator = b.y - a.y;
      var a_denominator = b.x - a.x;
      if (a_numberator === 0) {
        return null;//b.x; //parallel
      } else {
        var a = a_numberator / a_denominator;
        var yDist = x - b.y;
        var xDist = yDist / a;
        var x3 = b.x + xDist;
        return x3;
      }
    },
    getY: function (a, b, x) {
      var a_numberator = b.y - a.y;
      var a_denominator = b.x - a.x;
      if (a_denominator === 0) {
        return null;//b.y;
      } else {
        var a = a_numberator / a_denominator;
        var xDist = x - b.x;
        var yDist = xDist * a;
        var y3 = b.y + yDist;
        return y3;
      }
    },
  };
  main.vector = {
    //http://www.metanetsoftware.com/technique/tutorialA.html (also tutorialB)
    pol: function (x) {
      return {
        angle: main.angle.point({x: 0, y: 0}, x),
        radial: main.point.dist(true, {x: 0, y: 0}, x, true),
      };
    },
    rec: function (x, y) {
      y = y || {};
      y.x = y.x || 0;
      y.y = y.y || 0;
      return {
        x: Math.cos(x.angle) * x.radial + y.x,
        y: Math.sin(x.angle) * x.radial + y.y,
      };
    },
    norm: function (x) {
      var length = main.vector.mag(x, true);
      return {
        x: x.x / length,
        y: x.y / length,
      };
    },
    scale: function (x, y) {
      return {
        x: x.x * y,
        y: x.y * y,
      };
    },
    trunc: function (x, y) {
      var scale = y / main.vector.mag(x);
      scale = scale < 1.0 ? scale : 1.0;
      return main.vector.scale(x, scale);
    },
    mag: function (x, y) {
      var tempUnSq = main.vector.dot(x, x);
      if (y) {
        return Math.sqrt(tempUnSq);
      } else {
        return tempUnSq;
      }
    },
    on: function (a, b, x) {
      if ((a.angle || a.radial) && !(a.x || a.y)) {
        a.x = Math.cos(a.angle) * a.radial;
        a.y = Math.sin(a.angle) * a.radial;
      }
      if ((b.angle || b.radial) && !(b.x || b.x)) {
        b.x = Math.cos(b.angle) * b.radial;
        b.y = Math.sin(b.angle) * b.radial;
      }
      return main.line.on(a, b, x || 0.5);
    },
    dot: function (a, b) {
      //Heavily related to cosine
      return a.x * b.x + a.y * b.y;
    },
    cross: function (a, b) {
      //Heavily related to sine
      return a.x * b.y - a.y * b.x;
    },
    proj: function (a, b) {
      return main.vector.scale(b, main.vector.dot(a, b) / main.vector.mag(b, false)); //length b squared?
      //If b is the unit vector, dist = 1, and thus a projected onto b reduces to: proj.x = dotproduct*b.x; proj.y = dotproduct*b.y;
    },
    per: function (x) {
      return {
        x1: -x.y, //right
        y1: x.x,
        x2: x.y, //left
        y2: -x.x,
      };
    },
    lerp: function (a, b, x) {
      return {
        x: (b.x - a.x) * x + a.x,
        y: (b.y - a.y) * x + a.y,
      };
    },
    head: function (x) {
      return -Math.atan2(-x.y, x.x);
    },
    rev: function (x) {
      return {
        x: -x.x,
        y: -x.y,
      };
    },
  };
  main.trig = {
    crd: function (x) {
      return 2 * Math.sin(x / 2);
    },
    exsec: function (x) {
      return main.trig.sec(x) - 1;
    },
    excsc: function (x) {
      return main.trig.csc(x) - 1;
    },
    aexsec: function (x) {
      return main.trig.asec(x + 1);
    },
    aexcsc: function (x) {
      return main.trig.acsc(x + 1);
    },
    vsin: function (x) {
      return 1 - Math.cos(x);
    },
    vcos: function (x) {
      return 1 + Math.cos(x);
    },
    cvsin: function (x) {
      return 1 - Math.sin(x);
    },
    cvcos: function (x) {
      return 1 + Math.sin(x);
    },
    hvsin: function (x) {
      return main.trig.vsin(x) / 2;
    },
    hvcos: function (x) {
      return main.trig.vcos(x) / 2;
    },
    hcvsin: function (x) {
      return main.trig.cvsin(x) / 2;
    },
    hcvcos: function (x) {
      return main.trig.cvcos(x) / 2;
    },
    avsin: function (x) {
      return Math.acos(1 - x);
    },
    avcos: function (x) {
      return Math.acos(1 + x);
    },
    acvsin: function (x) {
      return Math.asin(1 - x);
    },
    acvcos: function (x) {
      return Math.asin(1 + x);
    },
    ahvsin: function (x) {
      return 2 * Math.asin(Math.sqrt(x));
    },
    ahvcos: function (x) {
      return 2 * Math.acos(Math.sqrt(x));
    },
    csc: function (x) {
      return 1 / Math.sin(x);
    },
    csch: function (x) {
      return 1 / Math.sinh(x);
    },
    sec: function (x) {
      return 1 / Math.cos(x);
    },
    sech: function (x) {
      return 1 / Math.cosh(x);
    },
    cot: function (x) {
      return 1 / Math.tan(x);
    },
    coth: function (x) {
      return 1 / Math.tanh(x);
    },
    acsc: function (x) {
      return 1 / Math.asin(x);
    },
    acsch: function (x) {
      return 1 / Math.asinh(x);
    },
    asec: function (x) {
      return 1 / Math.acos(x);
    },
    asech: function (x) {
      return 1 / Math.acosh(x);
    },
    acot: function (x) {
      return 1 / Math.atan(x);
    },
    acoth: function (x) {
      return 1 / Math.atanh(x);
    },
  };
  main.tween = {
    linear: function (start, end, time) {
      return start + time * (end - start);
    },
    smoothStep: function (order, start, end, time) {
      if (order <= 0 || time < 0 || time > 1) {
        throw new Error("smoothStep out of range");
      }
      switch (order) {
        case 2: {
          return start + Math.pow(time, 2) * (3 - 2 * time) * (end - start);
        }
        break;
        case 3: {
          return start + Math.pow(time, 3) * (time * (time * 6 - 15) + 10) * (end - start);
        }
        break;
        case 4: {
          return start + Math.pow(time, 4) * (35 + time * (-84 + (70 - 20 * time) * time)) * (end - start);
        }
        break;
        case 5: {
          return start + Math.pow(time, 5) * (126 + 5 * time * (-84 + time * (108 + 7 * time * (-9 + 2 * time)))) * (end - start);
        }
        break;
        case 6: {
          return start + Math.pow(time, 6) * (462 + time * (-1980 - 7 * time * (-495 + 2 * time * (220 + 9 * time * (-11 + 2 * time))))) * (end - start);
        }
        break;
        case 7: {
          return start + Math.pow(time, 7) * (1716 + 7 * time * (-1287 + 2 * time * (1430 + 3 * time * (-572 + time * (390 + 11 * time * (-13 + 2 * time)))))) * (end - start);
        }
        break;
        default: {
          var result = 0;
          for (var n = 0; n <= order - 1; n++) {
            result += (main.math.binom(-order, n) * main.math.binom(2 * order - 1, order - n - 1) * Math.pow(time, order + n));
          }
          return main.tween.linear(start, end, result);
        }
      }
    },
    acceleration: function (start, end, time) {
      var temp = Math.pow(time, 2);
      return (end * temp) + (start * (1 - temp));
    },
    deceleration: function (start, end, time) {
      //var temp = 1 - (1 - time) * (1 - time);
      var temp = 1 - Math.pow(1 - time, 2);
      return (end * temp) + (start * (1 - temp));
    },
    overShoot: function (start, end, time, mag) {
      time = main.tween.deceleration(0, 1, time);
      return start + time * (end-start) * (1 + Math.sin(time * Math.PI) * mag); //180 in sin?
    },
  };
  
  //Advanced stuff
  main.advanced = {
    debugMode: function () {
      debugger;
    },
    process:  process,
    data: data,
    temp: temp,
  };

  //Plugin class
  main.plugins = {
    projectile: function (type, data) {
      main.projectile[type] = data;
    },
    utils: function (type, data) {
      main.utils[type] = data;
    },
    math: function (type, data) {
      main.math[type] = data;
    },
    main: function (type, data) {
      main[type] = data;
    },
  };

  //Do not touch these code
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return main;
    });
    return;
  }
  if ('undefined' !== typeof module && module.exports) {
    module.exports = main;
    return;
  }
  window.Shmup = main;
  console.log("Shmup.js loaded successfully, version " + Shmup.VERSION);
}(('undefined' !== typeof window) ? window : {}));

//Necessary library

(function () {
  var getTime;
  (function () {
    if (window.performance && (window.performance.now || window.performance.webkitNow)) {
      var perfNow = window.performance.now ? 'now' : 'webkitNow';
      getTime = window.performance[perfNow].bind(window.performance);
    } else {
      getTime = function () {
        return +new Date();
      };
    }
  }());
  var configs = {
    smoothing: 10,
    maxMs: 0,
  };
  var time,
      thisFrameTime = 0,
      lastLoop = getTime() - configs.maxMs,
      frameTime = configs.maxMs, //maximum ms
      frameStart = 0; //smooth value
  Shmup.advanced.performance = {
    ms: 0,
    fps: 60,
  };
  Shmup.advanced.performance.configs = function (data) {
    configs.smoothing = data.smoothing || 1;
    configs.maxMs = data.maxMs;
    lastLoop = getTime() - configs.maxMs;
    frameTime = configs.maxMs;
  };
  Shmup.advanced.performance.start = function () {
    frameStart = getTime();
  };
  Shmup.advanced.performance.end = function () {
    time = getTime();
    thisFrameTime = time - lastLoop;
    frameTime += (thisFrameTime - frameTime) / configs.smoothing;
    Shmup.advanced.performance.fps = 1000 / frameTime;
    Shmup.advanced.performance.ms = frameStart < lastLoop ? frameTime : time - frameStart;
    lastLoop = time;
  };
})();

(function (){
  function Pool(object, size, isChange) {
    var data = [], i;
    this.size = size || (function () {
      throw new Error("Unknown pool size");
    })();
    for (i = 0; i < this.size; i += 1) {
      data.push(extend(true, {}, object));
    }
    this.pool = data;
    this.last = this.size;
    this.isChange = isChange;
    return this;
  }
  Pool.prototype.get = function (i) {
    i = i || 0;
    if (this.last <= 0) {
      throw new Error("Minimum pool size exceeded");
    }
    var object = this.pool[i];
    this.last -= 1;
    this.pool[i] = this.pool[this.last];
    if (this.isChange === true) {
      this.pool.pop();
    } else {
      this.pool[this.last] = undefined;
    }
    return object;
  };
  Pool.prototype.set = function (object) {
    this.pool[this.last] = object;
    this.last += 1;
    if (this.last > this.size) {
      throw new Error("Maximum pool size exceeded");
    }
  };
  this.Pool = Pool;
  function extend() {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
      deep = arguments[0];
      i++;
    }
    // Merge the object into the extended object
    var merge = function (obj) {
      for ( var prop in obj ) {
        if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
          // If deep merge and property is an object, merge properties
          if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
            extended[prop] = extend( true, extended[prop], obj[prop] );
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };
    // Loop through each object and conduct a merge
    for ( ; i < length; i++) {
      var obj = arguments[i];
      merge(obj);
    }
    return extended;
  }
}());

(function (pool, math) {
  // https://github.com/davidbau/seedrandom
  
  // The following constants are related to IEEE 754 limits.
  var global = this,
      width = 256,        // each RC4 output is 0 <= x < 256
      chunks = 6,         // at least six RC4 outputs for each double
      digits = 52,        // there are 52 significant digits in a double
      rngname = 'random', // rngname: name for Math.random and Math.seedrandom
      startdenom = math.pow(width, chunks),
      significance = math.pow(2, digits),
      overflow = significance * 2,
      mask = width - 1,
      nodecrypto;         // node.js crypto module, initialized at the bottom.

  /*
   * seedrandom()
   * This is the seedrandom function described above.
  */
  function seedrandom(seed, options, callback) {
    var key = [];
    options = (options == true) ? { entropy: true } : (options || {});

    // Flatten the seed string or build one from local entropy if needed.
    var shortseed = mixkey(flatten(
      options.entropy ? [seed, tostring(pool)] :
      (seed == null) ? autoseed() : seed, 3), key);

    // Use the seed to initialize an ARC4 generator.
    var arc4 = new ARC4(key);

    // This function returns a random double in [0, 1) that contains
    // randomness in every bit of the mantissa of the IEEE 754 value.
    var prng = function () {
      var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
          d = startdenom,                 //   and denominator d = 2 ^ 48.
          x = 0;                          //   and no 'extra last byte'.
      while (n < significance) {          // Fill up all significant digits by
        n = (n + x) * width;              //   shifting numerator and
        d *= width;                       //   denominator and generating a
        x = arc4.g(1);                    //   new least-significant-byte.
      }
      while (n >= overflow) {             // To avoid rounding up, before adding
        n /= 2;                           //   last byte, shift everything
        d /= 2;                           //   right using integer math until
        x >>>= 1;                         //   we have exactly the desired bits.
      }
      return (n + x) / d;                 // Form the number within [0, 1).
    };

    prng.int32 = function () { return arc4.g(4) | 0; };
    prng.quick = function () { return arc4.g(4) / 0x100000000; };
    prng.double = prng;

    // Mix the randomness into accumulated entropy.
    mixkey(tostring(arc4.S), pool);

    // Calling convention: what to return as a function of prng, seed, is_math.
    return (options.pass || callback ||
        function (prng, seed, is_math_call, state) {
          if (state) {
            // Load the arc4 state from the given state if it has an S array.
            if (state.S) { copy(state, arc4); }
            // Only provide the .state method if requested via options.state.
            prng.state = function () { return copy(arc4, {}); };
          }

          // If called as a method of Math (Math.seedrandom()), mutate
          // Math.random because that is how seedrandom.js has worked since v1.0.
          if (is_math_call) { math[rngname] = prng; return seed; }

          // Otherwise, it is a newer calling convention, so return the
          // prng directly.
          else return prng;
        })(
    prng,
    shortseed,
    'global' in options ? options.global : (this == math),
    options.state);
  }
  math['seed' + rngname] = seedrandom;

  /*
   * ARC4
   *
   * An ARC4 implementation.  The constructor takes a key in the form of
   * an array of at most (width) integers that should be 0 <= x < (width).
   *
   * The g(count) method returns a pseudorandom integer that concatenates
   * the next (count) outputs from ARC4.  Its return value is a number x
   * that is in the range 0 <= x < (width ^ count).
  */
  function ARC4(key) {
    var t, keylen = key.length,
        me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

    // The empty key [] is treated as [0].
    if (!keylen) { key = [keylen++]; }

    // Set up S using the standard key scheduling algorithm.
    while (i < width) {
      s[i] = i++;
    }
    for (i = 0; i < width; i++) {
      s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
      s[j] = t;
    }

    // The "g" method returns the next (count) outputs as one number.
    (me.g = function (count) {
      // Using instance members instead of closure state nearly doubles speed.
      var t, r = 0,
          i = me.i, j = me.j, s = me.S;
      while (count--) {
        t = s[i = mask & (i + 1)];
        r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
      }
      me.i = i; me.j = j;
      return r;
      /* For robust unpredictability, the function call below automatically
       * discards an initial batch of values.  This is called RC4-drop[256].
       * See http://google.com/search?q=rsa+fluhrer+response&btnI
      */
    })(width);
  }

  /*
   * copy()
   * Copies internal state of ARC4 to or from a plain object.
  */
  function copy(f, t) {
    t.i = f.i;
    t.j = f.j;
    t.S = f.S.slice();
    return t;
  }

  /*
   * flatten()
   * Converts an object tree to nested arrays of strings.
  */
  function flatten(obj, depth) {
    var result = [], typ = (typeof obj), prop;
    if (depth && typ == 'object') {
      for (prop in obj) {
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
    return (result.length ? result : typ == 'string' ? obj : obj + '\0');
  }

  /*
   * mixkey()
   * Mixes a string seed into a key that is an array of integers, and
   * returns a shortened string seed that is equivalent to the result key.
  */
  function mixkey(seed, key) {
    var stringseed = seed + '', smear, j = 0;
    while (j < stringseed.length) {
      key[mask & j] =
        mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
    }
    return tostring(key);
  }

  /*
   * autoseed()
   * Returns an object for autoseeding, using window.crypto and Node crypto
   * module if available.
  */
  function autoseed() {
    try {
      if (nodecrypto) { return tostring(nodecrypto.randomBytes(width)); }
      var out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
      return tostring(out);
    } catch (e) {
      var browser = global.navigator,
          plugins = browser && browser.plugins;
      return [+new Date, global, plugins, global.screen, tostring(pool)];
    }
  }

  /*
   * tostring()
   * Converts an array of charcodes to a string
  */
  function tostring(a) {
    return String.fromCharCode.apply(0, a);
  }

  /*
   * When seedrandom.js is loaded, we immediately mix a few bits
   * from the built-in RNG into the entropy pool.  Because we do
   * not want to interfere with deterministic PRNG state later,
   * seedrandom will not call math.random on its own again after
   * initialization.
  */
  mixkey(math.random(), pool);

  /*
   * Nodejs and AMD support: export the implementation as a module using
   * either convention.
  */
  if ((typeof module) == 'object' && module.exports) {
    module.exports = seedrandom;
    // When in node.js, try using crypto package for autoseeding.
    try {
      nodecrypto = require('crypto');
    } catch (ex) {}
  } else if ((typeof define) == 'function' && define.amd) {
    define(function () { return seedrandom; });
  }

  // End anonymous scope, and pass initial values.
})(
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);

//TODO list:
/*
fire > earth
  ^  X   V      Elemental magic (no idea how to implement this, should test basic principal first...)
 air < water
 
wizard > warrior
   ^   X    V
 rogue < priest
*/
//Unknown shit
/*
function AngularDistance(angle1, angle2){
  let distance = NormalizeAngle(angle2 - angle1);
  if(distance>180){ distance -=360; }
  return distance;
}
*/
//Do with wall
/*
// 任意の点(x,y),(angle)から壁までの距離を返す
function getKyoriToKabe(x, y, angle)
{
  let chk_angle = getAngle360(angle);
  if (chk_angle < 90)
  {
    if (x > GetClipMaxX || y > GetClipMaxY) { return (-1); }

    let chk_y = y+tan(chk_angle)*(GetClipMaxX-x);
    if (chk_y >= GetClipMaxY)
      { return ( ( ((GetClipMaxY-y)/tan(chk_angle))^2 + (GetClipMaxY-y)^2 )^0.5); }
    else
      { return ( ( (GetClipMaxX-x)^2 + (tan(chk_angle)*(GetClipMaxX-x))^2 )^0.5); }
  }
  else if (chk_angle < 180)
  {
    if (x < GetClipMinX || y > GetClipMaxY) { return (-1); }

    let chk_y = y+tan(chk_angle)*(GetClipMinX-x);
    if (chk_y >= GetClipMaxY)
      { return ( ( ((GetClipMaxY-y)/tan(chk_angle))^2 + (GetClipMaxY-y)^2 )^0.5); }
    else
      { return ( ( (x-GetClipMinX)^2 + (tan(chk_angle)*(x-GetClipMinX))^2 )^0.5); }
  }
  else if (chk_angle < 270)
  {
    if (x < GetClipMinX || y < GetClipMinY) { return (-1); }

    let chk_y = y+tan(chk_angle)*(GetClipMinX-x);
    if (chk_y <= GetClipMinY)
      { return ( ( ((y-GetClipMinY)/tan(chk_angle))^2 + (y-GetClipMinY)^2 )^0.5); }
    else
      { return ( ( (x-GetClipMinX)^2 + (tan(chk_angle)*(x-GetClipMinX))^2 )^0.5); }
  }
  else
  {
    if (x > GetClipMaxX || y < GetClipMinY) { return (-1); }

    let chk_y = y+tan(chk_angle)*(GetClipMaxX-x);
    if (chk_y <= GetClipMinY)
      { return ( ( ((y-GetClipMinY)/tan(chk_angle))^2 + (y-GetClipMinY)^2 )^0.5); }
    else
      { return ( ( (GetClipMaxX-x)^2 + (tan(chk_angle)*(GetClipMaxX-x))^2 )^0.5); }
  }
  
  return (-1);  //謎のエラー
}

// 任意の点(x,y),(angle)から弾を発射し、当たる壁の位置を返す
// 0 = 左, 1 = 右, 2 = 上, 3 = 下
// -1 = エラー
function getItiToKabe(x, y, angle)
{
  let chk_angle = getAngle360(angle);
  if (chk_angle < 90)
  {
    if (x > GetClipMaxX || y > GetClipMaxY) { return (-1); }

    let chk_y = y+tan(chk_angle)*(GetClipMaxX-x);
    if (chk_y >= GetClipMaxY)
      { return ( 3 ); }
    else
      { return ( 1 ); }
  }
  else if (chk_angle < 180)
  {
    if (x < GetClipMinX || y > GetClipMaxY) { return (-1); }

    let chk_y = y+tan(chk_angle)*(GetClipMinX-x);
    if (chk_y >= GetClipMaxY)
      { return ( 3 ); }
    else
      { return ( 0 ); }
  }
  else if (chk_angle < 270)
  {
    if (x < GetClipMinX || y < GetClipMinY) { return (-1); }

    let chk_y = y+tan(chk_angle)*(GetClipMinX-x);
    if (chk_y <= GetClipMinY)
      { return ( 2 ); }
    else
      { return ( 0 ); }
  }
  else
  {
    if (x > GetClipMaxX || y < GetClipMinY) { return (-1); }

    let chk_y = y+tan(chk_angle)*(GetClipMaxX-x);
    if (chk_y <= GetClipMinY)
      { return ( 2 ); }
    else
      { return ( 1 ); }
  }
  return (-1);  //謎のエラー
}
*/
//3D XYZ to 2D XY
/*
//http://webglfactory.blogspot.com/2011/05/how-to-convert-world-to-screen.html

point2D get2dPoint(Point3D point3D, Matrix viewMatrix, Matrix projectionMatrix, int width, int height) {
      Matrix4 viewProjectionMatrix = projectionMatrix * viewMatrix;
      point3D = viewProjectionMatrix.multiply(point3D);
      int winX = (int) Math.round((( point3D.getX() + 1 ) / 2.0) * width );
      int winY = (int) Math.round((( 1 - point3D.getY() ) / 2.0) * height );
      return new Point2D(winX, winY);
}

Point3D get3dPoint(Point2D point2D, int width, int height, Matrix viewMatrix, Matrix projectionMatrix) {
      double x = 2.0 * winX / clientWidth - 1;
      double y = - 2.0 * winY / clientHeight + 1;
      Matrix4 viewProjectionInverse = inverse(projectionMatrix * viewMatrix);

      Point3D point3D = new Point3D(x, y, 0); 
      return viewProjectionInverse.multiply(point3D);
}
*/
//Interpolation
/*
# -*- coding: utf-8 -*-
from __future__ import division
"""
Tween functions
t = current time
b = start value
c = change in value
d = total duration
"""
# see also: http://gizma.com/easing
#orginal from https://birdfish.readthedocs.io/en/latest/envelopes.html

import math


def STATIC(t, b, c, d):
    return b


def OUT_EXPO(t, b, c, d):
    return b + c if (t == d) else c * (-2**(-10 * t/d) + 1) + b


def IN_EXPO(t, b, c, d):
    return b if (t==0) else c * (2**(10 * (t/d -1))) + b
    # class com.robertpenner.easing.Expo {
    #   static function easeIn (t:Number, b:Number, c:Number, d:Number):Number {
    #       return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    #   }
    #   static function easeOut (t:Number, b:Number, c:Number, d:Number):Number {
    #       return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    #   }
    #   static function easeInOut (t:Number, b:Number, c:Number, d:Number):Number {
    #       if (t==0) return b;
    #       if (t==d) return b+c;
    #       if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    #       return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    #   }
    #  }


def IN_CIRC(t, b, c, d):
    #   return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    t/=d
    return -c * (math.sqrt(1 - (t)*t) - 1) + b


def OUT_CIRC(t, b, c, d):
    t/=d
    t -= 1
    return c * (math.sqrt(1 - (t)*t)) + b


def LINEAR (t, b, c, d):
    return c*t/d + b


def IN_QUAD (t, b, c, d):
    t/=d
    return c*(t)*t + b


def OUT_QUAD (t, b, c, d):
    t/=d
    return -c *(t)*(t-2) + b


def IN_OUT_QUAD( t, b, c, d ):
    t/=d/2
    if ((t) < 1): return c/2*t*t + b
    t-=1
    return -c/2 * ((t)*(t-2) - 1) + b


def OUT_IN_QUAD( t, b, c, d ):
    if (t < d/2):
        return OUT_QUAD (t*2, b, c/2, d)
    return IN_QUAD((t*2)-d, b+c/2, c/2, d)


def IN_CUBIC(t, b, c, d):
    t/=d
    return c*(t)*t*t + b


def OUT_CUBIC(t, b, c, d):
    t=t/d-1
    return c*((t)*t*t + 1) + b


def IN_OUT_CUBIC( t, b, c, d):
    t/=d/2
    if ((t) < 1):
        return c/2*t*t*t + b
    t-=2
    return c/2*((t)*t*t + 2) + b


def OUT_IN_CUBIC( t, b, c, d ):
    if (t < d/2): return OUT_CUBIC (t*2, b, c/2, d)
    return IN_CUBIC((t*2)-d, b+c/2, c/2, d)


def IN_QUART( t, b, c, d):
    t/=d
    return c*(t)*t*t*t + b


def OUT_QUART( t, b, c, d):
    t=t/d-1
    return -c * ((t)*t*t*t - 1) + b


def IN_OUT_QUART( t, b, c, d):
    t/=d/2
    if (t < 1):
        return c/2*t*t*t*t + b
    t-=2
    return -c/2 * ((t)*t*t*t - 2) + b


def OUT_BOUNCE(t, b, c, d):
    t/=d
    if (t < (1.0/2.75)):
        return c*(7.5625*t*t) + b
    elif (t < (2.0/2.75)):
        t-=(1.5/2.75)
        return c*(7.5625*(t)*t + .75) + b
    elif (t < (2.5/2.75)):
        t-=(2.25/2.75)
        return c*(7.5625*(t)*t + .9375) + b
    else:
        t-=(2.625/2.75)
        return c*(7.5625*(t)*t + .984375) + b


def OUT_ELASTIC(t, b, c, d):
    if (t==0):
        return b
    t/=d
    if t==1:
        return b+c
    p = d*.3  # period
    a = 1.0  # amplitude
    if a < abs(c):
        a = c
        s = p/4
    else:
        s = p/(2*math.pi) * math.asin (c/a)

    return (a*math.pow(2,-10*t) * math.sin( (t*d-s)*(2*math.pi)/p ) + c + b)


def IN_BACK(t, b, c, d):
    #         static function easeIn (t:Number, b:Number, c:Number, d:Number, s:Number):Number {
    #   if (s == undefined) s = 1.70158;
    #   return c*(t/=d)*t*((s+1)*t - s) + b;
    # }
    s = 1.70158
    t/=d
    return c*(t)*t*((s+1)*t - s) + b


def OUT_BACK(t, b, c, d):
    #         static function easeOut (t:Number, b:Number, c:Number, d:Number, s:Number):Number {
    #   if (s == undefined) s = 1.70158;
    #   return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    # }
    s = 1.70158
    t=t/d-1
    return c*((t)*t*((s+1)*t + s) + 1) + b


def IN_OUT_BACK(t, b, c, d):
    #         static function easeInOut (t:Number, b:Number, c:Number, d:Number, s:Number):Number {
    #   if (s == undefined) s = 1.70158;
    #   if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    #   return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    # }
    s = 1.70158
    t/=d/2
    if (t < 1):
        s*=(1.525)
        return c/2*(t*t*(((s+1))*t - s)) + b
    else:
        t-=2
        s*=(1.525)
        return c/2*((t)*t*(((s)+1)*t + s) + 2) + b

"""
Pseudocode from wikipedia
INPUT: Function f, endpoint values a, b, tolerance TOL, maximum iterations NMAX
CONDITIONS: a < b, either f(a) < 0 and f(b) > 0 or f(a) > 0 and f(b) < 0
OUTPUT: value which differs from a root of f(x)=0 by less than TOL
N ? 1
While N = NMAX { limit iterations to prevent infinite loop
  c ? (a + b)/2 new midpoint
  If (f(c) = 0 or (b ֠a)/2 < TOL then { solution found
    Output(c)
    Stop
  }
  N ? N + 1 increment step counter
  If sign(f(c)) = sign(f(a)) then a ? c else b ? c new interval
}
Output("Method failed.") max number of steps exceeded
"""

def bisect_jump_time(tween, value, b, c, d):
    """
    **** Not working yet
    return t for given value using bisect
    does not work for whacky curves
    """
    max_iter = 20
    resolution = 0.01
    iter = 1
    lower = 0
    upper = d
    while iter < max_iter:
        t = (upper - lower) / 2
        if tween(t, b, c, d) - value < resolution:
            return t
        else:
            upper = t

def jump_time(tween, value, b, c, d):
    if value == b:
        return 0
    if value == (b + c):
        return d
    resolution = .01
    time_slice = d * resolution
    current_time = 0
    accuracy = abs(c/200.0)
    val_min = max(0, value - accuracy)
    val_max = value + accuracy
    for i in range(100):
        temp_value = tween(current_time, b, c, d)
        if val_max >= temp_value >= val_min:
            # print "test value: %s, new time: %s" % (temp_value, current_time)
            return current_time
        current_time += time_slice
    print current_time
    print tween, value, b, c, d, time_slice, temp_value
    print "min, max"
    print val_min, val_max
    raise ValueError('Unable to determine jump time')
*/
//3D rotation
/*
//??????3D??????? ver1.01

  function MakeAxis(rot,x,y,z){
    let norm=x^2+y^2+z^2;
    if(norm<=0){return([0,0,0,0]);}
    norm=1/(norm^0.5);
    rot=rot/2;
    return([cos(rot),sin(rot)*x*norm,sin(rot)*y*norm,sin(rot)*z*norm]);
  }

  function MakeRotate(rotx,roty,rotz){
    rotx=rotx/2;
    roty=roty/2;
    rotz=rotz/2;
    return([cos(rotx)*cos(roty)*cos(rotz)+sin(rotx)*sin(roty)*sin(rotz),
      sin(rotx)*cos(roty)*cos(rotz)-cos(rotx)*sin(roty)*sin(rotz),
      cos(rotx)*sin(roty)*cos(rotz)+sin(rotx)*cos(roty)*sin(rotz),
      cos(rotx)*cos(roty)*sin(rotz)-sin(rotx)*sin(roty)*cos(rotz)
    ]);
  }

  function QuaternionMultiply(left,right){
    return([
      left[0]*right[0]-left[1]*right[1]-left[2]*right[2]-left[3]*right[3],
      left[0]*right[1]+left[1]*right[0]+left[2]*right[3]-left[3]*right[2],
      left[0]*right[2]+left[2]*right[0]+left[3]*right[1]-left[1]*right[3],
      left[0]*right[3]+left[3]*right[0]+left[1]*right[2]-left[2]*right[1]
    ]);
  }

  function Rotate3D_A(x,y,z,rotq){
    return(Rotate3D_B([0,x,y,z],rotq));
  }

  function Rotate3D_B(posq,rotq){
    let temp=[0-rotq[1]*posq[1]-rotq[2]*posq[2]-rotq[3]*posq[3],
      rotq[0]*posq[1]+rotq[2]*posq[3]-rotq[3]*posq[2],
      rotq[0]*posq[2]+rotq[3]*posq[1]-rotq[1]*posq[3],
      rotq[0]*posq[3]+rotq[1]*posq[2]-rotq[2]*posq[1]
      ];
    return([
      0,
      temp[1]*rotq[0]-temp[0]*rotq[1]-temp[2]*rotq[3]+temp[3]*rotq[2],
      temp[2]*rotq[0]-temp[0]*rotq[2]-temp[3]*rotq[1]+temp[1]*rotq[3],
      temp[3]*rotq[0]-temp[0]*rotq[3]-temp[1]*rotq[2]+temp[2]*rotq[1]
    ]);
  }

  function Rotate3D_C(x,y,z,rotx,roty,rotz){
    return(Rotate3D_B([0,x,y,z],MakeRotate(rotx,roty,rotz)));
  }

  function Perspective(v,z,dis){
    return(v/((z-dis)/-dis));
  }
*/
//Offset and round?, wait...
/*
// 円の中心からのズレを取得（offsetX : x 座標, offsetY : y 座標）
// (半径,角度)
function offsetX(rad, angle) {
        return rad * cos(angle);
}
function offsetY(rad, angle) {
        return rad * sin(angle);
}
function RoundX(radius, angle) {   // radius=半径　angle=角度　angle方向
    return radius * cos(angle);// 半径×cos(Ｘ座標/半径）
}

function RoundY(radius, angle) {   // radius=半径　angle=角度　angle方向
    return radius * sin(angle);// 半径×cos(Ｘ座標/半径）
}
function xyangleXY(xzahyou,yzahyou,Xzahyou,Yzahyou) {
  return -1*atan2(xzahyou-Xzahyou,yzahyou-Yzahyou)-90;
}

function rwait(w) {
  loop(trunc(w*(60/60)+1)) { yield; }
}
*/
//Gap and stuff
/*
//==============================================================================
//  ★ 東方弾幕風 特定の値を取得する関数
//  このファイルをinclude_functionで取り込むか、必要な部分をコピペして使用する
//==============================================================================
//  異なる位置にある2つの点AB間の距離を取得する
//------------------------------------------------------------------------------
function GetGapLength(
  let xA,   // 点Aのx座標
  let yA,   // 点Aのy座標
  let xB,   // 点Bのx座標
  let yB    // 点Bのy座標
){
  return ( ( xB - xA ) ^ 2 + ( yB - yA ) ^ 2 ) ^ 0.5;
}
//------------------------------------------------------------------------------
//  点Aから異なる位置にある点Bへの絶対角度を取得する
//------------------------------------------------------------------------------
function GetGapAngle(
  let xA,   // 点Aのx座標
  let yA,   // 点Aのy座標
  let xB,   // 点Bのx座標
  let yB    // 点Bのy座標
){
  return atan2( yB - yA, xB - xA );
}

//------------------------------------------------------------------------------
//  点Aからある距離、絶対角度にある点Bのx座標を取得する
//------------------------------------------------------------------------------
function GetGapX(
  let xA,     // 点Aのx座標
  let gapLength,  // 点Bまでの距離
  let gapAngle  // 点Bへの絶対角度
){
  return round(xA + gapLength * cos( gapAngle ));
}

//------------------------------------------------------------------------------
//  点Aからある距離、絶対角度にある点Bのy座標を取得する
//------------------------------------------------------------------------------
function GetGapY(
  let yA,     // 点Aのy座標
  let gapLength,  // 点Bまでの距離
  let gapAngle  // 点Bへの絶対角度
){
  return round(yA + gapLength * sin( gapAngle ));
}

//------------------------------------------------------------------------------
//  楕円形に発射する時のxy座標を取得する(二次元配列)
//------------------------------------------------------------------------------
function GetEllipticXY(
let Angle,//発射角度
let a,//横半径
let b,//縦半径
){
  let R = ((cos(Angle)/a)^2 + (sin(Angle)/b)^2)^0.5;
  let x = R*cos(Angle);
  let y = R*sin(Angle);
  return [x,y];
}

//三角関数によるなめらかな数値変化関数
function SmoothAltAdd(rate){
  return (sin(rate*2-90)+1)/2;
}
function SmoothAltDec(rate){
  return (cos(rate*2)+1)/2;
}
*/
//Polar
/*
r(?) = -c/(a cos(?) + b sin(?)) //line
(inapplicable for c = 0 or a^2 + b^2 = 0)
function CreateShotShapeOA1(obj, sides, gap, speed, angle_off, graphic, delay){
  let x = ObjMove_GetX(obj);
  let y = ObjMove_GetY(obj);
  let t = 0;
  while(t < 360){
    let r = cos(180/sides) / cos(((t - angle_off) % (360/sides)) - (180/sides));
    CreateShotA1(x, y, r * speed, t, graphic, delay);
    //CreateShotA1(x + size*r*cos(t), y + size*r*sin(t), s, a, g, d);
    t += gap;
  }
}
r = cos(180/n) / cos((angle % (360/n)) - (180/n)) //convex

//星型互角形 三角関数
function star_r(angle){
return sin(pi * 5 * angle);
}
//カービィのようなまるっこい星の座標関数

function sqrt(v){
return v^0.5;
}

function exp(x){
return 2.718 ^ x;
}
function rag(ang){
return ang*pi/180;
}
function rang(r){
return r*180/pi;
}
function StarDr(a,b,c,xmax,n,p){
return (1/c)*sqrt(-log(2*exp(-a*a)-exp(-b*b*xmax*xmax*sin((p-pi/2)*(n/2))*sin((p-pi/2)*(n/2)))));
}
function StarRadian(p){
let n = 5;//5角形
let xmax = 0;
let pmin = 0;
let pmax = 2*pi;

let a = 0.81;
let b = 0.022;
let c = 1.0;
p = min(p,pmax);

let r0 = 0.008*xmax;//半径最低値のかさ上げ用
let r1 = StarDr(a,b,c,xmax,n,p);//半径
let r2 = StarDr(a,b,c,xmax,n,0)*0+0.81;//最大半径

let r =r0 + r1;//半径
return r/r2;
}
*/
//Follow something
/*
// For use by player scripts
// Focus movement locks options in position relative to the player
task gradius_options(head, num_options, wait){

  let options = [ head ];

  loop(num_options){
    options = options ~ [ follow_option(options[length(options)-1], wait) ];
  }

  function follow_option(parent, wait){
    let option = ObjEnemy_Create(OBJ_ENEMY);
    ObjEnemy_Regist(option);
    ObjPrim_SetTexture(option, dir~"bullet1.png");
    ObjSprite2D_SetSourceRect(option, 32, 32, 48, 48);
    ObjSprite2D_SetDestCenter(option);
    ObjMove_SetPosition(option, ObjMove_GetX(parent), ObjMove_GetY(parent));

    let hist = array(wait, [0, 0]);
    let index = 0;

    task follow(option, parent, wait){
      let is_moving;
      let last_pos = [ObjMove_GetX(parent), ObjMove_GetY(parent)];
      while(!Obj_IsDeleted(parent)){
        is_moving = (ObjMove_GetX(parent) != last_pos[0]) || (ObjMove_GetY(parent) != last_pos[1]);
        if(is_moving){
          if(GetVirtualKeyState(VK_SLOWMOVE) % 2 == 0){
            // unfocused movement
            ObjMove_SetPosition(option,
                      ObjMove_GetX(option) + hist[index][0],
                      ObjMove_GetY(option) + hist[index][1]);
            hist[index] = [ObjMove_GetX(parent) - last_pos[0],
                  ObjMove_GetY(parent) - last_pos[1]];
            index = (index + 1) % wait;
          }else{
            // focused movement
            ObjMove_SetPosition(option,
                      ObjMove_GetX(option) + (ObjMove_GetX(parent) - last_pos[0]),
                      ObjMove_GetY(option) + (ObjMove_GetY(parent) - last_pos[1]));
          }
        }
        last_pos = [ObjMove_GetX(parent), ObjMove_GetY(parent)];
        yield;
      }
    }

    follow(option, parent, wait);
    return option;
  }

}

// More general version
// Attach to any Move object as head
task gradius_options(head, num_options, wait){

  let options = [ head ];

  loop(num_options){
    options = options ~ [ follow_option(options[length(options)-1], wait) ];
  }

  function follow_option(parent, wait){
    let option = ObjEnemy_Create(OBJ_ENEMY);
    ObjEnemy_Regist(option);
    ObjPrim_SetTexture(option, dir~"bullet1.png");
    ObjSprite2D_SetSourceRect(option, 32, 32, 48, 48);
    ObjSprite2D_SetDestCenter(option);
    ObjMove_SetPosition(option, ObjMove_GetX(parent), ObjMove_GetY(parent));

    let hist = array(wait, [0, 0]);
    let index = 0;

    task follow(option, parent, wait){
      let is_moving;
      let last_pos = [ObjMove_GetX(parent), ObjMove_GetY(parent)];
      while(!Obj_IsDeleted(parent)){
        is_moving = (ObjMove_GetX(parent) != last_pos[0]) || (ObjMove_GetY(parent) != last_pos[1]);
        if(is_moving){
          ObjMove_SetPosition(option,
                    ObjMove_GetX(option) + hist[index][0],
                    ObjMove_GetY(option) + hist[index][1]);
          hist[index] = [ObjMove_GetX(parent) - last_pos[0],
                ObjMove_GetY(parent) - last_pos[1]];
          index = (index + 1) % wait;
        }
        last_pos = [ObjMove_GetX(parent), ObjMove_GetY(parent)];
        yield;
      }
      Obj_Delete(option);
    }

    follow(option, parent, wait);
    return option;
  }

}

// Array init utility
function array(size, value){
  let fill = [value];

  while(length(fill) < size * 2){
    fill = fill ~ fill;
  }

  return fill[0..size];
}

      let x = cos(angleY)*cos(angleZ) -cos(angleX)*sin(angleY)*sin(angleZ);
      let y = sin(angleY)*cos(angleZ) +cos(angleX)*cos(angleY)*sin(angleZ);
      let r = rMax*sin(180*i/time); // let r = 300*cos(90*i/time);
//      ObjRender_SetScaleXYZ(obj, scale, scale, 1.0);
      ObjMove_SetPosition(obj, X+r*x, Y+r*y);
      
      j\left(x,\ y,\ z\right)=\cos (y)\cdot \cos (z)\cdot g\cdot \cos \left(o\right)-\sin \left(o\right)\cdot \cos \left(x\right)\cdot \sin (z)\cdot g
      k\left(x,\ y,\ z\right)=\cos (y)\cdot \cos (z)\cdot g\cdot \sin \left(o\right)+\cos \left(o\right)\cdot \sin \left(x+90\right)\cdot \sin (z)\cdot g
      
      Math.cos(y) * Math.cos(z) * Math.cos(o) * d - Math.cos(x) * Math.sin(z) * Math.sin(o) * d
      Math.cos(y) * Math.sin(z) * Math.cos(o) * d + Math.sin(x + 90) * Math.cos(z) * Math.sin(o) * d
      o: point rotate
      
      d * (cos(o) cos(y) cos(z) - sin(o) cos(x) sin(z))
      d * (cos(o) cos(y) sin(z) + sin(o) sin(x + 90) cos(z))
      
      https://www.youtube.com/watch?v=TpiNKbeAz1s
      
      j\left(x,\ y,\ z\right)=\cos (y)\cdot \cos (z)\cdot g\cdot \cos \left(o\right)-\cos \left(o-90\right)\cdot \cos \left(x\right)\cdot \sin (z)\cdot g
      k\left(x,\ y,\ z\right)=\cos (y)\cdot \cos (z)\cdot g\cdot \cos \left(o-90\right)+\cos \left(o\right)\cdot \sin \left(x+90\right)\cdot \sin (z)\cdot g
      
      l\left(x,\ y,\ z\right)=\cos (y)\cdot \cos (z)\cdot g-\cos (x)\cdot \sin (y)\cdot \sin (z)\cdot g
      m\left(x,\ y,\ z\right)=\sin (y)\cdot \cos (z)\cdot g+\cos (x)\cdot \cos (y)\cdot \sin (z)\cdot g
      
      m\left(x,\ y,\ z\right)=\cos (y)\cdot \cos (z)\cdot \cos \left(o\right)\cdot g-\sin \left(o\right)\cdot \cos \left(x\right)\cdot \sin (z)\cdot g
      n\left(x,\ y,\ z\right)=\cos (y)\cdot \cos (z)\cdot \sin \left(o\right)\cdot g+\cos \left(o\right)\cdot \cos \left(x\right)\cdot \sin (z)\cdot g
      
(StartingVelocity, CurrentVelocity, Acceleration, and FinalVelocity are all vectors.)
CurrentVelocity = StartingVelocity + Acceleration * t
Angle = StartingAngle + AngularVelocity * t
FinalVelocity = [ cos(Angle) * CurrentVelocity[1] - sin(Angle) * CurrentVelocity[2], sin(Angle) * CurrentVelocity[1] + cos(Angle) * CurrentVelocity[2] ];

/* I couldn’t find a vector magnitude thingy in Maxima, so I just made my own. *
vecMag(x) := sqrt(x[1]*x[1]+x[2]*x[2]);

/* I couldn’t find a vector magnitude thingy in Maxima, so I just made my own. *
vecMag(x) := sqrt(x[1]*x[1]+x[2]*x[2]);
/* We just have to explicitly declare vectors to use them like vectors. *
StartingVelocity:[‘StartingVelocityX, 'StartingVelocityY];
Acceleration:['AccelerationX, 'AccelerationY];
Velocity:’('StartingVelocity + ’t * 'Acceleration);
/* This is what we’re trying to achieve. We need to split it into two separate equations, though. I can’t integrate “clamp”. *
/*Speed:clamp(vecMag('Velocity), 0, 'MaxSpeed);*
/* Non-maxspeed version. *
Speed:’(vecMag('Velocity));
/* Maxspeed version. *
/*Speed:'MaxSpeed;*
NormalizedVelocity:’(Velocity / vecMag(Velocity));
VelocityAfterSpeed:’('NormalizedVelocity * 'Speed);
/* Angular velocity != 0 version. *
Angle:’('StartingAngle + 'AngularVelocity * ’t);
/* No angular velocity version. *
/*Angle:'StartingAngle;*
/* Rotate the velocity vector by a rotation matrix. *
VelocityAtAngle:’(
[ cos('Angle) * VelocityAfterSpeed[1] - sin('Angle) * VelocityAfterSpeed[2],
sin('Angle) * VelocityAfterSpeed[1] + cos('Angle) * VelocityAfterSpeed[2] ]);
Result:integrate(ev(VelocityAtAngle, infeval), t);
ev(Result);

sx = bx + u * cos( ag ) * cos( disp ) - v * sin( ag ) * sin( disp );
sy = by + u * cos( ag ) * sin( disp ) + v * sin( ag ) * cos( disp );
bx += spd * cos( disp );
by += spd * sin( disp );

*/
//TODO: watch jewel pet? old anime :P
//rider000, nanoha, illya (Done?), madoka (WIP), little buster
//Tagential speed
//Meridian arc
//Steering Behaviors: https://gamedevelopment.tutsplus.com/series/understanding-steering-behaviors--gamedev-12732
//Finite state machine
