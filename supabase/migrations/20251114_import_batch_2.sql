-- Inserir lote 2 de dados de áreas de roçagem
-- 50 registros adicionais

INSERT INTO areas (
  id,
  ordem,
  sequencia_cadastro,
  tipo,
  endereco,
  bairro,
  metragem_m2,
  lat,
  lng,
  lote,
  status,
  history,
  polygon,
  scheduled_date,
  proxima_previsao,
  ultima_rocagem,
  manual_schedule,
  days_to_complete,
  servico,
  registrado_por,
  data_registro
) VALUES 
(318, NULL, NULL, 'Roçagem', 'av. manoel honorato sobrinho', 'heimtal', 2536.25, -23.2388844, -51.1557602, 1, 'Concluído', '[{"date":"2025-10-06","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, NULL, '2025-11-20', '2025-10-06', false, 1, 'rocagem', NULL, '2025-11-06T12:56:12.759Z'),
(301, NULL, NULL, 'Roçagem', 'benjamin siebeneich', 'heimtal', 924.52, -23.2540981, -51.1578501, 1, 'Concluído', '[{"date":"2025-10-06","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, NULL, '2025-11-20', '2025-10-06', false, 1, 'rocagem', NULL, '2025-11-06T12:35:18.281Z'),
(275, NULL, NULL, 'Roçagem', 'john lennon mercado municipal', 'vivi xavier', 1129.53, -23.322198238020054, -51.16704225540162, 1, 'Concluído', '[{"date":"2025-10-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, NULL, '2025-11-17', '2025-10-03', false, 1, 'rocagem', NULL, '2025-11-06T12:09:48.776Z'),
(501, NULL, NULL, 'Roçagem', 'av odilon braga', 'violin', 7033.18, -23.2592336, -51.154551, 1, 'Concluído', '[{"date":"2025-10-21","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, NULL, '2025-12-05', '2025-10-21', false, 1, 'rocagem', NULL, '2025-11-06T15:26:55.062Z'),
(273, NULL, NULL, 'Roçagem', 'john lennon quadra', 'vivi xavier', 1080.95, -23.3145132, -51.1474724, 1, 'Concluído', '[{"date":"2025-10-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, NULL, '2025-11-17', '2025-10-03', false, 1, 'rocagem', NULL, '2025-11-06T12:08:19.195Z'),
(323, NULL, NULL, 'Roçagem', 'spartaco ferrarese e laterais da saul até igreja', 'santa cruz', 23863.35, -23.256178