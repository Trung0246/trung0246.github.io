### Scope
```rust
<scope>
	<meta>? {<expr>; <expr>; ...}
```

<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>

### Param
```rust
<param>
	<meta>? (
		<expr...>;
		<param-var>;
		@<scope>; // Bypass scope. Not counted toward param.
	)

<sym-param>
	<sole-type-param>? <param>
		// Default of <sole-type-param> depends on current sym.
		// Forced <meta> for second param.
```

<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>

### Var
```rust
<var>
	<name-sym> <meta>? . <scope[ctx] | name-sym-ctx>?
		:= <num-sym | str-sym | bool-sym | make-sym>

<param-var>
	<name-sym | num-sym | scope[int | str] | other-var-sym>
		:= <expr>

<other-var-sym>
	// Used to manually override and apply value for current param.
	// [TODO] Allow specify <meta> since internally it's a var.
	@@lib
	@@this
	@@tag
	@@func
	@@pipe
	@@pile
	@@stk
	@@res
	@@path
	@@with
```

<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>

### Sym
```rust
<sym>
	<name-sym>
		<raw-name-sym>
		<tag-sym>:<raw-name-sym>
		@:<raw-name-sym>
		@"path/to/file":<raw-name-sym>
		@@:<raw-name-sym>

	<raw-name-sym>
		a0
		`a0`
		`+` // Operator

	<tag-sym>
		// Local tag: <name-sym>.<name-sym>. ...
			// Does not valid outside <meta>. Hence use `@.<name-sym>.<name-sym>. ...` instead.
		// Global tag: @@.<name-sym>.<name-sym>. ...
		// Tag in file: @"path/to/file".<name-sym>.<name-sym>. ...

	<num-sym>
		1 <sym-param>?
		1e1 <sym-param>?
		1.1 <sym-param>?
		0x1 <sym-param>?
		0x1p1 <sym-param>?
		0b1 <sym-param>?
		0o1 <sym-param>?
		0 <sym-param> // Forced second <param>.

	<ctx-val-sym>
		$T // true
		$F // false
		$U // unit

	<char-sym>
		'a' <sym-param>?
		'\n' <sym-param>?
		'\x01' <sym-param>?
		'\u{1}' <sym-param>?

	<str-sym>
		"abc" <sym-param>?
		$ <sym-param> "(=a) \"a\" \n (a|b) [...]{123}"
			// [param/pos], (string computation tcl inspired
				// , in the example is spintax), {code}.
		$ <sym-param> """(((=a))) "a" \\\n (((a|b))) [[[...]]]{{{123}}}"""
			// Same as above.

	<make-sym>
		$ <sym-param>
			// Forced <type> for both seq and rec.

	<func-sym>
		$ <sole-type-param>? <param>? <scope>
		// Forced <meta> for <scope>.
		// <param>, like <make-sym>, are used to define default value.

	<ctx-sym>
		<hard-ctx-sym>
			@... // Hard ctx.
				root
				ctx

		<other-ctx-sym>
			@... <hard-ctx-param>? // All of these are just normal ctx.
				call
				path /
				impl
					// See Shape demo.
				loop ~
				if ?
				pack ^

		<val-ctx-sym>
			// All of these are just value.
			@... <hard-ctx-param>?
				lib _
				tag \
				with =

				this
				type
					// For use with `rec` like accessing self type.
						// Equivalent to `type(@this).
				func $
					// Used for self reference. Especially in func scope for recursion.

				pipe |
				param %
					// Access parameters. Can be done by $[](...; @%.0; ...) or $[]{...; @%.0; ...}
					// Auto getting `@@`-ed.
				scope
					// Evaluate extra scope then access it's value.
				var
					// Get all native vars in a scope (not param if func scope).
					// Result is dependent on location where it's used.
					// Must be in following form:
						// @var.every:n1 // Include vars from outer scope.
						// @var.scope:n1 // Exclude vars from outer scope.
				pile &
					// For use with lambda capture (ex: accessing
						// and storing outside variables).
					// Auto getting `@@`-ed.
				stk +
				res -
				hook
					// See Shape demo.
				hold
					// See `+` overloading demo.
				back
					// See Shape demo.

	<mem-sym>
		// Forced <meta> for first param
		$$ <alloc-func-scope>? <spot-init-param>? $= ... // Use @res to get alllocator.
			<val-ctx-sym>
			<str-sym>
			<char-sym>
			<func-sym> // Only for lambda capture.
			<num-sym>
			<make-sym>
			<mem-sym> // Can be chained

	<meta-sym>
		// Useful only when doing type make (especially partial application).
		$@ <meta>
```

<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>

### Call
```rust
<call>
	<name-sym | scope> <param>
		// Possible to have two <meta>.

	<expr>, <expr>, ...
		:> <func | self-func>, <expr...>?
		:. <expr...>? // For stuff like map((1; 2; 3))('-') which isolate param group.
		:< <name-sym | scope | self-func> <param>? // Possible to have two <meta>.

		// :~ <expr[func]>, <expr[iter-data]>?
			// map
		// :! <expr[func]>, <expr[init-data]>?
			// fold, trans (a.k.a reduce)
		// :? <rule | expr[func]>
			// grab (a.k.a filter)

		: <name-sym | scope> : <name-sym | scope> : ...
			// member rec access. Optimized for cmpl-time.
			// Can use number with the form "a:1" is member is something like "`1`".

		:? <name-sym | scope> : <name-sym | scope> : ...
			// member/index map access. Safe even if not exist (and just return unit).

		: @@ <rule | param>?
			// with: expand all member to this scope
				// (param form for extra members).
				// Use <type-var> to explicitly change meta for var.
			// Also apply for `:?` assuming there's a way to get all keys.
			// Synergies with `@param` such that this expand named only (not index).
		: @@ <rule | param>? <scope>
			// with: expand all member to inner scope.
			// Same <type-var> stuff like above.
			// Also apply for `:?` assuming there's a way to get all keys.

		// For nesting, add extra ":" or "," for each level.
		<expr>,, <expr>,, ...
			::> <func | self-func>,, <expr...>?
			::. <expr...>?
			::< <name-sym | scope | self-func> <param>?

			// ::~ <expr[func]>,, <expr[iter-data]>?
			// ::! <expr[func]>,, <expr[init-data]>?
			// ::? <rule | expr[func]>

			:: <name-sym | scope> :: <name-sym | scope> :: ...

			:: @@ <rule | param>? <scope>
				// with: expand all member to inner scope.
				// Other form of @@ is not legal for inner.

<self-func>
	<hard-ctx-sym | other-ctx-sym> . <name-sym>
```

<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>

### Meta
```rust
<meta>
[
	// [TODO] Borrow some ideas
		// https://idris2.readthedocs.io/en/latest/tutorial/multiplicities.html
		// https://www.avestura.dev/blog/what-is-the-type-of-type
	\ <prop | meta-scope>; // Properties

	. <rule | scope>? <scope | meta>;
		// Hook to matching code pattern in related scope.
			// Left hand <rule> or <scope> for filter.
			// Invoke right hand <scope> can do before, after, and around.
			// Invoke right hand <meta> will apply <meta> isntead.
	
	<type-var...>;
		// func-param/rec-member define or predefine var for this scope.
			// Will automatically getting `@@`-ed if using as func param.

	<type-func...>;
]

<type>
	(<type> | <type> & ~<type> ^ <type>)
		// Basic operators
	<name-sym> <param>?
		// Built-in type. Enabled if "_" is imported.
			// For external cmpl-time type. Use `name` form when name clash.
			// <param> used when wanting to init type with extra info.
	<type-scope>
		// Cmpl-time scope. Must return type.
	_
		// Auto/wildcard type.

<type-var>
	<name-sym> <meta>? = <type>;
		// Variable meta, not type meta.
	
	_ <meta>? = <type>;
		// For these this case, it is used to not explicitly naming var while still
			// allow usage of ".func".

	<name_sym> = _;
		// This is the exception if param name does not exist during func type make.

<type-func>
	.tag = <tag-sym>;
		// Apply tag to all defined var in this scope and expose it to parent ctx.
		// Implicitly flatten the scope, therefore will not do actions that
			// trigger when out of scope (ex: call destructor).
			// Flattening is done with properties.
		// Like namespace in other language. Only <tag-sym> is accepted. No scope.
	.this;
		// Add additional `@this` variable to this scope (hence not a ctx).
			// Will detect if `@this` is explicitly being done with <param-var> or
				// with "." call style.
			// Else detect if `@pipe` is available and use it.
			// Else use param 0.
	.func;
		// Specify this to be func type for <make-sym>. Must have empty <param>.
		.func (<type>);
			// This form is used to set return type if set tye make var to "func".
		.func (<func-type>);
			// This form is used for filling the rest of missing type information.
	.pile (<type-var>; <type-var>; ...)?;
		// Capture external variable to this func.
			// <name-sym> within <type-var> must have valid ref to external var.
			// Like <type-var>, for func, it will auto getting `@@`-ed.
			// For all <name-sym> within <type-var>, everything else except
				// <name-sym> will be optional.
			// Auto capture all external variable used by this func if not specified.
	.bare;
		// Enable copy elison and RVO (return value optimization).
	.jump <ctx-scope>?;
		// Convert this <func-sym> into jump ctx.
		// Optionally provide "prompt".
		// Otherwise behave like as if ".pile" is added.

	.var;
		// Ignore ".impl" and revert back to normal variable.

	.vary;
		// Force if else check must consider all paths for this type.
			// The scope should run at cmpl-time, before entire ifs then return true.
	.wrap = <name-sym>;
		// Enable this type to be wrap type during <make-sym>.
		// Which is implicitly access "name" for each access.
		// Ex: ptr, just, vary, list, etc.

	.param <meta> = "mix" | "seq" | "rec";
		// mix: https://stackoverflow.com/a/65003596/6118603, https://pastebin.com/raw/ug8Yguqx
			// Unspecified unnamed param will be accessed by index.
			// Unspecified named param will be accessed by name.
			// Otherwise will attempt to fill specified param.
		// seq: index param only.
		// rec: named param only.
	.scope <meta>;
		// Extra param group or scope for call.
			// @scope:0:
			// @param:0:?{<num>}
			// @param:0:<name_sym>
		// One `.param` or one `.scope` will be consumed. Dupe them if want to use multiple.

	.seq;
		// Custom immutable seq-like.
		// Only valid for <meta> of <type-var>..
		// For f(1, 2, 3), not f(1, [2, 3]).
	.rec;
		// Custom immutable rec-like.
		// Only valid for <meta> of <type-var>.
```

<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>

### Ctx-Call
```rust
<ctx-call>
	<hard-ctx-sym | other-ctx-sym> . ...
		exit
			= <expr>; // Optional
			// For scope and func, no semicolon at the end indicate "exit".
		skip
			= <expr>; // Optional. Will ignored if does not used. Current only valid cases are:
				// `call`
		fall

<builtin-call>
	$...
		// [OLD] guard
		// 	<scope> {<main-expr>; ...}
		loop
			<meta>? (rule | <check-scope>)? {<main-expr>; ...}
			<meta>? () {<else-expr>; ...} // Optional
		if
			<meta>? (rule | <check-scope>) {<main-expr>; ...}
			() <meta>? {<else-expr>; ...} // Optional
		size
			<param>
		type
			<param> // Single value. Get type of this expr. Must be cmpl-time.
		ast
			<param[hard-ctx-sym | other-ctx-sym]>
				// Used to get access to AST. Require pairing with <mem-sym>.
				// "@" used to get access to current scope ast.
		shape
			<meta>? (<main-expr>; <flat-bool-expr>)
			// Handling DAG (Directed Acyclic Graph) of inheritance.
		never
			// UNreachable part of code. Undefined behavior if reached.
```

###
---

<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>
<!------------------------------------------------------------------------------>

<!--
[TODO] Handle diamond inheritance.
.impl (<type> : <type> : _; <type>; <type> . <type>; ...);
	Turn this scope into implementation scope.
	Left <type> are super rec, while right <type> are lower rec for ":" form.
	Left <type> are main rec, while right <type> are impl rec for "." form.
		This form can only have "." once, hence cannot have multiple like ":".
		For this form "*" indicate wildcard match.
	If single <type> within <scope-meta> then inheritance.
-->

<!--
Old:
https://pastebin.com/raw/Li6aLcPU
-->

```rust
// # Choice iterator

x := (11 ? 22); y := (33 ? 44); print((x, y)); # (11, 33), (11, 44), (22, 33), (22, 44)

x := (y ? 22); y := (33 ? 44); print((x, y)); # (33, 33), (44, 44), (22, 33), (22, 44)
```

---

```rust
X_type := $(func)[.func(unit); _=i64]();
// # X_type := $(func)[.func(_); _=i64]();

A := $(unit)[k=i64; x1=X_type; x2=X_type; x3=_; x4=_; x5=X_type;]{
	B := $(unit)[.pile(k; x1; x2; x3; x4)]{
		k = k - 1;
		A(k; @func; x1; x2; x3; x4)
	};
	$if ({k > 0}) {
		B()
	}(){
		x4() + x5()
	}
};

X := $(_)[.func(X_type); n=_]{
// # X := $(unit)[.func(X_type); n=_]{
	$(unit)[.pile(n)]{
		n
	}
};

// # All values are passed by copy, not ref.
_:print(A(10; X(1); X(-1); X(-1); X(1); X(0))); // # -67
```

```rust
print("111\n");
print("222" ++ [
	. (ast[exit-explicit]) {
		print("888" ++ @hook);
		"aaa\n"
	};
] {
	guard_ctx = @ctx;
	data := 456;
	print("333" ++ {
		print("444" ++ $[.jump{guard_ctx}]{
			# Will invoke twice: pre and post.
		}("555\n"));
		# guard_ctx.exit = "bbb\n";
		"666\n"
	});
	print(str(data) ++ "\n");
	data = data + 10;
	"777\n"
});
print("999\n");

// # "111"
// # "333555"
// # "456"
// # "444777"
// # "333666"
// # "466"
// # "222777"
// # "999"

// # With "guard_ctx.exit":
// # "111"
// # "333555"
// # "456"
// # "444777"
// # "888bbb"
// # "222aaa"
// # "999"
```

```rust
// # This implementation does not type check "mark" invoke yet.
effect := $(_)[]{
	func_ctx := @ctx;
	handle_func := @scope:?1;

	@res.handle = $(any)[
		outer_mark = _;
		.pile(handle_func; func_ctx);
	]{
		inner_jump := $U;
		inner_flag := $F;

		raw_handle := $(unit)[
			inner_res = _;
			.pile(inner_jump; inner_flag; func_ctx);
		]{
			inner_flag = $T;
			func_ctx.exit = inner_jump(inner_res);
		};

		temp_res := {
			inner_jump = $[.jump]{};
			$U
		};

		$if ({inner_flag}) {
			inner_flag = $F;
			temp_res
		} () {
			@res.handle = raw_handle;
			@res.mark = outer_mark;
			func_ctx.exit = handle_func();
		}
	};

	@scope:?0()
};

effect {
	@res.handle("ask_name");
} {
	$if ({@res.mark == "ask_name"}) {
		@res.handle("John");
	}
};

// ########################################################

// # https://overreacted.io/algebraic-effects-for-the-rest-of-us/

get_name := $(_)[
	user = _;
]{
	$if ({user:name == $U}) {
		@res.handle("ask_name")
	} () {
		user:name
	}
};

make_friends := $(_)[
	user1 = _;
	user2 = _;
]{
	@lib.push(user1:friend_names; get_name(user2));
	@lib.push(user2:friend_names; get_name(user1));
};

Person := $(rec)[
	name = vary(str | unit);
	friend_names = list(str);
]();

arya := $(Person)(name := $U);
gendry := $(Person)(name := "Gendry");

effect {
	make_friends(arya; gendry)
} {
	$if ({@res.mark == "ask_name"}) {
		@res.handle("Arya Stark")
	}
};
```

```rust
@lib:`+` = $$ {@lib:infer}(@lib:`+`) $= $(_)[ // # "infer" can detect func or rec
	#{ type_rule(@param:0) #}
]{
	// # @hold refer to the value returned by hook.
	// # Left side of rule check for inner elem of any wrap type is Decimal.
	$if (spec[wrap[_; Decimal]] & {@hold.elem_total == 2}) {
		@lib:gmp_add(@param:0:?0; @param:0:?1)
	} () {
		$(_)[.func(defer)]{}
	}
};
```

```rust

Shape := $(rec)[
	.tag = Shape;
]();

// # "infer" have alloc-style invocation.
Square := $$ {@lib:infer}(Shape) $= $(rec)[side=i64]();
Circle := $$ {@lib:infer}(Shape) $= $(rec)[radius=i64]();

ShapeImpl := $(trait)[
	.tag = Shape; // # Same tag to allow `.` form for accessing "member" function.
](
	area := $(_)[]{ // # Automatic ".this" added.
		[
			. (ast[if . if-check . scope]) { // # [TODO] Better rule syntax.
				@hook == {$shape(@this) :> after, Shape : 0} // # This return the first subtype.
			};
		]{
			$if ({Circle}) {
				3.14 * @this:radius * @this:radius
			} ({Square}) {
				@this:side * @this:side
			} () {
				$never
			}
		};
	};
);

// # Remember that `side=i64` is prematurely define var type for the param scope.
// # `rec` requires all explicit param var are named.

Triangle := $$ {@lib:infer}(Shape) $= $(rec)[base=i64; height=i64]();

// # [TODO] Find a way to totally override instead of chaining func.
ShapeImpl:?area = $(_)[#{ type_if(@this) #}]{
	$if ({Triangle}) {
		0.5 * @this:base * @this:height
	} () {
		$(_)[.func(defer)]{}
	}
};

ShapeImpl:?perim = $(_)[#{ type_rule(@this) #}]{
	$if (type[Circle]) {
		2 * 3.14 * @this:radius
	} (type[Square]) {
		4 * @this:side
	} (type[Triangle]) {
		@this:base + @this:height + @this:side
	} () {
		@call.exit = $U;
	}
};

ShapeImpl:?area($(Circle)[](radius := 5)); // 78.5
ShapeImpl:?perim($(Square)[](side := 5)); // 20
ShapeImpl:?area($(Triangle)[](base := 5; height := 10)); // 25

5, @(Triangle)[](base := 5; height := 10) ::> ShapeImpl:::?area :> `+`; // 30
```

```rust
SoleList := $[
	T=type;
	.tag = seq;
]{
	$(rec)[
		next=spot(SoleList) | unit;
		data=T | unit;
	](
		next := $U;
		data := $U;
	)
};

// Some impl are designed to "autofill" some func with clever cmpl-time check.
// prev;
// next;
// begin;
// final;
// flip_begin;
// flip_final;
// head;
// tail;
// size_total;
// at_wrap;

@@.iter:peek = $(_)[. (ast[if . if-check . rule]) {
	// # @hook does not exist here since we are doing rule matching.
	@this
}]{
	$if (spec[SoleList]) {
		@this:next
	} () {
		$(_)[.func(defer)]{}
	}
};

@@.iter:at = $(_)[#{ type_rule(@this) #}]{
	// # $if (type[{SoleList($type(@this:data))}]) {
	$if (spec[SoleList]) {
		i := 0;
		curr := @this;
		$loop ({!curr:next ~= $U & i < index}) {
			i = i + 1;
			curr = curr:next;
		} () {
			curr = $U;
		};
		curr
	} () {
		$(_)[.func(defer)]{}
	}
};

@@.iter:elem_total = $(_)[#{ type_rule(@this) #}]{
	$if (spec[SoleList]) {
		i := 0;
		curr := @this;
		$loop ({!curr:next ~= $U}) {
			i = i + 1;
			curr = curr:next;
		}
		i
	} () {
		$(_)[.func(defer)]{}
	}
};

@@.iter:form_total = $(_)[#{ type_rule(@this) #}]{
	$if (spec[SoleList]) {
		// # `!` op can detect if rec impl this op, else return itself.
		// Basically like "unwrap" or "deref" in other language.
		$size(!@this:data)
	} () {
		$(_)[.func(defer)]{}
	}
};

// ########################################################

@@.seq:place = $(_)[
	#{ type_rule(@this) #}
]{
	@param:1:@@; // # Custom rec type with concrete member.
		// # index, remove

	$if (spec[SoleList]) {
		it := @this.flip_begin();
		curr := @this.begin();
		pos := 0;

		$loop ({curr ~= @this.final() & pos < index}) {
			it = $if (!it == $U) {
				@this
			} () {
				it:next
			};
			curr = curr:next;
			pos = pos + 1;
		};

		del_it := it;
		del_curr := curr;
		del_pos := pos;
		$loop ({del_curr ~= @this.final() & del_pos < remove}) {
			del_it = $if (!del_it == $U) {
				@this
			} () {
				del_it:next
			};
			del_curr = del_curr:next;
			del_pos = del_pos + 1;
		};

		$if ({remove > 0 & !it ~= $U & !it:next ~= $U}) {
			it:next = del_curr:next;
			del_curr:next = $U;
			@res.mem:free(del_curr);
		};

		$if ({!this:next ~= $U}) {
			curr_push := it;
			i := 0;
			$loop ({@param:2:?{i} ~= $U}) {
				// # [TODO] Maybe reuse instead of create new.
				curr_push:next = $$ $= $(SoleList)[]( // # $${@res._:alloc}
					next := $U;
					data := @param:2:?{i};
				);
				i = i + 1;
				curr_push = curr_push:next;
			};
		};
	} () {
		$(_)[.func(defer)]{}
	}
};

@@.seq:place(sole_list_var)(1)(123; 234);
@@.seq:place(sole_list_var)(1, 2)(123; 234); // # insert at 1, remove 2

// ########################################################

// push_tail;
// pull_tail;
// push_head;
// pull_head;
// place_wrap;

@@.seq:place = $(_)[#{ type_rule(@this) #}]{
	@param:1:@@;
	$if (spec[NearList]) {
		// Like JS splice
		start := $if ({index < 0}) {
			max(@this.elem_total + index; 0)
		} () {
			min(index; @this.elem_total)
		};
		
		remove = min(remove; @this.elem_total - start);
		data_size := {@param:2 :> elem_total};
		new_size := @this.elem_total - remove + data_size;

		$if ({data_size > remove}) {
			@this.scale(new_size);
			i := @this.elem_total - 1;
			$loop ({i >= start}) {
				@this:at(i + data_size) = @this:at(i);
				i = i - 1;
			};
		};

		i := 0;
		$loop ({i < data_size}) {
			@this:at(start + i) = @param:2:?{i};
			i = i + 1;
		};

		$if ({data_size < remove}) {
			@this.scale(new_size);
			i := start + data_size;
			$loop ({i < new_size}) {
				@this:at(i) = @this:at(i + remove);
				i = i + 1;
			};
		};
	} () {
		$(_)[.func(defer)]{}
	}
};

// [TODO] @@.seq:scale;
```

```rust
Being := $(rec)[name = vary(str | unit)]();

Human := $$ {@lib:infer}(Being) $= $(rec)[age = vary(i64 | unit)]();
Animal := $$ {@lib:infer}(Being) $= $(rec)[kind = vary(str | unit)]();

Farmer := $$ {@lib:infer}(Human) $= $(rec)[tool = vary(str | unit)]();
Hunter := $$ {@lib:infer}(Human) $= $(rec)[weapon = vary(str | unit)]();

Pig := $$ {@lib:infer}(Animal) $= $(rec)[weight = vary(i64 | unit)]();
Wolf := $$ {@lib:infer}(Animal) $= $(rec)[speed = vary(i64 | unit)]();

Werewolf := $$ {@lib:infer}(Human; Wolf) $= $(rec)[fur_color = vary(str | unit)]();

Handyman := $$ {@lib:infer}(Farmer; Hunter) $= $(rec)[experience = vary(i64 | unit)]();
```