import { Appointment, BusinessHour, ProfessionalSchedule, ScheduleBlock, HolidayClosure } from '@/types';

export interface TimeSlot {
  time: string; // "14:00"
  available: boolean;
  reason?: string;
}

export function generateAvailableSlots(
  dateStr: string, // YYYY-MM-DD
  durationMinutes: number,
  businessHours: BusinessHour[],
  professionalSchedules: ProfessionalSchedule[],
  existingAppointments: Appointment[],
  scheduleBlocks: ScheduleBlock[],
  holidayClosures: HolidayClosure[] = []
): TimeSlot[] {
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon...
  const nowTimestamp = new Date().getTime();

  // 1. Check Holiday / Special Day closure for this date
  const holiday = holidayClosures.find((h) => h.date === dateStr);
  if (holiday) {
    if (holiday.isClosed) {
      return []; // Shop completely closed on holiday
    }
  }

  // 2. Check shop general operating hours for day of week
  const shopDay = businessHours.find((b) => b.dayOfWeek === dayOfWeek);
  if (!holiday && (!shopDay || shopDay.isClosed)) {
    return []; // Closed on standard weekly schedule
  }

  // 3. Determine shop effective opening & closing time for date
  let shopOpen = holiday && holiday.openTime ? holiday.openTime : shopDay ? shopDay.openTime : '08:00';
  let shopClose = holiday && holiday.closeTime ? holiday.closeTime : shopDay ? shopDay.closeTime : '20:00';

  // 4. Check professional schedule (with automatic fallback if prof schedule isn't customized yet)
  const profDay = professionalSchedules.find((p) => p.dayOfWeek === dayOfWeek);

  // If professional schedule explicitly exists and marked as NOT working today
  if (profDay && !profDay.isWorking) {
    return [];
  }

  const profStart = profDay ? profDay.startTime : '08:00';
  const profEnd = profDay ? profDay.endTime : '20:00';
  const profBreakStart = profDay ? profDay.breakStart : '12:00';
  const profBreakEnd = profDay ? profDay.breakEnd : '13:00';

  // Effective working hours (strictest range between shop & prof)
  const openTime = shopOpen > profStart ? shopOpen : profStart;
  const closeTime = shopClose < profEnd ? shopClose : profEnd;

  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  const startTotalMinutes = openHour * 60 + openMin;
  const endTotalMinutes = closeHour * 60 + closeMin;

  let breakStartMinutes = -1;
  let breakEndMinutes = -1;
  if (profBreakStart && profBreakEnd) {
    const [bsH, bsM] = profBreakStart.split(':').map(Number);
    const [beH, beM] = profBreakEnd.split(':').map(Number);
    breakStartMinutes = bsH * 60 + bsM;
    breakEndMinutes = beH * 60 + beM;
  }

  const slots: TimeSlot[] = [];

  // Generate 30-minute interval grid
  for (let mins = startTotalMinutes; mins + durationMinutes <= endTotalMinutes; mins += 30) {
    const slotHour = Math.floor(mins / 60);
    const slotMin = mins % 60;
    const slotEndMins = mins + durationMinutes;

    const timeString = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;

    const slotStartISO = `${dateStr}T${timeString}:00`;
    const slotStartTimestamp = new Date(slotStartISO).getTime();
    const slotEndTimestamp = slotStartTimestamp + durationMinutes * 60 * 1000;

    let isAvailable = true;
    let reason = '';

    // PAST TIME CHECK: Prevent booking past times on the current day
    if (slotStartTimestamp <= nowTimestamp + 5 * 60 * 1000) {
      isAvailable = false;
      reason = 'Horário já passado';
    }

    // Check break time overlap (e.g. Lunch 12:00-13:00)
    if (isAvailable && breakStartMinutes !== -1 && breakEndMinutes !== -1) {
      if (
        (mins >= breakStartMinutes && mins < breakEndMinutes) ||
        (slotEndMins > breakStartMinutes && slotEndMins <= breakEndMinutes) ||
        (mins <= breakStartMinutes && slotEndMins >= breakEndMinutes)
      ) {
        isAvailable = false;
        reason = 'Horário de Intervalo / Almoço';
      }
    }

    // Check existing appointments overlap
    if (isAvailable) {
      for (const app of existingAppointments) {
        if (app.status === 'CANCELLED') continue;

        const appStart = new Date(app.startTime).getTime();
        const appEnd = new Date(app.endTime).getTime();

        if (
          (slotStartTimestamp >= appStart && slotStartTimestamp < appEnd) ||
          (slotEndTimestamp > appStart && slotEndTimestamp <= appEnd) ||
          (slotStartTimestamp <= appStart && slotEndTimestamp >= appEnd)
        ) {
          isAvailable = false;
          reason = 'Horário já reservado';
          break;
        }
      }
    }

    // Check schedule blocks overlap
    if (isAvailable) {
      for (const block of scheduleBlocks) {
        const blockStart = new Date(block.startTime).getTime();
        const blockEnd = new Date(block.endTime).getTime();

        if (
          (slotStartTimestamp >= blockStart && slotStartTimestamp < blockEnd) ||
          (slotEndTimestamp > blockStart && slotEndTimestamp <= blockEnd) ||
          (slotStartTimestamp <= blockStart && slotEndTimestamp >= blockEnd)
        ) {
          isAvailable = false;
          reason = block.title || 'Bloqueio de Horário';
          break;
        }
      }
    }

    slots.push({
      time: timeString,
      available: isAvailable,
      reason,
    });
  }

  return slots;
}
