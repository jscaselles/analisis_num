let precision = 6;

function transformMathFunctions(expression) {
    return expression
        .replace(/\bexp\b/g, "Math.exp")
        .replace(/\blog\b/g, "Math.log")
        .replace(/\bsin\b/g, "Math.sin")
        .replace(/\bcos\b/g, "Math.cos")
        .replace(/\btan\b/g, "Math.tan")
        .replace(/\bsqrt\b/g, "Math.sqrt")
        .replace(/\be\b/g, "Math.E");
}

function createMathFunction(expression) {
    let formattedExpression = transformMathFunctions(expression);
    return new Function("x", `return ${formattedExpression};`);
}

function falsePositionAlgorithm(equation, lowerBound, upperBound, errorMargin) {
    if (equation(lowerBound) * equation(upperBound) >= 0) {
        alert("El Teorema de Bolzano no se cumple: f(xi) y f(xs) deben tener signos opuestos.");
        return;
    }

    let previousRoot = lowerBound;
    let approximationError = 100;
    let iterationCount = 0;
    const roundValue = (num) => parseFloat(num.toFixed(precision));

    let resultsTable = document.querySelector("#tablaResultados tbody");
    let iterationsContainer = document.getElementById("iterations");

    resultsTable.innerHTML = "";
    iterationsContainer.innerHTML = "";

    while (approximationError > errorMargin) {
        iterationCount++;
        let f_lower = roundValue(equation(lowerBound));
        let f_upper = roundValue(equation(upperBound));
        let currentRoot = roundValue(upperBound - (f_upper * (lowerBound - upperBound)) / (f_lower - f_upper));
        let f_current = roundValue(equation(currentRoot));
        approximationError = roundValue(Math.abs((currentRoot - previousRoot) / currentRoot) * 100);

        let row = `<tr>
                    <td>${iterationCount}</td>
                    <td>${lowerBound}</td>
                    <td>${upperBound}</td>
                    <td>${currentRoot}</td>
                    <td>${f_lower}</td>
                    <td>${f_upper}</td>
                    <td>${f_current}</td>
                    <td>${approximationError}</td>
                </tr>`;
        resultsTable.innerHTML += row;

        iterationsContainer.innerHTML += `
            <div class="iteration">
                <strong>Iteración ${iterationCount}</strong><br>
                xi = ${lowerBound}, xs = ${upperBound}<br>
                xr = ${currentRoot}<br>
                f(xi) = ${f_lower}, f(xs) = ${f_upper}, f(xr) = ${f_current}<br>
                Error = ${approximationError} %
                <hr>
            </div>
        `;

        if (approximationError <= errorMargin) {
            alert(`Raíz encontrada en xr = ${currentRoot}`);
            return;
        }

        if (f_lower * f_current < 0) {
            upperBound = currentRoot;
        } else {
            lowerBound = currentRoot;
        }
        previousRoot = currentRoot;
    }
}

function executeFalsePosition() {
    let functionInput = document.getElementById("funcion").value;
    let parsedFunction = createMathFunction(functionInput);
    let lowerBound = parseFloat(document.getElementById("valorXi").value);
    let upperBound = parseFloat(document.getElementById("valorXs").value);
    let errorMargin = parseFloat(document.getElementById("tolerancia").value);
    falsePositionAlgorithm(parsedFunction, lowerBound, upperBound, errorMargin);
}

// 📌 Función para exportar resultados a PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Método de Falsa Posición", 14, 15);
    
    // Capturar tabla de resultados
    let table = document.getElementById("tablaResultados");
    doc.autoTable({ html: table, startY: 25 });

    // Capturar detalles de iteraciones
    let iterationsText = document.getElementById("iterations").innerText;
    doc.setFontSize(12);
    doc.text("Detalles de Iteraciones", 14, doc.autoTable.previous.finalY + 10);
    doc.setFontSize(10);
    let lines = doc.splitTextToSize(iterationsText, 180);
    doc.text(lines, 14, doc.autoTable.previous.finalY + 20);

    // Guardar PDF
    doc.save("metodo_falsa_posicion.pdf");
}

// Asignar evento al botón de exportar
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnExportarPDF").addEventListener("click", exportToPDF);
});
