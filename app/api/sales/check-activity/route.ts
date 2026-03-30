import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get all trials (both active and others)
    const { data: trials, error } = await supabase
      .from('trial_chats')
      .select('*')
      .order('trial_start', { ascending: false })

    if (error || !trials) {
      return NextResponse.json({ all_activity: [] })
    }

    const activity = []

    for (const trial of trials) {
      // Count messages in conversations for this trial's client
      const { count } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', trial.client_id)

      const messageCount = count || 0

      activity.push({
        id: trial.id,
        company_name: trial.company_name,
        company_website: trial.company_website,
        company_city: trial.company_city,
        status: trial.status,
        trial_start: trial.trial_start,
        activity_messages: messageCount,
        is_hot: messageCount > 5,
        last_activity_at: trial.last_activity_at,
      })
    }

    // Sort by activity (hot first)
    activity.sort((a, b) => {
      if (a.is_hot && !b.is_hot) return -1
      if (!a.is_hot && b.is_hot) return 1
      return b.activity_messages - a.activity_messages
    })

    return NextResponse.json({ all_activity: activity })
  } catch (error) {
    console.error('[sales/check-activity]', error)
    return NextResponse.json({ all_activity: [] }, { status: 500 })
  }
}
