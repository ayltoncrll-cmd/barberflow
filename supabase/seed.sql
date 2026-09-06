-- ============================================================================
-- BarberFlow — Dados iniciais
--
-- Contém APENAS os planos comercializados pela plataforma. Nenhuma barbearia,
-- profissional, cliente ou agendamento fictício: essas tabelas começam vazias
-- e são preenchidas pelo cadastro real (/onboarding) ou pelo painel do admin.
--
-- Aplique depois de schema.sql e admin.sql.
-- ============================================================================

INSERT INTO public.plans (name, code, description, price, duration_days, max_professionals, features, active)
VALUES
    (
        'Starter',
        'STARTER',
        'Ideal para quem está começando sozinho.',
        69.90,
        30,
        1,
        ARRAY['1 Barbeiro', 'Agendamento Online 24/7', 'Agenda Digital', 'Suporte por E-mail'],
        TRUE
    ),
    (
        'Pro',
        'PRO',
        'Para barbearias em crescimento com equipe.',
        129.90,
        30,
        5,
        ARRAY[
            'Até 5 Barbeiros',
            'Relatórios Financeiros & Comissões',
            'Gerador de Horário Vago (WhatsApp)',
            'Programa de Fidelidade',
            'Suporte via WhatsApp'
        ],
        TRUE
    ),
    (
        'Premium',
        'PREMIUM',
        'Operação completa, sem limite de barbeiros.',
        249.90,
        30,
        999,
        ARRAY[
            'Barbeiros Ilimitados',
            'Multi-unidades',
            'Lembretes de Agendamento',
            'Gestão de Estoque',
            'Gerente de Conta Dedicado'
        ],
        TRUE
    )
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Promova o dono do SaaS depois de criar a conta dele pelo Supabase Auth,
-- trocando o e-mail abaixo:
--
--   UPDATE public.profiles
--   SET role = 'SUPER_ADMIN'
--   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'voce@exemplo.com');
-- ----------------------------------------------------------------------------
