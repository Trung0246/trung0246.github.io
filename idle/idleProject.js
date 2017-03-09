math.config({
  number: 'BigNumber',
  precision: 64 + 6,
});

//Main variable code
var stats = {}, achievement = [], options = {}, task = [],
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
    equipment = [], player = {}, temp = {};

  var forceStop = false, noSave = false;
//(function() {
  //Check storage
  var storeData = store.get("saveSlot1");
  
  function save() {
    //Serialize stuff first
    var tempList, tempData, loopCount;
    store.set("saveSlot1", {
      stats: stats.extract(),
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
  }
  
  //Stats data
  (function() {
    stats.level = {
      base: 10,
      lost: 6.1,
    };
    stats.multiply = {};
    stats.multiply.base = math.bignumber(1.2);
    stats.multiply.lost = lostCalculate(stats.multiply.base, stats.level.base, stats.level.lost);
    stats.multiply.high = math.bignumber(1.5);
    stats.apply = function(obj) {
      obj = obj || {};
      stats.zone = {
        highest: Number(_.get(obj, "zone.highest", 0)),
        current: Number(_.get(obj, "zone.current", 0)),
        beat: Number(_.get(obj, "zone.beat", 0)),
      };
      stats.prestige = {
        current: Number(_.get(obj, "prestige.current", 0)),
        total: Number(_.get(obj, "prestige.total", 0)),
        multiply: math.pow(lostCalculate(stats.multiply.base, 10, 3.9), 50),
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
          required: {
            count: Number(_.get(obj, "enemy.death.required.count", 0)),
            max: Number(_.get(obj, "enemy.death.required.max", 10)),
          },
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
        nextHero: Number(_.get(obj, "other.nextHero", 10)),
        nextEnemy: Number(_.get(obj, "other.nextEnemy", 15)),
        maxZone: Number(_.get(obj, "other.maxZone", 1000)),
        shopType: "upgrade",
        shopObj: 0,
      };
    };
    stats.extract = function() {
      return {
        zone: {
          highest: _.get(stats, "zone.highest", 0),
          current: _.get(stats, "zone.current", 0),
          beat: _.get(stats, "zone.beat", 0),
        },
        prestige: {
          current: _.get(stats, "prestige.current", 0),
          total: _.get(stats, "prestige.total", 0),
        },
        clicks: {
          current: _.get(stats, "clicks.current", 0),
          total: _.get(stats, "click.total", 0),
        },
        money: {
          current: _.get(stats, "money.current", 0).toString(),
          total: _.get(stats, "money.total", 0).toString(),
          prestige: _.get(stats, "money.prestige", 0).toString(),
          offline: _.get(stats, "money.offine", 0).toString(),
          online: _.get(stats, "money.online", 0).toString(),
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
            current: _.get(stats, "upgrade.spent.current", 0).toString(),
            total: _.get(stats, "upgrade.spent.total", 0).toString(),
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
            perSecond: _.get(stats, "hero.damage.perSecond", 0).toString(),
            current: _.get(stats, "hero.damage.current", 0).toString(),
            offline: _.get(stats, "hero.damage.offline", 0).toString(),
            total: _.get(stats, "hero.damage.total", 0).toString(),
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
                amount: _.get(stats, "hero.damage.chance.highest.amount", 0).toString(),
              },
            },
          },
          defense: {
            current: _.get(stats, "hero.defense.current", 0).toString(),
            total: _.get(stats, "hero.defense.total", 0).toString(),
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
                amount: _.get(stats, "hero.defense.chance.highest.amount", 0).toString(),
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
            required: {
              count: _.get(stats, "enemy.death.required.count", 0),
              max: _.get(stats, "enemy.death.required.max", 10),
            },
          },
          boss: {
            current: _.get(stats, "enemy.boss.current", 0),
            total: _.get(stats, "enemy.boss.total", 0),
            death: {
              current: _.get(stats, "enemy.boss.death.current", 0),
              total: _.get(stats, "enemy.boss.deah.total", 0),
            },
            damage: {
              perSecond: _.get(stats, "enemy.boss.damage.perSecond", 0).toString(),
              current: _.get(stats, "enemy.boss.damage.current", 0).toString(),
              offline: _.get(stats, "enemy.boss.damage.offline", 0).toString(),
              total: _.get(stats, "enemy.boss.damage.total", 0).toString(),
              count: {
                current: _.get(stats, "enemy.boss.damage.count.current", 0),
                total: _.get(stats, "enemy.boss.damage.count.total", 0),
              },
              chance: {
                current: _.get(stats, "enemy.boss.damage.chance.current", 0).toString(),
                total: _.get(stats, "enemy.boss.damage.chance.total", 0).toString(),
                count: {
                  current: _.get(stats, "enemy.boss.damage.chance.count.current", 0),
                  total: _.get(stats, "enemy.boss.damage.chance.count.total", 0),
                },
                highest: {
                  value: _.get(stats, "enemy.boss.damage.chance.highest.value", 0),
                  amount: _.get(stats, "enemy.boss.damage.chance.highest.amount", 0).toString(),
                },
              },
            },
            defense: {
              current: _.get(stats, "enemy.boss.defense.current", 0).toString(),
              total: _.get(stats, "enemy.boss.defense.total", 0).toString(),
              chance: {
                current: _.get(stats, "enemy.boss.defense.chance.current", 0).toString(),
                total: _.get(stats, "enemy.boss.defense.chance.total", 0).toString(),
                count: {
                  current: _.get(stats, "enemy.boss.defense.chance.count.current", 0),
                  total: _.get(stats, "enemy.boss.defense.chance.count.total", 0),
                },
                highest: {
                  value: _.get(stats, "enemy.boss.defense.chance.highest.value", 0),
                  amount: _.get(stats, "enemy.boss.defense.chance.highest.amount", 0).toString(),
                },
              },
            },
          },
          damage: {
            perSecond: _.get(stats, "enemy.damage.perSecond", 0).toString(),
            current: _.get(stats, "enemy.damage.current", 0).toString(),
            offline: _.get(stats, "enemy.damage.offline", 0).toString(),
            total: _.get(stats, "enemy.damage.total", 0).toString(),
            count: {
              current: _.get(stats, "enemy.damage.count.current", 0),
              total: _.get(stats, "enemy.damage.count.total", 0),
            },
            chance: {
              current: _.get(stats, "enemy.damage.chance.current", 0).toString(),
              total: _.get(stats, "enemy.damage.chance.total", 0).toString(),
              count: {
                current: _.get(stats, "enemy.damage.chance.count.current", 0),
                total: _.get(stats, "enemy.damage.chance.count.total", 0),
              },
              highest: {
                value: _.get(stats, "enemy.damage.chance.highest.value", 0),
                amount: _.get(stats, "enemy.damage.chance.highest.amount", 0).toString(),
              },
            },
          },
          defense: {
            current: _.get(stats, "enemy.defense.current", 0).toString(),
            total: _.get(stats, "enemy.defense.total", 0).toString(),
            chance: {
              current: _.get(stats, "enemy.defense.chance.current", 0).toString(),
              total: _.get(stats, "enemy.defense.chance.total", 0).toString(),
              count: {
                current: _.get(stats, "enemy.defense.chance.count.current", 0),
                total: _.get(stats, "enemy.defense.chance.count.total", 0),
              },
              highest: {
                value: _.get(stats, "enemy.defense.chance.highest.value", 0),
                amount: _.get(stats, "enemy.defense.chance.highest.amount", 0).toString(),
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
    bonus.data = [];
    bonus.player = {
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
    };
    bonus.hero = {
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
      magic: {
        spell: {
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
          //TODO: missed hp, mana, gold, xp
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
    };
    bonus.enemy = {
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
      magic: {
        spell: {
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
          //TODO: missed hp, mana
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
      boss: {
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
        magic: {
          spell: {
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
            //TODO: missed hp, mana
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
      },
    };
    bonus.money = {
      enemy: {
        multiply: math.bignumber(0),
        plus: math.bignumber(0),
      },
      boss: {
        multiply: math.bignumber(0),
        plus: math.bignumber(0),
      },
      all: {
        multiply: math.bignumber(0),
        plus: math.bignumber(0),
      },
      cost: {
        multiply: math.bignumber(0),
        plus: math.bignumber(0),
      },
    };
    bonus.xp = {
      enemy: {
        multiply: math.bignumber(0),
        plus: math.bignumber(0),
      },
      boss: {
        multiply: math.bignumber(0),
        plus: math.bignumber(0),
      },
      all: {
        multiply: math.bignumber(0),
        plus: math.bignumber(0),
      },
      max: {
        multiply: math.bignumber(0),
        plus: math.bignumber(0),
      },
    };
    //TODO: all like (all damage, all defense,...) and include enemy
    bonus.special = {};
    bonus.apply = function(obj) {
      
    };
    bonus.extract = function() {
      
    };
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
          obj.data = {
            damage: {
              previous: math.bignumber(0),
              increment: math.bignumber(0),
            },
            defense: {
              previous: math.bignumber(0),
              increment: math.bignumber(0),
            },
            hp: {
              max: {
                previous: math.bignumber(0),
                increment: math.bignumber(0),
              },
              rate: {
                previous: math.bignumber(0),
                increment: math.bignumber(0),
              },
            },
            mana: {
              max: {
                previous: math.bignumber(0),
                increment: math.bignumber(0),
              },
              rate: {
                previous: math.bignumber(0),
                increment: math.bignumber(0),
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
  
  function Equipment(data) {
    
  }
  Equipment.prototype = {
    
  };
  
  //Player data
  (function() {
    /*player.damage = {
      value: {
        current: undefined,
        total: undefined,
        base: math.bignumber(2),
        count: 0,
        increment: stats.multiply.lost,
        cost: {
          base: math.bignumber(1.5),
          increment: stats.multiply.base,
          current: undefined,
          total: undefined,
        },
      },
      chance: {
        percent: {
          current: undefined,
          total: undefined,
          base: 0,
          count: 0,
          increment: math.bignumber(0),
          cost: {
            base: math.bignumber(0),
            increment: math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: 0,
        },
        amount: {
          current: undefined,
          total: undefined,
          base: math.bignumber(0),
          count: 0,
          increment: math.bignumber(0),
          cost: {
            base: math.bignumber(0),
            increment: math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: 0,
        },
      },
      multiple: {
        value: {
          current: undefined,
          total: undefined,
          base: 1,
          count: 0,
          increment: 0,
          cost: {
            base: math.bignumber(0),
            increment: math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: 0,
        },
        chance: {
          percent: {
            current: undefined,
            total: undefined,
            base: 0,
            count: 0,
            increment: 0,
            cost: {
              base: math.bignumber(0),
              increment: math.bignumber(0),
              current: undefined,
              total: undefined,
            },
            max: 0,
          },
          amount: {
            current: undefined,
            total: undefined,
            base: 1,
            count: 0,
            increment: 0,
            cost: {
              base: math.bignumber(0),
              increment: math.bignumber(0),
              current: undefined,
              total: undefined,
            },
            max: 0,
          },
        },
      },
    };*/
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
      };
    };
    player.apply(storeData ? storeData.player : undefined);
    updatePlayer();
  })();
  
  function updatePlayer() {
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
    objTotalCal(player.damage.value, "bignumber", [bonus.player.damage.value.multiply], [bonus.player.damage.value.plus]);
    objTotalCal(player.damage.chance.percent, "add", [bonus.player.damage.chance.percent.multiply], [bonus.player.damage.chance.percent.plus]);
    objTotalCal(player.damage.chance.amount, "bignumber", [bonus.player.damage.chance.amount.multiply], [bonus.player.damage.chance.amount.plus]);
    objTotalCal(player.damage.multiple.value, "add", [bonus.player.damage.multiple.value.multiply], [bonus.player.damage.multiple.value.plus]);
    objTotalCal(player.damage.multiple.chance.percent, "bignumber", [bonus.player.damage.multiple.chance.percent.multiply], [bonus.player.damage.multiple.chance.percent.plus]);
    objTotalCal(player.damage.multiple.chance.amount, "bignumber", [bonus.player.damage.multiple.chance.amount.multiply], [bonus.player.damage.multiple.chance.amount.plus]);
    objTotalCal(player.damage.value, "cost", [bonus.player.damage.value.cost.multiply], [bonus.player.damage.value.cost.plus]);
    objTotalCal(player.damage.chance.percent, "cost", [bonus.player.damage.chance.percent.cost.multiply], [bonus.player.damage.chance.percent.cost.plus]);
    objTotalCal(player.damage.chance.amount, "cost", [bonus.player.damage.chance.amount.cost.multiply], [bonus.player.damage.chance.amount.cost.plus]);
    objTotalCal(player.damage.multiple.value, "cost", [bonus.player.damage.multiple.value.cost.multiply], [bonus.player.damage.multiple.value.cost.plus]);
    objTotalCal(player.damage.multiple.chance.percent, "cost", [bonus.player.damage.multiple.chance.percent.cost.multiply], [bonus.player.damage.multiple.chance.percent.cost.plus]);
    objTotalCal(player.damage.multiple.chance.amount, "cost", [bonus.player.damage.multiple.chance.amount.cost.multiply], [bonus.player.damage.multiple.chance.amount.cost.plus]);
  }
  function playerAttack(enemyData, amount) {
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
  }
  function upgradePlayer(stringArray, amount, isCost) {
    var tempObj = getObjData(player, stringArray), tempBonus = getObjData(bonus, [].concat("player", stringArray)), tempCost, returnData = {
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
    tempCost = math.add(math.multiply(costCalculate(tempObj.cost.base, tempObj.cost.increment, tempObj.count, amount), math.add(tempBonus.cost.multiply, 1)), tempBonus.cost.plus);
    if (math.compare(stats.money.current, tempCost).toNumber() > -1 && amount > 0 && !isCost) {
      stats.money.current = math.subtract(stats.money.current, tempCost);
      tempObj.count += amount;
      returnData.bought = true;
      updatePlayer();
    }
    returnData.cost = tempCost;
    returnData.amount = amount;
    return returnData;
  }
  
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
          base: Number(data.death.max.base || 0),
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
          data: {
            damage: {
              previous: math.bignumber(0),
              increment: lostCalculate(tempHero.damage.value.increment, 10, 3),
            },
            defense: {
              previous: math.bignumber(0),
              increment: lostCalculate(tempHero.defense.value.increment, 10, 3),
            },
            hp: {
              max: {
                previous: math.bignumber(0),
                increment: lostCalculate(tempHero.hp.max.increment, 10, 3),
              },
              rate: {
                previous: math.bignumber(0),
                increment: lostCalculate(tempHero.hp.regen.rate.increment, 10, 3),
              },
            },
            mana: {
              max: {
                previous: math.bignumber(0),
                increment: lostCalculate(tempHero.magic.mana.max.increment, 10, 3),
              },
              rate: {
                previous: math.bignumber(0),
                increment: lostCalculate(tempHero.magic.mana.regen.rate.increment, 10, 3),
              },
            },
          },
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
              data: data.bonus.data[loopCount].data,
            });
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
        if (this._.coolDown.damage <= 0) {
          this._.coolDown.damage = 0;
          this._.coolDown.damage = this.damage.speed.total;
        } else {
          return;
        }
      }
      if (!enemyData) {
        var splashAmount = Math.configRandom({
          min: 0,
          max: 99,
        }) < this.damage.multiple.chance.percent.total ? this.damage.multiple.chance.amount : this.damage.multiple.value.total;
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
          if (this._.coolDown.hp <= 0 || instant) {
            this._.coolDown.hp = this.hp.regen.speed.total;
          } else {
            this._.coolDown.hp --;
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
          if (this._.coolDown.mana <= 0 || instant) {
            this._.coolDown.mana = this.magic.mana.regen.speed.total;
          } else {
            this._.coolDown.mana --;
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
    upgrade: function(stringArray, amount, isCost) {
      var tempObj = getObjData(this, stringArray), tempBonus = getObjData(this, [].concat("bonus", stringArray)), tempCost, returnData = {
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
      tempCost = totalCalculate("bignumber", costCalculate(tempObj.cost.base, tempObj.cost.increment, tempObj.count, amount), [tempBonus.cost.multiply], [tempBonus.cost.plus]);
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
      return returnData;
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
      objTotalCal(this.damage.value, "bignumber", [this.bonus.damage.value.multiply], [this.bonus.damage.value.plus]);
      objTotalCal(this.damage.chance.percent, "add", [this.bonus.damage.chance.percent.multiply], [this.bonus.damage.chance.percent.plus]);
      objTotalCal(this.damage.chance.amount, "bignumber", [this.bonus.damage.chance.amount.multiply], [this.bonus.damage.chance.amount.plus]);
      objTotalCal(this.damage.speed, "add", [this.bonus.damage.speed.multiply], [this.bonus.damage.speed.plus]);
      objTotalCal(this.damage.multiple.value, "add", [this.bonus.damage.multiple.value.multiply], [this.bonus.damage.multiple.value.plus]);
      objTotalCal(this.damage.multiple.chance.percent, "add", [this.bonus.damage.multiple.chance.percent.multiply], [this.bonus.damage.multiple.chance.percent.plus]);
      objTotalCal(this.damage.multiple.chance.amount, "add", [this.bonus.damage.multiple.chance.amount.multiply], [this.bonus.damage.multiple.chance.amount.plus]);
      //console.log(this);
      objTotalCal(this.damage.value, "cost", [this.bonus.damage.value.cost.multiply], [this.bonus.damage.value.cost.plus]);
      objTotalCal(this.damage.chance.percent, "cost", [this.bonus.damage.chance.percent.cost.multiply], [this.bonus.damage.chance.percent.cost.plus]);
      objTotalCal(this.damage.chance.amount, "cost", [this.bonus.damage.chance.amount.cost.multiply], [this.bonus.damage.chance.amount.cost.plus]);
      objTotalCal(this.damage.speed, "cost", [this.bonus.damage.speed.cost.multiply], [this.bonus.damage.speed.cost.plus]);
      objTotalCal(this.damage.multiple.value, "cost", [this.bonus.damage.multiple.value.cost.multiply], [this.bonus.damage.multiple.value.cost.plus]);
      objTotalCal(this.damage.multiple.chance.percent, "cost", [this.bonus.damage.multiple.chance.percent.cost.multiply], [this.bonus.damage.multiple.chance.percent.cost.plus]);
      objTotalCal(this.damage.multiple.chance.amount, "cost", [this.bonus.damage.multiple.chance.amount.cost.multiply], [this.bonus.damage.multiple.chance.amount.cost.plus]);
      //Defense
      objCurrentCal(this.defense.value, "bignumber");
      objCurrentCal(this.defense.chance.percent, "add");
      objCurrentCal(this.defense.chance.amount, "addBignumber");
      objCurrentCal(this.defense.value, "cost");
      objCurrentCal(this.defense.chance.percent, "cost");
      objCurrentCal(this.defense.chance.amount, "cost");
      //Total
      objTotalCal(this.defense.value, "bignumber", [this.bonus.defense.value.multiply], [this.bonus.defense.value.plus]);
      objTotalCal(this.defense.chance.percent, "add", [this.bonus.defense.chance.percent.multiply], [this.bonus.defense.chance.percent.plus]);
      objTotalCal(this.defense.chance.amount, "bignumber", [this.bonus.defense.chance.amount.multiply], [this.bonus.defense.chance.amount.plus]);
      objTotalCal(this.defense.value, "cost", [this.bonus.defense.value.cost.multiply], [this.bonus.defense.value.cost.plus]);
      objTotalCal(this.defense.chance.percent, "cost", [this.bonus.defense.chance.percent.cost.multiply], [this.bonus.defense.chance.percent.cost.plus]);
      objTotalCal(this.defense.chance.amount, "cost", [this.bonus.defense.chance.amount.cost.multiply], [this.bonus.defense.chance.amount.cost.plus]);
      //Xp
      objCurrentCal(this.xp.max, "bignumber");
      //Total
      objTotalCal(this.xp.max, "bignumber", [this.bonus.xp.max.multiply], [this.bonus.xp.max.plus]);
      //Hp
      objCurrentCal(this.hp.max, "bignumber");
      objCurrentCal(this.hp.regen.rate, "bignumber");
      objCurrentCal(this.hp.regen.speed, "subtract");
      objCurrentCal(this.hp.max, "cost");
      objCurrentCal(this.hp.regen.rate, "cost");
      objCurrentCal(this.hp.regen.speed, "cost");
      //Total
      objTotalCal(this.hp.max, "bignumber", [this.bonus.hp.max.multiply], [this.bonus.hp.max.plus]);
      objTotalCal(this.hp.regen.rate, "bignumber", [this.bonus.hp.regen.rate.multiply], [this.bonus.hp.regen.rate.plus]);
      objTotalCal(this.hp.regen.speed, "add", [this.bonus.hp.regen.speed.multiply], [this.bonus.hp.regen.speed.plus]);
      objTotalCal(this.hp.max, "cost", [this.bonus.hp.max.cost.multiply], [this.bonus.hp.max.cost.plus]);
      objTotalCal(this.hp.regen.rate, "cost", [this.bonus.hp.regen.rate.cost.multiply], [this.bonus.hp.regen.rate.cost.plus]);
      objTotalCal(this.hp.regen.speed, "cost", [this.bonus.hp.regen.speed.cost.multiply], [this.bonus.hp.regen.speed.cost.plus]);
      //Mana
      objCurrentCal(this.magic.mana.max, "bignumber");
      objCurrentCal(this.magic.mana.regen.rate, "bignumber");
      objCurrentCal(this.magic.mana.regen.speed, "subtract");
      objCurrentCal(this.magic.mana.max, "cost");
      objCurrentCal(this.magic.mana.regen.rate, "cost");
      objCurrentCal(this.magic.mana.regen.speed, "cost");
      //Total
      objTotalCal(this.magic.mana.max, "bignumber", [this.bonus.magic.mana.max.multiply], [this.bonus.magic.mana.max.plus]);
      objTotalCal(this.magic.mana.regen.rate, "bignumber", [this.bonus.magic.mana.regen.rate.multiply], [this.bonus.magic.mana.regen.rate.plus]);
      objTotalCal(this.magic.mana.regen.speed, "add", [this.bonus.magic.mana.regen.speed.multiply], [this.bonus.magic.mana.regen.speed.plus]);
      objTotalCal(this.magic.mana.max, "cost", [this.bonus.magic.mana.max.cost.multiply], [this.bonus.magic.mana.max.cost.plus]);
      objTotalCal(this.magic.mana.regen.rate, "cost", [this.bonus.magic.mana.regen.rate.cost.multiply], [this.bonus.magic.mana.regen.rate.cost.plus]);
      objTotalCal(this.magic.mana.regen.speed, "cost", [this.bonus.magic.mana.regen.speed.cost.multiply], [this.bonus.magic.mana.regen.speed.cost.plus]);
      //Death
      objCurrentCal(this.death.speed, "subtract");
      objCurrentCal(this.death.max, "add");
      objCurrentCal(this.death.speed, "cost");
      objCurrentCal(this.death.max, "cost");
      //Total
      objTotalCal(this.death.speed, "add", [this.bonus.death.speed.multiply], [this.bonus.death.speed.plus]);
      objTotalCal(this.death.max, "add", [this.bonus.death.max.multiply], [this.bonus.death.max.plus]);
      objTotalCal(this.death.speed, "cost", [this.bonus.death.speed.cost.multiply], [this.bonus.death.speed.cost.plus]);
      objTotalCal(this.death.max, "cost", [this.bonus.death.max.cost.multiply], [this.bonus.death.max.cost.plus]);
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
      data.boss = data.boss || false;
      data = data || {};
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
        spell: {},
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
            duration: {
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
        if (this._.coolDown.damage <= 0) {
          this._.coolDown.damage = 0;
          this._.coolDown.damage = this.damage.speed.total;
        } else {
          return;
        }
      }
      if (!heroData) {
        var splashAmount = Math.configRandom({
          min: 0,
          max: 99,
        }) < this.damage.multiple.chance.percent.total ? this.damage.multiple.chance.amount : this.damage.multiple.value.total;
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
          if (this._.coolDown.hp <= 0 || instant) {
            this._.coolDown.hp = this.hp.regen.speed.total;
          } else {
            this._.coolDown.hp --;
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
          if (this._.coolDown.mana <= 0 || instant) {
            this._.coolDown.mana = this.magic.mana.regen.speed.total;
          } else {
            this._.coolDown.mana --;
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
      if (stats.zone.current > stats.zone.beat) {
        stats.enemy.death.required.count ++;
      }
      return returnData;
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
      //Damage
      objTotalCal(this.damage.value, "bignumber", [this.bonus.damage.value.multiply], [this.bonus.damage.value.plus]);
      objTotalCal(this.damage.chance.percent, "add", [this.bonus.damage.chance.percent.multiply], [this.bonus.damage.chance.percent.plus]);
      objTotalCal(this.damage.chance.amount, "bignumber", [this.bonus.damage.chance.amount.multiply], [this.bonus.damage.chance.amount.plus]);
      objTotalCal(this.damage.speed, "add", [this.bonus.damage.speed.multiply], [this.bonus.damage.speed.plus]);
      objTotalCal(this.damage.multiple.value, "add", [this.bonus.damage.multiple.value.multiply], [this.bonus.damage.multiple.value.plus]);
      objTotalCal(this.damage.multiple.chance.percent, "add", [this.bonus.damage.multiple.chance.percent.multiply], [this.bonus.damage.multiple.chance.percent.plus]);
      objTotalCal(this.damage.multiple.chance.amount, "add", [this.bonus.damage.multiple.chance.amount.multiply], [this.bonus.damage.multiple.chance.amount.plus]);
      //Defense
      objTotalCal(this.defense.value, "bignumber", [this.bonus.defense.value.multiply], [this.bonus.defense.value.plus]);
      objTotalCal(this.defense.chance.percent, "add", [this.bonus.defense.chance.percent.multiply], [this.bonus.defense.chance.percent.plus]);
      objTotalCal(this.defense.chance.amount, "bignumber", [this.bonus.defense.chance.amount.multiply], [this.bonus.defense.chance.amount.plus]);
      //Hp
      objTotalCal(this.hp.max, "bignumber", [this.bonus.hp.max.multiply], [this.bonus.hp.max.plus]);
      objTotalCal(this.hp.regen.rate, "bignumber", [this.bonus.hp.regen.rate.multiply], [this.bonus.hp.regen.rate.plus]);
      objTotalCal(this.hp.regen.speed, "add", [this.bonus.hp.regen.speed.multiply], [this.bonus.hp.regen.speed.plus]);
      //Mana
      objTotalCal(this.magic.mana.max, "bignumber", [this.bonus.magic.mana.max.multiply], [this.bonus.magic.mana.max.plus]);
      objTotalCal(this.magic.mana.regen.rate, "bignumber", [this.bonus.magic.mana.regen.rate.multiply], [this.bonus.magic.mana.regen.rate.plus]);
      objTotalCal(this.magic.mana.regen.speed, "add", [this.bonus.magic.mana.regen.speed.multiply], [this.bonus.magic.mana.regen.speed.plus]);
      //Death
      objTotalCal(this.death.speed, "add", [this.bonus.death.speed.multiply], [this.bonus.death.speed.plus]);
      objTotalCal(this.death.max, "add", [this.bonus.death.max.multiply], [this.bonus.death.max.plus]);
      //Loot
      objTotalCal(this.loot.money, "bignumber", [this.bonus.loot.money.multiply], [this.bonus.loot.money.plus]);
      objTotalCal(this.loot.xp, "bignumber", [this.bonus.loot.xp.multiply], [this.bonus.loot.xp.plus]);
    },
  };
  
  //Helper
  function randomString() {
    return (Math.random() * 1e36).toString(36);
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
    if (limit >= stats.zone.current) {
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
    var loopCount, multiplyData, addData;
    switch (type) {
      case "bignumber": {
        multiplyData = math.bignumber(1);
        for (loopCount = 0; loopCount < bonusMultiply.length; loopCount ++) {
          multiplyData = math.add(bonusMultiply[loopCount], multiplyData);
        }
        addData = math.bignumber(0);
        for (loopCount = 0; loopCount < bonusAdd.length; loopCount ++) {
          addData = math.add(bonusAdd[loopCount], addData);
        }
        return math.add(math.multiply(current, multiplyData), addData);
      }
      break;
      case "add": {
        multiplyData = 1;
        for (loopCount = 0; loopCount < bonusMultiply.length; loopCount ++) {
          multiplyData += bonusMultiply[loopCount];
        }
        addData = 0;
        for (loopCount = 0; loopCount < bonusAdd.length; loopCount ++) {
          addData += bonusAdd[loopCount];
        }
        return current * multiplyData + addData;
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
    var tempData = mainCalculate(math.bignumber(1), math.bignumber(stats.multiply.base), math.bignumber(stats.zone.beat)),
        tempData2 = mainCalculate(math.bignumber(1), math.bignumber(stats.multiply.lost), math.bignumber(stats.zone.beat)),
        multiplyData = math.pow(math.bignumber(stats.multiply.lost), 2),
        tempData3 = mainCalculate(math.bignumber(1), multiplyData, math.bignumber(stats.zone.beat));
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
        max: 120 * 60,
        round: true,
      });
      data = {
        damage: {
          value: {
            base: math.multiply(math.divide(math.multiply(tempData3, math.bignumber(Math.configRandom({
              min: 0.5,
              max: 1.5,
            }))), 60), tempDamageSpeed),
            increment: lostCalculate(multiplyData, 10, 7),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 1,
                max: 10,
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
              min: 10,
              max: 20,
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
              min: 0.5,
              max: 1.5,
            }))),
            increment: lostCalculate(stats.multiply.lost, 10, 7),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 1,
                max: 10,
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
            base: math.multiply(tempData2, 25, math.pow(lostCalculate(stats.multiply.lost, 10, 3.9), 50), math.bignumber(Math.configRandom({
              min: 0.5,
              max: 1.5,
            }))),
            increment: lostCalculate(stats.multiply.lost, 10, 7),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 1,
                max: 10,
              })), tempData),
              increment: math.bignumber(stats.multiply.base),
            },
          },
          regen: {
            rate: {
              base: math.multiply(math.divide(math.multiply(tempData2, math.pow(lostCalculate(stats.multiply.lost, 10, 3.9), 50), math.bignumber(Math.configRandom({
                min: 0.5,
                max: 1.5,
              }))), 60 * 5), tempHpRegenSpeed),
              increment: lostCalculate(stats.multiply.lost, 10, 7),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 1,
                  max: 10,
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
              base: math.multiply(tempData2, 10, math.bignumber(Math.configRandom({
                min: 0.5,
                max: 1.5,
              }))),
              increment: lostCalculate(stats.multiply.lost, 10, 7),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 10,
                  max: 200,
                })), tempData),
                increment: math.bignumber(stats.multiply.base),
              },
            },
            regen: {
              rate: {
                base: math.multiply(math.divide(math.multiply(tempData2, math.bignumber(Math.configRandom({
                  min: 0.5,
                  max: 1.5,
                }))), 60 * 5), tempManaRegenSpeed),
                increment: lostCalculate(stats.multiply.lost, 10, 7),
                cost: {
                  base: math.multiply(math.bignumber(Math.configRandom({
                    min: 5,
                    max: 15,
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
              min: 0.5,
              max: 1.5,
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
      return tempHero;
    } else {
      return data;
    }
  }
  function createEnemy(data) {
    var tempData = mainCalculate(math.bignumber(1), math.bignumber(stats.multiply.base), math.bignumber(stats.zone.current));
        tempData2 = mainCalculate(math.bignumber(1), math.bignumber(stats.multiply.lost), math.bignumber(stats.zone.current)),
        tempData3 = mainCalculate(math.bignumber(1), math.pow(math.bignumber(stats.multiply.base), 2), math.bignumber(stats.zone.current));
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
        max: 120 * 60,
        round: true,
      });
      
      data = {
        damage: {
          value: math.multiply(math.divide(math.multiply(tempData3, math.bignumber(Math.configRandom({
            min: 0.5,
            max: 1.5,
          }))), 60), tempDamageSpeed),
          //(() * 60) / (tds * 60)
          chance: {
            percent: Math.configRandom({
              min: 0.01,
              max: 5 * (stats.zone.current <= stats.other.maxZone ? stats.zone.current / 20 : 5),
            }),
            amount: math.bignumber(Math.configRandom({
              min: 1.5,
              max: 4.5 + (stats.zone.current <= stats.other.maxZone ? stats.zone.current / (stats.other.maxZone / 5.5) : 5.5),
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
                max: 5 * (stats.zone.current <= stats.other.maxZone ? stats.zone.current / 20 : 5),
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
            min: 0.5,
            max: 1.5,
          }))),
          chance: {
            percent: Math.configRandom({
              min: 0.01,
              max: 5 * (stats.zone.current <= stats.other.maxZone ? stats.zone.current / 20 : 5),
            }),
            amount: math.bignumber(Math.configRandom({
              min: 1.5,
              max: 4.5 + (stats.zone.current <= stats.other.maxZone ? stats.zone.current / (stats.other.maxZone / 5.5) : 5.5),
            })),
          },
        },
        hp: {
          max: math.multiply(tempData, 25, math.bignumber(Math.configRandom({
            min: 0.5,
            max: 1.5,
          }))),
          regen: {
            rate: math.multiply(math.divide(math.multiply(tempData, math.bignumber(Math.configRandom({
              min: 0.5,
              max: 1.5,
            }))), 60 * 5), tempHpRegenSpeed),
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
            max: math.multiply(tempData, 10, math.bignumber(Math.configRandom({
              min: 0.5,
              max: 1.5,
            }))),
            regen: {
              rate: math.multiply(math.divide(math.multiply(tempData, math.bignumber(Math.configRandom({
                min: 0.5,
                max: 1.5,
              }))), 60 * 5), tempManaRegenSpeed),
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
            min: 0.5,
            max: 1.5,
          }))),
          xp: math.multiply(tempData2, math.bignumber(stats.other.xpMulRandom), math.bignumber(Math.configRandom({
            min: 0.5,
            max: 1.5,
          }))),
        },
        level: Math.configRandom({
          min: stats.zone.current <= 0 ? 0 : stats.zone.current - 5 >= 0 ? stats.zone.current - 5 : 0,
          max: stats.zone.current + 5,
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
    if (math.compare(returnData.defenseAmount, 0).toNumber() <= 0) {
      returnData.defenseAmount = 1;
    }
    returnData.realDamage = math.divide(returnData.damageAmount, returnData.defenseAmount);
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
    if (math.compare(returnData.defenseAmount, 0).toNumber() <= 0) {
      returnData.defenseAmount = 1;
    }
    returnData.realDamage = math.divide(returnData.damageAmount, returnData.defenseAmount);
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
        hero.dead[loopCount].death.bool = true;
        hero.inactive.push(hero.dead[loopCount]);
        hero.dead.splice(loopCount, 1);
        continue;
      }
      hero.dead[loopCount].revive(instant);
    }
  }
  function reviveAllEnemy(instant) {
    for (var loopCount = enemy.dead.length - 1; loopCount >= 0; --loopCount) {
      if (enemy.dead[loopCount].death.total >= enemy.dead[loopCount].death.max.total) {
        enemy.dead[loopCount].death.bool = true;
        enemy.inactive.push(enemy.dead[loopCount]);
        enemy.dead.splice(loopCount, 1);
        continue;
      }
      enemy.dead[loopCount].revive(instant);
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
  
  function prestige() {
    
  }
  
  //Initialize
  $(document).ready(function() {
    setInterval(function() {
      if (forceStop) {
        return;
      }
      for (var i = 0; i < 30; i ++) {
        main();
      }
      heroRender();
      enemyRender();
      shopRender();
      uiRender();
    }, 500);
  });
  
  if (storeData) {
    var loopCount, tempHero;
    for (loopCount = 0; loopCount < storeData.hero.active.length; loopCount ++) {
      tempHero = new Hero();
      tempHero.apply(storeData.hero.active[loopCount]);
      hero.active.push(tempHero);
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
    stats.zone.beat --;
    alert(`Hello there !!!
First time here, right? I will tell you some quick tips !

This is prototype version, so you may expect some bugs and locked features

Click on enemy to deal damage.

Click on "-------- Hero 0 --------" or "-------- Enemy 0 --------" to view full stats.

Hover on stats to view many useful things (when pointer turn to hand).

Click on it to buy based on total buy amount you want to buy (did not support max buy yet)

Keep it like that with click damage and stuff.

And right click on stats area that show up stats to go back.

And HAVE FUN !!!

P.S: Turn on console to view this message again (F12), and if you saw any error, please tell me.

Warning: did not have save feature yet so if you reload the page it will wipe out your progress !!!
    `);
  }
  fillEnemy();
  
  //Input
  window.onbeforeunload = function() {
    if (!noSave) {
      save();
    }
  };
  $("div#shopData").contextmenu(function() {
    shopType = "upgrade";
    shopObj = 0;
    return false;
  });
  var inputBuyAmount = $("input#buyAmount")
  inputBuyAmount.change(function() {
    stats.other.buyAmount = Number(inputBuyAmount.val());
  });
  var inputCurrentZone = $("input#currentZone")
  inputCurrentZone.change(function() {
    killAllEnemy(true);
    stats.zone.current = Number(inputCurrentZone.val());
    stats.enemy.death.required.count = 0;
    enemyRender();
  });
  
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
      stats.enemy.death.required.count = 0;
      if (stats.zone.current > 0) {
        stats.zone.current = stats.zone.beat;
        inputCurrentZone.val(stats.zone.current);
        //alert("All of you heroes were killed, pleae go back to previous zone :(");
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
    if (stats.zone.beat >= stats.other.nextHero && stats.hero.count <= 100) {
      stats.hero.count ++;
      createHero();
      stats.other.nextHero += 10;
    }
    if (stats.zone.beat >= stats.other.nextEnemy && stats.enemy.count <= 100) {
      stats.enemy.count ++;
      stats.enemy.death.required.max += 5;
      stats.other.nextEnemy += 10;
    }
    if (stats.enemy.death.required.count >= stats.enemy.death.required.max) {
      stats.enemy.death.required.count = 0;
      if (stats.zone.beat < stats.zone.current) {
        stats.zone.beat = stats.zone.current;
        stats.zone.current ++;
        inputCurrentZone.attr({
          max: stats.zone.current,
        });
        inputCurrentZone.val(stats.zone.current);
      }
    }
  }
  function updateBonus(bonusData) {
    for (var bonusCount = 0; bonusCount < bonusData.length; bonusCount ++) {
      bonusData[bonusCount].location = bonusCount;
      bonusData[bonusCount].call();
    }
  }
  
  //Renderer
  function heroRender() {
    var tempString = "", loopCount;
    for (loopCount = 0; loopCount < hero.active.length; loopCount ++) {
      tempString +=
`<span onclick="stats.shopType = 'hero'; stats.shopObj = hero.active[${loopCount}];" class="pointerHover">---------Hero ${loopCount}--------</span> <br/>
<span title="${math.bignumber.format(hero.active[loopCount].hp.value)} / ${math.bignumber.format(hero.active[loopCount].hp.max.total)}">Hp: ${Number(math.multiply(math.divide(hero.active[loopCount].hp.value, hero.active[loopCount].hp.max.total), 100).toFixed(5))}%</span> <br/>
<span title="${math.bignumber.format(hero.active[loopCount].magic.mana.value)} / ${math.bignumber.format(hero.active[loopCount].magic.mana.max.total)}">Mana: ${Number(math.multiply(math.divide(hero.active[loopCount].magic.mana.value, hero.active[loopCount].magic.mana.max.total), 100).toFixed(5))}%</span> <br/>
<span title="${math.bignumber.format(hero.active[loopCount].xp.value)} / ${math.bignumber.format(hero.active[loopCount].xp.max.total)}">Xp: ${Number(math.multiply(math.divide(hero.active[loopCount].xp.value, hero.active[loopCount].xp.max.total), 100).toFixed(5))}%</span> | Level: ${hero.active[loopCount].xp.max.count} <br/>
Cool down: ${hero.active[loopCount]._.coolDown.damage} | ${hero.active[loopCount]._.coolDown.hp} | ${hero.active[loopCount]._.coolDown.mana} <br/>
`;
    }
    for (loopCount = 0; loopCount < hero.dead.length; loopCount ++) {
      tempString +=
`<span onclick="stats.shopType = 'hero'; stats.shopObj = hero.dead[${loopCount}];" class="pointerHover">---------Dead hero ${loopCount}--------</span> <br/>
Cool down: ${hero.dead[loopCount]._.coolDown.death} <br/>
`;
    }
    $("div#heroData").html(tempString);
  }
  function enemyRender() {
    var tempString = "", loopCount;
    for (loopCount = 0; loopCount < enemy.active.length; loopCount ++) {
      tempString +=
`<span onclick="stats.shopType = 'enemy'; stats.shopObj = enemy.active[${loopCount}];" class="pointerHover">---------Enemy ${loopCount}--------</span>  <br/>
<div onclick="playerAttack(enemy.active[${loopCount}])"><span title="${math.bignumber.format(enemy.active[loopCount].hp.value)} / ${math.bignumber.format(enemy.active[loopCount].hp.max.total)}">Hp: ${Number(math.multiply(math.divide(enemy.active[loopCount].hp.value, enemy.active[loopCount].hp.max.total), 100).toFixed(5))}%</span> <br/>
<span title="${math.bignumber.format(enemy.active[loopCount].magic.mana.value)} / ${math.bignumber.format(enemy.active[loopCount].magic.mana.max.total)}">Mana: ${Number(math.multiply(math.divide(enemy.active[loopCount].magic.mana.value, enemy.active[loopCount].magic.mana.max.total), 100).toFixed(5))}%</span> <br/>
Level: ${enemy.active[loopCount].level} <br/>
Cool down: ${enemy.active[loopCount]._.coolDown.damage} | ${enemy.active[loopCount]._.coolDown.hp} | ${enemy.active[loopCount]._.coolDown.mana}</div>
`;
    }
    for (loopCount = 0; loopCount < enemy.dead.length; loopCount ++) {
      tempString +=
`<span onclick="stats.shopType = 'enemy'; stats.shopObj = enemy.dead[${loopCount}];" class="pointerHover">---------Dead enemy ${loopCount}--------</span> <br/>
Cool down: ${enemy.dead[loopCount]._.coolDown.death} <br/>
`;
    }
    $("div#enemyData").html(tempString);
  }
  function shopRender() {
    var tempRenderString = "", loopCount;
    switch (stats.shopType) {
      case "upgrade": {
        for (loopCount = 0; loopCount < upgrade.wait.length; loopCount ++) {
          tempRenderString +=
`<span>--- ${upgrade.wait[loopCount].title} | Id: ${loopCount} ---</span> <br/>
Detail: ${upgrade.wait[loopCount].detail} <br/>
`;
        }
        $("div#shopData").html(tempRenderString);
      }
      break;
      case "hero": {
        if (stats.shopObj.death.bool === true) {
          stats.shopObj = hero.active[0];
        }
        tempRenderString +=
`<span>--- ${stats.shopObj._.coolDown.death <= 0 ? "Hero" : "Dead hero"} ${stats.shopObj.hash} ---</span> <br/>

Hp: ${math.bignumber.format(stats.shopObj.hp.value)} / <span onclick="stats.shopObj.upgrade(['hp', 'max'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.hp.max.count}
Increment: x${Number(stats.shopObj.hp.max.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['hp', 'max'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.hp.max.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.hp.max.plus)}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.hp.max.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.hp.max.cost.plus)}
">${math.bignumber.format(stats.shopObj.hp.max.total)}</span> <br/>

Hp regen: <span onclick="stats.shopObj.upgrade(['hp', 'regen', 'rate'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.hp.regen.rate.count}
Increment: x${Number(stats.shopObj.hp.regen.rate.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['hp', 'regen', 'rate'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.hp.regen.rate.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.hp.regen.rate.plus)}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.hp.regen.rate.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.hp.regen.rate.cost.plus)}
">${math.bignumber.format(stats.shopObj.hp.regen.rate.total)}</span> / 

<span onclick="stats.shopObj.upgrade(['hp', 'regen', 'speed'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.hp.regen.speed.count} / ${stats.shopObj.hp.regen.speed.max}
Increment: -${Number(stats.shopObj.hp.regen.speed.increment.toFixed(5))} frame(s)
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['hp', 'regen', 'speed'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.hp.regen.speed.multiply.toFixed(5))} | ${Number(stats.shopObj.bonus.hp.regen.speed.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.hp.regen.speed.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.hp.regen.speed.cost.plus)}
">${Number(stats.shopObj.hp.regen.speed.total.toFixed(5))} frame(s)</span> <br/>

Mana: ${math.bignumber.format(stats.shopObj.magic.mana.value)} / <span onclick="stats.shopObj.upgrade(['magic', 'mana', 'max'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.magic.mana.max.count}
Increment: x${Number(stats.shopObj.magic.mana.max.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['magic', 'mana', 'max'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.magic.mana.max.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.magic.mana.max.plus)}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.magic.mana.max.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.magic.mana.max.cost.plus)}
">${math.bignumber.format(stats.shopObj.magic.mana.max.total)}</span> <br/>

Mana regen: <span onclick="stats.shopObj.upgrade(['magic', 'mana', 'regen', 'rate'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.magic.mana.regen.rate.count}
Increment: x${Number(stats.shopObj.magic.mana.regen.rate.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['magic', 'mana', 'regen', 'rate'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.magic.mana.regen.rate.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.magic.mana.regen.rate.plus)}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.magic.mana.regen.rate.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.magic.mana.regen.rate.cost.plus)}
">${math.bignumber.format(stats.shopObj.magic.mana.regen.rate.total)}</span> / 

<span onclick="stats.shopObj.upgrade(['magic', 'mana', 'regen', 'speed'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.magic.mana.regen.speed.count} / ${stats.shopObj.magic.mana.regen.speed.max}
Increment: -${Number(stats.shopObj.magic.mana.regen.speed.increment.toFixed(5))} frame(s)
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['magic', 'mana', 'regen', 'speed'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.magic.mana.regen.speed.multiply.toFixed(5))} | ${Number(stats.shopObj.bonus.magic.mana.regen.speed.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.magic.mana.regen.speed.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.magic.mana.regen.speed.cost.plus)}
">${Number(stats.shopObj.magic.mana.regen.speed.total.toFixed(5))} frame(s)</span> <br/>

Xp: ${math.bignumber.format(stats.shopObj.xp.value)} / <span class="pointerHover" title="
Increment: x${Number(stats.shopObj.xp.max.increment.toFixed(5))}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.xp.max.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.xp.max.plus)}
">${math.bignumber.format(stats.shopObj.xp.max.total)}</span> | Level: ${stats.shopObj.xp.max.count} <br/>

<span onclick="stats.shopObj.upgrade(['damage', 'value'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.damage.value.count}
Increment: x${Number(stats.shopObj.damage.value.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['damage', 'value'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.value.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.damage.value.plus)}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.value.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.damage.value.cost.plus)}
">Damage: ${math.bignumber.format(stats.shopObj.damage.value.total)}</span> <br/>

<span onclick="stats.shopObj.upgrade(['damage', 'chance', 'percent'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.damage.chance.percent.count} / ${stats.shopObj.damage.chance.percent.max}
Increment: +${Number(stats.shopObj.damage.chance.percent.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['damage', 'chance', 'percent'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.damage.chance.percent.multiply.toFixed(5))} | +${Number(stats.shopObj.bonus.damage.chance.percent.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.chance.percent.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.damage.chance.percent.cost.plus)}
">Critical chance: ${Number(stats.shopObj.damage.chance.percent.total.toFixed(5))}%</span> <br/>

<span onclick="stats.shopObj.upgrade(['damage', 'chance', 'amount'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.damage.chance.amount.count} / ${stats.shopObj.damage.chance.amount.max}
Increment: +${Number(stats.shopObj.damage.chance.amount.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['damage', 'chance', 'amount'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.chance.amount.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.damage.chance.amount.plus)}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.chance.amount.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.damage.chance.amount.cost.plus)}
">Critical amount: x${stats.shopObj.damage.chance.amount.total.toFixed(5)}</span> <br/>

<span onclick="stats.shopObj.upgrade(['damage', 'speed'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.damage.speed.count} / ${stats.shopObj.damage.speed.max}
Increment: -${Number(stats.shopObj.damage.speed.increment.toFixed(5))} frame(s)
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['damage', 'speed'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.damage.speed.multiply.toFixed(5))} | ${Number(stats.shopObj.bonus.damage.speed.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.speed.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.damage.speed.cost.plus)}
">Attack speed: ${Number(stats.shopObj.damage.speed.total.toFixed(5))} frame(s)</span> <br/>

<span onclick="stats.shopObj.upgrade(['defense', 'value'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.defense.value.count}
Increment: x${Number(stats.shopObj.defense.value.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['defense', 'value'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.defense.value.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.defense.value.plus)}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.defense.value.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.defense.value.cost.plus)}
">Defense: ${math.bignumber.format(stats.shopObj.defense.value.total)}</span> <br/>

<span onclick="stats.shopObj.upgrade(['defense', 'chance', 'percent'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.defense.chance.percent.count} / ${stats.shopObj.defense.chance.percent.max}
Increment: +${Number(stats.shopObj.defense.chance.percent.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['defense', 'chance', 'percent'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.defense.chance.percent.multiply.toFixed(5))} | +${Number(stats.shopObj.bonus.defense.chance.percent.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.defense.chance.percent.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.defense.chance.percent.cost.plus)}
">Block chance: ${Number(stats.shopObj.defense.chance.percent.total.toFixed(5))}%</span> <br/>

<span onclick="stats.shopObj.upgrade(['defense', 'chance', 'amount'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.defense.chance.amount.count} / ${stats.shopObj.defense.chance.amount.max}
Increment: +${Number(stats.shopObj.defense.chance.amount.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['defense', 'chance', 'amount'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(stats.shopObj.bonus.defense.chance.amount.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.defense.chance.amount.plus)}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.defense.chance.amount.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.defense.chance.amount.cost.plus)}
">Block amount: x${stats.shopObj.defense.chance.amount.total.toFixed(5)}</span> <br/>

<span onclick="stats.shopObj.upgrade(['damage', 'multiple', 'value'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.damage.multiple.value.count} / ${stats.shopObj.damage.multiple.value.max}
Increment: +${stats.shopObj.damage.multiple.value.increment} hit(s)
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['damage', 'multiple', 'value'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.damage.multiple.value.multiply.toFixed(5))} | +${stats.shopObj.bonus.damage.multiple.value.plus}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.multiple.value.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.damage.multiple.value.cost.plus)}
">Multiple: ${stats.shopObj.damage.multiple.value.total} hit(s)</span> <br/>

<span onclick="stats.shopObj.upgrade(['damage', 'multiple', 'chance', 'percent'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.damage.multiple.chance.percent.count} / ${stats.shopObj.damage.multiple.chance.percent.max}
Increment: +${Number(stats.shopObj.damage.multiple.chance.percent.increment.toFixed(5))}
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['damage', 'multiple', 'chance', 'percent'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.damage.multiple.chance.percent.multiply.toFixed(5))} | +${Number(stats.shopObj.bonus.damage.multiple.chance.percent.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.multiple.chance.percent.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.damage.multiple.chance.percent.cost.plus)}
">Splash chance: ${Number(stats.shopObj.damage.multiple.chance.percent.total.toFixed(5))}%</span> <br/>

<span onclick="stats.shopObj.upgrade(['damage', 'multiple', 'chance', 'amoount'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.damage.multiple.chance.amount.count} / ${stats.shopObj.damage.multiple.chance.amount.max}
Increment: +${stats.shopObj.damage.multiple.chance.amount.increment} hit(s)
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['damage', 'multiple', 'chance', 'amount'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.damage.multiple.chance.amount.multiply.toFixed(5))} | +${stats.shopObj.bonus.damage.multiple.chance.amount.plus}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.multiple.chance.amount.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.damage.multiple.chance.amount.cost.plus)}
">Splash amount: ${stats.shopObj.damage.multiple.chance.amount.total} hit(s)</span> <br/>

<span onclick="stats.shopObj.upgrade(['death', 'speed'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.death.speed.count} / ${stats.shopObj.death.speed.max}
Increment: -${Number(stats.shopObj.death.speed.increment.toFixed(5))} frame(s)
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['death', 'speed'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.death.speed.multiply.toFixed(5))} | ${Number(stats.shopObj.bonus.death.speed.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.death.speed.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.death.speed.cost.plus)}
">Revive speed: ${Number(stats.shopObj.death.speed.total.toFixed(5))} frame(s)</span> <br/>

Revive count: ${hero.active[0].death.total} / <span onclick="stats.shopObj.upgrade(['death', 'max'], stats.other.buyAmount)" class="pointerHover" title="Count: ${stats.shopObj.death.max.count} / ${stats.shopObj.death.max.max}
Increment: +${stats.shopObj.death.max.increment} time(s)
Cost: ${math.bignumber.format(stats.shopObj.upgrade(['death', 'max'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(stats.shopObj.bonus.death.max.multiply.toFixed(5))} | +${stats.shopObj.bonus.death.max.plus}
Cost bonus: x${math.bignumber.format(stats.shopObj.bonus.death.max.cost.multiply)} | ${math.bignumber.format(stats.shopObj.bonus.death.max.cost.plus)}
">${stats.shopObj.death.max.total}</span> <br/>
`;
        $("div#shopData").html(tempRenderString);
      }
      break;
      case "enemy": {
        if (stats.shopObj.death.bool === true) {
          stats.shopObj = enemy.active[0];
        }
        tempRenderString +=
`<span>--- ${stats.shopObj._.coolDown.death <= 0 ? "Enemy" : "Dead enemy"} ${stats.shopObj.hash} ---</span> <br/>

Hp: ${math.bignumber.format(stats.shopObj.hp.value)} / <span class="pointerHover" title="Bonus: x${math.bignumber.format(stats.shopObj.bonus.hp.max.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.hp.max.plus)}
">${math.bignumber.format(stats.shopObj.hp.max.total)}</span> <br/>

Hp regen: <span class="pointerHover" title="Bonus: x${math.bignumber.format(stats.shopObj.bonus.hp.regen.rate.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.hp.regen.rate.plus)}
">${math.bignumber.format(stats.shopObj.hp.regen.rate.total)}</span> / 

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.hp.regen.speed.multiply.toFixed(5))} | ${Number(stats.shopObj.bonus.hp.regen.speed.plus.toFixed(5))}
">${Number(stats.shopObj.hp.regen.speed.total.toFixed(5))} frame(s)</span> <br/>

Mana: ${math.bignumber.format(stats.shopObj.magic.mana.value)} / <span class="pointerHover" title="Bonus: x${math.bignumber.format(stats.shopObj.bonus.magic.mana.max.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.magic.mana.max.plus)}
">${math.bignumber.format(stats.shopObj.magic.mana.max.total)}</span> <br/>

Mana regen: <span class="pointerHover" title="Bonus: x${math.bignumber.format(stats.shopObj.bonus.magic.mana.regen.rate.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.magic.mana.regen.rate.plus)}
">${math.bignumber.format(stats.shopObj.magic.mana.regen.rate.total)}</span> / 

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.magic.mana.regen.speed.multiply.toFixed(5))} | ${Number(stats.shopObj.bonus.magic.mana.regen.speed.plus.toFixed(5))}
">${Number(stats.shopObj.magic.mana.regen.speed.total.toFixed(5))} frame(s)</span> <br/>

Level: ${stats.shopObj.level} <br/>

Money drop: ${math.bignumber.format(stats.shopObj.loot.money.total)} <br/>

Xp drop: ${math.bignumber.format(stats.shopObj.loot.xp.total)} </br>

<span class="pointerHover" title="Bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.value.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.damage.value.plus)}
">Damage: ${math.bignumber.format(stats.shopObj.damage.value.total)}</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.damage.chance.percent.multiply.toFixed(5))} | +${Number(stats.shopObj.bonus.damage.chance.percent.plus.toFixed(5))}
">Critical chance: ${Number(stats.shopObj.damage.chance.percent.total.toFixed(5))}%</span> <br/>

<span class="pointerHover" title="Bonus: x${math.bignumber.format(stats.shopObj.bonus.damage.chance.amount.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.damage.chance.amount.plus)}
">Critical amount: x${stats.shopObj.damage.chance.amount.total.toFixed(5)}</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.damage.speed.multiply.toFixed(5))} | ${Number(stats.shopObj.bonus.damage.speed.plus.toFixed(5))}
">Attack speed: ${Number(stats.shopObj.damage.speed.total.toFixed(5))} frame(s)</span> <br/>

<span class="pointerHover" title="Bonus: x${math.bignumber.format(stats.shopObj.bonus.defense.value.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.defense.value.plus)}
">Defense: ${math.bignumber.format(stats.shopObj.defense.value.total)}</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.defense.chance.percent.multiply.toFixed(5))} | +${Number(stats.shopObj.bonus.defense.chance.percent.plus.toFixed(5))}
">Block chance: ${Number(stats.shopObj.defense.chance.percent.total.toFixed(5))}%</span> <br/>

<span class="pointerHover" title="Bonus: x${math.bignumber.format(stats.shopObj.bonus.defense.chance.amount.multiply)} | +${math.bignumber.format(stats.shopObj.bonus.defense.chance.amount.plus)}
">Block amount: x${stats.shopObj.defense.chance.amount.total.toFixed(5)}</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.damage.multiple.value.multiply.toFixed(5))} | +${stats.shopObj.bonus.damage.multiple.value.plus}
">Multiple: ${stats.shopObj.damage.multiple.value.total} hit(s)</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.damage.multiple.chance.percent.multiply.toFixed(5))} | +${Number(stats.shopObj.bonus.damage.multiple.chance.percent.plus.toFixed(5))}
">Splash chance: ${Number(stats.shopObj.damage.multiple.chance.percent.total.toFixed(5))}%</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.damage.multiple.chance.amount.multiply.toFixed(5))} | +${stats.shopObj.bonus.damage.multiple.chance.amount.plus}
">Splash amount: ${stats.shopObj.damage.multiple.chance.amount.total} hit(s)</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.death.speed.multiply.toFixed(5))} | ${Number(stats.shopObj.bonus.death.speed.plus.toFixed(5))}
">Revive speed: ${Number(stats.shopObj.death.speed.total.toFixed(5))} frame(s)</span> <br/>

Revive count: ${stats.shopObj.death.total} / <span class="pointerHover" title="Bonus: x${Number(stats.shopObj.bonus.death.max.multiply.toFixed(5))} | +${stats.shopObj.bonus.death.max.plus}
">${stats.shopObj.death.max.total}</span> <br/>
`;
        $("div#shopData").html(tempRenderString);
      }
      break;
    }
  }
  function uiRender() {
    var tempRenderString = "", loopCount;
    tempRenderString = `Money: ${math.bignumber.format(stats.money.current)}`;
    $("div#uiData").html(tempRenderString);
    tempRenderString = `Required kill: ${stats.zone.current <= stats.zone.beat ? "done" : stats.enemy.death.required.count} / ${stats.enemy.death.required.max}`;
    $("span#requiredKill").html(tempRenderString);
    tempRenderString = `Beated zone: ${stats.zone.beat}`;
    $("span#beatedZone").html(tempRenderString);
    tempRenderString = `Hero: ${hero.active.length + hero.dead.length} | Enemy: ${enemy.active.length + enemy.dead.length}`;
    $("span#heroVsEnemy").html(tempRenderString);
    tempRenderString =
`<span onclick="upgradePlayer(['damage', 'value'], stats.other.buyAmount)" class="pointerHover" title="Count: ${player.damage.value.count}
Cost: ${math.bignumber.format(upgradePlayer(['damage', 'value'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(bonus.player.damage.value.multiply)} | +${math.bignumber.format(bonus.player.damage.value.plus)}
Cost bonus: x${math.bignumber.format(bonus.player.damage.value.cost.multiply)} | ${math.bignumber.format(bonus.player.damage.value.cost.plus)}
">Click damange: ${math.bignumber.format(player.damage.value.total)}</span> <br/>
<span title="Count: ${player.damage.chance.percent.count}
">Critical click chance: ${Number(player.damage.chance.percent.total.toFixed(5))}%</span> <br/>
<span title="Count: ${player.damage.chance.amount.count}
">Critical click amount: x${Number(player.damage.chance.percent.total.toFixed(5))}</span> <br/>
`;
    $("div#clickData").html(tempRenderString);
  }
  
  console.log(`
  This is prototype version, so you may expect some bugs and locked features
  
  Click on enemy to deal damage.
  
  Click on "-------- Hero 0 --------" or "-------- Enemy 0 --------" to view full stats.
  
  Hover on stats to view many useful things (when pointer turn to hand).
  
  Click on it to buy based on total buy amount you want to buy (did not support max buy yet)
  
  Keep it like that with click damage and stuff.
  
  And right click on stats area that show up stats to go back.
  
  If you saw any error, please tell me.
  `);
//})();
