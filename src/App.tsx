import { useState } from 'react'
import { demoFeedback } from './lib/demoData'
import { analyzeFeedback, summarize } from './lib/analysis'
import { FeedbackRecord, AnalysisSummary } from './types'
import Papa from 'papaparse'

function App() {
  const [records, setRecords] = useState<FeedbackRecord[]>(demoFeedback)
  const [summary, setSummary] = useState<AnalysisSummary>(summarize(demoFeedback))
  const [isDemo, setIsDemo] = useState(true)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newRecords: FeedbackRecord[] = []

        for (const row of results.data as any[]) {
          const feedbackText =
            row.customer_feedback ||
            row.feedback ||
            row.comment ||
            row.Comment ||
            row.Feedback ||
            row['Customer Feedback'] ||
            ''

          if (!feedbackText || feedbackText.trim().length < 5) continue

          const date =
            row.date ||
            row.Date ||
            row.submitted_at ||
            new Date().toISOString().slice(0, 10)

          const department = row.department || row.Department || undefined

          const analyzed = analyzeFeedback(feedbackText, date, department)
          newRecords.push(analyzed)
        }

        if (newRecords.length === 0) {
          alert('No valid feedback records found in the CSV.')
          return
        }

        setRecords(newRecords)
        setSummary(summarize(newRecords))
        setIsDemo(false)
      },
      error: () => {
        alert('Failed to parse CSV file.')
      },
    })
  }

  const loadDemo = () => {
    setRecords(demoFeedback)
    setSummary(summarize(demoFeedback))
    setIsDemo(true)
  }

  const positivePct = summary.total ? Math.round((summary.positive / summary.total) * 100) : 0
  const negativePct = summary.total ? Math.round((summary.negative / summary.total) * 100) : 0
  const neutralPct = summary.total ? Math.round((summary.neutral / summary.total) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">DealerInsight</h1>
            <p className="text-sm text-navy-200">Customer feedback intelligence for dealerships</p>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && (
              <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">
                Demo Data
              </span>
            )}
            <label className="cursor-pointer bg-white text-navy-900 text-sm font-medium px-4 py-2 rounded hover:bg-slate-100 transition">
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={loadDemo}
              className="text-sm border border-navy-500 text-navy-100 px-3 py-2 rounded hover:bg-navy-800 transition"
            >
              Load Demo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Total Feedback</p>
            <p className="text-3xl font-semibold text-slate-800 mt-1">{summary.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Positive</p>
            <p className="text-3xl font-semibold text-emerald-600 mt-1">{summary.positive}</p>
            <p className="text-xs text-slate-400 mt-1">{positivePct}%</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Neutral</p>
            <p className="text-3xl font-semibold text-slate-600 mt-1">{summary.neutral}</p>
            <p className="text-xs text-slate-400 mt-1">{neutralPct}%</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Negative</p>
            <p className="text-3xl font-semibold text-red-600 mt-1">{summary.negative}</p>
            <p className="text-xs text-slate-400 mt-1">{negativePct}%</p>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Top Categories</h2>
            <div className="space-y-3">
              {Object.entries(summary.categories)
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{cat}</span>
                    <span className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Recommended Actions</h2>
            <ul className="space-y-3">
              {summary.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Customer Feedback</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {records.map((r) => (
              <div key={r.id} className="px-5 py-4 hover:bg-slate-50">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      r.sentiment === 'positive'
                        ? 'bg-emerald-100 text-emerald-700'
                        : r.sentiment === 'negative'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r.sentiment}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {r.category}
                  </span>
                  <span className="text-xs text-slate-400">{r.date}</span>
                </div>
                <p className="text-sm text-slate-700">{r.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
