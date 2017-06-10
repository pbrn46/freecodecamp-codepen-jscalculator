var app = angular.module('jsCalc', []);

app.controller('mainCalc', function ($sce) {
  this.display = {};
  this.display.oldFormula = "";  // Keep the formula before the equal sign.

  this.resetAll = function (startValue) {
    startValue = $.isNumeric(startValue) ? parseFloat(startValue) : 0;
    if (this._termList && this._termList.length > 1) {
      this.display.oldFormula += this.display.formula + " = ";
    } else {
      this.display.oldFormula = "";
    }
    this._termList = [startValue];
    this._currentTotal = startValue;
    this._prevOperation = undefined;
    this._prevTerm = startValue;
    this._prevWasNumber = true;
    this.total = startValue;
    this.display.total = startValue;
    this.display.formula = startValue;
  };
  this.resetAll();

  // Handle a digit
  this._handleNumber = function (term) {
    term = parseFloat(term);

    // If subsequent number pressed, put them together
    // if ($.isNumeric(this._prevTerm)) {
    if (this._prevTerm == '=') {
      this.resetAll();
    }
    if ($.isNumeric(this._prevTerm)) {
      term = this._prevTerm * 10 + term;
      this._termList.pop();
      this._termList.push(term);  // Update last press entry
    } else {  // If not, just push it.
      this._termList.push(term);
    }
    // Update display-total to temporary number
    // this.display.total = this._termList[this._termList.length - 1].toString();
    this.display.total = term;
    return term;
  };

  // Actually do the math! term needs to be an operation, not a number.
  this._handleMath = function (num1, num2, term) {
    switch (term) {
    case '+':
      return num1 + num2;
      break;
    case '-':
      return num1 - num2;
      break;
    case '*':
      return num1 * num2;
      break;
    case '/':
      return num1 / num2;
      break;
    }
    return undefined;
  };

  // Handle an operation
  this._handleOp = function (term) {
    if (term == '=') {
      this.resetAll(this.display.total);
    } else if (!$.isNumeric(this._prevTerm) && (this._prevTerm != '='))  {
      // If last term wasn't a number, replace the previous operation.
      if (this._termList.length > 0) {
        this._termList.pop();
        this._termList.push(term);
      }
    } else {
      this._termList.push(term);
    }
    this._prevOperation = term;
    return term;
  };

  this.updateFormula = function () {
    this.display.formula = this._termList.join(' ');
  };

  this.onBtnClick = function (event, button) {
    var term = button;
    if ($.isNumeric(term)) {
      this._prevTerm = this._handleNumber(term);
      this._prevWasNumber = true;
    } else {
      this._prevTerm = this._handleOp(term);
      this._prevWasNumber = false;
    }
    this.updateFormula();
  };
});
