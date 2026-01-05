'use client'

import { useState } from 'react'

export default function Home() {
  const [content, setContent] = useState('')
  const [ttl, setTtl] = useState<string>('')
  const [maxViews, setMaxViews] = useState<string>('')
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCreatedUrl(null)

    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? parseInt(ttl) : undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create paste')
      }

      setCreatedUrl(data.url)
      setContent('')
      setTtl('')
      setMaxViews('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Pastebin Lite
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Create an ephemeral paste
          </p>
        </div>

        {createdUrl && (
          <div className="rounded-md bg-green-900 p-4 border border-green-700">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-100">
                  Paste created successfully!
                </h3>
                <div className="mt-2 text-sm text-green-200 break-all">
                  <a href={createdUrl} className="underline hover:text-white">
                    {createdUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-900 p-4 border border-red-700">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-100">Error</h3>
                <div className="mt-2 text-sm text-red-200">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="content" className="sr-only">Content</label>
              <textarea
                id="content"
                name="content"
                required
                rows={10}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Paste your content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ttl" className="block text-sm font-medium text-gray-400">
                TTL (Seconds)
              </label>
              <input
                type="number"
                name="ttl"
                id="ttl"
                min="1"
                className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                placeholder="Optional"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="maxViews" className="block text-sm font-medium text-gray-400">
                Max Views
              </label>
              <input
                type="number"
                name="maxViews"
                id="maxViews"
                min="1"
                className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                placeholder="Optional"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-gray-900 border-gray-700`}
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
