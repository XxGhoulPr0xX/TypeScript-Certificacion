import { Canister, query, text, update, Void } from 'azle';

interface MultiplicationItem {
    question: string;
    answer: number;
}

// This is a global variable that is stored on the heap
let multiplicationTable: MultiplicationItem[] = [];
let currentQuestion: string = '';

function generateMultiplicationTable(number: number): void {
    for (let i = 1; i <= 10; i++) {
        multiplicationTable.push({ question: `${number} x ${i}`, answer: number * i });
    }
}

export default Canister({
    // Query calls complete quickly because they do not go through consensus
    getQuestion: query([], text, () => {
        const randomIndex = Math.floor(Math.random() * multiplicationTable.length);
        currentQuestion = multiplicationTable[randomIndex].question;
        return currentQuestion;
    }),
    // Update calls take a few seconds to complete
    // This is because they persist state changes and go through consensus
    setNumber: update([text], Void, (numberText: string) => {
        const number = parseInt(numberText);
        generateMultiplicationTable(number);
    }),
    checkAnswer: update([text], text, (userAnswerText: string) => {
        const userAnswer = parseInt(userAnswerText);
        const correctAnswer = multiplicationTable.find(item => item.question === currentQuestion)?.answer;
        if (userAnswer === correctAnswer) {
            return 'Correcto';
        } else {
            return 'Incorrecto';
        }
    })
});
