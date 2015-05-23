'use strict';

var chai        = require( 'chai' ),
    //sinon       = require( 'sinon' ),
    //sinon_chai  = require( 'sinon-chai' ),
    tk          = require( '../src/tk' ),
    expect      = chai.expect;

//chai.use( sinon_chai );

describe( 'tk', function(){
    // console.log('c', containers);
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

    it( 'should get simple dot-separated properties', function(){
        var str = 'accounts.1.checking.id';
        expect(tk.getPath(data, str)).to.equal(data.accounts[1].checking.id);
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
        expect(tk.getPath(data, str).length).to.equal(4);
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
    
    it( 'should let wildcarded array be further evaluated', function(){
        var str = 'accounts.0.ary.0,2';
        var ary = [];
        ary.push(data.accounts[0].ary[0]);
        ary.push(data.accounts[0].ary[2]);
        expect(tk.getPath(data, str)).to.be.an.array;
        expect(tk.getPath(data, str).length).to.equal(2);
        expect(tk.getPath(data, str).join(',')).to.equal(ary.join(','));
    } );
    
} );
