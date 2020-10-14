(() => {
	// Library code

	// Why? Because we may change the actual library later
	window.DecNum = Decimal;
	window.noop = function() {};

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
		- Drag to scroll since horizontal scrolling for currencies is not a good idea (by using js: https://htmldom.dev/drag-to-scroll/)
		- Add a way to dynamically add elements

		- Add a way to rate limiting HTML rendering framerate

		- Maybe using Font Awesome for symbol? (https://fontawesome.com/how-to-use/on-the-web/setup/hosting-font-awesome-yourself)

		- Click on currency will jump scroll to that equivalent generator

		- Allocate people for each currencies (NOT for each generators)

		- x1, x10, x100

	DONE:

		- Scroll into generator view when currency is being clicked (https://stackoverflow.com/questions/5007530)
//*/

(() => {
	// Constant
	let ZERO = new DecNum(0),
		ONE = new DecNum(1);

	// Game data
	let data = {
		// TODO: add stuff
	};

	// ----------------

	// Generic manager
	class Manager {
		static obj = new Map();

		constructor () {
			this.prototype.constructor.obj = new Map();
		}

		static get (key) {
			return this.prototype.constructor.obj.get(key);
		}

		static add (key, obj) {
			this.prototype.constructor.obj.set(key, obj);
		}

		static update () {
			this.prototype.constructor.obj.forEach(this.prototype.constructor.loop);
		}

		static loop (val, key, map) {
			// Intentionally left blank
		}
	}

	// // This should the class that contains everything UI element related
	class GUIManager extends Manager {
		static obj = new Map();

		static loop (val, key, map) {
			val.render(); // The actual rendering
		}
	}

	class GUIMember {
		parent_i = null;

		constructor (parent, elem) {
			this.parent_i = parent;
			this.elem_i = elem;
		}
		
		set parent (parent) {
			return (this.parent_i = parent);
		}

		get parent () {
			return this.parent_i;
		}
		
		set elem (elem) {
			return (this.elem_i = elem);
		}

		get elem () {
			return this.elem_i;
		}

		render () {
			// Intentionally left empty
		}
	}

	// This class is for stuff like game logic (ex: generator, ...)
	// Therefore this should loop over every element
	class LogicManager extends Manager {
		static obj = new Map();

		static loop (val, key, map) {
			val.exec();
		}
	}

	// Empty
	class LogicMember {
		constructor () {}

		exec () {
			// return this.func_i(...arguments);
		}
	}

	// Important elements

	const scroll_generator_elem = window.document.getElementById("after-wrapper-interact");
		scroll_currency_elem = window.document.getElementsByClassName("number")[0],
		generator_group_elem = window.document.getElementById("interact");

	function number_format (num) {
		// return num.toPrecision(6); // Temporary
		return num.toFixed(2, DecNum.DOWN).toString();
	}

	function cost_calc (base, multiply, count, amount) {
		// return 
		// base * (ratio ^ number) * (1 - (ratio ^ amount)) / (1 - ratio)
		return base.mul(multiply.pow(count)).mul(ONE.sub(multiply.pow(amount))).div(ONE.sub(multiply));
	}

	function rate_calc (base, multiply, count) {
		return base.mul(multiply.pow(count));
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
	};

	drag_scroll(scroll_generator_elem);
	drag_scroll(scroll_currency_elem);

	// Generator

	class BaseGenerator {
		count_i = null;

		base_cost_i = null; // base cost. TODO: support multiple currency?
		multiply_cost_i = null;

		base_rate_i = null;
		multiply_rate_i = null;

		func_cost_i = null;
		func_rate_i = null;

		cache_cost_i = null;
		cache_rate_i = null;

		currency_i = null; // currency. TODO: support multiple currency?

		avail_i = false;

		constructor (func_cost, func_rate, base_cost, base_rate, currency) {
			this.base_cost_i = base_cost;
			this.multiply_cost_i = new DecNum(1.075);
			this.count_i = ZERO;
			this.func_cost_i = func_cost;
			this.func_rate_i = func_rate;

			this.base_rate_i = base_rate;
			this.multiply_rate_i = new DecNum(1.075);

			this.cost(ONE);
			this.rate;

			this.currency_i = currency;
		}

		buy (amount = ONE) {	// Did not check for cost for performance reason
			this.currency_i.num.num = this.currency_i.num.num.sub(this.cache_cost_i);
			this.count_i = this.count_i.add(ONE);
			this.cost(ONE);
			this.rate; // call the get rate func
		}

		cost (amount = ONE) { // Update when
			return (this.cache_cost_i = this.func_cost_i(this.base_cost_i, this.multiply_cost_i, this.count_i, amount));
		}

		update (num) {
			return num.add(this.cache_rate_i);
		}

		get rate () { // Update when
			return (this.cache_rate_i = this.func_rate_i(this.base_rate_i, this.multiply_cost_i, this.count_i));
		}
		
		get check () {
			return this.cache_cost_i.comparedTo(this.currency_i.num.num) === -1; // FOr performance reason
		}

		get cache_rate () {
			return this.cache_rate_i;
		}

		get cache_cost () {
			return this.cache_cost_i;
		}

		get count () {
			return this.count_i;
		}

		get avail () {
			return this.avail_i;
		}

		set avail (avail) {
			return (this.avail_i = avail);
		}
	}

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

	class LogicGeneratorGroup extends LogicMember { // Handle the people thingy
		// elem_i = null;

		// constructor () {
		// 	super();
		// }

		// render () {

		// }
	}

	class GUIGeneratorGroup extends GUIMember { // Manual rendering
		group_i = null;
		elem_i = null;

		constructor (group, parent, elem) {
			super(parent, elem);

			this.group_i = group;
			this.elem_i = elem;
		}
		render () {
			this.elem_i.innerHTML = `+${number_format(this.group_i.generator[0].cache_rate)} ${this.group_i.name} (${number_format(this.group_i.people)})<br/>` +
				number_format(data.currency[this.group_i.name].num.num) + (this.group_i.max ? ` / ${number_format(this.group_i.max)}` : ""); // Temporary
		}
	}

	class GeneratorGroup {
		name_i = null; // Name of this generator

		gui_i = null; // 

		currency_gui_i = null;

		people_i = null; // People bonus to be assigned
		generator_i = []; // 0 will be manual BaseGenerator, everything else will be BaseGenerator from GeneratorGroupMember
		max_i = null; // Value cap for this generator
		
		// HTML stuff
		manual_elem_i = null;
		group_elem_i = null;
		upgrade_elem_i = null;
		root_elem_i = null;

		constructor (name, max, base_cost, base_rate) {
			this.name_i = name;
			this.currency_gui_i = GUIManager.get(name + "-curency");

			// --- GUI ---

			let generator_div = window.document.createElement("div"),
				generator_manual_div = window.document.createElement("div"),
				wrapper_generator_group_div = blurryScrollGroup(
					"wrapper-generator-group",
					"blurry-generator-group",
					"before-group-member",
					"after-group-member",
					"generator-group",
					"generator-group-member",
					generator_div,
				),
				wrapper_generator_upgrade_div = blurryScrollGroup(
					"wrapper-generator-upgrade",
					"blurry-generator-upgrade",
					"before-upgrade-member",
					"after-upgrade-member",
					"generator-upgrade",
					"generator-upgrade-member",
					generator_div,
				),
				generator_manual_span = window.document.createElement("span");

			this.manual_elem_i = generator_manual_div;
			this.group_elem_i = wrapper_generator_group_div;
			this.upgrade_elem_i = wrapper_generator_upgrade_div;
			this.root_elem_i = generator_div;

			generator_div.appendChild(generator_manual_div);

			generator_manual_div.classList.add("generator-manual");

			generator_manual_div.appendChild(generator_manual_span);

			generator_div.classList.add("generator");
			generator_group_elem.appendChild(generator_div);

			this.gui_i = new GUIGeneratorGroup(this, generator_manual_div, generator_manual_span);

			GUIManager.add(name + "-generator", this.gui_i);

			// --- Logic ---

			if (max)
				this.max_i = max;

			this.people_i = ZERO;

			this.generator_i.push(new BaseGenerator(cost_calc, rate_calc, base_cost, base_rate, data.currency[this.name_i]));

			// debugger;
			// Trigger at least once
			this.generator_i[0].rate;
			this.generator_i[0].cost(ONE);
			
			let self = this;
			generator_manual_div.addEventListener("click", function () { // Temporary, may add time limit
				if (!self.generator_i[0].avail && self.generator_i[0].check) {// % 180 to prevent check frequently
					new RepeatGeneratorUpgradeMember(self.generator_i[0], self, "Manual Click");
					self.generator_i[0].avail = true;
				}

				if (self.max_i === null|| self.max_i.comparedTo(data.currency[self.name_i].num.num) === 1)
					data.currency[self.name_i].num.num = self.generator_i[0].update(data.currency[self.name_i].num.num);
			});
		}

		get name () {
			return this.name_i;
		}

		get generator () {
			return this.generator_i;
		}

		get people () {
			return this.people_i;
		}

		get max () {
			return this.max_i;
		}

		get group_elem () {
			return this.group_elem_i;
		}

		get root_elem () {
			return this.root_elem_i;
		}

		get upgrade_elem () {
			return this.upgrade_elem_i;
		}
	}

	class LogicGeneratorGroupMember extends LogicMember {
		generator_i = null;
		count_i = 0;

		constructor (generator) {
			super();

			this.generator_i = generator;
		}

		exec () {
			// This would be the one that put the upgrade
			if (!this.generator_i.generator.avail && this.generator_i.generator.check) {
				new RepeatGeneratorUpgradeMember(this.generator_i.generator, this.generator_i.parent, this.generator_i.name);
				this.generator_i.generator.avail = true;
			}

			// Increase with cap
			if ((++ this.count_i) % 60 === 0 && (this.generator_i.parent.max === null|| this.generator_i.parent.max.comparedTo(data.currency[this.generator_i.parent.name].num.num) === 1))
				data.currency[this.generator_i.parent.name].num.num = data.currency[this.generator_i.parent.name].num.num.add(this.generator_i.generator.cache_rate);
		}
	}
	
	class GUIGeneratorGroupMember extends GUIMember {
		generator_i = null;

		constructor (generator, parent, elem) {
			super(parent, elem);
			this.generator_i = generator;
		}

		render () {
			this.generator_i.elem.innerText = `${this.generator_i.generator.count.add(ONE).toFixed(0).toString()} ${this.generator_i.name}: ${number_format(this.generator_i.generator.cache_rate)}/s`;
		}
	}

	class GeneratorGroupMember {
		parent_i = null; // GeneratorGroup
		name_i = null;

		gui_i = null;
		logic_i = null;

		generator_i = null; // BaseGenerator

		elem_i = null;

		constructor (parent, name, base_cost, base_rate) {
			this.parent_i = parent;
			this.name_i = name;

			// --- Logic ---

			parent.generator.push(this);

			this.generator_i = new BaseGenerator(cost_calc, rate_calc, base_cost, base_rate, data.currency[this.parent_i.name]);

			this.logic_i = new LogicGeneratorGroupMember(this);

			// --- GUI ---

			let elem = window.document.createElement("div"),
				span = window.document.createElement("span");

			elem.appendChild(span);
			span.innerText = `${number_format(this.generator_i.count)} ${name}: ${number_format(this.generator_i.cache_rate)}/s`;

			this.elem_i = span;
			
			elem.classList.add("generator-group-member");

			this.gui_i = new GUIGeneratorGroupMember(this, parent.group_elem, elem);

			GUIManager.add(name + "-generator-group-member", this.gui_i);

			LogicManager.add(name + "-generator-group-member", this.logic_i);

			parent.group_elem.insertBefore(elem, parent.group_elem.children[parent.group_elem.children.length - 1]);
		}

		get parent () {
			return this.parent_i;
		}

		get name () {
			return this.name_i;
		}

		get logic () {
			return this.logic_i;
		}

		get generator () {
			return this.generator_i;
		}

		get elem () {
			return this.elem_i;
		}
	}

	// class LogicGeneratorUpgradeMember extends LogicMember { // Handle other misc upgrade (like global bonus ?)

	// }

	// class GUIGeneratorUpgradeMember extends GUIMember {
		
	// }

	// class GeneratorUpgradeMember {
	// 	Generator = null; // Can be BaseGenerator
	// 	cost_i = null; // The cost calculator

	// 	constructor (influence, base) {
	// 		let 
			
	// 		scroll_currency_elem.insertBefore(elem, scroll_currency_elem.children[scroll_currency_elem.children.length - 1]);
	// 	}
	// }

	function blurryUpgradeMember (wrapper, main, div) {
		let wrapper_div = window.document.createElement("div"),
			main_div = window.document.createElement("div");

		wrapper_div.classList.add(wrapper);
		main_div.classList.add(main);

		wrapper_div.appendChild(main_div);

		div.insertBefore(wrapper_div, div.children[div.children.length - 1]);

		return main_div;
	}

	

	class GUIRepeatGeneratorUpgradeMember extends GUIMember {
		influence_i = null;
		name_i = null; // Temporary as it only cover amount=one upgrade

		constructor (influence, parent, elem, name) {
			super(parent, elem);
			this.influence_i = influence;
			this.name_i = name;
		}

		render () {
			this.influence_i.elem.innerHTML = `Buy ${this.name_i}<br/>${number_format(this.influence_i.influence.cache_cost)}`;
		}
	}

	class RepeatGeneratorUpgradeMember {
		parent_i = null; // GeneratorGroup that have this upgrade
		influence_i = null; // The BaseGenerator that control this upgrade

		gui_i = null;

		elem_i = null;

		constructor (influence, parent, name) {
			this.influence_i = influence;
			this.parent_i = parent;

			// --- GUI ---

			// <div class="wrapper-generator-upgrade-member">
			// 	<div class="generator-upgrade-member">
			// 		<span>Buy Farm<br/>Cost: 10 Wood</span>
			// 	</div>
			// </div>

			let elem = blurryUpgradeMember(
					"wrapper-generator-upgrade-member",
					"generator-upgrade-member",
					this.parent_i.upgrade_elem
				),
				span = document.createElement("span");

			this.elem_i = span;

			span.innerHTML = `Buy ${name}<br/>${number_format(this.influence_i.cache_cost)}`; // parent_i.name is kinda stupid but meh

			elem.appendChild(span);

			this.gui_i = new GUIRepeatGeneratorUpgradeMember(this, this.parent_i.upgrade_elem, elem, name);

			GUIManager.add(name + "-repeat-generator-upgrade-member", this.gui_i);

			// Event logic
			let self = this;
			elem.addEventListener("click", function() {
				if (self.influence_i.check) {
					self.influence_i.buy(ONE);

					// --- GUI ---

					self.influence_i.avail = false;

					// Do cleanup a.k.a self-delete :)
					// debugger;
					self.parent_i.upgrade_elem.removeChild(elem.parentNode);
				}
			});
		}

		get elem () {
			return this.elem_i;
		}

		get influence () {
			return this.influence_i;
		}

		get parent () {
			return this.parent_i;
		}
	}

	// class LogicUpgradeMember extends LogicMember {
	// 	constructor () {}

	// 	exec () {
	// 		if (data.currency.Food.num.num.comparedTo(unlock_wood_i) === 1)
	// 			new RepeatGeneratorUpgradeMember(this.generator_i, this.generator_i.parent, this.generator_i.name);

	// 		++ this.count_i;
	// 	}
	// }

	class GUIUpgradeMember extends GUIMember {
		upgrade_i = null;

		name_i = null;

		constructor (upgrade, parent, elem, name) {
			super(parent, elem);
			this.upgrade_i = upgrade;
			this.name_i = name;
		}

		render () {
			this.upgrade_i.elem.innerHTML = `${this.name_i}<br/>${number_format(this.upgrade_i.cost)}`;
		}
	}

	class UpgradeMember {
		parent_i = null;

		func_i = null;

		cost_i = null;
		currency_i = null;

		// logic_i = null;
		gui_i = null;

		elem_i = null;

		constructor (parent, func, cost, currency, name) {
			this.parent_i = parent;
			this.func_i = func;
			this.cost_i = cost;
			this.currency_i = currency;

			// --- GUI ---

			let elem = blurryUpgradeMember(
				"wrapper-generator-upgrade-member",
				"generator-upgrade-member",
				this.parent_i.upgrade_elem
			),
			span = document.createElement("span");

			this.elem_i = span;

			span.innerHTML = `${name}<br/>${number_format(cost)}`; // parent_i.name is kinda stupid but meh

			elem.appendChild(span);

			this.gui_i = new GUIUpgradeMember(this, this.parent_i.upgrade_elem, elem, name);

			GUIManager.add(name + "-upgrade-member", this.gui_i);

			let self = this;
			elem.addEventListener("click", function() {
				if (self.cost_i.comparedTo(self.currency_i.num.num) === -1) {
					self.func_i(self);
					self.currency_i.num.num = self.currency_i.num.num.sub(self.cost_i);
					self.parent_i.upgrade_elem.removeChild(elem.parentNode);
				}
			});
		}

		get elem () {
			return this.elem_i;
		}

		get cost () {
			return this.cost_i;
		}
	}

	// class LogicFoodUpgrade extends LogicMember {
	// 	count_i = 0;

	// 	unlock_wood_i = new DecNum(75);
		
	// 	constructor () {}

	// 	exec () {
	// 		if (data.currency.Food.num.num.comparedTo(unlock_wood_i) === 1)
	// 			new RepeatGeneratorUpgradeMember(this.generator_i, this.generator_i.parent, this.generator_i.name);

	// 		++ this.count_i;
	// 	}
	// }

	// class LogicWoodUpgrade extends LogicMember {
	// 	count_i = 0;

	// 	constructor () {}

	// 	exec () {
	// 		// if (data.currency[])

	// 		++ this.count_i;
	// 	}
	// }

	// Currencies

	// Do we needs this?
	// class LogicCurrency extends LogicMember {

	// }

	class GUICurrency extends GUIMember {
		currency_i = null;
		len_i = 0; // string length for padding

		constructor (currency, parent, elem) {
			super(parent, elem);
			this.currency_i = currency;
		}

		render () {
			let str = number_format(this.currency_i.num_i);
			if (str.length > this.len_i) this.len_i = str.length;
			
			// TODO: Also add a settings to prevent render too much (since HTML rendering is costly)
			this.currency_i.elem_i.innerText = this.currency_i.name_i + ": " + str.padStart(this.len_i, " ");
		}
	}

	class Currency {
		// logic_i = null;
		name_i = null;

		gui_i = null;
		
		num_i = null;

		elem_i = null;

		constructor (name, num) {
			this.name_i = name;
			this.num_i = num;

			// --- GUI ---

			// Create currency div
			let elem = window.document.createElement("div"),
				span = window.document.createElement("span");

			// create span and put inside div
			elem.appendChild(span);
			span.innerText = name + ": " + number_format(num);

			this.elem_i = span;

			// change class to "currency"
			elem.classList.add("currency");
			
			// create the currency
			this.gui_i = new GUICurrency(this, scroll_currency_elem, elem);

			// add the thing to GUIManager for rendering
			GUIManager.add(name + "-curency", this.gui_i);

			// append the div in the middle, not last
			scroll_currency_elem.insertBefore(elem, scroll_currency_elem.children[scroll_currency_elem.children.length - 1]);

			elem.addEventListener("click", function () {
				data.currency[name].generator.root_elem.scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
			});
		}

		set num (num) {
			return (this.num_i = num);
		}

		get num () {
			return this.num_i;
		}
	}

	function make_currency (name, num, max, base_cost, base_rate) {
		data.currency[name] = {};
		data.currency[name].num = new Currency(name, num);
		data.currency[name].generator = new GeneratorGroup(name, max, base_cost, base_rate);
	}

	data.currency = {};
	
	// data.currency.People = make_currency("People", ZERO, new DecNum(50));
	make_currency("Food", ZERO, null, new DecNum(25), ONE);

	data.upgrade = {};
	data.upgrade.Food = {
		build_farm: {
			cost: new DecNum(50),
			name: "Build Farm",
			func: function() {
				new GeneratorGroupMember(data.currency.Food.generator, `Farm`, new DecNum(25), ONE);
			},
			parent: data.currency.Food.generator,
			got: true,
		},
		build_barn: {
			cost: new DecNum(100),
			name: "Build Barn",
			func: function() {
				new GeneratorGroupMember(data.currency.Food.generator, `Barn`, new DecNum(50), new DecNum(2.5));
			},
			parent: data.currency.Food.generator,
			got: true,
		},
		unlock_wood: {
			cost: new DecNum(200),
			name: "Unlock Wood",
			func: function() {
				make_currency("Wood", ZERO, null, new DecNum(25), ONE);

				data.upgrade.Wood = { // bigg hacky oof
					build_lumber: {
						cost: new DecNum(50),
						name: "Build Lumber",
						func: function() {
							new GeneratorGroupMember(data.currency.Wood.generator, `Lumber`, new DecNum(25), ONE);
						},
						parent: data.currency.Wood.generator,
						got: true,
					},
					build_mill: {
						cost: new DecNum(100),
						name: "Build Mill",
						func: function() {
							new GeneratorGroupMember(data.currency.Wood.generator, `Mill`, new DecNum(50), new DecNum(2.5));
						},
						parent: data.currency.Wood.generator,
						got: true,
					},
					unlock_stone: {
						cost: new DecNum(200),
						name: "Unlock Stone",
						func: function() {
							make_currency("Stone", ZERO, null, new DecNum(25), ONE);

							data.upgrade.Stone = {
								build_mine: {
									cost: new DecNum(50),
									name: "Build Mine",
									func: function() {
										new GeneratorGroupMember(data.currency.Stone.generator, `Mine`, new DecNum(25), ONE);
									},
									parent: data.currency.Wood.generator,
									got: true,
								},
								build_extractor: {
									cost: new DecNum(100),
									name: "Build Extractor",
									func: function() {
										new GeneratorGroupMember(data.currency.Stone.generator, `Extractor`, new DecNum(50), new DecNum(2.5));
									},
									parent: data.currency.Wood.generator,
									got: true,
								},
							};
						},
						parent: data.currency.Wood.generator,
						got: true,
					},
				};
			},
			parent: data.currency.Food.generator,
			got: true,
		},
	};
	

	class LogicMain extends LogicMember { // very hacky
		constructor() {
			super();
		}

		exec () {
			for (let t in data.upgrade) if (data.upgrade.hasOwnProperty(t))
				for (let u in data.upgrade[t]) if (data.upgrade[t].hasOwnProperty(u))
					if (data.upgrade[t][u].got && data.upgrade[t][u].cost.comparedTo(data.currency[t].num.num) === -1) {
						new UpgradeMember(data.currency[t].generator, data.upgrade[t][u].func, data.upgrade[t][u].cost, data.currency[t], data.upgrade[t][u].name);
						data.upgrade[t][u].got = false;
					}
		}
	}

	LogicManager.add("main", new LogicMain());

	// data.currency.wood = new DecNum(0);
	// data.currency.stone = new DecNum(0);
	// data.currency.iron = new DecNum(0);
	// data.currency.gold = new DecNum(0);
	// data.currency.silicon = new DecNum(0);
	// data.currency.paper = new DecNum(0);

	// Main implementation

	//let test = new GeneratorGroupMember(data.currency.Food.generator, "Farm");

	// for (let i = 0; i < 20; ++ i)
	// 	setTimeout(function () {
	// 		new GeneratorGroupMember(data.currency.Food.generator, `Farm ${i}`);
	// 	}, i * 233 * 3);

	// for (let i = 0; i < 5; ++ i)
	// 	setTimeout(function () {
	// 		new GeneratorGroupMember(data.currency.People.generator, `People ${i}`);
	// 	}, i * 1000 / 5);

	let frame = {
		fps: 60,
		ms: 0,
		smooth: 5,
		maxFps: 60
	};

	// Put loop() at the bottom
	function loop (data) {
		// TODO: Game loop
		// TODO: Render loop

		//data.currency.food.num = data.currency.food.num.mul(new DecNum(1.000123)); // For demo only

		

		LogicManager.update();
		GUIManager.update();

		frame.fps = data.fps;
		frame.ms = data.ms;
		data.maxFps = frame.maxFps;
		data.smooth = frame.smooth;
	}

	window.document.addEventListener("DOMContentLoaded", function init () {
		window.rAF(loop);
	});
})();



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