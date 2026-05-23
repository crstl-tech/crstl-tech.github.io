class Calculator {
    constructor(previousTextElement, currentTextElement) {
        this.previousTextElement = previousTextElement;
        this.currentTextElement = currentTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        // Меняем визуальную запятую на программную точку
        const strNum = number === ',' ? '.' : number;
        
        if (strNum === '.' && this.currentOperand.includes('.')) return;
        
        if (this.currentOperand === '0' && strNum !== '.') {
            this.currentOperand = strNum;
        } else {
            this.currentOperand = this.currentOperand.toString() + strNum;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }
        
        // Ограничиваем длину десятичной дроби, чтобы не ломать дизайн
        this.currentOperand = Math.round(computation * 100000000) / 100000000;
        this.operation = undefined;
        this.previousOperand = '';
    }

    updateDisplay() {
        // Возвращаем точку на запятую для русского интерфейса
        this.currentTextElement.innerText = this.currentOperand.toString().replace('.', ',');
        
        if (this.operation != null) {
            this.previousTextElement.innerText = 
                `${this.previousOperand.toString().replace('.', ',')} ${this.operation}`;
        } else {
            this.previousTextElement.innerText = '';
        }
    }
}

const previousTextElement = document.getElementById('previous');
const currentTextElement = document.getElementById('current');
const calculator = new Calculator(previousTextElement, currentTextElement);

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const value = button.innerText;

        switch (action) {
            case 'number':
                calculator.appendNumber(value);
                calculator.updateDisplay();
                break;
            case 'operator':
                calculator.chooseOperation(value);
                calculator.updateDisplay();
                break;
            case 'clear':
                calculator.clear();
                calculator.updateDisplay();
                break;
            case 'delete':
                calculator.delete();
                calculator.updateDisplay();
                break;
            case 'equals':
                calculator.compute();
                calculator.updateDisplay();
                break;
        }
    });
});
