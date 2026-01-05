import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        // Simple query to verify connection
        const { error } = await supabase.from('pastes').select('count', { count: 'exact', head: true })

        if (error) {
            throw error
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Health check failed:', error)
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
