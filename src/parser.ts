import { Tokenizer, Token } from "./tokenizer";
/**
 * Simple integer arithmetic calculator
 * according to the EBNF
 * using recursive descent algorithm。
 *
 * <exp> -> <term> { <addop> <term> }
 * <addop> -> + | -
 * <term> -> <factor> { <mulop> <factor> }
 * <mulop> -> * | /
 * <facor> -> ( <exp> ) | Number
 *
 * Inputs a line of text
 * Outputs "Error" or the result
 *
 */

class Parser {}

export function parse(code: string) {
  const tokenizer = new Tokenizer();
  tokenizer.setText(code);

  function getToken() {
    return tokenizer.getToken();
  }

  // Global token variable.
  let token: Token;

  main();

  function error(err: string = "") {
    throw new Error(err);
  }

  function match(expectedToken: Token) {
    if (Token.equal(expectedToken, token)) {
      token = getToken();
    } else {
      error();
    }
  }

  function main(): void {
    let result;
    token = getToken();

    result = exp();
    if (Token.isEndOfFileToken(token)) {
      console.log(`Result = ${result}`);
    } else {
      error();
    }

    return void 0;
  }

  function exp() {
    let temp = term();

    while (token.value === "+" || token.value === "-") {
      switch (token.value) {
        case "+":
          match(Token.createPunctuatorToken("+"));
          temp += term();
          break;
        case "-":
          match(Token.createPunctuatorToken("-"));
          temp -= term();
      }
    }
    return temp;
  }

  function term() {
    let temp = factor();

    while (token.value === "*" || token.value === "/") {
      switch(token.value) {
        case "*":
          match(Token.createPunctuatorToken("*"));
          temp *= factor();
          break;
        case "/":
          match(Token.createPunctuatorToken("/"));
          temp /= factor();
          break;
          
      }
    }
    return temp;
  }

  function factor() {
    let temp: number;
    if (token.value === "(") {
      match(Token.createPunctuatorToken("("));
      temp = exp();
      match(Token.createPunctuatorToken(")"));
    } else if (Token.isNumericToken(token)) {
      temp = parseInt(token.value);
      token = getToken();
    } else {
      error();
    }
    return temp!;
  }
}
