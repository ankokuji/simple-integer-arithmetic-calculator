import { tokenize } from '../src/tokenizer';
import { parse } from '../src/parser';

const formula = "(5 + 4) * 6 + 53 * 532 / 32";
function tokenizeTest() {
  const token = tokenize(formula)
}

function parseTest() {
  const calculate = parse(formula)
}

function main() {
  parseTest()
}

main()