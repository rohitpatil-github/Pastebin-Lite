import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentTimeMs } from '@/lib/time'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function PastePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const now = await getCurrentTimeMs()

    // Call atomic RPC function
    const { data, error } = await supabase.rpc('get_paste_atomic', {
        p_id: id,
        p_now: now
    })

    // If error or no data returned (meaning not found or invalid), 404
    if (error || !data || data.length === 0) {
        if (error) console.error("Error fetching paste:", error)
        notFound()
    }

    const paste = data[0]

    let remaining = 'Unlimited'
    if (paste.max_views && paste.max_views > 0) {
        remaining = (paste.max_views - paste.ret_view_count).toString()
    }

    let expires = 'Never'
    if (paste.expires_at && paste.expires_at > 0) {
        expires = new Date(paste.expires_at).toLocaleString()
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="max-w-3xl w-full space-y-8">
                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h1 className="text-2xl font-bold text-white">Paste {id}</h1>
                    <div className="text-sm text-gray-400 text-right">
                        <p>Expires: {expires}</p>
                        <p>Views Left: {remaining}</p>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-xl overflow-x-auto border border-gray-700">
                    <pre className="whitespace-pre-wrap font-mono text-sm">{paste.content}</pre>
                </div>

                <div className="text-center mt-8">
                    <a href="/" className="text-indigo-400 hover:text-indigo-300">Create New Paste</a>
                </div>
            </div>
        </div>
    )
}
