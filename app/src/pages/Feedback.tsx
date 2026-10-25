import { useState } from 'react'
import { CheckCircle2, MessageSquareHeart, Send, Star } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useToast } from '../lib/toast'
import { Button, Card, Field, Textarea } from '../components/ui'

export default function Feedback() {
  const toast = useToast()
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit() {
    if (rating === 0 || message.trim().length < 5) {
      toast.info('Pick a rating and add a sentence or two')
      return
    }
    setSending(true)
    try {
      await api.feedback({ rating, message: message.trim() })
      setSent(true)
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not send that feedback')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <Card className="p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sage-100 text-forest-700">
            <CheckCircle2 size={26} />
          </span>
          <h1 className="mt-4 text-[22px] font-semibold text-ink-900">Thank you</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
            Your note is stored locally with the demo data. It goes straight to whoever reviews this
            build.
          </p>
          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => {
              setSent(false)
              setRating(0)
              setMessage('')
            }}
          >
            Send another
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-safe pb-[70px]">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight text-ink-900 sm:text-[30px]">Feedback</h1>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
          What worked, what confused you, what is missing. Be blunt — it is more useful.
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <MessageSquareHeart size={16} className="text-forest-700" aria-hidden />
          <h2 className="text-[15px] font-semibold text-ink-900">How does it feel so far?</h2>
        </div>

        <div className="mt-4 flex justify-center gap-1.5" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= rating
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} out of 5`}
                onClick={() => setRating(value)}
                className="rounded-xl p-1 transition hover:scale-105 active:scale-95"
              >
                <Star
                  size={30}
                  className={active ? 'fill-amber-600 text-amber-600' : 'text-cream-400'}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-400">
          {rating === 0
            ? 'Tap a star'
            : ['Not there yet', 'Rough', 'Workable', 'Good', 'Delightful'][rating - 1]}
        </p>

        <div className="mt-5">
          <Field label="Your note" hint="What would make the next version better?">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="The care log is clear, but I could not tell which plants are mine at a glance…"
              maxLength={600}
            />
          </Field>
        </div>

        <Button
          full
          className="mt-4"
          loading={sending}
          onClick={() => void submit()}
          icon={<Send size={15} />}
        >
          Send feedback
        </Button>
      </Card>

      <p className="px-1 text-[10.5px] leading-relaxed text-ink-400">
        Feedback is stored in the local database. There is no third-party analytics in this build.
      </p>
    </div>
  )
}
