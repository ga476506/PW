
document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => {
                el.classList.remove('active');
            });
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    initCrosswordCreator();
    initWordSearchCreator();
    initQuizCreator();
});

function initCrosswordCreator() {
    const crossword = {
        words: [],
        grid: Array(15).fill().map(() => Array(15).fill(''))
    };

    const gridElement = document.getElementById('crossword-grid');
    gridElement.innerHTML = '';

    // Crear cuadrícula 15x15
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell empty';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => selectCell(i, j));
            gridElement.appendChild(cell);
        }
    }

    function selectCell(row, col) {
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('active'));
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('active');
        document.getElementById('crossword-row').value = row;
        document.getElementById('crossword-col').value = col;
    }

    // Añadir palabra al crucigrama
    document.getElementById('add-crossword-word').addEventListener('click', () => {
        const word = document.getElementById('crossword-word').value.trim().toUpperCase();
        const clue = document.getElementById('crossword-clue').value.trim();
        const row = parseInt(document.getElementById('crossword-row').value);
        const col = parseInt(document.getElementById('crossword-col').value);
        const direction = document.getElementById('crossword-direction').value;

        if (!word || !clue || isNaN(row) || isNaN(col)) {
            alert('Por favor completa todos los campos');
            return;
        }

        if (direction === 'across' && col + word.length > 15) {
            alert('La palabra no cabe horizontalmente');
            return;
        }
        if (direction === 'down' && row + word.length > 15) {
            alert('La palabra no cabe verticalmente');
            return;
        }

        crossword.words.push({ word, clue, row, col, direction });
        updateCrosswordDisplay();

        document.getElementById('crossword-word').value = '';
        document.getElementById('crossword-clue').value = '';
    });

    function updateCrosswordDisplay() {
        // Resetear cuadrícula
        crossword.grid = Array(15).fill().map(() => Array(15).fill(''));
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell empty';
        });

        // Actualizar lista de palabras
        const wordsList = document.getElementById('crossword-words');
        wordsList.innerHTML = '<h3>Palabras añadidas:</h3>';

        crossword.words.forEach((item, index) => {
            const wordEl = document.createElement('div');
            wordEl.textContent = `${index + 1}. ${item.clue} (${item.word})`;
            wordsList.appendChild(wordEl);

            // Colocar palabra en la cuadrícula
            for (let i = 0; i < item.word.length; i++) {
                const r = item.direction === 'down' ? item.row + i : item.row;
                const c = item.direction === 'across' ? item.col + i : item.col;

                if (r < 15 && c < 15) {
                    crossword.grid[r][c] = item.word[i];
                    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    cell.textContent = item.word[i];
                    cell.className = 'cell filled';
                }
            }
        });
    }

    // Exportar versiones (Estudiante y Profesor)
    document.getElementById('export-crossword').addEventListener('click', () => {
        if (crossword.words.length === 0) {
            alert('No hay palabras en el crucigrama');
            return;
        }

        const { jsPDF } = window.jspdf;
        const cellSize = 6;
        const margin = 20;
        const gridWidth = 15 * cellSize;
        const gridX = (210 - gridWidth) / 2; // Centrar en página A4 (210mm)

        // Versión ESTUDIANTE (sin palabras)
        const studentDoc = createPdfVersion(crossword, false);
        studentDoc.save('crucigrama_estudiante.pdf');

        // Versión PROFESOR (con palabras)
        const teacherDoc = createPdfVersion(crossword, true);
        teacherDoc.save('crucigrama_profesor.pdf');

        function createPdfVersion(crosswordData, showAnswers) {
            const doc = new jsPDF();
            
            // Encabezado
            doc.setFillColor(30, 64, 175);
            doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.text(`Crucigrama - Versión ${showAnswers ? 'Profesor' : 'Estudiante'}`, 105, 15, { align: 'center' });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);

            // Pistas
            let y = 30;
            doc.setFontSize(14);
            doc.setTextColor(30, 64, 175);
            doc.text('Pistas Horizontales:', margin, y);
            y += 10;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);

            crosswordData.words
                .filter(w => w.direction === 'across')
                .forEach((word, i) => {
                    const clueText = showAnswers ? `${i + 1}. ${word.clue}: ${word.word}` : `${i + 1}. ${word.clue}`;
                    doc.text(clueText, margin + 5, y);
                    y += 8;
                });

            y += 5;
            doc.setFontSize(14);
            doc.setTextColor(30, 64, 175);
            doc.text('Pistas Verticales:', margin, y);
            y += 10;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);

            crosswordData.words
                .filter(w => w.direction === 'down')
                .forEach((word, i) => {
                    const clueText = showAnswers ? `${i + 1}. ${word.clue}: ${word.word}` : `${i + 1}. ${word.clue}`;
                    doc.text(clueText, margin + 5, y);
                    y += 8;
                });

            // Cuadrícula
            y += 10;
            doc.setDrawColor(30, 64, 175);
            doc.setLineWidth(0.3);

            for (let i = 0; i < 15; i++) {
                for (let j = 0; j < 15; j++) {
                    const hasLetter = crosswordData.grid[i][j] !== '';
                    
                    if (hasLetter) {
                        doc.setFillColor(224, 231, 255);
                        doc.rect(gridX + j * cellSize, y + i * cellSize, cellSize, cellSize, 'F');
                    }
                    
                    doc.rect(gridX + j * cellSize, y + i * cellSize, cellSize, cellSize);

                    // Mostrar letras solo en versión profesor o si showAnswers es true
                    if (hasLetter && showAnswers) {
                        doc.setTextColor(30, 64, 175);
                        doc.setFont('helvetica', 'bold');
                        doc.text(crosswordData.grid[i][j],
                            gridX + j * cellSize + cellSize / 2,
                            y + i * cellSize + cellSize / 2 + 1, {
                            align: 'center',
                            baseline: 'middle'
                        });
                        doc.setTextColor(0, 0, 0);
                        doc.setFont('helvetica', 'normal');
                    }
                }
            }

            // Pie de página
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Generado con Creador de Actividades Educativas', 105, 285, { align: 'center' });

            return doc;
        }
    });
}

function initWordSearchCreator() {
    const wordsearch = {
        words: [],
        grid: Array(15).fill().map(() => Array(15).fill(''))
    };

    const gridElement = document.getElementById('wordsearch-grid');
    gridElement.innerHTML = '';

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell empty';
            cell.dataset.row = i;
            cell.dataset.col = j;
            gridElement.appendChild(cell);
        }
    }

    document.getElementById('add-wordsearch-word').addEventListener('click', () => {
        const word = document.getElementById('wordsearch-word').value.trim().toUpperCase();

        if (!word) {
            alert('Por favor ingresa una palabra');
            return;
        }

        if (word.length > 15) {
            alert('La palabra es demasiado larga (máx. 15 letras)');
            return;
        }

        wordsearch.words.push(word);
        updateWordSearchDisplay();
        document.getElementById('wordsearch-word').value = '';
    });

    function updateWordSearchDisplay() {
        const wordsList = document.getElementById('wordsearch-words');
        wordsList.innerHTML = '<h3>Palabras a encontrar:</h3>';
        wordsearch.words.forEach(word => {
            const wordEl = document.createElement('div');
            wordEl.textContent = word;
            wordsList.appendChild(wordEl);
        });
    }

    document.getElementById('generate-wordsearch').addEventListener('click', () => {
        if (wordsearch.words.length === 0) {
            alert('Añade al menos una palabra');
            return;
        }

        wordsearch.grid = Array(15).fill().map(() => Array(15).fill(''));
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        wordsearch.words.forEach(word => {
            const direction = Math.random() > 0.5 ? 'across' : 'down';
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                attempts++;
                const row = Math.floor(Math.random() * 15);
                const col = Math.floor(Math.random() * 15);

                let fits = true;
                for (let i = 0; i < word.length; i++) {
                    const r = direction === 'down' ? row + i : row;
                    const c = direction === 'across' ? col + i : col;

                    if (r >= 15 || c >= 15 || (wordsearch.grid[r][c] !== '' && wordsearch.grid[r][c] !== word[i])) {
                        fits = false;
                        break;
                    }
                }

                if (fits) {
                    for (let i = 0; i < word.length; i++) {
                        const r = direction === 'down' ? row + i : row;
                        const c = direction === 'across' ? col + i : col;
                        wordsearch.grid[r][c] = word[i];
                    }
                    placed = true;
                }
            }
        });

        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (wordsearch.grid[i][j] === '') {
                    wordsearch.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }

        const cells = document.querySelectorAll('#wordsearch-grid .cell');
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                cells[i * 15 + j].textContent = wordsearch.grid[i][j];
                cells[i * 15 + j].className = wordsearch.grid[i][j] !== '' ? 'cell filled' : 'cell empty';
            }
        }
    });

    document.getElementById('export-wordsearch').addEventListener('click', () => {
        if (wordsearch.words.length === 0) {
            alert('No hay palabras en la sopa de letras');
            return;
        }

        const { jsPDF } = window.jspdf;
        const cellSize = 6;

        const doc = new jsPDF();

        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text('Sopa de Letras', 105, 15, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);

        let y = 30;
        doc.setFontSize(14);
        doc.setTextColor(30, 64, 175);
        doc.text('Palabras a encontrar:', 20, y);
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        wordsearch.words.forEach((word, i) => {
            doc.text(`${i + 1}. ${word}`, 25, y);
            y += 8;
        });

        y += 10;
        const gridX = (doc.internal.pageSize.getWidth() - (15 * cellSize)) / 2;

        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.3);

        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                doc.rect(gridX + j * cellSize, y + i * cellSize, cellSize, cellSize);
                doc.text(wordsearch.grid[i][j],
                    gridX + j * cellSize + cellSize / 2,
                    y + i * cellSize + cellSize / 2 + 1, {
                    align: 'center',
                    baseline: 'middle'
                });
            }
        }

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Generado con Creador de Actividades Educativas', 105, 285, { align: 'center' });

        doc.save('sopa_de_letras.pdf');
    });
}

function initQuizCreator() {
    const quiz = {
        questions: []
    };

    document.getElementById('add-quiz-question').addEventListener('click', () => {
        const question = document.getElementById('quiz-question').value.trim();
        const options = Array.from(document.querySelectorAll('.quiz-option')).map(opt => opt.value.trim());
        const correct = parseInt(document.getElementById('quiz-correct').value);

        if (!question || options.some(opt => !opt)) {
            alert('Por favor completa todos los campos');
            return;
        }

        quiz.questions.push({
            question,
            options,
            answer: correct
        });

        updateQuizDisplay();

        document.getElementById('quiz-question').value = '';
        document.querySelectorAll('.quiz-option').forEach(opt => opt.value = '');
        document.getElementById('quiz-correct').value = '0';
    });

    function updateQuizDisplay() {
        const container = document.getElementById('quiz-questions');
        container.innerHTML = '<h3>Preguntas añadidas:</h3>';

        quiz.questions.forEach((q, qIndex) => {
            const questionEl = document.createElement('div');
            questionEl.className = 'question-card';
            questionEl.innerHTML = `<h3>${qIndex + 1}. ${q.question}</h3>`;

            q.options.forEach((opt, optIndex) => {
                const optionEl = document.createElement('div');
                optionEl.className = optIndex === q.answer ? 'correct-option' : 'option-item';
                optionEl.textContent = `${String.fromCharCode(97 + optIndex)}. ${opt}`;
                questionEl.appendChild(optionEl);
            });

            container.appendChild(questionEl);
        });
    }

    document.getElementById('export-quiz').addEventListener('click', () => {
        if (quiz.questions.length === 0) {
            alert('No hay preguntas para exportar');
            return;
        }

        const { jsPDF } = window.jspdf;

        const studentDoc = new jsPDF();

        studentDoc.setFillColor(30, 64, 175);
        studentDoc.rect(0, 0, studentDoc.internal.pageSize.getWidth(), 20, 'F');
        studentDoc.setTextColor(255, 255, 255);
        studentDoc.setFontSize(16);
        studentDoc.text('Cuestionario - Versión Estudiante', 105, 15, { align: 'center' });

        studentDoc.setTextColor(0, 0, 0);
        studentDoc.setFontSize(12);

        let y = 30;
        quiz.questions.forEach((q, qIndex) => {
            studentDoc.setFontSize(14);
            studentDoc.setTextColor(30, 64, 175);
            studentDoc.text(`${qIndex + 1}. ${q.question}`, 20, y);
            y += 10;

            studentDoc.setFontSize(12);
            studentDoc.setTextColor(0, 0, 0);
            q.options.forEach((opt, optIndex) => {
                studentDoc.text(`   ${String.fromCharCode(97 + optIndex)}. ${opt}`, 25, y);
                y += 8;
            });

            y += 5;
        });

        studentDoc.setFontSize(10);
        studentDoc.setTextColor(100, 100, 100);
        studentDoc.text('Generado con Creador de Actividades Educativas', 105, 285, { align: 'center' });

        studentDoc.save('cuestionario_estudiante.pdf');

        const teacherDoc = new jsPDF();

        teacherDoc.setFillColor(30, 64, 175);
        teacherDoc.rect(0, 0, teacherDoc.internal.pageSize.getWidth(), 20, 'F');
        teacherDoc.setTextColor(255, 255, 255);
        teacherDoc.setFontSize(16);
        teacherDoc.text('Cuestionario - Versión Profesor', 105, 15, { align: 'center' });

        teacherDoc.setTextColor(0, 0, 0);
        teacherDoc.setFontSize(12);

        y = 30;
        quiz.questions.forEach((q, qIndex) => {
            teacherDoc.setFontSize(14);
            teacherDoc.setTextColor(30, 64, 175);
            teacherDoc.text(`${qIndex + 1}. ${q.question}`, 20, y);
            y += 10;

            teacherDoc.setFontSize(12);
            q.options.forEach((opt, optIndex) => {
                const isCorrect = optIndex === q.answer;
                teacherDoc.setTextColor(isCorrect ? 30 : 0, isCorrect ? 64 : 0, isCorrect ? 175 : 0);
                teacherDoc.setFont(isCorrect ? 'helvetica-bold' : 'helvetica');
                teacherDoc.text(`   ${String.fromCharCode(97 + optIndex)}. ${opt} ${isCorrect ? '(Correcta)' : ''}`, 25, y);
                y += 8;
            });

            teacherDoc.setTextColor(0, 0, 0);
            teacherDoc.setFont('helvetica', 'normal');
            y += 5;
        });

        teacherDoc.setFontSize(10);
        teacherDoc.setTextColor(100, 100, 100);
        teacherDoc.text('Generado con Creador de Actividades Educativas', 105, 285, { align: 'center' });

        teacherDoc.save('cuestionario_profesor.pdf');
    });
}
