import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/upload — sube imagen a Supabase Storage
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const type = formData.get('type') as string // 'logo' | 'icon'

    if (!file || !clientId || !type) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten PNG, JPG y WebP' }, { status: 400 })
    }

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no puede superar 2MB' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const ext = file.name.split('.').pop()
    const path = `${clientId}/${type}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('widget-assets')
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: true, // sobreescribir si existe
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('widget-assets')
      .getPublicUrl(path)

    // Guardar URL en el cliente
    const field = type === 'logo' ? 'widget_logo_url' : 'widget_icon_url'
    await supabase.from('clients').update({ [field]: publicUrl }).eq('id', clientId)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Error en /api/upload:', error)
    return NextResponse.json({ error: `Error al subir: ${error}` }, { status: 500 })
  }
}
