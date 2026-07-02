// Clase Calculator que encapsula toda la lógica
class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
        this.setupEventListeners();
    }

    // Reinicia la calculadora a su estado inicial
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    // Elimina el último carácter del operando actual
    delete() {
        if (this.shouldResetScreen) return;
        
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
    }

    // Agrega un número al operando actual
    appendNumber(number) {
        // Si debemos resetear la pantalla o el valor actual es '0'
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        
        // Evitar múltiples ceros al inicio
        if (number === '0' && this.currentOperand === '0') return;
        
        // Evitar múltiples puntos decimales
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Manejar el caso especial cuando el valor actual es '0'
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand = this.currentOperand.toString() + number;
        }
    }

    // Cambia el signo del operando actual
    negate() {
        if (this.currentOperand === '0') return;
        
        if (this.currentOperand.includes('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    // Calcula el porcentaje del operando actual
    percentage() {
        const num = parseFloat(this.currentOperand);
        if (isNaN(num)) return;
        
        this.currentOperand = (num / 100).toString();
    }

    // Selecciona la operación a realizar
    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        // Si ya hay una operación pendiente, calcular primero
        if (this.previousOperand !== '') {
            this.calculate();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
    }

    // Realiza el cálculo
    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                // Manejo de división entre cero
                if (current === 0) {
                    this.displayError('Error: División entre cero');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Formatear el resultado
        this.currentOperand = this.formatResult(computation);
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    // Formatea el resultado para evitar números muy largos
    formatResult(number) {
        // Si es un número entero, mostrarlo como tal
        if (Number.isInteger(number)) {
            return number.toString();
        }
        
        // Redondear a 8 decimales máximo y eliminar ceros finales
        const rounded = Math.round(number * 1e8) / 1e8;
        return rounded.toString();
    }

    // Muestra un mensaje de error
    displayError(message) {
        this.currentOperand = message;
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = true;
        
        // Restaurar después de 1.5 segundos
        setTimeout(() => {
            if (this.currentOperand === message) {
                this.clear();
                this.updateDisplay();
            }
        }, 1500);
    }

    // Actualiza el display con formato apropiado
    getDisplayNumber(number) {
        if (number.includes('Error')) return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    // Actualiza la interfaz visual
    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    // Maneja las teclas presionadas
    handleKeyboard(event) {
        // Prevenir comportamiento por defecto para algunas teclas
        if (['+', '-', '*', '/', '=', 'Enter', 'Backspace', 'Delete', 'Escape', '.', '%'].includes(event.key)) {
            event.preventDefault();
        }

        // Mapeo de teclas a acciones
        const keyActions = {
            '0': () => this.appendNumber('0'),
            '1': () => this.appendNumber('1'),
            '2': () => this.appendNumber('2'),
            '3': () => this.appendNumber('3'),
            '4': () => this.appendNumber('4'),
            '5': () => this.appendNumber('5'),
            '6': () => this.appendNumber('6'),
            '7': () => this.appendNumber('7'),
            '8': () => this.appendNumber('8'),
            '9': () => this.appendNumber('9'),
            '.': () => this.appendNumber('.'),
            '+': () => this.chooseOperation('+'),
            '-': () => this.chooseOperation('-'),
            '*': () => this.chooseOperation('×'),
            '/': () => this.chooseOperation('÷'),
            '%': () => this.percentage(),
            'Enter': () => this.calculate(),
            '=': () => this.calculate(),
            'Backspace': () => this.delete(),
            'Delete': () => this.clear(),
            'Escape': () => this.clear(),
        };

        // Ejecutar la acción correspondiente si existe
        const action = keyActions[event.key];
        if (action) {
            action();
            this.updateDisplay();
        }
    }

    // Configura todos los event listeners
    setupEventListeners() {
        // Event listeners para botones
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const value = button.dataset.value;
                
                switch (action) {
                    case 'number':
                        this.appendNumber(value);
                        break;
                    case 'decimal':
                        this.appendNumber('.');
                        break;
                    case 'operator':
                        this.chooseOperation(value);
                        break;
                    case 'calculate':
                        this.calculate();
                        break;
                    case 'clear':
                        this.clear();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                    case 'negate':
                        this.negate();
                        break;
                    case 'percentage':
                        this.percentage();
                        break;
                }
                
                this.updateDisplay();
            });
        });

        // Event listener para teclado
        document.addEventListener('keydown', (event) => {
            this.handleKeyboard(event);
        });
    }
}

// Inicializar la calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const previousOperandElement = document.getElementById('previous-operand');
    const currentOperandElement = document.getElementById('current-operand');
    
    const calculator = new Calculator(previousOperandElement, currentOperandElement);
});