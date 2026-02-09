export default function Feature({ title, description }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  );
}