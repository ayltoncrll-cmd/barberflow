-- BarberFlow Complete PostgreSQL Database Schema & RLS Policies
-- Multi-Tenant SaaS Platform for Barbershops

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('SUPER_ADMIN', 'OWNER', 'GERENTE', 'BARBER', 'CUSTOMER')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BARBERSHOPS (Tenants)
CREATE TABLE IF NOT EXISTS public.barbershops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES public.profiles(id),
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BARBERSHOP MEMBERS (Role-based membership)
CREATE TABLE IF NOT EXISTS public.barbershop_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'GERENTE', 'BARBER', 'RECEPCAO')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(barbershop_id, user_id)
);

-- 4. PROFESSIONALS
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    email TEXT,
    bio TEXT,
    commission_rate NUMERIC(5,2) DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROFESSIONAL SERVICES (Junction Table)
CREATE TABLE IF NOT EXISTS public.professional_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    UNIQUE(professional_id, service_id)
);

-- 7. BUSINESS HOURS (Barbershop general schedule)
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 1=Seg, ... 6=Sáb
    open_time TIME NOT NULL DEFAULT '08:00',
    close_time TIME NOT NULL DEFAULT '20:00',
    is_closed BOOLEAN DEFAULT FALSE,
    UNIQUE(barbershop_id, day_of_week)
);

-- 8. PROFESSIONAL SCHEDULES (Individual work hours & breaks)
CREATE TABLE IF NOT EXISTS public.professional_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL DEFAULT '08:00',
    end_time TIME NOT NULL DEFAULT '19:00',
    break_start TIME DEFAULT '12:00',
    break_end TIME DEFAULT '13:00',
    is_working BOOLEAN DEFAULT TRUE,
    UNIQUE(professional_id, day_of_week)
);

-- 9. SCHEDULE BLOCKS (Vacations, Lunch, Lockouts)
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    birth_date DATE,
    notes TEXT,
    first_visit_at TIMESTAMPTZ DEFAULT NOW(),
    last_visit_at TIMESTAMPTZ DEFAULT NOW(),
    total_visits INTEGER DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slot lookup & preventing double bookings
CREATE INDEX IF NOT EXISTS idx_appointments_professional_time 
ON public.appointments (professional_id, start_time, end_time) 
WHERE status NOT IN ('CANCELLED');

CREATE INDEX IF NOT EXISTS idx_appointments_barbershop_time 
ON public.appointments (barbershop_id, start_time);

-- 12. APPOINTMENT STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.appointment_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. LOYALTY PROGRAMS
CREATE TABLE IF NOT EXISTS public.loyalty_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID UNIQUE NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    required_stamps INTEGER NOT NULL DEFAULT 10,
    reward_description TEXT NOT NULL DEFAULT 'Corte ou Barba Grátis',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. LOYALTY PROGRESS
CREATE TABLE IF NOT EXISTS public.loyalty_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    current_stamps INTEGER DEFAULT 0,
    total_rewards_earned INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(barbershop_id, customer_id)
);

-- 15. PLANS (SaaS Subscriptions)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL CHECK (code IN ('STARTER', 'PRO', 'PREMIUM')),
    price NUMERIC(10,2) NOT NULL,
    max_professionals INTEGER NOT NULL,
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID UNIQUE NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL DEFAULT 'TRIAL' CHECK (status IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED')),
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;

-- Public read access for public booking pages
CREATE POLICY "Public barbershops view" ON public.barbershops FOR SELECT USING (active = true);
CREATE POLICY "Public services view" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "Public professionals view" ON public.professionals FOR SELECT USING (active = true);
CREATE POLICY "Public business hours view" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "Public professional schedules view" ON public.professional_schedules FOR SELECT USING (true);
CREATE POLICY "Public appointments slot check" ON public.appointments FOR SELECT USING (true);
