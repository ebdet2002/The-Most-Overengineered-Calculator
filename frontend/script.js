let mutableStateContainer_v2_final = '0';
let abstractSyntaxTree = [];
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
    if (key === 'Enter' || key === '=') executeBusinessLogicAsync();
    if (key === 'Backspace') clearDisplay();
    if (key === 'Escape') clearDisplay();
});

function reconcileVirtualDomAndRender() {
    display.value = mutableStateContainer_v2_final;
    expressionDisplay.innerText = abstractSyntaxTree.map(e => {
        if (e.op === 'add') return '+';
        if (e.op === 'sub') return '-';
        if (e.op === 'mul') return '×';
        if (e.op === 'div') return '÷';
        return e.val;
    }).join(' ');
}

function appendNumber(number) {
    if (mutableStateContainer_v2_final === '0' || shouldResetDisplay) {
        mutableStateContainer_v2_final = number;
        shouldResetDisplay = false;
    } else {
        mutableStateContainer_v2_final += number;
    }
    reconcileVirtualDomAndRender();
}

function appendDecimal() {
    if (shouldResetDisplay) {
        mutableStateContainer_v2_final = '0.';
        shouldResetDisplay = false;
    } else if (!mutableStateContainer_v2_final.includes('.')) {
        mutableStateContainer_v2_final += '.';
    }
    reconcileVirtualDomAndRender();
}

function clearDisplay() {
    mutableStateContainer_v2_final = '0';
    abstractSyntaxTree = [];
    shouldResetDisplay = false;
    reconcileVirtualDomAndRender();
}

function toggleSign() {
    mutableStateContainer_v2_final = (parseFloat(mutableStateContainer_v2_final) * -1).toString();
    reconcileVirtualDomAndRender();
}

function setOperation(op) {
    abstractSyntaxTree.push({ val: mutableStateContainer_v2_final });
    abstractSyntaxTree.push({ op: op });
    shouldResetDisplay = true;
    reconcileVirtualDomAndRender();
}

async function executeBusinessLogicAsync() {
    if (abstractSyntaxTree.length > 0) {
        abstractSyntaxTree.push({ val: mutableStateContainer_v2_final });
    } else {
        return;
    }

    display.value = "Computing...";

    try {
        // Process abstractSyntaxTree left-to-right
        let result = parseFloat(abstractSyntaxTree[0].val);

        for (let i = 1; i < abstractSyntaxTree.length; i += 2) {
            const op = abstractSyntaxTree[i].op;
            const nextVal = parseFloat(abstractSyntaxTree[i + 1].val);

            // Call Microservice
            const response = await fetch(`/api/${op}?a=${result}&b=${nextVal}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            result = data.result;
        }

        mutableStateContainer_v2_final = result.toString();
        abstractSyntaxTree = []; // Clear abstractSyntaxTree after result
        shouldResetDisplay = true;
        reconcileVirtualDomAndRender();
    } catch (error) {
        display.value = "Error";
        console.error("Calculation failed:", error);
    }
}

function appendOperation(op) {
    if (op === '%') {
        mutableStateContainer_v2_final = (parseFloat(mutableStateContainer_v2_final) / 100).toString();
        reconcileVirtualDomAndRender();
    }
}

// Memory Functions
async function memoryStore() {
    try {
        const val = parseFloat(mutableStateContainer_v2_final);
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
        const val = parseFloat(mutableStateContainer_v2_final) * -1; // Add negative value
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
        mutableStateContainer_v2_final = data.value.toString();
        shouldResetDisplay = false;
        reconcileVirtualDomAndRender();
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
        const val = parseFloat(mutableStateContainer_v2_final);
        const response = await fetch(`/api/sqrt?a=${val}`);
        const data = await response.json();
        mutableStateContainer_v2_final = data.result.toString();
        shouldResetDisplay = true;
        reconcileVirtualDomAndRender();
    } catch (e) { console.error(e); }
}
