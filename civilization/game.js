/* jshint esversion: 9 */

console.clear();
(() => {
	// Library code

	// Why? Because we may change the actual library later
	window.DecNum = Decimal;
	window.noop = function() {};
	
	(function (Decimal) {
		let ONE = new Decimal(1), THREE = new Decimal(3), TEN = new Decimal(10), THOUSAND = new Decimal(1000),
			notations = {
				shortOld: 1,
				longOld: 2,
				shortNew: 3,
				longNew: 4,
				exponential: 5,
				scientific: 6,
				engineering: 7,
				alphabet: 8,
			},
			notationType = notations.longOld,
			suffixes = {},
			replaceChars = [
				{
					2: "u",
					3: "r",
					8: "c",
					9: "o"
				}, {
					1: "e",
					2: "i",
					3: "r",
					8: "c",
					9: "o"
				}
			],
			charList = [
				["C", "O"],
				["Q", "T", "V"],
				["c", "o", "q", "t", "v"],
				["c", "o"],
				["q", "t", "v"],
				["c", "d", "q", "s", "t"],
				["o", "v"],
				// [3, 4, 5, 6, 7, 8, 9]
			];

		suffixes[notations.shortNew] = [
			["M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", ],
			["U", "D", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", ],
			["Dc", "Vg", "Tg", "Qag", "Qig", "Sxg", "Spg", "Ocg", "Nog", ],
			["Cn", "DCn", "TCn", "QaCn", "QiCn", "SxCn", "SpCn", "OcCn", "NoCn", ],
			["Mil", ],
		];
		suffixes[notations.longNew] = [
			["M", "B", "Tr", "Quadr", "Quint", "Sext", "Sept", "Oct", "Non", ],
			["Un", "Duo", "Tre", "Quattuor", "Quin", "Sex", "Septen", "Octo", "Novem", ],
			["Dec", "Vigin", "Trigin", "Quadragin", "Quinquagin", "Sexagin", "Septuagin", "Octogin", "Nonagin", ],
			["Cen", "DuoCen", "TreCen", "Quadringen", "Quingen", "Sescen", "Septingen", "Octingen", "Nongen", ],
			["Millia", ],
		];
		suffixes[notations.shortOld] = [
			["k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De"],
			["Un", "Du", "Tr", "Qa", "Qi", "Se", "Sp", "Oc", "No"],
			["De", "Vi"],
			["Ce"],
		];
		suffixes[notations.longOld] = [
			["Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion"],
			["un", "duo", "tre", "quattuor", "quinqua", "se", "septe", "octo", "nove"],
			["deci", "viginti", "triginta", "quadraginta", "quinquaginta", "sexaginta", "septuaginta", "octoginta", "nonaginta"],
			["centi", "ducenti", "trecenti", "quadringenti", "quingenti", "sescenti", "septingenti", "octingenti", "nongenti"],
			["millini", "billini", "trillini", "quadrillini", "quintillini", "sextillini", "septillini", "octillini", "nonillini", "decillini"],
		];
		Decimal.format = function(bigNum, rounding = 0, fixed = 0) {
			let tempDigits = bigNum.comparedTo(ONE) > 0 ? Decimal.log10(bigNum).floor().toNumber() : 0;

			if (!(tempDigits >= 7 ||
				notationType === notations.shortOld ||
				notationType === notations.longOld ||
				notationType === notations.scientific ||
				notationType === notations.engineering
			))
				return bigNum.toDP(checkZero(fixed + 6 - tempDigits)).toString();
			else if (tempDigits < 3)
				return bigNum.toDP(checkZero(fixed + 2 - tempDigits)).toString();

			let tempDecimal = bigNum.div(TEN.pow(tempDigits)).toString();
			if (notationType === notations.scientific || notationType === notations.exponential)
				return `${tempDecimal === 0 ? tempDecimal[0] : tempDecimal.slice(0, rounding + 2)}e+${tempDigits}`;

			let position = rounding + 2 - tempDigits % 3;

			tempDecimal = bigNum.comparedTo(THOUSAND) === -1 ? bigNum.floor().toString() : bigNum.div(
					TEN.pow((Decimal(tempDigits).div(THREE)).floor().mul(THREE).sub(position))
				).div(TEN.pow(position).floor()).toDP(position + 1).toString();

			if (notationType === notations.engineering)
				return tempDecimal + (tempDigits > 2 ? `e+${tempDigits - tempDigits % 3}` : "");

			return (notationType === notations.shortOld ||
				notationType === notations.longOld ?
					tempDecimal + Decimal.suffix(Math.floor(tempDigits / 3) - 1) :
						tempDigits < 6 ?
							bigNum.toDP(rounding).toString() :
							tempDecimal + Decimal.suffix(tempDigits)
			);
		};
		Decimal.change = function(type) {
			if (type in notations) notationType = notations[type];
		};
		Decimal.suffix = function(Digits) {
			let suffixList = suffixes[notationType];
			switch (notationType) {
				case notations.longNew:
				case notations.shortNew:
					if (Digits > 5) {
						// Attempt to get the suffixes for the given notationType
						// if (!(notationType in suffixes))
						// 	notationType = notations.longNew;

						// Convert from digit count to latin power number
						let latinPower = Math.floor(Digits / 3) - 1,
							// Compile the suffix in groups of 1000
							suffix = "",
							thousandPart = "";

						for (let powersLeft = latinPower; powersLeft > 0;) {
							// Take the lowest thousand-part (ie last three Digits) from the latin power count
							let newPowersLeft = Math.floor(powersLeft / 1000),
								current = powersLeft - newPowersLeft * 1000,

								// Split off the hundreds, tens, and units
								units    = Math.floor(current)       % 10,
								tens     = Math.floor(current /= 10) % 10,
								hundreds = Math.floor(current /= 10) % 10,

								part = "";

							if (hundreds + tens + units > 0) {
								if (hundreds > 0)
									part += suffixList[3][hundreds - 1];
								if (units > 0)
									part += suffixList[latinPower > 9 ? 1 : 0][units - 1];
								if (tens > 0)
									part += suffixList[2][tens - 1];
								part += thousandPart;
							}

							suffix = part + suffix;

							// Update the remaining latin powers, and add to the thousand suffix part
							powersLeft = newPowersLeft;
							thousandPart += suffixList[4][0];
						}
						// Compute the ending part, and return the final result
						let ending = "";
						if (notationType === notations.longNew)
							ending = (latinPower > 19) ? "tillion" :
								(latinPower > 0) ? "illion" : "";
						return " " + suffix + ending;
					}
					return "";

				case notations.alphabet:
					let suffix = "";
					for (let powersLeft = Math.floor(Digits / 3) - 1; powersLeft > 0;) {
						let currentPower = powersLeft % 26 + 1; // Consume some of the remaining latin powers
						powersLeft = (powersLeft - currentPower) / 26; // Update the remaining latin powers for the next iterations

						let part = String.fromCharCode(64 + currentPower); // Transform the latin powers we just took into a letter
						suffix = part + suffix; // Add the letter to our combined suffix
					}
					return " " + suffix;

				case notations.longOld:
				case notations.shortOld:
					if (Digits === -1)
						return "";

					else if (Digits <= 10)
						return " " + suffixList[0][Digits];

					else if (Digits < 10000) {
						let charAt = null,

						a1 = suffixList[1],
						a2 = suffixList[2],

						Number_1000 = Math.floor(Digits / 1000) % 10,
						Number_100  = Math.floor(Digits / 100)  % 10,
						Number_10   = Math.floor(Digits / 10)   % 10,
						Number_1    = Math.floor(Digits / 1)    % 10,

						Number_1000_String = "",
						Number_100_String = "",
						Number_10_String = "",
						Number_1_String = "",

						Number_Lillion_String = "illion";

						if (notationType === notations.shortOld) {
							Number_1000_String = suffixList[0][Number_1000];
							if (Number_1000 === 0)
								Number_1000_String = "";
							else if (Number_1000 < 4)// (Number_1000 === 1 || Number_1000 === 2 || Number_1000 === 3) {
								Number_1000_String += "i";

							if (Number_100 === 0)
								Number_100_String = "";
							else if (Number_100 === 1) {
								Number_100_String = suffixList[3][0];
								if (Number_10 + Number_1 > 0 && Number_1000 === 0)
									Number_100_String = Number_100_String.replace("e", "");
							} else {
								Number_100_String = a1[Number_100 - 1];
								if (replaceChars[0][Number_100] && Number_1000 === 0)
									Number_100_String = Number_100_String.replace(replaceChars[0][Number_100], "");
							}

							if (Number_100 === 0) {
								Number_10_String = Number_10 === 1 || Number_10 === 2 ? a2[Number_10 - 1] : a1[Number_10 - 1];
								if (Number_1 !== 0 && replaceChars[1][Number_10])
									Number_10_String = Number_10_String.replace(replaceChars[1][Number_10], "");
							} else
								Number_10_String = Number_10 === 0 ? "" :
									a2[Number_10 - 1] ?
										a2[Number_10 - 1] :
										a1[Number_10 - 1];

							if (Number_1 === 6) {
								Number_1_String = a1[Number_1 - 1];
								charAt = Number_10 === 0 ? Number_100_String.charAt(0) : Number_10_String.charAt(0);
								if (charList[0].indexOf(charAt) !== -1)
									Number_1_String = Number_1_String.replace("e", "x");
								else if (charList[1].indexOf(charAt) !== -1)
									Number_1_String = Number_1_String.replace("e", "s");
							} else if (Number_1 > 0)
								Number_1_String = a1[Number_1 - 1];

							Number_Lillion_String = "";
						} else {
							if (Number_1000 !== 0)
								Number_1000_String = suffixList[4][Number_1000 - 1];

							if (Number_100 !== 0)
								Number_100_String = suffixList[3][Number_100 - 1];

							if (Number_10 > 2) { //charList[7].indexOf(Number_10) !== -1) {
								Number_10_String = a2[Number_10 - 1];
								if (Number_1000 + Number_100 === 0) // (Number_1000 === 0 && Number_100 === 0) AND or OR ?
									Number_10_String = Number_10_String.slice(0, Number_10_String.length - 1);
								else
									Number_Lillion_String = "llion";
							} else if (Number_10 > 0) {
								Number_10_String = a2[Number_10 - 1];
								if (Number_1000 * Number_100 === 0)
									Number_Lillion_String = "llion";
							}

							if (Number_1 !== 0) {
								Number_1_String = a1[Number_1 - 1];

								charAt = Number_10 === 0 ? Number_100_String.charAt(0) : Number_10_String.charAt(0);
								if (Number_1 === 3 && charList[2].indexOf(charAt) > -1)
									Number_1_String += "s";
								else if (Number_1 === 6) {
									if (charList[3].indexOf(charAt) > -1)
										Number_1_String += "x";
									else if (charList[4].indexOf(charAt) > -1)
										Number_1_String += "s";
								} else if (Number_1 === 7 || Number_1 === 9) {
									if (charList[5].indexOf(charAt) > -1)
										Number_1_String += "n";
									else if (charList[6].indexOf(charAt) > -1)
										Number_1_String += "m";
								}
							}
						}
						return " " + capitalizeFirstLetter(String(Number_1_String + Number_10_String + Number_100_String + Number_1000_String + Number_Lillion_String).replace("iillion", "illion"));
					} else
						return "e+" + String((Digits + 1) * 3);
			}
		};
		function capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
		function checkZero(num) {
			return num < 0 ? 0 : num;
		}
	})(window.DecNum);

	// window.DecNum.set({ rounding: 4 });

	window.clock = (function() {
		let perfNow = window.performance.now ||
		window.performance.mozNow ||
		window.performance.msNow ||
		window.performance.oNow ||
		window.performance.webkitNow ||
		function() {
			return (new window.Date()).getTime();
		};

		return function() {
			//Prevent "Illegal invocation" error...
			return perfNow.call(window.performance);
		};
	})();
	
	let char_limit = 0b100000000, //16384,
			char_offset = 17,
			char_key = "AdsJnjiq893f49";
	
	function keyCharAt(key, i) {
    return key.charCodeAt(Math.floor((i + char_offset) % key.length));
	}

	function encrypt(key, count, char) {
		return ((((char ^ keyCharAt(key, count * 59) ^ 243) << 2 ^ keyCharAt(key, count + 409) ^ 623) << 5 ^ 24185 ^ keyCharAt(key, count * 739 + 15)) >> 4 ^ ((1024 + count * 1847) & 2047) ^ 1460) >> (1 + count) % 4;
	}

	function decrypt(key, count, char) {
		// return char ^ keyCharAt(key, count); // Same for encrypt
		return (((char << (1 + count) % 4 ^ 1460 ^ ((1024 + count * 1847) & 2047)) << 4 ^ keyCharAt(key, count * 739 + 15) ^ 24185) >> 5 ^ 623 ^ keyCharAt(key, count + 409)) >> 2 ^ 243 ^ keyCharAt(key, count * 59);
	}
	
	window.decompress = function (str) {
		let _loc5_ = [],
			_loc7_ = 0;

		while (_loc7_ < char_limit) {
				let _loc10_ = String.fromCharCode(_loc7_);
				_loc5_[_loc7_] = _loc10_;
				++ _loc7_;
		}

		let _loc8_ = char_limit,
			_loc2_ = "",
			_loc3_ = "",
			_loc9_ = "",
			_loc10_ = 0,
			_loc11_ = Math.floor((str.length - 1) / 2);

		_loc7_ = 0;

		while (_loc7_ < str.length) {
			//*
			let _loc6_ = decrypt(char_key, _loc7_, str.charCodeAt((_loc10_ += (_loc7_ & 1 ? 1 : -1) * _loc7_) + _loc11_)),
				_loc4_ = _loc5_[_loc6_];
			/*/
			let _loc6_ = decrypt(char_key, _loc7_, str.charCodeAt(_loc7_)),
				_loc4_ = _loc5_[_loc6_];
			//*/
			if (_loc2_ === "") {
				_loc2_ = _loc4_;
				_loc9_ += _loc4_;
			} else if (_loc6_ < char_limit) { // <= 255
				_loc9_ += _loc4_;
				_loc3_ = _loc2_ + _loc4_;
				_loc5_[_loc8_] = _loc3_;
				++ _loc8_;
				_loc2_ = _loc4_;
			} else {
				_loc3_ = _loc5_[_loc6_];
				if(!_loc3_)
					_loc3_ = _loc2_ + _loc2_[0];
				_loc9_ += _loc3_;
				_loc5_[_loc8_] = _loc2_ + _loc3_[0];
				++ _loc8_;
				_loc2_ = _loc3_;
			}
			++ _loc7_;
		}
		return _loc9_;
	};

	window.compress = function (str) {
		let _loc4_ = {},
			_loc5_ = 0,
			_loc8_ = 0,
			_loc6_ = char_limit,
			_loc3_ = "",
			_loc7_ = "";

		while (_loc5_ < char_limit) {
			_loc4_[String.fromCharCode(_loc5_)] = _loc5_;
			++ _loc5_;
		}
		_loc5_ = 0;

		while (_loc5_ <= str.length) {
			let _loc2_ = str[_loc5_];
			if(!_loc4_[_loc3_ + _loc2_]) {
				//*
				if (_loc8_ & 1)
					_loc7_ += String.fromCharCode(encrypt(char_key, _loc8_, _loc4_[_loc3_]))
				else
					_loc7_ = String.fromCharCode(encrypt(char_key, _loc8_, _loc4_[_loc3_])) + _loc7_;;
				/*/
				_loc7_ += String.fromCharCode(encrypt(char_key, _loc8_, _loc4_[_loc3_]));
				//*/
				++ _loc8_;
				_loc4_[_loc3_ + _loc2_] = _loc6_;
				++ _loc6_;
				_loc3_ = _loc2_;
			} else 
				_loc3_ += _loc2_;
			++ _loc5_;
		}
		return _loc7_;
	};

	window.rAF = (function() {
		let rAF_i = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback, element) {
				window.setTimeout(callback, 1000 / 60);
			},

		data, func, now, timeP, delayP, beforeP = clock(),

		interval, elapsed, then = beforeP,

		loop = function(queue) {
			data.queue = queue;
			if (data.maxFps === 0) {
				debugger;
			}
			interval = 1000 / data.maxFps;
			now = clock();
			elapsed = now - then;
			if (elapsed > interval) {
				then = now - (elapsed % interval);

				func(data);
				if (data.maxFps === -1) {
					return;
				}
				
				//MS and FPS calculate
				timeP = timeP || now;
				delayP = now - timeP;
				data.ms += (delayP - data.ms) / data.smooth;
				data.fps = 1000 / data.ms;
				if (data.accurate) {
					data.ms = beforeP < timeP ? data.fps : now - beforeP;
					beforeP = clock();
				}
				timeP = now;
			}
			rAF_i(loop);
		};

		data = loop;
		data.fps = 0;
		data.ms = 0;
		data.maxFps = 120;
		data.smooth = 5;
		data.accurate = false;

		return function(temp) {
			func = temp;
			loop();
			return data;
		};
	})();
})();

// The entire chromium is for testing purpose only (by disabling CORS)
// The final version I will actually upload the thing to the site
// https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome

// The command line to run the code:
// %COMSPEC% /C start /b "" ".\chromium\ungoogled-chromium-portable.exe" --args --user-data-dir="saves" --disable-web-security --allow-running-insecure-content
// If you guys wants to run your "chrome.exe" that you already have, just replace ".\chromium\ungoogled-chromium-portable.exe" with the path to that "chrome.exe"

// Local path: https://stackoverflow.com/questions/3827567 https://superuser.com/questions/518711/

// ---------------

// Reference:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
// https://stackoverflow.com/questions/29879267/es6-class-multiple-inheritance

// ---------------

// Code Standard:
// Tabs for Identation

// ---------------

/*
	TODO:
		- GUI (80%)

		- Use Font Awesome for symbol? (https://fontawesome.com/how-to-use/on-the-web/setup/hosting-font-awesome-yourself)

		- Allocate people for each currencies (NOT for each generators)

		- Add a way to rate limiting HTML rendering framerate

		- x1, x10, x100

		- Achievements

		- Game save
		
		- Dark mode

	DONE:

		- Scroll into generator view when currency is being clicked (https://stackoverflow.com/questions/5007530)
		- Drag to scroll since horizontal scrolling for currencies is not a good idea (by using js: https://htmldom.dev/drag-to-scroll/)
		- Add a way to dynamically add elements
//*/

(() =>  {
	
	// Constant
	let ZERO = new DecNum(0),
		ONE = new DecNum(1),
		TEN = new DecNum(10),
		HUNDRED = new DecNum(100),
		THOUSAND = new DecNum(1000),
		INF = new DecNum(Infinity),
		E_C = new DecNum(Math.E);

	// Game data
	let data = {
		multiply: new DecNum(1.035),
		currency: {},
		// TODO: add stuff

		settings: {
			amount: ONE,
			render: 1,
			theme: null,
			logic: 60,
			difficulty: 0, // 0: easy, 1: hard
		},
	};

	// ---- Important elements ----

	const scroll_generator_elem = window.document.getElementById("after-wrapper-interact"),
		scroll_currency_elem = window.document.getElementsByClassName("number")[0],
		generator_group_elem = window.document.getElementById("interact"),
		global_upgrade_elem = window.document.getElementById("global-upgrade"),
		achievement_popup_elem = window.document.getElementById("popup-achievement"),
			
		amount_elem = window.document.getElementById("bulk"),
		save_elem = window.document.getElementById("save"),
		achievement_elem = window.document.getElementById("achievement"),
		settings_elem = window.document.getElementById("settings");

	function number_format (num) {
		// return num.toPrecision(6); // Temporary
		// return num.toFixed(2, DecNum.DOWN).toString();
		// return num.toDP(2, DecNum.ROUND_DOWN).toString();
		return DecNum.format(num, 0, 1);
	}

	function cost_calc (base, multiply, count, amount) {
		// return 
		// base * (ratio ^ number) * (1 - (ratio ^ amount)) / (1 - ratio)
		return base.mul(multiply.pow(count)).mul(ONE.sub(multiply.pow(amount))).div(ONE.sub(multiply));
	}

	function rate_calc (base, multiply, count) {
		return base.mul(multiply.pow(count));
	}
	
	function amount_calc (currency, base, multiply, count) {
		return currency.mul(multiply.sub(ONE))
			.div(base)
			.add(multiply.pow(count))
			.log(multiply)
			.floor()
			.sub(count);
  }
	
	function update_price () {
		for (let name in data.currency)
			if (data.currency.hasOwnProperty(name)) // Temporary
				for (let i = 0; i < data.currency[name].upgrades.length; ++ i) {
					let u = data.currency[name].upgrades[i];
					if (u.owe_repeat === null) u.bulk();
					else u.owe_repeat.bulk()
				}
	}

	function drag_scroll (elem) {
		let pos = {
			top: 0, left: 0,
			x: 0, y: 0,
		};

		const mouseMoveHandler = function(e) {
			e.stopPropagation();
			
			const dx = e.clientX - pos.x,
				dy = e.clientY - pos.y;

			elem.scrollTop = pos.top - dy;
			elem.scrollLeft = pos.left - dx;
		};

		const mouseUpHandler = function(e) {
			e.stopPropagation();
			elem.style.removeProperty("user-select");

			window.document.removeEventListener("mousemove", mouseMoveHandler);
			window.document.removeEventListener("mouseup", mouseUpHandler);
		};

		const mouseDownHandler = function(e) {
			e.stopPropagation();
			pos.top = elem.scrollTop;
			pos.left = elem.scrollLeft;
			pos.x = e.clientX;
			pos.y = e.clientY;

			elem.style.userSelect = "none";
	
			window.document.addEventListener("mousemove", mouseMoveHandler);
			window.document.addEventListener("mouseup", mouseUpHandler);
		};

		elem.addEventListener("mousedown", mouseDownHandler);
	}

	drag_scroll(scroll_generator_elem);
	drag_scroll(scroll_currency_elem);
	drag_scroll(global_upgrade_elem);

	function blurryScrollGroup (wrapper, blurry, before, after, main, member, div) {
		let wrapper_div = window.document.createElement("div"),
			blurry_div = window.document.createElement("div"),
			main_div = window.document.createElement("div"),
			before_div = window.document.createElement("div"),
			after_div = window.document.createElement("div");

		wrapper_div.classList.add(wrapper);
		blurry_div.classList.add(blurry);

		before_div.classList.add(before);
		after_div.classList.add(after);
		
		before_div.classList.add(member);
		after_div.classList.add(member);

		main_div.classList.add(main);

		drag_scroll(main_div);

		main_div.appendChild(before_div);
		main_div.appendChild(after_div);

		blurry_div.appendChild(main_div);

		wrapper_div.appendChild(blurry_div);

		div.appendChild(wrapper_div);

		return main_div;
	}

	function blurryUpgradeMember (wrapper, main, div) {
		let wrapper_div = window.document.createElement("div"),
			main_div = window.document.createElement("div");

		wrapper_div.classList.add(wrapper);
		main_div.classList.add(main);

		wrapper_div.appendChild(main_div);

		div.insertBefore(wrapper_div, div.children[div.childElementCount - 1]);

		return main_div;
	}
	
	function blurryUpgradeGlobalMember (div) {
		let main_div = window.document.createElement("div");
		
		main_div.classList.add("global-upgrade-member");
		
		div.appendChild(main_div);
		
		return main_div;
	}

	function make_once_costs (costs, currency) {
		let res = [];
		for (let name in costs)
			if (costs.hasOwnProperty(name))
				res.push(new OnceCostUpgrade(costs[name]).init(data.currency[name] ? data.currency[name].currency : currency[name], null));
		return res;
	}

	function make_repeat_costs (costs, currency) {
		let res = [], temp_currency;
		for (let name in costs)
			if (costs.hasOwnProperty(name)) {
				let temp_once = new OnceCostUpgrade(ZERO);
				res.push(new RepeatCostUpgrade(
					costs[name].base, costs[name].multiply, costs[name].func
				).init(
					(temp_currency = data.currency[name] ? data.currency[name].currency : currency[name]),
					null, temp_once,
					null
				));
				temp_once.init(temp_currency, null);
			}
		return res;
	}

	// ---- Objects ----

	function Logic (func = window.noop) {
		this.func = func;
	}

	Logic.list = [];

	function GUI (func = window.noop) {
		this.func = func;
	}

	GUI.push = function (gui, parent, elem, list_mode, elem_mode) {
		if (list_mode) GUI.list.push(gui);
		if (elem_mode) parent.insertBefore(elem, parent.children[parent.childElementCount - 1]);
		else parent.appendChild(elem);
	};

	GUI.list = [];

	function OnceCostUpgrade (cost = ZERO) {
		this.cost = cost; // DecNum cost

		// ---- Internal members ----

		this.own_currency = null; // Currency (NOT CurrencyGroup)

		this.owe_upgrade = null; // OnceUpgrade

		// ---- Function members ----

		this.change_currency = function (currency) {
			this.own_currency = currency;
		};

		this.change_upgrade = function (upgrade) {
			this.owe_upgrade = upgrade;
		};

		this.price = function () {
			return this.cost;
		};

		this.bulk = function () {
			return this.cost.comparedTo(this.own_currency.num) < 1 ? ONE : ZERO;
		};

		this.buy = function () {
			this.own_currency.num = this.own_currency.num.sub(this.cost);
			Achievement.list["First x10 Buy"].check();
		};

		this.init = function (currency, upgrade) {
			this.change_currency(currency);
			this.change_upgrade(upgrade);
			return this;
		};
	}

	function RepeatCostUpgrade (cost_base, cost_multiply, cost_func = cost_calc, amount_func = amount_calc) {
		this.cost_base     = cost_base; // Base cost
		this.cost_multiply = cost_multiply;
		this.cost_func     = cost_func;

		this.amount_func = amount_func;

		// ---- Internal members ----

		this.owe_upgrade = null; // RepeatUpgrade

		this.own_once = null; // new OnceCostUpgrade(currency, ZERO)

		// ---- Function members ----

		let self = this;

		this.change_currency = function (currency) {
			this.own_once.own_currency = currency;
		};

		this.change_upgrade = function (upgrade) {
			this.owe_upgrade = upgrade;
		};

		this.change_once = function (once) {
			this.own_once = once;
			this.bulk();
		};

		this.price_raw = function (amount, count) {
			return (this.own_once.cost = this.cost_func(this.cost_base, this.cost_multiply, count, amount));
		};

		this.price = function (amount = this.bulk(data.settings.amount)) {
			return this.price_raw(amount, this.owe_upgrade.owe_generator.count.num);
		};

		this.bulk = function (amount = null, count = this.owe_upgrade ? this.owe_upgrade.owe_generator.count.num : ZERO) {
			amount = amount === null ? data.settings.amount : amount;
			if (amount.comparedTo(INF) === 0) {
				amount = this.amount_func(this.own_once.own_currency.num, this.cost_base, this.cost_multiply, count);
				this.price_raw(amount.comparedTo(ZERO) === 0 ? ONE : amount, count);
				return amount;
			}
			if (this.price_raw(amount, count).comparedTo(this.own_once.own_currency.num) === 1) return ZERO;
			return amount;
		};

		// Remember to add 1 to counter before buy
		// Must be same amount for this to work
		this.buy = function (amount = this.bulk(data.settings.amount)) {
			this.own_once.buy();
			this.price_raw(amount, this.owe_upgrade.owe_generator.count.num);
		};

		// ---- Init ----
		
		this.init = function (currency, repeat_upgrade, once, once_upgrade = null) {
			this.change_upgrade(repeat_upgrade);
			this.own_once = once;
			this.change_currency(currency);
			this.own_once.owe_upgrade = once_upgrade;
			this.bulk(null, ZERO);
			return this;
		};
	}

	function OnceUpgrade (func) {
		this.func = func;

		// ---- Internal members ----
		
		this.name = null;

		this.costs = null; // OnceCostUpgrade

		this.owe_group = null; // CurrencyGroup that this upgrade in its CurrencyGroup.upgrades

		this.owe_repeat = null; // RepeatUpgrade

		this.amount = null;

		// ---- Function members ----

		this.change_group = function (group) {
			this.owe_group = group;
		};

		this.change_name = function (name) {
			this.name = name;
		};

		this.change_repeat = function (repeat) {
			this.owe_repeat = repeat;
			if (repeat) repeat.own_once = this;
		};

		this.change_costs = function (costs) {
			this.costs = costs;
			for (let i = 0; i < this.costs.length; ++ i)
				this.costs[i].owe_upgrade = this;
		};

		this.bulk = function () {
			for (let i = 0; i < this.costs.length; ++ i)
				if(this.costs[i].bulk().comparedTo(ZERO) === 0) return (this.amount = ZERO);

			return (this.amount = ONE);
		};

		this.buy = function () {
			for (let i = 0; i < this.costs.length; ++ i)
				this.costs[i].buy();

			this.func(this); // The function to call when the upgrade being bought
		};

		// ---- Init ----
		
		this.init = function (group, name, repeat, costs) {
			this.change_group(group);
			this.change_name(name);
			this.change_repeat(repeat);
			this.change_costs(costs);

			let self = this;

			// ---- GUI ----

			let root_elem = this.owe_group === GlobalGroup ? blurryUpgradeGlobalMember(this.owe_group.gui.upgrade) :
				blurryUpgradeMember(
					"wrapper-generator-upgrade-member",
					"generator-upgrade-member",
					this.owe_group.gui.upgrade,
				),
				span_elem = window.document.createElement("span");

			root_elem.appendChild(span_elem);

			this.gui = new GUI(function () {
				// Handle Upgrade rendering
				let str = `Buy ${self.name}`, compare = self.amount.comparedTo(ONE);
				
				if (compare > -1) {
					if (compare === 1) str += ` (${self.amount.toString()})`;
					self.gui.span.style.textDecorationLine = `none`;
				} else
					self.gui.span.style.textDecorationLine = `line-through`;

				for (let i = 0; i < self.costs.length; ++ i)
					str += `<br/>${number_format(self.costs[i].cost)} ${self.costs[i].own_currency.name}`;

				self.gui.span.innerHTML = str;
			});
			this.gui.span = span_elem;
			this.gui.root = root_elem;

			GUI.list.push(this.gui);

			// ---- Logic ----
		
			if (func !== window.noop) {
				this.logic = new Logic(function () {
					self.amount = self.bulk();
					if (self.amount.comparedTo(ZERO) === 1) {
						self.buy();
						data.upgrades[self.name].buy = true;
						self.owe_group.pop_upgrade(self);
					}
				});
		
				root_elem.addEventListener("click", this.logic.func);
			}

			// ---- Finalize ----

			this.bulk();
			return this;
		};
	}

	function RepeatUpgrade () {
		// ---- Internal members ----

		this.owe_group = null; // CurrencyGroup that this upgrade in its CurrencyGroup.upgrades

		this.own_once = null; // new OnceUpgrade(group, name, once_costs, window.noop);

		this.costs = null; // RepeatCostUpgrade

		this.owe_generator = null; // Also have count


		// this.own_once.repeat = this;

		// ---- Function members ----

		this.change_group = function (group) {
			this.own_once.change_group(group);
		};

		this.change_name = function (name) {
			this.own_once.change_name(name);
		};

		this.change_once = function (once) {
			this.own_once = once;
			once.change_repeat(this);
		};

		this.change_costs = function (costs) {
			this.costs = costs;

			let once_costs = [];
			for (let i = 0; i < costs.length; ++ i) {
				costs[i].owe_upgrade = this;
				once_costs.push(costs[i].own_once); // Extract OnceCostUpgrade from RepeatCostUpgrade
			}

			this.own_once.change_costs(once_costs);
		};

		this.change_generator = function (generator) {
			this.owe_generator = generator;
		};

		this.price = function (amount) {
			for (let i = 0; i < this.costs.length; ++ i)
				this.costs[i].price(amount);
		};

		this.bulk = function (amount = data.settings.amount, count = ZERO) {
			let track = INF;
			
			if (amount.comparedTo(INF) === 0) {
				let temp;
				for (let i = 0; i < this.costs.length; ++ i) {
					temp = this.costs[i].bulk();
					if (temp.comparedTo(track) === -1) track = temp;
				}
			} else {
				track = amount;
				for (let i = 0; i < this.costs.length; ++ i)
					if (this.costs[i].bulk().comparedTo(ZERO) === 0) {
						track = ZERO;
						break;
					}
			}
			this.own_once.amount = track;
			return track;
		};

		this.buy = function (amount) {
			for (let i = 0; i < this.costs.length; ++ i)
				this.costs[i].buy(amount);
		};

		this.init = function (group, name, once, costs, generator) {
			this.change_once(once);
			this.change_group(group);
			this.change_name(name);
			this.change_costs(costs);
			this.change_generator(generator);

			let self = this;

			// ---- Logic ----

			this.own_once.logic = new Logic(function () {
				// Handle Upgrade button click
				self.own_once.amount = self.amount = self.bulk();
				if (self.amount.comparedTo(ZERO) === 1) {
					self.buy(self.amount);
					self.owe_generator.count.add(self.amount); // Handle amount add here
					self.owe_generator.product();
					// update_price();
					// TODO: new GUI handle stuff
				}
			});

			this.own_once.gui.root.addEventListener("click", this.own_once.logic.func);

			// ---- Finalize ----

			this.bulk();
			return this;
		};
	}
	
	// Fake group for API compatibility
	function GlobalGroup () {}
	
	GlobalGroup.upgrades = [];
		
	// ---- GUI ----
	
	GlobalGroup.gui = new GUI();
	
	GlobalGroup.gui.upgrade = global_upgrade_elem;
	
	GlobalGroup.push_upgrade = function (upgrade) {
		upgrade.group = GlobalGroup;
		GlobalGroup.upgrades.push(upgrade);
	};

	GlobalGroup.pop_upgrade = function (upgrade) {
		GlobalGroup.upgrades.splice(GlobalGroup.upgrades.indexOf(upgrade), 1);
		GlobalGroup.gui.upgrade.removeChild(upgrade.gui.root);
	};
	
	GlobalGroup.prototype.upgrades = GlobalGroup.upgrades;
	GlobalGroup.prototype.gui = GlobalGroup.gui;
	GlobalGroup.prototype.push_upgrade = GlobalGroup.push_upgrade;
	GlobalGroup.prototype.pop_upgrade = GlobalGroup.pop_upgrade;
	
	data.currency.Global = GlobalGroup;
	

	function CurrencyGroup (currency, count, costs, rate_base, rate_multiply, rate_func) { // Will not render anything
		this.currency = currency; // the real Currency object

		this.generators = [];
		this.upgrades = [];

		let self = this;

		// ---- GUI ----

		this.gui = new GUI();

		let root_elem = window.document.createElement("div"),
			generator_elem = blurryScrollGroup(
				"wrapper-generator-group",
				"blurry-generator-group",
				"before-group-member",
				"after-group-member",
				"generator-group",
				"generator-group-member",
				root_elem,
			),
			upgrade_elem = blurryScrollGroup(
				"wrapper-generator-upgrade",
				"blurry-generator-upgrade",
				"before-upgrade-member",
				"after-upgrade-member",
				"generator-upgrade",
				"wrapper-generator-upgrade-member", // "generator-upgrade-member",
				root_elem,
			);

		this.gui.generator = generator_elem;
		this.gui.upgrade   = upgrade_elem;
		this.gui.root      = root_elem;

		root_elem.classList.add("generator");

		GUI.push(this.gui, generator_group_elem, root_elem, false, false);

		// ---- Members ----

		this.push_generator = function (generator) { // Mostly AutoGenerator
			generator.generator.group = this;
			this.generators.push(generator);
			this.gui.generator.insertBefore(generator.gui.root, this.gui.generator.children[this.gui.generator.childElementCount - 1]);
			this.push_upgrade(generator.generator.own_repeat.own_once);
		};

		this.push_upgrade = function (upgrade) { // Mostly OnceUpgrade
			upgrade.group = this;
			this.upgrades.push(upgrade);
			// Apparently becuase of blurryUpgrade function, we cannot do this
			// But the problem is creating a new Generator will not do this at all
			// this.gui.upgrade.insertBefore(upgrade.gui.root, this.gui.upgrade.children[this.gui.upgrade.childElementCount - 1]);
		};

		this.pop_upgrade = function (upgrade) {
			this.upgrades.splice(this.upgrades.indexOf(upgrade), 1);
			this.gui.upgrade.removeChild(upgrade.gui.root.parentElement);
		};

		// ---- Manual Generator ----

		this.generators.push(new ManualGenerator(this, "Manual Click", count, costs, rate_base, rate_multiply, rate_func));
		this.push_upgrade(this.generators[0].generator.own_repeat.own_once);
		root_elem.appendChild(this.generators[0].gui.root);
	}

	function CurrencyItem (currency) { // Render the currency at the top bar
		this.currency = currency;

		let self = this;

		this.str_len = 0;

		// ---- GUI ----

		// Create currency div
		let root_elem = window.document.createElement("div"),
			span_elem = window.document.createElement("span");

		this.gui = new GUI(function () {
			let str = number_format(self.currency.num);
			if (str.length > self.str_len) self.str_len = str.length;
			
			// TODO: Also add a settings to prevent render too much (since HTML rendering is costly)
			self.gui.span.innerText = self.currency.name + ": " + str.padStart(self.str_len, " ");
		});
		this.gui.root = root_elem;
		this.gui.span = span_elem;

		root_elem.appendChild(span_elem);

		// create span and put inside div
		root_elem.classList.add("currency");

		GUI.push(this.gui, scroll_currency_elem, root_elem, true, true); // push into currency bar

		// ---- Logic ----

		this.logic = new Logic(function () {
			data.currency[self.currency.name].gui.root.scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
		});

		root_elem.addEventListener("click", this.logic.func);
	}

	function Currency (name, num = ZERO, max = null) {
		this.name = name;
		this.num = num;
		this.max = max;
	}

	function Generator (group, name, count, costs, rate_base, rate_multiply, rate_func = rate_calc) {
		this.rate_base = rate_base;
		this.rate_multiply = rate_multiply;
		this.rate_func = rate_func;

		this.rate = ZERO; // Calculated rate

		// this.currency = currency; // Currency being managed

		this.group = group; // Cannot move this.group from RepeatUpgrade to her ebecause of OnceUpgrade have it

		this.count = count; // Total bought (since each costs share counter object anyways)

		let temp_once = new OnceUpgrade(window.noop);

		temp_once.init(this.group, name, null, []);
		this.own_repeat = new RepeatUpgrade().init(group, name, temp_once, costs, this);

		this.name = name;

		let self = this;

		this.product = function () {
			return (this.rate = this.rate_func(this.rate_base, this.rate_multiply, this.count.num));
		};

		this.update = function () {
			if (self.group.currency.max === null|| self.group.currency.max.comparedTo(self.group.currency.num) === 1) {
				self.group.currency.num = self.group.currency.num.add(self.rate);
				Achievement.list["Thousand Food"].check(self);
				Achievement.list["Thousand Stone"].check(self);
			}
		};

		this.product();
	}

	function AutoGenerator (group, name, count, costs, rate_base, rate_multiply, rate_func) {
		this.generator = new Generator(group, name, count, costs, rate_base, rate_multiply, rate_func); // Generator

		let self = this;

		// ---- GUI ----

		this.gui = new GUI(function() {
			self.gui.span.innerText = `${self.generator.count.num.add(ONE).toFixed(0).toString()} ${self.generator.name}: ` +
				`${number_format(self.generator.rate)}/s`;
		});

		let root_elem = window.document.createElement("div"),
			span_elem = window.document.createElement("span");

		this.gui.root = root_elem;
		this.gui.span = span_elem;

		root_elem.appendChild(span_elem);

		root_elem.classList.add("generator-group-member");

		GUI.list.push(this.gui);

		// ---- Logic ----

		this.tick = 0;

		this.logic = new Logic(function () {
			if ((++ self.tick) % data.settings.logic === 0)
				self.generator.update();
		}); // The logic will be called for each tick

		Logic.list.push(this.logic);
	}

	function ManualGenerator (group, name, count, costs, rate_base, rate_multiply, rate_func) {
		this.generator = new Generator(group, name, count, costs, rate_base, rate_multiply, rate_func); // Generator

		let self = this;

		// ---- GUI ----

		this.gui = new GUI(function () {
			// Manual click render goes here
			// update_price();
			self.gui.span.innerHTML = `+${number_format(self.generator.rate)} ${self.generator.group.currency.name} (${self.generator.count.num.add(ONE).toString()})<br/>` +
				number_format(self.generator.group.currency.num) + (self.generator.group.currency.max === null ? "" : ` / ${number_format(self.generator.group.currency.max)}`);
		});

		let root_elem = window.document.createElement("div"),
			span_elem = window.document.createElement("span");

		this.gui.root = root_elem;
		this.gui.span = span_elem;

		root_elem.appendChild(span_elem);

		root_elem.classList.add("generator-manual");

		GUI.list.push(this.gui);

		// ---- Logic ----

		this.logic = new Logic(self.generator.update);

		root_elem.addEventListener("click", this.logic.func);
	}

	function Counter (num = ZERO) {
		this.num = num;

		this.add = function (num = data.settings.amount) {
			return (this.num = this.num.add(num));
		};
	}

	function Achievement () {
		this.gui = null;

		this.logic = null;
		
		this.done = false;
		
		this.tip = "";
		
		this.func = window.noop;
		
		this.change_func = function (func) {
			this.func = func;
		};
		
		this.change_done = function (done = false) {
			this.done = done;
		};
		
		this.change_tip = function (tip = "") {
			this.tip = tip;
			this.gui.root.setAttribute("data-tooltip", tip);
		};
		
		this.unlock = function () {
			if (!this.done) {
				this.change_done(true);
				this.gui.func(this);
			}
		};
		
		this.check = function () {
			this.logic.func(this, ...arguments);
		};
		
		this.init = function (url, tip, func, done) {
			this.change_done(done);
			this.change_func(func);

			// ---- GUI ----
			
			this.gui = new GUI(function(self) {
				self.gui.root.style.setProperty("--mode-blur-amount", "0");
				self.gui.lock.style.visibility = "hidden";
			});

			let root_elem = window.document.createElement("div"),
				lock_elem = window.document.createElement("div");

			this.gui.root = root_elem;
			this.gui.lock = lock_elem;
			this.gui.url = url;

			root_elem.style.setProperty("--image-url", `url(${this.gui.url})`);

			root_elem.appendChild(lock_elem);

			root_elem.classList.add("popup-achievement-member");
			
			achievement_popup_elem.appendChild(root_elem);

			this.change_tip(tip);

			// Only Logic can trigger GUI
			// GUI.list.push(this.gui);

			// ---- Logic ----
			
			// Only special functions can trigger achievement
			
			this.logic = new Logic(function (self, ...data) {
				if (!self.done && self.func(...arguments)) {
					self.change_done(true);
					self.gui.func(self);
				}
			});
			
			if (this.done) this.logic.func(this);
			
			return this;
		};
	}
	
	// Extra buttons and rendering
	
	function update_amount (amount_mode) {
		switch (amount_mode) {
			case 0: 
				data.settings.amount = ONE;
				amount_elem.children[0].innerText = "x1";
				break;
			case 1:
				data.settings.amount = TEN;
				amount_elem.children[0].innerText = "x10";
				break;
			case 2:
				data.settings.amount = HUNDRED;
				amount_elem.children[0].innerText = "x100";
				break;
			case 3:
				data.settings.amount = INF;
				amount_elem.children[0].innerText = "Max";
				break;
		}
	}
	
	let amount_mode = 0; // 0 1 2 3
	amount_elem.addEventListener("click", function () {
		update_amount(amount_mode = (amount_mode + 1) % 4);
		update_price();
	});
	
	GUI.list.push(new GUI(function () {
		//if (data.settings.amount.comparedTo(INF) === 0)
		update_price();
	}));
	
	let save_flag = 0, save_achiement_flag = true, save_achievement_count = 0;
	
	save_elem.addEventListener("click", function () {
		save();
		++ save_achievement_count;
		if (save_achiement_flag) {
			save_achiement_flag = false;
			window.setTimeout(function () {
				Achievement.list["Never Be Sure"].check(save_achievement_count);
				save_achievement_count = 0;
				save_achiement_flag = true;
			}, 275);
		}
		if (save_flag === 0) {
			save_flag = 1;
			save_elem.style.setProperty("--image-url", "url('https://img.icons8.com/ios-filled/100/000000/checkmark.png')");
			window.setTimeout(save_anim_func, 1500);
		} else
			save_flag = 2;
	});
	
	function save_anim_func () {
		if (save_flag === 2) {
			save_flag = 1;
			window.setTimeout(save_anim_func, 500);
		} else {
			save_elem.style.setProperty("--image-url", "url('https://img.icons8.com/ios-filled/100/000000/save.png')");
			save_flag = 0;
		}
	}
	
	let theme_elem = document.querySelector("#popup-menu-extra > div:nth-child(1) > div");
	
	// https://stackoverflow.com/questions/37801882/
	
	//determines if the user has a set theme
	// data.settings.theme = window.localStorage.getItem("civil_theme");    //default to light
	function setTheme (theme) {
		data.settings.theme = theme;
		window.document.documentElement.setAttribute("data-theme", theme);
		switch (theme) {
			case "light":
				theme_elem.children[0].children[0].checked = true;
				break;
			case "dark":
				theme_elem.children[1].children[0].checked = true;
				break;
		}
	}
	function detectTheme () {
		if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
			data.settings.theme = "dark";
		else
			data.settings.theme = "light";
		setTheme(data.settings.theme);
	}
	// if (!window.localStorage.getItem("civil_theme")) {
	// 	data.settings.theme = "light";
	// 	detectTheme();
	// } else
	// 	window.document.documentElement.setAttribute("data-theme", data.settings.theme);
	
	for (let i = 0; i < theme_elem.childElementCount; ++ i) {
		let elem = theme_elem.children[i].children[0];
		if (elem.value === data.settings.theme)
			elem.checked = true;
    elem.addEventListener("click", function() {
        //window.localStorage.setItem("civil_theme", this.value);
			setTheme(this.value);
		});
	}
	
	let render_elem = document.querySelector("#popup-menu-extra > div:nth-child(2) > input");
	render_elem.addEventListener("input", function () {
		data.settings.render = 60 / parseInt(this.value);
	});
	
	let hard_reset_elem = document.querySelector("#popup-menu-extra > div:nth-child(3) > div");
	hard_reset_elem.addEventListener("click", reset);
	
	let current_close = 0,
		wrapper_popup_elem = window.document.getElementById("wrapper-popup"),
		popup_elem = wrapper_popup_elem.children[0],
		close_elem = window.document.getElementById("popup-close"),
		menu_extra_elem = window.document.getElementById("popup-menu-extra");
	
	function hideAll (c) {
		for (let i = 1; i < popup_elem.childElementCount; ++ i) {
			if (popup_elem.children[i] === c) continue;
			popup_elem.children[i].style.display = "none";
			popup_elem.children[i].style.visibility = "hidden";
		}
	}
			
	achievement_elem.addEventListener("click", function () {
		wrapper_popup_elem.style.opacity = "1";

		hideAll(achievement_popup_elem);
		achievement_popup_elem.style.display = "inline-flex";
		wrapper_popup_elem.style.visibility = achievement_popup_elem.style.visibility = "visible";

		current_close = 2;
	});
	
	settings_elem.addEventListener("click", function () {
		wrapper_popup_elem.style.opacity = "1";

		hideAll(settings_elem);
		menu_extra_elem.style.display = "flex";
		wrapper_popup_elem.style.visibility = menu_extra_elem.style.visibility = "visible";

		current_close = 1;
	});

	close_elem.addEventListener("click", function () {
		wrapper_popup_elem.style.opacity = "0";

		setTimeout(function () {
			wrapper_popup_elem.style.visibility = "hidden";
			hideAll();
		}, 500);

		current_close = 0;
	});
  
	
	function save () {
		let stuff = {
			currencies: {},
			upgrades: {
				now: [],
				done: [],
			},
			achievement: [],
		};
		
		for (let name in data.currency)
			if (data.currency.hasOwnProperty(name) && name !== "Global") {
				let s = stuff.currencies[name] = {}, c = data.currency[name];
				s.name = c.currency.name;
				s.num = c.currency.num.toJSON();
				s.max = c.currency.max ? c.currency.max.toJSON() : null;
				s.generators = [];
				for (let i = 0; i < c.generators.length; ++ i) {
					let g = c.generators[i].generator, t = {
						name: g.name,
						costs: {},
						rate_base: g.rate_base.toJSON(),
						rate_multiply: g.rate_multiply.toJSON(),
						count: g.count.num.toJSON(),
					};
					for (let j = 0; j < g.own_repeat.costs.length; ++ j) {
						let o = g.own_repeat.costs[j];
						t.costs[o.own_once.own_currency.name] = {
							base: o.cost_base.toJSON(),
							multiply: o.cost_multiply.toJSON(),
						};
					}
					s.generators.push(t);
				}
				s.upgrades = [];
				for (let i = 0; i < c.upgrades.length; ++ i) {
					let u = c.upgrades[i];
					if (u.owe_repeat === null)
						s.upgrades.unshift(u.name);
				}
			}
		for (let i = 0; i < data.currency.Global.upgrades.length; ++ i)
			stuff.upgrades.now.unshift(data.currency.Global.upgrades[i].name);
		for (let name in data.upgrades)
			if (
				data.upgrades.hasOwnProperty(name) &&
				data.upgrades[name].buy &&
				stuff.upgrades.now.indexOf(name) === -1
			) stuff.upgrades.done.push(name);
		
		stuff.settings = {};
		
		for (let name in data.settings)
			if (data.settings.hasOwnProperty(name))
				stuff.settings[name] = data.settings[name];
			
		stuff.settings.amount = amount_mode;
		
		for (let name in Achievement.list)
			if (Achievement.list.hasOwnProperty(name) && Achievement.list[name].done)
				stuff.achievement.push(name);
		
		window.localStorage.setItem("civil_save", window.compress(window.btoa(window.JSON.stringify(stuff))));
	}
	
	window.civil_save_raw = function (str) {
		window.localStorage.setItem("civil_save", window.compress(window.btoa(str)));
	};
	
	function reset () {
		window.localStorage.removeItem("civil_save");
		// window.localStorage.removeItem("civil_theme");
		// detectTheme();
		// window.localStorage.setItem("civil_theme", data.settings.theme);
		if (window.CP)
			window.location.href = window.location.href;
		else
			location.reload();
	}

	// Game stuff
	(() => {
		function make_currency (name, num, cost_base, cost_multiply, rate_base, rate_multiply, cost_more = {}, counter = ZERO) {
			let temp_currency = new Currency(name, num),
				temp_cost = {
					[name]: {
						base: cost_base,
						multiply: cost_multiply,
					},
				};

			temp_cost = {...cost_more, ...temp_cost};

			data.currency[name] = new CurrencyGroup(
				temp_currency, new Counter(counter),
				make_repeat_costs(temp_cost, {
					[name]: temp_currency
				}),
				rate_base, rate_multiply,
			);
			new CurrencyItem(data.currency[name].currency);
		}

		function make_upgrade_generator (name, group, cost_unlock, cost_repeat, rate, multiply = data.multiply, count_out = new Counter(ZERO)) {
			return {
				group: group,
				cost: cost_unlock,
				func: function (self) {
					Achievement.list["First Gernerator"].unlock();
					if (rate.comparedTo(TEN) === 0) Achievement.list["First 10/s Gernerator"].unlock();
					self.group.push_generator(new AutoGenerator(
						data.currency[group], name, count_out,
						make_repeat_costs(cost_repeat),
						rate, multiply,
					));
				},
				type: 1,
			};
		}
			
		function unlock_upgrade (name) {
			data.currency[data.upgrades[name].group].push_upgrade(new OnceUpgrade(
				data.upgrades[name].func
			).init(
				data.currency[data.upgrades[name].group], name,
				null, make_once_costs(data.upgrades[name].cost), 
			));
			data.upgrades[name].unlock = true;
		}
	
		function load() {
			let stuff = JSON.parse(window.atob(window.decompress(window.localStorage.getItem("civil_save")))),
					find_manual = (v) => v.name === "Manual Click";

			for (let name in stuff.currencies)
				if (stuff.currencies.hasOwnProperty(name)) {
					let s = stuff.currencies[name],
						g = s.generators.find(find_manual),

						m = {};

					for (let cost in g.costs)
						if (g.costs.hasOwnProperty(cost) && cost !== name)
							m[cost] = {
								base: new DecNum(g.costs[cost].base),
								multiply: new DecNum(g.costs[cost].multiply),
							};

					make_currency(
						s.name, new DecNum(s.num),
						new DecNum(g.costs[name].base), new DecNum(g.costs[name].multiply),
						new DecNum(g.rate_base), new DecNum(g.rate_multiply),
						m, new DecNum(g.count)
					);
				}
			
			// Second loop, kinda nasty but necessary to make all currencies to be loaded
			for (let name in stuff.currencies)
				if (stuff.currencies.hasOwnProperty(name)) {
					let s = stuff.currencies[name];
					
					// Load generators
					for (let i = 1; i < s.generators.length; ++ i) {
						let u = s.generators[i], t = {};
						for (let cost in s.generators[i].costs)
							if (s.generators[i].costs.hasOwnProperty(cost)) {
								let c = s.generators[i].costs[cost];
								t[cost] = {
									base: new DecNum(c.base),
									multiply: new DecNum(c.multiply),
								};
							}
						data.currency[name].push_generator(new AutoGenerator(
							data.currency[name], u.name, new Counter(new DecNum(u.count)),
							make_repeat_costs(t),
							new DecNum(u.rate_base), new DecNum(u.rate_multiply),
						));
					}
					
					// Load upgrades
					for (let i = 1; i < s.upgrades.length; ++ i)
						unlock_upgrade(s.upgrades[i]);
				}
			
			// Load upgrades
			for (let i = 0; i < stuff.upgrades.now.length; ++ i)
				unlock_upgrade(stuff.upgrades.now[i]);

			for (let i = 0; i < stuff.upgrades.done.length; ++ i) {
				let u = stuff.upgrades.done[i];
				if (data.upgrades[u].type === 0) data.upgrades[u].func();
				data.upgrades[u].unlock = true;
				data.upgrades[u].buy = true;
			}
			
			// Load settings
			for (let name in stuff.settings)
				if (stuff.settings.hasOwnProperty(name))
					data.settings[name] = stuff.settings[name];

			update_amount(stuff.settings.amount);
			render_elem.value = String(60 / data.settings.render);
			setTheme(data.settings.theme);
			
			// Load achievement
			for (let i = 0; i < stuff.achievement.length; ++ i)
				Achievement.list[stuff.achievement[i]].unlock();
		}
		
		/*
		let
			cost_scale            = [   10,   27.5,   75.5,     205,      575,     1570],
			cost_gt1_scale        = [13.75,  37.75,    105,     285,      785,     2160],
			cost_gt2_scale        = [37.75,    105,  285.5,     785,     2160,     5950],
			cost_gt3_scale        = [102.5, 280.75, 775.25, 2130.65,   5860.5, 16120.85],
			cost_gt4_scale        = [287.5, 790.65,   2175,    5980, 16440.55,    45215],
			cost_lt1_scale        = [],
			cost_lt2_scale        = [],
			cost_lt3_scale        = [],
			cost_lt4_scale        = [],
			rate_scale            = [    1,    2.5,   6.25,   15.75,       40,      100],

		gen_table = [
			["Manual", "Farm",     "Barn",      "Ranch", "Pasture" ],
			["Manual", "Lumber",   "Saw",       "Mill",  "Forestry"],
			["Manual", "Quarry",   "Cutter",    "Grinder"],
			["Manual", "Colliery", "Extractor", "Washer" ],
			["Manual", "Mine",     "Smelter"],
		],
		currency_table = [
			["a",    "a",    "a",     "ab",    "a.."   ],
			["b",    "b",    "ba",    "bc",    "b.."   ],
			["c",    "cb",   "c.",    "cd.",   "c..."  ],
			["da",   "da",   "d..",   "de.",   "d..."  ],
			["eb",   "e..",  "e..",   "ef..",  "e...." ],
			["fc",   "f..",  "f...",  "fg..",  "f...." ],
			["gabd", "g...", "g...",  "gh...", "g....."],
			["hace", "h...", "h....", "hi...", "h....."],
			["ibcf", "", "", "", ""],
		];
		//*/

		// ["a",    "a",    "a",     "ab",    "acd"   ],
		// ["b",    "b",    "ba",    "bc",    "bde"   ],
		// ["c",    "ca",   "cb",    "cbd",   "caef"  ],
		// ["da",   "dc",   "dca",   "dbe",   "dbfg"  ],

		Achievement.list = {
			["First Gernerator"]: new Achievement().init(
				"https://img.icons8.com/ios/50/000000/delivery-time.png",
				"Buy first generator",
				function () {
					return true;
				}),
			["First 10/s Gernerator"]: new Achievement().init(
				"https://img.icons8.com/ios/50/000000/factory-1.png",
				"Buy first 10/s generator. That was very productive!",
				function () {
					return true;
				}),
			["Thousand Food"]: new Achievement().init(
				"https://img.icons8.com/ios/50/000000/bread.png",
				"What will you do with a thousand food? Eat it of course!",
				function (self, gen) {
					if (gen.group === data.currency.Food)
						return data.currency.Food.currency.num.comparedTo(THOUSAND) > -1;
					return false;
				}),
			["Thousand Stone"]: new Achievement().init(
				"https://img.icons8.com/ios/50/000000/mountain.png",
				"Legend said by having a thousand stones, one can build a house!",
				function (self, gen) {
					if (gen.group === data.currency.Stone)
						return data.currency.Stone.currency.num.comparedTo(THOUSAND) > -1;
				}),
			["First x10 Buy"]: new Achievement().init(
				"https://img.icons8.com/ios/50/000000/10.png",
				"Buy upgrades using x10 amounts. Wow that's expensive!",
				function () {
					return data.settings.amount.comparedTo(TEN) === 0;
				}),
			["Never Be Sure"]: new Achievement().init(
				"https://img.icons8.com/ios/50/000000/save-all.png",
				"One is enough. Two is just enough. Three is more than enough.",
				function (self, count) {
					return count > 2;
				}),
		};

		data.upgrades = {
			["First Farm"]: make_upgrade_generator(
				"Farm", "Food", {
					Food: new DecNum(20),
				}, {
					Food: {
						base: new DecNum(10),
						multiply: data.multiply,
					},
				},
				ONE,
			),
			["First Barn"]: make_upgrade_generator(
				"Barn", "Food", {
					Food: new DecNum(50),
				}, {
					Food: {
						base: new DecNum(25),
						multiply: data.multiply,
					},
				},
				new DecNum(2.5),
			),
			["First Ranch"]: make_upgrade_generator(
				"Ranch", "Food", {
					Food: new DecNum(100),
					Wood: new DecNum(25),
				}, {
					Food: {
						base: new DecNum(50),
						multiply: data.multiply,
					},
					Wood: {
						base: new DecNum(12.5),
						multiply: data.multiply,
					},
				},
				new DecNum(5),
			),
			["First Pasture"]: make_upgrade_generator(
				"Pasture", "Food", {
					Food: new DecNum(1000),
					Stone: new DecNum(200),
					Coal: new DecNum(50),
				}, {
					Food: {
						base: new DecNum(500),
						multiply: data.multiply,
					},
					Stone: {
						base: new DecNum(100),
						multiply: data.multiply,
					},
					Coal: {
						base: new DecNum(25),
						multiply: data.multiply,
					},
				},
				new DecNum(10),
			),

			// ---- Wood ----

			["First Wood"]: {
				group: "Global",
				cost: {
					Food: new DecNum(75),
				},
				func: function (self) {
					make_currency("Wood", new DecNum(0), new DecNum(10), data.multiply, new DecNum(1), data.multiply);
				},
				type: 2,
			},
			["First Lumber"]: make_upgrade_generator(
				"Lumber", "Wood", {
					Wood: new DecNum(20),
				}, {
					Wood: {
						base: new DecNum(10),
						multiply: data.multiply,
					},
				},
				ONE,
			),
			["First Saw"]: make_upgrade_generator(
				"Saw", "Wood", {
					Food: new DecNum(75),
					Wood: new DecNum(50),
				}, {
					Food: {
						base: new DecNum(37.5),
						multiply: data.multiply,
					},
					Wood: {
						base: new DecNum(25),
						multiply: data.multiply,
					},
				},
				new DecNum(2.5),
			),
			["First Mill"]: make_upgrade_generator(
				"Mill", "Wood", {
					Food: new DecNum(200),
					Wood: new DecNum(100),
					Stone: new DecNum(25),
				}, {
					Food: {
						base: new DecNum(100),
						multiply: data.multiply,
					},
					Wood: {
						base: new DecNum(50),
						multiply: data.multiply,
					},
					Stone: {
						base: new DecNum(12.5),
						multiply: data.multiply,
					},
				},
				new DecNum(5),
			),
			["First Forestry"]: make_upgrade_generator(
				"Forestry", "Wood", {
					Wood: new DecNum(1000),
					Stone: new DecNum(200),
					Coal: new DecNum(50),
				}, {
					Wood: {
						base: new DecNum(500),
						multiply: data.multiply,
					},
					Stone: {
						base: new DecNum(100),
						multiply: data.multiply,
					},
					Coal: {
						base: new DecNum(25),
						multiply: data.multiply,
					},
				},
				new DecNum(10),
			),

			// ---- Stone ----

			["First Stone"]: {
				group: "Global",
				cost: {
					Food: new DecNum(225),
					Wood: new DecNum(75),
				},
				func: function (self) {
					make_currency("Stone", new DecNum(0), new DecNum(10), data.multiply, new DecNum(1), data.multiply);
				},
				type: 2,
			},
			["First Quarry"]: make_upgrade_generator(
				"Quarry", "Stone", {
					Stone: new DecNum(20),
				}, {
					Stone: {
						base: new DecNum(10),
						multiply: data.multiply,
					},
				},
				ONE,
			),
			["First Cutter"]: make_upgrade_generator(
				"Cutter", "Stone", {
					Wood: new DecNum(75),
					Stone: new DecNum(50),
				}, {
					Wood: {
						base: new DecNum(37.5),
						multiply: data.multiply,
					},
					Stone: {
						base: new DecNum(25),
						multiply: data.multiply,
					},
				},
				new DecNum(2.5),
			),
			["First Grinder"]: make_upgrade_generator(
				"Grinder", "Stone", {
					Wood: new DecNum(200),
					Stone: new DecNum(100),
					Coal: new DecNum(25),
				}, {
					Wood: {
						base: new DecNum(100),
						multiply: data.multiply,
					},
					Stone: {
						base: new DecNum(50),
						multiply: data.multiply,
					},
					Coal: {
						base: new DecNum(12.5),
						multiply: data.multiply,
					},
				},
				new DecNum(5),
			),

			// ---- Coal ----

			["First Coal"]: {
				group: "Global",
				cost: {
					Food: new DecNum(675),
					Wood: new DecNum(225),
					Stone: new DecNum(75),
				},
				func: function (self) {
					make_currency("Coal", new DecNum(0), new DecNum(10), data.multiply, new DecNum(1), data.multiply, {
						Wood: {
							base: new DecNum(112.5),
							multiply: data.multiply,
						},
					});
				},
				type: 2,
			},
			["First Colliery"]: make_upgrade_generator(
				"Colliery", "Coal", {
					Stone: new DecNum(50),
					Coal: new DecNum(20),
				}, {
					Stone: {
						base: new DecNum(25),
						multiply: data.multiply,
					},
					Coal: {
						base: new DecNum(10),
						multiply: data.multiply,
					},
				},
				ONE,
			),
			["First Extractor"]: make_upgrade_generator(
				"Extractor", "Coal", {
					Wood: new DecNum(300),
					Stone: new DecNum(150),
					Coal: new DecNum(50),
				}, {
					Wood: {
						base: new DecNum(150),
						multiply: data.multiply,
					},
					Stone: {
						base: new DecNum(75),
						multiply: data.multiply,
					},
					Coal: {
						base: new DecNum(20),
						multiply: data.multiply,
					},
				},
				new DecNum(2.5),
			),
			["First Washer"]: make_upgrade_generator(
				"Washer", "Coal", {
					Food: new DecNum(1500),
					Wood: new DecNum(750),
					Coal: new DecNum(100),
					Iron: new DecNum(25),
				}, {
					Food: {
						base: new DecNum(750),
						multiply: data.multiply,
					},
					Wood: {
						base: new DecNum(375),
						multiply: data.multiply,
					},
					Coal: {
						base: new DecNum(50),
						multiply: data.multiply,
					},
					Iron: {
						base: new DecNum(12.5),
						multiply: data.multiply,
					},
				},
				new DecNum(5),
			),

			// ---- Iron ----

			["First Iron"]: {
				group: "Global",
				cost: {
					Food: new DecNum(2025),
					Wood: new DecNum(675),
					Stone: new DecNum(225),
					Coal: new DecNum(75),
				},
				func: function (self) {
					make_currency("Iron", new DecNum(10000), new DecNum(10), data.multiply, new DecNum(1), data.multiply, {
						Food: {
							base: new DecNum(1012.5),
							multiply: data.multiply,
						},
						Stone: {
							base: new DecNum(112.5),
							multiply: data.multiply,
						},
					});
				},
				type: 2,
			},
			["First Mine"]: make_upgrade_generator(
				"Mine", "Iron", {
					Food: new DecNum(1250),
					Wood: new DecNum(750),
					Iron: new DecNum(20),
				}, {
					Food: {
						base: new DecNum(625),
						multiply: data.multiply,
					},
					Wood: {
						base: new DecNum(375),
						multiply: data.multiply,
					},
					Iron: {
						base: new DecNum(10),
						multiply: data.multiply,
					},
				},
				ONE,
			),
			["First Smelter"]: make_upgrade_generator(
				"Smelter", "Iron", {
					Wood: new DecNum(1000),
					Stone: new DecNum(500),
					Coal: new DecNum(75),
					Iron: new DecNum(50),
				}, {
					Wood: {
						base: new DecNum(500),
						multiply: data.multiply,
					},
					Stone: {
						base: new DecNum(250),
						multiply: data.multiply,
					},
					Coal: {
						base: new DecNum(37.5),
						multiply: data.multiply,
					},
					Iron: {
						base: new DecNum(25),
						multiply: data.multiply,
					},
				},
				new DecNum(2.5),
			),
		};

		Logic.list.push(new Logic(function () {
			for (let name in data.upgrades) {
        if (data.upgrades.hasOwnProperty(name)) {
          let flag = false;
          for (let cost in data.upgrades[name].cost)
            if (!data.currency[cost] || data.upgrades[name].cost[cost].comparedTo(data.currency[cost].currency.num) === 1) {
              flag = true;
              break;
            }
          if (flag) continue;
          if (!data.upgrades[name].unlock)
						unlock_upgrade(name);
        }
			}
		}));
		
		if (window.localStorage.getItem("civil_save") === null) {
			let difficulty_elem = window.document.getElementById("popup-difficulty");
			hideAll(difficulty_elem);
			wrapper_popup_elem.style.visibility = difficulty_elem.style.visibility = "visible";
			wrapper_popup_elem.style.opacity = "1";
			close_elem.style.visibility = "hidden";
			// menu_extra_elem.style.display = "none";
			detectTheme();
			for (let i = 1; i < difficulty_elem.childElementCount; ++ i)
				difficulty_elem.children[i].addEventListener("click", function () {
					switch (data.settings.difficulty = i - 1) {
						case 0:
							data.settings.logic = 10;
							break;
						case 1:
							data.settings.logic = 60;
							break;
					}
					wrapper_popup_elem.style.opacity = "0";
					setTimeout(() => {
						close_elem.style.visibility = "inherit";
						wrapper_popup_elem.style.visibility = difficulty_elem.style.visibility = "hidden";
						hideAll();
					}, 500);
					make_currency("Food", new DecNum(0), new DecNum(10), data.multiply, new DecNum(1), data.multiply);
				});
		} else
			load();

		let frame = {
			fps: 60,
			ms: 0,
			smooth: 5,
			maxFps: 60,
			count: 0,
		};

		function loop (frame_data) {
			for (let i = 0; i < Logic.list.length; ++ i)
				Logic.list[i].func();
			if (++ frame.count >= data.settings.render) {
				for (let i = 0; i < GUI.list.length; ++ i)
					GUI.list[i].func();
				frame.count -= data.settings.render;
			}

			frame.fps = frame_data.fps;
			frame.ms = frame_data.ms;
			frame_data.maxFps = frame.maxFps;
			frame_data.smooth = frame.smooth;
		}
		window.civil_save = save;
		window.civil_data = data;
		window.civil_reset = reset;
		window.document.addEventListener("DOMContentLoaded", function init () {
			window.rAF(loop);
		});
	})();
})();

		//local storage is used to override OS theme settings
		/*
		if (!window.matchMedia)
			//matchMedia method not supported
			return false;
		else if (
			window.matchMedia("(prefers-color-scheme: dark)").matches ||
			window.localStorage.getItem("civil_theme") === "dark"
		) //OS theme setting detected as dark
			data.settings.theme = "dark";

		//dark theme preferred, set document with a `data-theme` attribute
		if (data.settings.theme === "dark")
			window.document.documentElement.setAttribute("data-theme", "dark");
		//*/
		
            // data.currency[data.upgrades[name].group].push_upgrade(new OnceUpgrade(
            //   data.upgrades[name].func
            // ).init(
            //   data.currency[data.upgrades[name].group], name,
            //   null, make_once_costs(data.upgrades[name].cost), 
            // ));
            // data.upgrades[name].unlock = true;

		/*
			{
				currencies: {
					Food: {
						num: "",
						max: "",
						generators: [
							{
								name: "Manual Click",
								costs: {
									Food: {
										base: "",
										multiply: "",
									},
									Wood: {
										base: "",
										multiply: "",
									},
								},
								rate_base: "",
								rate_multiply: "",
								count: "",
							}, {
								name: "Farm",
								costs: {
									Food: {
										base: "",
										multiply: "",
									},
								},
								rate_base: "",
								rate_multiply: "",
								count: "",
							}
						],
						upgrades: [ // ONLY OnceUpgrade, ignore OnceUpgrade that have RepeatUpgrade
							"First Farm"
						],
					}
				},
				upgrades: {
					now: [
						"First Wood"
					],
					done: [
						"First Barn" // store all bought OnceUpgrade data here instead of split them apart
					],
				},
			}
		*/

				//if (name === "Global") continue;
				//for (let i = 0; i < data.currency[name].generators.length; ++ i) //{
					//if (data.currency[name].gene[i] instanceof RepeatUpgrade)
						// console.log(data.currency[name]);
				//	debugger;
						//data.currency[name].generators[i].generator.own_repeat.bulk();
				//}

		// for (let i = 0; i < data.currency.Global.upgrades.length; ++ i)
		// 	//if (data.currency.Global.upgrades[i] instanceof RepeatUpgrade)
		// 		data.currency.Global.upgrades[i].bulk();
    // return math.eval("floor(log(money / cost / base + 1) / log(ratio))", {
    //   money: stats.money.current,
    //   cost: cost,
    //   base: base,
    //   ratio: ratio,
		// });
		
		// upgrade.cost.currency.num;
		// upgrade.count.num;
		// upgrade.cost_base;
		// upgrade.cost_multiply;
		
		// return currency.mul(base).div(cost).add(ONE).log().div(ratio.log()).floor();

		// switch (data.settings.amount) {
		// 	case ONE:
		// 		return ONE;
		// 	case TEN:
		// 		return TEN;
		// 	case HUNDRED:
		// 		return HUNDRED;
		// }

		// Food: new OnceUpgrade(
		// 	data.currency.Food, "Unlock Farm",
		// 	new DecNum(20), function (self) {
		// 		self.group.push_generator(new AutoGenerator(
		// 			data.currency.Food, "Farm",
		// 			new DecNum(10), data.multiply,
		// 		));
		// 	}
		// ),

		// ---- GUI ----

		// let root_elem = blurryUpgradeMember(
		// 	"wrapper-generator-upgrade-member",
		// 	"generator-upgrade-member",
		// 	group.gui.upgrade,
		// ),
		// span_elem = window.document.createElement("span");

		// root_elem.appendChild(span_elem);

		// this.gui = new GUI(function () {
		// 	// Handle Upgrade rendering
		// 	self.gui.span.innerHTML = `Buy ${self.name}<br/>cost`;
		// });
		// this.gui.span = span_elem;
		// this.gui.root = root_elem;

		// GUI.list.push(this.gui);

// Trash:

	// class Button {
	// 	gui_box_i = null;
	// 	func_i = window.noop;

	// 	constructor (parent, elem, x, y, w, h, text, text_color, bg_color, func = window.noop) {
	// 		this.gui_box_i = new GUIButton(parent, elem, x, y, w, h, text, text_color, bg_color);
	// 		this.func_i = func;

	// 		this.gui_box_i.elem.addEventListener("click", func, false);

	// 		// TODO: we needs to do the "call function ONLY when click the button"
	// 	}

	// 	get gui_box () {
	// 		return this.gui_box_i;
	// 	}
	// }

	// let buttons = []; // Temporary

	
		//buttons.push(new Button(window.document, window.document.createElement("button"), 100, 100, 100, 100, "Testing", "blue", ""));


		// for (let i = 0; i < buttons.length; ++ i) {
		// 	GUIManager.add("button1", buttons[i].gui_box);
		// 	document.body.appendChild(buttons[i].gui_box.elem);
		// }



	// class GUIBox extends GUIMember {
	// 	x_i = 0;
	// 	y_i = 0;
	// 	w_i = 0;
	// 	h_i = 0;

	// 	constructor (parent, elem, x, y, w, h) {
	// 		super(parent, elem, ""); // TODO: maybe empty string for style?
	// 		this.x_i = x;
	// 		this.y_i = y;
	// 		this.w_i = w; // width
	// 		this.h_i = h; // height

	// 		this.elem_i.style.position = "absolute";
	// 	}

	// 	// TODO: set x, y, w, h by changing css
	// 	render () {
	// 		this.elem_i.style.left = this.x_i + "px";
	// 		this.elem_i.style.top = this.y_i + "px";
	// 		this.elem_i.style.width = this.w_i + "px";
	// 		this.elem_i.style.height = this.h_i + "px";
	// 		super.render();
	// 	}
	// }

	// class GUIButton extends GUIBox {
	// 	text_i = "";
	// 	text_color_i = "red";
	// 	bg_color_i = "red";

	// 	constructor (parent, elem, x, y, w, h, text, text_color, bg_color) {
	// 		super(parent, elem, x, y, w, h, text, text_color, bg_color);
	// 		this.text_i = text;
	// 		this.text_color_i = text_color;
	// 		this.bg_color_i = bg_color;
	// 	}

	// 	set text (text) {
	// 		return (this.text_i = text);
	// 	}

	// 	get text () {
	// 		return this.text_i;
	// 	}

	// 	set text_color (text_color) {
	// 		return (this.text_color_i = text_color);
	// 	}

	// 	get text_color () {
	// 		return this.text_color_i;
	// 	}

	// 	render () {
	// 		this.elem_i.innerText = this.text_i;
	// 		this.elem_i.style.color = this.text_color;
	// 		this.elem_i.style.backgroundColor = this.bg_color_i;
	// 		super.render();
	// 	}
	// }
