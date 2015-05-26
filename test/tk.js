'use strict';

var chai        = require( 'chai' ),
    //sinon       = require( 'sinon' ),
    //sinon_chai  = require( 'sinon-chai' ),
    tk          = require( '../src/tk' ),
    expect      = chai.expect;

//chai.use( sinon_chai );

describe( 'tk', function(){
    var data;

    beforeEach(function(){
        data = {
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

    });

    describe( 'getPath', function(){
        it( 'should get simple dot-separated properties', function(){
            var str = 'accounts.1.checking.id';
            expect(tk.getPath(data, str)).to.equal(data.accounts[1].checking.id);
        } );

        it( 'should return undefined for paths that do not exist', function(){
            var str = 'xaccounts.1.checking.id';
            expect(tk.getPath(data, str)).to.be.undefined;
            str = 'accounts.9.checking.id';
            expect(tk.getPath(data, str)).to.be.undefined;
            str = 'accounts.1.checking.x';
            expect(tk.getPath(data, str)).to.be.undefined;
            expect(tk.getPath(undefined, str)).to.be.undefined;
        } );

        it( 'should be able to evaluate [] container and execute function', function(){
            var str = 'accounts[accounts.2()]checking.id';
            var tmp = data.accounts[2]();
            expect(tk.getPath(data, str)).to.equal(data.accounts[tmp].checking.id);
        } );

        it( 'should execute function at tail of path', function(){
            var str = 'accounts[accounts.2()]checking.fn()';
            var tmp = data.accounts[2]();
            expect(tk.getPath(data, str)).to.equal(data.accounts[tmp].checking.fn());
        } );
        
        it( 'should execute functions defined on base types', function(){
            var str = 'accounts.0.ary.sort()';
            expect(tk.getPath(data, str)).to.equal(data.accounts[0].ary.sort());
        } );
        
        it( 'should allow wildcard * for array indices, resolved as array of values', function(){
            var str = 'accounts.0.ary.*';
            expect(tk.getPath(data, str)).to.be.an.array;
            expect(tk.getPath(data, str).length).to.equal(data.accounts[0].ary.length);
            expect(tk.getPath(data, str).join(',')).to.equal(data.accounts[0].ary.join(','));
        } );
        
        it( 'should allow wildcards for properties, resulting array may be further evaluated', function(){
            var str = 'accounts.1.sav*.sort().0';
            var ary = [];
            for(var prop in data.accounts[1]){
                if (prop.substr(0,3) === 'sav'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            expect(tk.getPath(data, str)).to.equal(ary.sort()[0]);
        } );
        
        it( 'should allow interior wildcards', function(){
            var str = 'accounts.1.sav*a';
            var ary = [];
            for(var prop in data.accounts[1]){
                if (prop.substr(0,3) === 'sav' && prop.substr(4,1) === 'a'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            expect(tk.getPath(data, str)).to.be.an.array;
            expect(tk.getPath(data, str).length).to.equal(ary.length);
            expect(tk.getPath(data, str).join(',')).to.equal(ary.join(','));
        } );
        
        it( 'should let grouping separator create array of results', function(){
            var str = 'accounts.0.ary.0,2';
            var ary = [];
            ary.push(data.accounts[0].ary[0]);
            ary.push(data.accounts[0].ary[2]);
            expect(tk.getPath(data, str)).to.be.an.array;
            expect(tk.getPath(data, str).length).to.equal(ary.length);
            expect(tk.getPath(data, str).join(',')).to.equal(ary.join(','));
        } );
        
        it( 'should allow wildcards inside group', function(){
            var str = 'accounts.1.savA*,savBa';
            var ary = [];
            for(var prop in data.accounts[1]){
                if (prop.substr(0,4) === 'savA'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            ary.push(data.accounts[1].savBa);
            expect(tk.getPath(data, str)).to.be.an.array;
            expect(tk.getPath(data, str).length).to.equal(ary.length);
            expect(tk.getPath(data, str).join(',')).to.equal(ary.join(','));
        } );
        
        it( 'should allow container inside group', function(){
            var str = 'accounts.1.[accounts.3.propAry.0],savA*';
            var ary = [];
            ary.push(data.accounts[1][ data.accounts[3].propAry[0] ]);
            for(var prop in data.accounts[1]){
                if (prop.substr(0,4) === 'savA'){
                    ary.push(data.accounts[1][prop]);
                }
            }
            expect(tk.getPath(data, str)).to.be.an.array;
            expect(tk.getPath(data, str).length).to.equal(ary.length);
            expect(tk.getPath(data, str).join(',')).to.equal(ary.join(','));
        } );
        
        it( 'should allow path of only a comma group', function(){
            var str = '[accounts.1.test1],[accounts.1.test2]';
            var ary = [];
            ary.push(data[data.accounts[1].test1]);
            ary.push(data[data.accounts[1].test2]);
            expect(tk.getPath(data, str)).to.be.an.array;
            expect(tk.getPath(data, str).length).to.equal(ary.length);
            expect(tk.getPath(data, str).join(',')).to.equal(ary.join(','));
        } );
    });

    describe( 'setPath', function(){

        it( 'should set simple dot-separated properties', function(){
            var str = 'accounts.1.checking.id';
            var newVal = 'new';
            tk.setPath(data, str, newVal);
            expect(tk.getPath(data, str)).to.equal(newVal);
        } );

        it( 'should return true if set was successful', function(){
            var str = 'accounts.1.checking.id';
            var newVal = 'new';
            expect(tk.setPath(data, str, newVal)).to.be.true;
            expect(tk.getPath(data, str)).to.equal(newVal);
        } );

        it( 'should return false if set was not successful', function(){
            var str = 'accounts.1.checking.badProperty';
            var newVal = 'new';
            expect(tk.setPath(data, str, newVal)).to.be.false;
            expect(tk.getPath(data, str)).to.be.undefined;
        } );

        it( 'should set value to all entries in array for wildcard path', function(){
            var str = 'accounts.1.sav*';
            var newVal = 'new';
            expect(tk.setPath(data, str, newVal)).to.be.true;

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
            expect(tk.setPath(data, str, newVal)).to.be.true;
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
            expect(tk.setPath(data, str, newVal)).to.be.true;

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

        it( 'should set value to all entries in comma group of containers', function(){
            var str = '[accounts.1.test1],[accounts.1.test2]';
            var newVal = 'new';
            expect(tk.setPath(data, str, newVal)).to.be.true;
            expect(data[data.accounts[1].test1]).to.equal(newVal);
            expect(data[data.accounts[1].test2]).to.equal(newVal);
            expect(data[data.accounts[1].test3]).to.not.equal(newVal);
        });

        it( 'should return false if at least one entry in comma group failed to set', function(){
            var str = 'accounts.1.savX,savY,savQ';
            var newVal = 'new';
            expect(tk.setPath(data, str, newVal)).to.be.false;
        });

    });

    describe( 'getPathFor', function(){
        it( 'should return a valid path to the value if present in the root object', function(){
            var val = data.accounts[1].test2;
            expect(tk.getPathFor(data, val)).to.equal('accounts.1.test2');
            expect(tk.getPath(data, tk.getPathFor(data, val))).to.equal(val);
        });

        it( 'should be identity: getPath(getPathFor) and getPathFor(getPath)', function(){
            var val = data.accounts[1].test2;
            var str = 'accounts.1.test2';
            expect(tk.getPath(data, tk.getPathFor(data, val))).to.equal(val);
            expect(tk.getPathFor(data, tk.getPath(data, str))).to.equal(str);
        });

        it( 'should return undefined if no path found', function(){
            var val = 12345;
            expect(tk.getPathFor(data, val)).to.be.undefined;
        });

        it( 'should return one valid path if "one" option is set or if not specified', function(){
            var val = data.accounts[1].test2;
            expect(tk.getPathFor(data, val)).to.be.a.string;
            expect(tk.getPathFor(data, val, 'one')).to.be.a.string;
        });

        it( 'should return all valid path if "many" option is set', function(){
            var val = data.accounts[1].test1;
            expect(tk.getPathFor(data, val, 'many')).to.be.an.array;
            expect(tk.getPathFor(data, val, 'many').sort().join(',')).to.equal('accounts.1.checking.repeat,accounts.1.test1');
        });

    });

} );
