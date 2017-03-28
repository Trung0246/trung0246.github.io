math.config({
  number: 'BigNumber',
  precision: 64 + 6,
});

//Main variable code
var stats = {}, achievement = {}, options = {}, task = [],
    enemy = {
      active: [],
      dead: [],
      inactive: [],
    }, hero = {
      active: [],
      dead: [],
      wait: [],
      inactive: [],
    }, upgrade = {}, bonus = {},
    equipment = [], player = {}, temp = {}, render = {}, option = {};

  var forceStop = false, noSave = false, gameSpeed = 1;
//(function() {
  //Check storage
  var storeData = store.get("saveSlot1");
  
  function save() {
    //Serialize stuff first
    var tempList, tempData, loopCount;
    store.set("saveSlot1", {
      stats: stats.extract(),
      bonus: bonus.extract(),
      player: player.extract(),
      hero: {
        active: (function() {
          tempList = [];
          for (loopCount = 0; loopCount < hero.active.length; loopCount ++) {
            tempList.push(hero.active[loopCount].extract());
          }
          return tempList;
        })(),
        dead: (function() {
          tempList = [];
          for (loopCount = 0; loopCount < hero.dead.length; loopCount ++) {
            tempList.push(hero.active[loopCount].extract());
          }
          return tempList;
        })(),
        wait: (function() {
          tempList = [];
          for (loopCount = 0; loopCount < hero.wait.length; loopCount ++) {
            tempList.push(hero.active[loopCount].extract());
          }
          return tempList;
        })(),
      },
    });
    return true;
  }
  
  //Option data
  (function() {
    
  })();
  
  //Stats data
  (function() {
    stats.level = {
      base: 10,
      lost: 7.25,
    };
    stats.multiply = {};
    stats.multiply.base = math.bignumber(1.125);
    stats.multiply.lost = lostCalculate(stats.multiply.base, stats.level.base, stats.level.lost);
    stats.apply = function(obj) {
      obj = obj || {};
      stats.zone = {
        main: {
          highest: Number(_.get(obj, "zone.main.highest", 0)),
          current: Number(_.get(obj, "zone.main.current", 0)),
          beat: Number(_.get(obj, "zone.main.beat", 0)),
          required: {
            count: Number(_.get(obj, "zone.main.required.count", 0)),
            max: Number(_.get(obj, "zone.main.required.max", 10)),
          },
        },
      };
      stats.prestige = {
        count: Number(_.get(obj, "prestige.count", 0)),
        increment: math.pow(lostCalculate(stats.multiply.base, stats.level.base, stats.level.base - stats.level.lost), 50),
        multiply: math.bignumber(_.get(obj, "prestige.multiply", 0)),
      };
      stats.clicks = {
        current: Number(_.get(obj, "clicks.current", 0)),
        total: Number(_.get(obj, "click.total", 0)),
      };
      stats.money = {
        current: math.bignumber(_.get(obj, "money.current", 0)),
        total: math.bignumber(_.get(obj, "money.total", 0)),
        prestige: math.bignumber(_.get(obj, "money.prestige", 0)),
        offline: math.bignumber(_.get(obj, "money.offine", 0)),
        online: math.bignumber(_.get(obj, "money.online", 0)),
      };
      stats.time = {
        total: Number(_.get(obj, "time.total", 0)),
        active: Number(_.get(obj, "time.active", 0)),
        idle: Number(_.get(obj, "time.idle", 0)),
        offline: Number(_.get(obj, "time.offline", 0)),
      };
      stats.upgrade = {
        current: Number(_.get(obj, "upgrade.current", 0)),
        total: Number(_.get(obj, "upgrade.total", 0)),
        spent: {
          current: math.bignumber(_.get(obj, "upgrade.spent.current", 0)),
          total: math.bignumber(_.get(obj, "upgrade.spent.total", 0)),
        },
      };
      stats.hero = {
        count: Number(_.get(obj, "hero.count", 1)),
        current: Number(_.get(obj, "hero.current", 0)),
        total: Number(_.get(obj, "hero.total", 0)),
        death: {
          current: Number(_.get(obj, "hero.death.current", 0)),
          total: Number(_.get(obj, "hero.death.total", 0)),
          time: {
            current: Number(_.get(obj, "hero.death.time.current", 0)), //Wait time for revive
            total: Number(_.get(obj, "hero.death.time.total", 0)),
          },
        },
        damage: {
          perSecond: math.bignumber(_.get(obj, "hero.damage.perSecond", 0)),
          current: math.bignumber(_.get(obj, "hero.damage.current", 0)),
          offline: math.bignumber(_.get(obj, "hero.damage.offline", 0)),
          total: math.bignumber(_.get(obj, "hero.damage.total", 0)),
          count: {
            current: Number(_.get(obj, "hero.damage.count.current", 0)),
            total: Number(_.get(obj, "hero.damage.count.total", 0)),
          },
          chance: {
            current: Number(_.get(obj, "hero.damage.chance.current", 0)),
            total: Number(_.get(obj, "hero.damage.chance.total", 0)),
            count: {
              current: Number(_.get(obj, "hero.damage.chance.count.current", 0)),
              total: Number(_.get(obj, "hero.damage.chance.count.total", 0)),
            },
            highest: {
              value: Number(_.get(obj, "hero.damage.chance.highest.value", 0)),
              amount: math.bignumber(_.get(obj, "hero.damage.chance.highest.amount", 0)),
            },
          },
        },
        defense: {
          current: math.bignumber(_.get(obj, "hero.defense.current", 0)),
          total: math.bignumber(_.get(obj, "hero.defense.total", 0)),
          count: {
            current: Number(_.get(obj, "hero.defense.count.current", 0)),
            total: Number(_.get(obj, "hero.defense.count.total", 0)),
          },
          chance: {
            current: Number(_.get(obj, "hero.defense.chance.current", 0)),
            total: Number(_.get(obj, "hero.defense.chance.total", 0)),
            count: {
              current: Number(_.get(obj, "hero.defense.chance.count.current", 0)),
              total: Number(_.get(obj, "hero.defense.chance.count.total", 0)),
            },
            highest: {
              value: Number(_.get(obj, "hero.defense.chance.highest.value", 0)),
              amount: math.bignumber(_.get(obj, "hero.defense.chance.highest.amount", 0)),
            },
          },
        },
      };
      stats.enemy = {
        count: Number(_.get(obj, "enemy.count", 1)),
        current: Number(_.get(obj, "enemy.current", 0)),
        total: Number(_.get(obj, "enemy.total", 0)),
        death: {
          current: Number(_.get(obj, "enemy.death.current", 0)),
          total: Number(_.get(obj, "enemy.death.total", 0)),
        },
        boss: {
          current: Number(_.get(obj, "enemy.boss.current", 0)),
          total: Number(_.get(obj, "enemy.boss.total", 0)),
          death: {
            current: Number(_.get(obj, "enemy.boss.death.current", 0)),
            total: Number(_.get(obj, "enemy.boss.deah.total", 0)),
          },
          damage: {
            perSecond: math.bignumber(_.get(obj, "enemy.boss.damage.perSecond", 0)),
            current: math.bignumber(_.get(obj, "enemy.boss.damage.current", 0)),
            offline: math.bignumber(_.get(obj, "enemy.boss.damage.offline", 0)),
            total: math.bignumber(_.get(obj, "enemy.boss.damage.total", 0)),
            count: {
              current: Number(_.get(obj, "enemy.boss.damage.count.current", 0)),
              total: Number(_.get(obj, "enemy.boss.damage.count.total", 0)),
            },
            chance: {
              current: math.bignumber(_.get(obj, "enemy.boss.damage.chance.current", 0)),
              total: math.bignumber(_.get(obj, "enemy.boss.damage.chance.total", 0)),
              count: {
                current: Number(_.get(obj, "enemy.boss.damage.chance.count.current", 0)),
                total: Number(_.get(obj, "enemy.boss.damage.chance.count.total", 0)),
              },
              highest: {
                value: Number(_.get(obj, "enemy.boss.damage.chance.highest.value", 0)),
                amount: math.bignumber(_.get(obj, "enemy.boss.damage.chance.highest.amount", 0)),
              },
            },
          },
          defense: {
            current: math.bignumber(_.get(obj, "enemy.boss.defense.current", 0)),
            total: math.bignumber(_.get(obj, "enemy.boss.defense.total", 0)),
            chance: {
              current: math.bignumber(_.get(obj, "enemy.boss.defense.chance.current", 0)),
              total: math.bignumber(_.get(obj, "enemy.boss.defense.chance.total", 0)),
              count: {
                current: Number(_.get(obj, "enemy.boss.defense.chance.count.current", 0)),
                total: Number(_.get(obj, "enemy.boss.defense.chance.count.total", 0)),
              },
              highest: {
                value: Number(_.get(obj, "enemy.boss.defense.chance.highest.value", 0)),
                amount: math.bignumber(_.get(obj, "enemy.boss.defense.chance.highest.amount", 0)),
              },
            },
          },
        },
        damage: {
          perSecond: math.bignumber(_.get(obj, "enemy.damage.perSecond", 0)),
          current: math.bignumber(_.get(obj, "enemy.damage.current", 0)),
          offline: math.bignumber(_.get(obj, "enemy.damage.offline", 0)),
          total: math.bignumber(_.get(obj, "enemy.damage.total", 0)),
          count: {
            current: Number(_.get(obj, "enemy.damage.count.current", 0)),
            total: Number(_.get(obj, "enemy.damage.count.total", 0)),
          },
          chance: {
            current: math.bignumber(_.get(obj, "enemy.damage.chance.current", 0)),
            total: math.bignumber(_.get(obj, "enemy.damage.chance.total", 0)),
            count: {
              current: Number(_.get(obj, "enemy.damage.chance.count.current", 0)),
              total: Number(_.get(obj, "enemy.damage.chance.count.total", 0)),
            },
            highest: {
              value: Number(_.get(obj, "enemy.damage.chance.highest.value", 0)),
              amount: math.bignumber(_.get(obj, "enemy.damage.chance.highest.amount", 0)),
            },
          },
        },
        defense: {
          current: math.bignumber(_.get(obj, "enemy.defense.current", 0)),
          total: math.bignumber(_.get(obj, "enemy.defense.total", 0)),
          chance: {
            current: math.bignumber(_.get(obj, "enemy.defense.chance.current", 0)),
            total: math.bignumber(_.get(obj, "enemy.defense.chance.total", 0)),
            count: {
              current: Number(_.get(obj, "enemy.defense.chance.count.current", 0)),
              total: Number(_.get(obj, "enemy.defense.chance.count.total", 0)),
            },
            highest: {
              value: Number(_.get(obj, "enemy.defense.chance.highest.value", 0)),
              amount: math.bignumber(_.get(obj, "enemy.defense.chance.highest.amount", 0)),
            },
          },
        },
      };
      stats.equipment = {
        current: Number(_.get(obj, "equipment.current", 0)),
        total: Number(_.get(obj, "equipment.total", 0)),
        destroy: Number(_.get(obj, "equipment.destroy", 0)),
      };
      stats.other = {
        buyAmount: Number(_.get(obj, "other.buyAmount", 1)),
        xpMulRandom: Number(_.get(obj, "other.xpMulRandom", Math.configRandom({
          min: 1,
          max: 10,
        }))),
        hpMul: 2,
        hpBase: 25,
        manaBase: 10,
        speedMul: 6.75,
        randomRange: {
          min: 0.8,
          max: 1.2,
        },
        nextHero: Number(_.get(obj, "other.nextHero", 10)),
        nextEnemy: Number(_.get(obj, "other.nextEnemy", 15)),
        maxZone: Number(_.get(obj, "other.maxZone", 1000)),
        showType: "upgrade",
        showObj: 0,
        detailType: "",
      };
    };
    stats.extract = function() {
      return {
        zone: {
          main: {
            highest: _.get(stats, "zone.main.highest", 0),
            current: _.get(stats, "zone.main.current", 0),
            beat: _.get(stats, "zone.main.beat", 0),
            required: {
              count: _.get(stats, "zone.main.required.count", 0),
              max: _.get(stats, "zone.main.required.max", 10),
            },
          },
        },
        prestige: {
          count: _.get(stats, "prestige.count", 0),
          current: _.get(stats, "prestige.current", 0),
          total: _.get(stats, "prestige.total", 0),
        },
        clicks: {
          current: _.get(stats, "clicks.current", 0),
          total: _.get(stats, "click.total", 0),
        },
        money: {
          current: _.get(stats, "money.current", math.bignumber(0)).toString(),
          total: _.get(stats, "money.total", math.bignumber(0)).toString(),
          prestige: _.get(stats, "money.prestige", math.bignumber(0)).toString(),
          offline: _.get(stats, "money.offine", math.bignumber(0)).toString(),
          online: _.get(stats, "money.online", math.bignumber(0)).toString(),
        },
        time: {
          total: _.get(stats, "time.total", 0),
          active: _.get(stats, "time.active", 0),
          idle: _.get(stats, "time.idle", 0),
          offline: _.get(stats, "time.offline", 0),
        },
        upgrade: {
          current: _.get(stats, "upgrade.current", 0),
          total: _.get(stats, "upgrade.total", 0),
          spent: {
            current: _.get(stats, "upgrade.spent.current", math.bignumber(0)).toString(),
            total: _.get(stats, "upgrade.spent.total", math.bignumber(0)).toString(),
          },
        },
        hero: {
          count: _.get(stats, "hero.count", 1),
          current: _.get(stats, "hero.current", 0),
          total: _.get(stats, "hero.total", 0),
          death: {
            current: _.get(stats, "hero.death.current", 0),
            total: _.get(stats, "hero.death.total", 0),
            time: {
              current: _.get(stats, "hero.death.time.current", 0), //Wait time for revive
              total: _.get(stats, "hero.death.time.total", 0),
            },
          },
          damage: {
            perSecond: _.get(stats, "hero.damage.perSecond", math.bignumber(0)).toString(),
            current: _.get(stats, "hero.damage.current", math.bignumber(0)).toString(),
            offline: _.get(stats, "hero.damage.offline", math.bignumber(0)).toString(),
            total: _.get(stats, "hero.damage.total", math.bignumber(0)).toString(),
            count: {
              current: _.get(stats, "hero.damage.count.current", 0),
              total: _.get(stats, "hero.damage.count.total", 0),
            },
            chance: {
              current: _.get(stats, "hero.damage.chance.current", 0),
              total: _.get(stats, "hero.damage.chance.total", 0),
              count: {
                current: _.get(stats, "hero.damage.chance.count.current", 0),
                total: _.get(stats, "hero.damage.chance.count.total", 0),
              },
              highest: {
                value: _.get(stats, "hero.damage.chance.highest.value", 0),
                amount: _.get(stats, "hero.damage.chance.highest.amount", math.bignumber(0)).toString(),
              },
            },
          },
          defense: {
            current: _.get(stats, "hero.defense.current", math.bignumber(0)).toString(),
            total: _.get(stats, "hero.defense.total", math.bignumber(0)).toString(),
            count: {
              current: _.get(stats, "hero.defense.count.current", 0),
              total: _.get(stats, "hero.defense.count.total", 0),
            },
            chance: {
              current: _.get(stats, "hero.defense.chance.current", 0),
              total: _.get(stats, "hero.defense.chance.total", 0),
              count: {
                current: _.get(stats, "hero.defense.chance.count.current", 0),
                total: _.get(stats, "hero.defense.chance.count.total", 0),
              },
              highest: {
                value: _.get(stats, "hero.defense.chance.highest.value", 0),
                amount: _.get(stats, "hero.defense.chance.highest.amount", math.bignumber(0)).toString(),
              },
            },
          },
        },
        enemy: {
          count: _.get(stats, "enemy.count", 1),
          current: _.get(stats, "enemy.current", 0),
          total: _.get(stats, "enemy.total", 0),
          death: {
            current: _.get(stats, "enemy.death.current", 0),
            total: _.get(stats, "enemy.death.total", 0),
          },
          boss: {
            current: _.get(stats, "enemy.boss.current", 0),
            total: _.get(stats, "enemy.boss.total", 0),
            death: {
              current: _.get(stats, "enemy.boss.death.current", 0),
              total: _.get(stats, "enemy.boss.deah.total", 0),
            },
            damage: {
              perSecond: _.get(stats, "enemy.boss.damage.perSecond", math.bignumber(0)).toString(),
              current: _.get(stats, "enemy.boss.damage.current", math.bignumber(0)).toString(),
              offline: _.get(stats, "enemy.boss.damage.offline", math.bignumber(0)).toString(),
              total: _.get(stats, "enemy.boss.damage.total", math.bignumber(0)).toString(),
              count: {
                current: _.get(stats, "enemy.boss.damage.count.current", 0),
                total: _.get(stats, "enemy.boss.damage.count.total", 0),
              },
              chance: {
                current: _.get(stats, "enemy.boss.damage.chance.current", math.bignumber(0)).toString(),
                total: _.get(stats, "enemy.boss.damage.chance.total", math.bignumber(0)).toString(),
                count: {
                  current: _.get(stats, "enemy.boss.damage.chance.count.current", 0),
                  total: _.get(stats, "enemy.boss.damage.chance.count.total", 0),
                },
                highest: {
                  value: _.get(stats, "enemy.boss.damage.chance.highest.value", 0),
                  amount: _.get(stats, "enemy.boss.damage.chance.highest.amount", math.bignumber(0)).toString(),
                },
              },
            },
            defense: {
              current: _.get(stats, "enemy.boss.defense.current", math.bignumber(0)).toString(),
              total: _.get(stats, "enemy.boss.defense.total", math.bignumber(0)).toString(),
              chance: {
                current: _.get(stats, "enemy.boss.defense.chance.current", math.bignumber(0)).toString(),
                total: _.get(stats, "enemy.boss.defense.chance.total", math.bignumber(0)).toString(),
                count: {
                  current: _.get(stats, "enemy.boss.defense.chance.count.current", 0),
                  total: _.get(stats, "enemy.boss.defense.chance.count.total", 0),
                },
                highest: {
                  value: _.get(stats, "enemy.boss.defense.chance.highest.value", 0),
                  amount: _.get(stats, "enemy.boss.defense.chance.highest.amount", math.bignumber(0)).toString(),
                },
              },
            },
          },
          damage: {
            perSecond: _.get(stats, "enemy.damage.perSecond", math.bignumber(0)).toString(),
            current: _.get(stats, "enemy.damage.current", math.bignumber(0)).toString(),
            offline: _.get(stats, "enemy.damage.offline", math.bignumber(0)).toString(),
            total: _.get(stats, "enemy.damage.total", math.bignumber(0)).toString(),
            count: {
              current: _.get(stats, "enemy.damage.count.current", 0),
              total: _.get(stats, "enemy.damage.count.total", 0),
            },
            chance: {
              current: _.get(stats, "enemy.damage.chance.current", math.bignumber(0)).toString(),
              total: _.get(stats, "enemy.damage.chance.total", math.bignumber(0)).toString(),
              count: {
                current: _.get(stats, "enemy.damage.chance.count.current", 0),
                total: _.get(stats, "enemy.damage.chance.count.total", 0),
              },
              highest: {
                value: _.get(stats, "enemy.damage.chance.highest.value", 0),
                amount: _.get(stats, "enemy.damage.chance.highest.amount", math.bignumber(0)).toString(),
              },
            },
          },
          defense: {
            current: _.get(stats, "enemy.defense.current", math.bignumber(0)).toString(),
            total: _.get(stats, "enemy.defense.total", math.bignumber(0)).toString(),
            chance: {
              current: _.get(stats, "enemy.defense.chance.current", math.bignumber(0)).toString(),
              total: _.get(stats, "enemy.defense.chance.total", math.bignumber(0)).toString(),
              count: {
                current: _.get(stats, "enemy.defense.chance.count.current", 0),
                total: _.get(stats, "enemy.defense.chance.count.total", 0),
              },
              highest: {
                value: _.get(stats, "enemy.defense.chance.highest.value", 0),
                amount: _.get(stats, "enemy.defense.chance.highest.amount", math.bignumber(0)).toString(),
              },
            },
          },
        },
        equipment: {
          current: _.get(stats, "equipment.current", 0),
          total: _.get(stats, "equipment.total", 0),
          destroy: _.get(stats, "equipment.destroy", 0),
        },
        other: {
          buyAmount: _.get(stats, "other.buyAmount", 1),
          xpMulRandom: _.get(stats, "other.xpMulRandom", Math.configRandom({
            min: 1,
            max: 10,
          })),
          nextHero: _.get(stats, "other.nextHero", 10),
          nextEnemy: _.get(stats, "other.nextEnemy", 15),
          maxZone: _.get(stats, "other.maxZone", 1000),
        },
      };
    };
    stats.apply(storeData ? storeData.stats : undefined);
  })();
  
  //Bonus data
  (function() {
    //TODO: all like (all damage, all defense,...) and include enemy
    bonus.special = {};
    bonus.apply = function(data) {
      bonus.data = [];
      if (_.get(data, "data")) {
        var tempBonus;
        for (var loopCount = 0; loopCount < data.data.length; loopCount ++) {
          tempBonus = new Bonus({
            object: undefined,
            type: data.data[loopCount].type,
            data: undefined,
          });
          tempBonus.apply(data.data[loopCount].data);
          bonus.data.push(tempBonus);
        }
      }
      bonus.hero = {
        damage: {
          value: {
            multiply: math.bignumber(_.get(data, "hero.damage.value.multiply", 0)),
            plus: math.bignumber(_.get(data, "hero.damage.value.plus", 0)),
            cost: {
              multiply: math.bignumber(_.get(data, "hero.damage.value.cost.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.damage.value.cost.plus", 0)),
            },
          },
          chance: {
            percent: {
              multiply: Number(_.get(data, "hero.damage.chance.percent.multiply", 0)),
              plus: Number(_.get(data, "hero.damage.chance.percent.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.damage.chance.percent.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.damage.chance.percent.cost.plus", 0)),
              },
            },
            amount: {
              multiply: math.bignumber(_.get(data, "hero.damage.chance.amount.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.damage.chance.amount.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.damage.chance.amount.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.damage.chance.amount.cost.plus", 0)),
              },
            },
          },
          speed: {
            multiply: Number(_.get(data, "hero.damage.speed.multiply", 0)),
            plus: Number(_.get(data, "hero.damage.speed.plus", 0)),
            cost: {
              multiply: math.bignumber(_.get(data, "hero.damage.speed.cost.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.damage.speed.cost.plus", 0)),
            },
          },
          multiple: {
            value: {
              multiply: Number(_.get(data, "hero.damage.multiple.value.multiply", 0)),
              plus: Number(_.get(data, "hero.damage.multiple.value.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.damage.multiple.value.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.damage.multiple.value.cost.plus", 0)),
              },
            },
            chance: {
              percent: {
                multiply: Number(_.get(data, "hero.damage.multiple.chance.percent.multiply", 0)),
                plus: Number(_.get(data, "hero.damage.multiple.chance.percent.plus", 0)),
                cost: {
                  multiply: math.bignumber(_.get(data, "hero.damage.multiple.chance.percent.cost.multiply", 0)),
                  plus: math.bignumber(_.get(data, "hero.damage.multiple.chance.percent.cost.plus", 0)),
                },
              },
              amount: {
                multiply: Number(_.get(data, "hero.damage.multiple.chance.amount.multiply", 0)),
                plus: Number(_.get(data, "hero.damage.multiple.chance.amount.plus", 0)),
                cost: {
                  multiply: math.bignumber(_.get(data, "hero.damage.multiple.chance.amount.cost.multiply", 0)),
                  plus: math.bignumber(_.get(data, "hero.damage.multiple.chance.amount.cost.plus", 0)),
                },
              },
            },
          },
        },
        defense: {
          value: {
            multiply: math.bignumber(_.get(data, "hero.defense.value.multiply", 0)),
            plus: math.bignumber(_.get(data, "hero.defense.value.plus", 0)),
            cost: {
              multiply: math.bignumber(_.get(data, "hero.defense.value.cost.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.defense.value.cost.plus", 0)),
            },
          },
          chance: {
            percent: {
              multiply: Number(_.get(data, "hero.defense.chance.percent.multiply", 0)),
              plus: Number(_.get(data, "hero.defense.chance.percent.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.defense.chance.percent.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.defense.chance.percent.cost.plus", 0)),
              },
            },
            amount: {
              multiply: math.bignumber(_.get(data, "hero.defense.chance.amount.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.defense.chance.amount.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.defense.chance.amount.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.defense.chance.amount.cost.plus", 0)),
              },
            },
          },
        },
        hp: {
          max: {
            multiply: math.bignumber(_.get(data, "hero.hp.max.multiply", 0)),
            plus: math.bignumber(_.get(data, "hero.hp.max.plus", 0)),
            cost: {
              multiply: math.bignumber(_.get(data, "hero.hp.max.cost.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.hp.max.cost.plus", 0)),
            },
          },
          regen: {
            rate: {
              multiply: math.bignumber(_.get(data, "hero.hp.regen.rate.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.hp.regen.rate.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.hp.regen.rate.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.hp.regen.rate.cost.plus", 0)),
              },
            },
            speed: {
              multiply: Number(_.get(data, "hero.hp.regen.speed.multiply", 0)),
              plus: Number(_.get(data, "hero.hp.regen.speed.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.hp.regen.speed.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.hp.regen.speed.cost.plus", 0)),
              },
            },
          },
        },
        magic: {
          spell: {
            max: {
              multiply: Number(_.get(data, "hero.magic.spell.max.multiply", 0)),
              plus: Number(_.get(data, "hero.magic.spell.max.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.magic.spell.max.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.magic.spell.max.cost.plus", 0)),
              },
            },
            duration: {
              multiply: Number(_.get(data, "hero.magic.spell.duration.multiply", 0)),
              plus: Number(_.get(data, "hero.magic.spell.duration.plus", 0)),
            },
            delay: {
              multiply: Number(_.get(data, "hero.magic.spell.delay.multiply", 0)),
              plus: Number(_.get(data, "hero.magic.spell.delay.plus", 0)),
            },
            coolDown: {
              multiply: Number(_.get(data, "hero.magic.spell.coolDown.multiply", 0)),
              plus: Number(_.get(data, "hero.magic.spell.coolDown.plus", 0)),
            },
          },
          mana: {
            max: {
              multiply: math.bignumber(_.get(data, "hero.magic.mana.max.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.magic.mana.max.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "hero.magic.mana.max.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.magic.mana.max.cost.plus", 0)),
              },
            },
            regen: {
              rate: {
                multiply: math.bignumber(_.get(data, "hero.magic.mana.regen.rate.multiply", 0)),
                plus: math.bignumber(_.get(data, "hero.magic.mana.regen.rate.plus", 0)),
                cost: {
                  multiply: math.bignumber(_.get(data, "hero.magic.mana.regen.rate.cost.multiply", 0)),
                  plus: math.bignumber(_.get(data, "hero.magic.mana.regen.rate.cost.plus", 0)),
                },
              },
              speed: {
                multiply: Number(_.get(data, "hero.magic.mana.regen.speed.multiply", 0)),
                plus: Number(_.get(data, "hero.magic.mana.regen.speed.plus", 0)),
                cost: {
                  multiply: math.bignumber(_.get(data, "hero.magic.mana.regen.speed.cost.multiply", 0)),
                  plus: math.bignumber(_.get(data, "hero.magic.mana.regen.speed.cost.plus", 0)),
                },
              },
            },
          },
        },
        death: {
          speed: {
            multiply: Number(_.get(data, "hero.death.speed.multiply", 0)),
            plus: Number(_.get(data, "hero.death.speed.plus", 0)),
            cost: {
              multiply: math.bignumber(_.get(data, "hero.death.speed.cost.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.death.speed.cost.plus", 0)),
            },
          },
          max: {
            multiply: Number(_.get(data, "hero.death.max.multiply", 0)),
            plus: Number(_.get(data, "hero.death.max.plus", 0)),
            cost: {
              multiply: math.bignumber(_.get(data, "hero.death.max.cost.multiply", 0)),
              plus: math.bignumber(_.get(data, "hero.death.max.cost.plus", 0)),
            },
          },
        },
      };
      bonus.enemy = {
        all: {
          damage: {
            value: {
              multiply: math.bignumber(_.get(data, "enemy.all.damage.value.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.all.damage.value.plus", 0)),
            },
            chance: {
              percent: {
                multiply: Number(_.get(data, "enemy.all.damage.chance.percent.multiply", 0)),
                plus: Number(_.get(data, "enemy.all.damage.chance.percent.plus", 0)),
              },
              amount: {
                multiply: math.bignumber(_.get(data, "enemy.all.damage.chance.amount.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.all.damage.chance.amount.plus", 0)),
              },
            },
            speed: {
              multiply: Number(_.get(data, "enemy.all.damage.speed.multiply", 0)),
              plus: Number(_.get(data, "enemy.all.damage.speed.plus", 0)),
            },
            multiple: {
              value: {
                multiply: Number(_.get(data, "enemy.all.damage.multiple.value.multiply", 0)),
                plus: Number(_.get(data, "enemy.all.damage.multiple.value.plus", 0)),
              },
              chance: {
                percent: {
                  multiply: Number(_.get(data, "enemy.all.damage.multiple.chance.percent.multiply", 0)),
                  plus: Number(_.get(data, "enemy.all.damage.multiple.chance.percent.plus", 0)),
                },
                amount: {
                  multiply: Number(_.get(data, "enemy.all.damage.multiple.chance.amount.multiply", 0)),
                  plus: Number(_.get(data, "enemy.all.damage.multiple.chance.amount.plus", 0)),
                },
              },
            },
          },
          defense: {
            value: {
              multiply: math.bignumber(_.get(data, "enemy.all.defense.value.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.all.defense.value.plus", 0)),
            },
            chance: {
              percent: {
                multiply: Number(_.get(data, "enemy.all.defense.chance.percent.multiply", 0)),
                plus: Number(_.get(data, "enemy.all.defense.chance.percent.plus", 0)),
              },
              amount: {
                multiply: math.bignumber(_.get(data, "enemy.all.defense.chance.amount.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.all.defense.chance.amount.plus", 0)),
              },
            },
          },
          hp: {
            max: {
              multiply: math.bignumber(_.get(data, "enemy.all.hp.max.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.all.hp.max.plus", 0)),
            },
            regen: {
              rate: {
                multiply: math.bignumber(_.get(data, "enemy.all.hp.regen.rate.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.all.hp.regen.rate.plus", 0)),
              },
              speed: {
                multiply: Number(_.get(data, "enemy.all.hp.regen.speed.multiply", 0)),
                plus: Number(_.get(data, "enemy.all.hp.regen.speed.plus", 0)),
              },
            },
          },
          magic: {
            spell: {
              max: {
                multiply: Number(_.get(data, "enemy.all.magic.spell.max.multiply", 0)),
                plus: Number(_.get(data, "enemy.all.magic.spell.max.plus", 0)),
              },
              duration: {
                multiply: Number(_.get(data, "enemy.all.magic.spell.duration.multiply", 0)),
                plus: Number(_.get(data, "enemy.all.magic.spell.duration.plus", 0)),
              },
              delay: {
                multiply: Number(_.get(data, "enemy.all.magic.spell.delay.multiply", 0)),
                plus: Number(_.get(data, "enemy.all.magic.spell.delay.plus", 0)),
              },
              coolDown: {
                multiply: Number(_.get(data, "enemy.all.magic.spell.coolDown.multiply", 0)),
                plus: Number(_.get(data, "enemy.all.magic.spell.coolDown.plus", 0)),
              },
            },
            mana: {
              max: {
                multiply: math.bignumber(_.get(data, "enemy.all.magic.mana.max.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.all.magic.mana.max.plus", 0)),
              },
              regen: {
                rate: {
                  multiply: math.bignumber(_.get(data, "enemy.all.magic.mana.regen.rate.multiply", 0)),
                  plus: math.bignumber(_.get(data, "enemy.all.magic.mana.regen.rate.plus", 0)),
                },
                speed: {
                  multiply: Number(_.get(data, "enemy.all.magic.mana.regen.speed.multiply", 0)),
                  plus: Number(_.get(data, "enemy.all.magic.mana.regen.speed.plus", 0)),
                },
              },
            },
          },
          death: {
            speed: {
              multiply: Number(_.get(data, "enemy.all.death.speed.multiply", 0)),
              plus: Number(_.get(data, "enemy.all.death.speed.plus", 0)),
            },
            max: {
              multiply: Number(_.get(data, "enemy.all.death.max.multiply", 0)),
              plus: Number(_.get(data, "enemy.all.death.max.plus", 0)),
            },
          },
        },
        normal: {
          damage: {
            value: {
              multiply: math.bignumber(_.get(data, "enemy.normal.damage.value.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.normal.damage.value.plus", 0)),
            },
            chance: {
              percent: {
                multiply: Number(_.get(data, "enemy.normal.damage.chance.percent.multiply", 0)),
                plus: Number(_.get(data, "enemy.normal.damage.chance.percent.plus", 0)),
              },
              amount: {
                multiply: math.bignumber(_.get(data, "enemy.normal.damage.chance.amount.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.normal.damage.chance.amount.plus", 0)),
              },
            },
            speed: {
              multiply: Number(_.get(data, "enemy.normal.damage.speed.multiply", 0)),
              plus: Number(_.get(data, "enemy.normal.damage.speed.plus", 0)),
            },
            multiple: {
              value: {
                multiply: Number(_.get(data, "enemy.normal.damage.multiple.value.multiply", 0)),
                plus: Number(_.get(data, "enemy.normal.damage.multiple.value.plus", 0)),
              },
              chance: {
                percent: {
                  multiply: Number(_.get(data, "enemy.normal.damage.multiple.chance.percent.multiply", 0)),
                  plus: Number(_.get(data, "enemy.normal.damage.multiple.chance.percent.plus", 0)),
                },
                amount: {
                  multiply: Number(_.get(data, "enemy.normal.damage.multiple.chance.amount.multiply", 0)),
                  plus: Number(_.get(data, "enemy.normal.damage.multiple.chance.amount.plus", 0)),
                },
              },
            },
          },
          defense: {
            value: {
              multiply: math.bignumber(_.get(data, "enemy.normal.defense.value.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.normal.defense.value.plus", 0)),
            },
            chance: {
              percent: {
                multiply: Number(_.get(data, "enemy.normal.defense.chance.percent.multiply", 0)),
                plus: Number(_.get(data, "enemy.normal.defense.chance.percent.plus", 0)),
              },
              amount: {
                multiply: math.bignumber(_.get(data, "enemy.normal.defense.chance.amount.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.normal.defense.chance.amount.plus", 0)),
              },
            },
          },
          hp: {
            max: {
              multiply: math.bignumber(_.get(data, "enemy.normal.hp.max.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.normal.hp.max.plus", 0)),
            },
            regen: {
              rate: {
                multiply: math.bignumber(_.get(data, "enemy.normal.hp.regen.rate.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.normal.hp.regen.rate.plus", 0)),
              },
              speed: {
                multiply: Number(_.get(data, "enemy.normal.hp.regen.speed.multiply", 0)),
                plus: Number(_.get(data, "enemy.normal.hp.regen.speed.plus", 0)),
              },
            },
          },
          magic: {
            spell: {
              max: {
                multiply: Number(_.get(data, "enemy.normal.magic.spell.max.multiply", 0)),
                plus: Number(_.get(data, "enemy.normal.magic.spell.max.plus", 0)),
              },
              duration: {
                multiply: Number(_.get(data, "enemy.normal.magic.spell.duration.multiply", 0)),
                plus: Number(_.get(data, "enemy.normal.magic.spell.duration.plus", 0)),
              },
              delay: {
                multiply: Number(_.get(data, "enemy.normal.magic.spell.delay.multiply", 0)),
                plus: Number(_.get(data, "enemy.normal.magic.spell.delay.plus", 0)),
              },
              coolDown: {
                multiply: Number(_.get(data, "enemy.normal.magic.spell.coolDown.multiply", 0)),
                plus: Number(_.get(data, "enemy.normal.magic.spell.coolDown.plus", 0)),
              },
            },
            mana: {
              max: {
                multiply: math.bignumber(_.get(data, "enemy.normal.magic.mana.max.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.normal.magic.mana.max.plus", 0)),
              },
              regen: {
                rate: {
                  multiply: math.bignumber(_.get(data, "enemy.normal.magic.mana.regen.rate.multiply", 0)),
                  plus: math.bignumber(_.get(data, "enemy.normal.magic.mana.regen.rate.plus", 0)),
                },
                speed: {
                  multiply: Number(_.get(data, "enemy.normal.magic.mana.regen.speed.multiply", 0)),
                  plus: Number(_.get(data, "enemy.normal.magic.mana.regen.speed.plus", 0)),
                },
              },
            },
          },
          death: {
            speed: {
              multiply: Number(_.get(data, "enemy.normal.death.speed.multiply", 0)),
              plus: Number(_.get(data, "enemy.normal.death.speed.plus", 0)),
            },
            max: {
              multiply: Number(_.get(data, "enemy.normal.death.max.multiply", 0)),
              plus: Number(_.get(data, "enemy.normal.death.max.plus", 0)),
            },
          },
        },
        boss: {
          damage: {
            value: {
              multiply: math.bignumber(_.get(data, "enemy.boss.damage.value.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.boss.damage.value.plus", 0)),
            },
            chance: {
              percent: {
                multiply: Number(_.get(data, "enemy.boss.damage.chance.percent.multiply", 0)),
                plus: Number(_.get(data, "enemy.boss.damage.chance.percent.plus", 0)),
              },
              amount: {
                multiply: math.bignumber(_.get(data, "enemy.boss.damage.chance.amount.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.boss.damage.chance.amount.plus", 0)),
              },
            },
            speed: {
              multiply: Number(_.get(data, "enemy.boss.damage.speed.multiply", 0)),
              plus: Number(_.get(data, "enemy.boss.damage.speed.plus", 0)),
            },
            multiple: {
              value: {
                multiply: Number(_.get(data, "enemy.boss.damage.multiple.value.multiply", 0)),
                plus: Number(_.get(data, "enemy.boss.damage.multiple.value.plus", 0)),
              },
              chance: {
                percent: {
                  multiply: Number(_.get(data, "enemy.boss.damage.multiple.chance.percent.multiply", 0)),
                  plus: Number(_.get(data, "enemy.boss.damage.multiple.chance.percent.plus", 0)),
                },
                amount: {
                  multiply: Number(_.get(data, "enemy.boss.damage.multiple.chance.amount.multiply", 0)),
                  plus: Number(_.get(data, "enemy.boss.damage.multiple.chance.amount.plus", 0)),
                },
              },
            },
          },
          defense: {
            value: {
              multiply: math.bignumber(_.get(data, "enemy.boss.defense.value.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.boss.defense.value.plus", 0)),
            },
            chance: {
              percent: {
                multiply: Number(_.get(data, "enemy.boss.defense.chance.percent.multiply", 0)),
                plus: Number(_.get(data, "enemy.boss.defense.chance.percent.plus", 0)),
              },
              amount: {
                multiply: math.bignumber(_.get(data, "enemy.boss.defense.chance.amount.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.boss.defense.chance.amount.plus", 0)),
              },
            },
          },
          hp: {
            max: {
              multiply: math.bignumber(_.get(data, "enemy.boss.hp.max.multiply", 0)),
              plus: math.bignumber(_.get(data, "enemy.boss.hp.max.plus", 0)),
            },
            regen: {
              rate: {
                multiply: math.bignumber(_.get(data, "enemy.boss.hp.regen.rate.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.boss.hp.regen.rate.plus", 0)),
              },
              speed: {
                multiply: Number(_.get(data, "enemy.boss.hp.regen.speed.multiply", 0)),
                plus: Number(_.get(data, "enemy.boss.hp.regen.speed.plus", 0)),
              },
            },
          },
          magic: {
            spell: {
              max: {
                multiply: Number(_.get(data, "enemy.boss.magic.spell.max.multiply", 0)),
                plus: Number(_.get(data, "enemy.boss.magic.spell.max.plus", 0)),
              },
              duration: {
                multiply: Number(_.get(data, "enemy.boss.magic.spell.duration.multiply", 0)),
                plus: Number(_.get(data, "enemy.boss.magic.spell.duration.plus", 0)),
              },
              delay: {
                multiply: Number(_.get(data, "enemy.boss.magic.spell.delay.multiply", 0)),
                plus: Number(_.get(data, "enemy.boss.magic.spell.delay.plus", 0)),
              },
              coolDown: {
                multiply: Number(_.get(data, "enemy.boss.magic.spell.coolDown.multiply", 0)),
                plus: Number(_.get(data, "enemy.boss.magic.spell.coolDown.plus", 0)),
              },
            },
            mana: {
              max: {
                multiply: math.bignumber(_.get(data, "enemy.boss.magic.mana.max.multiply", 0)),
                plus: math.bignumber(_.get(data, "enemy.boss.magic.mana.max.plus", 0)),
              },
              regen: {
                rate: {
                  multiply: math.bignumber(_.get(data, "enemy.boss.magic.mana.regen.rate.multiply", 0)),
                  plus: math.bignumber(_.get(data, "enemy.boss.magic.mana.regen.rate.plus", 0)),
                },
                speed: {
                  multiply: Number(_.get(data, "enemy.boss.magic.mana.regen.speed.multiply", 0)),
                  plus: Number(_.get(data, "enemy.boss.magic.mana.regen.speed.plus", 0)),
                },
              },
            },
          },
          death: {
            speed: {
              multiply: Number(_.get(data, "enemy.boss.death.speed.multiply", 0)),
              plus: Number(_.get(data, "enemy.boss.death.speed.plus", 0)),
            },
            max: {
              multiply: Number(_.get(data, "enemy.boss.death.max.multiply", 0)),
              plus: Number(_.get(data, "enemy.boss.death.max.plus", 0)),
            },
          },
        },
      };
      bonus.money = {
        enemy: {
          multiply: math.bignumber(_.get(data, "money.enemy.multiply", 0)),
          plus: math.bignumber(_.get(data, "money.enemy.plus", 0)),
        },
        boss: {
          multiply: math.bignumber(_.get(data, "money.boss.multiply", 0)),
          plus: math.bignumber(_.get(data, "money.boss.plus", 0)),
        },
        all: {
          multiply: math.bignumber(_.get(data, "money.all.multiply", 0)),
          plus: math.bignumber(_.get(data, "money.all.plus", 0)),
        },
        cost: {
          multiply: math.bignumber(_.get(data, "money.cost.multiply", 0)),
          plus: math.bignumber(_.get(data, "money.cost.plus", 0)),
        },
      };
      bonus.xp = {
        enemy: {
          multiply: math.bignumber(_.get(data, "xp.enemy.multiply", 0)),
          plus: math.bignumber(_.get(data, "xp.enemy.plus", 0)),
        },
        boss: {
          multiply: math.bignumber(_.get(data, "xp.boss.multiply", 0)),
          plus: math.bignumber(_.get(data, "xp.boss.plus", 0)),
        },
        all: {
          multiply: math.bignumber(_.get(data, "xp.all.multiply", 0)),
          plus: math.bignumber(_.get(data, "xp.all.plus", 0)),
        },
        max: {
          multiply: math.bignumber(_.get(data, "xp.max.multiply", 0)),
          plus: math.bignumber(_.get(data, "xp.max.plus", 0)),
        },
      };
    };
    bonus.extract = function() {
      return {
        data: (function() {
          var returnData = [];
          for (var loopCount = 0; loopCount < bonus.data.length; loopCount ++) {
            returnData.push(bonus.data[loopCount].extract());
          }
          return returnData;
        })(),
        hero: {
          damage: {
            value: {
              multiply: bonus.hero.damage.value.multiply.toString(),
              plus: bonus.hero.damage.value.plus.toString(),
              cost: {
                multiply: bonus.hero.damage.value.cost.multiply.toString(),
                plus: bonus.hero.damage.value.cost.plus.toString(),
              },
            },
            chance: {
              percent: {
                multiply: bonus.hero.damage.chance.percent.multiply,
                plus: bonus.hero.damage.chance.percent.plus,
                cost: {
                  multiply: bonus.hero.damage.chance.percent.cost.multiply.toString(),
                  plus: bonus.hero.damage.chance.percent.cost.plus.toString(),
                },
              },
              amount: {
                multiply: bonus.hero.damage.chance.amount.multiply.toString(),
                plus: bonus.hero.damage.chance.amount.plus.toString(),
                cost: {
                  multiply: bonus.hero.damage.chance.amount.cost.multiply.toString(),
                  plus: bonus.hero.damage.chance.amount.cost.plus.toString(),
                },
              },
            },
            speed: {
              multiply: bonus.hero.damage.speed.multiply,
              plus: bonus.hero.damage.speed.plus,
              cost: {
                multiply: bonus.hero.damage.speed.cost.multiply.toString(),
                plus: bonus.hero.damage.speed.cost.plus.toString(),
              },
            },
            multiple: {
              value: {
                multiply: bonus.hero.damage.multiple.value.multiply,
                plus: bonus.hero.damage.multiple.value.plus,
                cost: {
                  multiply: bonus.hero.damage.multiple.value.cost.multiply.toString(),
                  plus: bonus.hero.damage.multiple.value.cost.plus.toString(),
                },
              },
              chance: {
                percent: {
                  multiply: bonus.hero.damage.multiple.chance.percent.multiply,
                  plus: bonus.hero.damage.multiple.chance.percent.plus,
                  cost: {
                    multiply: bonus.hero.damage.multiple.chance.percent.cost.multiply.toString(),
                    plus: bonus.hero.damage.multiple.chance.percent.cost.plus.toString(),
                  },
                },
                amount: {
                  multiply: bonus.hero.damage.multiple.chance.amount.multiply,
                  plus: bonus.hero.damage.multiple.chance.amount.plus,
                  cost: {
                    multiply: bonus.hero.damage.multiple.chance.amount.cost.multiply.toString(),
                    plus: bonus.hero.damage.multiple.chance.amount.cost.plus.toString(),
                  },
                },
              },
            },
          },
          defense: {
            value: {
              multiply: bonus.hero.defense.value.multiply.toString(),
              plus: bonus.hero.defense.value.plus.toString(),
              cost: {
                multiply: bonus.hero.defense.value.cost.multiply.toString(),
                plus: bonus.hero.defense.value.cost.plus.toString(),
              },
            },
            chance: {
              percent: {
                multiply: bonus.hero.defense.chance.percent.multiply,
                plus: bonus.hero.defense.chance.percent.plus,
                cost: {
                  multiply: bonus.hero.defense.chance.percent.cost.multiply.toString(),
                  plus: bonus.hero.defense.chance.percent.cost.plus.toString(),
                },
              },
              amount: {
                multiply: bonus.hero.defense.chance.amount.multiply.toString(),
                plus: bonus.hero.defense.chance.amount.plus.toString(),
                cost: {
                  multiply: bonus.hero.defense.chance.amount.cost.multiply.toString(),
                  plus: bonus.hero.defense.chance.amount.cost.plus.toString(),
                },
              },
            },
          },
          hp: {
            max: {
              multiply: bonus.hero.hp.max.multiply.toString(),
              plus: bonus.hero.hp.max.plus.toString(),
              cost: {
                multiply: bonus.hero.hp.max.cost.multiply.toString(),
                plus: bonus.hero.hp.max.cost.plus.toString(),
              },
            },
            regen: {
              rate: {
                multiply: bonus.hero.hp.regen.rate.multiply.toString(),
                plus: bonus.hero.hp.regen.rate.plus.toString(),
                cost: {
                  multiply: bonus.hero.hp.regen.rate.cost.multiply.toString(),
                  plus: bonus.hero.hp.regen.rate.cost.plus.toString(),
                },
              },
              speed: {
                multiply: bonus.hero.hp.regen.speed.multiply,
                plus: bonus.hero.hp.regen.speed.plus,
                cost: {
                  multiply: bonus.hero.hp.regen.speed.cost.multiply.toString(),
                  plus: bonus.hero.hp.regen.speed.cost.plus.toString(),
                },
              },
            },
          },
          magic: {
            spell: {
              max: {
                multiply: bonus.hero.magic.spell.max.multiply,
                plus: bonus.hero.magic.spell.max.plus,
                cost: {
                  multiply: bonus.hero.magic.spell.max.cost.multiply.toString(),
                  plus: bonus.hero.magic.spell.max.cost.plus.toString(),
                },
              },
              duration: {
                multiply: bonus.hero.magic.spell.duration.multiply,
                plus: bonus.hero.magic.spell.duration.plus,
              },
              delay: {
                multiply: bonus.hero.magic.spell.delay.multiply,
                plus: bonus.hero.magic.spell.delay.plus,
              },
              coolDown: {
                multiply: bonus.hero.magic.spell.coolDown.multiply,
                plus: bonus.hero.magic.spell.coolDown.plus,
              },
            },
            mana: {
              max: {
                multiply: bonus.hero.magic.mana.max.multiply.toString(),
                plus: bonus.hero.magic.mana.max.plus.toString(),
                cost: {
                  multiply: bonus.hero.magic.mana.max.cost.multiply.toString(),
                  plus: bonus.hero.magic.mana.max.cost.plus.toString(),
                },
              },
              regen: {
                rate: {
                  multiply: bonus.hero.magic.mana.regen.rate.multiply.toString(),
                  plus: bonus.hero.magic.mana.regen.rate.plus.toString(),
                  cost: {
                    multiply: bonus.hero.magic.mana.regen.rate.cost.multiply.toString(),
                    plus: bonus.hero.magic.mana.regen.rate.cost.plus.toString(),
                  },
                },
                speed: {
                  multiply: bonus.hero.magic.mana.regen.speed.multiply,
                  plus: bonus.hero.magic.mana.regen.speed.plus,
                  cost: {
                    multiply: bonus.hero.magic.mana.regen.speed.cost.multiply.toString(),
                    plus: bonus.hero.magic.mana.regen.speed.cost.plus.toString(),
                  },
                },
              },
            },
          },
          death: {
            speed: {
              multiply: bonus.hero.death.speed.multiply,
              plus: bonus.hero.death.speed.plus,
              cost: {
                multiply: bonus.hero.death.speed.cost.multiply.toString(),
                plus: bonus.hero.death.speed.cost.plus.toString(),
              },
            },
            max: {
              multiply: bonus.hero.death.max.multiply,
              plus: bonus.hero.death.max.plus,
              cost: {
                multiply: bonus.hero.death.max.cost.multiply.toString(),
                plus: bonus.hero.death.max.cost.plus.toString(),
              },
            },
          },
        },
        enemy: {
          all: {
            damage: {
              value: {
                multiply: bonus.enemy.all.damage.value.multiply.toString(),
                plus: bonus.enemy.all.damage.value.plus.toString(),
              },
              chance: {
                percent: {
                  multiply: bonus.enemy.all.damage.chance.percent.multiply,
                  plus: bonus.enemy.all.damage.chance.percent.plus,
                },
                amount: {
                  multiply: bonus.enemy.all.damage.chance.amount.multiply.toString(),
                  plus: bonus.enemy.all.damage.chance.amount.plus.toString(),
                },
              },
              speed: {
                multiply: bonus.enemy.all.damage.speed.multiply,
                plus: bonus.enemy.all.damage.speed.plus,
              },
              multiple: {
                value: {
                  multiply: bonus.enemy.all.damage.multiple.value.multiply,
                  plus: bonus.enemy.all.damage.multiple.value.plus,
                },
                chance: {
                  percent: {
                    multiply: bonus.enemy.all.damage.multiple.chance.percent.multiply,
                    plus: bonus.enemy.all.damage.multiple.chance.percent.plus,
                  },
                  amount: {
                    multiply: bonus.enemy.all.damage.multiple.chance.amount.multiply,
                    plus: bonus.enemy.all.damage.multiple.chance.amount.plus,
                  },
                },
              },
            },
            defense: {
              value: {
                multiply: bonus.enemy.all.defense.value.multiply.toString(),
                plus: bonus.enemy.all.defense.value.plus.toString(),
              },
              chance: {
                percent: {
                  multiply: bonus.enemy.all.defense.chance.percent.multiply,
                  plus: bonus.enemy.all.defense.chance.percent.plus,
                },
                amount: {
                  multiply: bonus.enemy.all.defense.chance.amount.multiply.toString(),
                  plus: bonus.enemy.all.defense.chance.amount.plus.toString(),
                },
              },
            },
            hp: {
              max: {
                multiply: bonus.enemy.all.hp.max.multiply.toString(),
                plus: bonus.enemy.all.hp.max.plus.toString(),
              },
              regen: {
                rate: {
                  multiply: bonus.enemy.all.hp.regen.rate.multiply.toString(),
                  plus: bonus.enemy.all.hp.regen.rate.plus.toString(),
                },
                speed: {
                  multiply: bonus.enemy.all.hp.regen.speed.multiply,
                  plus: bonus.enemy.all.hp.regen.speed.plus,
                },
              },
            },
            magic: {
              spell: {
                max: {
                  multiply: bonus.enemy.all.magic.spell.max.multiply,
                  plus: bonus.enemy.all.magic.spell.max.plus,
                },
                duration: {
                  multiply: bonus.enemy.all.magic.spell.duration.multiply,
                  plus: bonus.enemy.all.magic.spell.duration.plus,
                },
                delay: {
                  multiply: bonus.enemy.all.magic.spell.delay.multiply,
                  plus: bonus.enemy.all.magic.spell.delay.plus,
                },
                coolDown: {
                  multiply: bonus.enemy.all.magic.spell.coolDown.multiply,
                  plus: bonus.enemy.all.magic.spell.coolDown.plus,
                },
              },
              mana: {
                max: {
                  multiply: bonus.enemy.all.magic.mana.max.multiply.toString(),
                  plus: bonus.enemy.all.magic.mana.max.plus.toString(),
                },
                regen: {
                  rate: {
                    multiply: bonus.enemy.all.magic.mana.regen.rate.multiply.toString(),
                    plus: bonus.enemy.all.magic.mana.regen.rate.plus.toString(),
                  },
                  speed: {
                    multiply: bonus.enemy.all.magic.mana.regen.speed.multiply,
                    plus: bonus.enemy.all.magic.mana.regen.speed.plus,
                  },
                },
              },
            },
            death: {
              speed: {
                multiply: bonus.enemy.all.death.speed.multiply,
                plus: bonus.enemy.all.death.speed.plus,
              },
              max: {
                multiply: bonus.enemy.all.death.max.multiply,
                plus: bonus.enemy.all.death.max.plus,
              },
            },
          },
          normal: {
            damage: {
              value: {
                multiply: bonus.enemy.normal.damage.value.multiply.toString(),
                plus: bonus.enemy.normal.damage.value.plus.toString(),
              },
              chance: {
                percent: {
                  multiply: bonus.enemy.normal.damage.chance.percent.multiply,
                  plus: bonus.enemy.normal.damage.chance.percent.plus,
                },
                amount: {
                  multiply: bonus.enemy.normal.damage.chance.amount.multiply.toString(),
                  plus: bonus.enemy.normal.damage.chance.amount.plus.toString(),
                },
              },
              speed: {
                multiply: bonus.enemy.normal.damage.speed.multiply,
                plus: bonus.enemy.normal.damage.speed.plus,
              },
              multiple: {
                value: {
                  multiply: bonus.enemy.normal.damage.multiple.value.multiply,
                  plus: bonus.enemy.normal.damage.multiple.value.plus,
                },
                chance: {
                  percent: {
                    multiply: bonus.enemy.normal.damage.multiple.chance.percent.multiply,
                    plus: bonus.enemy.normal.damage.multiple.chance.percent.plus,
                  },
                  amount: {
                    multiply: bonus.enemy.normal.damage.multiple.chance.amount.multiply,
                    plus: bonus.enemy.normal.damage.multiple.chance.amount.plus,
                  },
                },
              },
            },
            defense: {
              value: {
                multiply: bonus.enemy.normal.defense.value.multiply.toString(),
                plus: bonus.enemy.normal.defense.value.plus.toString(),
              },
              chance: {
                percent: {
                  multiply: bonus.enemy.normal.defense.chance.percent.multiply,
                  plus: bonus.enemy.normal.defense.chance.percent.plus,
                },
                amount: {
                  multiply: bonus.enemy.normal.defense.chance.amount.multiply.toString(),
                  plus: bonus.enemy.normal.defense.chance.amount.plus.toString(),
                },
              },
            },
            hp: {
              max: {
                multiply: bonus.enemy.normal.hp.max.multiply.toString(),
                plus: bonus.enemy.normal.hp.max.plus.toString(),
              },
              regen: {
                rate: {
                  multiply: bonus.enemy.normal.hp.regen.rate.multiply.toString(),
                  plus: bonus.enemy.normal.hp.regen.rate.plus.toString(),
                },
                speed: {
                  multiply: bonus.enemy.normal.hp.regen.speed.multiply,
                  plus: bonus.enemy.normal.hp.regen.speed.plus,
                },
              },
            },
            magic: {
              spell: {
                max: {
                  multiply: bonus.enemy.normal.magic.spell.max.multiply,
                  plus: bonus.enemy.normal.magic.spell.max.plus,
                },
                duration: {
                  multiply: bonus.enemy.normal.magic.spell.duration.multiply,
                  plus: bonus.enemy.normal.magic.spell.duration.plus,
                },
                delay: {
                  multiply: bonus.enemy.normal.magic.spell.delay.multiply,
                  plus: bonus.enemy.normal.magic.spell.delay.plus,
                },
                coolDown: {
                  multiply: bonus.enemy.normal.magic.spell.coolDown.multiply,
                  plus: bonus.enemy.normal.magic.spell.coolDown.plus,
                },
              },
              mana: {
                max: {
                  multiply: bonus.enemy.normal.magic.mana.max.multiply.toString(),
                  plus: bonus.enemy.normal.magic.mana.max.plus.toString(),
                },
                regen: {
                  rate: {
                    multiply: bonus.enemy.normal.magic.mana.regen.rate.multiply.toString(),
                    plus: bonus.enemy.normal.magic.mana.regen.rate.plus.toString(),
                  },
                  speed: {
                    multiply: bonus.enemy.normal.magic.mana.regen.speed.multiply,
                    plus: bonus.enemy.normal.magic.mana.regen.speed.plus,
                  },
                },
              },
            },
            death: {
              speed: {
                multiply: bonus.enemy.normal.death.speed.multiply,
                plus: bonus.enemy.normal.death.speed.plus,
              },
              max: {
                multiply: bonus.enemy.normal.death.max.multiply,
                plus: bonus.enemy.normal.death.max.plus,
              },
            },
          },
          boss: {
            damage: {
              value: {
                multiply: bonus.enemy.boss.damage.value.multiply.toString(),
                plus: bonus.enemy.boss.damage.value.plus.toString(),
              },
              chance: {
                percent: {
                  multiply: bonus.enemy.boss.damage.chance.percent.multiply,
                  plus: bonus.enemy.boss.damage.chance.percent.plus,
                },
                amount: {
                  multiply: bonus.enemy.boss.damage.chance.amount.multiply.toString(),
                  plus: bonus.enemy.boss.damage.chance.amount.plus.toString(),
                },
              },
              speed: {
                multiply: bonus.enemy.boss.damage.speed.multiply,
                plus: bonus.enemy.boss.damage.speed.plus,
              },
              multiple: {
                value: {
                  multiply: bonus.enemy.boss.damage.multiple.value.multiply,
                  plus: bonus.enemy.boss.damage.multiple.value.plus,
                },
                chance: {
                  percent: {
                    multiply: bonus.enemy.boss.damage.multiple.chance.percent.multiply,
                    plus: bonus.enemy.boss.damage.multiple.chance.percent.plus,
                  },
                  amount: {
                    multiply: bonus.enemy.boss.damage.multiple.chance.amount.multiply,
                    plus: bonus.enemy.boss.damage.multiple.chance.amount.plus,
                  },
                },
              },
            },
            defense: {
              value: {
                multiply: bonus.enemy.boss.defense.value.multiply.toString(),
                plus: bonus.enemy.boss.defense.value.plus.toString(),
              },
              chance: {
                percent: {
                  multiply: bonus.enemy.boss.defense.chance.percent.multiply,
                  plus: bonus.enemy.boss.defense.chance.percent.plus,
                },
                amount: {
                  multiply: bonus.enemy.boss.defense.chance.amount.multiply.toString(),
                  plus: bonus.enemy.boss.defense.chance.amount.plus.toString(),
                },
              },
            },
            hp: {
              max: {
                multiply: bonus.enemy.boss.hp.max.multiply.toString(),
                plus: bonus.enemy.boss.hp.max.plus.toString(),
              },
              regen: {
                rate: {
                  multiply: bonus.enemy.boss.hp.regen.rate.multiply.toString(),
                  plus: bonus.enemy.boss.hp.regen.rate.plus.toString(),
                },
                speed: {
                  multiply: bonus.enemy.boss.hp.regen.speed.multiply,
                  plus: bonus.enemy.boss.hp.regen.speed.plus,
                },
              },
            },
            magic: {
              spell: {
                max: {
                  multiply: bonus.enemy.boss.magic.spell.max.multiply,
                  plus: bonus.enemy.boss.magic.spell.max.plus,
                },
                duration: {
                  multiply: bonus.enemy.boss.magic.spell.duration.multiply,
                  plus: bonus.enemy.boss.magic.spell.duration.plus,
                },
                delay: {
                  multiply: bonus.enemy.boss.magic.spell.delay.multiply,
                  plus: bonus.enemy.boss.magic.spell.delay.plus,
                },
                coolDown: {
                  multiply: bonus.enemy.boss.magic.spell.coolDown.multiply,
                  plus: bonus.enemy.boss.magic.spell.coolDown.plus,
                },
              },
              mana: {
                max: {
                  multiply: bonus.enemy.boss.magic.mana.max.multiply.toString(),
                  plus: bonus.enemy.boss.magic.mana.max.plus.toString(),
                },
                regen: {
                  rate: {
                    multiply: bonus.enemy.boss.magic.mana.regen.rate.multiply.toString(),
                    plus: bonus.enemy.boss.magic.mana.regen.rate.plus.toString(),
                  },
                  speed: {
                    multiply: bonus.enemy.boss.magic.mana.regen.speed.multiply,
                    plus: bonus.enemy.boss.magic.mana.regen.speed.plus,
                  },
                },
              },
            },
            death: {
              speed: {
                multiply: bonus.enemy.boss.death.speed.multiply,
                plus: bonus.enemy.boss.death.speed.plus,
              },
              max: {
                multiply: bonus.enemy.boss.death.max.multiply,
                plus: bonus.enemy.boss.death.max.plus,
              },
            },
          },
        },
        money: {
          enemy: {
            multiply: bonus.money.enemy.multiply.toString(),
            plus: bonus.money.enemy.plus.toString(),
          },
          boss: {
            multiply: bonus.money.boss.multiply.toString(),
            plus: bonus.money.boss.plus.toString(),
          },
          all: {
            multiply: bonus.money.all.multiply.toString(),
            plus: bonus.money.all.plus.toString(),
          },
          cost: {
            multiply: bonus.money.cost.multiply.toString(),
            plus: bonus.money.cost.plus.toString(),
          },
        },
        xp: {
          enemy: {
            multiply: bonus.xp.enemy.multiply.toString(),
            plus: bonus.xp.enemy.plus.toString(),
          },
          boss: {
            multiply: bonus.xp.boss.multiply.toString(),
            plus: bonus.xp.boss.plus.toString(),
          },
          all: {
            multiply: bonus.xp.all.multiply.toString(),
            plus: bonus.xp.all.plus.toString(),
          },
          max: {
            multiply: bonus.xp.max.multiply.toString(),
            plus: bonus.xp.max.plus.toString(),
          },
        },
      };
    };
    bonus.apply(storeData ? storeData.bonus : undefined);
  })();
  
  //Upgrade data
  (function() {
    upgrade.active = [];
    upgrade.wait = [];
    upgrade.list = {};
  })();
  
  //Class
  function Bonus(data) {
    data = data || {};
    this.object = data.object;
    this.type = data.type || undefined;
    this.data = data.data || this.list[this.type].template(this);
    this.location = 0;
    this.hash = randomString();
  }
  Bonus.prototype = {
    call: function(param) {
      return this.list[this.type].call(param || this);
    },
    apply: function(data) {
      this.click = data.click || this.list[this.type].click || function() {};
      return this.list[this.type].apply(this, data);
    },
    extract: function() {
      return {
        data: this.list[this.type].extract(this),
        type: this.type,
      };
    },
    list: {
      heroLevelUp: {
        template: function(obj) {
          return {
            damage: {
              previous: math.bignumber(0),
              increment: lostCalculate(obj.object.damage.value.increment, 10, 3),
            },
            defense: {
              previous: math.bignumber(0),
              increment: lostCalculate(obj.object.defense.value.increment, 10, 3),
            },
            hp: {
              max: {
                previous: math.bignumber(0),
                increment: lostCalculate(obj.object.hp.max.increment, 10, 3),
              },
              rate: {
                previous: math.bignumber(0),
                increment: lostCalculate(obj.object.hp.regen.rate.increment, 10, 3),
              },
            },
            mana: {
              max: {
                previous: math.bignumber(0),
                increment: lostCalculate(obj.object.magic.mana.max.increment, 10, 3),
              },
              rate: {
                previous: math.bignumber(0),
                increment: lostCalculate(obj.object.magic.mana.regen.rate.increment, 10, 3),
              },
            },
          };
        },
        call: function(obj) {
          obj.object.bonus.damage.value.multiply = math.subtract(obj.object.bonus.damage.value.multiply, obj.data.damage.previous);
          obj.data.damage.previous = math.subtract(math.pow(obj.data.damage.increment, obj.object.xp.max.count), 1);
          obj.object.bonus.damage.value.multiply = math.add(obj.object.bonus.damage.value.multiply, obj.data.damage.previous);
          obj.object.bonus.defense.value.multiply = math.subtract(obj.object.bonus.defense.value.multiply, obj.data.defense.previous);
          obj.data.defense.previous = math.subtract(math.pow(obj.data.defense.increment, obj.object.xp.max.count), 1);
          obj.object.bonus.defense.value.multiply = math.add(obj.object.bonus.defense.value.multiply, obj.data.defense.previous);
          obj.object.bonus.hp.max.multiply = math.subtract(obj.object.bonus.hp.max.multiply, obj.data.hp.max.previous);
          obj.data.hp.max.previous = math.subtract(math.pow(obj.data.hp.max.increment, obj.object.xp.max.count), 1);
          obj.object.bonus.hp.max.multiply = math.add(obj.object.bonus.hp.max.multiply, obj.data.hp.max.previous);
          obj.object.bonus.hp.regen.rate.multiply = math.subtract(obj.object.bonus.hp.regen.rate.multiply, obj.data.hp.rate.previous);
          obj.data.hp.rate.previous = math.subtract(math.pow(obj.data.hp.rate.increment, obj.object.xp.max.count), 1);
          obj.object.bonus.hp.regen.rate.multiply = math.add(obj.object.bonus.hp.regen.rate.multiply, obj.data.hp.rate.previous);
          obj.object.bonus.magic.mana.max.multiply = math.subtract(obj.object.bonus.magic.mana.max.multiply, obj.data.mana.max.previous);
          obj.data.mana.max.previous = math.subtract(math.pow(obj.data.mana.max.increment, obj.object.xp.max.count), 1);
          obj.object.bonus.magic.mana.max.multiply = math.add(obj.object.bonus.magic.mana.max.multiply, obj.data.mana.max.previous);
          obj.object.bonus.magic.mana.regen.rate.multiply = math.subtract(obj.object.bonus.magic.mana.regen.rate.multiply, obj.data.mana.rate.previous);
          obj.data.mana.rate.previous = math.subtract(math.pow(obj.data.mana.rate.increment, obj.object.xp.max.count), 1);
          obj.object.bonus.magic.mana.regen.rate.multiply = math.add(obj.object.bonus.magic.mana.regen.rate.multiply, obj.data.mana.rate.previous);
        },
        apply: function(obj, data) {
          obj.data.damage.previous = math.bignumber(data.data.damage.previous || 0);
          obj.data.damage.increment = math.bignumber(data.data.damage.increment || 0);
          obj.data.defense.previous = math.bignumber(data.data.defense.previous || 0);
          obj.data.defense.increment = math.bignumber(data.data.defense.increment || 0);
          obj.data.hp.max.previous = math.bignumber(data.data.hp.max.previous || 0);
          obj.data.hp.max.increment = math.bignumber(data.data.hp.max.increment || 0);
          obj.data.hp.rate.previous = math.bignumber(data.data.hp.rate.previous || 0);
          obj.data.hp.rate.increment = math.bignumber(data.data.hp.rate.increment || 0);
          obj.data.mana.max.previous = math.bignumber(data.data.mana.max.previous || 0);
          obj.data.mana.max.increment = math.bignumber(data.data.mana.max.increment || 0);
          obj.data.mana.rate.previous = math.bignumber(data.data.mana.rate.previous || 0);
          obj.data.mana.rate.increment = math.bignumber(data.data.mana.rate.increment || 0);
          return true;
        },
        extract: function(obj) {
          var returnData = {
            damage: {
              previous: obj.data.damage.previous.toString(),
              increment: obj.data.damage.increment.toString(),
            },
            defense: {
              previous: obj.data.defense.previous.toString(),
              increment: obj.data.defense.increment.toString(),
            },
            hp: {
              max: {
                previous: obj.data.hp.max.previous.toString(),
                increment: obj.data.hp.max.increment.toString(),
              },
              rate: {
                previous: obj.data.hp.rate.previous.toString(),
                increment: obj.data.hp.rate.increment.toString(),
              },
            },
            mana: {
              max: {
                previous: obj.data.mana.max.previous.toString(),
                increment: obj.data.mana.max.increment.toString(),
              },
              rate: {
                previous: obj.data.mana.rate.previous.toString(),
                increment: obj.data.mana.rate.increment.toString(),
              },
            },
          };
          return returnData;
        },
      },
    },
  };
  
  function Spell(data) {
    
  }
  Spell.prototype = {
    
  };
  
  function Equipment(data) {
    
  }
  Equipment.prototype = {
    
  };
  
  //Player data
  (function() {
    player.apply = function(data) {
      player.damage = {
        value: {
          current: undefined,
          total: undefined,
          base: math.bignumber(_.get(data, "damage.value.base", 2)),
          count: Number(_.get(data, "damage.value.count", 0)),
          increment: math.bignumber(_.get(data, "damage.value.increment", stats.multiply.lost)),
          cost: {
            base: math.bignumber(_.get(data, "damage.value.cost.base", 1.5)),
            increment: math.bignumber(_.get(data, "damage.value.cost.increment", stats.multiply.base)),
            current: undefined,
            total: undefined,
          },
        },
        chance: {
          percent: {
            current: undefined,
            total: undefined,
            base: Number(_.get(data, "damage.chance.percent.base", 0)),
            count: Number(_.get(data, "damage.chance.percent.count", 0)),
            increment: Number(_.get(data, "damage.chance.percent.increment", 0)),
            cost: {
              base: math.bignumber(_.get(data, "damage.chance.percent.cost.base", 0)),
              increment: math.bignumber(_.get(data, "damage.chance.percent.cost.increment", 0)),
              current: undefined,
              total: undefined,
            },
            max: Number(_.get(data, "damage.chance.percent.max", 0)),
          },
          amount: {
            current: undefined,
            total: undefined,
            base: math.bignumber(_.get(data, "damage.chance.amount.base", 0)),
            count: Number(_.get(data, "damage.chance.amount.count", 0)),
            increment: math.bignumber(_.get(data, "damage.chance.amount.increment", 0)),
            cost: {
              base: math.bignumber(_.get(data, "damage.chance.amount.cost.base", 0)),
              increment: math.bignumber(_.get(data, "damage.chance.amount.cost.increment", 0)),
              current: undefined,
              total: undefined,
            },
            max: Number(_.get(data, "damage.chance.amount.max", 0)),
          },
        },
        multiple: {
          value: {
            current: undefined,
            total: undefined,
            base: Number(_.get(data, "damage.multiple.value.base", 1)),
            count: Number(_.get(data, "damage.multiple.value.count", 0)),
            increment: Number(_.get(data, "damage.multiple.value.increment", 0)),
            cost: {
              base: math.bignumber(_.get(data, "damage.multiple.value.cost.base", 0)),
              increment: math.bignumber(_.get(data, "damage.multiple.value.cost.increment", 0)),
              current: undefined,
              total: undefined,
            },
            max: Number(_.get(data, "damage.multiple.value.max", 0)),
          },
          chance: {
            percent: {
              current: undefined,
              total: undefined,
              base: Number(_.get(data, "damage.multiple.chance.percent.base", 0)),
              count: Number(_.get(data, "damage.multiple.chance.percent.count", 0)),
              increment: Number(_.get(data, "damage.multiple.chance.percent.increment", 0)),
              cost: {
                base: math.bignumber(_.get(data, "damage.multiple.chance.percent.cost.base", 0)),
                increment: math.bignumber(_.get(data, "damage.multiple.chance.percent.cost.increment", 0)),
                current: undefined,
                total: undefined,
              },
              max: Number(_.get(data, "damage.multiple.chance.percent.max", 0)),
            },
            amount: {
              current: undefined,
              total: undefined,
              base: Number(_.get(data, "damage.multiple.chance.amount.base", 1)),
              count: Number(_.get(data, "damage.multiple.chance.amount.count", 0)),
              increment: Number(_.get(data, "damage.multiple.chance.amount.increment", 0)),
              cost: {
                base: math.bignumber(_.get(data, "damage.multiple.chance.amount.cost.base", 0)),
                increment: math.bignumber(_.get(data, "damage.multiple.chance.amount.cost.increment", 0)),
                current: undefined,
                total: undefined,
              },
              max: Number(_.get(data, "damage.multiple.chance.amount.max", 0)),
            },
          },
        },
      };
      player.bonus = {
        damage: {
          value: {
            multiply: math.bignumber(_.get(data, "bonus.damage.value.multiply", 0)),
            plus: math.bignumber(_.get(data, "bonus.damage.value.plus", 0)),
            cost: {
              multiply: math.bignumber(_.get(data, "bonus.damage.value.cost.multiply", 0)),
              plus: math.bignumber(_.get(data, "bonus.damage.value.cost.plus", 0)),
            },
          },
          chance: {
            percent: {
              multiply: Number(_.get(data, "bonus.damage.chance.percent.multiply", 0)),
              plus: Number(_.get(data, "bonus.damage.chance.percent.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "bonus.damage.chance.percent.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "bonus.damage.chance.percent.cost.plus", 0)),
              },
            },
            amount: {
              multiply: math.bignumber(_.get(data, "bonus.damage.chance.amount.multiply", 0)),
              plus: math.bignumber(_.get(data, "bonus.damage.chance.amount.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "bonus.damage.chance.amount.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "bonus.damage.chance.amount.cost.plus", 0)),
              },
            },
          },
          speed: {
            multiply: Number(_.get(data, "bonus.damage.speed.multiply", 0)),
            plus: Number(_.get(data, "bonus.damage.speed.plus", 0)),
            cost: {
              multiply: math.bignumber(_.get(data, "bonus.damage.speed.cost.multiply", 0)),
              plus: math.bignumber(_.get(data, "bonus.damage.speed.cost.plus", 0)),
            },
          },
          multiple: {
            value: {
              multiply: Number(_.get(data, "bonus.damage.multiple.value.multiply", 0)),
              plus: Number(_.get(data, "bonus.damage.multiple.value.plus", 0)),
              cost: {
                multiply: math.bignumber(_.get(data, "bonus.damage.multiple.value.cost.multiply", 0)),
                plus: math.bignumber(_.get(data, "bonus.damage.multiple.value.cost.plus", 0)),
              },
            },
            chance: {
              percent: {
                multiply: Number(_.get(data, "bonus.damage.multiple.chance.percent.multiply", 0)),
                plus: Number(_.get(data, "bonus.damage.multiple.chance.percent.plus", 0)),
                cost: {
                  multiply: math.bignumber(_.get(data, "bonus.damage.multiple.chance.percent.cost.multiply", 0)),
                  plus: math.bignumber(_.get(data, "bonus.damage.multiple.chance.percent.cost.plus", 0)),
                },
              },
              amount: {
                multiply: Number(_.get(data, "bonus.damage.multiple.chance.amount.multiply", 0)),
                plus: Number(_.get(data, "bonus.damage.multiple.chance.amount.plus", 0)),
                cost: {
                  multiply: math.bignumber(_.get(data, "bonus.damage.multiple.chance.amount.cost.multiply", 0)),
                  plus: math.bignumber(_.get(data, "bonus.damage.multiple.chance.amount.cost.plus", 0)),
                },
              },
            },
          },
        },
      };
    };
    player.extract = function() {
      return {
        damage: {
          value: {
            base: player.damage.value.base.toString(),
            count: player.damage.value.count,
            increment: player.damage.value.increment.toString(),
            cost: {
              base: player.damage.value.cost.base.toString(),
              increment: player.damage.value.cost.increment.toString(),
            },
          },
          chance: {
            percent: {
              base: player.damage.chance.percent.base,
              count: player.damage.chance.percent.count,
              increment: player.damage.chance.percent.increment,
              cost: {
                base: player.damage.chance.percent.cost.base.toString(),
                increment: player.damage.chance.percent.cost.increment.toString(),
              },
              max: player.damage.chance.percent.max,
            },
            amount: {
              base: player.damage.chance.amount.base.toString(),
              count: player.damage.chance.amount.count,
              increment: player.damage.chance.amount.increment.toString(),
              cost: {
                base: player.damage.chance.amount.cost.base.toString(),
                increment: player.damage.chance.amount.cost.increment.toString(),
              },
              max: player.damage.chance.amount.max,
            },
          },
          multiple: {
            value: {
              base: player.damage.multiple.value.base,
              count: player.damage.multiple.value.count,
              increment: player.damage.multiple.value.increment,
              cost: {
                base: player.damage.multiple.value.cost.base.toString(),
                increment: player.damage.multiple.value.cost.increment.toString(),
              },
              max: player.damage.multiple.value.max,
            },
            chance: {
              percent: {
                base: player.damage.multiple.chance.percent.base,
                count: player.damage.multiple.chance.percent.count,
                increment: player.damage.multiple.chance.percent.increment,
                cost: {
                  base: player.damage.multiple.chance.percent.cost.base.toString(),
                  increment: player.damage.multiple.chance.percent.cost.increment.toString(),
                },
                max: player.damage.multiple.chance.percent.max,
              },
              amount: {
                base: player.damage.multiple.chance.amount.base,
                count: player.damage.multiple.chance.amount.count,
                increment: player.damage.multiple.chance.amount.increment,
                cost: {
                  base: player.damage.multiple.chance.amount.cost.base.toString(),
                  increment: player.damage.multiple.chance.amount.cost.increment.toString(),
                },
                max: player.damage.multiple.chance.amount.max,
              },
            },
          },
        },
        bonus: {
          damage: {
            value: {
              multiply: player.bonus.damage.value.multiply.toString(),
              plus: player.bonus.damage.value.plus.toString(),
              cost: {
                multiply: player.bonus.damage.value.cost.multiply.toString(),
                plus: player.bonus.damage.value.cost.plus.toString(),
              },
            },
            chance: {
              percent: {
                multiply: player.bonus.damage.chance.percent.multiply,
                plus: player.bonus.damage.chance.percent.plus,
                cost: {
                  multiply: player.bonus.damage.chance.percent.cost.multiply.toString(),
                  plus: player.bonus.damage.chance.percent.cost.plus.toString(),
                },
              },
              amount: {
                multiply: player.bonus.damage.chance.amount.multiply.toString(),
                plus: player.bonus.damage.chance.amount.plus.toString(),
                cost: {
                  multiply: player.bonus.damage.chance.amount.cost.multiply.toString(),
                  plus: player.bonus.damage.chance.amount.cost.plus.toString(),
                },
              },
            },
            speed: {
              multiply: player.bonus.damage.speed.multiply,
              plus: player.bonus.damage.speed.plus,
              cost: {
                multiply: player.bonus.damage.speed.cost.multiply.toString(),
                plus: player.bonus.damage.speed.cost.plus.toString(),
              },
            },
            multiple: {
              value: {
                multiply: player.bonus.damage.multiple.value.multiply,
                plus: player.bonus.damage.multiple.value.plus,
                cost: {
                  multiply: player.bonus.damage.multiple.value.cost.multiply.toString(),
                  plus: player.bonus.damage.multiple.value.cost.plus.toString(),
                },
              },
              chance: {
                percent: {
                  multiply: player.bonus.damage.multiple.chance.percent.multiply,
                  plus: player.bonus.damage.multiple.chance.percent.plus,
                  cost: {
                    multiply: player.bonus.damage.multiple.chance.percent.cost.multiply.toString(),
                    plus: player.bonus.damage.multiple.chance.percent.cost.plus.toString(),
                  },
                },
                amount: {
                  multiply: player.bonus.damage.multiple.chance.amount.multiply,
                  plus: player.bonus.damage.multiple.chance.amount.plus,
                  cost: {
                    multiply: player.bonus.damage.multiple.chance.amount.cost.multiply.toString(),
                    plus: player.bonus.damage.multiple.chance.amount.cost.plus.toString(),
                  },
                },
              },
            },
          },
        },
      };
    };
    player.attack = function(enemyData, amount) {
      var returnData = {
        target: undefined,
        damageAmount: undefined,
        defenseAmount: undefined,
        realDamage: undefined,
        damageLeft: math.bignumber(0),
      };
      var blockAmount = Math.configRandom({
        min: 0,
        max: 99,
      }) <= enemyData.defense.chance.percent.total ? enemyData.defense.chance.amount.total : 1;
      var damageAmount = Math.configRandom({
        min: 0,
        max: 99,
      }) <= player.damage.chance.percent.total ? player.damage.chance.amount.total : 1;
      returnData.damageAmount = math.multiply(amount || player.damage.value.total, damageAmount);
      returnData.defenseAmount = math.multiply(enemyData.defense.value.total, blockAmount);
      if (math.compare(returnData.defenseAmount, 0).toNumber() <= 0) {
        returnData.defenseAmount = 1;
      }
      returnData.realDamage = math.divide(returnData.damageAmount, returnData.defenseAmount);
      var tempPreviousHp = enemyData.hp.value.toString();
      enemyData.hp.value = math.subtract(enemyData.hp.value, (math.compare(returnData.realDamage, 0).toNumber() <= 0 ? 0 : returnData.realDamage));
      if (math.compare(enemyData.hp.value, 0).toNumber() <= 0) {
        returnData.damageLeft = math.abs(enemyData.hp.value);
        enemyData.kill();
      }
      returnData.target = enemyData;
      return returnData;
    };
    player.update = function() {
      //Damage
      objCurrentCal(player.damage.value, "bignumber");
      objCurrentCal(player.damage.chance.percent, "add");
      objCurrentCal(player.damage.chance.amount, "bignumber");
      objCurrentCal(player.damage.multiple.value, "add");
      objCurrentCal(player.damage.multiple.chance.percent, "add");
      objCurrentCal(player.damage.multiple.chance.amount, "add");
      objCurrentCal(player.damage.value, "cost");
      objCurrentCal(player.damage.chance.percent, "cost");
      objCurrentCal(player.damage.chance.amount, "cost");
      objCurrentCal(player.damage.multiple.value, "cost");
      objCurrentCal(player.damage.multiple.chance.percent, "cost");
      objCurrentCal(player.damage.multiple.chance.amount, "cost");
      //Total
      objTotalCal(player.damage.value, "bignumber", [player.bonus.damage.value.multiply], [player.bonus.damage.value.plus]);
      objTotalCal(player.damage.chance.percent, "add", [player.bonus.damage.chance.percent.multiply], [player.bonus.damage.chance.percent.plus]);
      objTotalCal(player.damage.chance.amount, "bignumber", [player.bonus.damage.chance.amount.multiply], [player.bonus.damage.chance.amount.plus]);
      objTotalCal(player.damage.multiple.value, "add", [player.bonus.damage.multiple.value.multiply], [player.bonus.damage.multiple.value.plus]);
      objTotalCal(player.damage.multiple.chance.percent, "bignumber", [player.bonus.damage.multiple.chance.percent.multiply], [player.bonus.damage.multiple.chance.percent.plus]);
      objTotalCal(player.damage.multiple.chance.amount, "add", [player.bonus.damage.multiple.chance.amount.multiply], [player.bonus.damage.multiple.chance.amount.plus]);
      objTotalCal(player.damage.value, "cost", [player.bonus.damage.value.cost.multiply], [player.bonus.damage.value.cost.plus]);
      objTotalCal(player.damage.chance.percent, "cost", [player.bonus.damage.chance.percent.cost.multiply], [player.bonus.damage.chance.percent.cost.plus]);
      objTotalCal(player.damage.chance.amount, "cost", [player.bonus.damage.chance.amount.cost.multiply], [player.bonus.damage.chance.amount.cost.plus]);
      objTotalCal(player.damage.multiple.value, "cost", [player.bonus.damage.multiple.value.cost.multiply], [player.bonus.damage.multiple.value.cost.plus]);
      objTotalCal(player.damage.multiple.chance.percent, "cost", [player.bonus.damage.multiple.chance.percent.cost.multiply], [player.bonus.damage.multiple.chance.percent.cost.plus]);
      objTotalCal(player.damage.multiple.chance.amount, "cost", [player.bonus.damage.multiple.chance.amount.cost.multiply], [player.bonus.damage.multiple.chance.amount.cost.plus]);
    };
    player.buy = function(stringLocation, amount, isCost) {
      var tempObj = _.get(player, stringLocation), tempBonus = _.get(player, "bonus." + stringLocation), tempCost, returnData = {
        cost: undefined,
        amount: undefined,
        bought: false,
        max: false,
      };
      if (tempObj.count + amount > tempObj.max && tempObj.max !== undefined && !isCost) {
        amount = tempObj.max - tempObj.count;
        if (amount <= 0) {
          returnData.max = true;
        }
      }
      tempCost = totalCalculate("bignumber", costCalculate(tempObj.cost.base, tempObj.cost.increment, tempObj.count, amount), [tempBonus.cost.multiply, _.get(player.bonus, stringLocation + ".cost.multiply")], [tempBonus.cost.plus, _.get(player.bonus, stringLocation + ".cost.plus")]);
      if (math.compare(stats.money.current, tempCost).toNumber() > -1 && amount > 0 && !isCost) {
        stats.money.current = math.subtract(stats.money.current, tempCost);
        tempObj.count += amount;
        returnData.bought = true;
        player.update();
      }
      returnData.cost = tempCost;
      returnData.amount = amount;
      return returnData;
    };
    player.apply(storeData ? storeData.player : undefined);
    player.update();
  })();
  
  function Hero(data) {
  }
  Hero.prototype = {
    apply: function(data) {
      var tempHero = this;
      data = data || {};
      this.hash = data.hash || randomString();
      this.damage = {
        perSecond: undefined,
        value: {
          current: undefined,
          total: undefined,
          base: math.bignumber(data.damage.value.base || 0),
          count: Number(data.damage.value.count || 0),
          increment: math.bignumber(data.damage.value.increment || 0),
          cost: {
            base: math.bignumber(data.damage.value.cost.base || 0),
            increment: math.bignumber(data.damage.value.cost.increment || 0),
            current: undefined,
            total: undefined,
          },
        },
        chance: {
          percent: {
            current: undefined,
            total: undefined,
            base: Number(data.damage.chance.percent.base || 0),
            count: Number(data.damage.chance.percent.count || 0),
            increment: Number(data.damage.chance.percent.increment || 0),
            cost: {
              base: math.bignumber(data.damage.chance.percent.cost.base || 0),
              increment: math.bignumber(data.damage.chance.percent.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
            max: Number(data.damage.chance.percent.max || 0),
          },
          amount: {
            current: undefined,
            total: undefined,
            base: math.bignumber(data.damage.chance.amount.base || 0),
            count: Number(data.damage.chance.amount.count || 0),
            increment: math.bignumber(data.damage.chance.amount.increment || 0),
            cost: {
              base: math.bignumber(data.damage.chance.amount.cost.base || 0),
              increment: math.bignumber(data.damage.chance.amount.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
            max: Number(data.damage.chance.amount.max || 0),
          },
        },
        speed: {
          current: undefined,
          total: undefined,
          base: Number(data.damage.speed.base || 0),
          count: Number(data.damage.speed.count || 0),
          increment: Number(data.damage.speed.increment || 0),
          cost: {
            base: math.bignumber(data.damage.speed.cost.base || 0),
            increment: math.bignumber(data.damage.speed.cost.increment || 0),
            current: undefined,
            total: undefined,
          },
          max: Number(data.damage.speed.max || 0),
        },
        multiple: {
          value: {
            current: undefined,
            total: undefined,
            base: Number(data.damage.multiple.value.base || 0),
            count: Number(data.damage.multiple.value.count || 0),
            increment: Number(data.damage.multiple.value.increment || 0),
            cost: {
              base: math.bignumber(data.damage.multiple.value.cost.base || 0),
              increment: math.bignumber(data.damage.multiple.value.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
            max: Number(data.damage.multiple.value.max || 0),
          },
          chance: {
            percent: {
              current: undefined,
              total: undefined,
              base: Number(data.damage.multiple.chance.percent.base || 0),
              count: Number(data.damage.multiple.chance.percent.count || 0),
              increment: Number(data.damage.multiple.chance.percent.increment || 0),
              cost: {
                base: math.bignumber(data.damage.multiple.chance.percent.cost.base || 0),
                increment: math.bignumber(data.damage.multiple.chance.percent.cost.increment || 0),
                current: undefined,
                total: undefined,
              },
              max: Number(data.damage.multiple.chance.percent.max || 0),
            },
            amount: {
              current: undefined,
              total: undefined,
              base: Number(data.damage.multiple.chance.amount.base || 0),
              count: Number(data.damage.multiple.chance.amount.count || 0),
              increment: Number(data.damage.multiple.chance.amount.increment || 0),
              cost: {
                base: math.bignumber(data.damage.multiple.chance.amount.cost.base || 0),
                increment: math.bignumber(data.damage.multiple.chance.amount.cost.increment || 0),
                current: undefined,
                total: undefined,
              },
              max: Number(data.damage.multiple.chance.amount.max || 0),
            },
          },
        },
      };
      this.defense = {
        perSecond: undefined,
        value: {
          current: undefined,
          total: undefined,
          base: math.bignumber(data.defense.value.base || 0),
          count: Number(data.defense.value.count || 0),
          increment: math.bignumber(data.defense.value.increment || 0),
          cost: {
            base: math.bignumber(data.defense.value.cost.base || 0),
            increment: math.bignumber(data.defense.value.cost.increment || 0),
            current: undefined,
            total: undefined,
          },
        },
        chance: {
          percent: {
            current: undefined,
            total: undefined,
            base: Number(data.defense.chance.percent.base || 0),
            count: Number(data.defense.chance.percent.count || 0),
            increment: Number(data.defense.chance.percent.increment || 0),
            cost: {
              base: math.bignumber(data.defense.chance.percent.cost.base || 0),
              increment: math.bignumber(data.defense.chance.percent.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
            max: Number(data.defense.chance.percent.max || 0),
          },
          amount: {
            current: undefined,
            total: undefined,
            base: math.bignumber(data.defense.chance.amount.base || 0),
            count: Number(data.defense.chance.amount.count || 0),
            increment: math.bignumber(data.defense.chance.amount.increment || 0),
            cost: {
              base: math.bignumber(data.defense.chance.amount.cost.base || 0),
              increment: math.bignumber(data.defense.chance.amount.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
            max: Number(data.defense.chance.amount.max || 0),
          },
        },
      };
      this.xp = {
        value: math.bignumber(data.xp.value || 0),
        max: {
          current: undefined,
          total: undefined,
          base: math.bignumber(data.xp.max.base || 0),
          count: Number(data.xp.max.count || 0),
          increment: math.bignumber(data.xp.max.increment || 0),
        },
      };
      this.hp = {
        value: math.bignumber(data.hp.value || 0),
        max: {
          current: undefined,
          total: undefined,
          base: math.bignumber(data.hp.max.base || 0),
          count: Number(data.hp.max.count || 0),
          increment: math.bignumber(data.hp.max.increment || 0),
          cost: {
            base: math.bignumber(data.hp.max.cost.base || 0),
            increment: math.bignumber(data.hp.max.cost.increment || 0),
            current: undefined,
            total: undefined,
          },
        },
        regen: {
          rate: {
            current: undefined,
            total: undefined,
            base: math.bignumber(data.hp.regen.rate.base || 0),
            count: Number(data.hp.regen.rate.count || 0),
            increment: math.bignumber(data.hp.regen.rate.increment || 0),
            cost: {
              base: math.bignumber(data.hp.regen.rate.cost.base || 0),
              increment: math.bignumber(data.hp.regen.rate.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
          },
          speed: {
            current: undefined,
            total: undefined,
            base: Number(data.hp.regen.speed.base || 0),
            count: Number(data.hp.regen.speed.count || 0),
            increment: Number(data.hp.regen.speed.increment || 0),
            cost: {
              base: math.bignumber(data.hp.regen.speed.cost.base || 0),
              increment: math.bignumber(data.hp.regen.speed.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
            max: Number(data.hp.regen.speed.max || 0),
          },
        },
      };
      this.magic = {
        spell: {
          data: [],
          max: {
            current: undefined,
            total: undefined,
            base: Number(data.magic.spell.max.base || 0),
            count: 0,
            increment: Number(data.magic.spell.max.increment || 0),
            cost: {
              base: math.bignumber(data.magic.spell.max.cost.base || 0),
              increment: math.bignumber(data.magic.spell.max.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
            max: Number(data.magic.spell.max.max || 0),
          },
        },
        mana: {
          value: math.bignumber(data.magic.mana.value || 0),
          max: {
            current: undefined,
            total: undefined,
            base: math.bignumber(data.magic.mana.max.base || 0),
            count: Number(data.magic.mana.max.count || 0),
            increment: math.bignumber(data.magic.mana.max.increment || 0),
            cost: {
              base: math.bignumber(data.magic.mana.max.cost.base || 0),
              increment: math.bignumber(data.magic.mana.max.cost.increment || 0),
              current: undefined,
              total: undefined,
            },
          },
          regen: {
            rate: {
              current: undefined,
              total: undefined,
              base: math.bignumber(data.magic.mana.regen.rate.base || 0),
              count: Number(data.magic.mana.regen.rate.count || 0),
              increment: math.bignumber(data.magic.mana.regen.rate.increment || 0),
              cost: {
                base: math.bignumber(data.magic.mana.regen.rate.cost.base || 0),
                increment: math.bignumber(data.magic.mana.regen.rate.cost.increment || 0),
                current: undefined,
                total: undefined,
              },
            },
            speed: {
              current: undefined,
              total: undefined,
              base: Number(data.magic.mana.regen.speed.base || 0),
              count: Number(data.magic.mana.regen.speed.count || 0),
              increment: Number(data.magic.mana.regen.speed.increment || 0),
              cost: {
                base: math.bignumber(data.magic.mana.regen.speed.cost.base || 0),
                increment: math.bignumber(data.magic.mana.regen.speed.cost.increment || 0),
                current: undefined,
                total: undefined,
              },
              max: Number(data.magic.mana.regen.speed.max || 0),
            },
          },
        },
      };
      this.death = {
        speed: { //Actually this is revive wait time but use "speed" for convenience
          current: undefined,
          total: undefined,
          base: Number(data.death.speed.base || 0),
          count: Number(data.death.speed.count || 0),
          increment: Number(data.death.speed.increment || 0),
          cost: {
            base: math.bignumber(data.death.speed.cost.base || 0),
            increment: math.bignumber(data.death.speed.cost.increment || 0),
            current: undefined,
            total: undefined,
          },
          max: Number(data.death.speed.max || 0),
        },
        max: {
          current: undefined,
          total: undefined,
          base: Number(data.death.max.base || Infinity),
          count: Number(data.death.max.count || 0),
          increment: Number(data.death.max.increment || 0),
          cost: {
            base: math.bignumber(data.death.max.cost.base || 0),
            increment: math.bignumber(data.death.max.cost.increment || 0),
            current: undefined,
            total: undefined,
          },
          max: Number(data.death.max.max || 0),
        },
        total: Number(data.death.total || 0),
        bool: false,
      };
      this.equipment = [];
      data._ = data._ || {};
      this._ = {
        coolDown: {
          damage: 0,
          death: 0,
          hp: 0,
          mana: 0,
        },
        xpBonus: new Bonus({
          object: tempHero,
          type: "heroLevelUp",
          data: undefined,
        }) || undefined,
      };
      if (data._.xpBonus) {
        this._.xpBonus.apply(data._.xpBonus);
      }
      data.bonus = data.bonus || {};
      this.bonus = {
        data: data.bonus.data ? (function() {
          var tempBonusList = [], tempBonus;
          for (var loopCount = 0; loopCount < data.bonus.data.length; loopCount ++) {
            tempBonus = new Bonus({
              object: tempHero,
              type: data.bonus.data[loopCount].type,
              data: undefined,
            });
            tempBonus.apply(data.bonus.data[loopCount].data);
            tempBonusList.push(tempBonus);
          }
          return tempBonusList;
        })() : [],
        damage: {
          value: {
            multiply: math.bignumber(data.bonus.damage.value.multiply || 0),
            plus: math.bignumber(data.bonus.damage.value.plus || 0),
            cost: {
              multiply: math.bignumber(data.bonus.damage.value.cost.multiply || 0),
              plus: math.bignumber(data.bonus.damage.value.cost.plus || 0),
            },
          },
          chance: {
            percent: {
              multiply: Number(data.bonus.damage.chance.percent.multiply || 0),
              plus: Number(data.bonus.damage.chance.percent.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.damage.chance.percent.cost.multiply || 0),
                plus: math.bignumber(data.bonus.damage.chance.percent.cost.plus || 0),
              },
            },
            amount: {
              multiply: math.bignumber(data.bonus.damage.chance.amount.multiply || 0),
              plus: math.bignumber(data.bonus.damage.chance.amount.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.damage.chance.amount.cost.multiply || 0),
                plus: math.bignumber(data.bonus.damage.chance.amount.cost.plus || 0),
              },
            },
          },
          speed: {
            multiply: Number(data.bonus.damage.speed.multiply || 0),
            plus: Number(data.bonus.damage.speed.plus || 0),
            cost: {
              multiply: math.bignumber(data.bonus.damage.speed.cost.multiply || 0),
              plus: math.bignumber(data.bonus.damage.speed.cost.plus || 0),
            },
          },
          multiple: {
            value: {
              multiply: Number(data.bonus.damage.multiple.value.multiply || 0),
              plus: Number(data.bonus.damage.multiple.value.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.damage.multiple.value.cost.multiply || 0),
                plus: math.bignumber(data.bonus.damage.multiple.value.cost.plus || 0),
              },
            },
            chance: {
              percent: {
                multiply: Number(data.bonus.damage.multiple.chance.percent.multiply || 0),
                plus: Number(data.bonus.damage.multiple.chance.percent.plus || 0),
                cost: {
                  multiply: math.bignumber(data.bonus.damage.multiple.chance.percent.cost.multiply || 0),
                  plus: math.bignumber(data.bonus.damage.multiple.chance.percent.cost.plus || 0),
                },
              },
              amount: {
                multiply: Number(data.bonus.damage.multiple.chance.amount.multiply || 0),
                plus: Number(data.bonus.damage.multiple.chance.amount.plus || 0),
                cost: {
                  multiply: math.bignumber(data.bonus.damage.multiple.chance.amount.cost.multiply || 0),
                  plus: math.bignumber(data.bonus.damage.multiple.chance.amount.cost.plus || 0),
                },
              },
            },
          },
        },
        defense: {
          value: {
            multiply: math.bignumber(data.bonus.defense.value.multiply || 0),
            plus: math.bignumber(data.bonus.defense.value.plus || 0),
            cost: {
              multiply: math.bignumber(data.bonus.defense.value.cost.multiply || 0),
              plus: math.bignumber(data.bonus.defense.value.cost.plus || 0),
            },
          },
          chance: {
            percent: {
              multiply: Number(data.bonus.defense.chance.percent.multiply || 0),
              plus: Number(data.bonus.defense.chance.percent.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.defense.chance.percent.cost.multiply || 0),
                plus: math.bignumber(data.bonus.defense.chance.percent.cost.plus || 0),
              },
            },
            amount: {
              multiply: math.bignumber(data.bonus.defense.chance.amount.multiply || 0),
              plus: math.bignumber(data.bonus.defense.chance.amount.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.defense.chance.amount.cost.multiply || 0),
                plus: math.bignumber(data.bonus.defense.chance.amount.cost.plus || 0),
              },
            },
          },
        },
        xp: {
          value: {
            multiply: math.bignumber(data.bonus.xp.value.multiply || 0),
            plus: math.bignumber(data.bonus.xp.value.plus || 0),
          },
          max: {
            multiply: math.bignumber(data.bonus.xp.max.multiply || 0),
            plus: math.bignumber(data.bonus.xp.max.plus || 0),
          },
        },
        hp: {
          max: {
            multiply: math.bignumber(data.bonus.hp.max.multiply || 0),
            plus: math.bignumber(data.bonus.hp.max.plus || 0),
            cost: {
              multiply: math.bignumber(data.bonus.hp.max.cost.multiply || 0),
              plus: math.bignumber(data.bonus.hp.max.cost.plus || 0),
            },
          },
          regen: {
            rate: {
              multiply: math.bignumber(data.bonus.hp.regen.rate.multiply || 0),
              plus: math.bignumber(data.bonus.hp.regen.rate.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.hp.regen.rate.cost.multiply || 0),
                plus: math.bignumber(data.bonus.hp.regen.rate.cost.plus || 0),
              },
            },
            speed: {
              multiply: Number(data.bonus.hp.regen.speed.multiply || 0),
              plus: Number(data.bonus.hp.regen.speed.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.hp.regen.speed.cost.multiply || 0),
                plus: math.bignumber(data.bonus.hp.regen.speed.cost.plus || 0),
              },
            },
          },
        },
        magic: {
          spell: {
            max: {
              multiply: Number(data.bonus.magic.spell.max.multiply || 0),
              plus: Number(data.bonus.magic.spell.max.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.magic.spell.max.cost.multiply || 0),
                plus: math.bignumber(data.bonus.magic.spell.max.cost.plus || 0),
              },
            },
            duration: {
              multiply: Number(data.bonus.magic.spell.duration.multiply || 0),
              plus: Number(data.bonus.magic.spell.duration.plus || 0),
            },
            delay: {
              multiply: Number(data.bonus.magic.spell.delay.multiply || 0),
              plus: Number(data.bonus.magic.spell.delay.plus || 0),
            },
            coolDown: {
              multiply: Number(data.bonus.magic.spell.coolDown.multiply || 0),
              plus: Number(data.bonus.magic.spell.coolDown.plus || 0),
            },
          },
          mana: {
            max: {
              multiply: math.bignumber(data.bonus.magic.mana.max.multiply || 0),
              plus: math.bignumber(data.bonus.magic.mana.max.plus || 0),
              cost: {
                multiply: math.bignumber(data.bonus.magic.mana.max.cost.multiply || 0),
                plus: math.bignumber(data.bonus.magic.mana.max.cost.plus || 0),
              },
            },
            regen: {
              rate: {
                multiply: math.bignumber(data.bonus.magic.mana.regen.rate.multiply || 0),
                plus: math.bignumber(data.bonus.magic.mana.regen.rate.plus || 0),
                cost: {
                  multiply: math.bignumber(data.bonus.magic.mana.regen.rate.cost.multiply || 0),
                  plus: math.bignumber(data.bonus.magic.mana.regen.rate.cost.plus || 0),
                },
              },
              speed: {
                multiply: Number(data.bonus.magic.mana.regen.speed.multiply || 0),
                plus: Number(data.bonus.magic.mana.regen.speed.plus || 0),
                cost: {
                  multiply: math.bignumber(data.bonus.magic.mana.regen.speed.cost.multiply || 0),
                  plus: math.bignumber(data.bonus.magic.mana.regen.speed.cost.plus || 0),
                },
              },
            },
          },
        },
        death: {
          speed: {
            multiply: Number(data.bonus.death.speed.multiply || 0),
            plus: Number(data.bonus.death.speed.plus || 0),
            cost: {
              multiply: math.bignumber(data.bonus.death.speed.cost.multiply || 0),
              plus: math.bignumber(data.bonus.death.speed.cost.plus || 0),
            },
          },
          max: {
            multiply: Number(data.bonus.death.max.multiply || 0),
            plus: Number(data.bonus.death.max.plus || 0),
            cost: {
              multiply: math.bignumber(data.bonus.death.max.cost.multiply || 0),
              plus: math.bignumber(data.bonus.death.max.cost.plus || 0),
            },
          },
        },
      };
      this.bonus.data.push(this._.xpBonus);
      this.update();
    },
    attack: function(enemyData, amount, instant) {
      var returnData = [];
      if (!instant) {
        this._.coolDown.damage --;
        if (this._.coolDown.damage > 0) {
          return;
        } else {
          this._.coolDown.damage = this.damage.speed.total;
        }
      }
      if (!enemyData) {
        var splashAmount = Math.configRandom({
          min: 0,
          max: 99,
        }) < this.damage.multiple.chance.percent.total ? this.damage.multiple.chance.amount.total : this.damage.multiple.value.total;
        for (var attackCount = 0; attackCount < splashAmount; attackCount ++) {
          if (enemy.active.length <= 0) {
            break;
          }
          var tempData = enemy.active[Math.configRandom({
            min: 0,
            max: enemy.active.length - 1,
            round: true,
          })];
          returnData.push(heroAttack(this, tempData, amount));
        }
      } else {
        returnData.push(heroAttack(this, enemyData, amount));
      }
      return returnData;
    },
    regen: function(regenType, amount, instant) {
      var returnData;
      switch (regenType) {
        case "hp": {
          this._.coolDown.hp --;
          if (this._.coolDown.hp <= 0 || instant) {
            this._.coolDown.hp = this.hp.regen.speed.total;
          } else {
            return;
          }
          if (math.compare(this.hp.value, this.hp.max.total) < 0) {
            this.hp.value = math.add(amount || this.hp.value, this.hp.regen.rate.total);
          }
          if (math.compare(this.hp.value, this.hp.max.total) > 0) {
            returnData = math.subtract(this.hp.value, this.hp.max.total);
            this.hp.value = math.bignumber(this.hp.max.total);
            return returnData;
          }
        }
        break;
        case "mana": {
          this._.coolDown.mana --;
          if (this._.coolDown.mana <= 0 || instant) {
            this._.coolDown.mana = this.magic.mana.regen.speed.total;
          } else {
            return;
          }
          if (math.compare(this.magic.mana.value, this.magic.mana.max.total) < 0) {
            this.magic.mana.value = math.add(amount || this.magic.mana.value, this.magic.mana.regen.rate.total);
          }
          if (math.compare(this.magic.mana.value, this.magic.mana.max.total) > 0) {
            returnData = math.subtract(this.magic.mana.value, this.magic.mana.max.total);
            this.magic.mana.value = math.bignumber(this.magic.mana.max.total);
            return returnData;
          }
        }
        break;
        default: {
          return {
            hpLeft: this.regen("hp", undefined, instant) || math.bignumber(0),
            manaLeft: this.regen("mana", undefined, instant) || math.bignumber(0),
          };
        }
      }
    },
    xpGain: function(amount) {
      this.xp.value = math.add(math.multiply(amount, math.add(this.bonus.xp.value.multiply, 1)), this.bonus.xp.value.plus, this.xp.value);
      var levelBonus, returnData = false;
      while (math.compare(this.xp.value, this.xp.max.total).toNumber() >= 0) {
        this.xp.value = math.subtract(this.xp.value, this.xp.max.total);
        this.xp.max.count += 1;
        this.update();
        returnData = true;
      }
      return returnData;
    },
    buy: function(stringLocation, amount, isCost) {
      var tempObj = _.get(this, stringLocation), tempBonus = _.get(this, "bonus." + stringLocation), tempCost, returnData = {
        cost: undefined,
        amount: undefined,
        bought: false,
        max: false,
      };
      if (tempObj.count + amount > tempObj.max && tempObj.max !== undefined && !isCost) {
        amount = tempObj.max - tempObj.count;
        if (amount <= 0) {
          returnData.max = true;
        }
      }
      tempCost = totalCalculate("bignumber", costCalculate(tempObj.cost.base, tempObj.cost.increment, tempObj.count, amount), [tempBonus.cost.multiply, _.get(bonus.hero, stringLocation + ".cost.multiply")], [tempBonus.cost.plus, _.get(bonus.hero, stringLocation + ".cost.plus")]);
      if (math.compare(stats.money.current, tempCost).toNumber() > -1 && amount > 0 && !isCost) {
        stats.money.current = math.subtract(stats.money.current, tempCost);
        tempObj.count += amount;
        returnData.bought = true;
        this.update();
      }
      returnData.cost = tempCost;
      returnData.amount = amount;
      return returnData;
    },
    kill: function() {
      var returnData = math.bignumber(this.hp.value);
      this.hp.value = math.bignumber(0);
      this._.coolDown.death = this.death.speed.total;
      this.death.total ++;
      hero.dead.push(this);
      hero.active.splice(hero.active.indexOf(this), 1);
      render.downHero(this);
      return returnData;
    },
    erase: function() {
      this.death.bool = true;
      hero.inactive.push(this);
      var activeIndexOf = hero.active.indexOf(this), deadIndexOf = hero.dead.indexOf(this);
      if (activeIndexOf > -1) {
        hero.active.splice(activeIndexOf, 1);
      }
      hero.dead.splice(deadIndexOf, 1);
      render.removeHero(this);
      return true;
    },
    revive: function(instant) {
      if (this._.coolDown.death > 0 && !instant) {
        this._.coolDown.death --;
        return false;
      }
      this._.coolDown.death = 0;
      this.regen("hp", this.hp.max.total, true);
      this.regen("mana", this.magic.mana.max.total, true);
      var tempFound = hero.dead.indexOf(this);
      if (tempFound > -1) {
        hero.active.push(this);
        hero.dead.splice(tempFound, 1);
      }
      return true;
    },
    update: function() {
      //Bonus
      updateBonus(this.bonus.data);
      //Damage
      objCurrentCal(this.damage.value, "bignumber");
      objCurrentCal(this.damage.chance.percent, "add");
      objCurrentCal(this.damage.chance.amount, "addBignumber");
      objCurrentCal(this.damage.speed, "subtract");
      objCurrentCal(this.damage.multiple.value, "add");
      objCurrentCal(this.damage.multiple.chance.percent, "add");
      objCurrentCal(this.damage.multiple.chance.amount, "add");
      objCurrentCal(this.damage.value, "cost");
      objCurrentCal(this.damage.chance.percent, "cost");
      objCurrentCal(this.damage.chance.amount, "cost");
      objCurrentCal(this.damage.speed, "cost");
      objCurrentCal(this.damage.multiple.value, "cost");
      objCurrentCal(this.damage.multiple.chance.percent, "cost");
      objCurrentCal(this.damage.multiple.chance.amount, "cost");
      //Total
      objTotalCal(this.damage.value, "bignumber", [
        this.bonus.damage.value.multiply,
        bonus.hero.damage.value.multiply
      ], [
        this.bonus.damage.value.plus,
        bonus.hero.damage.value.plus
      ]);
      objTotalCal(this.damage.chance.percent, "add", [
        this.bonus.damage.chance.percent.multiply,
        bonus.hero.damage.chance.percent.multiply
      ], [
        this.bonus.damage.chance.percent.plus,
        bonus.hero.damage.chance.percent.plus
      ]);
      objTotalCal(this.damage.chance.amount, "bignumber", [
        this.bonus.damage.chance.amount.multiply,
        bonus.hero.damage.chance.amount.multiply
      ], [
        this.bonus.damage.chance.amount.plus,
        bonus.hero.damage.chance.amount.plus
      ]);
      objTotalCal(this.damage.speed, "add", [
        this.bonus.damage.speed.multiply,
        bonus.hero.damage.speed.multiply
      ], [
        this.bonus.damage.speed.plus,
        bonus.hero.damage.speed.plus
      ]);
      objTotalCal(this.damage.multiple.value, "add", [
        this.bonus.damage.multiple.value.multiply,
        bonus.hero.damage.multiple.value.multiply
      ], [
        this.bonus.damage.multiple.value.plus,
        bonus.hero.damage.multiple.value.plus
      ]);
      objTotalCal(this.damage.multiple.chance.percent, "add", [
        this.bonus.damage.multiple.chance.percent.multiply,
        bonus.hero.damage.multiple.chance.percent.multiply
      ], [
        this.bonus.damage.multiple.chance.percent.plus,
        bonus.hero.damage.multiple.chance.percent.plus
      ]);
      objTotalCal(this.damage.multiple.chance.amount, "add", [
        this.bonus.damage.multiple.chance.amount.multiply,
        bonus.hero.damage.multiple.chance.amount.multiply
      ], [
        this.bonus.damage.multiple.chance.amount.plus,
        bonus.hero.damage.multiple.chance.amount.plus
      ]);
      objTotalCal(this.damage.value, "cost", [
        this.bonus.damage.value.cost.multiply,
        bonus.hero.damage.value.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.damage.value.cost.plus,
        bonus.hero.damage.value.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.damage.chance.percent, "cost", [
        this.bonus.damage.chance.percent.cost.multiply,
        bonus.hero.damage.chance.percent.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.damage.chance.percent.cost.plus,
        bonus.hero.damage.chance.percent.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.damage.chance.amount, "cost", [
        this.bonus.damage.chance.amount.cost.multiply,
        bonus.hero.damage.chance.amount.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.damage.chance.amount.cost.plus,
        bonus.hero.damage.chance.amount.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.damage.speed, "cost", [
        this.bonus.damage.speed.cost.multiply,
        bonus.hero.damage.speed.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.damage.speed.cost.plus,
        bonus.hero.damage.speed.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.damage.multiple.value, "cost", [
        this.bonus.damage.multiple.value.cost.multiply,
        bonus.hero.damage.multiple.value.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.damage.multiple.value.cost.plus,
        bonus.hero.damage.multiple.value.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.damage.multiple.chance.percent, "cost", [
        this.bonus.damage.multiple.chance.percent.cost.multiply,
        bonus.hero.damage.multiple.chance.percent.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.damage.multiple.chance.percent.cost.plus,
        bonus.hero.damage.multiple.chance.percent.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.damage.multiple.chance.amount, "cost", [
        this.bonus.damage.multiple.chance.amount.cost.multiply,
        bonus.hero.damage.multiple.chance.amount.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.damage.multiple.chance.amount.cost.plus,
        bonus.hero.damage.multiple.chance.amount.cost.plus,
        bonus.money.cost.plus
      ]);
      //Defense
      objCurrentCal(this.defense.value, "bignumber");
      objCurrentCal(this.defense.chance.percent, "add");
      objCurrentCal(this.defense.chance.amount, "addBignumber");
      objCurrentCal(this.defense.value, "cost");
      objCurrentCal(this.defense.chance.percent, "cost");
      objCurrentCal(this.defense.chance.amount, "cost");
      //Total
      objTotalCal(this.defense.value, "bignumber", [
        this.bonus.defense.value.multiply,
        bonus.hero.defense.value.multiply
      ], [
        this.bonus.defense.value.plus,
        bonus.hero.defense.value.plus
      ]);
      objTotalCal(this.defense.chance.percent, "add", [
        this.bonus.defense.chance.percent.multiply,
        bonus.hero.defense.chance.percent.multiply
      ], [
        this.bonus.defense.chance.percent.plus,
        bonus.hero.defense.chance.percent.plus
      ]);
      objTotalCal(this.defense.chance.amount, "bignumber", [
        this.bonus.defense.chance.amount.multiply,
        bonus.hero.defense.chance.amount.multiply
      ], [
        this.bonus.defense.chance.amount.plus,
        bonus.hero.defense.chance.amount.plus
      ]);
      objTotalCal(this.defense.value, "cost", [
        this.bonus.defense.value.cost.multiply,
        bonus.hero.defense.value.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.defense.value.cost.plus,
        bonus.hero.defense.value.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.defense.chance.percent, "cost", [
        this.bonus.defense.chance.percent.cost.multiply,
        bonus.hero.defense.chance.percent.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.defense.chance.percent.cost.plus,
        bonus.hero.defense.chance.percent.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.defense.chance.amount, "cost", [
        this.bonus.defense.chance.amount.cost.multiply,
        bonus.hero.defense.chance.amount.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.defense.chance.amount.cost.plus,
        bonus.hero.defense.chance.amount.cost.plus,
        bonus.money.cost.plus
      ]);
      //Xp
      objCurrentCal(this.xp.max, "bignumber");
      //Total
      objTotalCal(this.xp.max, "bignumber", [
        this.bonus.xp.max.multiply,
        bonus.xp.max.multiply
      ], [
        this.bonus.xp.max.plus,
        bonus.xp.max.plus
      ]);
      //Hp
      objCurrentCal(this.hp.max, "bignumber");
      objCurrentCal(this.hp.regen.rate, "bignumber");
      objCurrentCal(this.hp.regen.speed, "subtract");
      objCurrentCal(this.hp.max, "cost");
      objCurrentCal(this.hp.regen.rate, "cost");
      objCurrentCal(this.hp.regen.speed, "cost");
      //Total
      objTotalCal(this.hp.max, "bignumber", [
        this.bonus.hp.max.multiply,
        bonus.hero.hp.max.multiply
      ], [
        this.bonus.hp.max.plus,
        bonus.hero.hp.max.plus
      ]);
      objTotalCal(this.hp.regen.rate, "bignumber", [
        this.bonus.hp.regen.rate.multiply,
        bonus.hero.hp.regen.rate.multiply
      ], [
        this.bonus.hp.regen.rate.plus,
        bonus.hero.hp.regen.rate.plus
      ]);
      objTotalCal(this.hp.regen.speed, "add", [
        this.bonus.hp.regen.speed.multiply,
        bonus.hero.hp.regen.speed.multiply
      ], [
        this.bonus.hp.regen.speed.plus,
        bonus.hero.hp.regen.speed.plus
      ]);
      objTotalCal(this.hp.max, "cost", [
        this.bonus.hp.max.cost.multiply,
        bonus.hero.hp.max.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.hp.max.cost.plus,
        bonus.hero.hp.max.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.hp.regen.rate, "cost", [
        this.bonus.hp.regen.rate.cost.multiply,
        bonus.hero.hp.regen.rate.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.hp.regen.rate.cost.plus,
        bonus.hero.hp.regen.rate.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.hp.regen.speed, "cost", [
        this.bonus.hp.regen.speed.cost.multiply,
        bonus.hero.hp.regen.speed.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.hp.regen.speed.cost.plus,
        bonus.hero.hp.regen.speed.cost.plus,
        bonus.money.cost.plus
      ]);
      //Mana
      objCurrentCal(this.magic.mana.max, "bignumber");
      objCurrentCal(this.magic.mana.regen.rate, "bignumber");
      objCurrentCal(this.magic.mana.regen.speed, "subtract");
      objCurrentCal(this.magic.mana.max, "cost");
      objCurrentCal(this.magic.mana.regen.rate, "cost");
      objCurrentCal(this.magic.mana.regen.speed, "cost");
      //Total
      objTotalCal(this.magic.mana.max, "bignumber", [
        this.bonus.magic.mana.max.multiply,
        bonus.hero.magic.mana.max.multiply
      ], [
        this.bonus.magic.mana.max.plus,
        bonus.hero.magic.mana.max.plus
      ]);
      objTotalCal(this.magic.mana.regen.rate, "bignumber", [
        this.bonus.magic.mana.regen.rate.multiply,
        bonus.hero.magic.mana.regen.rate.multiply
      ], [
        this.bonus.magic.mana.regen.rate.plus,
        bonus.hero.magic.mana.regen.rate.plus
      ]);
      objTotalCal(this.magic.mana.regen.speed, "add", [
        this.bonus.magic.mana.regen.speed.multiply,
        bonus.hero.magic.mana.regen.speed.multiply
      ], [
        this.bonus.magic.mana.regen.speed.plus,
        bonus.hero.magic.mana.regen.speed.plus
      ]);
      objTotalCal(this.magic.mana.max, "cost", [
        this.bonus.magic.mana.max.cost.multiply,
        bonus.hero.magic.mana.max.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.magic.mana.max.cost.plus,
        bonus.hero.magic.mana.max.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.magic.mana.regen.rate, "cost", [
        this.bonus.magic.mana.regen.rate.cost.multiply,
        bonus.hero.magic.mana.regen.rate.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.magic.mana.regen.rate.cost.plus,
        bonus.hero.magic.mana.regen.rate.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.magic.mana.regen.speed, "cost", [
        this.bonus.magic.mana.regen.speed.cost.multiply,
        bonus.hero.magic.mana.regen.speed.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.magic.mana.regen.speed.cost.plus,
        bonus.hero.magic.mana.regen.speed.cost.plus,
        bonus.money.cost.plus
      ]);
      //Death
      objCurrentCal(this.death.speed, "subtract");
      objCurrentCal(this.death.max, "add");
      objCurrentCal(this.death.speed, "cost");
      objCurrentCal(this.death.max, "cost");
      //Total
      objTotalCal(this.death.speed, "add", [
        this.bonus.death.speed.multiply,
        bonus.hero.death.speed.multiply
      ], [
        this.bonus.death.speed.plus,
        bonus.hero.death.speed.plus
      ]);
      objTotalCal(this.death.max, "add", [
        this.bonus.death.max.multiply,
        bonus.hero.death.max.multiply
      ], [
        this.bonus.death.max.plus,
        bonus.hero.death.max.plus
      ]);
      objTotalCal(this.death.speed, "cost", [
        this.bonus.death.speed.cost.multiply,
        bonus.hero.death.speed.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.death.speed.cost.plus,
        bonus.hero.death.speed.cost.plus,
        bonus.money.cost.plus
      ]);
      objTotalCal(this.death.max, "cost", [
        this.bonus.death.max.cost.multiply,
        bonus.hero.death.max.cost.multiply,
        bonus.money.cost.multiply
      ], [
        this.bonus.death.max.cost.plus,
        bonus.hero.death.max.cost.plus,
        bonus.money.cost.plus
      ]);
    },
    extract: function() {
      var tempHero = this;
      var returnData = {
        hash: this.hash,
        damage: {
          value: {
            base: this.damage.value.base.toString(),
            count: this.damage.value.count,
            increment: this.damage.value.increment.toString(),
            cost: {
              base: this.damage.value.cost.base.toString(),
              increment: this.damage.value.cost.increment.toString(),
            },
          },
          chance: {
            percent: {
              base: this.damage.chance.percent.base,
              count: this.damage.chance.percent.count,
              increment: this.damage.chance.percent.increment,
              cost: {
                base: this.damage.chance.percent.cost.base.toString(),
                increment: this.damage.chance.percent.cost.increment.toString(),
              },
              max: this.damage.chance.percent.max,
            },
            amount: {
              base: this.damage.chance.amount.base.toString(),
              count: this.damage.chance.amount.count,
              increment: this.damage.chance.amount.increment.toString(),
              cost: {
                base: this.damage.chance.amount.cost.base.toString(),
                increment: this.damage.chance.amount.cost.increment.toString(),
              },
              max: this.damage.chance.amount.max,
            },
          },
          speed: {
            base: this.damage.speed.base,
            count: this.damage.speed.count,
            increment: this.damage.speed.increment,
            cost: {
              base: this.damage.speed.cost.base.toString(),
              increment: this.damage.speed.cost.increment.toString(),
            },
            max: this.damage.speed.max,
          },
          multiple: {
            value: {
              base: this.damage.multiple.value.base,
              count: this.damage.multiple.value.count,
              increment: this.damage.multiple.value.increment,
              cost: {
                base: this.damage.multiple.value.cost.base.toString(),
                increment: this.damage.multiple.value.cost.increment.toString(),
              },
              max: this.damage.multiple.value.max,
            },
            chance: {
              percent: {
                base: this.damage.multiple.chance.percent.base,
                count: this.damage.multiple.chance.percent.count,
                increment: this.damage.multiple.chance.percent.increment,
                cost: {
                  base: this.damage.multiple.chance.percent.cost.base.toString(),
                  increment: this.damage.multiple.chance.percent.cost.increment.toString(),
                },
                max: this.damage.multiple.chance.percent.max,
              },
              amount: {
                base: this.damage.multiple.chance.amount.base,
                count: this.damage.multiple.chance.amount.count,
                increment: this.damage.multiple.chance.amount.increment,
                cost: {
                  base: this.damage.multiple.chance.amount.cost.base.toString(),
                  increment: this.damage.multiple.chance.amount.cost.increment.toString(),
                },
                max: this.damage.multiple.chance.amount.max,
              },
            },
          },
        },
        defense: {
          value: {
            base: this.defense.value.base.toString(),
            count: this.defense.value.count,
            increment: this.defense.value.increment.toString(),
            cost: {
              base: this.defense.value.cost.base.toString(),
              increment: this.defense.value.cost.increment.toString(),
            },
          },
          chance: {
            percent: {
              base: this.defense.chance.percent.base,
              count: this.defense.chance.percent.count,
              increment: this.defense.chance.percent.increment,
              cost: {
                base: this.defense.chance.percent.cost.base.toString(),
                increment: this.defense.chance.percent.cost.increment.toString(),
              },
              max: this.defense.chance.percent.max,
            },
            amount: {
              base: this.defense.chance.amount.base.toString(),
              count: this.defense.chance.amount.count,
              increment: this.defense.chance.amount.increment.toString(),
              cost: {
                base: this.defense.chance.amount.cost.base.toString(),
                increment: this.defense.chance.amount.cost.increment.toString(),
              },
              max: this.defense.chance.amount.max,
            },
          },
        },
        xp: {
          value: this.xp.value.toString(),
          max: {
            base: this.xp.max.base.toString(),
            count: this.xp.max.count,
            increment: this.xp.max.increment.toString(),
          },
        },
        hp: {
          value: this.hp.value.toString(),
          max: {
            base: this.hp.max.base.toString(),
            count: this.hp.max.count,
            increment: this.hp.max.increment.toString(),
            cost: {
              base: this.hp.max.cost.base.toString(),
              increment: this.hp.max.cost.increment.toString(),
            },
          },
          regen: {
            rate: {
              base: this.hp.regen.rate.base.toString(),
              count: this.hp.regen.rate.count,
              increment: this.hp.regen.rate.increment.toString(),
              cost: {
                base: this.hp.regen.rate.cost.base.toString(),
                increment: this.hp.regen.rate.cost.increment.toString(),
              },
            },
            speed: {
              base: this.hp.regen.speed.base,
              count: this.hp.regen.speed.count,
              increment: this.hp.regen.speed.increment,
              cost: {
                base: this.hp.regen.speed.cost.base.toString(),
                increment: this.hp.regen.speed.cost.increment.toString(),
              },
              max: this.hp.regen.speed.max,
            },
          },
        },
        magic: {
          spell: {
            data: [],
            max: {
              base: this.magic.spell.max.base,
              count: this.magic.spell.max.count,
              increment: this.magic.spell.max.increment,
              cost: {
                base: this.magic.spell.max.cost.base.toString(),
                increment: this.magic.spell.max.cost.increment.toString(),
              },
              max: this.magic.spell.max.max,
            },
          },
          mana: {
            value: this.magic.mana.value.toString(),
            max: {
              base: this.magic.mana.max.base.toString(),
              count: this.magic.mana.max.count,
              increment: this.magic.mana.max.increment.toString(),
              cost: {
                base: this.magic.mana.max.cost.base.toString(),
                increment: this.magic.mana.max.cost.increment.toString(),
              },
            },
            regen: {
              rate: {
                base: this.magic.mana.regen.rate.base.toString(),
                count: this.magic.mana.regen.rate.count,
                increment: this.magic.mana.regen.rate.increment.toString(),
                cost: {
                  base: this.magic.mana.regen.rate.cost.base.toString(),
                  increment: this.magic.mana.regen.rate.cost.increment.toString(),
                },
              },
              speed: {
                base: this.magic.mana.regen.speed.base,
                count: this.magic.mana.regen.speed.count,
                increment: this.magic.mana.regen.speed.increment,
                cost: {
                  base: this.magic.mana.regen.speed.cost.base.toString(),
                  increment: this.magic.mana.regen.speed.cost.increment.toString(),
                },
                max: this.magic.mana.regen.speed.max,
              },
            },
          },
        },
        death: {
          speed: {
            base: this.death.speed.base,
            count: this.death.speed.count,
            increment: this.death.speed.increment,
            max: this.death.speed.max,
            cost: {
              base: this.death.speed.cost.base.toString(),
              increment: this.death.speed.cost.increment.toString(),
            },
          },
          max: {
            base: this.death.max.base,
            count: this.death.max.count,
            increment: this.death.max.increment,
            cost: {
              base: this.death.max.cost.base.toString(),
              increment: this.death.max.cost.increment.toString(),
            },
            max: this.death.max.max,
          },
          total: this.death.total,
        },
        bonus: {
          data: (function() {
            var returnData = [];
            for (var loopCount = 0; loopCount < tempHero.bonus.data.length; loopCount ++) {
              if (tempHero.bonus.data[loopCount] === tempHero._.xpBonus) {
                continue;
              }
              returnData.push(tempHero.bonus.data[loopCount].extract());
            }
            return returnData;
          })(),
          damage: {
            value: {
              multiply: this.bonus.damage.value.multiply.toString(),
              plus: this.bonus.damage.value.plus.toString(),
              cost: {
                multiply: this.bonus.damage.value.cost.multiply.toString(),
                plus: this.bonus.damage.value.cost.plus.toString(),
              },
            },
            chance: {
              percent: {
                multiply: this.bonus.damage.chance.percent.multiply,
                plus: this.bonus.damage.chance.percent.plus,
                cost: {
                  multiply: this.bonus.damage.chance.percent.cost.multiply.toString(),
                  plus: this.bonus.damage.chance.percent.cost.plus.toString(),
                },
              },
              amount: {
                multiply: this.bonus.damage.chance.amount.multiply.toString(),
                plus: this.bonus.damage.chance.amount.plus.toString(),
                cost: {
                  multiply: this.bonus.damage.chance.amount.cost.multiply.toString(),
                  plus: this.bonus.damage.chance.amount.cost.plus.toString(),
                },
              },
            },
            speed: {
              multiply: this.bonus.damage.speed.multiply,
              plus: this.bonus.damage.speed.plus,
              cost: {
                multiply: this.bonus.damage.speed.cost.multiply.toString(),
                plus: this.bonus.damage.speed.cost.plus.toString(),
              },
            },
            multiple: {
              value: {
                multiply: this.bonus.damage.multiple.value.multiply,
                plus: this.bonus.damage.multiple.value.plus,
                cost: {
                  multiply: this.bonus.damage.multiple.value.cost.multiply.toString(),
                  plus: this.bonus.damage.multiple.value.cost.plus.toString(),
                },
              },
              chance: {
                percent: {
                  multiply: this.bonus.damage.multiple.chance.percent.multiply,
                  plus: this.bonus.damage.multiple.chance.percent.plus,
                  cost: {
                    multiply: this.bonus.damage.multiple.chance.percent.cost.multiply.toString(),
                    plus: this.bonus.damage.multiple.chance.percent.cost.plus.toString(),
                  },
                },
                amount: {
                  multiply: this.bonus.damage.multiple.chance.amount.multiply,
                  plus: this.bonus.damage.multiple.chance.amount.plus,
                  cost: {
                    multiply: this.bonus.damage.multiple.chance.amount.cost.multiply.toString(),
                    plus: this.bonus.damage.multiple.chance.amount.cost.plus.toString(),
                  },
                },
              },
            },
          },
          defense: {
            value: {
              multiply: this.bonus.defense.value.multiply.toString(),
              plus: this.bonus.defense.value.plus.toString(),
              cost: {
                multiply: this.bonus.defense.value.cost.multiply.toString(),
                plus: this.bonus.defense.value.cost.plus.toString(),
              },
            },
            chance: {
              percent: {
                multiply: this.bonus.defense.chance.percent.multiply,
                plus: this.bonus.defense.chance.percent.plus,
                cost: {
                  multiply: this.bonus.defense.chance.percent.cost.multiply.toString(),
                  plus: this.bonus.defense.chance.percent.cost.plus.toString(),
                },
              },
              amount: {
                multiply: this.bonus.defense.chance.amount.multiply.toString(),
                plus: this.bonus.defense.chance.amount.plus.toString(),
                cost: {
                  multiply: this.bonus.defense.chance.amount.cost.multiply.toString(),
                  plus: this.bonus.defense.chance.amount.cost.plus.toString(),
                },
              },
            },
          },
          xp: {
            value: {
              multiply: this.bonus.xp.value.multiply.toString(),
              plus: this.bonus.xp.value.plus.toString(),
            },
            max: {
              multiply: this.bonus.xp.max.multiply.toString(),
              plus: this.bonus.xp.max.plus.toString(),
            },
          },
          hp: {
            max: {
              multiply: this.bonus.hp.max.multiply.toString(),
              plus: this.bonus.hp.max.plus.toString(),
              cost: {
                multiply: this.bonus.hp.max.cost.multiply.toString(),
                plus: this.bonus.hp.max.cost.plus.toString(),
              },
            },
            regen: {
              rate: {
                multiply: this.bonus.hp.regen.rate.multiply.toString(),
                plus: this.bonus.hp.regen.rate.plus.toString(),
                cost: {
                  multiply: this.bonus.hp.regen.rate.cost.multiply.toString(),
                  plus: this.bonus.hp.regen.rate.cost.plus.toString(),
                },
              },
              speed: {
                multiply: this.bonus.hp.regen.speed.multiply,
                plus: this.bonus.hp.regen.speed.plus,
                cost: {
                  multiply: this.bonus.hp.regen.speed.cost.multiply.toString(),
                  plus: this.bonus.hp.regen.speed.cost.plus.toString(),
                },
              },
            },
          },
          magic: {
            spell: {
              max: {
                multiply: this.bonus.magic.spell.max.multiply,
                plus: this.bonus.magic.spell.max.plus,
                cost: {
                  multiply: this.bonus.magic.spell.max.cost.multiply.toString(),
                  plus: this.bonus.magic.spell.max.cost.plus.toString(),
                },
              },
              duration: {
                multiply: this.bonus.magic.spell.duration.multiply,
                plus: this.bonus.magic.spell.duration.plus,
              },
              delay: {
                multiply: this.bonus.magic.spell.delay.multiply,
                plus: this.bonus.magic.spell.delay.plus,
              },
              coolDown: {
                multiply: this.bonus.magic.spell.coolDown.multiply,
                plus: this.bonus.magic.spell.coolDown.plus,
              },
            },
            mana: {
              max: {
                multiply: this.bonus.magic.mana.max.multiply.toString(),
                plus: this.bonus.magic.mana.max.plus.toString(),
                cost: {
                  multiply: this.bonus.magic.mana.max.cost.multiply.toString(),
                  plus: this.bonus.magic.mana.max.cost.plus.toString(),
                },
              },
              regen: {
                rate: {
                  multiply: this.bonus.magic.mana.regen.rate.multiply.toString(),
                  plus: this.bonus.magic.mana.regen.rate.plus.toString(),
                  cost: {
                    multiply: this.bonus.magic.mana.regen.rate.cost.multiply.toString(),
                    plus: this.bonus.magic.mana.regen.rate.cost.plus.toString(),
                  },
                },
                speed: {
                  multiply: this.bonus.magic.mana.regen.speed.multiply,
                  plus: this.bonus.magic.mana.regen.speed.plus,
                  cost: {
                    multiply: this.bonus.magic.mana.regen.speed.cost.multiply.toString(),
                    plus: this.bonus.magic.mana.regen.speed.cost.plus.toString(),
                  },
                },
              },
            },
          },
          death: {
            speed: {
              multiply: this.bonus.death.speed.multiply,
              plus: this.bonus.death.speed.plus,
              cost: {
                multiply: this.bonus.death.speed.cost.multiply.toString(),
                plus: this.bonus.death.speed.cost.plus.toString(),
              },
            },
            max: {
              multiply: this.bonus.death.max.multiply,
              plus: this.bonus.death.max.plus,
              cost: {
                multiply: this.bonus.death.max.cost.multiply.toString(),
                plus: this.bonus.death.max.cost.plus.toString(),
              },
            },
          },
        },
        _: {
          xpBonus: tempHero._.xpBonus.extract(),
        },
      };
      return returnData;
    },
  };
  
  function Enemy(data) {
  }
  Enemy.prototype = {
    apply: function(data) {
      data = data || {};
      this.boss = data.boss || false;
      this.hash = randomString();
      this.damage = {
        perSecond: undefined,
        value: {
          current: data.damage.value || math.bignumber(0),
          total: undefined,
        },
        chance: {
          percent: {
            current: data.damage.chance.percent || 0,
            total: undefined,
          },
          amount: {
            current: data.damage.chance.amount || math.bignumber(0),
            total: undefined,
          },
        },
        speed: {
          current: data.damage.speed || 0,
          total: undefined,
        },
        multiple: {
          value: {
            current: data.damage.multiple.value || 0,
            total: undefined,
          },
          chance: {
            percent: {
              current: data.damage.multiple.chance.percent || 0,
              total: undefined,
            },
            amount: {
              current: data.damage.multiple.chance.amount || 0,
              total: undefined,
            },
          },
        },
      };
      this.defense = {
        perSecond: undefined,
        value: {
          current: data.defense.value || math.bignumber(0),
          total: undefined,
        },
        chance: {
          percent: {
            current: data.defense.chance.percent || 0,
            total: undefined,
          },
          amount: {
            current: data.defense.chance.amount || math.bignumber(0),
            total: undefined,
          },
        },
      };
      this.hp = {
        value: undefined,
        max: {
          current: data.hp.max || math.bignumber(0),
          total: undefined,
        },
        regen: {
          rate: {
            current: data.hp.regen.rate || math.bignumber(0),
            total: undefined,
          },
          speed: {
            current: data.hp.regen.speed || 0,
            total: undefined,
          },
        },
      };
      this.magic = {
        spell: {
          max: {
            current: 0,
            total: undefined,
          },
        },
        mana: {
          value: undefined,
          max: {
            current: data.magic.mana.max || math.bignumber(0),
            total: undefined,
          },
          regen: {
            rate: {
              current: data.magic.mana.regen.rate || math.bignumber(0),
              total: undefined,
            },
            speed: {
              current: data.magic.mana.regen.speed || 0,
              total: undefined,
            },
          },
        },
      };
      this.loot = {
        money: {
          current: data.loot.money || math.bignumber(0),
          total: undefined,
        },
        xp: {
          current: data.loot.xp || math.bignumber(0),
          total: undefined,
        },
      };
      this.death = {
        speed: {
          current: data.death.speed.current || 0,
          total: undefined,
        },
        max: {
          current: data.death.max || 0,
          total: undefined,
        },
        bool: false,
        total: 0,
      };
      this.equipment = [];
      this.bonus = {
        data: [],
        damage: {
          value: {
            multiply: math.bignumber(0),
            plus: math.bignumber(0),
          },
          chance: {
            percent: {
              multiply: 0,
              plus: 0,
            },
            amount: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
            },
          },
          speed: {
            multiply: 0,
            plus: 0,
          },
          multiple: {
            value: {
              multiply: 0,
              plus: 0,
            },
            chance: {
              percent: {
                multiply: 0,
                plus: 0,
              },
              amount: {
                multiply: 0,
                plus: 0,
              },
            },
          },
        },
        defense: {
          value: {
            multiply: math.bignumber(0),
            plus: math.bignumber(0),
          },
          chance: {
            percent: {
              multiply: 0,
              plus: 0,
            },
            amount: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
            },
          },
        },
        loot: {
          xp: {
            multiply: math.bignumber(0),
            plus: math.bignumber(0),
          },
          money: {
            multiply: math.bignumber(0),
            plus: math.bignumber(0),
          },
        },
        hp: {
          max: {
            multiply: math.bignumber(0),
            plus: math.bignumber(0),
          },
          regen: {
            rate: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
            },
            speed: {
              multiply: 0,
              plus: 0,
            },
          },
        },
        magic: {
          spell: {
            max: {
              multiply: 0,
              plus: 0,
            },
            duration: {
              multiply: 0,
              plus: 0,
            },
            delay: {
              multiply: 0,
              plus: 0,
            },
            coolDown: {
              multiply: 0,
              plus: 0,
            },
          },
          mana: {
            max: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
            },
            regen: {
              rate: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
              },
              speed: {
                multiply: 0,
                plus: 0,
              },
            },
          },
        },
        death: {
          speed: {
            multiply: 0,
            plus: 0,
            cost: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
            },
          },
          max: {
            multiply: 0,
            plus: 0,
            cost: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
            },
          },
        },
      };
      this.level = data.level || 0;
      this._ = {
        coolDown: {
          damage: data.damage.speed,
          death: 0,
          hp: data.hp.regen.speed,
          mana: data.magic.mana.regen.speed,
        },
        dealtBy: {
          
        },
      };
    },
    attack: function(heroData, amount, instant) {
      var returnData = [];
      if (!instant) {
        this._.coolDown.damage --;
        if (this._.coolDown.damage > 0) {
          return;
        } else {
          this._.coolDown.damage = this.damage.speed.total;
        }
      }
      if (!heroData) {
        var splashAmount = Math.configRandom({
          min: 0,
          max: 99,
        }) < this.damage.multiple.chance.percent.total ? this.damage.multiple.chance.amount.total : this.damage.multiple.value.total;
        for (var attackCount = 0; attackCount < splashAmount; attackCount ++) {
          if (hero.active.length <= 0) {
            break;
          }
          var tempData = hero.active[Math.configRandom({
            min: 0,
            max: hero.active.length - 1,
            round: true,
          })];
          returnData.push(enemyAttack(this, tempData, amount));
        }
      } else {
        returnData.push(enemyAttack(this, heroData, amount));
      }
      return returnData;
    },
    regen: function(regenType, amount, instant) {
      var returnData;
      switch (regenType) {
        case "hp": {
          this._.coolDown.hp --;
          if (this._.coolDown.hp <= 0 || instant) {
            this._.coolDown.hp = this.hp.regen.speed.total;
          } else {
            return;
          }
          if (math.compare(this.hp.value, this.hp.max.total) < 0) {
            this.hp.value = math.add(amount || this.hp.value, this.hp.regen.rate.total);
          }
          if (math.compare(this.hp.value, this.hp.max.total) > 0) {
            returnData = math.subtract(this.hp.value, this.hp.max.total);
            this.hp.value = math.bignumber(this.hp.max.total);
            return returnData;
          }
        }
        break;
        case "mana": {
          this._.coolDown.mana --;
          if (this._.coolDown.mana <= 0 || instant) {
            this._.coolDown.mana = this.magic.mana.regen.speed.total;
          } else {
            return;
          }
          if (math.compare(this.magic.mana.value, this.magic.mana.max.total) < 0) {
            this.magic.mana.value = math.add(amount || this.magic.mana.value, this.magic.mana.regen.rate.total);
          }
          if (math.compare(this.magic.mana.value, this.magic.mana.max.total) > 0) {
            returnData = math.subtract(this.magic.mana.value, this.magic.mana.max.total);
            this.magic.mana.value = math.bignumber(this.magic.mana.max.total);
            return returnData;
          }
        }
        break;
        default: {
          return {
            hpLeft: this.regen("hp", undefined, instant) || math.bignumber(0),
            manaLeft: this.regen("mana", undefined, instant) || math.bignumber(0),
          };
        }
      }
    },
    kill: function(noLoot) {
      var returnData = {
        hpLeft: math.bignumber(this.hp.value),
        lootedHero: [],
      }, tempHash, tempData;
      this.hp.value = math.bignumber(0);
      this._.coolDown.death = this.death.speed.total;
      this.death.total ++;
      enemy.dead.push(this);
      enemy.active.splice(enemy.active.indexOf(this), 1);
      if (!noLoot) {
        for (heroHash in this._.dealtBy) {
          tempHash = this._.dealtBy[heroHash];
          tempData = {
            hero: tempHash.hero,
            xpGained: math.multiply(this.loot.xp.total, math.divide(tempHash.damage, this.hp.max.total)),
            damageDealt: tempHash.damage,
          };
          if (math.compare(tempData.xpGained, 0).toNumber() < 0) {
            tempData.xpGained = math.bignumber(0);
          }
          tempHash.hero.xpGain(tempData.xpGained);
          returnData.lootedHero.push(tempData);
        }
        stats.money.current = math.add(stats.money.current, this.loot.money.total);
      }
      this._.dealtBy = {};
      if (stats.zone.main.current > stats.zone.main.beat) {
        stats.zone.main.required.count ++;
      }
      render.downEnemy(this);
      return returnData;
    },
    erase: function() {
      this.death.bool = true;
      enemy.inactive.push(this);
      var activeIndexOf = enemy.active.indexOf(this), deadIndexOf = enemy.dead.indexOf(this);
      if (activeIndexOf > -1) {
        enemy.active.splice(activeIndexOf, 1);
      }
      enemy.dead.splice(deadIndexOf, 1);
      render.removeEnemy(this);
      return true;
    },
    revive: function(instant) {
      if (this._.coolDown.death > 0 && !instant) {
        this._.coolDown.death --;
        return false;
      }
      this._.coolDown.death = 0;
      this.regen("hp", this.hp.max.total, true);
      this.regen("mana", this.magic.mana.max.total, true);
      var tempFound = enemy.dead.indexOf(this);
      if (tempFound > -1) {
        enemy.active.push(this);
        enemy.dead.splice(tempFound, 1);
      }
      return true;
    },
    update: function() {
      //Bonus
      updateBonus(this.bonus.data);
      var tempData, tempData2;
      if (this.boss === true) {
        tempData =  bonus.enemy.boss;
        tempData2 = "boss";
      } else {
        tempData = bonus.enemy.normal;
        tempData2 = "enemy";
      }
      //Damage
      objTotalCal(this.damage.value, "bignumber", [
        this.bonus.damage.value.multiply,
        tempData.damage.value.multiply,
        bonus.enemy.all.damage.value.multiply
      ], [
        this.bonus.damage.value.plus,
        tempData.damage.value.plus,
        bonus.enemy.all.damage.value.plus
      ]);
      objTotalCal(this.damage.chance.percent, "add", [
        this.bonus.damage.chance.percent.multiply,
        tempData.damage.chance.percent.multiply,
        bonus.enemy.all.damage.chance.percent.multiply
      ], [
        this.bonus.damage.chance.percent.plus,
        tempData.damage.chance.percent.plus,
        bonus.enemy.all.damage.chance.percent.plus
      ]);
      objTotalCal(this.damage.chance.amount, "bignumber", [
        this.bonus.damage.chance.amount.multiply,
        tempData.damage.chance.amount.multiply,
        bonus.enemy.all.damage.chance.amount.multiply
      ], [
        this.bonus.damage.chance.amount.plus,
        tempData.damage.chance.amount.plus,
        bonus.enemy.all.damage.chance.amount.plus
      ]);
      objTotalCal(this.damage.speed, "add", [
        this.bonus.damage.speed.multiply,
        tempData.damage.speed.multiply,
        bonus.enemy.all.damage.speed.multiply
      ], [
        this.bonus.damage.speed.plus,
        tempData.damage.speed.plus,
        bonus.enemy.all.damage.speed.plus
      ]);
      objTotalCal(this.damage.multiple.value, "add", [
        this.bonus.damage.multiple.value.multiply,
        tempData.damage.multiple.value.multiply,
        bonus.enemy.all.damage.multiple.value.multiply
      ], [
        this.bonus.damage.multiple.value.plus,
        tempData.damage.multiple.value.plus,
        bonus.enemy.all.damage.multiple.value.plus
      ]);
      objTotalCal(this.damage.multiple.chance.percent, "add", [
        this.bonus.damage.multiple.chance.percent.multiply,
        tempData.damage.multiple.chance.percent.multiply,
        bonus.enemy.all.damage.multiple.chance.percent.multiply
      ], [
        this.bonus.damage.multiple.chance.percent.plus,
        tempData.damage.multiple.chance.percent.plus,
        bonus.enemy.all.damage.multiple.chance.percent.plus
      ]);
      objTotalCal(this.damage.multiple.chance.amount, "add", [
        this.bonus.damage.multiple.chance.amount.multiply,
        tempData.damage.multiple.chance.amount.multiply,
        bonus.enemy.all.damage.multiple.chance.amount.multiply
      ], [
        this.bonus.damage.multiple.chance.amount.plus,
        tempData.damage.multiple.chance.amount.plus,
        bonus.enemy.all.damage.multiple.chance.amount.plus
      ]);
      //Defense
      objTotalCal(this.defense.value, "bignumber", [
        this.bonus.defense.value.multiply,
        tempData.defense.value.multiply,
        bonus.enemy.all.defense.value.multiply
      ], [
        this.bonus.defense.value.plus,
        tempData.defense.value.plus,
        bonus.enemy.all.defense.value.plus
      ]);
      objTotalCal(this.defense.chance.percent, "add", [
        this.bonus.defense.chance.percent.multiply,
        tempData.defense.chance.percent.multiply,
        bonus.enemy.all.defense.chance.percent.multiply
      ], [
        this.bonus.defense.chance.percent.plus,
        tempData.defense.chance.percent.plus,
        bonus.enemy.all.defense.chance.percent.plus
      ]);
      objTotalCal(this.defense.chance.amount, "bignumber", [
        this.bonus.defense.chance.amount.multiply,
        tempData.defense.chance.amount.multiply,
        bonus.enemy.all.defense.chance.amount.multiply
      ], [
        this.bonus.defense.chance.amount.plus,
        tempData.defense.chance.amount.plus,
        bonus.enemy.all.defense.chance.amount.plus
      ]);
      //Hp
      objTotalCal(this.hp.max, "bignumber", [
        this.bonus.hp.max.multiply,
        tempData.hp.max.multiply,
        bonus.enemy.all.hp.max.multiply
      ], [
        this.bonus.hp.max.plus,
        tempData.hp.max.plus,
        bonus.enemy.all.hp.max.plus
      ]);
      objTotalCal(this.hp.regen.rate, "bignumber", [
        this.bonus.hp.regen.rate.multiply,
        tempData.hp.regen.rate.multiply,
        bonus.enemy.all.hp.regen.rate.multiply
      ], [
        this.bonus.hp.regen.rate.plus,
        tempData.hp.regen.rate.plus,
        bonus.enemy.all.hp.regen.rate.plus
      ]);
      objTotalCal(this.hp.regen.speed, "add", [
        this.bonus.hp.regen.speed.multiply,
        tempData.hp.regen.speed.multiply,
        bonus.enemy.all.hp.regen.speed.multiply
      ], [
        this.bonus.hp.regen.speed.plus,
        tempData.hp.regen.speed.plus,
        bonus.enemy.all.hp.regen.speed.plus
      ]);
      //Mana
      objTotalCal(this.magic.mana.max, "bignumber", [
        this.bonus.magic.mana.max.multiply,
        tempData.magic.mana.max.multiply,
        bonus.enemy.all.magic.mana.max.multiply
      ], [
        this.bonus.magic.mana.max.plus,
        tempData.magic.mana.max.plus,
        bonus.enemy.all.magic.mana.max.plus
      ]);
      objTotalCal(this.magic.mana.regen.rate, "bignumber", [
        this.bonus.magic.mana.regen.rate.multiply,
        tempData.magic.mana.regen.rate.multiply,
        bonus.enemy.all.magic.mana.regen.rate.multiply
      ], [
        this.bonus.magic.mana.regen.rate.plus,
        tempData.magic.mana.regen.rate.plus,
        bonus.enemy.all.magic.mana.regen.rate.plus
      ]);
      objTotalCal(this.magic.mana.regen.speed, "add", [
        this.bonus.magic.mana.regen.speed.multiply,
        tempData.magic.mana.regen.speed.multiply,
        bonus.enemy.all.magic.mana.regen.speed.multiply
      ], [
        this.bonus.magic.mana.regen.speed.plus,
        tempData.magic.mana.regen.speed.plus,
        bonus.enemy.all.magic.mana.regen.speed.plus
      ]);
      //Death
      objTotalCal(this.death.speed, "add", [
        this.bonus.death.speed.multiply,
        tempData.death.speed.multiply,
        bonus.enemy.all.death.speed.multiply
      ], [
        this.bonus.death.speed.plus,
        tempData.death.speed.plus,
        bonus.enemy.all.death.speed.plus
      ]);
      objTotalCal(this.death.max, "add", [
        this.bonus.death.max.multiply,
        tempData.death.max.multiply,
        bonus.enemy.all.death.max.multiply
      ], [
        this.bonus.death.max.plus,
        tempData.death.max.plus,
        bonus.enemy.all.death.max.plus
      ]);
      //Loot
      objTotalCal(this.loot.money, "bignumber", [
        this.bonus.loot.money.multiply,
        bonus.money[tempData2].multiply,
        bonus.money.all.multiply
      ], [
        this.bonus.loot.money.plus,
        bonus.money[tempData2].plus,
        bonus.money.all.plus
      ]);
      objTotalCal(this.loot.xp, "bignumber", [
        this.bonus.loot.xp.multiply,
        bonus.xp[tempData2].multiply,
        bonus.xp.all.multiply
      ], [
        this.bonus.loot.xp.plus,
        bonus.xp[tempData2].plus,
        bonus.xp.all.plus
      ]);
    },
  };
  
  //Render
  (function() {
    //Hero and enemy render
    render.updateHero = function(heroData) {
      //Title
      $(`#hero_${heroData.hash} .fightTitle .fightTitleHolder`).html(`${heroData._.coolDown.death > 0 ? "(Dead) - " : ""}Level: ${heroData.xp.max.count} - ${heroData.hash}`);
      //Xp
      $(`#hero_${heroData.hash} .fightMain .fightXpHolder .fightXpData`).css({
        width: math.multiply(math.divide(heroData.xp.value, heroData.xp.max.total), 100).toNumber() + "%",
      });
      //Hp
      var location;// = math.multiply(math.divide(heroData.hp.value, heroData.hp.max.total), 100).toNumber();
      if (heroData._.coolDown.death > 0) {
        location = 100 - (heroData._.coolDown.death / heroData.death.speed.total) * 100;
        $(`#hero_${heroData.hash} .fightMain .fightHpHolder .fightHpData`).css({
          width: location + "%",
        });
      } else {
        location = math.multiply(math.divide(heroData.hp.value, heroData.hp.max.total), 100).toNumber();
        $(`#hero_${heroData.hash} .fightMain .fightHpHolder .fightHpData`).css({
          width: location + "%",
        });
      }
      if (heroData._.coolDown.death > 0) {
        $(`#hero_${heroData.hash} .fightMain .fightHpHolder .fightHpRegenHolder`).css({
          left: location + "%",
          width: "0%",
        });
      } else if (math.compare(math.add(heroData.hp.regen.rate.total, heroData.hp.value), heroData.hp.max.total).toNumber() > 0) {
        $(`#hero_${heroData.hash} .fightMain .fightHpHolder .fightHpRegenHolder`).css({
          left: location + "%",
          right: "0%",
          width: "auto",
        });
      } else {
        $(`#hero_${heroData.hash} .fightMain .fightHpHolder .fightHpRegenHolder`).css({
          left: location + "%",
          width: math.multiply(math.divide(heroData.hp.regen.rate.total, heroData.hp.max.total), 100).toNumber() + "%",
        });
      }
      $(`#hero_${heroData.hash} .fightMain .fightHpHolder .fightHpRegenHolder .fightHpRegenData`).css({
        width: Number(100 - (heroData._.coolDown.hp / heroData.hp.regen.speed.total) * 100) + "%",
      });
      //Mana
      location = math.multiply(math.divide(heroData.magic.mana.value, heroData.magic.mana.max.total), 100).toNumber();
      $(`#hero_${heroData.hash} .fightMain .fightManaHolder .fightManaData`).css({
        width: location + "%",
      });
      if (math.compare(math.add(heroData.magic.mana.regen.rate.total, heroData.magic.mana.value), heroData.magic.mana.max.total).toNumber() > 0) {
        $(`#hero_${heroData.hash} .fightMain .fightManaHolder .fightManaRegenHolder`).css({
          left: location + "%",
          right: "0%",
          width: "auto",
        });
      } else {
        $(`#hero_${heroData.hash} .fightMain .fightManaHolder .fightManaRegenHolder`).css({
          left: location + "%",
          width: math.multiply(math.divide(heroData.magic.mana.regen.rate.total, heroData.magic.mana.max.total), 100).toNumber() + "%",
        });
      }
      $(`#hero_${heroData.hash} .fightMain .fightManaHolder .fightManaRegenHolder .fightManaRegenData`).css({
        width: Number(100 - (heroData._.coolDown.mana / heroData.magic.mana.regen.speed.total) * 100) + "%",
      });
      //Atks
      $(`#hero_${heroData.hash} .fightMain .fightAttackHolder .fightAttackData`).css({
        height: Number(100 - (heroData._.coolDown.damage / heroData.damage.speed.total) * 100) + "%",
      });
    };
    render.downHero = function(heroData) {
      $("div#heroData").append($(`#hero_${heroData.hash}`).detach());
    };
    render.addHero = function(heroData) {
      var tempRender = $(`
        <div class="fightHolder" id="hero_${heroData.hash}">
          <div class="fightTitle">
            <div class="fightTitleHolder">
              Level: ${heroData.xp.max.count} - ${heroData.hash}
            </div>
          </div>
          <div class="fightExpand">
            +
          </div>
          <div class="fightMain">
            <div class="fightXpHolder">
              <span class="fightXpShow"></span>
              <div class="fightXpData"></div>
            </div>
            <div class="fightHpHolder">
              <span class="fightHpShow"></span>
              <div class="fightHpData"></div>
              <div class="fightHpRegenHolder">
                <div class="fightHpRegenData"></div>
              </div>
            </div>
            <div class="fightManaHolder">
              <span class="fightManaShow"></span>
              <div class="fightManaData"></div>
              <div class="fightManaRegenHolder">
                <div class="fightManaRegenData"></div>
              </div>
            </div>
            <div class="fightAttackHolder">
              <div class="fightAttackData"></div>
            </div>
          </div>
        </div>
      `);
      tempRender.children(".fightExpand").click(function() {
        render.chooseShow("fightUpgradeHolder", heroData);
      });
      $("div#heroData").append(tempRender);
      render.updateHero(heroData);
    };
    render.removeHero = function(heroData) {
      $(`#hero_${heroData.hash}`).remove();
    };
    
    render.updateEnemy = function(enemyData) {
      //Title
      $(`#enemy_${enemyData.hash} .fightTitle .fightTitleHolder`).html(`${enemyData._.coolDown.death > 0 ? "(Dead) - " : ""}Level: ${enemyData.level} - ${enemyData.hash}`);
      //Hp
      var location;
      if (enemyData._.coolDown.death > 0) {
        location = 100 - (enemyData._.coolDown.death / enemyData.death.speed.total) * 100;
        $(`#enemy_${enemyData.hash} .fightMain .fightHpHolder .fightHpData`).css({
          width: location + "%",
        });
      } else {
        location = math.multiply(math.divide(enemyData.hp.value, enemyData.hp.max.total), 100).toNumber();
        $(`#enemy_${enemyData.hash} .fightMain .fightHpHolder .fightHpData`).css({
          width: location + "%",
        });
      }
      if (enemyData._.coolDown.death > 0) {
        $(`#enemy_${enemyData.hash} .fightMain .fightHpHolder .fightHpRegenHolder`).css({
          left: location + "%",
          width: "0%",
        });
      } else if (math.compare(math.add(enemyData.hp.regen.rate.total, enemyData.hp.value), enemyData.hp.max.total).toNumber() > 0) {
        $(`#enemy_${enemyData.hash} .fightMain .fightHpHolder .fightHpRegenHolder`).css({
          left: location + "%",
          right: "0%",
          width: "auto",
        });
      } else {
        $(`#enemy_${enemyData.hash} .fightMain .fightHpHolder .fightHpRegenHolder`).css({
          left: location + "%",
          width: math.multiply(math.divide(enemyData.hp.regen.rate.total, enemyData.hp.max.total), 100).toNumber() + "%",
        });
      }
      $(`#enemy_${enemyData.hash} .fightMain .fightHpHolder .fightHpRegenHolder .fightHpRegenData`).css({
        width: Number(100 - (enemyData._.coolDown.hp / enemyData.hp.regen.speed.total) * 100) + "%",
      });
      //Mana
      location = math.multiply(math.divide(enemyData.magic.mana.value, enemyData.magic.mana.max.total), 100).toNumber();
      $(`#enemy_${enemyData.hash} .fightMain .fightManaHolder .fightManaData`).css({
        width: location + "%",
      });
      if (math.compare(math.add(enemyData.magic.mana.regen.rate.total, enemyData.magic.mana.value), enemyData.magic.mana.max.total).toNumber() > 0) {
        $(`#enemy_${enemyData.hash} .fightMain .fightManaHolder .fightManaRegenHolder`).css({
          left: location + "%",
          right: "0%",
          width: "auto",
        });
      } else {
        $(`#enemy_${enemyData.hash} .fightMain .fightManaHolder .fightManaRegenHolder`).css({
          left: location + "%",
          width: math.multiply(math.divide(enemyData.magic.mana.regen.rate.total, enemyData.magic.mana.max.total), 100).toNumber() + "%",
        });
      }
      $(`#enemy_${enemyData.hash} .fightMain .fightManaHolder .fightManaRegenHolder .fightManaRegenData`).css({
        width: Number(100 - (enemyData._.coolDown.mana / enemyData.magic.mana.regen.speed.total) * 100) + "%",
      });
      //Atks
      $(`#enemy_${enemyData.hash} .fightMain .fightAttackHolder .fightAttackData`).css({
        height: Number(100 - (enemyData._.coolDown.damage / enemyData.damage.speed.total) * 100) + "%",
      });
    };
    render.downEnemy = function(enemyData) {
      $("div#enemyData").append($(`#enemy_${enemyData.hash}`).detach());
    };
    render.addEnemy = function(enemyData) {
      var tempRender = $(`
        <div class="fightHolder" id="enemy_${enemyData.hash}">
          <div class="fightTitle">
            <div class="fightTitleHolder">
              Level: ${enemyData.level} - ${enemyData.hash}
            </div>
          </div>
          <div class="fightExpand">
            +
          </div>
          <div class="fightMain">
            <div class="fightXpHolder">
              <span class="fightXpShow"></span>
              <div class="fightXpData"></div>
            </div>
            <div class="fightHpHolder">
              <span class="fightHpShow"></span>
              <div class="fightHpData"></div>
              <div class="fightHpRegenHolder">
                <div class="fightHpRegenData"></div>
              </div>
            </div>
            <div class="fightManaHolder">
              <span class="fightManaShow"></span>
              <div class="fightManaData"></div>
              <div class="fightManaRegenHolder">
                <div class="fightManaRegenData"></div>
              </div>
            </div>
            <div class="fightAttackHolder">
              <div class="fightAttackData"></div>
            </div>
          </div>
        </div>
      `);
      tempRender.click(function() {
        if (math.compare(enemyData.hp.value, 0).toNumber() < 1) {
          return;
        }
        player.attack(enemyData);
      });
      tempRender.children(".fightExpand").click(function(event) {
        event.stopPropagation();
        render.chooseShow("fightShowHolder", enemyData);
      });
      $("div#enemyData").append(tempRender);
      render.updateEnemy(enemyData);
    };
    render.removeEnemy = function(enemyData) {
      $(`#enemy_${enemyData.hash}`).remove();
    };
    
    (function() {
      $(`#clickUpgradeData #clickDamageValueUpgrade`).click(function() {
        render.detailShow("damage.value");
      });
      $(`#clickUpgradeData #clickDamageChancePercentUpgrade`).click(function() {
        render.detailShow("damage.chance.percent");
      });
      $(`#clickUpgradeData #clickDamageChanceAmountUpgrade`).click(function() {
        render.detailShow("damage.chance.amount");
      });
      $(`#clickUpgradeData #clickDamageMultipleValueUpgrade`).click(function() {
        render.detailShow("damage.multiple.value");
      });
      $(`#clickUpgradeData #clickDamageMultipleChancePercentUpgrade`).click(function() {
        render.detailShow("damage.multiple.chance.percent");
      });
      $(`#clickUpgradeData #clickDamageMultipleChanceAmountUpgrade`).click(function() {
        render.detailShow("damage.multiple.chance.amount");
      });
      $(`.fightUpgradeHolder .hpMaxUpgrade`).click(function() {
        render.detailShow("hp.max");
      });
      $(`.fightUpgradeHolder .hpRegenRateUpgrade`).click(function() {
        render.detailShow("hp.regen.rate");
      });
      $(`.fightUpgradeHolder .hpRegenSpeedUpgrade`).click(function() {
        render.detailShow("hp.regen.speed");
      });
      $(`.fightUpgradeHolder .manaMaxUpgrade`).click(function() {
        render.detailShow("magic.mana.max");
      });
      $(`.fightUpgradeHolder .manaRegenRateUpgrade`).click(function() {
        render.detailShow("magic.mana.regen.rate");
      });
      $(`.fightUpgradeHolder .manaRegenSpeedUpgrade`).click(function() {
        render.detailShow("magic.mana.regen.speed");
      });
      $(`.fightUpgradeHolder .damageValueUpgrade`).click(function() {
        render.detailShow("damage.value");
      });
      $(`.fightUpgradeHolder .damageSpeedUpgrade`).click(function() {
        render.detailShow("damage.speed");
      });
      $(`.fightUpgradeHolder .damageChancePercentUpgrade`).click(function() {
        render.detailShow("damage.chance.percent");
      });
      $(`.fightUpgradeHolder .damageChanceAmountUpgrade`).click(function() {
        render.detailShow("damage.chance.amount");
      });
      $(`.fightUpgradeHolder .defenseValueUpgrade`).click(function() {
        render.detailShow("defense.value");
      });
      $(`.fightUpgradeHolder .defenseChancePercentUpgrade`).click(function() {
        render.detailShow("defense.chance.percent");
      });
      $(`.fightUpgradeHolder .defenseChanceAmountUpgrade`).click(function() {
        render.detailShow("defense.chance.amount");
      });
      $(`.fightUpgradeHolder .damageMultipleValueUpgrade`).click(function() {
        render.detailShow("damage.multiple.value");
      });
      $(`.fightUpgradeHolder .damageMultipleChancePercentUpgrade`).click(function() {
        render.detailShow("damage.multiple.chance.percent");
      });
      $(`.fightUpgradeHolder .damageMultipleChanceAmountUpgrade`).click(function() {
        render.detailShow("damage.multiple.chance.amount");
      });
      $(`.fightUpgradeHolder .deathSpeedUpgrade`).click(function() {
        render.detailShow("death.speed");
      });
      $(`.fightUpgradeHolder .deathMaxUpgrade`).click(function() {
        render.detailShow("death.max");
      });
    })();
    
    var tempString, isDetail;
    
    //Money render
    render.ui = function() {
      var tempRenderString = "", loopCount;
      tempRenderString = `Money: ${math.bignumber.format(stats.money.current)}`;
      $("div#statsData").html(tempRenderString);
    };
    
    //Show render
    render.chooseShow = function(type, obj) {
      closeDetail();
      $(`.showShow`).css({
        display: "none",
      });
      stats.showType = type;
      switch (type) {
        case "optionAdventure": {
          stats.showObj = undefined;
          $(`#adventureShow`).css({
            display: "inline",
          });
        }
        break;
        case "optionOption": {
          stats.showObj = undefined;
          $(`#optionShow`).css({
            display: "inline",
          });
        }
        break;
        case "upgradeShow": {
          stats.showObj = undefined;
          $(`#upgradeShow`).css({
            display: "inline",
          });
        }
        break;
        case "clickUpgradeData": {
          stats.showObj = player;
          $(`#clickUpgradeData`).css({
            display: "inline",
          });
        }
        break;
        case "fightUpgradeHolder": {
          stats.showObj = obj;
          $(`.fightUpgradeHolder`).css({
            display: "inline",
          });
        }
        break;
        case "fightShowHolder": {
          stats.showObj = obj;
          $(`.fightShowHolder`).css({
            display: "inline",
          });
        }
        break;
      }
    };
    render.show = function() {
      var loopCount;
      switch(stats.showType) {
        case "optionAdventure": {
          $(`#mainWorld .requiredKillCurrent`).html(stats.zone.main.required.count);
          $(`#mainWorld .requiredKillRequired`).html(stats.zone.main.required.max);
          $(`#mainWorld .beatedZone`).html(stats.zone.main.beat);
          $(`#mainWorld input.zoneInput`).val(stats.zone.main.current);
        }
        break;
        case "upgradeShow": {
          
        }
        break;
        case "clickUpgradeData": {
          $(`#clickDamageValueShow`).html(math.bignumber.format(player.damage.value.total));
          $(`#clickDamageChancePercentShow`).html(Number(player.damage.chance.percent.total.toFixed(5)));
          $(`#clickDamageChanceAmountShow`).html(Number(player.damage.chance.amount.total.toFixed(5)));
          $(`#clickDamageMultipleValueShow`).html(player.damage.multiple.value.total);
          $(`#clickDamageMultipleChancePercentShow`).html(Number(player.damage.multiple.chance.percent.total.toFixed(5)));
          $(`#clickDamageMultipleChanceAmountShow`).html(player.damage.multiple.chance.amount.total);
        }
        break;
        case "fightUpgradeHolder": {
          $(`.fightUpgradeHolder .hashShow`).html(stats.showObj.hash);
          $(`.fightUpgradeHolder .hpValueShow`).html(math.bignumber.format(stats.showObj.hp.value));
          $(`.fightUpgradeHolder .hpMaxShow`).html(math.bignumber.format(stats.showObj.hp.max.total));
          $(`.fightUpgradeHolder .hpRegenRateShow`).html(math.bignumber.format(stats.showObj.hp.regen.rate.total));
          $(`.fightUpgradeHolder .hpRegenSpeedShow`).html(stats.showObj.hp.regen.speed.total);
          $(`.fightUpgradeHolder .manaValueShow`).html(math.bignumber.format(stats.showObj.magic.mana.value));
          $(`.fightUpgradeHolder .manaMaxShow`).html(math.bignumber.format(stats.showObj.magic.mana.max.total));
          $(`.fightUpgradeHolder .manaRegenRateShow`).html(math.bignumber.format(stats.showObj.magic.mana.regen.rate.total));
          $(`.fightUpgradeHolder .manaRegenSpeedShow`).html(stats.showObj.magic.mana.regen.speed.total);
          $(`.fightUpgradeHolder .levelShow`).html(stats.showObj.xp.max.count);
          $(`.fightUpgradeHolder .xpValueShow`).html(math.bignumber.format(stats.showObj.xp.value));
          $(`.fightUpgradeHolder .xpMaxShow`).html(math.bignumber.format(stats.showObj.xp.max.total));
          $(`.fightUpgradeHolder .damageValueShow`).html(math.bignumber.format(stats.showObj.damage.value.total));
          $(`.fightUpgradeHolder .damageSpeedShow`).html(stats.showObj.damage.speed.total);
          $(`.fightUpgradeHolder .damageChancePercentShow`).html(Number(stats.showObj.damage.chance.percent.total.toFixed(5)));
          $(`.fightUpgradeHolder .damageChanceAmountShow`).html(Number(stats.showObj.damage.chance.amount.total.toFixed(5)));
          $(`.fightUpgradeHolder .defenseValueShow`).html(math.bignumber.format(stats.showObj.defense.value.total));
          $(`.fightUpgradeHolder .defenseChancePercentShow`).html(Number(stats.showObj.defense.chance.percent.total.toFixed(5)));
          $(`.fightUpgradeHolder .defenseChanceAmountShow`).html(Number(stats.showObj.defense.chance.amount.total.toFixed(5)));
          $(`.fightUpgradeHolder .damageMultipleValueShow`).html(stats.showObj.damage.multiple.value.total);
          $(`.fightUpgradeHolder .damageMultipleChancePercentShow`).html(Number(stats.showObj.damage.multiple.chance.percent.total.toFixed(5)));
          $(`.fightUpgradeHolder .damageMultipleChanceAmountShow`).html(stats.showObj.damage.multiple.chance.amount.total);
          $(`.fightUpgradeHolder .deathSpeedShow`).html(stats.showObj.death.speed.total);
          $(`.fightUpgradeHolder .deathTotalShow`).html(stats.showObj.death.total);
          $(`.fightUpgradeHolder .deathMaxShow`).html(stats.showObj.death.max.total);
        }
        break;
        case "fightShowHolder": {
          $(`.fightShowHolder .hashShow`).html(stats.showObj.hash);
          $(`.fightShowHolder .hpValueShow`).html(math.bignumber.format(stats.showObj.hp.value));
          $(`.fightShowHolder .hpMaxShow`).html(math.bignumber.format(stats.showObj.hp.max.total));
          $(`.fightShowHolder .hpRegenRateShow`).html(math.bignumber.format(stats.showObj.hp.regen.rate.total));
          $(`.fightShowHolder .hpRegenSpeedShow`).html(stats.showObj.hp.regen.speed.total);
          $(`.fightShowHolder .manaValueShow`).html(math.bignumber.format(stats.showObj.magic.mana.value));
          $(`.fightShowHolder .manaMaxShow`).html(math.bignumber.format(stats.showObj.magic.mana.max.total));
          $(`.fightShowHolder .manaRegenRateShow`).html(math.bignumber.format(stats.showObj.magic.mana.regen.rate.total));
          $(`.fightShowHolder .manaRegenSpeedShow`).html(stats.showObj.magic.mana.regen.speed.total);
          $(`.fightShowHolder .levelShow`).html(stats.showObj.level);
          $(`.fightShowHolder .moneyDropShow`).html(math.bignumber.format(stats.showObj.loot.money.total));
          $(`.fightShowHolder .xpDropShow`).html(math.bignumber.format(stats.showObj.loot.xp.total));
          $(`.fightShowHolder .damageValueShow`).html(math.bignumber.format(stats.showObj.damage.value.total));
          $(`.fightShowHolder .damageSpeedShow`).html(stats.showObj.damage.speed.total);
          $(`.fightShowHolder .damageChancePercentShow`).html(Number(stats.showObj.damage.chance.percent.total.toFixed(5)));
          $(`.fightShowHolder .damageChanceAmountShow`).html(Number(stats.showObj.damage.chance.amount.total.toFixed(5)));
          $(`.fightShowHolder .defenseValueShow`).html(math.bignumber.format(stats.showObj.defense.value.total));
          $(`.fightShowHolder .defenseChancePercentShow`).html(Number(stats.showObj.defense.chance.percent.total.toFixed(5)));
          $(`.fightShowHolder .defenseChanceAmountShow`).html(Number(stats.showObj.defense.chance.amount.total.toFixed(5)));
          $(`.fightShowHolder .damageMultipleValueShow`).html(stats.showObj.damage.multiple.value.total);
          $(`.fightShowHolder .damageMultipleChancePercentShow`).html(Number(stats.showObj.damage.multiple.chance.percent.total.toFixed(5)));
          $(`.fightShowHolder .damageMultipleChanceAmountShow`).html(stats.showObj.damage.multiple.chance.amount.total);
          $(`.fightShowHolder .deathSpeedShow`).html(stats.showObj.death.speed.total);
          $(`.fightShowHolder .deathTotalShow`).html(stats.showObj.death.total);
          $(`.fightShowHolder .deathMaxShow`).html(stats.showObj.death.max.total);
        }
        break;
      }
    };
    
    //Detail
    render.detailShow = function(stringLocation) {
      tempString = stringLocation;
      $(`#detailShow`).css({
        display: "inline",
      });
      isDetail = true;
    };
    render.detail = function() {
      $(`#detailUpgradeCount`).html(_.get(stats.showObj, tempString + ".count"));
      $(`#detailUpgradeIncrement`).html(Number(_.get(stats.showObj, tempString + ".increment").toFixed(5)));
      $(`#detailUpgradeCost`).html(math.bignumber.format(stats.showObj.buy(tempString, stats.other.buyAmount, true).cost));
      $(`#buyAmount`).html(stats.other.buyAmount);
    };
    
    $(`#detailClose`).click(closeDetail);
    $(`#buyUpgradeButton`).click(function() {
      stats.showObj.buy(tempString, stats.other.buyAmount);
    });
    
    //Adventure
    $(`#mainWorld input.zoneInput`).change(function() {
      killAllEnemy(true);
      var currentZone = Number($(`#mainWorld input.zoneInput`).val());
      if (currentZone > stats.zone.main.beat + 1) {
        $(`#mainWorld input.zoneInput`).val(stats.zone.main.beat + 1);
        currentZone = stats.zone.main.beat + 1;
      }
      $(`#mainWorld input.zoneInput`).attr({
        max: stats.zone.main.beat + 1,
      });
      stats.zone.main.current = currentZone;
      stats.zone.main.required.count = 0;
    });
    
    //Options button
    $(`#optionOption`).click(function() {
      render.chooseShow("optionOption");
    });
    $(`#optionClick`).click(function() {
      render.chooseShow("clickUpgradeData");
    });
    $(`#optionAdventure`).click(function() {
      render.chooseShow("optionAdventure");
    });
    
    //Options
    $(`#optionSaveButton`).click(function() {
      save();
      alert("Saved !!");
    });
    $(`#buyAmountInput`).change(function() {
      stats.other.buyAmount = Number($(`#buyAmountInput`).val());
    });
    
    //Other
    window.onbeforeunload = function() {
      if (!noSave) {
        save();
      }
    };
    
    render.render = function() {
      render.ui();
      render.show();
      if (isDetail) {
        render.detail();
      }
    };
    
    function closeDetail() {
      $(`#detailShow`).css({
        display: "none",
      });
      isDetail = false;
    }
  
  })();
  
  //Helper
  function randomString() {
    return (Math.random() * 1e20).toString(36); //36
  }
  function getObjData(obj, stringArray) {
    var tempObj;
    for (var stringCount = 0; stringCount < stringArray.length; stringCount ++) {
      if (stringCount === 0) {
        tempObj = obj[stringArray[0]];
      } else {
        tempObj = tempObj[stringArray[stringCount]];
      }
    }
    return tempObj;
  }
  function isRandom(limit, returnData, notReturn) {
    if (limit >= stats.zone.main.current) {
      return returnData;
    } else {
      return notReturn;
    }
  }
  
  function mainCalculate(base, ratio, number) {
    return math.eval("base * (ratio ^ number)", {
      base: base,
      ratio: ratio,
      number: number,
    });
  }
  function costCalculate(base, ratio, number, amount) {
    return math.eval("base * (ratio ^ number) * (1 - (ratio ^ amount)) / (1 - ratio)", {
      base: base,
      ratio: ratio,
      number: number,
      amount: amount,
    });
  }
  function amountCalculate(cost, base, ratio) {
    return math.eval("floor(log(money / cost / base + 1) / log(ratio))", {
      money: stats.money.current,
      cost: cost,
      base: base,
      ratio: ratio,
    });
  }
  function lostCalculate(multiply, base, lost) {
    return math.eval("(x ^ y) ^ (1 / z)", {
      x: math.bignumber(multiply),
      y: math.bignumber(lost),
      z: math.bignumber(base),
    });
    //"(x ^ (y + z)) ^ (1 / y)"
  }
  function currentCalculate(type, base, increment, count) {
    switch (type) {
      case "bignumber": {
        return math.multiply(base, math.pow(increment, count));
      }
      break;
      case "addBignumber": {
        return math.add(base, math.multiply(increment, count));
      }
      break;
      case "add": {
        return base + count * increment;
      }
      break;
      case "subtract": {
        return base - count * increment;
      }
      break;
    }
  }
  function totalCalculate(type, current, bonusMultiply, bonusAdd) {
    var loopCount, multiplyData, divisionData, addData, resultData;
    switch (type) {
      case "bignumber": {
        multiplyData = math.bignumber(0);
        for (loopCount = 0; loopCount < bonusMultiply.length; loopCount ++) {
          multiplyData = math.add(bonusMultiply[loopCount], multiplyData);
        }
        addData = math.bignumber(0);
        for (loopCount = 0; loopCount < bonusAdd.length; loopCount ++) {
          addData = math.add(bonusAdd[loopCount], addData);
        }
        if (multiplyData < 0) {
          return math.add(math.abs(math.divide(current, math.subtract(multiplyData, 1))), addData);
        } else if (multiplyData === 0) {
          return math.add(current, addData);
        } else {
          return math.add(math.multiply(current, math.add(multiplyData, 1)), addData);
        }
      }
      break;
      case "add": {
        multiplyData = 0;
        for (loopCount = 0; loopCount < bonusMultiply.length; loopCount ++) {
          multiplyData += bonusMultiply[loopCount];
        }
        addData = 0;
        for (loopCount = 0; loopCount < bonusAdd.length; loopCount ++) {
          addData += bonusAdd[loopCount];
        }
        if (multiplyData < 0) {
          return Math.abs(current / (multiplyData - 1)) + addData;
        } else if (multiplyData === 0) {
          return current + addData;
        } else {
          return current * (multiplyData + 1) + addData;
        }
      }
      break;
      case "subtract": {
        multiplyData = 1;
        for (loopCount = 0; loopCount < bonusMultiply.length; loopCount ++) {
          multiplyData += bonusMultiply[loopCount];
        }
        addData = 0;
        for (loopCount = 0; loopCount < bonusAdd.length; loopCount ++) {
          addData += bonusAdd[loopCount];
        }
        return current / multiplyData - addData;
      }
      break;
    }
  }
  function objCurrentCal(obj, type, isCost) {
    if (type === "cost") {
      obj.cost.current = currentCalculate("bignumber", obj.cost.base, obj.cost.increment, obj.count);
    } else {
      obj.current = currentCalculate(type, obj.base, obj.increment, obj.count);
    }
  }
  function objTotalCal(obj, type, bonusMultiply, bonusAdd) {
    if (type === "cost") {
      obj.cost.total = totalCalculate("bignumber", obj.cost.current, bonusMultiply, bonusAdd);
    } else {
      obj.total = totalCalculate(type, obj.current, bonusMultiply, bonusAdd);
    }
  }
  
  function createHero(data) {
    var tempData = mainCalculate(math.bignumber(1), math.bignumber(stats.multiply.base), math.bignumber(stats.zone.main.beat)),
        tempData2 = mainCalculate(math.bignumber(1), math.bignumber(stats.multiply.lost), math.bignumber(stats.zone.main.beat)),
        multiplyData = math.pow(math.bignumber(stats.multiply.lost), 2),
        tempData3 = mainCalculate(math.bignumber(1), multiplyData, math.bignumber(stats.zone.main.beat));
    if (!data) {
      var tempDamageSpeed = Math.configRandom({
        min: 5 * 60, // Must x60, both
        max: 10 * 60,
        round: true,
      });
      var tempHpRegenSpeed = Math.configRandom({
        min: 5 * 60, // Must x60, both
        max: 10 * 60,
        round: true,
      });
      var tempManaRegenSpeed = Math.configRandom({
        min: 5 * 60, // Must x60, both
        max: 10 * 60,
        round: true,
      });
      var tempDeathSpeed = Math.configRandom({
        min: 30 * 60, // Must x60, both
        max: 60 * 60, //TODO: reduce space between these
        round: true,
      });
      data = {
        damage: {
          value: {
            base: math.multiply(math.divide(math.multiply(tempData3, math.bignumber(Math.configRandom({
              min: stats.other.randomRange.min,
              max: stats.other.randomRange.max,
            }))), 60), tempDamageSpeed),
            increment: lostCalculate(multiplyData, 10, 7),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 0.75,
                max: 2.5,
              })), tempData),
              increment: math.bignumber(stats.multiply.base),
            },
          },
          chance: {
            percent: {
              base: Math.configRandom({
                min: 0.01,
                max: 5,
              }),
              increment: Math.configRandom({
                min: 0.05,
                max: 2,
              }),
              max: Math.configRandom({
                min: 10,
                max: 25,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: math.multiply(stats.multiply.base, 3), //Balance this increment
              },
            },
            amount: {
              base: math.bignumber(Math.configRandom({
                min: 1.5,
                max: 2.5,
              })),
              increment: math.bignumber(Math.configRandom({
                min: 0.1,
                max: 1,
              })),
              max: Math.configRandom({
                min: 20,
                max: 50,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: math.multiply(stats.multiply.base, 1.5), //This too, and those below
              },
            },
          },
          speed: {
            base: tempDamageSpeed,
            increment: Math.configRandom({
              min: 1,
              max: 10,
              round: true,
            }),
            max: Math.configRandom({
              min: 15,
              max: 30,
              round: true,
            }),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 50,
                max: 150,
              })), tempData),
              increment: math.multiply(stats.multiply.base, 1.5),
            },
          },
          multiple: {
            value: {
              base: Math.configRandom({
                min: 1,
                max: Math.ceil(stats.enemy.count / 10),
                round: true,
              }),
              increment: Number(stats.enemy.count > 2) * Math.configRandom({
                min: 1,
                max: 5,
                round: true,
              }),
              max: Math.configRandom({
                min: 0,
                max: Number(stats.enemy.count > 5) * 10,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: math.multiply(stats.multiply.base, 2),
              },
            },
            chance: {
              percent: {
                base: Math.configRandom({
                  min: 0.01,
                  max: 5,
                }),
                increment: Math.configRandom({
                  min: 0.05,
                  max: 2,
                }),
                max: Math.configRandom({
                  min: 10,
                  max: 25,
                  round: true,
                }),
                cost: {
                  base: math.multiply(math.bignumber(Math.configRandom({
                    min: 50,
                    max: 150,
                  })), tempData),
                  increment: math.multiply(stats.multiply.base, 4),
                },
              },
              amount: {
                base: Math.configRandom({
                  min: 1,
                  max: Math.ceil(stats.enemy.count / 2.5),
                  round: true,
                }),
                increment: Number(stats.enemy.count > 2) * Math.configRandom({
                  min: 1,
                  max: 5,
                  round: true,
                }),
                max: Math.configRandom({
                  min: 0,
                  max: Number(stats.enemy.count > 5) * 10,
                  round: true,
                }),
                cost: {
                  base: math.multiply(math.bignumber(Math.configRandom({
                    min: 50,
                    max: 150,
                  })), tempData),
                  increment: math.multiply(stats.multiply.base, 3),
                },
              },
            },
          },
        },
        defense: {
          value: {
            base: math.multiply(tempData2, math.bignumber(Math.configRandom({
              min: stats.other.randomRange.min,
              max: stats.other.randomRange.max,
            }))),
            increment: lostCalculate(stats.multiply.lost, 10, 7),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 0.75,
                max: 2.5,
              })), tempData),
              increment: math.bignumber(stats.multiply.base),
            },
          },
          chance: {
            percent: {
              base: Math.configRandom({
                min: 0.01,
                max: 5,
              }),
              increment: Math.configRandom({
                min: 0.05,
                max: 2,
              }),
              max: Math.configRandom({
                min: 10,
                max: 25,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: math.multiply(stats.multiply.base, 3),
              },
            },
            amount: {
              base: math.bignumber(Math.configRandom({
                min: 1.5,
                max: 2.5,
              })),
              increment: math.bignumber(Math.configRandom({
                min: 0.1,
                max: 1,
              })),
              max: Math.configRandom({
                min: 20,
                max: 50,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: math.multiply(stats.multiply.base, 1.5),
              },
            },
          },
        },
        hp: {
          max: {
            base: math.multiply(tempData2, stats.other.hpMul, stats.other.hpBase, math.bignumber(Math.configRandom({
              min: stats.other.randomRange.min,
              max: stats.other.randomRange.max,
            }))),
            increment: lostCalculate(stats.multiply.lost, 10, 7),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 0.75,
                max: 2.5,
              })), tempData),
              increment: math.bignumber(stats.multiply.base),
            },
          },
          //math.pow(lostCalculate(stats.multiply.lost, 10, 7), 50)
          regen: {
            rate: {
              base: math.multiply(math.divide(math.multiply(tempData2, stats.other.hpMul, math.bignumber(Math.configRandom({
                min: stats.other.randomRange.min,
                max: stats.other.randomRange.max,
              }))), 60 * stats.other.speedMul), tempHpRegenSpeed),
              increment: lostCalculate(stats.multiply.lost, 10, 7),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 0.75,
                  max: 2.5,
                })), tempData),
                increment: math.bignumber(stats.multiply.base),
              },
            },
            speed: {
              base: tempHpRegenSpeed,
              increment: Math.configRandom({
                min: 1,
                max: 10,
                round: true,
              }),
              max: Math.configRandom({
                min: 15,
                max: 30,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: math.multiply(stats.multiply.base, 1.5),
              },
            },
          },
        },
        magic: {
          spell: {
            max: {
              base: Math.configRandom({
                min: 0,
                max: 5,
                round: true,
              }),
              increment: 1,
              max: Math.configRandom({
                min: 0,
                max: 5,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: math.bignumber(stats.multiply.base),
              },
            }
          },
          mana: {
            max: {
              base: math.multiply(tempData2, stats.other.manaBase, math.bignumber(Math.configRandom({
                min: stats.other.randomRange.min,
                max: stats.other.randomRange.max,
              }))),
              increment: lostCalculate(stats.multiply.lost, 10, 7),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 7.5,
                  max: 25,
                })), tempData),
                increment: math.bignumber(stats.multiply.base),
              },
            },
            regen: {
              rate: {
                base: math.multiply(math.divide(math.multiply(tempData2, math.bignumber(Math.configRandom({
                  min: stats.other.randomRange.min,
                  max: stats.other.randomRange.max,
                }))), 60 * stats.other.speedMul), tempManaRegenSpeed), //TODO: explain why 60 * 5 instead just 60
                //first: real rate divide 60 to per frame, then multiply by speed with frame
                increment: lostCalculate(stats.multiply.lost, 10, 7),
                cost: {
                  base: math.multiply(math.bignumber(Math.configRandom({
                    min: 7.5,
                    max: 25,
                  })), tempData),
                  increment: math.bignumber(stats.multiply.base),
                },
              },
              speed: {
                base: tempManaRegenSpeed,
                increment: Math.configRandom({
                  min: 1,
                  max: 10,
                  round: true,
                }),
                max: Math.configRandom({
                  min: 15,
                  max: 30,
                  round: true,
                }),
                cost: {
                  base: math.multiply(math.bignumber(Math.configRandom({
                    min: 50,
                    max: 150,
                  })), tempData),
                  increment: math.multiply(stats.multiply.base, 1.5),
                },
              },
            },
          },
        },
        death: {
          speed: {
            base: tempDeathSpeed,
            increment: Math.configRandom({
              min: 10,
              max: 25,
              round: true,
            }),
            max: Math.configRandom({
              min: 20,
              max: 50,
              round: true,
            }),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 500,
                max: 1500,
              })), tempData),
              increment: math.multiply(stats.multiply.base, 1.5),
            },
          },
          max: {
            base: Infinity,
            increment: 0,
            max: 0,
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 500,
                max: 1500,
              })), tempData),
              increment: math.multiply(stats.multiply.base, 6),
            },
          },
        },
        xp: {
          max: {
            base: math.multiply(tempData, math.bignumber(12.5 * stats.other.xpMulRandom), math.bignumber(Math.configRandom({
              min: stats.other.randomRange.min,
              max: stats.other.randomRange.max,
            }))),
            increment: math.bignumber(stats.multiply.base),
          },
        },
        bonus: {
          damage: {
            value: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
              cost: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
              },
            },
            chance: {
              percent: {
                multiply: 0,
                plus: 0,
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
              amount: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
            },
            speed: {
              multiply: 0,
              plus: 0,
              cost: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
              },
            },
            multiple: {
              value: {
                multiply: 0,
                plus: 0,
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
              chance: {
                percent: {
                  multiply: 0,
                  plus: 0,
                  cost: {
                    multiply: math.bignumber(0),
                    plus: math.bignumber(0),
                  },
                },
                amount: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                  cost: {
                    multiply: math.bignumber(0),
                    plus: math.bignumber(0),
                  },
                },
              },
            },
          },
          defense: {
            value: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
              cost: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
              },
            },
            chance: {
              percent: {
                multiply: 0,
                plus: 0,
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
              amount: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
            },
          },
          xp: {
            value: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
            },
            max: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
            },
          },
          hp: {
            max: {
              multiply: math.bignumber(0),
              plus: math.bignumber(0),
              cost: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
              },
            },
            regen: {
              rate: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
              speed: {
                multiply: 0,
                plus: 0,
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
            },
          },
          magic: {
            spell: {
              max: {
                multiply: 0,
                plus: 0,
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
              duration: {
                multiply: 0,
                plus: 0,
              },
              delay: {
                multiply: 0,
                plus: 0,
              },
              coolDown: {
                multiply: 0,
                plus: 0,
              },
            },
            mana: {
              max: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
                cost: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                },
              },
              regen: {
                rate: {
                  multiply: math.bignumber(0),
                  plus: math.bignumber(0),
                  cost: {
                    multiply: math.bignumber(0),
                    plus: math.bignumber(0),
                  },
                },
                speed: {
                  multiply: 0,
                  plus: 0,
                  cost: {
                    multiply: math.bignumber(0),
                    plus: math.bignumber(0),
                  },
                },
              },
            },
          },
          death: {
            speed: {
              multiply: 0,
              plus: 0,
              cost: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
              },
            },
            max: {
              multiply: 0,
              plus: 0,
              cost: {
                multiply: math.bignumber(0),
                plus: math.bignumber(0),
              },
            },
          },
        },
      };
    }
    if (hero.active.length < stats.hero.count) {
      var tempHero = hero.inactive.length <= 0 ? new Hero() : hero.inactive.pop();
      tempHero.apply(data);
      tempHero.xp.value = math.bignumber(0);
      tempHero.hp.value = Infinity;
      tempHero.magic.mana.value = Infinity;
      tempHero.update();
      tempHero.hp.value = math.bignumber(tempHero.hp.max.total);
      tempHero.magic.mana.value = math.bignumber(tempHero.magic.mana.max.total);
      hero.active.push(tempHero);
      render.addHero(tempHero);
      return tempHero;
    } else {
      return data;
    }
  }
  function createEnemy(data) {
    var tempData = mainCalculate(math.bignumber(1), math.bignumber(stats.multiply.base), math.bignumber(stats.zone.main.current));
        tempData2 = mainCalculate(math.bignumber(1), math.bignumber(stats.multiply.lost), math.bignumber(stats.zone.main.current)),
        tempData3 = mainCalculate(math.bignumber(1), math.pow(math.bignumber(stats.multiply.base), 2), math.bignumber(stats.zone.main.current));
    if (!data) {
      var tempDamageSpeed = Math.configRandom({
        min: 5 * 60, // Must x60, both
        max: 10 * 60,
        round: true,
      });
      var tempHpRegenSpeed = Math.configRandom({
        min: 5 * 60, // Must x60, both
        max: 10 * 60,
        round: true,
      });
      var tempManaRegenSpeed = Math.configRandom({
        min: 5 * 60, // Must x60, both
        max: 10 * 60,
        round: true,
      });
      var tempDeathSpeed = Math.configRandom({
        min: 30 * 60, // Must x60, both
        max: 60 * 60,
        round: true,
      });
      data = {
        damage: {
          value: math.multiply(math.divide(math.multiply(tempData3, math.bignumber(Math.configRandom({
            min: stats.other.randomRange.min,
            max: stats.other.randomRange.max,
          }))), 60), tempDamageSpeed),
          //(() * 60) / (tds * 60)
          chance: {
            percent: Math.configRandom({
              min: 0.01,
              max: 5 + (stats.zone.main.current <= stats.other.maxZone ? stats.zone.main.current / stats.other.maxZone * 50 : 50),
            }),
            amount: math.bignumber(Math.configRandom({
              min: 1.5,
              max: 4.5 + (stats.zone.main.current <= stats.other.maxZone ? stats.zone.main.current / stats.other.maxZone * 5.5 : 5.5),
            })),
          },
          speed: tempDamageSpeed,
          multiple: {
            value: Math.configRandom({
              min: 1,
              max: Math.ceil(stats.hero.count / 10),
              round: true,
            }),
            chance: {
              percent: Math.configRandom({
                min: 0.01,
                max: 5 + (stats.zone.main.current <= stats.other.maxZone ? stats.zone.main.current / stats.other.maxZone * 50 : 50),
              }),
              amount: Math.configRandom({
                min: 1,
                max: Math.ceil(stats.hero.count / 2.5),
                round: true,
              }),
            },
          },
        },
        defense: {
          value: math.multiply(tempData, math.bignumber(Math.configRandom({
            min: stats.other.randomRange.min,
            max: stats.other.randomRange.max,
          }))),
          chance: {
            percent: Math.configRandom({
              min: 0.01,
              max: 5 + (stats.zone.main.current <= stats.other.maxZone ? stats.zone.main.current / stats.other.maxZone * 50 : 50),
            }),
            amount: math.bignumber(Math.configRandom({
              min: 1.5,
              max: 4.5 + (stats.zone.main.current <= stats.other.maxZone ? stats.zone.main.current / stats.other.maxZone * 5.5 : 5.5),
            })),
          },
        },
        hp: {
          max: math.multiply(tempData, stats.other.hpBase, math.bignumber(Math.configRandom({
            min: stats.other.randomRange.min,
            max: stats.other.randomRange.max,
          }))),
          regen: {
            rate: math.multiply(math.divide(math.multiply(tempData, math.bignumber(Math.configRandom({
              min: stats.other.randomRange.min,
              max: stats.other.randomRange.max,
            }))), 60 * stats.other.speedMul), tempHpRegenSpeed),
            speed: tempHpRegenSpeed,
          },
        },
        magic: {
          spell: {
            max: Math.configRandom({
              min: 0,
              max: 5,
              round: true,
            }),
          },
          mana: {
            max: math.multiply(tempData, stats.other.manaBase, math.bignumber(Math.configRandom({
              min: stats.other.randomRange.min,
              max: stats.other.randomRange.max,
            }))),
            regen: {
              rate: math.multiply(math.divide(math.multiply(tempData, math.bignumber(Math.configRandom({
                min: stats.other.randomRange.min,
                max: stats.other.randomRange.max,
              }))), 60 * stats.other.speedMul), tempManaRegenSpeed),
              speed: tempManaRegenSpeed,
            },
          },
        },
        death: {
          speed: tempDeathSpeed,
          max: Math.configRandom({
            min: 0,
            max: 0,
            round: true,
          }),
        },
        loot: {
          money: math.multiply(tempData2, 3, math.bignumber(Math.configRandom({
            min: stats.other.randomRange.min,
            max: stats.other.randomRange.max,
          }))),
          xp: math.multiply(tempData2, math.bignumber(stats.other.xpMulRandom), math.bignumber(Math.configRandom({
            min: stats.other.randomRange.min,
            max: stats.other.randomRange.max,
          }))),
        },
        level: Math.configRandom({
          min: stats.zone.main.current <= 0 ? 0 : stats.zone.main.current - 5 >= 0 ? stats.zone.main.current - 5 : 0,
          max: stats.zone.main.current + 5,
          round: true
        }),
      };
    }
    if (enemy.active.length < stats.enemy.count) {
      var tempEnemy = enemy.inactive.length <= 0 ? new Enemy() : enemy.inactive.pop();
      tempEnemy.apply(data);
      tempEnemy.hp.value = Infinity;
      tempEnemy.magic.mana.value = Infinity;
      tempEnemy.update();
      tempEnemy.hp.value = math.bignumber(tempEnemy.hp.max.total.toString());
      tempEnemy.magic.mana.value = math.bignumber(tempEnemy.magic.mana.max.total.toString());
      enemy.active.push(tempEnemy);
      render.addEnemy(tempEnemy);
      return tempEnemy;
    } else {
      return data;
    }
  }
  function fillEnemy() {
    for (var pushCount = 0; pushCount < stats.enemy.count; pushCount ++) {
      createEnemy();
    }
  }
  function enemyAttack(enemyData, heroData, amount) {
    var returnData = {
      target: undefined,
      damageAmount: undefined,
      defenseAmount: undefined,
      realDamage: undefined,
      damageLeft: math.bignumber(0),
    };
    var blockAmount = Math.configRandom({
      min: 0,
      max: 99,
    }) < heroData.defense.chance.percent.total ? heroData.defense.chance.amount.total : 1;
    var damageAmount = Math.configRandom({
      min: 0,
      max: 99,
    }) < enemyData.damage.chance.percent.total ? enemyData.damage.chance.amount.total : 1;
    returnData.damageAmount = math.multiply(amount || enemyData.damage.value.total, damageAmount);
    returnData.defenseAmount = math.multiply(heroData.defense.value.total, blockAmount);
    returnData.realDamage = math.divide(returnData.damageAmount, math.compare(returnData.defenseAmount, 1).toNumber() <= 0 ? 1 : returnData.defenseAmount);
    heroData.hp.value = math.subtract(heroData.hp.value, (math.compare(returnData.realDamage, 0).toNumber() <= 0 ? 0 : returnData.realDamage));
    if (math.compare(heroData.hp.value, 0).toNumber() <= 0) {
      returnData.damageLeft = math.abs(heroData.hp.value);
      heroData.kill();
    }
    returnData.target = heroData;
    return returnData;
  }
  function heroAttack(heroData, enemyData, amount) {
    var returnData = {
      target: undefined,
      damageAmount: undefined,
      defenseAmount: undefined,
      realDamage: undefined,
      damageLeft: math.bignumber(0),
    };
    var blockAmount = Math.configRandom({
      min: 0,
      max: 99,
    }) < enemyData.defense.chance.percent.total ? enemyData.defense.chance.amount.total : 1;
    var damageAmount = Math.configRandom({
      min: 0,
      max: 99,
    }) < heroData.damage.chance.percent.total ? heroData.damage.chance.amount.total : 1;
    returnData.damageAmount = math.multiply(amount || heroData.damage.value.total, damageAmount);
    returnData.defenseAmount = math.multiply(enemyData.defense.value.total, blockAmount);
    returnData.realDamage = math.divide(returnData.damageAmount, math.compare(returnData.defenseAmount, 1).toNumber() <= 0 ? 1 : returnData.defenseAmount);
    var tempPreviousHp = enemyData.hp.value.toString();
    enemyData.hp.value = math.subtract(enemyData.hp.value, (math.compare(returnData.realDamage, 0).toNumber() <= 0 ? 0 : returnData.realDamage));
    if (!enemyData._.dealtBy[heroData.hash]) {
      enemyData._.dealtBy[heroData.hash] = {};
      enemyData._.dealtBy[heroData.hash].hero = heroData;
      enemyData._.dealtBy[heroData.hash].damage = math.bignumber(0);
    }
    if (math.compare(enemyData.hp.value, 0).toNumber() <= 0) {
      returnData.damageLeft = math.add(enemyData._.dealtBy[heroData.hash].damage, math.bignumber(tempPreviousHp));
      enemyData._.dealtBy[heroData.hash].damage = returnData.damageLeft;
      enemyData.kill();
    } else {
      enemyData._.dealtBy[heroData.hash].damage = math.add(enemyData._.dealtBy[heroData.hash].damage, returnData.realDamage);
    }
    returnData.target = enemyData;
    return returnData;
  }
  function reviveAllHero(instant) {
    for (var loopCount = hero.dead.length - 1; loopCount >= 0; --loopCount) {
      if (hero.dead[loopCount].death.total >= hero.dead[loopCount].death.max.total) {
        hero.dead[loopCount].erase();
      } else {
        hero.dead[loopCount].revive(instant);
      }
    }
  }
  function reviveAllEnemy(instant) {
    for (var loopCount = enemy.dead.length - 1; loopCount >= 0; --loopCount) {
      if (enemy.dead[loopCount].death.total >= enemy.dead[loopCount].death.max.total) {
        enemy.dead[loopCount].erase();
      } else {
        enemy.dead[loopCount].revive(instant);
      }
    }
  }
  function killAllHero() {
    for (var loopCount = hero.active.length - 1; loopCount >= 0; --loopCount) {
      hero.active[loopCount].kill();
    }
  }
  function killAllEnemy(noLoot) {
    for (var loopCount = enemy.active.length - 1; loopCount >= 0; --loopCount) {
      enemy.active[loopCount].kill(noLoot);
    }
  }
  
  function applyBonus(obj, bonus) {
    var tempBonusList = [], tempBonus;
    for (var loopCount = 0; loopCount < bonus.length; loopCount ++) {
      tempBonus = new Bonus({
        object: obj,
        type: bonus[loopCount].type,
        data: bonus[loopCount].data,
      });
      tempBonusList.push(tempBonus);
    }
    return tempBonusList;
  }
  function extractBonus(bonus) {
    var returnData = [];
    for (var loopCount = 0; loopCount < bonus.length; loopCount ++) {
      returnData.push(bonus[loopCount].extract());
    }
    return returnData;
  }
  function updateBonus(bonusData) {
    for (var bonusCount = 0; bonusCount < bonusData.length; bonusCount ++) {
      bonusData[bonusCount].location = bonusCount;
      bonusData[bonusCount].call();
    }
  }
  
  function prestige() {
    
  }
  
  if (storeData) {
    var loopCount, tempHero;
    for (loopCount = 0; loopCount < storeData.hero.active.length; loopCount ++) {
      tempHero = new Hero();
      tempHero.apply(storeData.hero.active[loopCount]);
      hero.active.push(tempHero);
      render.addHero(tempHero);
    }
    for (loopCount = 0; loopCount < storeData.hero.dead.length; loopCount ++) {
      tempHero = new Hero();
      tempHero.apply(storeData.hero.dead[loopCount]);
      hero.dead.push(tempHero);
    }
    for (loopCount = 0; loopCount < storeData.hero.wait.length; loopCount ++) {
      tempHero = new Hero();
      tempHero.apply(storeData.hero.wait[loopCount]);
      hero.wait.push(tempHero);
    }
  } else {
    createHero();
    stats.zone.main.beat --;
    alert(`Hello there !!!
First time here, right? I will tell you some quick tips !

This is prototype version, so you may expect some bugs and locked features
  
Click on enemy to deal damage.

Click on "+" (the big plus symbol button) to view full stats.

Click on up arrow to view many useful things

Click on "Buy" to buy based on total buy amount you want to buy (did not support max buy yet)

Keep it like that with click damage and stuff.

And HAVE FUN !!!

P.S: Turn on console to view this message again (F12), and if you saw any error, please tell me.

Warning: did not have auto save yet so you have to save manually.
    `);
  }
  fillEnemy();
  
  //Main update
  function main() {
    //updateBonus(bonus.data);
    //Active loop
    var loopCount, tempData;
    for (var loopCount = 0; loopCount < hero.active.length; loopCount ++) {
      hero.active[loopCount].attack();
      hero.active[loopCount].regen();
    }
    for (var loopCount = 0; loopCount < enemy.active.length; loopCount ++) {
      enemy.active[loopCount].attack();
      enemy.active[loopCount].regen();
    }
    //Death loop
    if (hero.active.length <= 0) {
      reviveAllHero(true);
      killAllEnemy(true);
      stats.zone.main.required.count = 0;
      if (stats.zone.main.current > 0) {
        stats.zone.main.current = stats.zone.main.beat;
      }
    } else {
      reviveAllHero();
    }
    reviveAllEnemy();
    //Logic stuff
    if (enemy.active.length + enemy.dead.length > stats.enemy.count) {
      killAllEnemy(true);
    }
    if (enemy.active.length + enemy.dead.length < stats.enemy.count) {
      fillEnemy();
    }
    if (stats.zone.main.beat >= stats.other.nextHero && stats.hero.count <= 100) {
      stats.hero.count ++;
      createHero();
      stats.other.nextHero += 10;
    }
    if (stats.zone.main.beat >= stats.other.nextEnemy && stats.enemy.count <= 100) {
      stats.enemy.count ++;
      stats.zone.main.required.max += 5;
      stats.other.nextEnemy += 10;
    }
    if (stats.zone.main.required.count >= stats.zone.main.required.max) {
      stats.zone.main.required.count = 0;
      if (stats.zone.main.beat < stats.zone.main.current) {
        stats.zone.main.beat = stats.zone.main.current;
        stats.zone.main.current ++;
      }
    }
  }
  
  //Initialize
  $(document).ready(function() {
    var loopCount = 0;
    setInterval(function() {
      if (forceStop) {
        return;
      }
      for (var i = 1; i <= gameSpeed; i ++) {
        main();
      }
    }, 0);
    function run() {
      for (loopCount = 0; loopCount < hero.active.length; loopCount ++) {
        render.updateHero(hero.active[loopCount]);
      }
      for (loopCount = 0; loopCount < hero.dead.length; loopCount ++) {
        render.updateHero(hero.dead[loopCount]);
      }
      for (loopCount = 0; loopCount < enemy.active.length; loopCount ++) {
        render.updateEnemy(enemy.active[loopCount]);
      }
      for (loopCount = 0; loopCount < enemy.dead.length; loopCount ++) {
        render.updateEnemy(enemy.dead[loopCount]);
      }
      requestAnimFrame(run);
    }
    run();
    setInterval(function() {
      render.render();
    }, 500);
  });
  
  console.log(`
  This is prototype version, so you may expect some bugs and locked features
  
  Click on enemy to deal damage.
  
  Click on "+" (the big plus symbol button) to view full stats.
  
  Click on up arrow to view many useful things
  
  Click on "Buy" to buy based on total buy amount you want to buy (did not support max buy yet)
  
  Keep it like that with click damage and stuff.
  
  If you saw any error, please tell me.
  `);
//})();
