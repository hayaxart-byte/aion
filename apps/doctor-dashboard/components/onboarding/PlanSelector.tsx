'use client';

import { Card, Badge, Button } from '@aion/ui';
import { Check } from 'lucide-react';

const PLANS = [
  {
    type: 'basic' as const,
    name: 'Básico',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Gestión de agenda básica',
      'Hasta 50 pacientes',
      'Recordatorios por email',
      'Soporte por email',
    ],
    popular: false,
  },
  {
    type: 'premium' as const,
    name: 'Premium',
    price: { monthly: 299, yearly: 2990 },
    features: [
      'Agenda ilimitada',
      'Pacientes ilimitados',
      'Recordatorios SMS + WhatsApp',
      'Estadísticas avanzadas',
      'Soporte prioritario 24/7',
      'Perfil público personalizado',
    ],
    popular: true,
  },
];

interface PlanSelectorProps {
  selected: 'basic' | 'premium' | null;
  interval: 'monthly' | 'yearly';
  onSelect: (type: 'basic' | 'premium') => void;
  onIntervalChange: (interval: 'monthly' | 'yearly') => void;
}

export function PlanSelector({ selected, interval, onSelect, onIntervalChange }: PlanSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="inline-flex items-center rounded-xl bg-muted p-1">
        <button
          onClick={() => onIntervalChange('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            interval === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => onIntervalChange('yearly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            interval === 'yearly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Anual
          <span className="ml-1.5 text-[10px] text-emerald-600 font-semibold">-17%</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.type;
          return (
            <Card
              key={plan.type}
              className={`p-6 cursor-pointer transition-all relative ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:border-primary/30 hover:shadow-sm'
              } ${plan.popular ? 'border-primary/30' : ''}`}
              onClick={() => onSelect(plan.type)}
            >
              {plan.popular && (
                <Badge variant="default" className="absolute -top-2.5 right-4 text-[10px]">
                  Más popular
                </Badge>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    ${plan.price[interval].toLocaleString('es-MX')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{interval === 'monthly' ? 'mes' : 'año'}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={isSelected ? 'default' : 'outline'}
                className="w-full"
                onClick={() => onSelect(plan.type)}
              >
                {isSelected ? 'Seleccionado' : plan.price[interval] === 0 ? 'Comenzar gratis' : 'Seleccionar'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
