function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">DealerInsight</h1>
        <p className="text-sm text-navy-200 mt-1">Turn customer feedback into better dealership decisions</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">DealerInsight is loading…</h2>
          <p className="text-slate-600">
            Core files are being added. Dashboard, CSV upload, and analysis will appear here shortly.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
