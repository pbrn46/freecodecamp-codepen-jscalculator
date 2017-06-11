var app = angular.module('jsCalc', []);

var CalcFormula = function () {
  this.formula = [];
  this.clear = function () {
    this.formula = [];
  };

  this.update = function (newValue) {
    oldValue = this.formula.pop();
    this.formula.push(newValue);
    return oldValue;
  };

  this.pop = function () {
    return this.formula.pop();
  };

  this.push = function (newValue) {
    return this.formula.push(newValue);
  };

  this.toString = function () {
    return this.formula.join(' ');
  };

  this.get = function (index) {
    return this.formula.slice(index)[0];
  };

  this.length = function () {
    return this.formula.length;
  };
};

var Display = function () {
  this.register = "0";
  this.formula = "0";
  this.history = "";
  this.update = function (key, value) {
    this[key] = value;
  };
};

app.controller('mainCalc', function ($sce, $document, $scope) {
  this.display = new Display();

  this.isDigit = function (term) {
    var n = Math.floor(Number(term));
    return String(n) === term && n >= 0 && n <= 9;
  };

  this.isMathOp = function (term) {
    switch (term) {
    case '+': case '-': case '*': case '/': return true;
    }
    return false;
  };

  this.resetCalc = function () {
    this.display = new Display();
    this.formula = new CalcFormula();
    this.history = "";
    this.curTotal = 0;
    this.prevMathOp = null;
    this.prevTerm = null;
    this.curNumStr = '0';
    this.prevNumStr = null;
    this.formula.push('0');
    this.display.update('register', 0);
    this.display.update('formula', 0);
  };

  this.operationReverse = function (operation) {
    switch (operation) {
    case '+': return '-'; break;
    case '-': return '+'; break;
    case '*': return '/'; break;
    case '/': return '*'; break;
    }
    return operation;
  };

  this.doMath = function (num1, num2, operation) {
    num1 = parseFloat(num1);
    num2 = parseFloat(num2);
    if (isNaN(num1)) return num2;
    switch (operation) {
    case '+': return num1 + num2; break;
    case '-': return num1 - num2; break;
    case '*': return num1 * num2; break;
    case '/': return num1 / num2; break;
    }
    return num2;
  };

  this.doMathReverse = function (num1, num2, operation) {
    // Note that we do num2 op num1 rather than num1 op num2
    return this.doMath(num2, num1, this.operationReverse(operation));
  };

  this.updateTotal = function () {
    this.curTotal = this.doMath(this.curTotal, this.curNumStr, this.prevMathOp);
    this.display.update('register', this.curTotal);
  };

  this.handleDigitDot = function (term) {
    if (this.isDigit(this.prevTerm) || this.prevTerm == '.' || this.prevTerm === null || this.prevTerm == 'CE' || this.prevTerm == 'AC') {
      if (this.curNumStr == '0') {
        this.curNumStr = term;
      } else {
        this.curNumStr = this.curNumStr + term;
      }
      this.formula.update(this.curNumStr);
      this.display.update('formula', this.formula.toString());
    } else {
      this.prevNumStr = this.curNumStr;
      if (this.prevTerm == '=') {
        // If last term is '=' then start a new formula
        console.log("New formula!");
        this.prevNumStr = null;
        this.history = this.formula.toString() + '\n' + this.history;
        this.display.update('history', this.history);
        this.curTotal = null;
        this.formula.clear();
      }
      this.curNumStr = term;
      if (this.curNumStr == '.') {
        this.curNumStr = '0.';
      }
      this.formula.push(this.curNumStr);
      this.display.update('formula', this.formula.toString());
    }
    this.display.update('register', this.curNumStr);
  };

  this.handleMathOp = function (term) {
    if (this.isMathOp(this.prevTerm)) {
      this.formula.update(term);
    } else {
      this.formula.push(term);
      if (this.prevTerm != '=' && this.prevTerm != 'CE') {
        this.updateTotal();
      }
      // this.prevMathOp = this.curMathOp;
    }
    this.prevMathOp = this.curMathOp;
    this.curMathOp = term;
    this.display.update('formula', this.formula.toString());
  };

  this.handleEquals = function (term) {
    if (this.prevTerm == '=') {
      this.curNumStr = this.prevNumStr;
      this.formula.push(this.prevMathOp);
      this.formula.push(this.prevNumStr);
    }
    this.updateTotal();
    // this.prevNumStr = null;
    this.prevNumStr = this.curNumStr;
    this.curNumStr = this.curTotal;
    if (this.isMathOp(this.prevTerm)) {
      this.formula.pop();
    }
    this.formula.push(term);
    this.formula.push(this.curTotal);
    this.display.update('formula', this.formula.toString());
  };

  this.handleCE = function (term) {
    var popped = this.formula.pop();
    if (this.isMathOp(popped)) {
      popped = this.formula.pop();
    } else if (this.prevTerm != 'CE') {
      this.curTotal = this.doMath(this.curNumStr, this.curTotal, this.prevMathOp);
    }
    this.curNumStr = popped;
    this.prevNumStr = this.formula.get(-2);
    this.prevMathOp = this.formula.get(-1);
    this.curTotal = this.doMathReverse(this.curNumStr, this.curTotal, this.prevMathOp);
    popped = this.formula.pop();
    if (this.formula.length() == 0) {
      this.curTotal = 0;
      this.formula.push('0');
    }
    this.prevNumStr = this.formula.get(-3);
    this.prevMathOp = this.formula.get(-2);
    this.curNumStr = this.formula.get(-1);
    console.log(this.prevMathOp);
    console.log(this.curNumStr);
    // this.curTotal = this.doMathReverse(this.prevNumStr, this.curTotal, this.prevMathOp);
    console.log(this.curTotal);
    this.display.update('register', this.curNumStr);
    this.display.update('formula', this.formula.toString());
  };

  this.handleAC = function (term) {
    this.resetCalc();
  };

  this.handleTerm = function (term) {
    var termUnused = false;
    if (this.isDigit(term) || term == '.') {
      this.handleDigitDot(term);
    } else if (this.isMathOp(term)) {
      this.handleMathOp(term);
      this.prevMathOp = term;
    } else if (term == '=') {
      this.handleEquals(term);
    } else if (term =='CE') {
      this.handleCE(term);
    } else if (term == 'AC') {
      this.handleAC(term);
    } else {
      termUnused = true;
    }

    // Only update prevTerm if it is a valid key
    if (!termUnused) {
      this.prevTerm = term;
    }
  };

  this.onBtnClick = function (event, term) {
    this.handleTerm(term);
  };

  var thees = this;
  this.onKeyPress = function (event) {
    switch (event.key) {
    case '0': case '1': case '2': case '3': case '4':
    case '5': case '6': case '7': case '8': case '9':
    case '+': case '-': case '*': case '/': case '.':
    case '=':
      thees.onBtnClick(null, event.key);
      break;
    case 'Backspace':
      thees.onBtnClick(null, 'CE');
      break;
    case 'Escape':
      thees.onBtnClick(null, 'AC');
      break;
    case 'Enter':
      thees.onBtnClick(null, '=');
      break;
    }
    $scope.$apply();
  };
  $document.bind("keydown", this.onKeyPress);

  this.resetCalc();

});
