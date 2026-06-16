'use client';

import { useState } from 'react';

interface ChatMessage {
  question: string;
  answer: string;
  timestamp: string;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [showPatients, setShowPatients] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      
      const result = await response.json();
      
      const newMessage: ChatMessage = {
        question,
        answer: result.answer || 'No answer received',
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setHistory(prev => [...prev, newMessage]);
      setPatients(result.data || []);
    } catch (error) {
      const errorMessage: ChatMessage = {
        question,
        answer: 'Error: Could not fetch answer',
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F5F2ED]">
      {/* Header */}
      <header className="bg-[#1A1D23] border-b border-[#1A1D23]/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🏥</span>
          </div>
          <h1 className="font-semibold text-lg">Clinic AI</h1>
        </div>
        <button
          onClick={() => setShowPatients(true)}
          className="text-sm bg-[#FF6B00]/10 border border-[#FF6B00]/20 hover:bg-[#FF6B00]/20 text-[#1A1D23] px-3 py-1.5 rounded-lg transition-colors"
        >
          📋 View All Patients
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-[#1A1D23]/50">
              <p className="text-5xl mb-4">👋</p>
              <p className="text-lg mb-2 text-[#1A1D23]">How can I help you today?</p>
              <div className="flex gap-2 justify-center mt-4 flex-wrap">
                {['Who is coming today?', 'Who missed last month?', 'Any root canals?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuestion(q); }}
                    className="text-sm bg-[#FF6B00]/10 border border-[#FF6B00]/20 hover:bg-[#FF6B00]/20 text-[#1A1D23] px-4 py-2 rounded-full transition-colors shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          history.map((item, i) => (
            <div key={i} className="space-y-3">
              {/* User */}
              <div className="flex justify-end">
                <div className="bg-[#FF6B00] text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%] text-sm">
                  {item.question}
                </div>
              </div>
              {/* AI */}
              <div className="flex justify-start">
                <div className="bg-white border border-[#1A1D23]/10 px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[80%] text-sm text-[#1A1D23] shadow-sm">
                  {item.answer}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#1A1D23]/10 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            placeholder="Ask about appointments..."
            className="flex-1 p-3 bg-[#F5F2ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-[#1A1D23] placeholder-[#1A1D23]/40 text-sm"
            disabled={loading}
          />
          <button
            onClick={askQuestion}
            disabled={loading}
            className="bg-[#FF6B00] text-white px-5 py-3 rounded-xl hover:bg-[#FF6B00]/90 disabled:bg-[#1A1D23]/30 transition-colors"
          >
            {loading ? '...' : '↑'}
          </button>
        </div>
      </div>

      {/* Patients Modal */}
      {showPatients && (
        <div className="fixed inset-0 bg-[#1A1D23]/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#F5F2ED] rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#1A1D23]/10 flex items-center justify-between">
              <h2 className="font-semibold text-lg">All Patients ({patients.length})</h2>
              <button 
                onClick={() => setShowPatients(false)}
                className="w-8 h-8 hover:bg-[#1A1D23]/10 text-[#1A1D23] rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto p-4 max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="bg-[#1A1D23]/5 sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-medium text-[#1A1D23]/70">Name</th>
                    <th className="p-3 text-left font-medium text-[#1A1D23]/70">Date</th>
                    <th className="p-3 text-left font-medium text-[#1A1D23]/70">Time</th>
                    <th className="p-3 text-left font-medium text-[#1A1D23]/70">Treatment</th>
                    <th className="p-3 text-left font-medium text-[#1A1D23]/70">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-[#1A1D23]/10">
                      <td className="p-3 font-medium">{patient.name}</td>
                      <td className="p-3 text-[#1A1D23]/70">{patient.date}</td>
                      <td className="p-3 text-[#1A1D23]/70">{patient.time}</td>
                      <td className="p-3">
                        <span className="bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-1 rounded-md text-xs">
                          {patient.treatment}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          patient.status === 'Upcoming' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' :
                          patient.status === 'Completed' ? 'bg-green-50 text-green-700' :
                          patient.status === 'Missed' ? 'bg-red-50 text-red-700' :
                          'bg-[#1A1D23]/5 text-[#1A1D23]/70'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}