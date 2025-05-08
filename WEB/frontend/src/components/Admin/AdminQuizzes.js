import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ChevronDown, ChevronRight, Plus, Trash2, X } from 'lucide-react';

const AdminQuizzes = ({ unitId }) => {
  const { db } = useFirebase();
  const [quizzes, setQuizzes] = useState([]);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    question: '',
    choices: [],
    correctAnswer: '',
    questionNumber: 0,
    videoURL: ''
  });

  useEffect(() => {
    if (unitId) fetchQuizzes();
  }, [unitId]);

  const fetchQuizzes = async () => {
    try {
      const quizzesRef = collection(db, 'units', unitId, 'quizzes');
      const snapshot = await getDocs(quizzesRef);
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'units', unitId, 'quizzes'), {
        ...newQuiz,
        choices: newQuiz.choices.filter(c => c.text),
        questionNumber: Number(newQuiz.questionNumber)
      });
      setIsAddingQuiz(false);
      setNewQuiz({
        question: '',
        choices: [],
        correctAnswer: '',
        questionNumber: 0,
        videoURL: ''
      });
      fetchQuizzes();
    } catch (error) {
      console.error('Error adding quiz:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Delete this quiz question?')) {
      await deleteDoc(doc(db, 'units', unitId, 'quizzes', quizId));
      fetchQuizzes();
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-t">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Quizzes</h4>
        <button
          onClick={() => setIsAddingQuiz(true)}
          className="text-[#3151f9] hover:text-[#f9bd04]"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAddingQuiz && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Quiz Question</h3>
              <button onClick={() => setIsAddingQuiz(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddQuiz} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question</label>
                <input
                  value={newQuiz.question}
                  onChange={(e) => setNewQuiz({ ...newQuiz, question: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Choices</label>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 mt-1">
                    <input
                      value={newQuiz.choices[i]?.text || ''}
                      onChange={(e) => {
                        const newChoices = [...newQuiz.choices];
                        newChoices[i] = { text: e.target.value };
                        setNewQuiz({ ...newQuiz, choices: newChoices });
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm"
                      placeholder={`Choice ${i + 1}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={newQuiz.correctAnswer === newQuiz.choices[i]?.text}
                      onChange={() => setNewQuiz({ ...newQuiz, correctAnswer: newQuiz.choices[i]?.text })}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Video URL</label>
                <input
                  value={newQuiz.videoURL}
                  onChange={(e) => setNewQuiz({ ...newQuiz, videoURL: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Question Number</label>
                <input
                  type="number"
                  value={newQuiz.questionNumber}
                  onChange={(e) => setNewQuiz({ ...newQuiz, questionNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#3151f9] text-white px-4 py-2 rounded-md hover:bg-[#f9bd04]"
              >
                Add Quiz
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="font-medium">Q{quiz.questionNumber}: {quiz.question}</p>
              <div className="text-sm text-gray-600 mt-1">
                {quiz.choices.map((choice, i) => (
                  <span key={i} className={`mr-2 ${choice.text === quiz.correctAnswer ? 'text-green-600' : ''}`}>
                    {choice.text}
                  </span>
                ))}
              </div>
              {quiz.videoURL && (
                <a href={quiz.videoURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                  Related Video
                </a>
              )}
            </div>
            <button
              onClick={() => handleDeleteQuiz(quiz.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQuizzes;