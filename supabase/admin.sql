-- ============================================================================
-- BarberFlow — Camada administrativa do SaaS (painel /admin)
--
-- Aplique DEPOIS de supabase/schema.sql. É idempotente: pode rodar mais de uma
-- vez sem duplicar nada.
--
-- Conteúdo:
--   1. Ajustes nas tabelas plans / subscriptions
--   2. Papel global super_admin em profiles
--   3. Funções auxiliares de autorização (SECURITY DEFINER)
--   4. Políticas RLS: admin vê tudo, dono vê apenas a própria barbearia
--   5. Trava que impede um usuário virar super_admin sozinho
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PLANOS: descrição, duração padrão e ativo/inativo
-- ----------------------------------------------------------------------------
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- O código do plano deixa de ser uma lista fixa: o dono do SaaS cria planos novos.
ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_code_check;

-- ----------------------------------------------------------------------------
-- 2. ASSINATURAS: início do período, observações administrativas e SUSPENDED
-- ----------------------------------------------------------------------------
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- expires_at é o nome usado no painel; mantemos current_period_end como fonte
-- e expomos o alias para não quebrar o que já existe.
ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'));

CREATE INDEX IF NOT EXISTS idx_subscriptions_status_period
    ON public.subscriptions (status, current_period_end);

-- Mantém updated_at coerente em qualquer alteração manual do admin.
CREATE OR REPLACE FUNCTION public.touch_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.touch_subscription_updated_at();

-- ----------------------------------------------------------------------------
-- 3. FUNÇÕES DE AUTORIZAÇÃO
--
-- SECURITY DEFINER + search_path fixo: a função lê profiles ignorando RLS,
-- evitando recursão infinita nas políticas que a chamam.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
          AND role = 'SUPER_ADMIN'
    );
$$;

-- Barbearias às quais o usuário logado pertence (dono ou membro da equipe).
CREATE OR REPLACE FUNCTION public.my_barbershop_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT b.id
    FROM public.barbershops b
    JOIN public.profiles p ON p.id = b.owner_id
    WHERE p.user_id = auth.uid()
    UNION
    SELECT m.barbershop_id
    FROM public.barbershop_members m
    JOIN public.profiles p ON p.id = m.user_id
    WHERE p.user_id = auth.uid();
$$;

-- Regra de acesso do item 14: status E datas, nunca só a data.
CREATE OR REPLACE FUNCTION public.barbershop_has_access(shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (
            SELECT
                CASE s.status
                    WHEN 'ACTIVE' THEN s.current_period_end >= NOW()
                    WHEN 'TRIAL'  THEN s.trial_ends_at      >= NOW()
                    ELSE FALSE
                END
            FROM public.subscriptions s
            WHERE s.barbershop_id = shop_id
            LIMIT 1
        ),
        FALSE
    );
$$;

-- ----------------------------------------------------------------------------
-- 4. POLÍTICAS RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops    ENABLE ROW LEVEL SECURITY;

-- PROFILES ------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles: leitura própria" ON public.profiles;
CREATE POLICY "Profiles: leitura própria" ON public.profiles
    FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "Profiles: atualização própria" ON public.profiles;
CREATE POLICY "Profiles: atualização própria" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "Profiles: admin gerencia todos" ON public.profiles;
CREATE POLICY "Profiles: admin gerencia todos" ON public.profiles
    FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- BARBERSHOPS ---------------------------------------------------------------
-- A política pública de leitura (active = true) do schema.sql continua valendo
-- para as páginas de agendamento.
DROP POLICY IF EXISTS "Barbershops: admin vê todas" ON public.barbershops;
CREATE POLICY "Barbershops: admin vê todas" ON public.barbershops
    FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Barbershops: dono vê a própria" ON public.barbershops;
CREATE POLICY "Barbershops: dono vê a própria" ON public.barbershops
    FOR SELECT USING (id IN (SELECT public.my_barbershop_ids()));

DROP POLICY IF EXISTS "Barbershops: dono edita a própria" ON public.barbershops;
CREATE POLICY "Barbershops: dono edita a própria" ON public.barbershops
    FOR UPDATE USING (id IN (SELECT public.my_barbershop_ids()));

-- PLANS ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Plans: leitura pública dos ativos" ON public.plans;
CREATE POLICY "Plans: leitura pública dos ativos" ON public.plans
    FOR SELECT USING (active = TRUE OR public.is_super_admin());

-- Só o dono do SaaS cria, edita ou desativa planos.
DROP POLICY IF EXISTS "Plans: admin gerencia" ON public.plans;
CREATE POLICY "Plans: admin gerencia" ON public.plans
    FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- SUBSCRIPTIONS -------------------------------------------------------------
-- O dono LÊ a própria assinatura (para ver vencimento), mas NUNCA a altera:
-- não existe policy de INSERT/UPDATE/DELETE para ele. Só o admin controla.
DROP POLICY IF EXISTS "Subscriptions: dono lê a própria" ON public.subscriptions;
CREATE POLICY "Subscriptions: dono lê a própria" ON public.subscriptions
    FOR SELECT USING (barbershop_id IN (SELECT public.my_barbershop_ids()));

DROP POLICY IF EXISTS "Subscriptions: admin controla tudo" ON public.subscriptions;
CREATE POLICY "Subscriptions: admin controla tudo" ON public.subscriptions
    FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- DADOS OPERACIONAIS DA BARBEARIA -------------------------------------------
-- Isolamento por tenant + acesso total do admin, para cada tabela filha.
DO $$
DECLARE
    t TEXT;
    tenant_tables TEXT[] := ARRAY[
        'professionals', 'services', 'customers', 'appointments',
        'schedule_blocks', 'business_hours', 'loyalty_programs', 'loyalty_progress'
    ];
BEGIN
    FOREACH t IN ARRAY tenant_tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        EXECUTE format('DROP POLICY IF EXISTS "%s: tenant" ON public.%I', t, t);
        EXECUTE format(
            'CREATE POLICY "%s: tenant" ON public.%I FOR ALL
             USING (barbershop_id IN (SELECT public.my_barbershop_ids()))
             WITH CHECK (barbershop_id IN (SELECT public.my_barbershop_ids()))',
            t, t
        );

        EXECUTE format('DROP POLICY IF EXISTS "%s: admin" ON public.%I', t, t);
        EXECUTE format(
            'CREATE POLICY "%s: admin" ON public.%I FOR ALL
             USING (public.is_super_admin()) WITH CHECK (public.is_super_admin())',
            t, t
        );
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 5. TRAVA CONTRA ESCALAÇÃO DE PRIVILÉGIO
--
-- Impede que um usuário comum se promova a SUPER_ADMIN pelo frontend.
-- Só outro SUPER_ADMIN (ou a service_role, que ignora RLS) pode conceder o papel.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_super_admin() THEN
            RAISE EXCEPTION 'Alteração de papel não permitida.'
                USING ERRCODE = '42501';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- Novos cadastros nunca nascem como SUPER_ADMIN.
CREATE OR REPLACE FUNCTION public.force_default_role_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role = 'SUPER_ADMIN' AND NOT public.is_super_admin() THEN
        NEW.role := 'OWNER';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_force_default_role ON public.profiles;
CREATE TRIGGER trg_force_default_role
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.force_default_role_on_insert();

-- ============================================================================
-- COMO PROMOVER O DONO DO SAAS
--
-- Rode UMA VEZ no SQL Editor do Supabase (roda como service_role, ignora RLS),
-- trocando o e-mail pelo seu:
--
--   UPDATE public.profiles
--   SET role = 'SUPER_ADMIN'
--   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'voce@exemplo.com');
--
-- Depois disso, apenas esse usuário enxerga todas as barbearias.
-- ============================================================================
