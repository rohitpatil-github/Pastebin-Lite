import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentTimeMs } from '@/lib/time'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const now = await getCurrentTimeMs()

    try {
        // Call the atomic stored procedure
        const { data, error } = await supabase.rpc('get_paste_atomic', {
            p_id: id,
            p_now: now
        })

        if (error) {
            console.error('Supabase RPC error:', error)
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        }

        // data is an array of rows (should be length 0 or 1)
        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Paste not found or unavailable' }, { status: 404 })
        }

        const paste = data[0] // { content, max_views, ret_view_count, expires_at }

        let remaining_views: number | null = null
        if (paste.max_views && paste.max_views > 0) {
            // ret_view_count is the NEW count (after increment)
            remaining_views = Math.max(0, paste.max_views - paste.ret_view_count)
        }

        let expiresAtIso: string | null = null
        if (paste.expires_at && paste.expires_at > 0) {
            expiresAtIso = new Date(paste.expires_at).toISOString()
        }

        return NextResponse.json({
            content: paste.content,
            remaining_views,
            expires_at: expiresAtIso
        })

    } catch (error) {
        console.error('Error fetching paste:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
