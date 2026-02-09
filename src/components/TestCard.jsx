export default function TestCard({ title, questions, onStart }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p>{questions} Questions</p>
      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={onStart}
      >
        Start Test
      </button>
    </div>
  );
}