let currentInput = '0';
let expression = [];
let shouldResetDisplay = false;

const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression-display');

// Keyboard Support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/[0-9]/.test(key)) appendNumber(key);
    if (key === '.') appendDecimal();
    if (key === '+') setOperation('add');
    if (key === '-') setOperation('sub');
    if (key === '*') setOperation('mul');
    if (key === '/') setOperation('div');
    if (key === 'Enter' || key === '=') calculate();
    if (key === 'Backspace') clearDisplay();
    if (key === 'Escape') clearDisplay();
});

function updateDisplay() {
    display.value = currentInput;
    expressionDisplay.innerText = expression.map(e => {
        if (e.op === 'add') return '+';
        if (e.op === 'sub') return '-';
        if (e.op === 'mul') return '×';
        if (e.op === 'div') return '÷';
        return e.val;
    }).join(' ');
}

function appendNumber(number) {
    if (currentInput === '0' || shouldResetDisplay) {
        currentInput = number;
        shouldResetDisplay = false;
    } else {
        currentInput += number;
    }
    updateDisplay();
}

function appendDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0.';
        shouldResetDisplay = false;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    expression = [];
    shouldResetDisplay = false;
    updateDisplay();
}

function toggleSign() {
    currentInput = (parseFloat(currentInput) * -1).toString();
    updateDisplay();
}

function setOperation(op) {
    expression.push({ val: currentInput });
    expression.push({ op: op });
    shouldResetDisplay = true;
    updateDisplay();
}

async function calculate() {
    if (expression.length > 0) {
        expression.push({ val: currentInput });
    } else {
        return;
    }

    display.value = "Computing...";

    try {
        // Process expression left-to-right
        let result = parseFloat(expression[0].val);

        for (let i = 1; i < expression.length; i += 2) {
            const op = expression[i].op;
            const nextVal = parseFloat(expression[i + 1].val);

            // Call Microservice
            const response = await fetch(`/api/${op}?a=${result}&b=${nextVal}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            result = data.result;
        }

        currentInput = result.toString();
        expression = []; // Clear expression after result
        shouldResetDisplay = true;
        updateDisplay();
    } catch (error) {
        display.value = "Error";
        console.error("Calculation failed:", error);
    }
}

function appendOperation(op) {
    if (op === '%') {
        currentInput = (parseFloat(currentInput) / 100).toString();
        updateDisplay();
    }
}

// Memory Functions
async function memoryStore() {
    try {
        const val = parseFloat(currentInput);
        await fetch('/api/mem/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: val })
        });
        flashDisplay("M+");
    } catch (e) { console.error(e); }
}

async function memorySubtract() {
    try {
        const val = parseFloat(currentInput) * -1; // Add negative value
        await fetch('/api/mem/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: val })
        });
        flashDisplay("M-");
    } catch (e) { console.error(e); }
}

async function memoryClear() {
    try {
        await fetch('/api/mem/clear', { method: 'POST' });
        flashDisplay("MC");
    } catch (e) { console.error(e); }
}

async function memoryRecall() {
    try {
        const response = await fetch('/api/mem/');
        const data = await response.json();
        currentInput = data.value.toString();
        shouldResetDisplay = false;
        updateDisplay();
    } catch (e) { console.error(e); }
}

function flashDisplay(msg) {
    const original = display.value;
    display.value = msg;
    setTimeout(() => display.value = original, 500);
}

// Handle Sqrt separately as it's unary
async function handleSqrt() {
    try {
        const val = parseFloat(currentInput);
        const response = await fetch(`/api/sqrt?a=${val}`);
        const data = await response.json();
        currentInput = data.result.toString();
        shouldResetDisplay = true;
        updateDisplay();
    } catch (e) { console.error(e); }
}
