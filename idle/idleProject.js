//(function() {
  math.config({
    number: 'BigNumber',
    precision: 64 + 6,
  });
  
  //Main variable code
  var stats = {}, achievement = [], options = {}, task = [],
      enemy = {
        active: [],
        dead: [],
        wait: [],
      }, hero = {
        active: [],
        dead: [],
        wait: [],
      }, upgrade = {}, bonus = {},
      equipment = [], player = {}, temp = {};
  
  //Stats data
  (function() {
    stats.level = {
      base: 10,
      lost: 6.1,
    };
    stats.multiply = {};
    stats.multiply.base = math.bignumber(1.2);
    stats.multiply.lost = lostCalculate(stats.multiply.base, stats.level.base, stats.level.lost);
    stats.zone = {
      highest: 0,
      current: 0,
      beat: 0,
    };
    stats.prestige = {
      current: 0,
      total: 0,
      multiply: math.pow(lostCalculate(stats.multiply.base, 10, 3.9), 50),
    };
    stats.clicks = {
      current: 0,
      total: 0,
    };
    stats.money = {
      current: math.bignumber(0),
      total: math.bignumber(0),
      reset: math.bignumber(0),
      offline: math.bignumber(0),
      online: math.bignumber(0),
    };
    stats.time = {
      total: 0,
      active: 0,
      idle: 0,
      offline: 0,
    };
    stats.upgrade = {
      current: 0,
      total: 0,
      spent: {
        current: math.bignumber(0),
        total: math.bignumber(0),
      },
    };
    stats.hero = {
      count: 1,
      current: 0,
      total: 0,
      death: {
        current: 0,
        total: 0,
        time: {
          current: 0, //Wait time for revive
          total: 0,
        },
      },
      damage: {
        perSecond: math.bignumber(0),
        current: math.bignumber(0),
        offline: math.bignumber(0),
        total: math.bignumber(0),
        count: {
          current: 0,
          total: 0,
        },
        chance: {
          current: math.bignumber(0),
          total: math.bignumber(0),
          count: {
            current: 0,
            total: 0,
          },
          highest: {
            chance: 0,
            amount: math.bignumber(0),
          },
        },
      },
      defense: {
        perSecond: math.bignumber(0),
        current: math.bignumber(0),
        total: math.bignumber(0),
        chance: {
          current: math.bignumber(0),
          total: math.bignumber(0),
          count: {
            current: 0,
            total: 0,
          },
          highest: {
            chance: 0,
            amount: math.bignumber(0),
          },
        },
      },
    };
    stats.enemy = {
      count: 1,
      current: 0,
      total: 0,
      death: {
        current: 0,
        total: 0,
        required: {
          count: 0,
          max: 10,
        },
      },
      boss: {
        current: 0,
        total: 0,
        death: {
          current: 0,
          total: 0,
        },
        damage: {
          perSecond: math.bignumber(0),
          current: math.bignumber(0),
          offline: math.bignumber(0),
          total: math.bignumber(0),
          count: {
            current: 0,
            total: 0,
          },
          chance: {
            current: math.bignumber(0),
            total: math.bignumber(0),
            count: {
              current: 0,
              total: 0,
            },
            highest: {
              chance: 0,
              amount: math.bignumber(0),
            },
          },
        },
        defense: {
          perSecond: math.bignumber(0),
          current: math.bignumber(0),
          total: math.bignumber(0),
          chance: {
            current: math.bignumber(0),
            total: math.bignumber(0),
            count: {
              current: 0,
              total: 0,
            },
            highest: {
              chance: 0,
              amount: math.bignumber(0),
            },
          },
        },
      },
      damage: {
        perSecond: math.bignumber(0),
        current: math.bignumber(0),
        total: math.bignumber(0),
        count: {
          current: 0,
          total: 0,
        },
        chance: {
          current: math.bignumber(0),
          total: math.bignumber(0),
          count: {
            current: 0,
            total: 0,
          },
          highest: {
            chance: 0,
            amount: math.bignumber(0),
          },
        },
      },
      defense: {
        perSecond: math.bignumber(0),
        current: math.bignumber(0),
        total: math.bignumber(0),
        chance: {
          current: math.bignumber(0),
          total: math.bignumber(0),
          count: {
            current: 0,
            total: 0,
          },
          highest: {
            chance: 0,
            amount: math.bignumber(0),
          },
        },
      },
    };
    stats.equipment = {
      current: 0,
      total: 0,
      destroy: 0,
    };
    stats.other = {
      buyAmount: 1,
      xpMulRandom: Math.configRandom({
        min: 1,
        max: 10,
      }),
      nextHero: 10,
      nextEnemy: 15,
    };
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
  })();
  
  //Upgrade data
  (function() {
    upgrade.active = [];
    upgrade.wait = [];
    upgrade.list = [
    
    ];
  })();
  
  //Class
  function Bonus(data) {
    data = data || {};
    this.data = data.data || undefined;
    this.call = function() {data.call(this);} || undefined;
    this.location = 0;
    this.hash = randomString();
  }
  
  function Equipment(data) {
    
  }
  Equipment.prototype = {
    
  };
  
  //Player data
  (function() {
    player.damage = {
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
    };
    updatePlayer();
  })();
  
  function Hero(data) {
    data = data || {};
    this.hash = randomString();
    this.damage = {
      perSecond: undefined,
      value: {
        current: undefined,
        total: undefined,
        base: data.damage.value.base || math.bignumber(0),
        count: 0,
        increment: lostCalculate(data.damage.value.increment, 10, 7) || math.bignumber(0),
        cost: {
          base: data.damage.value.cost.base || math.bignumber(0),
          increment: data.damage.value.cost.increment || math.bignumber(0),
          current: undefined,
          total: undefined,
        },
      },
      chance: {
        percent: {
          current: undefined,
          total: undefined,
          base: data.damage.chance.percent.base || 0,
          count: 0,
          increment: data.damage.chance.percent.increment || 0,
          cost: {
            base: data.damage.chance.percent.cost.base || math.bignumber(0),
            increment: data.damage.chance.percent.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: data.damage.chance.percent.max || 0,
        },
        amount: {
          current: undefined,
          total: undefined,
          base: data.damage.chance.amount.base || math.bignumber(0),
          count: 0,
          increment: data.damage.chance.amount.increment || math.bignumber(0),
          cost: {
            base: data.damage.chance.amount.cost.base || math.bignumber(0),
            increment: data.damage.chance.amount.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: data.damage.chance.amount.max || 0,
        },
      },
      speed: {
        current: undefined,
        total: undefined,
        base: data.damage.speed.base || 0,
        count: 0,
        increment: data.damage.speed.increment || 0,
        cost: {
          base: data.damage.speed.cost.base || math.bignumber(0),
          increment: data.damage.speed.cost.increment || math.bignumber(0),
          current: undefined,
          total: undefined,
        },
        max: data.damage.speed.max || 0,
      },
      multiple: {
        value: {
          current: undefined,
          total: undefined,
          base: data.damage.multiple.value.base || 0,
          count: 0,
          increment: data.damage.multiple.value.increment || 0,
          cost: {
            base: data.damage.multiple.value.cost.base || math.bignumber(0),
            increment: data.damage.multiple.value.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: data.damage.multiple.value.max || 0,
        },
        chance: {
          percent: {
            current: undefined,
            total: undefined,
            base: data.damage.multiple.chance.percent.base || 0,
            count: 0,
            increment: data.damage.multiple.chance.percent.increment || 0,
            cost: {
              base: data.damage.multiple.chance.percent.cost.base || math.bignumber(0),
              increment: data.damage.multiple.chance.percent.cost.increment || math.bignumber(0),
              current: undefined,
              total: undefined,
            },
            max: data.damage.multiple.chance.percent.max || 0,
          },
          amount: {
            current: undefined,
            total: undefined,
            base: data.damage.multiple.chance.amount.base || 0,
            count: 0,
            increment: data.damage.multiple.chance.amount.increment || 0,
            cost: {
              base: data.damage.multiple.chance.amount.cost.base || math.bignumber(0),
              increment: data.damage.multiple.chance.amount.cost.increment || math.bignumber(0),
              current: undefined,
              total: undefined,
            },
            max: data.damage.multiple.chance.amount.max || 0,
          },
        },
      },
    };
    this.defense = {
      perSecond: undefined,
      value: {
        current: undefined,
        total: undefined,
        base: data.defense.value.base || math.bignumber(0),
        count: 0,
        increment: lostCalculate(data.defense.value.increment, 10, 7) || math.bignumber(0),
        cost: {
          base: data.defense.value.cost.base || math.bignumber(0),
          increment: data.defense.value.cost.increment || math.bignumber(0),
          current: undefined,
          total: undefined,
        },
      },
      chance: {
        percent: {
          current: undefined,
          total: undefined,
          base: data.defense.chance.percent.base || 0,
          count: 0,
          increment: data.defense.chance.percent.increment || 0,
          cost: {
            base: data.defense.chance.percent.cost.base || math.bignumber(0),
            increment: data.defense.chance.percent.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: data.defense.chance.percent.max || 0,
        },
        amount: {
          current: undefined,
          total: undefined,
          base: data.defense.chance.amount.base || math.bignumber(0),
          count: 0,
          increment: data.defense.chance.amount.increment || math.bignumber(0),
          cost: {
            base: data.defense.chance.amount.cost.base || math.bignumber(0),
            increment: data.defense.chance.amount.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: data.defense.chance.amount.max || 0,
        },
      },
    };
    this.xp = {
      value: undefined,
      max: {
        current: undefined,
        total: undefined,
        base: data.xp.max.base || math.bignumber(0),
        count: 0,
        increment: data.xp.max.increment || math.bignumber(0),
      },
    };
    this.hp = {
      value: undefined,
      max: {
        current: undefined,
        total: undefined,
        base: data.hp.max.base || math.bignumber(0),
        count: 0,
        increment: lostCalculate(data.hp.max.increment, 10, 7) || math.bignumber(0),
        cost: {
          base: data.hp.max.cost.base || math.bignumber(0),
          increment: data.hp.max.cost.increment || math.bignumber(0),
          current: undefined,
          total: undefined,
        },
      },
      regen: {
        rate: {
          current: undefined,
          total: undefined,
          base: data.hp.regen.rate.base || math.bignumber(0),
          count: 0,
          increment: lostCalculate(data.hp.regen.rate.increment, 10, 7) || math.bignumber(0),
          cost: {
            base: data.hp.regen.rate.cost.base || math.bignumber(0),
            increment: data.hp.regen.rate.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
        },
        speed: {
          current: undefined,
          total: undefined,
          base: data.hp.regen.speed.base || 0,
          count: 0,
          increment: data.hp.regen.speed.increment || 0,
          cost: {
            base: data.hp.regen.speed.cost.base || math.bignumber(0),
            increment: data.hp.regen.speed.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: data.hp.regen.speed.max || 0,
        },
      },
    };
    this.magic = {
      spell: {
        data: [],
        max: {
          current: undefined,
          total: undefined,
          base: data.magic.spell.max.base || 0,
          count: 0,
          increment: data.magic.spell.max.increment || 0,
          cost: {
            base: data.magic.spell.max.cost.base || math.bignumber(0),
            increment: data.magic.spell.max.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
          max: data.magic.spell.max.max || 0
        },
      },
      mana: {
        value: undefined,
        max: {
          current: undefined,
          total: undefined,
          base: data.magic.mana.max.base || math.bignumber(0),
          count: 0,
          increment: lostCalculate(data.magic.mana.max.increment, 10, 7) || math.bignumber(0),
          cost: {
            base: data.magic.mana.max.cost.base || math.bignumber(0),
            increment: data.magic.mana.max.cost.increment || math.bignumber(0),
            current: undefined,
            total: undefined,
          },
        },
        regen: {
          rate: {
            current: undefined,
            total: undefined,
            base: data.magic.mana.regen.rate.base || math.bignumber(0),
            count: 0,
            increment: lostCalculate(data.magic.mana.regen.rate.increment, 10, 7) || math.bignumber(0),
            cost: {
              base: data.magic.mana.regen.rate.cost.base || math.bignumber(0),
              increment: data.magic.mana.regen.rate.cost.increment || math.bignumber(0),
              current: undefined,
              total: undefined,
            },
          },
          speed: {
            current: undefined,
            total: undefined,
            base: data.magic.mana.regen.speed.base || 0,
            count: 0,
            increment: data.magic.mana.regen.speed.increment || 0,
            cost: {
              base: data.magic.mana.regen.speed.cost.base || math.bignumber(0),
              increment: data.magic.mana.regen.speed.cost.increment || math.bignumber(0),
              current: undefined,
              total: undefined,
            },
            max: data.magic.mana.regen.speed.max || 0,
          },
        },
      },
    };
    this.death = {
      speed: { //Actually this is revive wait time but use "speed" for convenience
        current: undefined,
        total: undefined,
        base: data.death.speed.base || 0,
        count: 0,
        increment: data.death.speed.increment || 0,
        max: data.death.speed.max || 0,
        cost: {
          base: data.death.speed.cost.base || math.bignumber(0),
          increment: data.death.speed.cost.increment || math.bignumber(0),
          current: undefined,
          total: undefined,
        },
      },
      max: {
        current: undefined,
        total: undefined,
        base: data.death.max.base || 0,
        count: 0,
        increment: data.death.max.increment || 0,
        cost: {
          base: data.death.max.cost.base || math.bignumber(0),
          increment: data.death.max.cost.increment || math.bignumber(0),
          current: undefined,
          total: undefined,
        },
        max: data.death.max.max || 0,
      },
      total: 0,
    };
    this.equipment = [];
    this.bonus = {
      data: [],
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
        bool: false,
      },
    };
    this._ = {
      coolDown: {
        damage: 0,
        death: 0,
        hp: 0,
        mana: 0,
      },
      xpBonus: undefined,
    };
  }
  Hero.prototype = {
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
      if (!this._.xpBonus) {
        this._.xpBonus = new Bonus({
          data: {
            hero: this,
            damage: {
              previous: math.bignumber(0),
              increment: lostCalculate(this.damage.value.increment, 10, 3),
            },
            defense: {
              previous: math.bignumber(0),
              increment: lostCalculate(this.defense.value.increment, 10, 3),
            },
            hp: {
              max: {
                previous: math.bignumber(0),
                increment: lostCalculate(this.hp.max.increment, 10, 3),
              },
              rate: {
                previous: math.bignumber(0),
                increment: lostCalculate(this.hp.regen.rate.increment, 10, 3),
              },
            },
            mana: {
              max: {
                previous: math.bignumber(0),
                increment: lostCalculate(this.magic.mana.max.increment, 10, 3),
              },
              rate: {
                previous: math.bignumber(0),
                increment: lostCalculate(this.magic.mana.regen.rate.increment, 10, 3),
              },
            },
          },
          call: function(obj) {
            obj.data.hero.bonus.damage.value.multiply = math.subtract(obj.data.hero.bonus.damage.value.multiply, obj.data.damage.previous);
            obj.data.damage.previous = math.subtract(math.pow(obj.data.damage.increment, obj.data.hero.xp.max.count), 1);
            obj.data.hero.bonus.damage.value.multiply = math.add(obj.data.hero.bonus.damage.value.multiply, obj.data.damage.previous);
            obj.data.hero.bonus.defense.value.multiply = math.subtract(obj.data.hero.bonus.defense.value.multiply, obj.data.defense.previous);
            obj.data.defense.previous = math.subtract(math.pow(obj.data.defense.increment, obj.data.hero.xp.max.count), 1);
            obj.data.hero.bonus.defense.value.multiply = math.add(obj.data.hero.bonus.defense.value.multiply, obj.data.defense.previous);
            obj.data.hero.bonus.hp.max.multiply = math.subtract(obj.data.hero.bonus.hp.max.multiply, obj.data.hp.max.previous);
            obj.data.hp.max.previous = math.subtract(math.pow(obj.data.hp.max.increment, obj.data.hero.xp.max.count), 1);
            obj.data.hero.bonus.hp.max.multiply = math.add(obj.data.hero.bonus.hp.max.multiply, obj.data.hp.max.previous);
            obj.data.hero.bonus.hp.regen.rate.multiply = math.subtract(obj.data.hero.bonus.hp.regen.rate.multiply, obj.data.hp.rate.previous);
            obj.data.hp.rate.previous = math.subtract(math.pow(obj.data.hp.rate.increment, obj.data.hero.xp.max.count), 1);
            obj.data.hero.bonus.hp.regen.rate.multiply = math.add(obj.data.hero.bonus.hp.regen.rate.multiply, obj.data.hp.rate.previous);
            obj.data.hero.bonus.magic.mana.max.multiply = math.subtract(obj.data.hero.bonus.magic.mana.max.multiply, obj.data.mana.max.previous);
            obj.data.mana.max.previous = math.subtract(math.pow(obj.data.mana.max.increment, obj.data.hero.xp.max.count), 1);
            obj.data.hero.bonus.magic.mana.max.multiply = math.add(obj.data.hero.bonus.magic.mana.max.multiply, obj.data.mana.max.previous);
            obj.data.hero.bonus.magic.mana.regen.rate.multiply = math.subtract(obj.data.hero.bonus.magic.mana.regen.rate.multiply, obj.data.mana.rate.previous);
            obj.data.mana.rate.previous = math.subtract(math.pow(obj.data.mana.rate.increment, obj.data.hero.xp.max.count), 1);
            obj.data.hero.bonus.magic.mana.regen.rate.multiply = math.add(obj.data.hero.bonus.magic.mana.regen.rate.multiply, obj.data.mana.rate.previous);
          },
        });
        this.bonus.data.push(this._.xpBonus);
        this.update();
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
      tempCost = math.add(math.multiply(costCalculate(tempObj.cost.base, tempObj.cost.increment, tempObj.count, amount), math.add(tempBonus.cost.multiply, 1)), tempBonus.cost.plus);
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
      objCurrentCal(this.damage.chance.amount, "bignumber");
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
      objCurrentCal(this.defense.chance.amount, "bignumber");
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
  };
  
  function Enemy(data) {
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
  }
  Enemy.prototype = {
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
          if (!tempData) {
            debugger;
          }
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
    enemyRender();
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
      //
      data = {
        damage: {
          value: {
            base: math.multiply(math.divide(math.multiply(tempData3, math.bignumber(Math.configRandom({
              min: 0.5,
              max: 1.5,
            }))), 60), tempDamageSpeed),
            increment: multiplyData,
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 1,
                max: 10,
              })), tempData),
              increment: stats.multiply.base,
            },
          },
          chance: {
            percent: {
              base: Math.configRandom({
                min: 0.01,
                max: 5,
              }),
              increment: Math.configRandom({
                min: 0.01,
                max: 2,
              }),
              max: Math.configRandom({
                min: 0,
                max: 25,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: stats.multiply.base, //Balance this increment
              },
            },
            amount: {
              base: math.bignumber(Math.configRandom({
                min: 1.5,
                max: 2.5,
              })),
              increment: math.bignumber(Math.configRandom({
                min: 0.05,
                max: 1,
              })),
              max: Math.configRandom({
                min: 0,
                max: 50,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: stats.multiply.base, //This too, and those below
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
              min: 0,
              max: 30,
              round: true,
            }),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 50,
                max: 150,
              })), tempData),
              increment: stats.multiply.base,
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
                increment: stats.multiply.base,
              },
            },
            chance: {
              percent: {
                base: Math.configRandom({
                  min: 0.01,
                  max: 5,
                }),
                increment: Math.configRandom({
                  min: 0.01,
                  max: 2,
                }),
                max: Math.configRandom({
                  min: 0,
                  max: 25,
                  round: true,
                }),
                cost: {
                  base: math.multiply(math.bignumber(Math.configRandom({
                    min: 50,
                    max: 150,
                  })), tempData),
                  increment: stats.multiply.base,
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
                  increment: stats.multiply.base,
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
            increment: stats.multiply.lost,
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 1,
                max: 10,
              })), tempData),
              increment: stats.multiply.base,
            },
          },
          chance: {
            percent: {
              base: Math.configRandom({
                min: 0.01,
                max: 5,
              }),
              increment: Math.configRandom({
                min: 0.01,
                max: 2,
              }),
              max: Math.configRandom({
                min: 0,
                max: 25,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: stats.multiply.base,
              },
            },
            amount: {
              base: math.bignumber(Math.configRandom({
                min: 1.5,
                max: 2.5,
              })),
              increment: math.bignumber(Math.configRandom({
                min: 0.05,
                max: 1,
              })),
              max: Math.configRandom({
                min: 0,
                max: 50,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: stats.multiply.base,
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
            increment: stats.multiply.lost,
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 1,
                max: 10,
              })), tempData),
              increment: stats.multiply.base,
            },
          },
          regen: {
            rate: {
              base: math.multiply(math.divide(math.multiply(tempData2, math.pow(lostCalculate(stats.multiply.lost, 10, 3.9), 50), math.bignumber(Math.configRandom({
                min: 0.5,
                max: 1.5,
              }))), 60 * 5), tempHpRegenSpeed),
              increment: stats.multiply.lost,
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 1,
                  max: 10,
                })), tempData),
                increment: stats.multiply.base,
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
                min: 0,
                max: 30,
                round: true,
              }),
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 50,
                  max: 150,
                })), tempData),
                increment: stats.multiply.base,
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
                increment: stats.multiply.base,
              },
            }
          },
          mana: {
            max: {
              base: math.multiply(tempData2, 10, math.bignumber(Math.configRandom({
                min: 0.5,
                max: 1.5,
              }))),
              increment: stats.multiply.lost,
              cost: {
                base: math.multiply(math.bignumber(Math.configRandom({
                  min: 10,
                  max: 200,
                })), tempData),
                increment: stats.multiply.base,
              },
            },
            regen: {
              rate: {
                base: math.multiply(math.divide(math.multiply(tempData2, math.bignumber(Math.configRandom({
                  min: 0.5,
                  max: 1.5,
                }))), 60 * 5), tempManaRegenSpeed),
                increment: stats.multiply.lost,
                cost: {
                  base: math.multiply(math.bignumber(Math.configRandom({
                    min: 5,
                    max: 15,
                  })), tempData),
                  increment: stats.multiply.base,
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
                  min: 0,
                  max: 30,
                  round: true,
                }),
                cost: {
                  base: math.multiply(math.bignumber(Math.configRandom({
                    min: 50,
                    max: 150,
                  })), tempData),
                  increment: stats.multiply.base,
                },
              },
            },
          },
        },
        death: {
          speed: {
            base: tempDeathSpeed,
            increment: Math.configRandom({
              min: 5,
              max: 25,
              round: true,
            }),
            max: Math.configRandom({
              min: 0,
              max: 50,
              round: true,
            }),
            cost: {
              base: math.multiply(math.bignumber(Math.configRandom({
                min: 500,
                max: 1500,
              })), tempData),
              increment: stats.multiply.base,
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
              increment: stats.multiply.base,
            },
          },
        },
        xp: {
          max: {
            base: math.multiply(tempData, math.bignumber(12.5 * stats.other.xpMulRandom), math.bignumber(Math.configRandom({
              min: 0.5,
              max: 1.5,
            }))),
            increment: stats.multiply.base,
          },
        },
      };
      
    }
    if (hero.active.length < stats.hero.count) {
      var tempHero = new Hero(data);
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
              max: 5,
            }),
            amount: math.bignumber(Math.configRandom({
              min: 1.5,
              max: 4.5,
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
                max: 5,
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
              max: 5,
            }),
            amount: math.bignumber(Math.configRandom({
              min: 1.5,
              max: 4.5,
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
          min: stats.zone.current - 5 < 0 ? 0 : stats.zone.current,
          max: stats.zone.current + 5,
          round: true
        }),
      };
    }
    if (enemy.active.length < stats.enemy.count) {
      var tempEnemy = new Enemy(data);
      tempEnemy.hp.value = Infinity;
      tempEnemy.magic.mana.value = Infinity;
      tempEnemy.update();
      tempEnemy.hp.value = math.bignumber(tempEnemy.hp.max.total);
      tempEnemy.magic.mana.value = math.bignumber(tempEnemy.magic.mana.max.total);
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
    }) <= heroData.defense.chance.percent.total ? heroData.defense.chance.amount.total : 1;
    var damageAmount = Math.configRandom({
      min: 0,
      max: 99,
    }) <= enemyData.damage.chance.percent.total ? enemyData.damage.chance.amount.total : 1;
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
    }) <= enemyData.defense.chance.percent.total ? enemyData.defense.chance.amount.total : 1;
    var damageAmount = Math.configRandom({
      min: 0,
      max: 99,
    }) <= heroData.damage.chance.percent.total ? heroData.damage.chance.amount.total : 1;
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
      for (var i = 0; i < 30; i ++) {
        main();
      }
      heroRender();
      enemyRender();
      shopRender();
      uiRender();
    }, 500);
  });
  createHero();
  createEnemy();
  stats.zone.beat --;
  
  //Input
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
  
  var tempZonePlus = 5;
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
        stats.zone.current --;
        inputCurrentZone.val(stats.zone.current);
        alert("All of you heroes were killed, pleae go back to previous zone :(");
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
    if (stats.zone.beat >= stats.other.nextHero) {
      stats.hero.count ++;
      createHero();
      stats.other.nextHero += 10;
    }
    if (stats.zone.beat >= stats.other.nextEnemy) {
      stats.enemy.count ++;
      stats.enemy.death.required.max += tempZonePlus;
      tempZonePlus += 2;
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
      tempString += `<span onclick="shopType = 'hero'; shopObj = hero.active[${loopCount}]; shopRender();" class="pointerHover">---------Hero ${loopCount}--------</span> <br/>
<span title="${math.bignumber.format(hero.active[loopCount].hp.value)} / ${math.bignumber.format(hero.active[loopCount].hp.max.total)}">Hp: ${Number(math.multiply(math.divide(hero.active[loopCount].hp.value, hero.active[loopCount].hp.max.total), 100).toFixed(5))}%</span> <br/>
<span title="${math.bignumber.format(hero.active[loopCount].magic.mana.value)} / ${math.bignumber.format(hero.active[loopCount].magic.mana.max.total)}">Mana: ${Number(math.multiply(math.divide(hero.active[loopCount].magic.mana.value, hero.active[loopCount].magic.mana.max.total), 100).toFixed(5))}%</span> <br/>
<span title="${math.bignumber.format(hero.active[loopCount].xp.value)} / ${math.bignumber.format(hero.active[loopCount].xp.max.total)}">Xp: ${Number(math.multiply(math.divide(hero.active[loopCount].xp.value, hero.active[loopCount].xp.max.total), 100).toFixed(5))}%</span> | Level: ${hero.active[loopCount].xp.max.count} <br/>
Cool down: ${hero.active[loopCount]._.coolDown.damage} | ${hero.active[loopCount]._.coolDown.hp} | ${hero.active[loopCount]._.coolDown.mana} <br/>
`;
    }
    for (loopCount = 0; loopCount < hero.dead.length; loopCount ++) {
      tempString += `<span onclick="shopType = 'hero'; shopObj = hero.dead[${loopCount}]; shopRender();" class="pointerHover">---------Dead hero ${loopCount}--------</span> <br/>
Cool down: ${hero.dead[loopCount]._.coolDown.death} <br/>
`;
    }
    $("div#heroData").html(tempString);
  }
  function enemyRender() {
    var tempString = "", loopCount;
    for (loopCount = 0; loopCount < enemy.active.length; loopCount ++) {
      tempString += `<span onclick="shopType = 'enemy'; shopObj = enemy.active[${loopCount}]; shopRender();" class="pointerHover">---------Enemy ${loopCount}--------</span>  <br/>
<div onclick="playerAttack(enemy.active[${loopCount}])"><span title="${math.bignumber.format(enemy.active[loopCount].hp.value)} / ${math.bignumber.format(enemy.active[loopCount].hp.max.total)}">Hp: ${Number(math.multiply(math.divide(enemy.active[loopCount].hp.value, enemy.active[loopCount].hp.max.total), 100).toFixed(5))}%</span> <br/>
<span title="${math.bignumber.format(enemy.active[loopCount].magic.mana.value)} / ${math.bignumber.format(enemy.active[loopCount].magic.mana.max.total)}">Mana: ${Number(math.multiply(math.divide(enemy.active[loopCount].magic.mana.value, enemy.active[loopCount].magic.mana.max.total), 100).toFixed(5))}%</span> <br/>
Level: ${enemy.active[loopCount].level} <br/>
Cool down: ${enemy.active[loopCount]._.coolDown.damage} | ${enemy.active[loopCount]._.coolDown.hp} | ${enemy.active[loopCount]._.coolDown.mana}</div>
`;
    }
    for (loopCount = 0; loopCount < enemy.dead.length; loopCount ++) {
      tempString += `<span onclick="shopType = 'enemy'; shopObj = enemy.dead[${loopCount}]; shopRender();" class="pointerHover">---------Dead enemy ${loopCount}--------</span> <br/>
Cool down: ${enemy.dead[loopCount]._.coolDown.death} <br/>
`;
    }
    $("div#enemyData").html(tempString);
  }
  var shopType = "upgrade", shopObj = 0;
  function shopRender() {
    var tempRenderString = "", loopCount;
    switch (shopType) {
      case "upgrade": {
        for (loopCount = 0; loopCount < upgrade.wait.length; loopCount ++) {
          tempRenderString += `<span>--- ${upgrade.wait[loopCount].title} | Id: ${loopCount} ---</span> <br/>
Detail: ${upgrade.wait[loopCount].detail} <br/>
`;
        }
        $("div#shopData").html(tempRenderString);
      }
      break;
      case "hero": {
        if (shopObj.death.bool === true) {
          shopObj = hero.active[0];
        }
        tempRenderString += `<span>--- ${shopObj._.coolDown.death <= 0 ? "Hero" : "Dead hero"} ${shopObj.hash} ---</span> <br/>

Hp: ${math.bignumber.format(shopObj.hp.value)} / <span onclick="shopObj.upgrade(['hp', 'max'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.hp.max.count}
Increment: x${Number(shopObj.hp.max.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['hp', 'max'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(shopObj.bonus.hp.max.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.hp.max.plus, 5)}
Cost bonus: x${math.bignumber.format(shopObj.bonus.hp.max.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.hp.max.cost.plus, 5)}
">${math.bignumber.format(shopObj.hp.max.total)}</span> <br/>

Hp regen: <span onclick="shopObj.upgrade(['hp', 'regen', 'rate'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.hp.regen.rate.count}
Increment: x${Number(shopObj.hp.regen.rate.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['hp', 'regen', 'rate'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(shopObj.bonus.hp.regen.rate.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.hp.regen.rate.plus, 5)}
Cost bonus: x${math.bignumber.format(shopObj.bonus.hp.regen.rate.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.hp.regen.rate.cost.plus, 5)}
">${math.bignumber.format(shopObj.hp.regen.rate.total)}</span> / 

<span onclick="shopObj.upgrade(['hp', 'regen', 'speed'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.hp.regen.speed.count} / ${shopObj.hp.regen.speed.max}
Increment: -${Number(shopObj.hp.regen.speed.increment.toFixed(5))} frame(s)
Cost: ${math.bignumber.format(shopObj.upgrade(['hp', 'regen', 'speed'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.hp.regen.speed.multiply.toFixed(5))} | ${Number(shopObj.bonus.hp.regen.speed.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(shopObj.bonus.hp.regen.speed.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.hp.regen.speed.cost.plus, 5)}
">${Number(shopObj.hp.regen.speed.total.toFixed(5))} frame(s)</span> <br/>

Mana: ${math.bignumber.format(shopObj.magic.mana.value)} / <span onclick="shopObj.upgrade(['magic', 'mana', 'max'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.magic.mana.max.count}
Increment: x${Number(shopObj.magic.mana.max.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['magic', 'mana', 'max'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(shopObj.bonus.magic.mana.max.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.magic.mana.max.plus, 5)}
Cost bonus: x${math.bignumber.format(shopObj.bonus.magic.mana.max.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.magic.mana.max.cost.plus, 5)}
">${math.bignumber.format(shopObj.magic.mana.max.total)}</span> <br/>

Mana regen: <span onclick="shopObj.upgrade(['magic', 'mana', 'regen', 'rate'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.magic.mana.regen.rate.count}
Increment: x${Number(shopObj.magic.mana.regen.rate.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['magic', 'mana', 'regen', 'rate'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(shopObj.bonus.magic.mana.regen.rate.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.magic.mana.regen.rate.plus, 5)}
Cost bonus: x${math.bignumber.format(shopObj.bonus.magic.mana.regen.rate.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.magic.mana.regen.rate.cost.plus, 5)}
">${math.bignumber.format(shopObj.magic.mana.regen.rate.total)}</span> / 

<span onclick="shopObj.upgrade(['magic', 'mana', 'regen', 'speed'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.magic.mana.regen.speed.count} / ${shopObj.magic.mana.regen.speed.max}
Increment: -${Number(shopObj.magic.mana.regen.speed.increment.toFixed(5))} frame(s)
Cost: ${math.bignumber.format(shopObj.upgrade(['magic', 'mana', 'regen', 'speed'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.magic.mana.regen.speed.multiply.toFixed(5))} | ${Number(shopObj.bonus.magic.mana.regen.speed.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(shopObj.bonus.magic.mana.regen.speed.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.magic.mana.regen.speed.cost.plus, 5)}
">${Number(shopObj.magic.mana.regen.speed.total.toFixed(5))} frame(s)</span> <br/>

Xp: ${math.bignumber.format(shopObj.xp.value)} / <span class="pointerHover" title="
Increment: x${Number(shopObj.xp.max.increment.toFixed(5))}
Bonus: x${math.bignumber.format(shopObj.bonus.xp.max.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.xp.max.plus, 5)}
">${math.bignumber.format(shopObj.xp.max.total)}</span> | Level: ${shopObj.xp.max.count} <br/>

<span onclick="shopObj.upgrade(['damage', 'value'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.damage.value.count}
Increment: x${Number(shopObj.damage.value.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['damage', 'value'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(shopObj.bonus.damage.value.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.damage.value.plus, 5)}
Cost bonus: x${math.bignumber.format(shopObj.bonus.damage.value.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.damage.value.cost.plus, 5)}
">Damage: ${math.bignumber.format(shopObj.damage.value.total)}</span> <br/>

<span onclick="shopObj.upgrade(['damage', 'chance', 'percent'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.damage.chance.percent.count} / ${shopObj.damage.chance.percent.max}
Increment: +${Number(shopObj.damage.chance.percent.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['damage', 'chance', 'percent'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.damage.chance.percent.multiply.toFixed(5))} | +${Number(shopObj.bonus.damage.chance.percent.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(shopObj.bonus.damage.chance.percent.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.damage.chance.percent.cost.plus, 5)}
">Critical chance: ${Number(shopObj.damage.chance.percent.total.toFixed(5))}%</span> <br/>

<span onclick="shopObj.upgrade(['damage', 'chance', 'amount'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.damage.chance.amount.count} / ${shopObj.damage.chance.amount.max}
Increment: +${Number(shopObj.damage.chance.amount.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['damage', 'chance', 'amount'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(shopObj.bonus.damage.chance.amount.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.damage.chance.amount.plus, 5)}
Cost bonus: x${math.bignumber.format(shopObj.bonus.damage.chance.amount.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.damage.chance.amount.cost.plus, 5)}
">Critical amount: x${shopObj.damage.chance.amount.total.toFixed(5)}</span> <br/>

<span onclick="shopObj.upgrade(['damage', 'speed'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.damage.speed.count} / ${shopObj.damage.speed.max}
Increment: -${Number(shopObj.damage.speed.increment.toFixed(5))} frame(s)
Cost: ${math.bignumber.format(shopObj.upgrade(['damage', 'speed'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.damage.speed.multiply.toFixed(5))} | ${Number(shopObj.bonus.damage.speed.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(shopObj.bonus.damage.speed.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.damage.speed.cost.plus, 5)}
">Attack speed: ${Number(shopObj.damage.speed.total.toFixed(5))} frame(s)</span> <br/>

<span onclick="shopObj.upgrade(['defense', 'value'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.defense.value.count}
Increment: x${Number(shopObj.defense.value.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['defense', 'value'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(shopObj.bonus.defense.value.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.defense.value.plus, 5)}
Cost bonus: x${math.bignumber.format(shopObj.bonus.defense.value.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.defense.value.cost.plus, 5)}
">Defense: ${math.bignumber.format(shopObj.defense.value.total)}</span> <br/>

<span onclick="shopObj.upgrade(['defense', 'chance', 'percent'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.defense.chance.percent.count} / ${shopObj.defense.chance.percent.max}
Increment: +${Number(shopObj.defense.chance.percent.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['defense', 'chance', 'percent'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.defense.chance.percent.multiply.toFixed(5))} | +${Number(shopObj.bonus.defense.chance.percent.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(shopObj.bonus.defense.chance.percent.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.defense.chance.percent.cost.plus, 5)}
">Block chance: ${Number(shopObj.defense.chance.percent.total.toFixed(5))}%</span> <br/>

<span onclick="shopObj.upgrade(['defense', 'chance', 'amount'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.defense.chance.amount.count} / ${shopObj.defense.chance.amount.max}
Increment: +${Number(shopObj.defense.chance.amount.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['defense', 'chance', 'amount'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(shopObj.bonus.defense.chance.amount.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.defense.chance.amount.plus, 5)}
Cost bonus: x${math.bignumber.format(shopObj.bonus.defense.chance.amount.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.defense.chance.amount.cost.plus, 5)}
">Block amount: x${shopObj.defense.chance.amount.total.toFixed(5)}</span> <br/>

<span onclick="shopObj.upgrade(['damage', 'multiple', 'value'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.damage.multiple.value.count} / ${shopObj.damage.multiple.value.max}
Increment: +${shopObj.damage.multiple.value.increment} hit(s)
Cost: ${math.bignumber.format(shopObj.upgrade(['damage', 'multiple', 'value'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.damage.multiple.value.multiply.toFixed(5))} | +${shopObj.bonus.damage.multiple.value.plus}
Cost bonus: x${math.bignumber.format(shopObj.bonus.damage.multiple.value.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.damage.multiple.value.cost.plus, 5)}
">Multiple: ${shopObj.damage.multiple.value.total} hit(s)</span> <br/>

<span onclick="shopObj.upgrade(['damage', 'multiple', 'chance', 'percent'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.damage.multiple.chance.percent.count} / ${shopObj.damage.multiple.chance.percent.max}
Increment: +${Number(shopObj.damage.multiple.chance.percent.increment.toFixed(5))}
Cost: ${math.bignumber.format(shopObj.upgrade(['damage', 'multiple', 'chance', 'percent'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.damage.multiple.chance.percent.multiply.toFixed(5))} | +${Number(shopObj.bonus.damage.multiple.chance.percent.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(shopObj.bonus.damage.multiple.chance.percent.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.damage.multiple.chance.percent.cost.plus, 5)}
">Splash chance: ${Number(shopObj.damage.multiple.chance.percent.total.toFixed(5))}%</span> <br/>

<span onclick="shopObj.upgrade(['damage', 'multiple', 'chance', 'amoount'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.damage.multiple.chance.amount.count} / ${shopObj.damage.multiple.chance.amount.max}
Increment: +${shopObj.damage.multiple.chance.amount.increment} hit(s)
Cost: ${math.bignumber.format(shopObj.upgrade(['damage', 'multiple', 'chance', 'amount'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.damage.multiple.chance.amount.multiply.toFixed(5))} | +${shopObj.bonus.damage.multiple.chance.amount.plus}
Cost bonus: x${math.bignumber.format(shopObj.bonus.damage.multiple.chance.amount.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.damage.multiple.chance.amount.cost.plus, 5)}
">Splash amount: ${shopObj.damage.multiple.chance.amount.total} hit(s)</span> <br/>

<span onclick="shopObj.upgrade(['death', 'speed'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.death.speed.count} / ${shopObj.death.speed.max}
Increment: -${Number(shopObj.death.speed.increment.toFixed(5))} frame(s)
Cost: ${math.bignumber.format(shopObj.upgrade(['death', 'speed'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.death.speed.multiply.toFixed(5))} | ${Number(shopObj.bonus.death.speed.plus.toFixed(5))}
Cost bonus: x${math.bignumber.format(shopObj.bonus.death.speed.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.death.speed.cost.plus, 5)}
">Revive speed: ${Number(shopObj.death.speed.total.toFixed(5))} frame(s)</span> <br/>

Revive count: ${hero.active[0].death.total} / <span onclick="shopObj.upgrade(['death', 'max'], stats.other.buyAmount)" class="pointerHover" title="Count: ${shopObj.death.max.count} / ${shopObj.death.max.max}
Increment: +${shopObj.death.max.increment} time(s)
Cost: ${math.bignumber.format(shopObj.upgrade(['death', 'max'], stats.other.buyAmount, true).cost)}
Bonus: x${Number(shopObj.bonus.death.max.multiply.toFixed(5))} | +${shopObj.bonus.death.max.plus}
Cost bonus: x${math.bignumber.format(shopObj.bonus.death.max.cost.multiply, 5)} | ${math.bignumber.format(shopObj.bonus.death.max.cost.plus, 5)}
">${shopObj.death.max.total}</span> <br/>
`;
        $("div#shopData").html(tempRenderString);
      }
      break;
      case "enemy": {
        if (shopObj.death.bool === true) {
          shopObj = enemy.active[0];
        }
        tempRenderString += `<span>--- ${shopObj._.coolDown.death <= 0 ? "Enemy" : "Dead enemy"} ${shopObj.hash} ---</span> <br/>

Hp: ${math.bignumber.format(shopObj.hp.value)} / <span class="pointerHover" title="Bonus: x${math.bignumber.format(shopObj.bonus.hp.max.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.hp.max.plus, 5)}
">${math.bignumber.format(shopObj.hp.max.total)}</span> <br/>

Hp regen: <span class="pointerHover" title="Bonus: x${math.bignumber.format(shopObj.bonus.hp.regen.rate.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.hp.regen.rate.plus, 5)}
">${math.bignumber.format(shopObj.hp.regen.rate.total)}</span> / 

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.hp.regen.speed.multiply.toFixed(5))} | ${Number(shopObj.bonus.hp.regen.speed.plus.toFixed(5))}
">${Number(shopObj.hp.regen.speed.total.toFixed(5))} frame(s)</span> <br/>

Mana: ${math.bignumber.format(shopObj.magic.mana.value)} / <span class="pointerHover" title="Bonus: x${math.bignumber.format(shopObj.bonus.magic.mana.max.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.magic.mana.max.plus, 5)}
">${math.bignumber.format(shopObj.magic.mana.max.total)}</span> <br/>

Mana regen: <span class="pointerHover" title="Bonus: x${math.bignumber.format(shopObj.bonus.magic.mana.regen.rate.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.magic.mana.regen.rate.plus, 5)}
">${math.bignumber.format(shopObj.magic.mana.regen.rate.total)}</span> / 

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.magic.mana.regen.speed.multiply.toFixed(5))} | ${Number(shopObj.bonus.magic.mana.regen.speed.plus.toFixed(5))}
">${Number(shopObj.magic.mana.regen.speed.total.toFixed(5))} frame(s)</span> <br/>

Level: ${shopObj.level} <br/>

Money drop: ${math.bignumber.format(shopObj.loot.money.total)} <br/>

Xp drop: ${math.bignumber.format(shopObj.loot.xp.total)} </br>

<span class="pointerHover" title="Bonus: x${math.bignumber.format(shopObj.bonus.damage.value.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.damage.value.plus, 5)}
">Damage: ${math.bignumber.format(shopObj.damage.value.total)}</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.damage.chance.percent.multiply.toFixed(5))} | +${Number(shopObj.bonus.damage.chance.percent.plus.toFixed(5))}
">Critical chance: ${Number(shopObj.damage.chance.percent.total.toFixed(5))}%</span> <br/>

<span class="pointerHover" title="Bonus: x${math.bignumber.format(shopObj.bonus.damage.chance.amount.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.damage.chance.amount.plus, 5)}
">Critical amount: x${shopObj.damage.chance.amount.total.toFixed(5)}</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.damage.speed.multiply.toFixed(5))} | ${Number(shopObj.bonus.damage.speed.plus.toFixed(5))}
">Attack speed: ${Number(shopObj.damage.speed.total.toFixed(5))} frame(s)</span> <br/>

<span class="pointerHover" title="Bonus: x${math.bignumber.format(shopObj.bonus.defense.value.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.defense.value.plus, 5)}
">Defense: ${math.bignumber.format(shopObj.defense.value.total)}</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.defense.chance.percent.multiply.toFixed(5))} | +${Number(shopObj.bonus.defense.chance.percent.plus.toFixed(5))}
">Block chance: ${Number(shopObj.defense.chance.percent.total.toFixed(5))}%</span> <br/>

<span class="pointerHover" title="Bonus: x${math.bignumber.format(shopObj.bonus.defense.chance.amount.multiply, 5)} | +${math.bignumber.format(shopObj.bonus.defense.chance.amount.plus, 5)}
">Block amount: x${shopObj.defense.chance.amount.total.toFixed(5)}</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.damage.multiple.value.multiply.toFixed(5))} | +${shopObj.bonus.damage.multiple.value.plus}
">Multiple: ${shopObj.damage.multiple.value.total} hit(s)</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.damage.multiple.chance.percent.multiply.toFixed(5))} | +${Number(shopObj.bonus.damage.multiple.chance.percent.plus.toFixed(5))}
">Splash chance: ${Number(shopObj.damage.multiple.chance.percent.total.toFixed(5))}%</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.damage.multiple.chance.amount.multiply.toFixed(5))} | +${shopObj.bonus.damage.multiple.chance.amount.plus}
">Splash amount: ${shopObj.damage.multiple.chance.amount.total} hit(s)</span> <br/>

<span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.death.speed.multiply.toFixed(5))} | ${Number(shopObj.bonus.death.speed.plus.toFixed(5))}
">Revive speed: ${Number(shopObj.death.speed.total.toFixed(5))} frame(s)</span> <br/>

Revive count: ${shopObj.death.total} / <span class="pointerHover" title="Bonus: x${Number(shopObj.bonus.death.max.multiply.toFixed(5))} | +${shopObj.bonus.death.max.plus}
">${shopObj.death.max.total}</span> <br/>
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
    tempRenderString = `
<span onclick="upgradePlayer(['damage', 'value'], stats.other.buyAmount)" class="pointerHover" title="Count: ${player.damage.value.count}
Cost: ${math.bignumber.format(upgradePlayer(['damage', 'value'], stats.other.buyAmount, true).cost)}
Bonus: x${math.bignumber.format(bonus.player.damage.value.multiply, 5)} | +${math.bignumber.format(bonus.player.damage.value.plus, 5)}
Cost bonus: x${math.bignumber.format(bonus.player.damage.value.cost.multiply, 5)} | ${math.bignumber.format(bonus.player.damage.value.cost.plus, 5)}
">Click damange: ${math.bignumber.format(player.damage.value.total)}</span> <br/>
<span title="Count: ${player.damage.chance.percent.count}
">Critical click chance: ${Number(player.damage.chance.percent.total.toFixed(5))}%</span> <br/>
<span title="Count: ${player.damage.chance.amount.count}
">Critical click amount: x${Number(player.damage.chance.percent.total.toFixed(5))}</span> <br/>
    `;
    $("div#clickData").html(tempRenderString);
  }
  
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
