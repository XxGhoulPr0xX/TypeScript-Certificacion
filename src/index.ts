import { Canister, query, text, update, Void } from 'azle';

interface ArithmeticItem {
    question: string;
    answer: number;
}

let multiplicationTable: ArithmeticItem[] = [];
let additionSubtractionTable: ArithmeticItem[] = [];
let currentQuestion: string = '';

function generateMultiplicationTable(number: number): void {
    for (let i = 1; i <= 10; i++) {
        multiplicationTable.push({ question: `${number} x ${i}`, answer: number * i });
    }
}

function generateAdditionSubtractionTable(number: number): void {
    for (let i = 1; i <= 10; i++) {
        additionSubtractionTable.push({ question: `${number} + ${i}`, answer: number + i });
        additionSubtractionTable.push({ question: `${number} - ${i}`, answer: number - i });
    }
}

export default Canister({
    // Query calls complete quickly because they do not go through consensus
    getQuestion: query([text], text, (type: string) => {
        let table;
        if (type === 'multiplication') {
            table = multiplicationTable;
        } else if (type === 'additionSubtraction') {
            table = additionSubtractionTable;
        } else {
            throw new Error('Invalid type');
        }
        const randomIndex = Math.floor(Math.random() * table.length);
        currentQuestion = table[randomIndex].question;
        return currentQuestion;
    }),
    // Update calls take a few seconds to complete
    // This is because they persist state changes and go through consensus
    setNumber: update([text, text], Void, (type: string, numberText: string) => {
        const number = parseInt(numberText);
        if (type === 'multiplication') {
            generateMultiplicationTable(number);
        } else if (type === 'additionSubtraction') {
            generateAdditionSubtractionTable(number);
        } else {
            throw new Error('Invalid type');
        }
    }),
    checkAnswer: update([text, text], text, (question: string, userAnswerText: string) => {
        const userAnswer = parseInt(userAnswerText);
        let correctAnswer;
        if (multiplicationTable.find(item => item.question === question)) {
            correctAnswer = multiplicationTable.find(item => item.question === question)?.answer;
        } else if (additionSubtractionTable.find(item => item.question === question)) {
            correctAnswer = additionSubtractionTable.find(item => item.question === question)?.answer;
        } else {
            throw new Error('Invalid question');
        }
        if (userAnswer === correctAnswer) {
            return 'Correcto';
        } else {
            return 'Incorrecto';
        }
    })
});
