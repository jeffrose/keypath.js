'use strict';

var chai        = require( 'chai' ),
    //sinon       = require( 'sinon' ),
    //sinon_chai  = require( 'sinon-chai' ),
    tk          = require( '../dist/tk-umd' ),
    expect      = chai.expect;

//chai.use( sinon_chai );

// tk.setOptions({cache:false});

describe( 'tk', function(){
    var data, other;

            // var str2 = 'accounts.1.{~accounts.3.propAry.0}';
    beforeEach(function(){
        data = {
            'undef': undefined,
            'propA': 'one',
            'propB': 'two',
            'propC': 'three',
            'foo.bar': 'FooBar',
            'blah': 'quoted',
            'John "Johnny" Doe': 'a name',
            'accounts': [
                /* 0 */ { 'ary': [9,8,7,6] },
                /* 1 */ {
                            'checking': {
                                'balance': 123.00,
                                'id': '12345',
                                'fn': function(){ return 'Function return value'; },
                                'fnArg': function(){ var args = Array.prototype.slice.call(arguments); return args.join(','); },
                                'repeat': 'propA'
                            },
                            'indices': [0,1,2,3],
                            'savX': 'X',
                            'savY': 'Y',
                            'savZ': 'Z',
                            'savAa': 'aa',
                            'savAb': 'ab',
                            'savAc': 'ac',
                            'savBa': 'ba',
                            'savBb': 'bb',
                            'savBc': 'bc',
                            'test1': 'propA',
                            'test2': 'propB',
                            'test3': 'propC'
                        },
                /* 2 */ function(){ return 1;},
                /* 3 */ { 'propAry': ['savBa', 'savBb'] }
            ]
        };
        
        other = {
            'x': 'propA',
            'y': 'propB',
            'z': 'checking'
        };

    });


    // xdescribe( 'disable', function(){
    describe( 'get', function(){
        it( 'should get simple dot-separated properties', function(){
            var str = 'accounts.1.checking.id';
            expect(tk.get(data, str)).to.equal(data.accounts[1].checking.id);
        } );

        it( 'should return undefined for paths that do not exist', function(){
            var str = 'xaccounts.1.checking.id';
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts.9.checking.id';
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts.1.checking.x';
            expect(tk.get(data, str)).to.be.undefined;
            expect(tk.get(undefined, str)).to.be.undefined;
        } );

        it( 'should be able to evaluate container and execute function', function(){
            var str = 'accounts{2()}checking.id';
            var tmp = data.accounts[2]();
            expect(tk.get(data, str)).to.equal(data.accounts[tmp].checking.id);
        } );

        it( 'should execute function at tail of path', function(){
            var str = 'accounts{2()}checking.fn()';
            var tmp = data.accounts[2]();
            expect(tk.get(data, str)).to.equal(data.accounts[tmp].checking.fn());
        } );
        
        it( 'should execute functions defined on base types', function(){
            var str = 'accounts.0.ary.sort()';
            expect(tk.get(data, str)).to.equal(data.accounts[0].ary.sort());
        } );
        
        it( 'should allow wildcard * for array indices, resolved as array of values', function(){
            var str = 'accounts.0.ary.*';
            expect(tk.get(data, str)).to.be.an.array;
            expect(tk.get(data, str).length).to.equal(data.accounts[0].ary.length);
            expect(tk.get(data, str).join(',')).to.equal(data.accounts[0].ary.join(','));
        } );
        
        it( 'should allow wildcards for properties, resulting array may be further evaluated', function(){
            var str = 'accounts.1.sav*.sort().0';
            var ary = [];
            for(var prop in data.accounts[1]){
                if (prop.substr(0,3) === 'sav'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            expect(tk.get(data, str)).to.equal(ary.sort()[0]);
        } );
        
        it( 'should allow interior wildcards', function(){
            var str = 'accounts.1.sav*a';
            var ary = [];
            for(var prop in data.accounts[1]){
                if (prop.substr(0,3) === 'sav' && prop.substr(4,1) === 'a'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            expect(tk.get(data, str)).to.be.an.array;
            expect(tk.get(data, str).length).to.equal(ary.length);
            expect(tk.get(data, str).join(',')).to.equal(ary.join(','));
        } );

        it('should allow parent prefix to shift context within object', function () {
            var str = 'accounts.0.<1.checking.id';
            expect(tk.get(data, str)).to.equal(data.accounts[1].checking.id);
        });
        
        it('should allow root prefix to shift context within object', function () {
            var str = 'accounts.0.~accounts.1.checking.id';
            expect(tk.get(data, str)).to.equal(data.accounts[1].checking.id);
        });
        
        it('should allow multiple prefixes in one word', function () {
            var str = 'accounts.3.propAry.<<1.checking.id';
            expect(tk.get(data, str)).to.equal(data.accounts[1].checking.id);
        });
        
        it('should allow container to leave outer context alone while processing internal prefix paths', function () {
            var str = 'accounts.1.{<3.propAry.0}';
            var str2 = 'accounts.1.{~accounts.3.propAry.0}';
            var val = data.accounts[1][ data.accounts[3].propAry[0] ];
            expect(tk.get(data, str)).to.equal(val);
            expect(tk.get(data, str2)).to.equal(val);
        });
        
        it('should allow parent prefix to shift context for all wildcard props', function () {
            var str = 'accounts.1.checking.<test*.sort()';
            var ary = [];
            for(var prop in data.accounts[1]){
                if (prop.substr(0,4) === 'test'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            expect(tk.get(data, str).join(',')).to.equal(ary.sort().join(','));
        });

        it( 'should let collection separator create array of results', function(){
            var str = 'accounts.0.ary.0,2,3';
            var ary = [];
            ary.push(data.accounts[0].ary[0]);
            ary.push(data.accounts[0].ary[2]);
            ary.push(data.accounts[0].ary[3]);
            expect(tk.get(data, str)).to.be.an.array;
            expect(tk.get(data, str).length).to.equal(ary.length);
            expect(tk.get(data, str).join(',')).to.equal(ary.join(','));
        } );
        
        it('should continue to process collection results with further properties', function () {
            var str = 'accounts.1.test1,test2.0';
            expect(tk.get(data, str)).to.equal(data.accounts[1].test1);
        });

        it( 'should allow wildcards inside group', function(){
            var str = 'accounts.1.savA*,savBa';
            var ary = [];
            for(var prop in data.accounts[1]){
                if (prop.substr(0,4) === 'savA'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            ary.push(data.accounts[1].savBa);
            expect(tk.get(data, str)).to.be.an.array;
            expect(tk.get(data, str).length).to.equal(ary.length);
            expect(tk.get(data, str).join(',')).to.equal(ary.join(','));
        } );
        
        it( 'should allow container inside group', function(){
            var str = 'accounts.1.{<3.propAry.0},savA*';
            var ary = [];
            ary.push(data.accounts[1][ data.accounts[3].propAry[0] ]);
            for(var prop in data.accounts[1]){
                if (prop.substr(0,4) === 'savA'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            expect(tk.get(data, str)).to.be.an.array;
            expect(tk.get(data, str).length).to.equal(ary.length);
            expect(tk.get(data, str).join(',')).to.equal(ary.join(','));
        } );
        
        it( 'should allow path of only a comma group', function(){
            var str = '{accounts.1.test1},{accounts.1.test2}';
            var ary = [];
            ary.push(data[data.accounts[1].test1]);
            ary.push(data[data.accounts[1].test2]);
            expect(tk.get(data, str)).to.be.an.array;
            expect(tk.get(data, str).length).to.equal(ary.length);
            expect(tk.get(data, str).join(',')).to.equal(ary.join(','));
        } );

        it( 'should process placeholders', function(){
            var str = 'accounts.%1.%2';
            var key = 'savX';
            expect(tk.get(data, str, 1, key)).to.equal(data.accounts[1].savX);
        });
        
        it( 'should call functions with placeholder arg', function(){
            var str = 'accounts.1.checking.fnArg(%1)';
            var key = 'hello';
            expect(tk.get(data, str, key)).to.equal(data.accounts[1].checking.fnArg(key));
        });

        it( 'should call functions with multiple placeholder args', function(){
            var str = 'accounts.1.checking.fnArg(%1, %2)';
            var key = 'hello';
            expect(tk.get(data, str, key, key)).to.equal(data.accounts[1].checking.fnArg(key, key));
        });

        it('should not cache placeholder values, only placeholders', function () {
            var str1 = 'accounts[0]ary.%1';
            expect(tk.get(data, str1, 0)).to.equal(data.accounts[0].ary[0]);
            expect(tk.get(data, str1, 1)).to.equal(data.accounts[0].ary[1]);
        });

        it('should get undefined as result', function () {
            var empty;
            var str = ''; // empty string
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts.1..checking.id'; // empty segment
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts{2()checking.id'; // mismatched container
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts.1.checking.id,missing'; // cannot get missing property inside collection
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts.undef'; // data object is undefined
            expect(tk.get(empty, str)).to.be.undefined;
            str = {t: ['propA', undefined, 'propB']}; // undefined path segment in token list
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts.1.<<<<checking'; // too many parent refs
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts.%.checking.id'; // missing placeholder number
            expect(tk.get(data, str, 1)).to.be.undefined;
            str = 'accounts.%1.checking.id'; // missing placeholder argument
            expect(tk.get(data, str)).to.be.undefined;
            str = 'accounts.1.<missing.id'; // invalid property using modifier
            expect(tk.get(data, str)).to.be.undefined;
        });

        it('should execute crazy function path', function () {
            var fn = function(){
                return function(){
                    return function(){
                        return 'abc';
                    }
                }
            }
            var str = '()()()'
            expect(tk.get(fn, str)).to.equal('abc');
        });

        it('should handle plain property container, treats contents as property name', function () {
            var str1 = 'accounts[0]ary[0]';
            expect(tk.get(data, str1)).to.equal(data.accounts[0].ary[0]);
            var str2 = '["foo.bar"]';
            expect(tk.get(data, str2)).to.equal(data['foo.bar']);
            var str3 = 'accounts.[0].ary[0]';
            expect(tk.get(data, str3)).to.equal(data.accounts[0].ary[0]);
        });

        it('should handle quotes inside plain property container, treats contents as property name', function () {
            var str1 = 'accounts[\'0\']ary["0"]';
            expect(tk.get(data, str1)).to.equal(data.accounts[0].ary[0]);
            var str2 = '["foo.bar"]';
            expect(tk.get(data, str2)).to.equal(data['foo.bar']);
            var str3 = '[\'foo.bar\']';
            expect(tk.get(data, str3)).to.equal(data['foo.bar']);
        });

        it('should treat quotes as normal characters when not inside property container', function () {
            var str1 = '"blah"';
            expect(tk.get(data, str1)).to.equal(data['blah']);
            var str2 = '[\'John "Johnny" Doe\']';
            expect(tk.get(data, str2)).to.equal(data['John "Johnny" Doe']);
        });

        it( 'should process context placeholders', function(){
            var str = '{@1.x}';
            expect(tk.get(data, str, other)).to.equal(data[other.x]);
        });
        
        it( 'should switch processing from base data to new object if context placeholder is used as path segment', function(){
            var str = 'accounts.1.@1.x';
            expect(tk.get(data, str, other)).to.equal(other.x);
        });
        
        it( 'should preserve use of context stack when handling context placeholders', function(){
            var str = 'accounts.1{@1.z}id';
            var fn = function(x){ return x; }
            var str2 = 'accounts.1{@1(%2)}id';
            expect(tk.get(data, str, other)).to.equal(data.accounts[1][other.z].id);
            expect(tk.get(data, str2, fn, 'checking')).to.equal(data.accounts[1][fn('checking')].id);
        });

        it( 'should allow plain property array notation', function(){
            var str = 'accounts.0.ary[0,1]';
            var ary = [];
            ary.push(data.accounts[0].ary[0]);
            ary.push(data.accounts[0].ary[1]);
            expect(tk.get(data, str)).to.be.an.array;
            expect(tk.get(data, str).length).to.equal(ary.length);
            expect(tk.get(data, str).join(',')).to.equal(ary.join(','));

            var str2 = 'accounts.1["test1","test2"]';
            var ary2 = [];
            ary2.push(data.accounts[1].test1);
            ary2.push(data.accounts[1].test2);
            expect(tk.get(data, str2)).to.be.an.array;
            expect(tk.get(data, str2).length).to.equal(ary2.length);
            expect(tk.get(data, str2).join(',')).to.equal(ary2.join(','));

            var str3 = 'accounts.1[test1,test2]';
            var ary3 = [];
            ary3.push(data.accounts[1].test1);
            ary3.push(data.accounts[1].test2);
            expect(tk.get(data, str3)).to.be.an.array;
            expect(tk.get(data, str3).length).to.equal(ary3.length);
            expect(tk.get(data, str3).join(',')).to.equal(ary3.join(','));
        } );
    });

    describe( 'set', function(){

        it( 'should set simple dot-separated properties', function(){
            var str = 'accounts.1.checking.id';
            var newVal = 'new';
            tk.set(data, str, newVal);
            expect(tk.get(data, str)).to.equal(newVal);
        } );

        it( 'should return true if set was successful', function(){
            var str = 'accounts.1.checking.id';
            var newVal = 'new';
            expect(tk.set(data, str, newVal)).to.be.true;
            expect(tk.get(data, str)).to.equal(newVal);
        } );

        it( 'should return false if set was not successful', function(){
            var str = 'accounts.1.checking.newProperty';
            var strBad = 'accounts.1.badProperty.newProperty';
            var newVal = 'new';
            expect(tk.set(data, str, newVal)).to.be.true;
            expect(tk.get(data, str)).to.equal(newVal);
            expect(tk.set(data, strBad, newVal)).to.be.false;
        } );

        it( 'should set value to all entries in array for wildcard path', function(){
            var str = 'accounts.1.sav*';
            var newVal = 'new';
            expect(tk.set(data, str, newVal)).to.be.true;

            var ary = [];
            var testAry = [];
            for(var prop in data.accounts[1]){
                if (prop.substr(0,3) === 'sav'){
                    ary.push(data.accounts[1][prop]);
                    testAry.push(newVal);
                }
            }
            expect(ary.join(',')).to.equal(testAry.join(','));
        });

        it( 'should set value to all entries in simple comma group', function(){
            var str = 'accounts.1.savX,savY';
            var newVal = 'new';
            expect(tk.set(data, str, newVal)).to.be.true;
            expect(data.accounts[1].savX).to.equal(newVal);
            expect(data.accounts[1].savY).to.equal(newVal);
        });

        it( 'should set value to all entries in comma group mixing properties and wildcards', function(){
            var str = 'accounts.1.savX,savY,savA*';
            var newVal = 'new';
            var oldNotAry = [];
            var prop;
            for(prop in data.accounts[1]){
                if (prop !== 'savX' && prop !== 'savY' && prop.substr(0,4) !== 'savA'){
                    oldNotAry.push(data.accounts[1][prop]);
                }
            }
            expect(tk.set(data, str, newVal)).to.be.true;

            var ary = [];
            var testAry = [];
            var notAry = [];
            for(prop in data.accounts[1]){
                if (prop.substr(0,4) === 'savA'){
                    ary.push(data.accounts[1][prop]);
                    testAry.push(newVal);
                }
                else if (prop !== 'savX' && prop !== 'savY') {
                    notAry.push(data.accounts[1][prop]);
                }
            }
            expect(data.accounts[1].savX).to.equal(newVal);
            expect(data.accounts[1].savY).to.equal(newVal);
            expect(notAry.join(',')).to.equal(oldNotAry.join(','));
        });

        it('should allow parent prefix to shift context for all wildcard props', function () {
            var str = 'accounts.1.checking.<test*';
            var newVal = 'new';
            var ary = [];
            var resultAry = [];

            tk.set(data, str, newVal);
            for(var prop in data.accounts[1]){
                if (prop.substr(0,4) === 'test'){
                    ary.push(data.accounts[1][prop]);
                    resultAry.push('new');
                }
            }
            expect(ary.sort().join(',')).to.equal(resultAry.sort().join(','));
        });

        it( 'should set value to all entries in comma group of containers', function(){
            var str = '{accounts.1.test1},{accounts.1.test2}';
            var newVal = 'new';
            expect(tk.set(data, str, newVal)).to.be.true;
            expect(data[data.accounts[1].test1]).to.equal(newVal);
            expect(data[data.accounts[1].test2]).to.equal(newVal);
            expect(data[data.accounts[1].test3]).to.not.equal(newVal);
        });

        it('should allow container to leave outer context alone while processing internal prefix paths', function () {
            var str = 'accounts.1.{<3.propAry.0}';
            var str2 = 'accounts.1.{~accounts.3.propAry.0}';
            var newVal = 'new';
            var newVal2 = 'new2';
            tk.set(data, str, newVal);
            expect(data.accounts[1][ data.accounts[3].propAry[0] ]).to.equal(newVal);
            tk.set(data, str2, newVal2);
            expect(data.accounts[1][ data.accounts[3].propAry[0] ]).to.equal(newVal2);
        });
        
        it('should allow last segment to process prefix paths and set value', function () {
            var str = 'accounts.1.checking.<savX';
            var newVal = 'new';
            tk.set(data, str, newVal);
            expect(data.accounts[1].savX).to.equal(newVal);
        });

        it( 'should process placeholders when setting new value', function(){
            var str = 'accounts.1.%1.id';
            var key = 'checking'
            var newVal = 'new';
            tk.set(data, str, newVal, key);
            expect(tk.get(data, str, key)).to.equal(newVal);
        } );
    });

    describe( 'find', function(){
        it( 'should return a valid path to the value if present in the root object', function(){
            var val = data.accounts[1].test2;
            expect(tk.find(data, val)).to.equal('accounts.1.test2');
            expect(tk.get(data, tk.find(data, val))).to.equal(val);
        });

        it( 'should be identity: get(find) and find(get)', function(){
            var val = data.accounts[1].test2;
            var str = 'accounts.1.test2';
            expect(tk.get(data, tk.find(data, val))).to.equal(val);
            expect(tk.find(data, tk.get(data, str))).to.equal(str);
        });

        it( 'should return undefined if no path found', function(){
            var val = 12345;
            expect(tk.find(data, val)).to.be.undefined;
        });

        it( 'should return undefined for empty data object', function(){
            var val = 12345;
            expect(tk.find(null, val)).to.be.undefined;
            expect(tk.find(undefined, val)).to.be.undefined;
        });

        it( 'should return one valid path if "one" option is set or if not specified', function(){
            var val = data.accounts[1].test2;
            expect(tk.find(data, val)).to.be.a.string;
            expect(tk.find(data, val, 'one')).to.be.a.string;
        });

        it( 'should return all valid path if "many" option is set', function(){
            var val = data.accounts[1].test1;
            expect(tk.find(data, val, 'many')).to.be.an.array;
            expect(tk.find(data, val, 'many').sort().join(',')).to.equal('accounts.1.checking.repeat,accounts.1.test1');
        });

    });

    describe('getTokens', function () {
        it('should return a token array from a string path', function () {
            var str = 'accounts.1.test2';
            var tokens = tk.getTokens(str);
            expect(tokens).to.be.an.object;
            expect(tokens.t).to.be.an.array;
            expect(tokens.t.length).to.equal(3);
        });
        it('should return a token array from an escaped string path', function () {
            var str = 'f\\(oo\\).b\\.ar';
            var tokens = tk.getTokens(str);
            expect(tokens).to.be.an.object;
            expect(tokens.t).to.be.an.array;
            expect(tokens.t.length).to.equal(2);
            expect(tokens.t.join('|')).to.equal('f(oo)|b.ar');
        });
        it('should return undefined if path ends in an escape character', function () {
            var str = 'foo.bar\\';
            expect(tk.getTokens(str)).to.be.undefined;
        });
    });

    describe('isValid', function(){
        it('should correctly identify valid and invalid paths', function(){
            expect(tk.isValid('accounts.1.test2')).to.be.true;
            expect(tk.isValid('accounts.{1.test2')).to.be.false;
            expect(tk.isValid('accounts(.test2')).to.be.false;
            expect(tk.isValid('accounts{{a()},{b.c,d}}')).to.be.true;
            expect(tk.isValid('accounts{{a(),{b.c,d}}')).to.be.false;
        });
    });

    describe('escape', function(){
        it('should escape special characters', function(){
            expect(tk.escape('accounts.1.test2')).to.equal('accounts\\.1\\.test2');
            expect(tk.escape('accounts{{a()},{b.c,d}}')).to.equal('accounts\\{\\{a\\(\\)\\}\\,\\{b\\.c\\,d\\}\\}');
        });
    });
    
    describe('setOptions and resetOptions', function(){
        it('requires setCacheOn/Off to work for testing', function(){
            var path = 'x.y.z';
            var tokens1 = tk.getTokens(path);
            var tokens2 = tk.getTokens(path);
            expect(tokens1.t === tokens2.t).to.be.true;
            tk.setCacheOff();
            var tokens3 = tk.getTokens(path);
            expect(tokens1.t === tokens3.t).to.be.false;
            tk.setCacheOn();
            var tokens4 = tk.getTokens(path);
            expect(tokens1.t === tokens4.t).to.be.true;
        });
        it('requires setCache(true/false) to work for testing', function(){
            var path = 'x.y.z';
            var tokens1 = tk.getTokens(path);
            var tokens2 = tk.getTokens(path);
            expect(tokens1.t === tokens2.t).to.be.true;
            tk.setCache('off');
            var tokens3 = tk.getTokens(path);
            expect(tokens1.t === tokens3.t).to.be.false;
            tk.setCache('yes');
            var tokens4 = tk.getTokens(path);
            expect(tokens1.t === tokens4.t).to.be.true;
        });
        it('requires setOptions and resetOptions for future unit tests', function(){
            tk.setCacheOff();
            expect(tk.getTokens('a.b.c').t.length).to.equal(3);
            tk.setOptions({
                'separators': {
                    '#': {
                        'exec': 'property'
                    }
                }
            });
            expect(tk.getTokens('a.b.c').t.length).to.equal(1);
            expect(tk.getTokens('a#b#c').t.length).to.equal(3);
            
            tk.resetOptions();
            expect(tk.getTokens('a.b.c').t.length).to.equal(3);
            expect(tk.getTokens('a#b#c').t.length).to.equal(1);
            tk.setCacheOn();
        });
    });
    
    describe('setOptions', function(){
        afterEach(function(){
            tk.resetOptions();
        });
        
        it('should allow special characters to be re-defined', function () {
            tk.setOptions({
                'cache': true,
                'prefixes': {
                    '^': {
                        'exec': 'parent'
                    },
                    '~': {
                        'exec': 'root'
                    },
                    '%': {
                        'exec': 'placeholder'
                    }
                },
                'separators': {
                    '!': {
                        'exec': 'property'
                    },
                    ';': {
                        'exec': 'collection'
                    }
                },
                'containers': {
                    '(': {
                        'closer': ')',
                        'exec': 'call'
                    },
                    '[': {
                        'closer': ']',
                        'exec': 'evalProperty'
                    },
                    '{': {
                        'closer': '}',
                        'exec': 'property'
                    }
                }
            });
            var str1 = 'accounts!1!test2';
            var val1 = data.accounts[1].test2;
            expect(tk.get(data, str1)).to.equal(val1);
            var str2 = 'accounts[2()]checking!id';
            var val2 = data.accounts[2]();
            expect(tk.get(data, str2)).to.equal(data.accounts[val2].checking.id);
            var str3 = 'accounts!0!^1!checking!id';
            expect(tk.get(data, str3)).to.equal(data.accounts[1].checking.id);
            var str4 = 'accounts!0!ary!0;2';
            var ary4 = [];
            ary4.push(data.accounts[0].ary[0]);
            ary4.push(data.accounts[0].ary[2]);
            expect(tk.get(data, str4)).to.be.an.array;
            expect(tk.get(data, str4).length).to.equal(ary4.length);
            expect(tk.get(data, str4).join(',')).to.equal(ary4.join(','));
        });
    });
    
    describe('options', function(){
        beforeEach(function(){
           tk.setCacheOff(); 
        });
        afterEach(function(){
            tk.resetOptions();
        });

        describe('force', function(){
           it('should create intermediate properties if they don\'t exist', function(){
                var str = 'accounts.1.newPropA.newPropB';
                var newVal = 'new';
                var result;
                tk.setOptions({force:true});
                result = tk.set(data, str, newVal);
                expect(tk.get(data, str)).to.equal(newVal);
                expect(data.accounts[1].newPropA.newPropB).to.equal(newVal);
                expect(result).to.be.true;
                
                str = 'accounts.1["new.PropA"]newPropB';
                result = tk.set(data, str, newVal);
                expect(tk.get(data, str)).to.equal(newVal);
                expect(data.accounts[1]['new.PropA'].newPropB).to.equal(newVal);
                expect(result).to.be.true;
           });
           
           it('should work with setForceOn()', function(){
                var str = 'accounts.1.newPropA.newPropB';
                var newVal = 'new';
                var result;
                tk.setForceOn();
                result = tk.set(data, str, newVal);
                expect(tk.get(data, str)).to.equal(newVal);
                expect(data.accounts[1].newPropA.newPropB).to.equal(newVal);
                expect(result).to.be.true;
                
                str = 'accounts.1["new.PropA"]newPropB';
                result = tk.set(data, str, newVal);
                expect(tk.get(data, str)).to.equal(newVal);
                expect(data.accounts[1]['new.PropA'].newPropB).to.equal(newVal);
                expect(result).to.be.true;
           });
           
           it('should work with setForce(true)', function(){
                var str = 'accounts.1.newPropA.newPropB';
                var newVal = 'new';
                var result;
                tk.setForce(true);
                result = tk.set(data, str, newVal);
                expect(tk.get(data, str)).to.equal(newVal);
                expect(data.accounts[1].newPropA.newPropB).to.equal(newVal);
                expect(result).to.be.true;
                
                str = 'accounts.1["new.PropA"]newPropB';
                result = tk.set(data, str, newVal);
                expect(tk.get(data, str)).to.equal(newVal);
                expect(data.accounts[1]['new.PropA'].newPropB).to.equal(newVal);
                expect(result).to.be.true;
           });
           
           it('should NOT create intermediate properties if force is off', function(){
                var str = 'accounts.1.newPropA.newPropB';
                var newVal = 'new';
                var result;
                tk.setForceOff();
                result = tk.set(data, str, newVal);
                expect(tk.get(data, str)).to.be.undefined;
                expect(result).to.be.false;
           });
           
        });
        
        describe('separators', function(){
            it('should allow all separators to be changed at once', function(){
                tk.setOptions({
                    separators: {
                        '#': { exec: 'property' }
                    }
                });
                expect(tk.getTokens('a.b.c').t.length).to.equal(1);
                expect(tk.getTokens('a#b#c').t.length).to.equal(3);
                expect(tk.getTokens('a,b,c').t.length).to.equal(1);
            });
            
            it('should modify individual separators with setSeparatorProperty', function(){
                tk.setSeparatorProperty('#');
                expect(tk.getTokens('a.b.c').t.length).to.equal(1);
                expect(tk.getTokens('a#b#c').t.length).to.equal(3);
                expect(tk.getTokens('a,b,c').t.length).to.equal(1);
                expect(tk.getTokens('a,b,c').t[0].length).to.equal(3);
            });
            
            it('should modify individual separators with setSeparatorCollection', function(){
                tk.setSeparatorCollection('#');
                expect(tk.getTokens('a.b.c').t.length).to.equal(3);
                expect(tk.getTokens('a#b#c').t.length).to.equal(1);
                expect(tk.getTokens('a#b#c').t[0]).to.be.an.array;
                expect(tk.getTokens('a#b#c').t[0].length).to.equal(3);
                expect(tk.getTokens('a,b,c').t.length).to.equal(1);
                expect(tk.getTokens('a,b,c').t[0]).to.be.a.string;
            });
        });
        
        describe('prefixes', function(){
            it('should allow all prefixes to be changed at once', function(){
                tk.setOptions({
                    prefixes: {
                        '#': { exec: 'root' }
                    }
                });
                expect(tk.get(data, 'accounts.1.checking.~propA')).to.be.undefined;
                expect(tk.get(data, 'accounts.1.checking.#propA')).to.equal(data.propA);
                expect(tk.get(data, 'accounts.1.checking.<test1')).to.be.undefined;
                expect(tk.get(data, 'accounts.1.checking.%propA')).to.be.undefined;
            });
            
            it('should modify individual prefixes with setPrefixParent', function(){
                tk.setPrefixParent('#');
                expect(tk.get(data, 'accounts.1.checking.~propA')).to.equal(data.propA);
                expect(tk.get(data, 'accounts.1.checking.#test1')).to.equal(data.accounts[1].test1);
                expect(tk.get(data, 'accounts.1.checking.<test1')).to.be.undefined;
            });
            
            it('should modify individual prefixes with setPrefixRoot', function(){
                tk.setPrefixRoot('#');
                expect(tk.get(data, 'accounts.1.checking.~propA')).to.be.undefined;
                expect(tk.get(data, 'accounts.1.checking.#propA')).to.equal(data.propA);
                expect(tk.get(data, 'accounts.1.checking.<test1')).to.equal(data.accounts[1].test1);
            });
            
            it('should modify individual prefixes with setPrefixPlaceholder', function(){
                tk.setPrefixPlaceholder('#');
                expect(tk.get(data, 'accounts.1.%1.id', 'checking')).to.be.undefined;
                expect(tk.get(data, 'accounts.1.#1.id', 'checking')).to.equal(data.accounts[1].checking.id);
                expect(tk.get(data, 'accounts.1.checking.<test1')).to.equal(data.accounts[1].test1);
            });
            
            it('should modify individual prefixes with setPrefixContext', function(){
                tk.setPrefixContext('#');
                expect(tk.get(data, 'accounts.1.@1.0', 'checking')).to.be.undefined;
                expect(tk.get(data, 'accounts.1.#1.0', 'checking')).to.equal('c');
                expect(tk.get(data, 'accounts.1.%1.id', 'checking')).to.equal(data.accounts[1].checking.id);
                expect(tk.get(data, 'accounts.1.checking.<test1')).to.equal(data.accounts[1].test1);
            });
            
        });
        
        describe('containers', function(){
            it('should allow all containers to be changed at once', function(){
                tk.setOptions({
                    containers: {
                        '|': {
                            exec: 'property',
                            closer: '|'
                        }
                    }
                });
                expect(tk.get(data, 'accounts[1]checking.id')).to.be.undefined;
                expect(tk.get(data, 'accounts|1|checking.id')).to.equal(data.accounts[1].checking.id);
            });
            
            it('should modify individual containers with setContainerProperty', function(){
                tk.setContainerProperty('|', '|');
                expect(tk.get(data, 'accounts[1]checking.id')).to.be.undefined;
                expect(tk.get(data, 'accounts|1|checking.id')).to.equal(data.accounts[1].checking.id);
            });
            
            it('should modify individual containers with setContainerEvalProperty', function(){
                tk.setContainerEvalProperty('|', '|');
                expect(tk.get(data, 'accounts[1]checking.id')).to.equal(data.accounts[1].checking.id);
                expect(tk.get(data, '{accounts.1.test1}')).to.be.undefined;
                expect(tk.get(data, '|accounts.1.test1|')).to.equal(data[data.accounts[1].test1]);
            });
            
            it('should modify individual containers with setContainerSinglequote', function(){
                tk.setContainerSinglequote('|', '|');
                expect(tk.get(data, 'accounts.\'1\'.checking.id')).to.be.undefined;
                expect(tk.get(data, 'accounts|1|checking.id')).to.equal(data.accounts[1].checking.id);
                expect(tk.get(data, 'accounts."1".checking.id')).to.equal(data.accounts[1].checking.id);
            });
            
            it('should modify individual containers with setContainerDoublequote', function(){
                tk.setContainerDoublequote('|', '|');
                expect(tk.get(data, 'accounts."1".checking.id')).to.be.undefined;
                expect(tk.get(data, 'accounts|1|checking.id')).to.equal(data.accounts[1].checking.id);
                expect(tk.get(data, 'accounts.\'1\'.checking.id')).to.equal(data.accounts[1].checking.id);
            });
            
            it('should modify individual containers with setContainerCall', function(){
                tk.setContainerCall('|', '|');
                expect(tk.get(data, 'accounts.0.ary.sort().0')).to.be.undefined;
                expect(tk.get(data, 'accounts.0.ary.sort||.0')).to.equal(data.accounts[0].ary.sort()[0]);
                expect(tk.get(data, 'accounts."1".checking.id')).to.equal(data.accounts[1].checking.id);
            });
            
        });
        
        describe('errors', function(){
            it('should throw error when new character is missing', function(){
                expect(function(){tk.setSeparatorProperty();}).to.throw(/invalid value/);
                expect(function(){tk.setSeparatorProperty('');}).to.throw(/invalid value/);
                expect(function(){tk.setSeparatorProperty('..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setSeparatorCollection();}).to.throw(/invalid value/);
                expect(function(){tk.setSeparatorCollection('');}).to.throw(/invalid value/);
                expect(function(){tk.setSeparatorCollection('..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setPrefixParent();}).to.throw(/invalid value/);
                expect(function(){tk.setPrefixParent('');}).to.throw(/invalid value/);
                expect(function(){tk.setPrefixParent('..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setPrefixRoot();}).to.throw(/invalid value/);
                expect(function(){tk.setPrefixRoot('');}).to.throw(/invalid value/);
                expect(function(){tk.setPrefixRoot('..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setPrefixPlaceholder();}).to.throw(/invalid value/);
                expect(function(){tk.setPrefixPlaceholder('');}).to.throw(/invalid value/);
                expect(function(){tk.setPrefixPlaceholder('..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setPrefixContext();}).to.throw(/invalid value/);
                expect(function(){tk.setPrefixContext('');}).to.throw(/invalid value/);
                expect(function(){tk.setPrefixContext('..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setContainerProperty();}).to.throw(/invalid value/);
                expect(function(){tk.setContainerProperty('','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerProperty('|','');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerProperty('..','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerProperty('|','..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setContainerSinglequote();}).to.throw(/invalid value/);
                expect(function(){tk.setContainerSinglequote('','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerSinglequote('|','');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerSinglequote('..','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerSinglequote('|','..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setContainerDoublequote();}).to.throw(/invalid value/);
                expect(function(){tk.setContainerDoublequote('','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerDoublequote('|','');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerDoublequote('..','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerDoublequote('|','..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setContainerCall();}).to.throw(/invalid value/);
                expect(function(){tk.setContainerCall('','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerCall('|','');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerCall('..','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerCall('|','..');}).to.throw(/invalid value/);
                
                expect(function(){tk.setContainerEvalProperty();}).to.throw(/invalid value/);
                expect(function(){tk.setContainerEvalProperty('','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerEvalProperty('|','');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerEvalProperty('..','|');}).to.throw(/invalid value/);
                expect(function(){tk.setContainerEvalProperty('|','..');}).to.throw(/invalid value/);
            });
            
            it('should throw error when is in use for another purpose', function(){
                expect(function(){tk.setSeparatorProperty(',');}).to.throw(/value already in use/);
                expect(function(){tk.setSeparatorProperty('*');}).to.throw(/value already in use/);

                expect(function(){tk.setSeparatorCollection('.');}).to.throw(/value already in use/);
                expect(function(){tk.setSeparatorCollection('*');}).to.throw(/value already in use/);

                expect(function(){tk.setPrefixParent('.');}).to.throw(/value already in use/);
                expect(function(){tk.setPrefixParent('*');}).to.throw(/value already in use/);

                expect(function(){tk.setPrefixRoot('.');}).to.throw(/value already in use/);
                expect(function(){tk.setPrefixRoot('*');}).to.throw(/value already in use/);

                expect(function(){tk.setPrefixPlaceholder('.');}).to.throw(/value already in use/);
                expect(function(){tk.setPrefixPlaceholder('*');}).to.throw(/value already in use/);

                expect(function(){tk.setPrefixContext('.');}).to.throw(/value already in use/);
                expect(function(){tk.setPrefixContext('*');}).to.throw(/value already in use/);

                expect(function(){tk.setContainerProperty('.','|');}).to.throw(/value already in use/);
                expect(function(){tk.setContainerProperty('*','|');}).to.throw(/value already in use/);

                expect(function(){tk.setContainerSinglequote('.','|');}).to.throw(/value already in use/);
                expect(function(){tk.setContainerSinglequote('*','|');}).to.throw(/value already in use/);

                expect(function(){tk.setContainerDoublequote('.','|');}).to.throw(/value already in use/);
                expect(function(){tk.setContainerDoublequote('*','|');}).to.throw(/value already in use/);

                expect(function(){tk.setContainerCall('.','|');}).to.throw(/value already in use/);
                expect(function(){tk.setContainerCall('*','|');}).to.throw(/value already in use/);

                expect(function(){tk.setContainerEvalProperty('.','|');}).to.throw(/value already in use/);
                expect(function(){tk.setContainerEvalProperty('*','|');}).to.throw(/value already in use/);
            });
        });
    });

    describe('clock', function(){
        var complexObj, deepObj, testResult;

        var repeat = 1;

        var getTime = function getTime(startTime){
            if (global.process && global.process.hrtime){
                if (startTime){
                    var diff = process.hrtime(startTime);
                    return diff[0] ? (diff[0] * 1000000000) + diff[1] : diff[1];
                }
                return process.hrtime();
            }
            startTime = startTime || 0;
            if (global.Performance !== undefined){
                return (Date.now() * 1000) - startTime;
            }
            return (Date.now() * 1000) - startTime;
        };

        var getMeanTime = function getMeanTime(t, num){
            if(t.shift && t.pop){
                return t[0] ? Math.floor(((t[0] * 1000000000) + t[1]) / num) : Math.floor(t[1] / num);
            }
            return Math.floor(t / num);
        };

        var getDisplayTime = function getDisplayTime(t){
            var tString = '';

            // if(t.shift && t.pop){
            //     // convert process.hrtime array into nanoseconds
            //     t = t[0] ? (t[0] * 1000000000) + t[1] : t[1];
            // }
            // else {
            //     // normalize other timing methods to nanoseconds
            //     t = t * 1000;
            // }
            if (Math.abs(t) / 1000000000 > 1) {
                return ((Math.round(t / 1000000))/1000) + 's';
            }
            if (Math.abs(t) / 1000000 > 1) {
                return ((Math.round(t / 1000))/1000) + 'ms';
            }
            if (Math.abs(t) / 1000 > 1) {
                return (t/1000) + 'µs';
            }
            return t + 'ns';
        };

        var timeFunction = function timeFunction(){
            var args = Array.prototype.slice.call(arguments);
            var num = args.shift();
            var cb = args.shift();
            var startTime, endTime, totalTime = 0;

            // Call once to create in memory - first run is always slow
            // cb.apply(this, args);

            for(var i = 0; i < num; i++){
                args.push(i);
                startTime = getTime();
                cb.apply(this, args);
                totalTime = getTime(startTime);
            }
            return totalTime;
            // var avg = totalTime / num;
            // return Math.floor(avg);
        };

        var timeFunctionString = function timeFunctionString(){
            var args = Array.prototype.slice.call(arguments);
            var num = args[0];
            return getDisplayTime(getMeanTime(timeFunction.apply(this, arguments), num));
        };

        var getRandomInt = function getRandomInt(min, max){
            return Math.floor(Math.random() * (max - min)) + min;
        };

        var compare = function compare(num, a, b){
            if (!(a.shift && b.shift && (num > 0))){
                console.error('Usage: compare(executionCount,[fn, arg1..],[fn, arg1..]');
                return;
            }
            var aTime, bTime;
            aTime = getMeanTime(timeFunction.apply(this, [num].concat(a)), num);
            bTime = getMeanTime(timeFunction.apply(this, [num].concat(b)), num);
            return [aTime, bTime, aTime - bTime];
        };

        var compareString = function compareString(num, a, b){
            var args = Array.prototype.slice.call(arguments);
            var num = args[0];
            var compareResult = compare.apply(this, arguments);
            return compareResult.map(getDisplayTime);
        }

        beforeEach(function () {
            testResult = '';

            complexObj = {
                'propA': 'one',
                'propB': 'two',
                'propC': 'three',
                'accounts': [
                    { 'ary': [9,8,7,6] },
                    {
                        'checking': {
                            'balance': 123.00,
                            'id': '12345',
                            'fn': function(){ return 'Function return value'; },
                            'repeat': 'propA'
                        },
                        'savX': 'X',
                        'savY': 'Y',
                        'savZ': 'Z',
                        'savAa': 'aa',
                        'savAb': 'ab',
                        'savAc': 'ac',
                        'savBa': 'ba',
                        'savBb': 'bb',
                        'savBc': 'bc',
                        'test1': 'propA',
                        'test2': 'propB',
                        'test3': 'propC'
                    },
                    function(){ return 1;},
                    { 'propAry': ['savBa', 'savBb'] }
                ]
            };
            deepObj = {};
            var tmp = deepObj;
            for (var i = 0; i < 20; i++){
                tmp.sub = {'a':'one'};
                tmp = tmp.sub;
            }
        });

        afterEach(function(){
            testResult && console.log(testResult);
        });

        it('should run a perf test', function () {
            var str = 'accounts.1.checking.id';
            var result = timeFunctionString(repeat, tk.get, complexObj, str);
            expect(result).to.be.a.string;
            expect(result.length).not.to.equal(0);
        });

        it('should give a baseline performance of basic object get', function () {
            var str = 'sub';
            testResult = ('"' + str + '": ' + timeFunctionString(repeat, function(obj, prop){ return obj[prop]; }, deepObj, str));
        });

        it('should find first level property', function () {
            var str = 'sub';
            testResult = ('"' + str + '": ' + timeFunctionString(repeat, tk.get, deepObj, str));
        });

        it('should find 10th level property', function () {
            var str = 'sub.sub.sub.sub.sub.sub.sub.sub.sub.sub';
            testResult = ('"' + str + '": ' + timeFunctionString(repeat, tk.get, deepObj, str));
        });

        it('should find 20th level property', function () {
            var str = 'sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub.sub';
            testResult = ('"' + str + '": ' + timeFunctionString(repeat, tk.get, deepObj, str));
        });

        it('should find complex value', function () {
            var str = 'accounts.1.{<3.propAry.0},savA*';
            // var str = 'accounts[accounts.2()]checking.fn()';
            testResult = ('"' + str + '": ' + timeFunctionString(repeat, tk.get, complexObj, str));
        });

        it('should compare first level property with 10th level property', function () {
            var strA = 'sub';
            var strB = 'sub.sub.sub.sub.sub.sub.sub.sub.sub.sub';
            var result = compareString(repeat, [ tk.get, deepObj, strA ], [ tk.get, deepObj, strB ]);
            testResult = ('A ("' + strA + '"): ' + result[0] + '\nB ("' + strB + '"): ' + result[1] + '\n' +
                'A - B: ' + result[2]);
        });

        it('should compare complex value resolution with plain javascript version', function () {
            var str = 'accounts.1.{<3.propAry.0},savA*';
            var testFunc = function(data){
                var ary = [];
                ary.push(data.accounts[1][ data.accounts[3].propAry[0] ]);
                for(var prop in data.accounts[1]){
                    if (prop.substr(0,4) === 'savA'){
                        ary.push(data.accounts[1][prop]);
                    }
                }
                return ary;
            }
            // var str = 'accounts[accounts.2()]checking.fn()';
            var result = compareString(repeat, [ tk.get, complexObj, str ], [ testFunc, complexObj ]);
            testResult = ('A ("' + str + '"): ' + result[0] + '\nB (testFunc): ' + result[1] + '\n' +
                'A - B: ' + result[2]);
        });

    });
    // });

    // describe( 'debug', function(){
    // });

} );
