import Null from './null';

function Character( punctuators ){
    this.punctuators = punctuators;
}

Character.prototype = new Null();

Character.prototype.constructor = Character;

Character.prototype.isIdentifierPart = function( char ){
    return this.isIdentifierStart( char ) || this.isNumeric( char );
};

Character.prototype.isIdentifierStart = function( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
};

Character.prototype.isNumeric = function( char ){
    return '0' <= char && char <= '9';
};

Character.prototype.isPunctuator = function( char ){
    return this.punctuators.indexOf( char ) !== -1;
};

Character.prototype.isQuote = function( char ){
    return char === '"' || char === "'";
};

Character.prototype.isWhitespace = function( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
};

export default new Character( '.,?()[]{}%~;' );