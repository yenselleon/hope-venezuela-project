// src/components/ui/GridTurnos.jsx
// Grilla interactiva semanal para selección de turnos (Disponibilidad).
// Consume el store Zustand de forma reactiva.

import React from 'react';
import { useFormStore } from '@/stores/useFormStore';
import { useI18nStore } from '@/stores/useI18nStore';
import { DIAS_SEMANA, TURNOS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

export function GridTurnos() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const turnosSeleccionados = useFormStore((s) => s.step3.turnos);
  const toggleTurno = useFormStore((s) => s.toggleTurno);

  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      <div 
        id="grid" 
        className="grid grid-cols-[auto_repeat(4,1fr)] gap-1.5 max-w-[440px] min-w-[320px] select-none"
      >
        {/* Esquina superior izquierda vacía */}
        <span></span>

        {/* Encabezados de Turnos */}
        {TURNOS.map((turno) => (
          <span 
            key={turno.key} 
            className="font-bold text-[11px] text-text-tertiary text-center self-center"
          >
            {t(`turno.${turno.key === 'm' ? 'manana' : turno.key === 't' ? 'tarde' : turno.key === 'n' ? 'noche' : '24h'}`)}
          </span>
        ))}

        {/* Filas por cada Día de la Semana */}
        {DIAS_SEMANA.map((dia) => (
          <React.Fragment key={dia}>
            {/* Etiqueta del Día */}
            <span className="font-semibold text-xs text-[#374151] align-middle self-center pr-2">
              {dia}
            </span>

            {/* Celdas del Turno para este día */}
            {TURNOS.map((turno) => {
              const cellKey = `${dia}-${turno.key}`;
              const isSelected = turnosSeleccionados.includes(cellKey);

              return (
                <button
                  key={cellKey}
                  type="button"
                  data-cell={cellKey}
                  onClick={() => toggleTurno(cellKey)}
                  className={cn(
                    "h-[34px] rounded-[7px] border-1.5 cursor-pointer transition-all focus:outline-none",
                    isSelected 
                      ? "bg-navy border-navy" 
                      : "bg-[#f0ede6] border-input-border hover:border-[#c9c2b2]"
                  )}
                  aria-label={`Turno ${turno.label} del día ${dia}`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
