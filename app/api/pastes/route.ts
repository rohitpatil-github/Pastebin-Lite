import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { supabase } from '@/lib/supabase'
import { getCurrentTimeMs } from '@/lib/time'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { content, ttl_seconds, max_views } = body

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const id = nanoid(10)
        const now = await getCurrentTimeMs()

        let expiresAt: number | null = null
        if (ttl_seconds && typeof ttl_seconds === 'number' && ttl_seconds >= 1) {
            expiresAt = now + (ttl_seconds * 1000)
        }

        const maxViews = (max_views && typeof max_views === 'number' && max_views >= 1) ? max_views : null

        const { error } = await supabase.from('pastes').insert({
            id,
            content,
            created_at: now,
            expires_at: expiresAt,
            max_views: maxViews,
            view_count: 0
        })

        if (error) {
            throw error
        }

        const protocol = req.headers.get('x-forwarded-proto') || 'http'
        const host = req.headers.get('host')
        const url = `${protocol}://${host}/p/${id}`

        return NextResponse.json({ id, url }, { status: 201 })
    } catch (error) {
        console.error('Error creating paste:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
