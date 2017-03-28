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

(function (math) {
  var Notations = {
    shortOld: 1,
    longOld: 2,
    shortNew: 3,
    longNew: 4,
    exponential: 5,
    scientific: 6,
    engineering: 7,
    alphabet: 8,
  };
  var notationType = Notations.shortOld;
  var Suffixes = {};
  Suffixes[Notations.shortNew] = [
    ['M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', ],
    ['U', 'D', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', ],
    ['Dc', 'Vg', 'Tg', 'Qag', 'Qig', 'Sxg', 'Spg', 'Ocg', 'Nog', ],
    ['Cn', 'DCn', 'TCn', 'QaCn', 'QiCn', 'SxCn', 'SpCn', 'OcCn', 'NoCn', ],
    ['Mil', ],
  ];
  Suffixes[Notations.longNew] = [
    ['M', 'B', 'Tr', 'Quadr', 'Quint', 'Sext', 'Sept', 'Oct', 'Non', ],
    ['Un', 'Duo', 'Tre', 'Quattuor', 'Quin', 'Sex', 'Septen', 'Octo', 'Novem', ],
    ['Dec', 'Vigin', 'Trigin', 'Quadragin', 'Quinquagin', 'Sexagin', 'Septuagin', 'Octogin', 'Nonagin', ],
    ['Cen', 'DuoCen', 'TreCen', 'Quadringen', 'Quingen', 'Sescen', 'Septingen', 'Octingen', 'Nongen', ],
    ['Millia', ],
  ];
  Suffixes[Notations.shortOld] = [
    ["k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De"],
    ["Un", "Du", "Tr", "Qa", "Qi", "Se", "Sp", "Oc", "No"],
    ["De", "Vi"],
    ["Ce"],
  ];
  Suffixes[Notations.longOld] = [
    ["Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion"],
    ["un", "duo", "tre", "quattuor", "quinqua", "se", "septe", "octo", "nove"],
    ["deci", "viginti", "triginta", "quadraginta", "quinquaginta", "sexaginta", "septuaginta", "octoginta", "nonaginta"],
    ["centi", "ducenti", "trecenti", "quadringenti", "quingenti", "sescenti", "septingenti", "octingenti", "nongenti"],
    ["millini", "billini", "trillini", "quadrillini", "quintillini", "sextillini", "septillini", "octillini", "nonillini", "decillini"],
  ];
  math.bignumber.format = function(bigNum, rounding, fixed) {
    rounding = rounding || 0;
    fixed = fixed || 0;
    var tempString = bigNum.toString(), tempDigits = math.compare(bigNum, 1).toNumber() <= 0 ? 0 : math.log10(bigNum).floor().toNumber();
    var tempDecimal = bigNum.div(math.bignumber(10).pow(tempDigits)).toString();
    if (tempDigits < 7 && notationType !== Notations.shortOld && notationType !== Notations.longOld  && notationType !== Notations.scientific && notationType !== Notations.engineering) {
      return Number(bigNum.toFixed(checkZero(fixed + 6 - tempDigits)));
    } else if (tempDigits < 3) {
      return Number(bigNum.toFixed(checkZero(fixed + 2 - tempDigits)));
    }
    if (notationType == Notations.scientific || notationType == Notations.exponential) {
      if (rounding === 0) {
        tempDecimal = tempDecimal.slice(0, 1);
      } else {
        tempDecimal = tempDecimal.slice(0, rounding + 2);
      }
      return tempDecimal + "e+" + tempDigits;
    } else {
      var position = rounding + 2 - tempDigits % 3;
      tempDecimal = math.compare(bigNum, 1000).toNumber() === -1 ? bigNum.floor() : (bigNum.div(math.bignumber(10).pow((math.bignumber(tempDigits).div(3)).floor().mul(3).sub(position))).div(math.bignumber(10).pow(position).floor())).toFixed(position + 1).toString();
      if (notationType == Notations.engineering) {
        return tempDecimal + (tempDigits > 2 ? "e+" + String(tempDigits - tempDigits % 3) : "");
      } else {
        return (notationType == Notations.shortOld || notationType == Notations.longOld ? tempDecimal + math.bignumber.suffix(Math.floor(tempDigits / 3) - 1) : tempDigits < 6 ? bigNum.toFixed(rounding) : tempDecimal + math.bignumber.suffix(tempDigits));
      }
    }
  };
  math.bignumber.change = function(type) {
    if (type in Notations) notationType = Notations[type];
  };
  math.bignumber.suffix = function(Digits) {
    switch (notationType) {
      case Notations.longNew:
      case Notations.shortNew:
        if (Digits >= 6) {
          Digits += 1;
          // Attempt to get the Suffixes for the given notationType
          if (!(notationType in Suffixes)) notationType = Notations.longNew;
          var suffixList = Suffixes[notationType];
          // Convert from digit count to latin power number
          var thousands = Math.floor((Digits - 1) / 3);
          var latinPower = thousands - 1;
          // Compile the suffix in groups of 1000
          var suffix = '';
          var thousandPart = '';
          for (var powersLeft = latinPower; powersLeft >= 1;) {
            // Take the lowest thousand-part (ie last three Digits) from the latin power count
            var newPowersLeft = Math.floor(powersLeft / 1000);
            var current = powersLeft - newPowersLeft * 1000;
            // Split off the hundreds, tens, and units
            var hundreds = Math.floor(current / 100) % 10;
            var tens = Math.floor(current / 10) % 10;
            var units = Math.floor(current / 1) % 10;
            // Convert into the suffix parts for hundreds, tens, and units
            var hundredPart = (hundreds >= 1) ? suffixList[3][hundreds - 1] : '';
            var tenPart = (tens >= 1) ? suffixList[2][tens - 1] : '';
            var unitPart = (units >= 1) ? suffixList[(latinPower < 10) ? 0 : 1][units - 1] : '';
            // Combine the suffix parts, and add the generated thousand-part suffix to the result
            var part = hundredPart + unitPart + tenPart;
            part = (part !== '') ? part + thousandPart : part;
            suffix = part + suffix;
            // Update the remaining latin powers, and add to the thousand suffix part
            powersLeft = newPowersLeft;
            thousandPart += suffixList[4][0];
          }
          // Compute the ending part, and return the final result
          var ending = '';
          if (notationType === Notations.longNew) ending = (latinPower >= 20) ? 'tillion' : (latinPower >= 1) ? 'illion' : '';
          return " " + suffix + ending;
        } else {
          return '';
        }
        break;
      case Notations.alphabet:
      var suffix = '';
        for (var powersLeft = Math.floor((Digits) / 3) - 1; powersLeft > 0;) {
          var currentPower = powersLeft % 26 + 1; // Consume some of the remaining latin powers
          powersLeft = (powersLeft - currentPower) / 26; // Update the remaining latin powers for the next iterations

          var part = String.fromCharCode(64 + currentPower); // Transform the latin powers we just took into a letter
          suffix = part + suffix; // Add the letter to our combined suffix
        }
        return " " + suffix;
        break;
      case Notations.longOld:
      case Notations.shortOld:
        var replaceChars = {};
        var charAt = null;
        var a0 = Suffixes[notationType][0],
          a1 = Suffixes[notationType][1],
          a2 = Suffixes[notationType][2],
          a3 = Suffixes[notationType][3],
          a4 = Suffixes[notationType][4];
        var Number_1000 = Math.floor(Digits / 1000) % 10;
        var Number_100 = Math.floor(Digits / 100) % 10;
        var Number_10 = Math.floor(Digits / 10) % 10;
        var Number_1 = Math.floor(Digits / 1) % 10;
        var Number_1000_String = "";
        var Number_100_String = "";
        var Number_10_String = "";
        var Number_1_String = "";
        var Number_Lillion_String = "illion";
        if (Digits == -1) {
          return "";
        } else if (Digits <= 10) {
          return " " + a0[Digits];
        } else if (Digits < 10000) {
          switch (notationType) {
            case Notations.shortOld:
              Number_1000_String = (Number_1000 === 0 ? "" : a0[Number_1000]);
              if (Number_1000 === 0) {
                Number_1000_String = "";
              } else if (Number_1000 == 1 || Number_1000 == 2 || Number_1000 == 3) {
                Number_1000_String = Number_1000_String + "i";
              }
              if (Number_100 === 0) {
                Number_100_String = "";
              } else if (Number_100 == 1) {
                Number_100_String = a3[0];
                if (Number_10 !== 0 || Number_1 !== 0) {
                  if (Number_1000 === 0) {
                    Number_100_String = Number_100_String.replace("e", "");
                  }
                }
              } else {
                Number_100_String = a1[Number_100 - 1];
                replaceChars = {
                  2: "u",
                  3: "r",
                  8: "c",
                  9: "o"
                };
                if (Number_100 in replaceChars) {
                  if (Number_1000 === 0) {
                    Number_100_String = Number_100_String.replace(replaceChars[Number_100], "");
                  }
                }
              }
              Number_10_String = Number_10 === 0 ? "" : a2[Number_10 - 1] != null ? a2[Number_10 - 1] : a1[Number_10 - 1];
              if (Number_100 === 0) {
                Number_10_String = Number_10 == 1 || Number_10 == 2 ? a2[Number_10 - 1] : a1[Number_10 - 1];
                if (Number_1 !== 0) {
                  replaceChars = {
                    1: "e",
                    2: "i",
                    3: "r",
                    8: "c",
                    9: "o"
                  };
                  if (Number_10 in replaceChars) {
                    Number_10_String = Number_10_String.replace(replaceChars[Number_10], "");
                  }
                }
              }
              Number_1_String = Number_1 === 0 ? "" : a1[Number_1 - 1];
              if (Number_1 == 6) {
                charAt = Number_10 === 0 ? Number_100_String.charAt(0) : Number_10_String.charAt(0);
                if (["C", "O"].indexOf(charAt) != -1) {
                  Number_1_String = Number_1_String.replace("e", "x");
                } else if (["Q", "T", "V"].indexOf(charAt) != -1) {
                  Number_1_String = Number_1_String.replace("e", "s");
                }
              }
              if (Number_1 === 0) {
                Number_1_String = "";
              }
              if (Number_10 === 0) {
                Number_10_String = "";
              }
              if (Number_100 === 0) {
                Number_100_String = "";
              }
              Number_Lillion_String = "";
              break;
            case Notations.longOld:
              Number_1000_String = (Number_1000 === 0 ? "" : a4[Number_1000 - 1]);
              Number_100_String = Number_100 === 0 ? "" : a3[Number_100 - 1];
              Number_10_String = Number_10 === 0 ? "" : a2[Number_10 - 1];
              if (Number_10 == 1 || Number_10 == 2) {
                Number_10_String = a2[Number_10 - 1];
                if (Number_1000 === 0 || Number_100 === 0) {
                  Number_Lillion_String = "llion";
                }
              } else if ([3, 4, 5, 6, 7, 8, 9].indexOf(Number_10) != -1) {
                if (Number_1000 === 0 && Number_100 === 0) { //AND or OR ?
                  Number_10_String = a2[Number_10 - 1].slice(0, a2[Number_10 - 1].length - 1);
                } else {
                  Number_Lillion_String = "llion";
                }
              }
              Number_1_String = Number_1 === 0 ? "" : a1[Number_1 - 1];
              charAt = Number_10 === 0 ? Number_100_String.charAt(0) : Number_10_String.charAt(0);
              if (Number_1 == 3 && ["c", "o", "q", "t", "v"].indexOf(charAt) != -1) {
                Number_1_String += "s";
              } else if (Number_1 == 6) {
                if (["c", "o"].indexOf(charAt) != -1) {
                  Number_1_String += "x";
                } else if (["q", "t", "v"].indexOf(charAt) != -1) {
                  Number_1_String += "s";
                }
              } else if (Number_1 == 7 || Number_1 == 9) {
                if (["c", "d", "q", "s", "t"].indexOf(charAt) != -1) {
                  Number_1_String += "n";
                } else if (["o", "v"].indexOf(charAt) != -1) {
                  Number_1_String += "m";
                }
              }
              break;
          }
          return " " + capitalizeFirstLetter(String(Number_1_String + Number_10_String + Number_100_String + Number_1000_String + Number_Lillion_String).replace('iillion', 'illion'));
        } else {
          return "e+" + String((Digits + 1) * 3);
        }
        break;
      case Notations.alphabet:
        
        break;
    }
  };
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function checkZero(num) {
    return num < 0 ? 0 : num;
  }
  /*String.prototype.splice = function(start, delCount, newSubStr) {
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
  };*/
})(math || {});

(function() {
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
  Math.configRandom = function (options) {
    options = options || {};
    options.generate = options.generate || function (seed) {
      Math.seedrandom(seed);
      return Math.random();
    };
    options.seed = options.seed || null;
    options.round = options.round || false;
    options.exception = options.exception || null;
    options.error = options.error || {};
    options.error.larger = options.error.larger || 0;
    options.error.equal = options.error.equal || options.min;
    options.gaussian = options.gaussian || 1;
    options.weight = options.weight || null;
    if (typeof options.generate != "function" && options.generate != null) {
      return console.error("options.generate is not function");
    }
    if (typeof options.seed != "string" && options.seed != null) {
      return console.error("options.seed is not string");
    }
    if (typeof options.round != "boolean" && options.round != null) {
      return console.error("options.round is not boolean");
    }
    if (Object.prototype.toString.call(options.exception) !== '[object Array]' && options.exception != null) {
      return console.error("options.exception is not array");
    }
    if (Object.prototype.toString.call(options.error) === '[object Object]' && options.error != null) {
      if (typeof options.error.larger != "number" && options.error.larger != null) {
        return console.error("options.error.larger is not number");
      }
      if (typeof options.error.equal != "number" && options.error.equal != null) {
        return console.error("options.error.equal is not number");
      }
    } else if (Object.prototype.toString.call(options.error) !== '[object Object]' && options.error != null) {
      return console.error("options.error is not object");
    }
    if (typeof options.gaussian != "number" && options.gaussian != null) {
      return console.error("options.gaussian is not number");
    }
    if (Object.prototype.toString.call(options.weight) !== '[object Array]' && options.weight != null) {
      return console.error("options.weight is not array");
    }
    function PRNG() {
      var Value;
      if (options.round === true) {
        Value = Number(Math.floor(options.generate(options.seed) * (options.max - options.min + 1)) + options.min);
      } else if (options.round === false || options.round == null) {
        Value = Number(options.generate(options.seed) * (options.max - options.min) + options.min);
      } else {
        console.error("What happened with options.round in Math.random.advanced ?");
      }
      if (options.min > options.max) {
        if (options.larger == null) {
          Value = 0;
        } else {
          Value = options.larger;
        }
        return Value;
      } else if (options.min == options.max) {
        if (options.equal == null) {
          Value = options.min;
        } else {
          Value = options.equal;
        }
        return Value;
      } else if (options.min < options.max) {
        return options.seed != null ? Value : ((options.exception == [] || options.exception == null) ? Value : (options.exception.indexOf(Value) == -1) ? Value : (options.gaussian != null && (options.Other === false && options.Other != null) ? Value : PRNG()));
      }
    }
    function GauRan() {
      if (options.gaussian == null || (typeof options.gaussian == "number" && options.gaussian <= 1)) {
        return PRNG();
      } else if (options.gaussian > 1 && options.gaussian != null) {
        var Total = 0,
          Times = 0;
        while (Times < options.gaussian) {
          Times++;
          Total += PRNG();
        }
        Total /= options.gaussian;
        if (options.round == true) {
          Total = Math.round(Total, 0);
        }
        return options.seed != null ? console.error("Please remove parameter options.gaussian because options.seed is defined.") : ((options.exception == [] || options.exception == null) ? Total : (options.exception.indexOf(Total) == -1) ? Total : GauRan());
      }
    }
    var TempResult = GauRan(),
      count = 0,
      TempStore = "",
      TempHighest = options.max,
      Temperror = false;
    if (options.weight == null) {
      return TempResult;
    } else if (options.weight != null) {
      while (count < options.weight.length) {
        if (count == options.weight.length - 1) {
          TempStore += "options.weight[" + String(count) + "].value";
        } else {
          if (options.weight[count].chance > TempHighest) {
            Temperror = true;
            break;
          }
          TempStore += "TempResult" + options.round === true ? ">=" : ">" + "options.weight[" + String(count) + "].chance?options.weight[" + String(count) + "].value:";
          TempHighest = options.weight[count].chance;
        }
        count++;
      }
      if (Temperror === true) {
        return console.error("options.weight[" + String(count) + "].chance is larger than options.weight[" + String(Number(count - 1)) + "].chance");
      }
      return eval(TempStore);
    }
  };
})();

_.deepIndexOf = function (array, value) {
  var result;
  array.some(function iter(path) {
    return function (a, i) {
      if (a === value) {
        result = path.concat(i);
        return true;
      };
      return Array.isArray(a) && a.some(iter(path.concat(i)));
    }
  }([]));
  return result;
};

if (typeof JSON.decycle !== "function") {
    JSON.decycle = function decycle(object, replacer) {
        "use strict";
//https://github.com/douglascrockford/JSON-js/blob/master/cycle.js

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form

//      {"$ref": PATH}

// where the PATH is a JSONPath string that locates the first occurance.

// So,

//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));

// produces the string '[{"$ref":"$"}]'.

// If a replacer function is provided, then it will be called for each value.
// A replacer function receives a value and returns a replacement value.

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child element or
// property.

        var objects = new WeakMap();     // object to path mappings

        return (function derez(value, path) {

// The derez function recurses through the object, producing the deep copy.

            var old_path;   // The path of an earlier occurance of value
            var nu;         // The new object or array

// If a replacer function was provided, then call it to get a replacement value.

            if (replacer !== undefined) {
                value = replacer(value);
            }

// typeof null === "object", so go on if this value is really an object but not
// one of the weird builtin objects.

            if (
                typeof value === "object" && value !== null &&
                !(value instanceof Boolean) &&
                !(value instanceof Date) &&
                !(value instanceof Number) &&
                !(value instanceof RegExp) &&
                !(value instanceof String)
            ) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a {"$ref":PATH} object. This uses an
// ES6 WeakMap.

                old_path = objects.get(value);
                if (old_path !== undefined) {
                    return {$ref: old_path};
                }

// Otherwise, accumulate the unique value and its path.

                objects.set(value, path);

// If it is an array, replicate the array.

                if (Array.isArray(value)) {
                    nu = [];
                    value.forEach(function (element, i) {
                        nu[i] = derez(element, path + "[" + i + "]");
                    });
                } else {

// If it is an object, replicate the object.

                    nu = {};
                    Object.keys(value).forEach(function (name) {
                        nu[name] = derez(
                            value[name],
                            path + "[" + JSON.stringify(name) + "]"
                        );
                    });
                }
                return nu;
            }
            return value;
        }(object, "$"));
    };
}

if (typeof JSON.retrocycle !== "function") {
    JSON.retrocycle = function retrocycle($) {
        "use strict";

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

        var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\([\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;

        (function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

            if (value && typeof value === "object") {
                if (Array.isArray(value)) {
                    value.forEach(function (element, i) {
                        if (typeof element === "object" && element !== null) {
                            var path = element.$ref;
                            if (typeof path === "string" && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(element);
                            }
                        }
                    });
                } else {
                    Object.keys(value).forEach(function (name) {
                        var item = value[name];
                        if (typeof item === "object" && item !== null) {
                            var path = item.$ref;
                            if (typeof path === "string" && px.test(path)) {
                                value[name] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    });
                }
            }
        }($));
        return $;
    };
}

