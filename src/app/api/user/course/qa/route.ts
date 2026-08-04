import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return NextResponse.json([
    {
      id: 1,
      time: '1:24',
      question: 'How can I use the verb is in the past?',
      answerText: 'In the past tense, "is" becomes "was".',
      answerImage: 'https://7esl.com/wp-content/uploads/2019/11/Past-Simple-vs-Present-Perfect-2.jpg',
      isAnswered: true
    },
    {
      id: 2,
      time: '10:57',
      question: 'Is this question right "Was she happy yesterday?" ?',
      answerText: 'Yes, your question is correct.',
      answerAudio: true,
      isAnswered: true
    },
    {
      id: 3,
      time: '15:10',
      question: 'What is the past tense of "She is tired."?',
      isAnswered: false
    }
  ]);
}
