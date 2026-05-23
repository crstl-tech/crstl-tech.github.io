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
            case '+': computation = prev + current; break;
            case '−': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': 
                if (current === 0) {
                    this.currentOperand = 'Ошибка';
                    this.operation = undefined;
                    this.previousOperand = '';
                    return;
                }
                computation = prev / current; 
                break;
            case '%': computation = prev % current; break;
            default: return;
        }
        
        // Предотвращаем бесконечные дроби в JS (0.1 + 0.2)
        this.currentOperand = parseFloat(computation.toFixed(8)).toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    updateDisplay() {
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
                break;
            case 'operator':
                calculator.chooseOperation(value);
                break;
            case 'clear':
                calculator.clear();
                break;
            case 'delete':
                calculator.delete();
                break;
            case 'equals':
                calculator.compute();
                break;
        }
        calculator.updateDisplay();
    });
});
