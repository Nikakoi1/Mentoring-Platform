import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

type ReportType = 'sessions' | 'session_evaluations' | 'client_visits' | 'clients'

const reportTypeToView: Record<ReportType, string> = {
  sessions: 'sessions_report',
  session_evaluations: 'session_evaluations_report',
  client_visits: 'client_visits_report',
  clients: 'clients_report'
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRow, error: userRowError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (userRowError) {
    return NextResponse.json({ error: userRowError.message }, { status: 500 })
  }

  if (userRow?.role !== 'coordinator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const reportType = searchParams.get('type') as ReportType | null
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!reportType || !(reportType in reportTypeToView)) {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  }

  const viewName = reportTypeToView[reportType]

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  let query = supabaseAdmin.from(viewName).select('*')

  if (startDate && endDate) {
    if (reportType === 'sessions') {
      query = query.gte('scheduled_at', startDate).lte('scheduled_at', endDate)
    } else if (reportType === 'session_evaluations') {
      query = query.gte('session_scheduled_at', startDate).lte('session_scheduled_at', endDate)
    } else if (reportType === 'client_visits') {
      query = query.gte('scheduled_at', startDate).lte('scheduled_at', endDate)
    } else if (reportType === 'clients') {
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    }
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}
