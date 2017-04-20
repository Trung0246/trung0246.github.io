(function(Shmup) {
  Shmup.plugins.projectile("bullet", {
    data: {
      position: {
        x: 0,
        y: 0,
      },
      angle: 0,
      radial: 0,
    },
    add: function(data) {
      var projectile = Shmup.advanced.process.wait.bullet.get();
      if (data.data) {
        projectile.data = data.data;
      }
      projectile.position.x = data.position.x || 0;
      projectile.position.y = data.position.y || 0;
      projectile.angle = data.angle || 0;
      projectile.radial = data.radial || 0;
      projectile.update = data.update;
      Shmup.advanced.process.active.push(projectile);
      return projectile;
    },
    remove: function(projectile) {
      projectile.position.x = 0;
      projectile.position.y = 0;
      projectile.angle = 0;
      projectile.radial = 0;
      projectile.data = undefined;
      projectile.update = undefined;
      Shmup.advanced.process.wait[projectile.type].set(projectile);
    },
    update: function(projectile) {
      projectile.position.x = Math.cos(projectile.angle) * projectile.radial + projectile.position.x;
      projectile.position.y = Math.sin(projectile.angle) * projectile.radial + projectile.position.y;
    },
  });

  //TODO: when change radial will affect like spawn, may also add bounce too, and distance will affect location of two head and include anchor
  Shmup.plugins.projectile("laser", {
    data: {
      position: {
        start: {
          x: 0,
          y: 0,
        },
        end: {
          x: 0,
          y: 0,
        },
      },
      distance: 0,
      angle: 0,
      anchor: {
        value: 0, //0: start to 1: end
        x: 0,
        y: 0,
      },
      radial: 0,
      instant: false,
      temp: {
        distance: 0,
      },
    },
    add: function(data) {
      var projectile = Shmup.advanced.process.laser.get();
      if (data.data) {
        projectile.data = data.data;
      }
      projectile.angle = data.angle || 0;
      projectile.radial = data.radial || 0;
      projectile.position.start.x = data.position.start.x || 0;
      projectile.position.start.y = data.position.start.y || 0;
      projectile.instant = data.instant || false;
      data.position.end = data.position.end || {};
      projectile.temp.distance = data.distance || Shmup.point.distance(true, projectile.position.start, projectile.position.end, true);
      if (projectile.instant) {
        projectile.position.end.x = data.position.end.x || projectile.position.start.x + projectile.temp.distance * Math.cos(projectile.angle - Math.PI);
        projectile.position.end.y = data.position.end.y || projectile.position.start.y + projectile.temp.distance * Math.sin(projectile.angle - Math.PI);
      } else {
        projectile.position.end.x = data.position.end.x || projectile.position.start.x;
        projectile.position.end.y = data.position.end.y || projectile.position.start.y;
      }
      projectile.distance = Shmup.point.distance(true, projectile.position.start, projectile.position.end, true);
      projectile.anchor.value = data.anchor || 0;
      var tempDis = Shmup.line.on(projectile.position.start, projectile.position.end, projectile.anchor.value);
      projectile.anchor.x = tempDis.x;
      projectile.anchor.y = tempDis.y;
      projectile.update = data.update;
      Shmup.advanced.process.active.push(projectile);
      return projectile;
    },
    remove: function(projectile) {
      projectile.position.start.x = 0;
      projectile.position.start.y = 0;
      projectile.position.end.x = 0;
      projectile.position.end.y = 0;
      projectile.distance = 0;
      projectile.angle = 0;
      projectile.anchor.value = 0;
      projectile.anchor.x = 0;
      projectile.anchor.y = 0;
      projectile.radial = 0;
      projectile.instant = false;
      projectile.temp.distance = 0;
      projectile.data = undefined;
      projectile.update = undefined;
      Shmup.advanced.process.wait[projectile.type].set(projectile);
    },
    update: function(projectile) {
      var tempDis = Shmup.line.on(projectile.position.start, projectile.position.end, projectile.anchor.value);
      projectile.anchor.x = tempDis.x;
      projectile.anchor.y = tempDis.y;
      tempDis = Shmup.point.distance(true, projectile.position.start, projectile.anchor, true);
      projectile.position.start.x = projectile.anchor.x + tempDis * Math.cos(projectile.angle);
      projectile.position.start.y = projectile.anchor.y + tempDis * Math.sin(projectile.angle);
      if (projectile.distance >= projectile.temp.distance) {
        tempDis = Shmup.point.distance(true, projectile.position.end, projectile.anchor, true);
        projectile.position.end.x = projectile.anchor.x + tempDis * Math.cos(projectile.angle - Math.PI);
        projectile.position.end.y = projectile.anchor.y + tempDis * Math.sin(projectile.angle - Math.PI);
      }
      projectile.position.start.x = projectile.position.start.x + projectile.radial * Math.cos(projectile.angle);
      projectile.position.start.y = projectile.position.start.y + projectile.radial * Math.sin(projectile.angle);
      if (projectile.distance >= projectile.temp.distance) {
        projectile.position.end.x = projectile.position.end.x + projectile.radial * Math.cos(projectile.angle);
        projectile.position.end.y = projectile.position.end.y + projectile.radial * Math.sin(projectile.angle);
      }
      projectile.distance = Shmup.point.distance(true, projectile.position.start, projectile.position.end, true);
    },
  });
  
  /*Shmup.plugins.projectile("laserB", {
    data: {
      position: {
        start: {
          value: 0,
          x: 0,
          y: 0,
        },
        end: {
          value: 0,
          x: 0,
          y: 0,
        },
      },
      distance: 0,
      angle: 0,
      anchor: {
        x: 0,
        y: 0,
      },
      radial: 0,
      instant: false,
      temp: {
        distance: 0,
      },
    },
    add: function(data) {
      var projectile = Shmup.advanced.process.laser.get();
      if (data.data) {
        projectile.data = data.data;
      }
      projectile.anchor.x = data.position.x || 0;
      projectile.anchor.y = data.position.y || 0;
      projectile.angle = data.angle || 0;
      projectile.radial = data.radial || 0;
      projectile.instant = data.instant || false;
      projectile.distance = data.distance || 0;
      if (projectile.instant) {
        projectile.position.start.x = projectile.distance * data.start * Math.cos(projectile.angle) + projectile.anchor.x;
        projectile.position.start.y = projectile.distance * data.start * Math.sin(projectile.angle) + projectile.anchor.y;
        projectile.position.end.x = projectile.distance * data.end * Math.cos(projectile.angle - Math.PI) + projectile.anchor.x;
        projectile.position.end.y = projectile.distance * data.end * Math.sin(projectile.angle - Math.PI) + projectile.anchor.y;
        projectile.temp.distance = projectile.distance;
      } else {
        projectile.position.start.x = projectile.anchor.x;
        projectile.position.start.y = projectile.anchor.y;
        projectile.position.end.x = projectile.anchor.x;
        projectile.position.end.y = projectile.anchor.y;
        projectile.temp.distance = 0;
      }
      projectile.update = data.update;
      Shmup.advanced.process.active.push(projectile);
      return projectile;
    },
    remove: function(projectile) {
      
      projectile.data = undefined;
      projectile.update = undefined;
      Shmup.advanced.process.wait[projectile.type].set(projectile);
    },
    update: function(projectile) {
      if (projectile.temp.distance < projectile.distance) {
        projectile.temp.distance += projectile.radial;
      }
      if (projectile.temp.distance > projectile.distance) {
        projectile.temp.distance = projectile.distance;
      }
      projectile.anchor.x = projectile.radial * Math.cos(projectle.angle) + projectile.position.start.x;
      projectile.anchor.y = projectile.radial * Math.sin(projectle.angle) + projectile.position.start.y;
    },
  });*/

  //TODO: sync node will ... no idea to to explain it, but like 4 node and wait for xy data to change ... or ... like pop the top and push to bottom... :P
  Shmup.plugins.projectile("curveA", {
    data: {
      position: {
        x: 0,
        y: 0,
      },
      angle: 0,
      radial: 0,
      count: 0,
      distance: 0,
      instant: false,
      same: true,
      temp: {
        node: undefined,
        data: undefined,
        distance: 0,
        instantCount: 0,
        angle: 0,
        radial: 0,
      },
    },
    add: function(data) {
      var projectile = Shmup.advanced.process.wait.curveA.get();
      if (data.data) {
        projectile.data = data.data;
      }
      projectile.position.x = data.position.x || 0;
      projectile.position.y = data.position.y || 0;
      projectile.angle = data.angle || 0;
      projectile.radial = data.radial || 1;
      projectile.temp.angle = projectile.angle || 0;
      projectile.temp.radial = projectile.radial || 1;
      projectile.count = data.count || 1;
      projectile.temp.distance = data.distance || 1;
      projectile.temp.node = projectile.temp.node || [];
      projectile.temp.data = projectile.temp.data || [];
      projectile.instant = data.instant || false;
      for (var nodeCount = 0; nodeCount < projectile.count; nodeCount ++) {
        var tempNode = Shmup.projectile.curveNode.add({
          position: {
            x: projectile.position.x,
            y: projectile.position.y,
          },
          angle: projectile.angle,
          radial: projectile.radial,
        });
        if (projectile.instant) {
          tempNode.position.x = Math.cos(projectile.angle - Math.PI) * Shmup.interpolation.linear(0, projectile.temp.distance * projectile.radial, nodeCount / projectile.count) + projectile.position.x;
          tempNode.position.y = Math.sin(projectile.angle - Math.PI) * Shmup.interpolation.linear(0, projectile.temp.distance * projectile.radial, nodeCount / projectile.count) + projectile.position.y;
        }
        projectile.temp.node.push(tempNode);
      }
      if (projectile.instant) {
        projectile.temp.instantCount = projectile.count;
      }
      projectile.distance = projectile.temp.node.length * projectile.temp.distance;
      projectile.update = data.update;
      Shmup.advanced.process.active.push(projectile);
      return projectile;
    },
    remove: function(projectile) {
      projectile.position.x = 0;
      projectile.position.y = 0;
      projectile.angle = 0;
      projectile.radial = 0;
      projectile.count = 0;
      projectile.distance = 0;
      projectile.instant = false;
      for (var nodeCount = projectile.temp.node.length - 1; nodeCount >= 0; --nodeCount) {
        Shmup.projectile.curveNode.remove(projectile.temp.node[nodeCount]);
        projectile.temp.node.splice(nodeCount, 1);
      }
      for (var dataCount = projectile.temp.data.length - 1; dataCount >= 0; --dataCount) {
        projectile.temp.data.splice(dataCount, 1);
      }
      projectile.temp.distance = 0;
      projectile.temp.instantCount = 0;
      projectile.temp.angle = 0;
      projectile.temp.radial = 0;
      projectile.data = undefined;
      projectile.update = undefined;
      Shmup.advanced.process.wait[projectile.type].set(projectile);
    },
    update: function(projectile) {
      if (projectile.angle !== projectile.temp.angle || projectile.radial !== projectile.temp.radial) {
        projectile.temp.data.push({
          angle: projectile.angle,
          radial: projectile.radial,
          count: 0,
        });
        projectile.temp.angle = projectile.angle;
        projectile.temp.radial = projectile.radial;
      }
      for (var tempCount = 0; tempCount < projectile.temp.node.length; tempCount ++) {
        for (var dataCount = 0; dataCount < projectile.temp.data.length; dataCount ++) {
          if (projectile.temp.data[dataCount].count === tempCount) {
            if (projectile.temp.data[dataCount].x === projectile.temp.node[tempCount].x && projectile.temp.data[dataCount].y === projectile.temp.node[tempCount].y && projectile.same === true) {
              projectile.temp.node[tempCount].angle = projectile.temp.data[dataCount].angle;
              projectile.temp.node[tempCount].radial = projectile.temp.data[dataCount].radial;
            } else if (projectile.same !== true) {
              projectile.temp.node[tempCount].angle = projectile.temp.data[dataCount].angle;
              projectile.temp.node[tempCount].radial = projectile.temp.data[dataCount].radial;
            }
          }
        }
        if (tempCount < projectile.temp.instantCount) {
          Shmup.projectile.curveNode.update(projectile.temp.node[tempCount]);
        }
        if (tempCount > 0) {
          projectile.distance += Shmup.point.distance(true, projectile.temp.node[tempCount - 1].position, projectile.temp.node[tempCount].position, true);
        }
      }
      if (projectile.temp.instantCount < projectile.count) {
        projectile.temp.instantCount += 1;
      }
      for (var dataCount2 = projectile.temp.data.length - 1; dataCount2 >= 0; --dataCount2) {
        projectile.temp.data[dataCount2].count += 1;
        if (projectile.temp.data[dataCount2].count >= projectile.temp.node.length) {
          projectile.temp.data.splice(dataCount2, 1);
        }
      }
    },
  });
  
  Shmup.plugins.projectile("curveB", {
    data: {
      position: {
        x: 0,
        y: 0,
      },
      angle: 0,
      radial: 0,
      distance: 0,
      instant: false,
      temp: {
        node: undefined,
        data: undefined,
        angle: 0,
        radial: 0,
      },
    },
    add: function(data) {
      var projectile = Shmup.advanced.process.wait.curveB.get();
      if (data.data) {
        projectile.data = data.data;
      }
      projectile.position.x = data.position.x || 0;
      projectile.position.y = data.position.y || 0;
      projectile.angle = data.angle || 0;
      projectile.radial = data.radial || 1;
      //projectile.temp.angle = projectile.angle || 0;
      //projectile.temp.radial = projectile.radial || 1;
      projectile.distance = data.distance || 2;
      projectile.temp.node = projectile.temp.node || [];
      projectile.temp.data = projectile.temp.data || [];
      projectile.instant = data.instant || false;
      for (var nodeCount = 0; nodeCount < projectile.distance; nodeCount ++) {
        var tempNode = Shmup.projectile.curveNode.add({
          position: {
            x: projectile.position.x,
            y: projectile.position.y,
          },
          angle: projectile.angle,
          radial: projectile.radial,
        });
        if (projectile.instant) {
          tempNode.position.x = Math.cos(projectile.angle - Math.PI) * Shmup.interpolation.linear(0, projectile.distance * projectile.radial, nodeCount / projectile.distance) + projectile.position.x;
          tempNode.position.y = Math.sin(projectile.angle - Math.PI) * Shmup.interpolation.linear(0, projectile.distance * projectile.radial, nodeCount / projectile.distance) + projectile.position.y;
        }
        projectile.temp.node.push(tempNode);
      }
      projectile.update = data.update;
      Shmup.advanced.process.active.push(projectile);
      return projectile;
    },
    remove: function(projectile) {
      projectile.position.x = 0;
      projectile.position.y = 0;
      projectile.angle = 0;
      projectile.radial = 0;
      projectile.distance = 0;
      projectile.instant = false;
      for (var nodeCount = projectile.temp.node.length - 1; nodeCount >= 0; --nodeCount) {
        Shmup.projectile.curveNode.remove(projectile.temp.node[nodeCount]);
        projectile.temp.node.splice(nodeCount, 1);
      }
      projectile.temp.angle = 0;
      projectile.temp.radial = 0;
      projectile.data = undefined;
      projectile.update = undefined;
      Shmup.advanced.process.wait[projectile.type].set(projectile);
    },
    update: function(projectile) {
      var tempProjectile = projectile.temp.node.pop();
      tempProjectile.position.x = projectile.temp.node[0].position.x;
      tempProjectile.position.y = projectile.temp.node[0].position.y;
      tempProjectile.angle = projectile.angle;
      tempProjectile.radial = projectile.radial;
      Shmup.projectile.curveNode.update(tempProjectile);
      projectile.temp.node.unshift(tempProjectile);
    },
  });

  Shmup.plugins.projectile("curveNode", {
    data: {
      position: {
        x: 0,
        y: 0,
      },
      angle: 0,
      radial: 0,
    },
    add: function(data) {
      var projectile = Shmup.advanced.process.wait.curveNode.get();
      if (data.data) {
        projectile.data = data.data;
      }
      projectile.position.x = data.position.x || 0;
      projectile.position.y = data.position.y || 0;
      projectile.angle = data.angle || 0;
      projectile.radial = data.radial || 1;
      return projectile;
    },
    remove: function(projectile) {
      projectile.position.x = 0;
      projectile.position.y = 0;
      projectile.angle = 0;
      projectile.radial = 0;
      Shmup.advanced.process.wait[projectile.type].set(projectile);
    },
    update: function(projectile) {
      projectile.position.x = Math.cos(projectile.angle) * projectile.radial + projectile.position.x;
      projectile.position.y = Math.sin(projectile.angle) * projectile.radial + projectile.position.y;
    },
  });
  if (!Shmup) {
    throw new Error("Shmup library did not added");
  }
})(Shmup);