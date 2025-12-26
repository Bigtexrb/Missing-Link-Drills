"use client";

export default function FilterBar({ pointFilter, setPointFilter }) {
  const values = [5, 10, 15, 20, 25];
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-4">
      {values.map((val) => (
        <button
          key={val}
          className={`px-4 py-2 rounded ${
            pointFilter === val ? "bg-emerald-600" : "bg-zinc-700"
          }`}
          onClick={() =>
            setPointFilter(pointFilter === val ? null : val)
          }
        >
          {val}-point
        </button>
      ))}
      <button
        className={`px-4 py-2 rounded ${
          pointFilter === null ? "bg-blue-600" : "bg-zinc-700"
        }`}
        onClick={() => setPointFilter(null)}
      >
        Show All
      </button>
    </div>
  );
}
