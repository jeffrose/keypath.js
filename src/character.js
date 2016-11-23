export function isDoubleQuote( char ){
    return char === '"';
}

export function isIdentifierPart( char ){
    return isIdentifierStart( char ) || isNumeric( char );
}

export function isIdentifierStart( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
}

export function isNumeric( char ){
    return '0' <= char && char <= '9';
}

export function isPunctuator( char ){
    return '.,?()[]{}%~;'.indexOf( char ) !== -1;
}

export function isQuote( char ){
    return isDoubleQuote( char ) || isSingleQuote( char );
}

export function isSingleQuote( char ){
    return char === "'";
}

export function isWhitespace( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
}