'use client'

import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SiteSettings } from '@/types'

const schema = z.object({
  shop_name: z.string().min(1, 'Shop name required'),
  shop_tagline: z.string(),
  contact_phone: z.string(),
  contact_email: z.string(),
  instagram_handle: z.string(),
  announcement_banner: z.string(),
})

type FormValues = z.infer<typeof schema>

export function SettingsForm() {
  const { data, isLoading } = useQuery<{ settings: Record<string, string> }>({
    queryKey: ['admin-settings'],
    queryFn: () => fetch('/api/admin/settings').then((r) => r.json()),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      shop_name: '',
      shop_tagline: '',
      contact_phone: '',
      contact_email: '',
      instagram_handle: '',
      announcement_banner: '',
    },
  })

  useEffect(() => {
    if (data?.settings) {
      reset(data.settings as FormValues)
    }
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      return json
    },
    onSuccess: () => toast.success('Settings saved!'),
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading settings...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6 max-w-xl">
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Shop Identity</h2>

        <div className="space-y-1.5">
          <Label htmlFor="shop_name">Shop Name</Label>
          <Input id="shop_name" {...register('shop_name')} placeholder="Crochet Ya" />
          {errors.shop_name && <p className="text-destructive text-xs">{errors.shop_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="shop_tagline">Tagline</Label>
          <Input id="shop_tagline" {...register('shop_tagline')} placeholder="Handmade with love" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="announcement_banner">Announcement Banner</Label>
          <Input
            id="announcement_banner"
            {...register('announcement_banner')}
            placeholder="e.g. Free shipping on orders above Rs. 999!"
          />
          <p className="text-xs text-muted-foreground">Leave empty to hide the banner</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Contact & Social</h2>

        <div className="space-y-1.5">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input id="contact_phone" {...register('contact_phone')} placeholder="+91 98765 43210" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input id="contact_email" {...register('contact_email')} type="email" placeholder="hello@crochetya.com" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="instagram_handle">Instagram Handle</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground text-sm">
              @
            </span>
            <Input
              id="instagram_handle"
              {...register('instagram_handle')}
              placeholder="crochetya"
              className="rounded-l-none"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </Button>
    </form>
  )
}
