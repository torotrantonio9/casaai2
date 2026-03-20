'use client'

import React, { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { SubscriptionPlan } from '@/types/database'

interface PlanInfo {
  id: SubscriptionPlan
  name: string
  price: string
  period: string
  features: string[]
  highlighted: boolean
}

const PLANS: PlanInfo[] = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    period: '',
    features: [
      'Fino a 5 annunci',
      '1 agente',
      'Chat AI base',
      'Lead via form',
      'Statistiche base',
    ],
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '€49',
    period: '/mese',
    features: [
      'Fino a 50 annunci',
      '3 agenti',
      'Chat AI avanzata',
      'Lead scoring AI',
      'Import CSV',
      'Statistiche avanzate',
      'Supporto email',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€99',
    period: '/mese',
    features: [
      'Annunci illimitati',
      '10 agenti',
      'Chat AI premium',
      'Lead scoring + draft reply',
      'Import CSV + URL + Webhook',
      'Analytics completo',
      'Supporto prioritario',
      'API access',
      'White label',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '€249',
    period: '/mese',
    features: [
      'Tutto in Pro',
      'Agenti illimitati',
      'Multi-agenzia',
      'SSO / SAML',
      'SLA dedicato',
      'Account manager',
      'Formazione personalizzata',
      'Integrazioni custom',
      'Supporto 24/7',
    ],
    highlighted: false,
  },
]

export default function AbbonamentoPage() {
  const [currentPlan] = useState<SubscriptionPlan>('free')
  const [upgrading, setUpgrading] = useState<SubscriptionPlan | null>(null)

  async function handleUpgrade(planId: SubscriptionPlan) {
    if (planId === currentPlan) return
    setUpgrading(planId)
    try {
      // Placeholder - would create a Stripe checkout session
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success(`Upgrade a ${planId} avviato! Verrai reindirizzato al pagamento.`)
    } catch {
      toast.error('Errore nell\'avvio dell\'upgrade')
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Abbonamento
        </h1>
        <p className="text-sm text-gray-500">
          Gestisci il tuo piano e la fatturazione
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan
          return (
            <Card
              key={plan.id}
              className={
                plan.highlighted
                  ? 'ring-2 ring-blue-500'
                  : isCurrent
                    ? 'ring-2 ring-green-500'
                    : ''
              }
            >
              <CardHeader>
                <div className="space-y-1">
                  {isCurrent && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Piano attuale
                    </span>
                  )}
                  {plan.highlighted && !isCurrent && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Consigliato
                    </span>
                  )}
                  <CardTitle style={{ color: '#111827' }}>{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: '#111827' }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-gray-500">{plan.period}</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span style={{ color: '#111827' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : plan.highlighted ? 'default' : 'outline'}
                  disabled={isCurrent || upgrading !== null}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {upgrading === plan.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isCurrent ? 'Piano Attuale' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
