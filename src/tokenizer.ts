const STRING_LITERAL_STARTING_EXP = /^['"]$/;
const PUNCTUATOR_EXP = /^[+\-/*&|()]$/;
const NUMBER_EXP = /^[0-9]$/;

export namespace Token {
  export function equal(orig: Token, targ: Token) {
    return orig.type === targ.type && orig.value === orig.value;
  }
  export function isEndOfFileToken(token: Token) {
    return token instanceof EndOfFileToken;
  }

  export function isNumericToken(token: Token) {
    return token instanceof Numeric;
  }
  export function createEndOfFileToken() {
    return new EndOfFileToken();
  }

  export function createStringLiteralToken(value: string) {
    return new StringLiteral(value);
  }

  export function createPunctuatorToken(value: string) {
    return new Punctuator(value);
  }

  export function createNumericToken(value: string) {
    return new Numeric(value);
  }

  class Numeric implements Token {
    public value: string;
    public type = TokenType.Numeric;

    constructor(value: string) {
      this.value = value;
    }
  }

  class Punctuator implements Token {
    public value: string;
    public type = TokenType.Punctuator;
    constructor(value: string) {
      this.value = value;
    }
  }

  class StringLiteral implements Token {
    public value: string;
    public type = TokenType.StringLiteral;

    constructor(value: string) {
      this.value = value;
    }
  }
  class EndOfFileToken implements Token {
    public type = TokenType.EndOfFile;
    public value = "";
  }
}

enum TokenType {
  "Keyword",
  "Identifier",
  "Punctuator",
  "StringLiteral",
  "Numeric",
  "EndOfFile"
}

export interface Token {
  type: TokenType;
  value: string;
  range?: Range;
}

interface Range extends Array<number> {
  0: number;
  1: number;
}

export class Tokenizer {
  private _textScanner: TextScanner | undefined;

  private _tokens: Token[] = [];

  private _parseFinished: boolean = false;

  public constructor() {}
  public setText(text: string) {
    this._textScanner = new TextScanner(text);
  }

  public getToken(): Token {
    if (!this._textScanner) {
      throw new Error(
        `Method "getToken()" should be called after setting text with method "setText()".`
      );
    }
    const token = getToken(this._textScanner);

    if (Token.isEndOfFileToken(token)) {
      this._parseFinished = true;
    } else {
      this._tokens.push(token);
    }
    return token;
  }

  // public unGetToken() {
  //   const lastToken = this._tokens.pop();
  //   if (lastToken) {
  //     this._textScanner.setPos(lastToken.range.start);
  //   }
  // }
}

function getToken(scanner: TextScanner): Token {
  let start = scanner.getCurrentPos();
  let char = scanner.getChar();

  if (char === undefined) {
    return Token.createEndOfFileToken();
  }

  if (char === " ") {
    return getToken(scanner);
  }

  if (STRING_LITERAL_STARTING_EXP.test(char)) {
    return getStringLiteralToken(scanner, start);
  }

  if (PUNCTUATOR_EXP.test(char)) {
    return getPunctuatorToken(scanner, char, start);
  }

  if (NUMBER_EXP.test(char)) {
    return getNumericToken(scanner, char, start);
  }

  throw new Error(`Encountered unrecognizable charactor: "${char}".`);
}

/**
 * Currently only get integer.
 *
 * @param {TextScanner} scanner
 * @param {string} currentChar
 * @param {number} start
 */
function getNumericToken(
  scanner: TextScanner,
  currentChar: string,
  start: number
) {
  let value = currentChar;
  let char = scanner.getChar();
  while (char && NUMBER_EXP.test(char)) {
    value = value + char;
    char = scanner.getChar();
  }
  scanner.retreat();
  return Token.createNumericToken(value);
}

function getPunctuatorToken(
  scanner: TextScanner,
  currentChar: string,
  start: number
): Token {
  const char = scanner.getChar();
  let token;
  if (!char || !/^[&|]$/.test(char)) {
    scanner.retreat();
    token = Token.createPunctuatorToken(currentChar);
  } else {
    token = Token.createPunctuatorToken(currentChar + char);
  }
  return token;
}

function getStringLiteralToken(scanner: TextScanner, start: number): Token {
  const char = scanner.getChar();
  if (char === undefined) {
    const end = scanner.getCurrentPos();
    throw new Error(
      "String literals are not closed correctly." +
        getPositionString(start, end)
    );
  }
  let value = char;
  while (!STRING_LITERAL_STARTING_EXP.test(char)) {
    value += char;
  }
  return Token.createStringLiteralToken(value);
}

function getPositionString(start: number, end: number) {
  return `${start}:${end}`;
}

class TextScanner {
  private _pos: number = 0;
  private _text: string;
  public constructor(text: string) {
    this._text = text;
  }
  public getTextLength(): number {
    return this._text.length;
  }
  public getChar(): string | undefined {
    return getCharAtPos(this._pos++, this._text);
  }

  public retreat(): void {
    this._pos = Math.max(this._pos - 1, 0);
  }

  public setPos(pos: number) {
    this._pos = pos;
  }
  public getCurrentPos(): number {
    return this._pos;
  }
}

export function tokenize(text: string) {
  const tokenizer = new Tokenizer();
  tokenizer.setText(text);
  let tokenList = [];
  let token = tokenizer.getToken();
  while (!(token.type === TokenType.EndOfFile)) {
    tokenList.push(token);
    token = tokenizer.getToken();
  }
  return tokenList;
}

function getCharAtPos(pos: number, text: string) {
  let char;
  if (pos >= text.length) {
    char = undefined;
  } else {
    char = text[pos];
  }
  return char;
}
