-- BarberFlow Initial Seed Data (Barbearia Imperial)

INSERT INTO public.plans (id, name, code, price, max_professionals, features) VALUES
('p1111111-1111-1111-1111-111111111111', 'Starter', 'STARTER', 69.90, 1, ARRAY['1 Barbeiro', 'Agendamento Online', 'Agenda Digital']),
('p2222222-2222-2222-2222-222222222222', 'Pro', 'PRO', 129.90, 5, ARRAY['Até 5 Barbeiros', 'Relatórios Financeiros', 'Horário Vago', 'Programa de Fidelidade']),
('p3333333-3333-3333-3333-333333333333', 'Premium', 'PREMIUM', 249.90, 999, ARRAY['Barbeiros Ilimitados', 'Comissões Automáticas', 'Multi-unidades', 'Suporte VIP 24/7']);

INSERT INTO public.profiles (id, full_name, phone, role) VALUES
('u1111111-1111-1111-1111-111111111111', 'Admin SaaS', '(11) 99999-0000', 'SUPER_ADMIN'),
('u2222222-2222-2222-2222-222222222222', 'Roberto Imperial', '(11) 98888-1111', 'OWNER');

INSERT INTO public.barbershops (id, name, slug, owner_id, phone, whatsapp, email, city, state, address, description, active) VALUES
('b1111111-1111-1111-1111-111111111111', 'Barbearia Imperial', 'barbearia-imperial', 'u2222222-2222-2222-2222-222222222222', '(11) 3333-4444', '(11) 98888-1111', 'contato@barbeariaimperial.com', 'São Paulo', 'SP', 'Av. Paulista, 1000 - Sala 42, Bela Vista', 'Barbearia premium com atendimento personalizado, café gourmet e navalha afiada.', true);

INSERT INTO public.subscriptions (barbershop_id, plan_id, status) VALUES
('b1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222', 'ACTIVE');

INSERT INTO public.professionals (id, barbershop_id, name, phone, email, bio, commission_rate, active) VALUES
('prof1111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'João Silva', '(11) 97777-1111', 'joao@barbeariaimperial.com', 'Mestre em cortes clássicos e degradê perfeito com 8 anos de experiência.', 50.00, true),
('prof2222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Carlos Eduardo', '(11) 97777-2222', 'carlos@barbeariaimperial.com', 'Especialista em visagismo masculino, barba desenhada e toalha quente.', 45.00, true),
('prof3333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Lucas Mendes', '(11) 97777-3333', 'lucas@barbeariaimperial.com', 'Especialista em platinado, freestyle e cortes modernos de alta precisão.', 40.00, true);

INSERT INTO public.services (id, barbershop_id, name, description, price, duration_minutes, active) VALUES
('s1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Corte Tradicional', 'Corte com tesoura e máquina, acabamento com navalha e lavagem.', 40.00, 30, true),
('s2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Barba Completa', 'Alinhamento, toalha quente, massagem facial e óleos hidratantes.', 30.00, 30, true),
('s3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Corte + Barba (Combo)', 'Nosso combo carro-chefe com desconto especial e tratamento completo.', 60.00, 60, true),
('s4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'Corte Infantil', 'Atendimento paciente e carinhoso para crianças até 12 anos.', 35.00, 30, true);

INSERT INTO public.loyalty_programs (barbershop_id, is_active, required_stamps, reward_description) VALUES
('b1111111-1111-1111-1111-111111111111', true, 10, '1 Corte Tradicional Grátis ao completar 10 visitas');
