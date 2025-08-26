"use client";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Fluro Sheet Music Viewer</h1>
        <p className="text-lg mb-6">Welcome to the migrated React version!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">View Services</h2>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Go
            </button>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">View Songs</h2>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Go
            </button>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">View Custom Setlists</h2>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Go
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}