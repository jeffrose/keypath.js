// Parsing, tokeninzing, etc

var str1 = 'accounts.1.checking.id';

var str2 = 'accounts[accounts.2()]checking.id';

var str3 = 'accounts[accounts.2()]checking.fn()';

var str4 = 'accounts.0.ary.sort()';

var str5 = 'accounts.0.ary.*';

var str6 = 'accounts.1.sav*.sort().0';

var data = {
	'accounts': [
		{ 'ary': [9,8,7,6] },
		{
			'checking': {
				'balance': 123.00,
				'id': '12345',
				'fn': function(){ return 'Function return value'; }
			},
			'savX': 'X',
			'savY': 'Y',
			'savZ': 'Z'
		},
		function(){ return 1;}
	]
};

var separator = '.';
var containers = {
	'[': {
		'closer': ']',
		'exec': 'property'
		},
	'(': {
		'closer': ')',
		'exec': 'call'
		},
	'{': {
		'closer': '}',
		'exec': '??'
		}
};

function tokenize(str){
	var tokens = [],
		word = '',
		substr = '',
		i,
		opener, closer,
		depth = 0;

	// console.log('Parsing:', str);

	for (i = 0; i < str.length; i++){
		// console.log(i, str[i]);
		if (depth > 0){
			// Scan for closer
			str[i] === opener && depth++;
			str[i] === closer.closer && depth--;

			if (depth > 0){
				substr += str[i];
			}
			else {
				tokens.push({'t':tokenize(substr), 'exec': closer.exec});
				substr = '';
			}
		}
		else if (str[i] === separator){
			// word is a plain property
			word && tokens.push(word);
			word = '';
		}
		else if (closer = containers[str[i]]){
			// found opener, initiate scan for closer
			word && tokens.push(word);
			word = '';
			opener = str[i];
			depth++;
		}
		else {
			// still accumulating property name
			word += str[i];
		}
	}
	// add trailing word to tokens, if present
	word && tokens.push(word);
	// console.log('returning:', tokens);
	return depth === 0 ? tokens : undefined; // depth != 0 means mismatched containers
}

function wildcardMatch(template, str){
	var pos = template.indexOf('*'),
		parts = template.split('*', 2),
		match = true;
	if (parts[0]){
		match = match && str.substr(0, parts[0].length) === parts[0];
	}
	if (parts[1]){
		match = match && str.substr(pos+1) === parts[1];
	}
	return match;
}

function resolvePath(obj, path, newValue){
	var root = root ? root : obj,
		change = newValue !== undefined,
		val,
		tk,
		preprev;

	tk = typeof path === 'string' ? tokenize(path) : path;

	// TODO: handle '*' in path
	return tk.reduce(function(prev, curr, idx){
		var ret;
		// console.log('reduce:',prev,curr);
		if (typeof curr === 'undefined' || typeof prev === 'undefined'){
			ret = prev;
		}
		else if (typeof curr === 'string'){
			if (prev[curr]) {
				if (change && idx === (tk.length -1)){ prev[curr] = newValue; }
				ret = prev[curr];
			}
			else if (curr.indexOf('*') >-1){
				ret = [];
				for (var prop in prev){
					if (prev.hasOwnProperty(prop) && wildcardMatch(curr, prop)){
						if (change && idx === (tk.length -1)){ prev[prop] = newValue; }
						ret.push(prev[prop]);
					}
				}
			}
			else { return undefined; }
		}
		else if (curr.exec === 'property'){
			if (change && idx === (tk.length -1)){
				prev[getPath(root, curr.t)] = newValue;
			}
			ret = prev[getPath(root, curr.t)];
		}
		else if (curr.exec === 'call'){
			// TODO: handle params for function
			ret = prev.call(preprev);
		}
		preprev = prev;
		return ret;
	}.bind(this), obj);
}

function getPath(obj, path){
	return resolvePath(obj, path);
}

function setPath(obj, path, val){
	var ref = resolvePath(obj, path, val);
	return typeof ref !== 'undefined';
}

console.log('\n-------------------------------------------------------\n');
console.log('str1:', str1);
console.log('Tokens:',JSON.stringify(tokenize(str1)));
console.log('Get returned:', getPath(data, str1));

console.log('\n-------------------------------------------------------\n');
console.log('str2:', str2);
console.log('Tokens:',JSON.stringify(tokenize(str2)));
console.log('Get returned:', getPath(data, str2));

console.log('\n-------------------------------------------------------\n');
console.log('str3:', str3);
console.log('Tokens:',JSON.stringify(tokenize(str3)));
console.log('Get returned:', getPath(data, str3));

console.log('\n-------------------------------------------------------\n');
console.log('str4:', str4);
console.log('Tokens:',JSON.stringify(tokenize(str4)));
console.log('Get returned:', getPath(data, str4));

console.log('\n-------------------------------------------------------\n');
console.log('str5:', str5);
console.log('Tokens:',JSON.stringify(tokenize(str5)));
console.log('Get returned:', getPath(data, str5));

console.log('\n-------------------------------------------------------\n');
console.log('str6:', str6);
console.log('Tokens:',JSON.stringify(tokenize(str6)));
console.log('Get returned:', getPath(data, str6));

console.log('\n-------------------------------------------------------\n');
console.log('str2:', str2);
console.log('Tokens:',JSON.stringify(tokenize(str2)));
console.log('Old val:', getPath(data, str2));
console.log('Able to set new value?', setPath(data, str2, 'new id'));
console.log('New val:', getPath(data, str2));
